const fs = require('fs');
const glob = require('glob');

const files = glob.sync('frontend/src/**/*.{tsx,ts}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // 1. Remove gradients on text
  content = content.replace(/bg-clip-text text-transparent bg-gradient-to-[a-z]+ from-([a-z0-9-]+) to-([a-z0-9-]+)/g, 'text-$1');
  
  // 2. Remove other gradients
  content = content.replace(/bg-gradient-to-[a-z]+ from-([a-z0-9-]+) to-([a-z0-9-]+)/g, 'bg-$1');

  // 3. Replace color aliases as requested: yellow->amber, rose->red
  content = content.replace(/rose-([0-9]+)/g, 'red-$1');
  content = content.replace(/yellow-([0-9]+)/g, 'amber-$1');

  // 4. Ensure overflow-hidden on common card containers to prevent clipping
  // Specifically look for `rounded-[20px]`, `rounded-2xl`, `rounded-[32px]` with a shadow and add overflow-hidden if missing
  content = content.replace(/className="([^"]*)rounded-(2xl|3xl|xl|\[20px\]|\[32px\]|\[24px\])([^"]*)shadow([^"]*)"/g, (match, p1, p2, p3, p4) => {
    if (!p1.includes('overflow-hidden') && !p3.includes('overflow-hidden') && !p4.includes('overflow-hidden') && !p1.includes('overflow-visible') && !p3.includes('overflow-visible')) {
      return `className="${p1}rounded-${p2}${p3}shadow${p4} overflow-hidden"`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
