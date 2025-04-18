// frontend/src/services/authService.js
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://0.0.0.0:8000/accounts',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginUser = async (data) => {
  try {
    const response = await api.post('login/', data);
    const { access_token } = response.data;
    localStorage.setItem('auth_token', access_token);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const registerUser = async (data) => {
  try {
    const response = await api.post('register/', data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const verifyOTP = async (data) => {
  try {
    const response = await api.post('verify/', data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getUserDetails = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await api.get('user/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
