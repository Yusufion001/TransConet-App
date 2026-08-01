const fs = require('fs');
let code = fs.readFileSync('src/components/RouteDistanceCalculator.tsx', 'utf8');

code = code.replace(
  /const \{ routes \} = await routesLib\.Route\.computeRoutes\(\{[\s\S]*?fields: \['distanceMeters', 'durationMillis'\]\s*\}\);/,
  `const request: any = {
          travelMode: 'DRIVING',
          fields: ['distanceMeters', 'durationMillis']
        };
        
        // Handle origin and destination as place IDs or query strings
        // In the Routes API, we pass Place objects or string addresses inside the 'origin' and 'destination' objects
        // However, the JS SDK often accepts plain strings for address routing, or we can use the DirectionsService as a robust fallback.
        
        const { routes } = await routesLib.Route.computeRoutes({
          origin: typeof origin === 'string' ? origin : { address: origin },
          destination: typeof destination === 'string' ? destination : { address: destination },
          travelMode: 'DRIVING',
          fields: ['distanceMeters', 'durationMillis']
        });`
);

fs.writeFileSync('src/components/RouteDistanceCalculator.tsx', code);
