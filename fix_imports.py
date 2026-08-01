with open('src/components/AdminPortalGenerator.tsx', 'r') as f:
    content = f.read()

# Remove the broken imports inside the curly braces
broken_imports = """import AdminLiveTrips from './AdminLiveTrips';
import AdminDisputes from './AdminDisputes';
import AdminAnalytics from './AdminAnalytics';
import AdminUserManagement from './AdminUserManagement';
"""

content = content.replace(broken_imports, "")

# Add them at the top
imports = """import AdminLiveTrips from './AdminLiveTrips';
import AdminDisputes from './AdminDisputes';
import AdminAnalytics from './AdminAnalytics';
import AdminUserManagement from './AdminUserManagement';
"""
content = imports + content

with open('src/components/AdminPortalGenerator.tsx', 'w') as f:
    f.write(content)

