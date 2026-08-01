const fs = require('fs');
let content = fs.readFileSync('src/components/AdminNotificationCenter.tsx', 'utf8');

content = content.replace(/const \{ data: notificationData, loading, mutate \} = useAdminLiveData/, 'const { data: notificationData, loading, refetch } = useAdminLiveData');
content = content.replace(/mutate\(\); \/\/ Refresh the list/, 'refetch(); // Refresh the list');
content = content.replace(/onClick=\{.*?mutate\(\).*?\}/g, 'onClick={() => refetch()}');

fs.writeFileSync('src/components/AdminNotificationCenter.tsx', content);
