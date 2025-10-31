// src/service/properties.js
import api from "../api/client";

const endpoint = "/api/propiedades";
const tiposEndpoint = "/api/tipos-propiedad";

// Normalizamos las respuestas
function unwrap(res) {
  return res.data?.data ?? res.data;
}

// ============ PROPIEDADES ============

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

// ⭐ NUEVO: Obtener propiedades INACTIVAS (solo admin)
const getInactive = async () => {
  const res = await api.get(`${endpoint}/inactivas`);
  return unwrap(res);
};

// ⭐ NUEVO: Restaurar propiedad (cambiar activo a true)
const restore = async (id) => {
  const res = await api.patch(`${endpoint}/${id}/restaurar`, {});
  return unwrap(res);
};

// ⚠️ Eliminación FÍSICA (solo admin)
const removePermanente = async (id) => {
  await api.delete(`${endpoint}/${id}/permanente`);
};

// ============ TIPOS DE PROPIEDAD ============

const getAllTipos = async () => {
  const res = await api.get(tiposEndpoint);
  return unwrap(res);
};

const createTipo = async (payload) => {
  const res = await api.post(tiposEndpoint, payload);
  return unwrap(res);
};

const updateTipo = async (id, payload) => {
  const res = await api.put(`${tiposEndpoint}/${id}`, payload);
  return unwrap(res);
};

const removeTipo = async (id) => {
  await api.delete(`${tiposEndpoint}/${id}`);
};

const removeTipoPermanente = async (id) => {
  await api.delete(`${tiposEndpoint}/${id}/permanente`);
};

export default { 
  getAll, 
  getById, 
  create, 
  update, 
  remove,
  getInactive,
  restore,
  removePermanente,
  getAllTipos,
  createTipo,
  updateTipo,
  removeTipo,
  removeTipoPermanente
};