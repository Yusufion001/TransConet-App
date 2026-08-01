const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  try {
    const { data, error } = await resend.apiKeys.list();
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('API Key is valid. Data:', data);
    }
  } catch (err) {
    console.log('Exception:', err.message);
  }
}
test();
