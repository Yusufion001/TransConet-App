import { Resend } from 'resend';

// Only initialize if RESEND_API_KEY is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendEmailAlert = async (to: string, subject: string, html: string) => {
  if (!resend) {
    console.warn(`[EMAIL WARNING] Email sending bypassed. RESEND_API_KEY is missing. Would have sent to ${to}: ${subject}`);
    return { id: `sim-${Date.now()}` };
  }

  // Gracefully mock test domains to prevent sandbox validation errors
  if (to.includes('@example.com') || to.includes('@test.com') || to.includes('@testing.com')) {
    console.log(`[EMAIL SIMULATED] Simulated email sent to sandbox address ${to}: ${subject}`);
    return { id: `sim-${Date.now()}` };
  }

  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'notifications@transconet.com';

  try {
    const data = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html,
    });
    
    if (data.error) {
       console.error('[EMAIL ERROR] Resend returned error:', data.error);
       throw new Error(`Failed to send email: ${data.error.message}`);
    }

    return data;
  } catch (error) {
    console.error(`[EMAIL FATAL] Error sending email to ${to}:`, error);
    throw error;
  }
};
