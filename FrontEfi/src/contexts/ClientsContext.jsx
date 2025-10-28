import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import clientsService from "../service/clients";

const ClientsContext = createContext();

export function ClientsProvider({ children }) {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ CORREGIDO: Removido AbortController que causaba conflictos
  useEffect(() => {
    if (user?.id && (user.rol === 'admin' || user.rol === 'agente')) {
      fetchClients();
    }
  }, [user?.id, user?.rol]);

  async function fetchClients() {
    setLoading(true);
    setError(null);
    try {
      const data = await clientsService.getAll();
      setClients(data);
    } catch (err) {
      console.error('Error al obtener clientes:', err);
      setError(err.message);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  async function getClientById(id) {
    try {
      return await clientsService.getById(id);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function createClient(payload) {
    try {
      const newClient = await clientsService.create(payload);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function updateClient(id, payload) {
    try {
      const updated = await clientsService.update(id, payload);
      setClients(prev =>
        prev.map(c => (c.id === id ? updated : c))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteClient(id) {
    try {
      await clientsService.remove(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  return (
    <ClientsContext.Provider
      value={{
        clients,
        loading,
        error,
        fetchClients,
        getClientById,
        createClient,
        updateClient,
        deleteClient,
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  return useContext(ClientsContext);
}