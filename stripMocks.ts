import fs from 'fs';
import path from 'path';

const controllersDir = path.join('.', 'src', 'controllers');

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Quick regex to strip basic mockData imports and usages if any
  content = content.replace(/const mockData = \[[\s\S]*?\];\n\n/g, '');
  content = content.replace(/const mockData.*?\n/g, '');
  
  // Simple regex replacement for if (!prisma) { ... }
  // This is a bit tricky to do perfectly with regex because of nested braces.
  // We'll just do it recursively for specific known patterns.
  
  while (true) {
    const startIndex = content.indexOf('if (!prisma)');
    if (startIndex === -1) break;
    
    // Find the opening brace
    const openBraceIndex = content.indexOf('{', startIndex);
    if (openBraceIndex === -1) break; // Should not happen
    
    // Find matching closing brace
    let braceCount = 1;
    let closeBraceIndex = -1;
    for (let i = openBraceIndex + 1; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') braceCount--;
      if (braceCount === 0) {
        closeBraceIndex = i;
        break;
      }
    }
    
    if (closeBraceIndex !== -1) {
      // Also remove optional 'else {' block if it follows immediately
      const afterBlock = content.substring(closeBraceIndex + 1).trimStart();
      if (afterBlock.startsWith('else {')) {
        const elseIndex = content.indexOf('else {', closeBraceIndex);
        content = content.substring(0, startIndex) + content.substring(elseIndex + 6);
        
        // Find the new closing brace for the else block and remove it
        // Actually, replacing `if (!prisma) { ... } else {` with just the contents of else is easier.
      } else {
        // Just remove the if block
        content = content.substring(0, startIndex) + content.substring(closeBraceIndex + 1);
      }
    } else {
      break; // Malformed
    }
  }

  // Remove `!prisma ||`
  content = content.replace(/if \(!ai \|\| !prisma\) \{/g, 'if (!ai) {');
  
  // Wait, if it was `if (!prisma)` with a `return`, it just returns early. So we just remove the whole block.
  
  fs.writeFileSync(filePath, content);
}

const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.ts'));
for (const file of files) {
  processFile(path.join(controllersDir, file));
}
