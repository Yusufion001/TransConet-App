with open('src/components/AdminPortalGenerator.tsx', 'r') as f:
    content = f.read()

content = content.replace("requestAdminAccess()", "handleElevateToAdmin()")
content = content.replace("dropAdminAccess", "handleElevateToAdmin")
content = content.replace("injectMockData", "handleSeedMockData")
content = content.replace("handleSendBroadcast", "handleCreateBroadcast")

with open('src/components/AdminPortalGenerator.tsx', 'w') as f:
    f.write(content)

