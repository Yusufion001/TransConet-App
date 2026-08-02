const fs = require('fs');
const { execSync } = require('child_process');

// Run a grep command to find all tailwind color classes
const classesOut = execSync('grep -rEo "(bg|text|border|ring|fill|stroke|from|to|via)-(brand|slate|rose|emerald|amber|blue|indigo|gray|red|green|yellow)-[0-9]{2,3}" frontend/src/').toString();
const hexOut = execSync('grep -rEo "\\[#[0-9a-fA-F]+\\]" frontend/src/').toString();

const colorCounts = {};
const hexCounts = {};
const fileUsage = {};

classesOut.split('\n').forEach(line => {
    if (!line) return;
    const [fileAndMatch] = line.split(':');
    const parts = line.split(':');
    const file = parts[0];
    const cls = parts.slice(1).join(':'); // the matched class

    if (!colorCounts[cls]) colorCounts[cls] = 0;
    colorCounts[cls]++;

    if (!fileUsage[cls]) fileUsage[cls] = new Set();
    fileUsage[cls].add(file);
});

hexOut.split('\n').forEach(line => {
    if (!line) return;
    const parts = line.split(':');
    const file = parts[0];
    const hex = parts.slice(1).join(':'); 

    if (!hexCounts[hex]) hexCounts[hex] = 0;
    hexCounts[hex]++;

    if (!fileUsage[hex]) fileUsage[hex] = new Set();
    fileUsage[hex].add(file);
});

console.log("Tailwind Colors Used:");
Object.entries(colorCounts).sort((a,b) => b[1] - a[1]).forEach(([c, count]) => {
    console.log(`${c}: ${count} uses in ${fileUsage[c].size} files`);
});

console.log("\nHardcoded Hex Colors Used:");
Object.entries(hexCounts).sort((a,b) => b[1] - a[1]).forEach(([h, count]) => {
    console.log(`${h}: ${count} uses in ${fileUsage[h].size} files`);
});

