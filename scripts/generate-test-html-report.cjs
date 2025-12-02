const fs = require('fs');
const path = require('path');

const input = process.argv[2] || 'vitest-results.json';
const output = process.argv[3] || 'test-report/report.html';

if (!fs.existsSync(input)) {
  console.error('Input file not found:', input);
  process.exit(2);
}

const raw = fs.readFileSync(input, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('Invalid JSON in', input);
  process.exit(2);
}

const summary = {
  total: data.numTotalTests ?? 0,
  passed: data.numPassedTests ?? 0,
  failed: data.numFailedTests ?? 0,
  pending: data.numPendingTests ?? 0
};

const reportTitle = data.success === false && data.name === 'Vitest' ? 'Vitest Test Report' : 'Test Report';

let html = `<!doctype html><html><head><meta charset="utf-8"><title>${reportTitle}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}h1{color:#333}.summary{margin-bottom:20px}.suite{border:1px solid #eee;padding:12px;margin-bottom:10px}.passed{color:green}.failed{color:#b00020}.test{margin-left:12px;padding:6px;border-left:3px solid #ddd}.failure{background:#fff0f0;padding:8px;margin-top:6px;border:1px solid #f2c2c2}</style></head><body>`;
html += `<h1>${reportTitle}</h1>`;
html += `<div class="summary"><strong>Total:</strong> ${summary.total} &nbsp; <span class="passed">Passed:</span> ${summary.passed} &nbsp; <span class="failed">Failed:</span> ${summary.failed} &nbsp; Pending: ${summary.pending}</div>`;

const suites = Array.isArray(data.testResults) ? data.testResults : [];
for (const suite of suites) {
  html += `<div class="suite"><h2>${suite.name ?? 'Unknown Suite'}</h2>`;
  const assertions = Array.isArray(suite.assertionResults) ? suite.assertionResults : [];
  for (const assertion of assertions) {
    const status = assertion.status ? assertion.status.toUpperCase() : 'UNKNOWN';
    const statusClass = assertion.status === 'passed' ? 'passed' : (assertion.status === 'failed' ? 'failed' : '');
    html += `<div class="test"><strong class="${statusClass}">${status}</strong> - ${assertion.title ?? ''}`;
    if (assertion.status === 'failed' && Array.isArray(assertion.failureMessages) && assertion.failureMessages.length) {
      html += `<div class="failure"><pre>${assertion.failureMessages.join('\n\n')}</pre></div>`;
    }
    html += `</div>`;
  }
  if (!assertions.length && suite.message) {
    html += `<div class="test failed"><strong class="failed">FAILED</strong><div class="failure"><pre>${suite.message}</pre></div></div>`;
  }
  html += `</div>`;
}

html += `<footer><p>Generated: ${new Date().toISOString()}</p></footer></body></html>`;

const outdir = path.dirname(output);
if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });
fs.writeFileSync(output, html, 'utf8');
console.log('Report written to', output);
