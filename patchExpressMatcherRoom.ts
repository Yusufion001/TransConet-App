import fs from 'fs';
let content = fs.readFileSync('src/components/ExpressMatcher.tsx', 'utf-8');

const hookFix = `  useEffect(() => {
    if (!socket || !activeMatch) return;
    socket.emit('join_load', activeMatch.id);
  }, [socket, activeMatch]);
`;

if (!content.includes("socket.emit('join_load', activeMatch.id);")) {
  content = content.replace("  const [matchOptions, setMatchOptions] = useState<any[]>([]);", hookFix + "\n  const [matchOptions, setMatchOptions] = useState<any[]>([]);");
  fs.writeFileSync('src/components/ExpressMatcher.tsx', content);
  console.log("Patched ExpressMatcher room");
}
