const fs = require('fs');
let code = fs.readFileSync('src/components/ExpressMatcher.tsx', 'utf8');

code = code.replace(
  "import api from '../api/client';",
  "import api from '../api/client';\nimport { useApi } from '../hooks/useApi';"
);

code = code.replace(
  "const [isLoading, setIsLoading] = useState(false);",
  "const { request, loading: isLoading } = useApi();"
);

// We shouldn't do direct replacement of setIsLoading everywhere if we just replaced it.
// Actually, `useApi` handles loading automatically! But the component might use `setIsLoading(true)` manually.
// So let's not break it if I don't see the full file.
