import axios from 'axios';
import { getAuthToken } from './authService'; 

const api = axios.create({
  baseURL: 'http://localhost:8000/blog',  
  headers: {
    'Content-Type': 'application/json',
  },
});

// const getAuthToken = () => {
//   return localStorage.getItem('auth_token');  
// };

export const getBlogs = async () => {
  try {
    const response = await api.get('/');
    return response.data;  
  } catch (error) {
    throw error.response.data;  
  }
};

export const getBlogDetail = async (id) => {
  try {
    const response = await api.get(`/${id}/`);
    return response.data; 
  } catch (error) {
    throw error.response.data;  
  }
};

export const createBlog = async (data) => {
  try {
    const token = getAuthToken();  
    const response = await api.post('create/', data, {
      headers: {
        'Authorization': `Bearer ${token}`,  
      },
    });
    return response.data;  
  } catch (error) {
    throw error.response.data;  
  }
};

export const editBlog = async (id, data) => {
  try {
    const token = getAuthToken(); 
    const response = await api.put(`${id}/edit/`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,  
      },
    });
    return response.data;  
  } catch (error) {
    throw error.response.data; 
  }
};

export const deleteBlog = async (id) => {
  try {
    const token = getAuthToken();  
    const response = await api.delete(`${id}/delete/`, {
      headers: {
        'Authorization': `Bearer ${token}`,  
      },
    });
    return response.data;  
  } catch (error) {
    throw error.response.data;  
  }
};




