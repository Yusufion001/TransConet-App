import fs from 'fs';
let content = fs.readFileSync('src/controllers/bidController.ts', 'utf-8');

if (!content.includes('import { getIO } from')) {
  content = "import { getIO } from '../socket';\n" + content;
}

const emitCode = `
const emitToLoad = (loadId: string, event: string, data: any) => {
  try {
    getIO().to(\`load_\${loadId}\`).emit(event, data);
  } catch(e) { console.error('Socket emit failed:', e.message); }
};
`;

content = content.replace("export const placeBid", emitCode + "\nexport const placeBid");

content = content.replace(
  "return res.status(201).json({",
  "emitToLoad(loadId, 'load_bids_updated', { loadId });\n    return res.status(201).json({"
);

content = content.replace(
  "return res.status(200).json({\n      message: 'Bid status successfully modified.',\n      bid: updatedBid\n    });",
  "emitToLoad(updatedBid.loadId, 'load_bids_updated', { loadId: updatedBid.loadId });\n    return res.status(200).json({\n      message: 'Bid status successfully modified.',\n      bid: updatedBid\n    });"
);

fs.writeFileSync('src/controllers/bidController.ts', content);
