const fs = require('fs');
let code = fs.readFileSync('src/components/AdminAIAutomation.tsx', 'utf8');

const importAdd = `import React, { useState } from 'react';\nimport { Bot, Sparkles, Brain, Zap, Settings, Activity, Power, BarChart, ChevronRight, Loader2, Info } from 'lucide-react';`;
code = code.replace(/import React, { useState } from 'react';\nimport {.*lucide-react';/, importAdd);

const newStates = `  const [models, setModels] = useState<AIModel[]>(MOCK_MODELS);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);

  const generateInsights = async () => {
    try {
      setLoadingInsights(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/ai-insights', {
        headers: {
          'Authorization': \`Bearer \${token}\`
        }
      });
      const data = await response.json();
      setInsights(data.insights || 'No insights available.');
    } catch (error) {
      console.error(error);
      setInsights('Failed to fetch insights.');
    } finally {
      setLoadingInsights(false);
    }
  };`;

code = code.replace(/  const \[models, setModels\] = useState<AIModel\[\]>\(MOCK_MODELS\);\n  const \[selectedModel, setSelectedModel\] = useState<AIModel \| null>\(null\);/, newStates);

const buttonAdd = `        </div>
        <button onClick={generateInsights} disabled={loadingInsights} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
          {loadingInsights ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          Generate AI Insights
        </button>
      </div>
      
      {insights && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm animate-fade-in flex items-start gap-4">
           <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl mt-1 shrink-0">
              <Info size={20} />
           </div>
           <div>
              <h3 className="font-bold text-indigo-900 mb-1">Generated Analytical Insights</h3>
              <p className="text-sm text-indigo-800 whitespace-pre-wrap">{insights}</p>
           </div>
        </div>
      )}`;

code = code.replace(/        <\/div>\n      <\/div>/, buttonAdd);

fs.writeFileSync('src/components/AdminAIAutomation.tsx', code);
