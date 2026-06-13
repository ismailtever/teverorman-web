const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, 'locales');
fs.readdirSync(localesDir).forEach(f => {
  if (f.endsWith('.json')) {
    const txt = fs.readFileSync(path.join(localesDir, f), 'utf-8');
    const lines = txt.split('\n');
    const keys = new Set();
    lines.forEach((l, i) => {
      const match = l.match(/^\s*"([^"]+)"\s*:/);
      if (match) {
        const k = match[1];
        if (keys.has(k)) console.log(`Duplicate ${k} in ${f} line ${i+1}`);
        keys.add(k);
      }
    });
  }
});
