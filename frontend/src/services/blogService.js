import axios from 'axios';
import { getAuthToken } from './authService';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000Celery/blog',  
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch all blogs
export const getBlogs = async () => {
  try {
    const response = await api.get('/');
    return response.data;  
  } catch (error) {
    throw error.response ? error.response.data : error.message;  
  }
};

export const getUserDraftBlogs = async () => {
  try {
    const token = getAuthToken();
    const response = await api.get('/user/blogs/draft/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getUserPublishedBlogs = async () => {
  try {
   
    const response = await api.get('/user/blogs/post/');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Fetch details for a specific blog by id
export const getBlogDetail = async (id) => {
  try {
    const response = await api.get(`/${id}/`);
    return response.data; 
  } catch (error) {
    throw error.response ? error.response.data : error.message;  
  }
};

// Create a new blog
export const createBlog = async (data) => {
  try {
    const token = getAuthToken();  
    const response = await api.post('create/', data, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Attach the authorization token
      },
    });
    return response.data;  
  } catch (error) {
    throw error.response ? error.response.data : error.message;  
  }
};

// Edit an existing blog
export const editBlog = async (id, data) => {
  try {
    const token = getAuthToken(); 
    const response = await api.put(`${id}/edit/`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Attach the authorization token
      },
    });
    return response.data;  
  } catch (error) {
    throw error.response ? error.response.data : error.message; 
  }
};

// Delete a specific blog
export const deleteBlog = async (id) => {
  try {
    const token = getAuthToken();  
    const response = await api.delete(`${id}/delete/`, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Attach the authorization token
      },
    });
    return response.data;  
  } catch (error) {
    throw error.response ? error.response.data : error.message;  
  }
};

// Update the status of a blog (for example, from draft to published)
export const updateBlogStatus = async (id, status) => {
  try {
    const token = getAuthToken();  
    const response = await api.put(`/${id}/edit/`, { status }, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Attach the authorization token
      },
    });
    return response.data;  
  } catch (error) {
    throw error.response ? error.response.data : error.message;  
  }
};

// Fetch comments for a specific blog
export const getComments = async (blogId) => {
  try {
    const token = getAuthToken();  
    const response = await api.get(`${blogId}/comments/`, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Attach the authorization token
      },
    });
    return response.data;  
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Create a comment for a specific blog
export const createComment = async (blogId, data) => {
  try {
    const token = getAuthToken();  
    const response = await api.post(`${blogId}/comments/make/`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Attach the authorization token
      },
    });
    return response.data;  
  } catch (error) {
    throw error.response ? error.response.data : error.message;  
  }
};

// Reply to a comment on a specific blog
export const replyToComment = async (blogId, commentId, data) => {
  try {
    const token = getAuthToken();  
    const response = await api.post(`${blogId}/comments/${commentId}/reply/`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,  // Attach the authorization token
      },
    });
    return response.data;  
  } catch (error) {
    throw error.response ? error.response.data : error.message;  
  }
};


export const getNotifications = async () => {
  try {
    const token = getAuthToken();  
    const response = await api.get('/notifications/', {
      headers: {
        'Authorization': `Bearer ${token}`,  // Attach the authorization token
      },
    });
    return response.data;  
  } catch (error) {
    throw error.response ? error.response.data : error.message;  
  }
}

// Mark a specific notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`/notifications/${notificationId}/read/`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const token = getAuthToken();
    const response = await api.post('/notifications/read-all/', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async () => {
  try {
    const token = getAuthToken();
    const response = await api.get('/notifications/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    // Filter to count only unread notifications
    return response.data.filter(notification => !notification.is_read).length;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};


export const getBlogById = async (blogId) => {
  try {
    const token = getAuthToken(); // If authentication is required
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`https://blogsphere-back.onrender.com/blog/${blogId}/`, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blog');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }
};