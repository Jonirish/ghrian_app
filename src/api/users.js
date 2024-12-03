import axios from 'axios';

const API_BASE_URL = "http://localhost:8000";

export const fetchUserProfile = async (token) => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${API_BASE_URL}/auth/profile`, { headers });
};