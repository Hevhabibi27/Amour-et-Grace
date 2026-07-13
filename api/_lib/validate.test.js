/**
 * Smoke tests for api/_lib/validate.js
 * Run: node api/_lib/validate.test.js
 */
const v = require('./validate.js');

let passed = 0;
let failed = 0;

function test(label, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
    console.error(`    expected: ${JSON.stringify(expected)}`);
    console.error(`    got:      ${JSON.stringify(actual)}`);
  }
}

console.log('Exports:', Object.keys(v).join(', '));
console.log('');

// ── Constants ──
console.log('--- VALID_TYPES ---');
test('has 3 types', v.VALID_TYPES.length, 3);
test('includes table', v.VALID_TYPES.includes('table'), true);
test('includes event', v.VALID_TYPES.includes('event'), true);
test('includes lounge', v.VALID_TYPES.includes('lounge'), true);
test('excludes party', v.VALID_TYPES.includes('party'), false);
test('excludes package', v.VALID_TYPES.includes('package'), false);

// ── isValidType ──
console.log('\n--- isValidType ---');
test('table passes', v.isValidType('table'), true);
test('event passes', v.isValidType('event'), true);
test('lounge passes', v.isValidType('lounge'), true);
test('party fails', v.isValidType('party'), false);
test('vip fails', v.isValidType('vip'), false);
test('empty fails', v.isValidType(''), false);

// ── getTodayJST ──
const todayJST = v.getTodayJST();
console.log(`\ngetTodayJST() = "${todayJST}"`);
test('getTodayJST is YYYY-MM-DD format', /^\d{4}-\d{2}-\d{2}$/.test(todayJST), true);

// ── isFutureDate ──
console.log('\n--- isFutureDate (JST-aware) ---');
test('future date passes', v.isFutureDate('2027-01-01'), true);
test('past date fails', v.isFutureDate('2020-01-01'), false);
test('today JST fails (same-day)', v.isFutureDate(todayJST), false);
test('invalid date fails', v.isFutureDate('not-a-date'), false);
test('empty string fails', v.isFutureDate(''), false);

// ── isDateWithinMaxAdvance ──
console.log('\n--- isDateWithinMaxAdvance ---');
test('30 days out passes', v.isDateWithinMaxAdvance('2026-07-23'), true);
test('5 years out fails', v.isDateWithinMaxAdvance('2031-01-01'), false);

// ── isValidTime — RESTOBAR (table/event): 09:00–17:00 ──
console.log('\n--- isValidTime (table = restobar 09:00–17:00) ---');
test('09:00 passes (opening)', v.isValidTime('09:00', 'table'), true);
test('12:30 passes (midday)', v.isValidTime('12:30', 'table'), true);
test('17:00 passes (last slot)', v.isValidTime('17:00', 'table'), true);
test('17:01 fails (after close)', v.isValidTime('17:01', 'table'), false);
test('08:59 fails (before open)', v.isValidTime('08:59', 'table'), false);
test('03:00 fails (night)', v.isValidTime('03:00', 'table'), false);
test('19:00 fails (evening)', v.isValidTime('19:00', 'table'), false);

console.log('\n--- isValidTime (event = restobar 09:00–17:00) ---');
test('09:00 passes for event', v.isValidTime('09:00', 'event'), true);
test('17:00 passes for event', v.isValidTime('17:00', 'event'), true);
test('18:00 fails for event', v.isValidTime('18:00', 'event'), false);

// ── isValidTime — LOUNGE: 20:00–02:00 (spans midnight) ──
console.log('\n--- isValidTime (lounge = 20:00–02:00) ---');
test('19:00 fails (before open)', v.isValidTime('19:00', 'lounge'), false);
test('19:59 fails (before open)', v.isValidTime('19:59', 'lounge'), false);
test('20:00 passes (opening)', v.isValidTime('20:00', 'lounge'), true);
test('21:00 passes (evening)', v.isValidTime('21:00', 'lounge'), true);
test('23:59 passes (late night)', v.isValidTime('23:59', 'lounge'), true);
test('00:00 passes (midnight)', v.isValidTime('00:00', 'lounge'), true);
test('01:30 passes (after midnight)', v.isValidTime('01:30', 'lounge'), true);
test('02:00 passes (closing)', v.isValidTime('02:00', 'lounge'), true);
test('02:01 fails (after close)', v.isValidTime('02:01', 'lounge'), false);
test('10:00 fails (morning)', v.isValidTime('10:00', 'lounge'), false);
test('17:00 fails (afternoon)', v.isValidTime('17:00', 'lounge'), false);
test('18:59 fails (before open)', v.isValidTime('18:59', 'lounge'), false);

