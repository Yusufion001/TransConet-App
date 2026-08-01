const fs = require('fs');
let content = fs.readFileSync('src/components/AdminMarketingCenter.tsx', 'utf8');

content = content.replace(/campaign\.spent \/ campaign\.budget/g, 'Number(campaign.spent) / Number(campaign.budget)');
content = content.replace(/campaign\.spent > 0/g, 'Number(campaign.spent) > 0');
content = content.replace(/campaign\.spent \/ campaign\.conversions/g, 'Number(campaign.spent) / Number(campaign.conversions)');

fs.writeFileSync('src/components/AdminMarketingCenter.tsx', content);
