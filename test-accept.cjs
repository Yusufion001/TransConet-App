const axios = require('axios');
async function run() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:3000/api' });
    
    // fetch csrf
    const csrfRes = await api.get('/csrf-token');
    const csrfToken = csrfRes.data.csrfToken;
    api.defaults.headers['CSRF-Token'] = csrfToken;
    
    // Login as admin
    const loginRes = await api.post('/auth/login-pin', {
      phoneNumber: '08031746898', // customer
      pin: '123456' // hope this works
    }).catch(e => e.response);
    
    if (loginRes.status !== 200) {
      console.log("Login failed", loginRes.data);
      return;
    }
    
    const token = loginRes.data.token;
    api.defaults.headers['Authorization'] = 'Bearer ' + token;
    
    // Get my loads
    const loadsRes = await api.get('/loads/my-loads');
    const loads = loadsRes.data.loads;
    console.log("My loads count:", loads.length);
    
    if (loads.length > 0) {
        console.log("First load:", loads[0].id);
        if (loads[0].bids && loads[0].bids.length > 0) {
            console.log("Accepting bid:", loads[0].bids[0].id);
            const res = await api.post('/bids/accept', { bidId: loads[0].bids[0].id }).catch(e => e.response);
            console.log("Accept bid response:", res.status, res.data);
        } else {
            console.log("No bids on this load.");
        }
    }
  } catch (err) {
    console.error(err.message);
  }
}
run();
