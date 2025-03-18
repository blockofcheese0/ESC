import api from './api';
import { jwtDecode } from 'jwt-decode';

const register = async (userData) => {
  const response = await api.post('register/', userData);
  return response.data;
};

const login = async (credentials) => {
  const response = await api.post('token/', credentials);
  const { access, refresh } = response.data;
  
  localStorage.setItem('token', access);
  localStorage.setItem('refreshToken', refresh);
  
  return getUserInfoFromToken(access);
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

const getUserInfoFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.user_id,
      username: decoded.username,
      isTherapist: decoded.is_therapist,
    };
  } catch (error) {
    return null;
  }
};

const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  return getUserInfoFromToken(token);
};

const joinTherapist = async (inviteCode) => {
  const response = await api.post('client/join/', { invite_code: inviteCode });
  return response.data;
};

const getTherapistProfile = async () => {
  const response = await api.get('therapist-profile/');
  return response.data[0]; // Assuming one profile per therapist
};

const getClientProfile = async () => {
  const response = await api.get('client-profile/');
  return response.data[0]; // Assuming one profile per client
};

const getClientsByTherapist = async () => {
  const response = await api.get('client-profile/');
  return response.data;
};

export const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  joinTherapist,
  getTherapistProfile,
  getClientProfile,
  getClientsByTherapist,
};