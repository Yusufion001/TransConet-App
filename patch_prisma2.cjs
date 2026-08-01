const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Add @@schema("public") to all models and enums
const lines = code.split('\n');
const newLines = [];
let insideModel = false;
let insideEnum = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith('model ')) {
    insideModel = true;
  } else if (line.startsWith('enum ')) {
    insideEnum = true;
  } else if ((insideModel || insideEnum) && line.startsWith('}')) {
    newLines.push('  @@schema("public")');
    insideModel = false;
    insideEnum = false;
  }
  newLines.push(line);
}

fs.writeFileSync('prisma/schema.prisma', newLines.join('\n'));
