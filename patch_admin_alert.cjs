const fs = require('fs');
let content = fs.readFileSync('src/components/AdminAlertCenter.tsx', 'utf8');

// replace scanError render
content = content.replace(/<span>\{scanError\}<\/span>/, '<span>{scanError?.message || scanError.toString()}</span>');

// replace mutate with refetch
content = content.replace(/const \{ data: rawData, loading, error, mutate \} = useAdminLiveData/, 'const { data: rawData, loading, error, refetch } = useAdminLiveData');
content = content.replace(/onClick=\{.*?mutate\(\).*?\}/g, 'onClick={() => refetch()}');

fs.writeFileSync('src/components/AdminAlertCenter.tsx', content);
