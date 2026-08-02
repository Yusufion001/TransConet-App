import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, CheckCircle, Search, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface LocationAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, details?: { lat?: number; lng?: number; placeId?: string }) => void;
  iconColor?: string;
  required?: boolean;
  className?: string;
}

export default function LocationAutocomplete({
  label,
  placeholder = 'Enter city, state or address (e.g., Apapa Port, Lagos)',
  value,
  onChange,
  iconColor = 'text-brand-500',
  required = false,
  className = ''
}: LocationAutocompleteProps) {
  const placesLib = useMapsLibrary('places');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
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

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPredictions = async (query: string) => {
    if (!placesLib) return;
    
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
          const globalRes = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({ 
             input: query, 
             sessionToken: sessionTokenRef.current 
          });
          results = globalRes.suggestions || [];
      }
      
      setPredictions(results);
      setIsOpen(results.length > 0);
    } catch (err: any) {
      if (err?.message?.includes('Places API (New) has not been used')) {
         setApiError('Places API (New) is not enabled. Please enable it in Google Cloud Console.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    const query = e.target.value;
    onChange(query);
    
    if (!query || query.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setIsLoading(true);
    debounceTimeoutRef.current = setTimeout(() => {
      fetchPredictions(query);
    }, 500);
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
          // console.error('Place details error:', err);
       }
    }
  };

  return (
    <div ref={containerRef} className={`space-y-2 relative ${className}`}>
      {label && (
        <label className="text-sm font-bold text-slate-800 dark:text-slate- flex items-center justify-between">
          <span className="flex items-center gap-2">
            {label} <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">Google Maps Autocomplete</span>
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => { if (predictions.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          required={required}
          className="w-full bg-white dark:bg-slate-900 p-4 pr-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate- text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="animate-spin text-brand-500" size={18} />
          ) : (
            <MapPin className={iconColor} size={20} />
          )}
        </div>
      </div>
      {apiError && (
        <div className="text-xs text-rose-500 font-bold mt-1 absolute -bottom-5 left-0">
          {apiError && apiError !== null && typeof apiError === 'object' ? ((apiError as any).message || JSON.stringify(apiError)) : apiError}
        </div>
      )}
      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 top-[calc(100%+0.5rem)] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
          {predictions.map((p) => (
            <Button
              type="button"
              key={p.placePrediction?.placeId || Math.random()}
              onClick={() => handleSelectPrediction(p)}
              className="w-full text-left p-3.5 hover:bg-brand-50 cursor-pointer hover:shadow-sm border-b border-slate-100 dark:border-slate-800 last:border-none flex items-start gap-3 transition-colors cursor-pointer"
            >
              <MapPin className="text-brand-500 mt-0.5 shrink-0" size={16} />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {typeof p.placePrediction?.text === 'string' 
                    ? p.placePrediction.text 
                    : (p.placePrediction?.text?.text || p.description || p.name || 'Unknown Location')}
                </p>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
