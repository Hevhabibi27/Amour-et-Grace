# Amour Et Grace — Restaurant Website Architecture (v2 — Netlify)

A full-stack restaurant website deployed on **Netlify**, using **HTML/CSS/JS** for the frontend, **Netlify Serverless Functions** for the backend API, **Supabase** for the database, and **Groq AI** for customer inquiry assistance.

---

## Key Architecture Decisions

> [!IMPORTANT]
> **Why this structure?** Netlify serves anything inside `/public` as static files (set via `publish` in `netlify.toml`) and deploys anything inside `/netlify/functions` as serverless functions. Redirects in `netlify.toml` map `/api/*` URLs to the functions, so the frontend calls clean `/api/...` paths. This is a simple full-stack setup — no framework needed, beginner-friendly, and scales automatically.

| Decision | Choice | Why |
|---|---|---|
| Frontend | Static HTML/CSS/JS in `/public` | No build step, beginner-friendly, fast |
| Backend | Netlify Serverless Functions in `/netlify/functions` | Auto-scales, no server to manage |
| Database | Supabase (PostgreSQL) | Free tier, real-time, easy auth for admin |
| AI | Groq API (customer-facing only) | Fast inference, free tier available |
| Auth | Supabase Auth (admin only) | Only admins need accounts |
| Rate Limiting | In-memory + Supabase tracking | No user accounts — limit by IP/session |
| File Uploads | Supabase Storage | For review photos/videos |
| Email Notifications | Resend (100 free/day) | Email-only reservation status — no status check page |
| Admin/Site Separation | `/public/admin/` subfolder | Admin and customer CSS/JS/assets fully isolated |

---

## Decisions Made

| Decision | Choice |
|---|---|
| Reservation notification | **Email-only** via Resend — no status check page on website |
| CSS sharing | **Fully separate** — admin and customer site have independent CSS |
| Admin separation | **`/public/admin/`** — isolated HTML, CSS, JS, and assets |
| Menu images | **Static (Option A)** — stored in `public/assets/images/menu/`, updated manually by developer |
| Hosting | **Netlify** — free tier with 125K function invocations/month, 100GB bandwidth |

---

## Open Questions

> [!IMPORTANT]
> **Please answer these before I start building:**

1. **Admin login** — Should there be a single admin account, or multiple staff accounts with different roles (e.g., manager vs. host)?
2. **Admin email notification** — Should the admin also receive an email when a new reservation comes in, or is the dashboard enough?
3. **Review moderation** — Should reviews appear immediately, or should the admin approve them first?
4. **Domain/branding** — Do you have a logo, color palette, or brand guidelines, or should I design from scratch?

---

## Proposed Folder & File Structure

> [!NOTE]
> **Admin is fully separated.** The `/public/admin/` directory has its own HTML, CSS, JS, and assets — completely independent from the customer-facing site. This means:
> - Admin styles never leak into the public site (and vice versa)
> - You can redesign either side without touching the other
> - Admin pages have a different layout (sidebar dashboard vs. restaurant navbar)
> - Easier to hand off to different developers if needed

