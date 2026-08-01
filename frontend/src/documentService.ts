import axios from 'axios';

// Replace with your actual backend URL
const API_URL = '/api'; 

export const uploadDriverDocuments = async (token: string, formData: FormData) => {
  try {
      const response = await axios.post(`${API_URL}/fleet/upload-docs`, formData, {
            headers: {
                    'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                                  },
                                      });
                                          return response.data;
                                            } catch (error: any) {
                                                console.error('Error uploading driver documents:', error.response?.data || error.message);
                                                    throw error;
                                                      }
                                                      };
                                                      