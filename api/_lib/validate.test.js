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

// ── getTodayJST ──
const todayJST = v.getTodayJST();
console.log(`getTodayJST() = "${todayJST}"`);
test('getTodayJST is YYYY-MM-DD format', /^\d{4}-\d{2}-\d{2}$/.test(todayJST), true);

// ── isFutureDate ──
console.log('\n--- isFutureDate (JST-aware) ---');
test('future date passes',          v.isFutureDate('2027-01-01'), true);
test('past date fails',             v.isFutureDate('2020-01-01'), false);
test('today JST fails (same-day)',  v.isFutureDate(todayJST),     false);
test('invalid date fails',          v.isFutureDate('not-a-date'),  false);
test('empty string fails',          v.isFutureDate(''),            false);

// ── isDateWithinMaxAdvance ──
console.log('\n--- isDateWithinMaxAdvance ---');
test('30 days out passes',   v.isDateWithinMaxAdvance('2026-07-21'), true);
test('5 years out fails',    v.isDateWithinMaxAdvance('2031-01-01'), false);

// ── isValidTime (10:00–17:00 JST) ──
console.log('\n--- isValidTime (10:00–17:00) ---');
test('10:00 passes (opening)',  v.isValidTime('10:00'), true);
test('12:30 passes (midday)',   v.isValidTime('12:30'), true);
test('17:00 passes (last slot)',v.isValidTime('17:00'), true);
test('17:01 fails (after close)', v.isValidTime('17:01'), false);
test('09:59 fails (before open)', v.isValidTime('09:59'), false);
test('03:00 fails (night)',     v.isValidTime('03:00'), false);
test('22:00 fails (evening)',   v.isValidTime('22:00'), false);
test('invalid format fails',   v.isValidTime('3pm'),    false);
test('empty string fails',     v.isValidTime(''),       false);

// ── isValidPhone ──
console.log('\n--- isValidPhone ---');
test('JP mobile passes',       v.isValidPhone('090-3856-2854'), true);
test('intl format passes',     v.isValidPhone('+81 90 3856 2854'), true);
test('JP landline passes',     v.isValidPhone('0568-48-0259'), true);
test('letters fail',           v.isValidPhone('abc123'), false);
test('too short fails',        v.isValidPhone('123'),    false);
test('too long fails (21+)',   v.isValidPhone('1'.repeat(21)), false);

// ── isValidUUID ──
console.log('\n--- isValidUUID ---');
test('valid UUID passes',      v.isValidUUID('550e8400-e29b-41d4-a716-446655440000'), true);
test('not-a-uuid fails',       v.isValidUUID('not-a-uuid'), false);
test('SQL injection fails',    v.isValidUUID("'; DROP TABLE reservations; --"), false);
test('empty string fails',     v.isValidUUID(''), false);

// ── isValidEmail ──
console.log('\n--- isValidEmail ---');
test('valid email passes',     v.isValidEmail('test@example.com'), true);
test('invalid email fails',    v.isValidEmail('notanemail'), false);
test('too long email fails',   v.isValidEmail('x'.repeat(255) + '@test.com'), false);

// ── sanitize ──
console.log('\n--- sanitize ---');
test('strips script tags',     v.sanitize('<script>alert(1)</script>Hello'), 'alert(1)Hello');
test('preserves emoji',        v.sanitize('Maria 🌸'), 'Maria 🌸');
test('strips malformed img',   v.sanitize('<img onerror=alert(1)').includes('onerror'), false);
test('strips JS protocol',     v.sanitize('javascript:alert(1)').includes('javascript:'), false);
test('preserves Japanese',     v.sanitize('田中太郎'), '田中太郎');
test('trims whitespace',       v.sanitize('  hello  '), 'hello');

// ── checkMaxLengths ──
console.log('\n--- checkMaxLengths ---');
test('under limit returns null',  v.checkMaxLengths({ name: 'ab' }, { name: 100 }), null);
const tooLong = v.checkMaxLengths({ name: 'x'.repeat(101) }, { name: 100 });
test('over limit returns field',  tooLong && tooLong.field, 'name');
test('over limit returns max',    tooLong && tooLong.max, 100);

// ── validateRequired ──
console.log('\n--- validateRequired ---');
const r1 = v.validateRequired({ name: 'John', email: 'j@e.com' }, ['name', 'email']);
test('all present passes',     r1.valid, true);
const r2 = v.validateRequired({ name: '' }, ['name', 'email']);
test('empty name + missing email fails', r2.valid, false);
test('reports both missing',   r2.missing.length, 2);

// ── Summary ──
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
