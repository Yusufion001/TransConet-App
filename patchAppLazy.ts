import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace("import AdminVerificationFeed from './components/AdminVerificationFeed';", "const AdminVerificationFeed = lazy(() => import('./components/AdminVerificationFeed'));");
content = content.replace("import TransporterFleetDashboard from './components/TransporterFleetDashboard';", "const TransporterFleetDashboard = lazy(() => import('./components/TransporterFleetDashboard'));");
content = content.replace("import SupportChatWidget from './components/SupportChatWidget';", "const SupportChatWidget = lazy(() => import('./components/SupportChatWidget'));");

fs.writeFileSync('src/App.tsx', content);
