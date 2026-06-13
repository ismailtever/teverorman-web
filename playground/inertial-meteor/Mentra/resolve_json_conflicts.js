const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, 'locales');

fs.readdirSync(localesDir).forEach(file => {
    if (!file.endsWith('.json')) return;
    const filePath = path.join(localesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Remove the conflict markers but keep the content
    // We need to add a comma if there isn't one before the ======= block
    // Because HEAD has the last keys, and origin/main has new keys.
    
    // Replace <<<<<<< HEAD\n ... =======\n ... >>>>>>> origin/main\n
    // Let's just use regex to clean it up safely.
    
    // First, find all key-value pairs ignoring markers
    // Since it's a flat JSON, we can extract all pairs and reconstruct it.
    const pairs = [];
    const lines = content.split('\n');
    lines.forEach(line => {
        // match "key": "value" or "key": "value",
        const match = line.match(/^\s*"([^"]+)"\s*:\s*("(?:[^"\\]|\\.)*"|\d+|true|false)(,?)\s*$/);
        if (match) {
            pairs.push(`  "${match[1]}": ${match[2]}`);
        }
    });

    const newJson = "{\n" + pairs.join(",\n") + "\n}\n";
    fs.writeFileSync(filePath, newJson);
    console.log(`Resolved conflict in ${file}`);
});