// ── isValidTime — format ──
console.log('\n--- isValidTime (format) ---');
test('invalid format fails', v.isValidTime('3pm', 'table'), false);
test('empty string fails', v.isValidTime('', 'table'), false);

// ── isRestaurantOpenOnDate ──
console.log('\n--- isRestaurantOpenOnDate ---');
// 2026-06-22 is a Monday
test('Monday is closed', v.isRestaurantOpenOnDate('2026-06-22').open, false);
test('Monday reason msg', v.isRestaurantOpenOnDate('2026-06-22').reason, 'We are closed on Mondays.');
// 2026-06-23 is a Tuesday
test('Tuesday is open', v.isRestaurantOpenOnDate('2026-06-23').open, true);
// 2026-06-24 is a Wednesday
test('Wednesday is open', v.isRestaurantOpenOnDate('2026-06-24').open, true);
// 2026-06-28 is a Sunday
test('Sunday is open', v.isRestaurantOpenOnDate('2026-06-28').open, true);

// ── getDayOfWeekJST ──
console.log('\n--- getDayOfWeekJST ---');
test('2026-06-23 is Tuesday (2)', v.getDayOfWeekJST('2026-06-23'), 2);
test('2026-06-28 is Sunday (0)', v.getDayOfWeekJST('2026-06-28'), 0);
test('2026-06-22 is Monday (1)', v.getDayOfWeekJST('2026-06-22'), 1);

// ── isValidPhone ──
console.log('\n--- isValidPhone ---');
test('JP mobile passes', v.isValidPhone('090-3856-2854'), true);
test('intl format passes', v.isValidPhone('+81 90 3856 2854'), true);
test('JP landline passes', v.isValidPhone('0568-48-0259'), true);
test('letters fail', v.isValidPhone('abc123'), false);
test('too short fails', v.isValidPhone('123'), false);
test('too long fails (21+)', v.isValidPhone('1'.repeat(21)), false);

// ── isValidUUID ──
console.log('\n--- isValidUUID ---');
test('valid UUID passes', v.isValidUUID('550e8400-e29b-41d4-a716-446655440000'), true);
test('not-a-uuid fails', v.isValidUUID('not-a-uuid'), false);
test('SQL injection fails', v.isValidUUID("'; DROP TABLE reservations; --"), false);
test('empty string fails', v.isValidUUID(''), false);

// ── isValidEmail ──
console.log('\n--- isValidEmail ---');
test('valid email passes', v.isValidEmail('test@example.com'), true);
test('invalid email fails', v.isValidEmail('notanemail'), false);
test('too long email fails', v.isValidEmail('x'.repeat(255) + '@test.com'), false);

// ── sanitize ──
console.log('\n--- sanitize ---');
test('strips script tags', v.sanitize('<script>alert(1)</script>Hello'), 'alert(1)Hello');
test('preserves emoji', v.sanitize('Maria 🌸'), 'Maria 🌸');
test('strips malformed img', v.sanitize('<img onerror=alert(1)').includes('onerror'), false);
test('strips JS protocol', v.sanitize('javascript:alert(1)').includes('javascript:'), false);
test('preserves Japanese', v.sanitize('田中太郎'), '田中太郎');
test('trims whitespace', v.sanitize('  hello  '), 'hello');

// ── checkMaxLengths ──
console.log('\n--- checkMaxLengths ---');
test('under limit returns null', v.checkMaxLengths({ name: 'ab' }, { name: 100 }), null);
const tooLong = v.checkMaxLengths({ name: 'x'.repeat(101) }, { name: 100 });
test('over limit returns field', tooLong && tooLong.field, 'name');
test('over limit returns max', tooLong && tooLong.max, 100);

// ── validateRequired ──
console.log('\n--- validateRequired ---');
const r1 = v.validateRequired({ name: 'John', email: 'j@e.com' }, ['name', 'email']);
test('all present passes', r1.valid, true);
const r2 = v.validateRequired({ name: '' }, ['name', 'email']);
test('empty name + missing email fails', r2.valid, false);
test('reports both missing', r2.missing.length, 2);

// ── Summary ──
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
