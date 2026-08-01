const fs = require('fs');
let code = fs.readFileSync('src/components/RouteDistanceCalculator.tsx', 'utf8');

// Replace the console.error and add an error state update
code = code.replace(
  /console\.error\('Routes API Error:', err\);/,
  `console.warn('Routes API failed or no routes. Using fallback.');
         setError(err?.message || 'Failed to calculate route. Using offline estimates.');`
);

// Display the error if it exists
code = code.replace(
  /\{routeInfo \? \(/,
  `{error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      {routeInfo ? (`
);

fs.writeFileSync('src/components/RouteDistanceCalculator.tsx', code);
