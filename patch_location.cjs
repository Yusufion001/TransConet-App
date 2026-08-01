const fs = require('fs');
let code = fs.readFileSync('src/components/LocationAutocomplete.tsx', 'utf8');

const newHookAndLogic = `  const placesLib = useMapsLibrary('places');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sessionTokenRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);
    
    if (!query || query.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }
    
    if (placesLib) {
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
      }
      
      setIsLoading(true);
      try {
        const request = {
          input: query,
          includedRegionCodes: ['ng'], // Default to Nigeria
          sessionToken: sessionTokenRef.current
        };
        const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        let results = res.suggestions || [];
        
        if (results.length === 0) {
            // Fallback for global addresses if restricted query returns no results
            const globalRes = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
               input: query,
               sessionToken: sessionTokenRef.current
            });
            results = globalRes.suggestions || [];
        }
        
        setPredictions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectPrediction = async (prediction: any) => {
    const placePrediction = prediction.placePrediction;
    if (!placePrediction) return;
    
    const address = placePrediction.text.text;
    const placeId = placePrediction.placeId;
    
    onChange(address, { placeId });
    setIsOpen(false);
    
    if (placesLib && placeId) {
       try {
          const place = new placesLib.Place({ id: placeId });
          await place.fetchFields({ fields: ['location', 'formattedAddress'] });
          
          // Reset session
          sessionTokenRef.current = null;
          
          if (place.location) {
             onChange(place.formattedAddress || address, {
               lat: place.location.lat(),
               lng: place.location.lng(),
               placeId
             });
          }
       } catch (err) {
          console.error('Place details error:', err);
       }
    }
  };`;

// replace everything between const placesLib = ... and return (
const startPattern = /  const placesLib = useMapsLibrary\('places'\);[\s\S]*?(?=  return \()/;
code = code.replace(startPattern, newHookAndLogic);

// also replace the map rendering
code = code.replace(
  /key=\{p\.place_id\}.*?handleSelectPrediction\(p\).*?\{p\.structured_formatting\?\.main_text \|\| p\.description\}.*?\{p\.structured_formatting\?\.secondary_text \|\| ''\}/s,
  `key={p.placePrediction?.placeId || Math.random()}
              onClick={() => handleSelectPrediction(p)}
              className="w-full text-left p-3.5 hover:bg-slate-50 border-b border-slate-100 last:border-none flex items-start gap-3 transition-colors cursor-pointer"
            >
              <MapPin className="text-blue-500 mt-0.5 shrink-0" size={16} />
              <div>
                <p className="text-xs font-bold text-slate-900">{p.placePrediction?.text?.text || p.placePrediction?.text || ''}</p>
                <p className="text-[11px] text-slate-500"></p>`
);

fs.writeFileSync('src/components/LocationAutocomplete.tsx', code);
