import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import propertiesService from "../service/properties";

const PropertiesContext = createContext();

export function PropertiesProvider({ children }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [tiposPropiedad, setTiposPropiedad] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  async function loadData() {
    try {
      await Promise.all([
        fetchProperties(),
        fetchTiposPropiedad()
      ]);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  }

  // ========== PROPIEDADES ==========

  async function fetchProperties() {
    setLoading(true);
    setError(null);
    try {
      const data = await propertiesService.getAll();
      
      // ✅ CORREGIDO: Agentes solo ven SUS propiedades
      let filteredData = data;
      if (user?.rol === 'agente') {
        filteredData = data.filter(prop => prop.id_agente === user.id);
        console.log('🔍 Propiedades filtradas para agente:', {
          total: data.length,
          delAgente: filteredData.length,
          agenteId: user.id
        });
      }
      
      setProperties(filteredData);
    } catch (err) {
      console.error('Error al cargar propiedades:', err);
      setError(err.response?.data?.message || err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  async function getPropertyById(id) {
    try {
      const property = await propertiesService.getById(id);
      
      // ✅ Validar que el agente solo acceda a sus propiedades
      if (user?.rol === 'agente' && property.id_agente !== user.id) {
        throw new Error('No tienes permiso para acceder a esta propiedad');
      }
      
      return property;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return null;
    }
  }

  async function createProperty(payload) {
    try {
      const newProp = await propertiesService.create(payload);
      await fetchProperties();
      return newProp;
    } catch (err) {
      console.error('Error al crear propiedad:', err);
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function updateProperty(id, payload) {
    try {
      // ✅ Validación adicional en frontend antes de enviar al backend
      const propertyToUpdate = properties.find(p => p.id === id);
      if (user?.rol === 'agente' && propertyToUpdate?.id_agente !== user.id) {
        throw new Error('No tienes permiso para editar esta propiedad');
      }
      
      const updated = await propertiesService.update(id, payload);
      await fetchProperties();
      return updated;
    } catch (err) {
      console.error('Error al actualizar propiedad:', err);
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function deleteProperty(id) {
    try {
      // ✅ Validación adicional en frontend
      const propertyToDelete = properties.find(p => p.id === id);
      if (user?.rol === 'agente' && propertyToDelete?.id_agente !== user.id) {
        throw new Error('No tienes permiso para eliminar esta propiedad');
      }
      
      await propertiesService.remove(id);
      await fetchProperties();
    } catch (err) {
      console.error('Error al eliminar propiedad:', err);
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function deletePropertyPermanente(id) {
    try {
      await propertiesService.removePermanente(id);
      await fetchProperties();
    } catch (err) {
      console.error('Error al eliminar propiedad permanentemente:', err);
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function getInactiveProperties() {
    try {
      const data = await propertiesService.getInactive();
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function restoreProperty(id) {
    try {
      const restored = await propertiesService.restore(id);
      await fetchProperties();
      return restored;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ========== TIPOS DE PROPIEDAD ==========

  async function fetchTiposPropiedad() {
    try {
      const data = await propertiesService.getAllTipos();
      setTiposPropiedad(data);
    } catch (err) {
      console.error('Error al cargar tipos de propiedad:', err);
      setTiposPropiedad([]);
    }
  }

  async function createTipoPropiedad(payload) {
    try {
      const newTipo = await propertiesService.createTipo(payload);
      await fetchTiposPropiedad();
      return newTipo;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function updateTipoPropiedad(id, payload) {
    try {
      const updated = await propertiesService.updateTipo(id, payload);
      await fetchTiposPropiedad();
      return updated;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function deleteTipoPropiedad(id) {
    try {
      await propertiesService.removeTipo(id);
      await fetchTiposPropiedad();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  return (
    <PropertiesContext.Provider
      value={{
        properties,
        tiposPropiedad,
        loading,
        error,
        fetchProperties,
        getPropertyById,
        createProperty,
        updateProperty,
        deleteProperty,
        deletePropertyPermanente,
        getInactiveProperties,
        restoreProperty,
        fetchTiposPropiedad,
        createTipoPropiedad,
        updateTipoPropiedad,
        deleteTipoPropiedad,
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