import api from "../api/client";

const endpoint = "/clientes";

function unwrap(res) {
  return res.data?.data ?? res.data;
}

const getAll = async (token) => {
  const res = await api.get(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return unwrap(res);
};

const getById = async (id, token) => {
  const res = await api.get(`${endpoint}/${id}`, {
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

const remove = async (id, token) => {
  await api.delete(`${endpoint}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default { getAll, getById, create, update, remove };