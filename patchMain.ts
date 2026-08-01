import fs from 'fs';
let content = fs.readFileSync('src/main.tsx', 'utf-8');

if (!content.includes('BrowserRouter')) {
  content = content.replace(
    "import { AuthProvider } from './context/AuthContext';",
    "import { AuthProvider } from './context/AuthContext';\nimport { BrowserRouter } from 'react-router-dom';"
  );
  content = content.replace(
    "<AuthProvider>",
    "<BrowserRouter>\n      <AuthProvider>"
  );
  content = content.replace(
    "</AuthProvider>",
    "</AuthProvider>\n    </BrowserRouter>"
  );
  fs.writeFileSync('src/main.tsx', content);
}
