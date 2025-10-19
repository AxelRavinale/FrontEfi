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
    if (token) {
      fetchProperties();
    }
  }, [token]);

  async function fetchProperties() {
    setLoading(true);
    setError(null);
    try {
      // ✅ Ya no pasamos token, api/client.js lo maneja
      const data = await propertiesService.getAll();
      console.log('Propiedades cargadas:', data); // Debug
      setProperties(data);
    } catch (err) {
      console.error('Error al cargar propiedades:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function getPropertyById(id) {
    try {
      return await propertiesService.getById(id);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function createProperty(payload) {
    try {
      const newProp = await propertiesService.create(payload);
      await fetchProperties(); // ✅ Recargar lista completa
      return newProp;
    } catch (err) {
      console.error('Error al crear propiedad:', err);
      setError(err.message);
      throw err;
    }
  }

  async function updateProperty(id, payload) {
    try {
      const updated = await propertiesService.update(id, payload);
      await fetchProperties(); // ✅ Recargar lista completa
      return updated;
    } catch (err) {
      console.error('Error al actualizar propiedad:', err);
      setError(err.message);
      throw err;
    }
  }

  async function deleteProperty(id) {
    try {
      await propertiesService.remove(id);
      await fetchProperties(); // ✅ Recargar lista completa
    } catch (err) {
      console.error('Error al eliminar propiedad:', err);
      setError(err.message);
      throw err;
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
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error('useProperties debe usarse dentro de PropertiesProvider');
  }
  return context;
}