```
amourEtGrace/
│
├── 📄 netlify.toml             ← Netlify config (publish dir, functions dir, redirects, headers)
├── 📄 package.json             ← Node.js dependencies + scripts (npm run dev, npm run deploy)
├── 📄 .env.example             ← Template for environment variables
├── 📄 .gitignore               ← Git ignore rules
│
│── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
│   🌐 CUSTOMER-FACING WEBSITE
│── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
│
├── 📁 public/                  ← CUSTOMER-FACING FRONTEND (served by Netlify as static)
│   │
│   ├── 📄 index.html           ← Homepage (hero, featured menu, events, reviews)
│   ├── 📄 menu.html            ← Full digital menu page
│   ├── 📄 events.html          ← Upcoming events & live music
│   ├── 📄 reservation.html     ← All reservation forms (table, party, event, packages)
│   ├── 📄 reviews.html         ← Customer reviews & testimonials
│   ├── 📄 contact.html         ← Location, map, hours, contact info
│   ├── 📄 inquiry.html         ← All inquiry forms (general, event, party, catering)
│   │
│   ├── 📁 css/                 ← WEBSITE STYLESHEETS (customer site only)
│   │   ├── 📄 variables.css    ← CSS custom properties (colors, fonts, spacing)
│   │   ├── 📄 reset.css        ← CSS reset/normalize
│   │   ├── 📄 global.css       ← Shared layout, typography, buttons, navbar, footer
│   │   ├── 📄 home.css         ← Homepage-specific styles
│   │   ├── 📄 menu.css         ← Menu page styles
│   │   ├── 📄 events.css       ← Events page styles
│   │   ├── 📄 reservation.css  ← Reservation page styles
│   │   ├── 📄 reviews.css      ← Reviews page styles
│   │   ├── 📄 contact.css      ← Contact/location page styles
│   │   ├── 📄 inquiry.css      ← Inquiry forms styles
│   │   └── 📄 chatbot.css      ← AI chatbot widget styles
│   │
│   ├── 📁 js/                  ← WEBSITE JAVASCRIPT (customer site only)
│   │   ├── 📄 utils.js         ← Shared helpers (API calls, formatting, validation)
│   │   ├── 📄 navbar.js        ← Mobile nav toggle, scroll effects
│   │   ├── 📄 home.js          ← Homepage interactions (carousel, animations)
│   │   ├── 📄 menu.js          ← Menu filtering, category tabs
│   │   ├── 📄 events.js        ← Events listing, filtering by date
│   │   ├── 📄 reservation.js   ← Reservation form logic & submission
│   │   ├── 📄 reviews.js       ← Review listing, submission, photo/video upload
│   │   ├── 📄 contact.js       ← Google Maps init, contact form submission
│   │   ├── 📄 inquiry.js       ← Inquiry form logic & submission
│   │   └── 📄 chatbot.js       ← AI chatbot widget (Groq-powered)
│   │
│   ├── 📁 assets/              ← WEBSITE STATIC ASSETS
│   │   ├── 📁 images/          ← Restaurant photos, logo, hero images
│   │   │   └── 📁 menu/        ← Menu item photos (static, updated by developer)
│   │   ├── 📁 icons/           ← Favicon, SVG icons
│   │   └── 📁 fonts/           ← Custom fonts (if not using Google Fonts CDN)
│   │
│   │── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
│   │   🔐 ADMIN DASHBOARD (separated from customer site)
│   │── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
│   │
│   └── 📁 admin/               ← ADMIN FRONTEND (separate from public site)
│       │
│       ├── 📄 index.html       ← Admin login page  →  yoursite.com/admin
│       ├── 📄 dashboard.html   ← Main dashboard     →  yoursite.com/admin/dashboard
│       ├── 📄 reservations.html ← Manage reservations → yoursite.com/admin/reservations
│       │
│       ├── 📁 css/             ← ADMIN-ONLY STYLESHEETS
│       │   ├── 📄 admin-variables.css  ← Admin color scheme & design tokens
│       │   ├── 📄 admin-global.css     ← Admin layout (sidebar, topbar, cards)
│       │   ├── 📄 admin-login.css      ← Login page styles
│       │   ├── 📄 admin-dashboard.css  ← Dashboard overview styles
│       │   └── 📄 admin-reservations.css ← Reservation management styles
│       │
│       ├── 📁 js/              ← ADMIN-ONLY JAVASCRIPT
│       │   ├── 📄 admin-utils.js       ← Admin shared helpers (auth checks, API calls)
│       │   ├── 📄 admin-login.js       ← Login form logic (Supabase Auth)
│       │   ├── 📄 admin-dashboard.js   ← Dashboard stats & overview logic
│       │   └── 📄 admin-reservations.js ← Reservation accept/reject/filter logic
│       │
│       └── 📁 assets/          ← ADMIN-ONLY ASSETS
│           └── 📁 icons/       ← Admin-specific icons (sidebar icons, status icons)
│
│── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
│   ⚙️ BACKEND API & DATABASE
│── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
│
├── 📁 netlify/                 ← NETLIFY SERVERLESS BACKEND
│   └── 📁 functions/          ← Each .js file = one serverless function
│       │
│       ├── 📁 _lib/            ← SHARED SERVER UTILITIES (not exposed as endpoints)
│       │   ├── 📄 supabase.js  ← Supabase client initialization
│       │   ├── 📄 rate-limiter.js ← Rate limiting logic (by IP)
│       │   ├── 📄 validate.js  ← Input validation helpers
│       │   ├── 📄 auth.js      ← Admin auth verification middleware
│       │   └── 📄 email.js     ← Email sending helper (Resend SDK)
│       │
│       ├── 📄 reservations.js        ← /api/reservations — create + send "received" email
│       ├── 📄 reservations-admin.js  ← /api/reservations/admin — list all, accept/reject + email
│       ├── 📄 events.js              ← /api/events — fetch upcoming events
│       ├── 📄 reviews.js             ← /api/reviews — list & create reviews
│       ├── 📄 reviews-upload.js      ← /api/reviews/upload — upload photos/videos
│       ├── 📄 inquiry.js             ← /api/inquiry — submit inquiry form
│       ├── 📄 chat.js                ← /api/chat — Groq AI chat (rate-limited)
│       ├── 📄 auth-login.js          ← /api/auth/login — admin login
│       └── 📄 auth-verify.js         ← /api/auth/verify — verify admin session
│
└── 📁 db/                      ← DATABASE SETUP (reference only, run in Supabase SQL editor)
    ├── 📄 schema.sql            ← All table definitions
    ├── 📄 seed.sql              ← Sample data for testing
    └── 📄 policies.sql          ← Row Level Security policies
```

