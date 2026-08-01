const fs = require('fs');
let code = fs.readFileSync('src/components/LocationAutocomplete.tsx', 'utf8');

// Add error state
code = code.replace(
  /const \[isOpen, setIsOpen\] = useState\(false\);/,
  `const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);`
);

// Clear error on input
code = code.replace(
  /const handleInputChange = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{/,
  `const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);`
);

// Catch block
code = code.replace(
  /\} catch \(err\) \{\s*console\.error\('Autocomplete error:', err\);\s*\}\s*finally \{/m,
  `} catch (err: any) {
        console.error('Autocomplete error:', err);
        if (err?.message?.includes('Places API (New) has not been used')) {
           setApiError('Places API (New) is not enabled. Please enable it in Google Cloud Console.');
        }
      } finally {`
);

// Render error
code = code.replace(
  /\{isOpen && predictions\.length > 0 && \(/,
  `{apiError && (
        <div className="text-xs text-rose-500 font-bold mt-1 absolute -bottom-5 left-0">
          {apiError}
        </div>
      )}
      {isOpen && predictions.length > 0 && (`
);

fs.writeFileSync('src/components/LocationAutocomplete.tsx', code);
