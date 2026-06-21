**Amour Et Grace**

Restaurant Website --- Japan Deployment

**RESERVATIONS FEATURE**

Security · Rate Limiting · Edge Cases · Email Integration

Implementation Plan & AI Prompt Guide

  ----------------------- ----------------------- -----------------------
  **Stack: Plain HTML /   **Backend: Vercel       **DB: Supabase Japan
  CSS / JS**              Serverless**            Region**

  ----------------------- ----------------------- -----------------------

  ----------------------- ----------------------- -----------------------
  **Email: Resend API**   **Auth: Supabase JWT**  **Traffic: \~50
                                                  visitors/day**

  ----------------------- ----------------------- -----------------------

**1. Feature Overview**

The Reservations feature is the most critical part of this website. It
is used by customers daily to book tables, parties, events, and
packages. The admin dashboard is the interface through which the
restaurant owner accepts or rejects these bookings.

This document covers all the rules, checks, and behaviors that must be
implemented correctly to make this feature secure, reliable, and
bug-free for a Japan-deployed restaurant website.

**1.1 Reservation Types Supported**

  ---------------------------------- ------------------------------------
  **Type**                           **Description**

  table                              Standard table reservation for 1--50
                                     guests

  party                              Private party booking with larger
                                     group sizes

  event                              Special event booking (live music,
                                     themed nights)

  package                            Food and drinks package reservation
  ---------------------------------- ------------------------------------

**1.2 Full Data Flow**

  -----------------------------------------------------------------------
  CUSTOMER fills reservation form on website

  ↓

  Frontend validates input (client-side, UX only)

  ↓

  POST /api/reservations → Vercel serverless function

  ↓

  Backend: rate limit check → CAPTCHA verify → input validate

  ↓

  Save to Supabase (Japan region) as status = pending

  ↓

  Send confirmation email to CUSTOMER via Resend

  ↓ (email send wrapped in try/catch --- reservation saves regardless)

  Send notification email to ADMIN via Resend

  ↓

  Return success to frontend

  ADMIN logs into dashboard → sees pending reservation

  ↓

  Clicks Accept or Reject

  ↓

  PATCH /api/reservations/admin → Vercel serverless function

  ↓

  Backend: verify JWT → check admin role → update DB status

  ↓

  Send status email to CUSTOMER (accepted / rejected)

  ↓

  Dashboard updates to show new status
  -----------------------------------------------------------------------

**2. Database Schema**

Supabase project must be configured to the Japan (ap-northeast-1 /
Tokyo) region for lowest latency from your restaurant\'s Japanese
customer base.

