import axios from "axios";

const API_URL = "https://e-commerce-zhu2.onrender.com/api";

export const login = async (data) => {
  return await axios.post(`${API_URL}/login/`, data);
};

export const register = async (data) => {
  return await axios.post(`${API_URL}/register/`, data);
};

export const otp_verify = async (data) => {
  return await axios.post(`${API_URL}/verify-otp/`, data);
};

export const complete_profile = async (data, token) => {
  return await axios.put(`${API_URL}/complete-profile/`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchStates = async () => {
  return await axios.get(`${API_URL}/states/`);
};