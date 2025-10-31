import api from "../api/client";

const endpoint = "/api/auth";

function unwrap(res) {
  return res.data?.data ?? res.data;
}

const login = async (email, password) => {
  const res = await api.post(`${endpoint}/login`, { email, password });
  return res.data; // Retorna { token, user, message }
};

const register = async (payload) => {
  const res = await api.post(`${endpoint}/register`, payload);
  return res.data; // Retorna { message, data: newUser }
};

const verifySession = async () => {
  const res = await api.get(`${endpoint}/verify`);
  return res.data; // Retorna { valid: true, user }
};

const forgotPassword = async (email) => {
  const res = await api.post(`${endpoint}/forgot-password`, { email });
  return res.data;
};

const resetPassword = async (token, password) => {
  const res = await api.post(`${endpoint}/reset-password`, { token, password });
  return res.data;
};

export default { 
  login, 
  register, 
  verifySession,
  forgotPassword, 
  resetPassword 
};