const fs = require('fs');

let content = fs.readFileSync('src/components/TrackingView.tsx', 'utf8');

// Add provider state
if (!content.includes('const [paymentProvider, setPaymentProvider]')) {
  content = content.replace(
    'if (!acceptedJob) return null;',
    `const [paymentProvider, setPaymentProvider] = React.useState('paystack');\n  if (!acceptedJob) return null;`
  );
}

// Add firebase imports
if (!content.includes('import { functions }')) {
  content = content.replace(
    "import { Button } from './ui/Button';",
    "import { Button } from './ui/Button';\nimport { functions } from '../utils/firebase';\nimport { httpsCallable } from 'firebase/functions';"
  );
}

// Replace the Fund Escrow button block
const fundEscrowBlock = `{acceptedJob.isEscrowEnabled && acceptedJob.status === 'QUOTE_ACCEPTED' && detailsProvided && acceptedJob.paymentStatus !== 'PAID' && (
          <Button 
            onClick={async () => {
              setAcceptedJob({ ...acceptedJob, paymentStatus: 'PAID' });
              try {
                await api.post('/payments/initialize-escrow', { loadId: String(activeMatch?.id || acceptedJob?.id || ''), amount: activeMatch?.price || 50000 });
              } catch (e) { console.error(e); }
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
          >
            Fund Escrow
          </Button>
        )}`;

const newFundEscrowBlock = `{acceptedJob.isEscrowEnabled && acceptedJob.status === 'QUOTE_ACCEPTED' && detailsProvided && acceptedJob.paymentStatus !== 'PAID' && (
          <div className="flex items-center gap-2">
            <select 
              value={paymentProvider} 
              onChange={(e) => setPaymentProvider(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900"
            >
              <option value="paystack">Paystack</option>
              <option value="flutterwave">Flutterwave</option>
            </select>
            <Button 
              onClick={async () => {
                setAcceptedJob({ ...acceptedJob, paymentStatus: 'PAID' });
                try {
                  if (paymentProvider === 'flutterwave') {
                    const initFlutterwave = httpsCallable(functions, 'initializeFlutterwavePayment');
                    const result = await initFlutterwave({ 
                      loadId: String(activeMatch?.id || acceptedJob?.id || ''), 
                      amount: activeMatch?.price || 50000,
                      email: localStorage.getItem('userEmail') || 'customer@example.com'
                    });
                    console.log('Flutterwave init:', result);
                    if ((result.data as any)?.authorizationUrl) {
                      window.location.href = (result.data as any).authorizationUrl;
                    }
                  } else {
                    await api.post('/payments/initialize-escrow', { loadId: String(activeMatch?.id || acceptedJob?.id || ''), amount: activeMatch?.price || 50000 });
                  }
                } catch (e) { console.error(e); }
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
            >
              Fund Escrow
            </Button>
          </div>
        )}`;

if (content.includes(fundEscrowBlock)) {
  content = content.replace(fundEscrowBlock, newFundEscrowBlock);
  fs.writeFileSync('src/components/TrackingView.tsx', content);
  console.log('Patched TrackingView.tsx');
} else {
  console.log('Could not find Fund Escrow block');
}