---

## How Each Feature Maps to Files

### 1. 🍽️ Menu Feature (Static — No API Needed)

| Layer | File(s) | Purpose |
|---|---|---|
| Frontend | `menu.html`, `css/menu.css`, `js/menu.js` | Display menu with category filtering/tabs |
| Images | `assets/images/menu/` | Menu item photos stored in project folder |
| Data | Hardcoded in `menu.html` | Menu items, prices, descriptions written directly in HTML |

> [!NOTE]
> Menu is fully static — no database, no API. When the client wants to update a dish, they send you the new info/photo and you update the HTML + redeploy. This is the simplest and most reliable approach.

---

### 2. 📅 Reservation & Booking Feature (Email-Only Notification)

| Layer | File(s) | Purpose |
|---|---|---|
| Frontend | `reservation.html`, `css/reservation.css`, `js/reservation.js` | Forms for table/party/event/package reservations |
| Backend | `netlify/functions/reservations.js` | Create reservation + send "received" email via Resend |
| Backend | `netlify/functions/reservations-admin.js` | Admin: list all, accept/reject + send status email |
| Backend | `netlify/functions/_lib/email.js` | Email sending helper (Resend SDK) |
| Database | `reservations` table | Stores reservation data + email tracking booleans |
| Rate Limit | `netlify/functions/_lib/rate-limiter.js` | Max 3 reservations per IP per hour |

**Reservation types** are handled by a single `reservations` table with a `type` enum:
- `table` — Regular table booking
- `party` — Party reservation
- `event` — Event reservation
- `package` — Food & drink packages

**Customer notification flow (email-only, no status check page):**
```
Customer submits form → Reservation saved → 📧 Email #1: "We received your reservation"
                                                  ↓
                                           Admin reviews in dashboard
                                                  ↓
                              Admin accepts → 📧 Email #2: "Your reservation is confirmed!"
                              Admin rejects → 📧 Email #2: "Sorry, we're fully booked."
```

> [!NOTE]
> Email failures never block the reservation from being saved. The admin dashboard shows email status (✅ Sent / ❌ Failed) with a Resend button for failed emails.

---

### 3. 🎵 Events Feature

| Layer | File(s) | Purpose |
|---|---|---|
| Frontend | `events.html`, `css/events.css`, `js/events.js` | Display events, filter by type |
| Backend | `netlify/functions/events.js` | Fetch events from Supabase |
| Database | `events` table | Stores event name, date, type, description, image |

---

### 4. ⭐ Reviews Feature

| Layer | File(s) | Purpose |
|---|---|---|
| Frontend | `reviews.html`, `css/reviews.css`, `js/reviews.js` | Display & submit reviews with star ratings |
| Backend | `netlify/functions/reviews.js` | List & create reviews |
| Backend | `netlify/functions/reviews-upload.js` | Handle photo/video uploads to Supabase Storage |
| Database | `reviews` table | Stores name, rating, comment, media URLs |
| Storage | Supabase Storage `reviews` bucket | Stores uploaded photos/videos |
| Rate Limit | `netlify/functions/_lib/rate-limiter.js` | Max 2 reviews per IP per day |

---

### 5. 📍 Location & Contact Feature

| Layer | File(s) | Purpose |
|---|---|---|
| Frontend | `contact.html`, `css/contact.css`, `js/contact.js` | Map, hours, contact info, contact form |
| Backend | — | Contact info is hardcoded in HTML (no API needed) |
| External | Google Maps Embed API | Embedded map |

---

### 6. 📩 Inquiry Feature

| Layer | File(s) | Purpose |
|---|---|---|
| Frontend | `inquiry.html`, `css/inquiry.css`, `js/inquiry.js` | General, event, party, catering inquiry forms |
| Backend | `netlify/functions/inquiry.js` | Submit inquiry to Supabase |
| Database | `inquiries` table | Stores inquiry type, name, email, message |
| Rate Limit | `netlify/functions/_lib/rate-limiter.js` | Max 5 inquiries per IP per hour |

