const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, 'locales');
fs.readdirSync(localesDir).forEach(f => {
  if (f.endsWith('.json')) {
    const filePath = path.join(localesDir, f);
    const txt = fs.readFileSync(filePath, 'utf-8');
    const lines = txt.split('\n');
    const keys = new Set();
    const newLines = [];
    lines.forEach(l => {
      const match = l.match(/^\s*"([^"]+)"\s*:/);
      if (match) {
        const k = match[1];
        if (keys.has(k)) {
            // It's a duplicate, skip it
            return;
        }
        keys.add(k);
      }
      newLines.push(l);
    });
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log(`Cleaned ${f}`);
  }
});
