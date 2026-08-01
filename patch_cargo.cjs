const fs = require('fs');
let code = fs.readFileSync('src/components/CargoDetailsForm.tsx', 'utf8');

const replacement = `      setSubmitSuccess(\`Consignment posted successfully to Supabase database! (Load ID: \${response.load?.id || 'Created'})\`);
      
      let basePrice = budget;
      let aiReasoning = null;
      let aiMatches = null;
      
      try {
        if (response.load?.id) {
           const token = localStorage.getItem('auth_token');
           const headers = { 'Content-Type': 'application/json', ...(token ? { 'Authorization': \`Bearer \${token}\` } : {}) };
           
           // Fetch AI optimized price
           const optRes = await fetch(\`/api/loads/\${response.load.id}/optimize-price\`, { method: 'POST', headers });
           if (optRes.ok) {
              const optData = await optRes.json();
              if (optData.optimizedPrice) {
                 basePrice = optData.optimizedPrice;
                 aiReasoning = optData.reasoning;
              }
           }
           
           // Fetch AI auto-matches
           const matchRes = await fetch(\`/api/loads/\${response.load.id}/auto-match\`, { method: 'POST', headers });
           if (matchRes.ok) {
              const matchData = await matchRes.json();
              aiMatches = matchData.matches;
           }
        }
      } catch (err) {
        console.error('AI optimization failed:', err);
      }
      
      setSubmitSuccess(
         \`Consignment posted successfully! (Load ID: \${response.load?.id || 'Created'})\` +
         (aiReasoning ? \`\\nAI Pricing Insight: \${aiReasoning}\` : '') +
         (aiMatches && aiMatches.length > 0 ? \`\\nAI Matched Driver: \${aiMatches[0].driverId} (Score: \${aiMatches[0].matchScore}%)\` : '')
      );

      setCalculatedOptions([`;

code = code.replace(/      setSubmitSuccess\(`Consignment posted successfully to Supabase database! \(Load ID: \$\{response.load\?\.id \|\| 'Created'\}\)`\);\n      const basePrice = budget;\n      setCalculatedOptions\(\[/, replacement);

fs.writeFileSync('src/components/CargoDetailsForm.tsx', code);
