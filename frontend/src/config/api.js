// API Configuration
// This will use environment variable in production, localhost in development

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://careerpath-mqzl.onrender.com';

export const API_ENDPOINTS = {
    simulate: `${API_BASE_URL}/api/simulate`,
    chat: `${API_BASE_URL}/api/chat`,
};
