// src/service/properties.js
import api from "../api/client";

const endpoint = "/api/propiedades"; // ✅ Agregado /api

// Normalizamos las respuestas
function unwrap(res) {
  return res.data?.data ?? res.data;
}

// ✅ Ya no necesitamos pasar token manualmente, api/client.js lo hace
const getAll = async () => {
  const res = await api.get(endpoint);
  return unwrap(res);
};

const getById = async (id) => {
  const res = await api.get(`${endpoint}/${id}`);
  return unwrap(res);
};

const create = async (payload) => {
  const res = await api.post(endpoint, payload);
  return unwrap(res);
};

const update = async (id, payload) => {
  const res = await api.put(`${endpoint}/${id}`, payload);
  return unwrap(res);
};

const remove = async (id) => {
  await api.delete(`${endpoint}/${id}`);
};

export default { getAll, getById, create, update, remove };