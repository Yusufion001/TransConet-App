const fs = require('fs');
const file = 'src/components/DeepSapphireDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import { FindMarketLoadsCard")) {
  code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { FindMarketLoadsCard, MyShipmentsCard, BoostLoadCard, TrackShipmentCard } from './DashboardCards';");
}

if (!code.includes("const handleTrackingRequest")) {
  const handler = `
  const handleTrackingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waybillInput.trim()) {
      setTrackingError('Please enter a valid Waybill or Trip ID.');
      return;
    }
    setIsTracking(true);
    setTrackingError('');
    // Simulate network delay
    setTimeout(() => {
      setIsTracking(false);
      setShowLiveMap(waybillInput);
      setWaybillInput('');
    }, 1500);
  };
`;
  code = code.replace("const [engineStatus, setEngineStatus] = useState(NativeTrackingEngine.getStatus());", "const [engineStatus, setEngineStatus] = useState(NativeTrackingEngine.getStatus());\n" + handler);
}

fs.writeFileSync(file, code);
