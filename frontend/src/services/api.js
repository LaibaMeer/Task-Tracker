import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request - Token:', token ? token.substring(0, 20) + '...' : 'No token'); // Debug log
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url); // Debug log
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url); // Debug log
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data); // Debug log
    
    // If token is invalid, clear it and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if we're not already on login/signup page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => {
    console.log('Auth - Login attempt for:', email);
    return api.post('/auth/login', { email, password });
  },
  signup: (name, email, password) => {
    console.log('Auth - Signup attempt for:', email);
    return api.post('/auth/signup', { name, email, password });
  },
  verifyToken: () => {
    console.log('Auth - Verifying token');
    return api.get('/auth/me');
  },
};

// Task services
export const taskService = {
  getTasks: () => {
    console.log('Tasks - Getting all tasks');
    return api.get('/tasks');
  },
  createTask: (task) => {
    console.log('Tasks - Creating task:', task.title);
    return api.post('/tasks', task);
  },
  updateTask: (id, updates) => {
    console.log('Tasks - Updating task:', id);
    return api.patch(`/tasks/${id}`, updates);
  },
  deleteTask: (id) => {
    console.log('Tasks - Deleting task:', id);
    return api.delete(`/tasks/${id}`);
  },
  getOverdueTasks: () => {
    console.log('Tasks - Getting overdue tasks');
    return api.get('/tasks/overdue');
  },
};