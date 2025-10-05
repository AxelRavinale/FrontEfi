import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";   // contexto de sesión (usuario, token)
import propertiesService from "../services/properties"; // servicio de API

const PropertiesContext = createContext();

//  Provider: expone el estado global de propiedades a toda la app
export function PropertiesProvider({ children }) {
  const { token } = useAuth(); // traemos el token del AuthContext
  const [properties, setProperties] = useState([]); // lista de propiedades
  const [loading, setLoading] = useState(false);    // indicador de carga
  const [error, setError] = useState(null);         // último error de API

  //  Cargar propiedades automáticamente cuando tengamos token
  useEffect(() => {
    if (token) fetchProperties();
  }, [token]);

  // Obtener todas
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

  //  Obtener una por ID
  async function getPropertyById(id) {
    try {
      return await propertiesService.getById(id, token);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  //  Crear nueva propiedad
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

  // ✏️ Actualizar
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

  //  Eliminar
  async function deleteProperty(id) {
    try {
      await propertiesService.remove(id, token);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  //  Exponer valores y acciones
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

//  Hook de acceso
export function useProperties() {
  return useContext(PropertiesContext);
}
