import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingNavHub.tsx', 'utf-8');

content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useNavigate, useLocation } from 'react-router-dom';");

content = content.replace("export interface FloatingNavHubProps {\n  activeView: string;\n  setActiveView: (view: string) => void;\n  isAdminAuthorized: boolean;\n  onLogout: () => void;\n}", "export interface FloatingNavHubProps {\n  isAdminAuthorized: boolean;\n  onLogout: () => void;\n}");

content = content.replace("export function FloatingNavHub({ activeView, setActiveView, isAdminAuthorized, onLogout }: FloatingNavHubProps) {", "export function FloatingNavHub({ isAdminAuthorized, onLogout }: FloatingNavHubProps) {\n  const navigate = useNavigate();\n  const location = useLocation();\n  const activeView = location.pathname.substring(1) || 'dashboard';\n  const setActiveView = (v: string) => navigate('/' + v);");

fs.writeFileSync('src/components/FloatingNavHub.tsx', content);
