# TransConet Uber-Standard Frontend

A separate phone-first frontend for the existing TransConet backend. The existing `frontend/` is intentionally untouched.

## Run

```bash
cd frontend-uber
npm install
npm run dev
```

Set `VITE_API_URL` to the backend origin when the frontend is deployed separately. The client automatically uses `/api` when no value is supplied.

## Current integration

- Existing `/auth/login-pin` authentication
- Existing `/loads/my-loads` and `/loads/marketplace`
- Existing `/loads/create`
- Existing `tc_token` authentication storage
- Mobile-first shipper home, shipment list, and shipment creation

The next iterations can add tracking, bids, payments, notifications, transporter mode, maps, and profile/KYC against the existing routes without replacing the backend.
