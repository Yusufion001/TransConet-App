import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('fetchCsrfToken')) {
  content = content.replace("export default function App() {", "import { fetchCsrfToken } from './api/client';\n\nexport default function App() {");
  
  // add an effect to fetch csrf token
  content = content.replace("  useEffect(() => {\n    const handleResize = () => {", "  useEffect(() => {\n    fetchCsrfToken();\n  }, []);\n\n  useEffect(() => {\n    const handleResize = () => {");
  fs.writeFileSync('src/App.tsx', content);
}