---

### 7. 🤖 AI Chatbot (Groq — Customer-Facing Only)

| Layer | File(s) | Purpose |
|---|---|---|
| Frontend | `js/chatbot.js`, `css/chatbot.css` | Floating chat widget on every page |
| Backend | `netlify/functions/chat.js` | Proxy to Groq API with system prompt about the restaurant |
| Rate Limit | `netlify/functions/_lib/rate-limiter.js` | Max 20 messages per IP per hour |

> [!NOTE]
> The chatbot system prompt will contain restaurant details (menu highlights, hours, location, reservation info). It will ONLY answer questions about the restaurant — no general knowledge.

---

### 8. 🔐 Admin Dashboard (Separated in `/public/admin/`)

| Layer | File(s) | Purpose |
|---|---|---|
| Frontend | `admin/index.html` | Login page → `yoursite.com/admin` |
| Frontend | `admin/dashboard.html` | Dashboard overview → `yoursite.com/admin/dashboard` |
| Frontend | `admin/reservations.html` | Reservation management → `yoursite.com/admin/reservations` |
| Styles | `admin/css/admin-variables.css` | Admin-specific design tokens & color scheme |
| Styles | `admin/css/admin-global.css` | Admin layout (sidebar navigation, topbar, cards) |
| Styles | `admin/css/admin-login.css` | Login page styles |
| Styles | `admin/css/admin-dashboard.css` | Dashboard overview styles |
| Styles | `admin/css/admin-reservations.css` | Reservation table & action styles |
| Scripts | `admin/js/admin-utils.js` | Shared admin helpers (auth guard, API calls with token) |
| Scripts | `admin/js/admin-login.js` | Login form logic (Supabase Auth) |
| Scripts | `admin/js/admin-dashboard.js` | Dashboard stats, recent reservations overview |
| Scripts | `admin/js/admin-reservations.js` | Reservation list, accept/reject/filter logic |
| Backend | `netlify/functions/auth-login.js`, `netlify/functions/auth-verify.js` | Supabase Auth login & session verification |
| Backend | `netlify/functions/reservations-admin.js` | Fetch all reservations, accept/reject |
| Database | Supabase Auth | Admin user account(s) |

> [!NOTE]
> The admin dashboard uses a completely different layout than the customer site — a **sidebar navigation** with a topbar instead of the restaurant's navbar/footer. This is why it has its own `admin-global.css` with its own layout system.

---

## Netlify Serverless Function Pattern

> [!IMPORTANT]
> All serverless functions on Netlify use this pattern — different from Vercel's `(req, res)` format:

```js
// netlify/functions/example.js
import { supabase } from './_lib/supabase.js';

export const handler = async (event, context) => {
  // Route by HTTP method
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase.from('table').select('*');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    };
  }

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    // ... handle POST
    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
```

**Quick reference:**

| What you need | Netlify `event` property |
|---|---|
| HTTP method | `event.httpMethod` |
| Request body | `JSON.parse(event.body)` |
| Query params | `event.queryStringParameters` |
| Headers | `event.headers` |
| Client IP | `event.headers['client-ip']` or `event.headers['x-forwarded-for']` |
| Path | `event.path` |

---

## Database Schema (Supabase PostgreSQL)

```sql
-- NOTE: No menu table needed — menu is hardcoded in HTML (static approach)

-- Reservations (all types in one table)
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,                            -- 'table', 'party', 'event', 'package'
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  guest_count INTEGER NOT NULL,
  message TEXT,
  package_id UUID REFERENCES menu_packages(id),
  status TEXT DEFAULT 'pending',                 -- 'pending', 'accepted', 'rejected'
  email_confirmed_sent BOOLEAN DEFAULT false,    -- Was "reservation received" email sent?
  email_status_sent BOOLEAN DEFAULT false,       -- Was "accepted/rejected" email sent?
  ip_address TEXT,                               -- For rate limiting
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()           -- When status was last changed
);

-- Events
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,       -- 'live_music', 'special', 'holiday', etc.
  date DATE NOT NULL,
  time TIME,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  media_urls TEXT[],              -- Array of photo/video URLs
  is_approved BOOLEAN DEFAULT true,
  ip_address TEXT,                -- For rate limiting
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inquiries
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,             -- 'general', 'event', 'party', 'catering'
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Food & drink packages (for package reservations)
CREATE TABLE menu_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  items TEXT[],                   -- List of included items
  min_guests INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Rate Limiting Strategy

Since users don't have accounts, rate limiting is done by **IP address**:

```
netlify/functions/_lib/rate-limiter.js
```

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/reservations` | 3 requests | per hour |
| `POST /api/reviews` | 2 requests | per day |
| `POST /api/inquiry` | 5 requests | per hour |
| `POST /api/chat` | 20 messages | per hour |

