import fs from 'fs';
let content = fs.readFileSync('src/routes/authRoutes.ts', 'utf-8');

const replacement = `const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  keyGenerator: (req, res) => {
    return req.body.phoneNumber || req.ip;
  },
  message: { error: 'Too many OTP requests for this phone number, please try again after 10 minutes.' }
});`;

content = content.replace(/const otpLimiter = rateLimit\(\{[\s\S]*?\}\);/m, replacement);

fs.writeFileSync('src/routes/authRoutes.ts', content);
