import api from "../api/client";

const endpoint = "/api/alquileres";

function unwrap(res) {
  return res.data?.data ?? res.data;
}

// Obtener todos los alquileres (admin y agente)
const getAll = async () => {
  const res = await api.get(endpoint);
  return unwrap(res);
};

// Obtener alquileres por cliente
const getByClient = async (clientId) => {
  const res = await api.get(`${endpoint}/cliente/${clientId}`);
  return unwrap(res);
};

// Crear nuevo alquiler
const create = async (payload) => {
  const res = await api.post(endpoint, payload);
  return unwrap(res);
};

// Actualizar alquiler
const update = async (id, payload) => {
  const res = await api.put(`${endpoint}/${id}`, payload);
  return unwrap(res);
};

// Cancelar alquiler (eliminación lógica)
const cancel = async (id) => {
  const res = await api.delete(`${endpoint}/${id}`);
  return unwrap(res);
};

// ⚠️ Eliminación FÍSICA (solo admin) - si la implementas en el backend
const removePermanently = async (id) => {
  await api.delete(`${endpoint}/${id}/permanente`);
};

export default { 
  getAll, 
  getByClient, 
  create, 
  update, 
  cancel,
  removePermanently
};