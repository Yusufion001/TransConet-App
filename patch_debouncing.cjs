const fs = require('fs');
let code = fs.readFileSync('src/components/LocationAutocomplete.tsx', 'utf8');

const debounceImport = "import React, { useState, useEffect, useRef, useCallback } from 'react';";
code = code.replace("import React, { useState, useEffect, useRef } from 'react';", debounceImport);

const replacement = `
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
`;

code = code.replace(/const handleInputChange = async \(e: React.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?};/, replacement.trim());

fs.writeFileSync('src/components/LocationAutocomplete.tsx', code);
console.log('Patched LocationAutocomplete.tsx for debouncing.');
