// src/services/smsService.ts
import crypto from 'crypto';

/**
 * Generates a secure 6-digit numeric OTP string
 */
export const generateSecureOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Sends a transactional SMS string to a specified Nigerian phone number
 */
export const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
  // Format phone number to national standard if necessary (e.g., ensure +234 or 234 format)
  let formattedNumber = phoneNumber.trim();
  if (formattedNumber.startsWith('0')) {
    formattedNumber = '+234' + formattedNumber.substring(1);
  } else if (!formattedNumber.startsWith('+')) {
    formattedNumber = '+' + formattedNumber;
  }

  try {
    // Mock SMS provider
    console.log(`Mock SMS to ${formattedNumber}: ${message}`);
    return true;
  } catch (error) {
    console.error('SMS Provider Handshake Failed:', error);
    return false;
  }
};
