import api from "../api/client";

const endpoint = "/api/usuarios";

function unwrap(res) {
  return res.data?.data ?? res.data;
}

// ✅ CORREGIDO: Ya NO se pasa el token manualmente
// El interceptor en client.js lo agrega automáticamente

// Obtener todos los usuarios ACTIVOS
const getAll = async () => {
  const res = await api.get(endpoint);
  return unwrap(res);
};

// Obtener usuario por ID
const getById = async (id) => {
  const res = await api.get(`${endpoint}/${id}`);
  return unwrap(res);
};

// Crear usuario
const create = async (payload) => {
  const res = await api.post(endpoint, payload);
  return unwrap(res);
};

// Actualizar usuario
const update = async (id, payload) => {
  const res = await api.put(`${endpoint}/${id}`, payload);
  return unwrap(res);
};

// Eliminación LÓGICA (cambiar activo a false)
const remove = async (id) => {
  await api.delete(`${endpoint}/${id}`);
};

// Obtener usuarios INACTIVOS (solo admin)
const getInactive = async () => {
  const res = await api.get(`${endpoint}/inactivos`);
  return unwrap(res);
};

// Restaurar usuario (cambiar activo a true)
const restore = async (id) => {
  const res = await api.patch(`${endpoint}/${id}/restaurar`, {});
  return unwrap(res);
};

// Eliminación FÍSICA/PERMANENTE (solo admin)
const removePermanently = async (id) => {
  await api.delete(`${endpoint}/${id}/permanente`);
};

export default { 
  getAll, 
  getById, 
  create, 
  update, 
  remove,
  getInactive,
  restore,
  removePermanently
};