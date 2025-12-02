const fs = require('fs');
const path = require('path');

const input = process.argv[2] || 'jest-results.json';
const output = process.argv[3] || 'test-report/report.html';

if (!fs.existsSync(input)) {
  console.error('Input file not found:', input);
  process.exit(2);
}

const raw = fs.readFileSync(input, 'utf8');
let data;
try { data = JSON.parse(raw); } catch (e) { console.error('Invalid JSON in', input); process.exit(2); }

const { numTotalTests, numPassedTests, numFailedTests, numPendingTests, testResults } = data;

let html = `<!doctype html><html><head><meta charset="utf-8"><title>Jest Test Report</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}h1{color:#333} .summary{margin-bottom:20px} .suite{border:1px solid #eee;padding:12px;margin-bottom:10px} .passed{color:green}.failed{color:#b00020}.test{margin-left:12px;padding:6px;border-left:3px solid #ddd} .failure{background:#fff0f0;padding:8px;margin-top:6px;border:1px solid #f2c2c2}</style></head><body>`;
html += `<h1>Jest Test Report</h1>`;
html += `<div class="summary"><strong>Total:</strong> ${numTotalTests} &nbsp; <span class="passed">Passed:</span> ${numPassedTests} &nbsp; <span class="failed">Failed:</span> ${numFailedTests} &nbsp; Pending: ${numPendingTests}</div>`;

for (const suite of testResults) {
  html += `<div class="suite"><h2>${suite.name}</h2>`;
  for (const assertion of suite.assertionResults) {
    const statusClass = assertion.status === 'passed' ? 'passed' : (assertion.status === 'failed' ? 'failed' : '');
    html += `<div class="test"><strong class="${statusClass}">${assertion.status.toUpperCase()}</strong> - ${assertion.title}`;
    if (assertion.status === 'failed' && assertion.failureMessages && assertion.failureMessages.length) {
      html += `<div class="failure"><pre>${assertion.failureMessages.join('\n\n')}</pre></div>`;
    }
    html += `</div>`;
  }
  html += `</div>`;
}

html += `<footer><p>Generated: ${new Date().toISOString()}</p></footer></body></html>`;

// ensure output dir
const outdir = path.dirname(output);
if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });
fs.writeFileSync(output, html, 'utf8');
console.log('Report written to', output);
