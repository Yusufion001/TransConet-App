const axios = require('axios');

async function test() {
  try {
    const { data } = await axios.get('http://localhost:3000/api/csrf-token');
    const csrfToken = data.csrfToken;
    const cookie = data.headers ? data.headers['set-cookie'] : undefined; // we can't get cookie from axios easily without catching it

    console.log("CSRF", csrfToken);
  } catch (e) {
    console.error(e.message);
  }
}
test();
