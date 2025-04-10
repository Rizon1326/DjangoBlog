// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:8000/accounts',  // Backend API URL
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export const registerUser = async (data) => {
//   try {
//     const response = await api.post('register/', data);
//     return response.data;
//   } catch (error) {
//     throw error.response.data;
//   }
// };

// export const verifyOTP = async (data) => {
//   try {
//     const response = await api.post('verify/', data);
//     return response.data;
//   } catch (error) {
//     throw error.response.data;
//   }
// };

// export const loginUser = async (data) => {
//   try {
//     const response = await api.post('login/', data);
//     return response.data;
//   } catch (error) {
//     throw error.response.data;
//   }
// };




import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/accounts',  // Backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store token in localStorage after successful login
export const loginUser = async (data) => {
  try {
    const response = await api.post('login/', data);
    const { token } = response.data; // Assuming the response contains a 'token' field
    localStorage.setItem('auth_token', token);  // Save token to localStorage
    return response.data;  // Return the response, including token
  } catch (error) {
    throw error.response.data;
  }
};

// Helper function to get the token
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');  // Retrieve token from localStorage
};

export const registerUser = async (data) => {
  try {
    const response = await api.post('register/', data);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const verifyOTP = async (data) => {
  try {
    const response = await api.post('verify/', data);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
