import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import clientsService from "../services/clients";

const ClientsContext = createContext();

export function ClientsProvider({ children }) {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener clientes al montar si hay token
  useEffect(() => {
    if (token) fetchClients();
  }, [token]);

  async function fetchClients() {
    setLoading(true);
    setError(null);
    try {
      const data = await clientsService.getAll(token);
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function getClientById(id) {
    try {
      return await clientsService.getById(id, token);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function createClient(payload) {
    try {
      const newClient = await clientsService.create(payload, token);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function updateClient(id, payload) {
    try {
      const updated = await clientsService.update(id, payload, token);
      setClients(prev =>
        prev.map(c => (c.id === id ? updated : c))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function deleteClient(id) {
    try {
      await clientsService.remove(id, token);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
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
