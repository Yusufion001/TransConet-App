import fs from 'fs';
let content = fs.readFileSync('src/components/ExpressMatcher.tsx', 'utf-8');

if (!content.includes("import { io, Socket } from 'socket.io-client';")) {
  content = "import { io, Socket } from 'socket.io-client';\n" + content;
}

const socketHookCode = `  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      withCredentials: true
    });
    setSocket(newSocket);
    
    // We listen globally for load_bids_updated
    newSocket.on('connect', () => {
       console.log('ExpressMatcher Socket connected');
    });
    
    // When any load bid updates, if it matches our active match, we might refresh
    newSocket.on('load_bids_updated', (data: any) => {
       console.log('load_bids_updated', data);
       // We can trigger a refresh if we wanted to
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, []);
`;

if (!content.includes('const [socket, setSocket]')) {
  // Find where ExpressMatcher starts
  const searchStr = "export default function ExpressMatcher({ initialMode = 'SHIPPER', initialSubMode = 'JOBS' }: ExpressMatcherProps = {}) {";
  content = content.replace(searchStr, searchStr + "\n" + socketHookCode);
  
  fs.writeFileSync('src/components/ExpressMatcher.tsx', content);
  console.log("Patched ExpressMatcher");
} else {
  console.log("ExpressMatcher already patched");
}
