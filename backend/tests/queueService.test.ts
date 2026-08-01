
import { describe, it, expect, vi } from 'vitest';
import { enqueueSMS, enqueueEmail } from '../src/services/queueService';

vi.mock('../src/services/smsService', () => ({
  sendSMS: vi.fn().mockResolvedValue(true)
}));

vi.mock('../src/services/emailService', () => ({
  sendEmailAlert: vi.fn().mockResolvedValue(undefined)
}));

describe('Queue Service', () => {
  it('should enqueue SMS successfully', async () => {
    const success = await enqueueSMS('1234567890', 'Test message');
    expect(success).toBe(true);
  });
  it('should enqueue Email successfully', async () => {
    const success = await enqueueEmail('test@example.com', 'Subject', '<p>HTML</p>');
    expect(success).toBe(true);
  });
});
