/**
 * Quick test for email.js helpers (no Resend API call needed).
 * Run: node api/_lib/email.test.js
 */

// Stub Resend so require doesn't fail
jest = undefined;
const origRequire = module.constructor.prototype.require;
module.constructor.prototype.require = function(id) {
  if (id === 'resend') return { Resend: function() {} };
  return origRequire.apply(this, arguments);
};

const { escapeHtml, formatDateJST, formatTimeJST } = require('./email.js');

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

console.log('--- escapeHtml ---');
test('escapes <script>',    escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
test('escapes quotes',      escapeHtml('"hello" & \'world\''),       '&quot;hello&quot; &amp; &#39;world&#39;');
test('preserves emoji',     escapeHtml('Maria 🌸'),                  'Maria 🌸');
test('preserves Japanese',  escapeHtml('田中太郎'),                    '田中太郎');
test('handles null',        escapeHtml(null),                         '');
test('handles undefined',   escapeHtml(undefined),                    '');
test('handles empty',       escapeHtml(''),                           '');

console.log('\n--- formatDateJST ---');
const d = formatDateJST('2025-07-15');
console.log(`  formatDateJST('2025-07-15') = "${d}"`);
test('contains 2025',       d.includes('2025'), true);
test('contains 7 or 七',    d.includes('7') || d.includes('七'), true);
test('contains 15',         d.includes('15'), true);
test('null returns null',   formatDateJST(null), null);
test('fallback on invalid', formatDateJST('not-a-date'), 'not-a-date');

console.log('\n--- formatTimeJST ---');
test('appends JST label',   formatTimeJST('18:00'), '18:00 (JST)');
test('null returns null',   formatTimeJST(null),     null);

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
