import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import propertiesService from "../service/properties";

const PropertiesContext = createContext();

export function PropertiesProvider({ children }) {
  const { token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) fetchProperties();
  }, [token]);

  async function fetchProperties() {
    setLoading(true);
    setError(null);
    try {
      const data = await propertiesService.getAll(token);
      setProperties(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function getPropertyById(id) {
    try {
      return await propertiesService.getById(id, token);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function createProperty(payload) {
    try {
      const newProp = await propertiesService.create(payload, token);
      setProperties(prev => [...prev, newProp]);
      return newProp;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function updateProperty(id, payload) {
    try {
      const updated = await propertiesService.update(id, payload, token);
      setProperties(prev =>
        prev.map(p => (p.id === id ? updated : p))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function deleteProperty(id) {
    try {
      await propertiesService.remove(id, token);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <PropertiesContext.Provider
      value={{
        properties,
        loading,
        error,
        fetchProperties,
        getPropertyById,
        createProperty,
        updateProperty,
        deleteProperty,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
}

export function useProperties() {
  return useContext(PropertiesContext);
}