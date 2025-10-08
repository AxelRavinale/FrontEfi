import api from "../api/client";

const endpoint = "/alquileres";

function unwrap(res) {
  return res.data?.data ?? res.data;
}

const getAll = async (token) => {
  const res = await api.get(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return unwrap(res);
};

const getByClient = async (clientId, token) => {
  const res = await api.get(`${endpoint}/cliente/${clientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return unwrap(res);
};

const create = async (payload, token) => {
  const res = await api.post(endpoint, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return unwrap(res);
};

const update = async (id, payload, token) => {
  const res = await api.put(`${endpoint}/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return unwrap(res);
};

const cancel = async (id, token) => {
  const res = await api.patch(`${endpoint}/${id}/cancelar`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return unwrap(res);
};

export default { getAll, getByClient, create, update, cancel };
