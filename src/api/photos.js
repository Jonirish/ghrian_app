import axios from 'axios';

const API_BASE_URL = "http://localhost:8000";

export const uploadPhoto = async (formData, token) => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${API_BASE_URL}/photos/upload`, formData, { headers });
};

export const fetchPhotos = async (token, page, limit) => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${API_BASE_URL}/photos/my-photos?page=${page}&limit=${limit}`, { headers });
};