**2.1 Reservations Table**

  -----------------------------------------------------------------------
  CREATE TABLE reservations (

  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  type TEXT NOT NULL

  CHECK (type IN (\'table\',\'party\',\'event\',\'package\')),

  name TEXT NOT NULL,

  email TEXT NOT NULL,

  phone TEXT,

  date DATE NOT NULL,

  time TIME NOT NULL,

  guest_count INTEGER NOT NULL,

  message TEXT,

  status TEXT DEFAULT \'pending\'

  CHECK (status IN (\'pending\',\'accepted\',\'rejected\')),

  email_confirmed_sent BOOLEAN DEFAULT false,

  email_status_sent BOOLEAN DEFAULT false,

  ip_address TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),

  updated_at TIMESTAMPTZ DEFAULT now()

  );
  -----------------------------------------------------------------------

**2.2 Row Level Security Policies**

  -----------------------------------------------------------------------
  \-- Enable RLS

  ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

  \-- Public can INSERT only (submit a reservation)

  CREATE POLICY \"Anyone can create a reservation\"

  ON reservations FOR INSERT TO anon WITH CHECK (true);

  \-- No public SELECT or UPDATE

  \-- All reads/updates go through service_role key (admin API only)
  -----------------------------------------------------------------------

**3. Security Requirements**

**3.1 Environment Variables**

These must exist in Vercel Environment Variables before any API function
will work. Never put these in frontend HTML/JS files.

  ---------------------- ----------------------- -------------------------
  **Variable**           **Used In**             **Notes**

  SUPABASE_URL           All API functions       Safe in frontend (anon
                                                 key only)

  SUPABASE_ANON_KEY      Frontend only           Public --- limited RLS
                                                 permissions

  SUPABASE_SERVICE_KEY   Backend API only        NEVER expose to frontend

  RESEND_API_KEY         email.js                NEVER expose to frontend

  RESEND_FROM_EMAIL      email.js                Verified sender address

  ADMIN_EMAIL            Notification email      Admin\'s inbox for alerts

  TURNSTILE_SECRET_KEY   captcha.js              NEVER expose to frontend
  ---------------------- ----------------------- -------------------------

**3.2 Input Validation --- Backend (Required)**

Frontend validation is for user experience only. Every field must be
re-validated on the server before saving. Never trust client-submitted
data.

  ----------- ---------------------------------------------------------------------
  **Fields to 
  Validate on 
  Backend**   

  **•**       name: must be string, 2--100 characters, no HTML tags

  **•**       email: must match email format, max 254 characters

  **•**       phone: optional but if present must be 7--20 chars, numbers/+/-/()
              only

  **•**       date: must be a valid date, must be in the future (not today or past)

  **•**       time: must be valid time format, must be within business hours (e.g.
              10:00--22:00 JST)

  **•**       guest_count: must be integer, minimum 1, maximum 50

  **•**       type: must be exactly one of: table, party, event, package

  **•**       message: optional, if present max 500 characters, strip all HTML
  ----------- ---------------------------------------------------------------------

**3.3 XSS Prevention**

  ------------ ---------------------------------------------------------------------
  **Rules for  
  Preventing   
  XSS          
  Attacks**    

  **•**        Sanitize all text inputs using DOMPurify (backend, with jsdom) before
               saving

  **•**        Use ALLOWED_TAGS: \[\] and ALLOWED_ATTR: \[\] --- plain text only, no
               HTML allowed

  **•**        Never use innerHTML when displaying reservation data in admin
               dashboard

  **•**        Always use textContent or escapeHtml() when rendering user-submitted
               data

  **•**        The message/notes field is the highest risk --- sanitize it strictly
  ------------ ---------------------------------------------------------------------

**3.4 Admin Endpoint Protection**

  ---------- ---------------------------------------------------------------------
  **Every    
  Admin API  
  Function   
  Must**     

  **•**      Extract the Authorization: Bearer \<token\> header from the request

  **•**      Call supabase.auth.getUser(token) to verify the JWT is valid and not
             expired

  **•**      Check that the verified user exists in the admin_users table (double
             check)

  **•**      Return 401 Unauthorized immediately if either check fails

  **•**      Never skip auth check even for GET requests on admin endpoints

  **•**      Rate limit the login endpoint: max 5 attempts per 15 minutes per IP
  ---------- ---------------------------------------------------------------------

**4. Rate Limiting**

Rate limiting prevents spam bots and abusive users from flooding your
forms, burning your Resend email quota, or filling your database with
fake reservations.

**4.1 Limits Per Endpoint**

  ------------------------- ------------------------- -----------------------
  **Endpoint**              **Limit**                 **Window**

  POST /api/reservations    3 requests                Per IP per hour

  POST /api/inquiry         3 requests                Per IP per hour

  POST /api/reviews         2 requests                Per IP per hour

  POST /api/chat            20 requests               Per IP per 10 minutes

  POST /api/auth/login      5 attempts                Per IP per 15 minutes

  PATCH                     60 requests               Per IP per minute
  /api/reservations/admin                             

  GET                       120 requests              Per IP per minute
  /api/reservations/admin                             
  ------------------------- ------------------------- -----------------------

**4.2 Rate Limiter Implementation**

  -----------------------------------------------------------------------
  // netlify/functions/\_lib/rate-limiter.js

  const requestCounts = new Map();

  export function rateLimiter(ip, options = {}) {

  const {

  windowMs = 60 \* 1000, // default: 1 minute

  maxRequests = 10 // default: 10 requests

  } = options;

  const now = Date.now();

  const windowStart = now - windowMs;

  const requests = requestCounts.get(ip) \|\| \[\];

  const recent = requests.filter(t =\> t \> windowStart);

  if (recent.length \>= maxRequests) {

  return true; // RATE LIMITED

  }

  recent.push(now);

  requestCounts.set(ip, recent);

  return false; // OK

  }
  -----------------------------------------------------------------------

**4.3 How to Apply Rate Limiting in a Function**

  -----------------------------------------------------------------------
  const ip =
  event.headers\[\'x-forwarded-for\'\]?.split(\',\')\[0\]?.trim()

  \|\| event.headers\[\'x-real-ip\'\]

  \|\| \'unknown\';

  const limited = rateLimiter(ip, {

  windowMs: 60 \* 60 \* 1000, // 1 hour

  maxRequests: 3 // 3 per hour per IP

  });

  if (limited) {

  return {

  statusCode: 429,

  headers,

  body: JSON.stringify({

  error: \'Too many requests. Please try again later.\'

  })

  };

  }
  -----------------------------------------------------------------------

**5. CAPTCHA Integration (Cloudflare Turnstile)**

Cloudflare Turnstile is free, privacy-friendly, and has no annoying
image puzzles. Add to all public forms: reservation, inquiry, reviews.

**5.1 Setup Steps**

1.  Go to dash.cloudflare.com → Turnstile → Add Site

2.  Enter your domain → choose Managed widget type

3.  Copy Site Key (public, goes in HTML) and Secret Key (private, goes
    in env vars)

4.  Add TURNSTILE_SECRET_KEY to Vercel environment variables

5.  Add TURNSTILE_SITE_KEY to your frontend HTML (safe to expose)

**5.2 HTML Addition**

  -----------------------------------------------------------------------
  \<!\-- In \<head\> of every form page \--\>

  \<script src=\"https://challenges.cloudflare.com/turnstile/v0/api.js\"
  async\>\</script\>

  \<!\-- Inside your reservation form \--\>

  \<div class=\"cf-turnstile\"
  data-sitekey=\"YOUR_PUBLIC_SITE_KEY\"\>\</div\>
  -----------------------------------------------------------------------

**5.3 Backend Verification**

  -----------------------------------------------------------------------
  // \_lib/captcha.js

  export async function verifyCaptcha(token) {

  if (!token) return false;

  const response = await fetch(

  \'https://challenges.cloudflare.com/turnstile/v0/siteverify\',

  {

  method: \'POST\',

  headers: { \'Content-Type\': \'application/json\' },

  body: JSON.stringify({

  secret: process.env.TURNSTILE_SECRET_KEY,

  response: token

  })

  }

  );

  const data = await response.json();

  return data.success === true;

  }
  -----------------------------------------------------------------------

**6. Resend Email Integration**

Resend handles all transactional emails. The free tier allows 100
emails/day and 3,000/month. At \~10 reservations/day (2 emails each)
plus inquiry/admin notifications, expected usage is \~35 emails/day ---
well within limits.

**6.1 Email Types for Reservations**

  ---------------------- ------------------------- -----------------------
  **Email Type**         **Recipient**             **Trigger**

  Reservation Received   Customer                  When form is submitted
                                                   successfully

  Admin New Reservation  Admin (restaurant owner)  Same trigger ---
  Alert                                            parallel send

  Reservation Accepted   Customer                  Admin clicks Accept in
                                                   dashboard

  Reservation Rejected   Customer                  Admin clicks Reject in
                                                   dashboard
  ---------------------- ------------------------- -----------------------

**6.2 Email Helper Function**

  -----------------------------------------------------------------------
  // \_lib/email.js

  import { Resend } from \'resend\';

  const resend = new Resend(process.env.RESEND_API_KEY);

  export async function sendEmail({ to, subject, html }) {

  try {

  const { data, error } = await resend.emails.send({

  from: process.env.RESEND_FROM_EMAIL,

  to,

  subject,

  html,

  });

  if (error) {

  console.error(\'Resend error:\', error);

  return { success: false, error };

  }

  return { success: true, data };

  } catch (err) {

  console.error(\'Email send failed:\', err);

  return { success: false, error: err };

  // IMPORTANT: caller must NOT block reservation save on email failure

  }

  }
  -----------------------------------------------------------------------

**6.3 Customer Confirmation Email Template**

  -----------------------------------------------------------------------
  function reservationConfirmedTemplate(reservation) {

  return \`

  \<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0
  auto;\"\>

  \<h2 style=\"color:#1B2A4A;\"\>

  Thank you for your reservation, \${reservation.name}!\</h2\>

  \<p\>We have received your reservation request.\</p\>

  \<table style=\"width:100%;border-collapse:collapse;\"\>

  \<tr\>\<td\>\<strong\>Date:\</strong\>\</td\>

  \<td\>\${reservation.date}\</td\>\</tr\>

  \<tr\>\<td\>\<strong\>Time:\</strong\>\</td\>

  \<td\>\${reservation.time} (JST)\</td\>\</tr\>

  \<tr\>\<td\>\<strong\>Guests:\</strong\>\</td\>

  \<td\>\${reservation.guest_count}\</td\>\</tr\>

  \<tr\>\<td\>\<strong\>Type:\</strong\>\</td\>

  \<td\>\${reservation.type}\</td\>\</tr\>

  \</table\>

  \<p style=\"color:#666;\"\>

  We will confirm or update you shortly.\</p\>

  \<p\>\<strong\>Amour Et Grace Restaurant\</strong\>\</p\>

  \</div\>

  \`;

  }
  -----------------------------------------------------------------------

**6.4 Critical Email Rule: Never Block Reservation Save**

  --------------- ---------------------------------------------------------------------
  **Email Failure 
  Must Not Break  
  the             
  Reservation**   

  **•**           Always save the reservation to Supabase FIRST before attempting to
                  send any email

  **•**           Wrap ALL email sending calls inside try/catch blocks

  **•**           If email fails, log the error but return success to the customer
                  anyway

  **•**           Use the email_confirmed_sent boolean column to track if email was
                  sent

  **•**           Admin can still see the reservation in dashboard even if email never
                  sent

  **•**           This prevents customers from thinking their reservation failed when
                  it actually saved
  --------------- ---------------------------------------------------------------------

**7. Edge Cases & What Can Go Wrong**

These are the scenarios that are most likely to cause bugs, bad user
experience, or system abuse. Every case listed here must be handled in
the code.

**7.1 Input Edge Cases**

  ----------------------- ------------------------------- ---------------------------
  **Edge Case**           **Example**                     **How to Handle**

  Past date submitted     Date: yesterday                 Reject with: \"Date must be
                                                          in the future\"

  Today\'s date submitted Date: today but 1hr ago         Reject --- same-day
                                                          bookings may not be
                                                          operationally possible

  Absurd guest count      guest_count: 9999               Reject if \> 50 (or your
                                                          actual max capacity)

  Negative guest count    guest_count: -1                 Reject if \< 1

  Zero guests             guest_count: 0                  Reject --- must be at least
                                                          1

  Empty name after trim   \" \" (spaces only)             Trim first, then reject if
                                                          length \< 2

  Very long inputs        10,000 char message             Enforce max length
                                                          server-side, not just
                                                          client

  Invalid email format    \"notanemail\"                  Regex check on backend, not
                                                          just frontend

  HTML in name field      \<script\>alert(1)\</script\>   Strip all HTML via
                                                          DOMPurify before saving

  Emoji in fields         Name: \"Maria 🌸\"              Allow --- no need to block,
                                                          just sanitize

  Invalid reservation     type: \"vip\"                   Reject --- only accept
  type                                                    exactly:
                                                          table/party/event/package

  Time outside business   Time: 03:00                     Reject if outside allowed
  hours                                                   range e.g. 10:00--22:00 JST

  Date too far in future  Date: 5 years from now          Optional: reject dates
                                                          beyond 6 months out
  ----------------------- ------------------------------- ---------------------------

**7.2 Network & Server Edge Cases**

  -------------------- ----------------------- --------------------------
  **Scenario**         **Risk**                **Solution**

  Customer submits     Duplicate reservations  Disable submit button
  form twice                                   immediately on first
  (double-click)                               click, re-enable on error
                                               only

  Slow network ---     Duplicate reservation   Disable button + show
  customer reloads     saved                   spinner; check for
  page                                         duplicate on backend
                                               within 5 min window

  Resend API is down   Email not sent          Save reservation anyway,
                                               log error, do not show
                                               failure to user

  Supabase is slow     Request times out at    Show loading state; Vercel
  (cold start)         10s                     functions timeout at 10s
                                               --- keep queries simple

  Supabase project is  All API calls fail with Set up weekly health-check
  paused (free tier)   503                     ping to prevent auto-pause

  Admin JWT expired    Accept/reject fails     Frontend catches 401,
  during session       with 401                auto-refreshes token,
                                               retries the action once

  Admin accepts        Status inconsistency    Backend checks current
  already-rejected                             status before updating ---
  reservation                                  reject if already
                                               finalized

  Two admins click     Rare but possible       Database update with WHERE
  Accept                                       status = pending prevents
  simultaneously                               double-accept
  -------------------- ----------------------- --------------------------

**7.3 Abuse Scenarios**

  -------------------- ----------------------- --------------------------
  **Abuse Type**       **Impact**              **Prevention**

  Bot floods           Burns Resend quota,     CAPTCHA + rate limit 3/hr
  reservation form     fills DB with spam      per IP

  Email bombing via    Victim gets spammed by  Rate limit by IP, not by
  victim\'s email      your site               email address

  Someone guesses      Could view other        Use UUID (not sequential
  reservation IDs      bookings via API        IDs); RLS blocks anon
                                               reads

  Admin login brute    Unauthorized dashboard  Rate limit: 5 attempts per
  force                access                  15 min per IP

  Injecting SQL via    Database compromise     Use Supabase JS client
  form fields                                  methods --- never raw SQL
                                               with user input

  Uploading malicious  XSS if displayed        Sanitize on save + use
  data in message      without escaping        textContent on display
  field                                        

  Repeatedly           Bypasses IP rate limit  CAPTCHA is the secondary
  submitting different                         defense here --- much
  IPs (VPN)                                    harder to bypass
  -------------------- ----------------------- --------------------------

**8. API Functions Specification**

**8.1 POST /api/reservations --- Create Reservation**

Public endpoint. Called when customer submits reservation form.

  -----------------------------------------------------------------------
  EXECUTION ORDER (strict --- do not change order):

  1\. Check HTTP method is POST → 405 if not

  2\. Set CORS headers (allow your domain only)

  3\. Handle OPTIONS preflight → 200

  4\. Extract IP from x-forwarded-for header

  5\. Run rate limiter (3 per hour) → 429 if limited

  6\. Parse JSON body (wrap in try/catch)

  7\. Verify Cloudflare Turnstile CAPTCHA token → 400 if fails

  8\. Validate all fields (name, email, phone, date, time,

  guest_count, type, message) → 400 with errors if invalid

  9\. Sanitize all string fields with DOMPurify

  10\. Insert into Supabase reservations table as status=pending

  → 500 if DB insert fails

  11\. Try to send confirmation email to customer (try/catch)

  12\. Try to send notification email to admin (try/catch)

  13\. Update email_confirmed_sent = true if email succeeded

  14\. Return 201 success response
  -----------------------------------------------------------------------

**8.2 PATCH /api/reservations/admin --- Accept or Reject**

Protected admin endpoint. Called when admin clicks Accept or Reject in
dashboard.

  -----------------------------------------------------------------------
  EXECUTION ORDER:

  1\. Check HTTP method is PATCH → 405 if not

  2\. Set CORS headers

  3\. Handle OPTIONS preflight → 200

  4\. Extract IP from x-forwarded-for header

  5\. Run rate limiter (60 per minute --- admin actions)

  6\. Verify JWT: extract Bearer token → getUser(token)

  → 401 if missing, invalid, or expired

  7\. Verify user is in admin_users table → 401 if not

  8\. Parse JSON body: get reservation_id and new status

  9\. Validate status is exactly \"accepted\" or \"rejected\"

  10\. Validate reservation_id is a valid UUID format

  11\. Check reservation currently has status=\"pending\"

  → 409 Conflict if already accepted/rejected

  12\. Update reservation status in Supabase

  → 500 if DB update fails

  13\. Try to send status email to customer (try/catch)

  14\. Update email_status_sent = true if email succeeded

  15\. Return 200 success with updated reservation
  -----------------------------------------------------------------------

**8.3 GET /api/reservations/admin --- List Reservations**

Protected admin endpoint. Called when admin dashboard loads.

  -----------------------------------------------------------------------
  EXECUTION ORDER:

  1\. Check HTTP method is GET → 405 if not

  2\. Set CORS headers

  3\. Handle OPTIONS preflight → 200

  4\. Verify JWT → 401 if invalid

  5\. Verify admin role → 401 if not admin

  6\. Read query params: ?status=pending&date=2025-01-20

  (both optional --- return all if not provided)

  7\. Query Supabase with filters applied

  8\. Order by created_at DESC (newest first)

  9\. Return 200 with reservations array
  -----------------------------------------------------------------------

**9. Admin Dashboard --- Reservations Page**

**9.1 Page Load Behavior**

6.  **Page loads → immediately call requireAuth() to check JWT**

7.  If no token → redirect to /admin/index.html

8.  If token exists → call GET /api/reservations/admin

9.  Show loading spinner while fetching

10. Render reservations list grouped by status or sorted by date

11. Show count badges: Pending (3) / Accepted / Rejected

**9.2 Accept / Reject Button Behavior**

  ---------- ---------------------------------------------------------------------
  **Button   
  UX Rules** 

  **•**      Disable BOTH buttons immediately when either is clicked (prevents
             double-submit)

  **•**      Show a loading/spinner state on the clicked button

  **•**      On success: update the card status visually without full page reload

  **•**      On error: re-enable buttons, show error message next to the card

  **•**      On 401 error: attempt token refresh, retry once, then redirect to
             login

  **•**      Accepted reservations show in green, Rejected in red, Pending in
             yellow

  **•**      Add a confirmation prompt before rejecting (\"Are you sure?\") to
             prevent accidents
  ---------- ---------------------------------------------------------------------

**9.3 Filters**

-   Status filter: All / Pending / Accepted / Rejected (default:
    Pending)

-   Date filter: date picker to view reservations for a specific day

-   Filter applies client-side if data already loaded, or refetches from
    API

-   Show \"No reservations found\" state when filter returns empty
    results

**10. Japan Timezone Handling (JST)**

Since the website is deployed for a Japan-based restaurant, timezone
must be handled consistently throughout to avoid off-by-one date/time
bugs.

  ------------ ---------------------------------------------------------------------
  **Timezone   
  Rules**      

  **•**        Japan Standard Time (JST) = UTC+9 --- there is no daylight saving in
               Japan

  **•**        Store all dates and times in the database as TIMESTAMPTZ (with
               timezone info)

  **•**        Display all times to admin and customers in JST explicitly

  **•**        When validating \"date must be in the future\", compare against JST
               now --- not UTC

  **•**        Format dates in emails in a Japan-friendly format: YYYY年MM月DD日 or
               YYYY-MM-DD

  **•**        Supabase Tokyo region stores data locally but timestamps are UTC
               internally

  **•**        When displaying time in admin dashboard, convert to JST: new
               Date().toLocaleString(\"ja-JP\", { timeZone: \"Asia/Tokyo\" })
  ------------ ---------------------------------------------------------------------

  -----------------------------------------------------------------------
  // Correct way to check if reservation date is in the future (JST)

  function isDateInFutureJST(dateString) {

  const now = new Date();

  const jstOffset = 9 \* 60; // JST is UTC+9

  const jstNow = new Date(now.getTime() + jstOffset \* 60000);

  const todayJST = jstNow.toISOString().split(\'T\')\[0\]; // YYYY-MM-DD

  return dateString \> todayJST;

  }

  // Format date for Japanese display

  function formatDateJapanese(dateString) {

  return new Date(dateString).toLocaleDateString(\'ja-JP\', {

  timeZone: \'Asia/Tokyo\',

  year: \'numeric\',

  month: \'long\',

  day: \'numeric\'

  }); // → 2025年1月20日

  }
  -----------------------------------------------------------------------

**11. CORS Configuration**

CORS headers must be added to every API function response. This prevents
other websites from calling your API and impersonating your frontend.

  -----------------------------------------------------------------------
  // \_lib/cors.js

  const ALLOWED_ORIGINS = \[

  \'https://your-site.vercel.app\',

  \'https://amouretgrace.com\', // if you have a custom domain

  \'http://localhost:3000\' // local dev only

  \];

  export function getCorsHeaders(event) {

  const origin = event.headers\[\'origin\'\];

  const allowed = ALLOWED_ORIGINS.includes(origin)

  ? origin

  : ALLOWED_ORIGINS\[0\];

  return {

  \'Access-Control-Allow-Origin\': allowed,

  \'Access-Control-Allow-Methods\': \'GET, POST, PATCH, OPTIONS\',

  \'Access-Control-Allow-Headers\': \'Content-Type, Authorization\',

  \'Content-Type\': \'application/json\'

  };

  }

  // Add to EVERY function handler at the start:

  const headers = getCorsHeaders(event);

  if (event.httpMethod === \'OPTIONS\') {

  return { statusCode: 200, headers, body: \'\' };

  }
  -----------------------------------------------------------------------

**12. Testing Checklist**

Test every item below before considering the reservations feature
complete.

**12.1 Happy Path (Everything Works)**

-   Submit reservation with all valid fields → reservation saved, both
    emails sent

-   Admin logs in → sees new pending reservation in dashboard

-   Admin clicks Accept → customer receives acceptance email, status
    updates in UI

-   Admin clicks Reject → customer receives rejection email, status
    updates in UI

-   Language toggle (EN/JA) works on reservation page without breaking
    form

**12.2 Validation Tests**

-   Submit with empty name → error shown, nothing saved

-   Submit with invalid email format → error shown

-   Submit with past date → error shown

-   Submit with guest_count = 0 → error shown

-   Submit with guest_count = 9999 → error shown

-   Submit with type = \"vip\" → error shown

-   Submit with \<script\>alert(1)\</script\> in name → saved as plain
    text, not executed

-   Submit with 10,000 character message → rejected, error shown

**12.3 Rate Limiting Tests**

-   Submit reservation form 4 times in a row from same IP → 4th attempt
    gets 429 error

-   Submit login 6 times with wrong password → 6th attempt gets 429
    error

-   Wait for rate limit window to expire → form works again

**12.4 Security Tests**

-   Try to access /admin/dashboard.html directly without login →
    redirected to login

-   Try to call PATCH /api/reservations/admin without Authorization
    header → 401 returned

-   Try to call PATCH /api/reservations/admin with expired token → 401
    returned

-   Try to call PATCH /api/reservations/admin with made-up token → 401
    returned

-   Submit form without completing CAPTCHA → rejected with CAPTCHA error

**12.5 Edge Case Tests**

-   Submit form twice quickly (double-click) → only one reservation
    saved

-   Accept a reservation that was already rejected → rejected with 409
    error

-   Admin token expires mid-session → auto-refreshes, continues working

-   Resend email fails (test with invalid RESEND_FROM_EMAIL) →
    reservation still saves

-   Test all date/time formatting displays in JST correctly on admin
    dashboard

**13. Post-Launch Maintenance**

**13.1 Weekly Tasks**

-   Check Supabase dashboard → Storage and Database usage

-   Check Resend dashboard → emails sent count (watch for unusual
    spikes)

-   Check Vercel dashboard → function invocations and any error logs

-   Confirm Supabase project has not auto-paused (free tier pauses after
    7 days of inactivity)

**13.2 Supabase Auto-Pause Prevention**

Set up a GitHub Action that pings your Supabase project every 4 days to
keep it awake:

  -----------------------------------------------------------------------
  \# .github/workflows/keep-alive.yml

  name: Keep Supabase Alive

  on:

  schedule:

  \- cron: \'0 0 \*/4 \* \*\' \# Every 4 days

  jobs:

  ping:

  runs-on: ubuntu-latest

  steps:

  \- name: Ping Supabase

  run: \|

  curl -s https://your-site.vercel.app/api/health \|\| true
  -----------------------------------------------------------------------

**13.3 If Something Goes Wrong**

  ---------------------- ----------------------- -------------------------
  **Symptom**            **Likely Cause**        **Fix**

  All API calls return   Supabase paused         Login to Supabase
  503                                            dashboard → Resume
                                                 project

  Emails not sending     Resend quota hit or key Check Resend dashboard →
                         expired                 quota and key status

  Admin can\'t log in    JWT secret rotated or   Check Supabase Auth →
                         session expired         resend password recovery

  Reservation saves but  RESEND_FROM_EMAIL not   Add env var in Vercel,
  no email               set                     redeploy

  CORS error in browser  Origin not in allowed   Add domain to
                         list                    ALLOWED_ORIGINS in
                                                 cors.js

  Rate limiter blocking  Admin making many fast  Raise admin endpoint rate
  admin                  requests                limit in rate-limiter.js
  ---------------------- ----------------------- -------------------------

**Amour Et Grace --- Reservations Feature Guidelines**

Stack: Plain HTML/CSS/JS · Vercel · Supabase Japan · Resend · Cloudflare
Turnstile
