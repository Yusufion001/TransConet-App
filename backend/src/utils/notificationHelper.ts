import api from '../api/client';

export const triggerHaulageNotification = async (driverPhone: string, loadDetails: any) => {
  let formattedPhone = driverPhone ? driverPhone.replace(/\D/g, '') : '';
  
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '+234' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('234')) {
    formattedPhone = '+' + formattedPhone;
  } else if (formattedPhone && !formattedPhone.startsWith('+')) {
    formattedPhone = '+234' + formattedPhone;
  }

  const payload = {
    driverPhone: formattedPhone,
    loadDetails
  };

  try {
    console.log('[Notification Gateway] Dispatching API request...');
    const response = await api.post('/notifications/haulage', payload);
    console.log('[Notification Gateway] Notification triggered successfully:', response.data);
  } catch (error) {
    console.error('Error triggering notification via API', error);
  }

  return payload;
};