Implementation: Store request counts in a Supabase `rate_limits` table keyed by IP + endpoint. Check before processing each request.

---

## Environment Variables (`.env`)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Groq AI
GROQ_API_KEY=your-groq-api-key

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@amouretgrace.com

# Google Maps
GOOGLE_MAPS_API_KEY=your-maps-api-key
```

> [!NOTE]
> On Netlify, set these in **Site Settings → Environment Variables** in the Netlify dashboard. For local dev, create a `.env` file (already in `.gitignore`) and `netlify dev` will read it automatically.

---

## `netlify.toml` Configuration

```toml
[build]
  publish = "public"
  functions = "netlify/functions"

# Redirects map clean /api/* URLs to Netlify Functions
[[redirects]]
  from = "/api/reservations/admin"
  to = "/.netlify/functions/reservations-admin"
  status = 200

[[redirects]]
  from = "/api/reservations"
  to = "/.netlify/functions/reservations"
  status = 200

[[redirects]]
  from = "/api/events"
  to = "/.netlify/functions/events"
  status = 200

[[redirects]]
  from = "/api/reviews/upload"
  to = "/.netlify/functions/reviews-upload"
  status = 200

[[redirects]]
  from = "/api/reviews"
  to = "/.netlify/functions/reviews"
  status = 200

[[redirects]]
  from = "/api/inquiry"
  to = "/.netlify/functions/inquiry"
  status = 200

[[redirects]]
  from = "/api/chat"
  to = "/.netlify/functions/chat"
  status = 200

[[redirects]]
  from = "/api/auth/login"
  to = "/.netlify/functions/auth-login"
  status = 200

[[redirects]]
  from = "/api/auth/verify"
  to = "/.netlify/functions/auth-verify"
  status = 200

[[headers]]
  for = "/.netlify/functions/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PATCH, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

---

## `package.json` Dependencies

```json
{
  "name": "amour-et-grace",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "groq-sdk": "^0.x",
    "resend": "^4.x"
  },
  "devDependencies": {
    "netlify-cli": "^17.x"
  },
  "scripts": {
    "dev": "netlify dev",
    "deploy": "netlify deploy --prod"
  }
}
```

> [!TIP]
> Only **3 runtime dependencies** needed. Everything else is vanilla HTML/CSS/JS. The `netlify-cli` is a dev dependency for local development (`npm run dev`).

---

## Email Notification System

### Service: **Resend** (100 free emails/day, 3,000/month)

| Email | Trigger | Sent To | Content |
|---|---|---|---|
| Reservation received | Customer submits form | Customer | "We received your reservation. We'll confirm via email within 24 hours." |
| Reservation accepted | Admin clicks Accept | Customer | "Your reservation is confirmed! See you on [date] at [time]." |
| Reservation rejected | Admin clicks Reject | Customer | "Sorry, we're unable to accommodate your reservation. Please contact us." |

### Error handling:
- Email failure **never** blocks the reservation from being saved
- `email_confirmed_sent` and `email_status_sent` booleans in the database prevent double-sends
- Admin dashboard shows email status with a **Resend** button for failed emails
- If email fails, admin can still see the customer's phone number and call them

### Database tracking:
```sql
-- These two columns on the reservations table track email status:
email_confirmed_sent BOOLEAN DEFAULT false   -- "received" email sent?
email_status_sent BOOLEAN DEFAULT false      -- "accepted/rejected" email sent?
```

### Cost estimate for a restaurant:
```
10 reservations/day × 2 emails each = 20 emails/day
Free tier limit: 100 emails/day
Headroom: 5x more than needed ✅
```

---

## Verification Plan

### Automated Tests
- Test each API endpoint with sample requests using `curl` or a REST client
- Verify rate limiting by sending requests above the threshold
- Verify admin auth by attempting unauthenticated access to admin endpoints

### Manual Verification
- Run `netlify dev` locally and test all user flows
- Deploy to Netlify preview and test live
- Submit reservations, reviews, and inquiries
- Test AI chatbot with restaurant questions
- Test admin login and reservation accept/reject
- Test on mobile for responsive design
