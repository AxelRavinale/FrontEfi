import api from "../api/client";

const endpoint = "/api/ventas";

function unwrap(res) {
  return res.data?.data ?? res.data;
}

// Obtener todas las ventas (admin y agente)
const getAll = async () => {
  const res = await api.get(endpoint);
  return unwrap(res);
};

// Obtener solicitudes pendientes (admin y agente)
const getPendientes = async () => {
  const res = await api.get(`${endpoint}/pendientes`);
  return unwrap(res);
};

// Aprobar solicitud (admin y agente)
const aprobar = async (id) => {
  const res = await api.post(`${endpoint}/${id}/aprobar`);
  return unwrap(res);
};

// Rechazar solicitud (admin y agente)
const rechazar = async (id) => {
  const res = await api.post(`${endpoint}/${id}/rechazar`);
  return unwrap(res);
};

// Obtener ventas por cliente
const getByClient = async (clientId) => {
  const res = await api.get(`${endpoint}/cliente/${clientId}`);
  return unwrap(res);
};

// Crear nueva venta (ahora crea como solicitud pendiente)
const create = async (payload) => {
  const res = await api.post(endpoint, payload);
  return unwrap(res);
};

// Actualizar venta
const update = async (id, payload) => {
  const res = await api.put(`${endpoint}/${id}`, payload);
  return unwrap(res);
};

// Cancelar venta (eliminación lógica)
const cancel = async (id) => {
  const res = await api.delete(`${endpoint}/${id}`);
  return unwrap(res);
};

// Eliminación FÍSICA (solo admin)
const removePermanently = async (id) => {
  await api.delete(`${endpoint}/${id}/permanente`);
};

// ✅ NUEVO: Descargar recibo de venta en PDF
const downloadRecibo = async (id) => {
  try {
    const res = await api.get(`/api/pdf/venta/${id}`, {
      responseType: 'blob', // Importante para archivos binarios
    });
    
    // Crear un link temporal para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `recibo-venta-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error al descargar recibo:', error);
    throw error;
  }
};

export default { 
  getAll,
  getPendientes,
  aprobar,
  rechazar,
  getByClient, 
  create, 
  update, 
  cancel,
  removePermanently,
  downloadRecibo
};