import fs from 'fs';
let content = fs.readFileSync('src/controllers/authController.ts', 'utf-8');

// We need to add the Set-Cookie headers in the responses
content = content.replace(
  /return res.status\(200\).json\(\{\s*message: 'Identity authenticated successfully.',\s*token,\s*user\s*\}\);/g,
  `res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({
      message: 'Identity authenticated successfully.',
      token,
      user
    });`
);

content = content.replace(
  /return res.status\(200\).json\(\{\s*message: \`Switched view to \$\{role\} successfully.\`, token \}\);/g,
  `res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      return res.status(200).json({ message: \`Switched view to \$\{role\} successfully.\`, token });`
);

content = content.replace(
  /return res.status\(200\).json\(\{\s*message: \`Role updated to \$\{role\} successfully.\`, token \}\);/g,
  `res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ message: \`Role updated to \$\{role\} successfully.\`, token });`
);

content = content.replace(
  /return res.status\(200\).json\(\{\s*message: 'PIN Authenticated successfully.',\s*token,\s*user\s*\}\);/g,
  `res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({
      message: 'PIN Authenticated successfully.',
      token,
      user
    });`
);

content = content.replace(
  /return res.status\(200\).json\(\{\s*message: 'Account registered and 6-digit PIN set successfully.',\s*token,\s*user\s*\}\);/g,
  `res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({
      message: 'Account registered and 6-digit PIN set successfully.',
      token,
      user
    });`
);

// We need to add a logout endpoint if it doesn't exist. Wait, the frontend handles logout by clearing localStorage right now.
// Let's add a logout route to clear the cookie.
if (!content.includes('export const logout =')) {
  content += `\nexport const logout = async (req: Request, res: Response): Promise<any> => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
};\n`;
}

fs.writeFileSync('src/controllers/authController.ts', content);
