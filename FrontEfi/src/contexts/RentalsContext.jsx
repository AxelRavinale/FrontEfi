import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import rentalsService from "../service/rentals";

const RentalsContext = createContext();

export function RentalsProvider({ children }) {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadRentals();
    }
  }, [user?.id, user?.rol, user?.clienteId]);

  async function loadRentals() {
    if (!user) return;

    if (user.rol === 'admin' || user.rol === 'agente') {
      await fetchAllRentals();
    } else if (user.rol === 'cliente' && user.clienteId) {
      await fetchMyRentals(user.clienteId);
    }
  }

  async function fetchAllRentals() {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalsService.getAll();
      setRentals(data);
    } catch (err) {
      console.error('Error al cargar alquileres:', err);
      setError(err.response?.data?.message || err.message);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  }

  // Obtener solicitudes pendientes
  async function fetchPendientes() {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalsService.getPendientes();
      setPendientes(data);
      return data;
    } catch (err) {
      console.error('Error al cargar solicitudes pendientes:', err);
      setError(err.response?.data?.message || err.message);
      setPendientes([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Aprobar solicitud
  async function aprobarSolicitud(id) {
    try {
      const approved = await rentalsService.aprobar(id);
      // Actualizar listas
      await fetchPendientes();
      await fetchAllRentals();
      return approved;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Rechazar solicitud
  async function rechazarSolicitud(id) {
    try {
      await rentalsService.rechazar(id);
      // Actualizar lista de pendientes
      await fetchPendientes();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function fetchMyRentals(clientId) {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalsService.getByClient(clientId);
      console.log('📋 Mis alquileres cargados:', data);
      setRentals(data);
    } catch (err) {
      console.error('Error al cargar mis alquileres:', err);
      setError(err.response?.data?.message || err.message);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  }

  async function createRental(payload) {
    try {
      const rentalData = {
        ...payload,
        id_cliente: user?.clienteId,
      };
      
      console.log('🏠 Creando solicitud de alquiler:', rentalData);
      
      const newRental = await rentalsService.create(rentalData);
      await loadRentals();
      return newRental;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function updateRental(id, payload) {
    try {
      const updated = await rentalsService.update(id, payload);
      await loadRentals();
      return updated;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function cancelRental(id) {
    try {
      await rentalsService.cancel(id);
      await loadRentals();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function deleteRentalPermanently(id) {
    try {
      await rentalsService.removePermanently(id);
      await loadRentals();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ✅ NUEVO: Descargar contrato de alquiler
  async function downloadContrato(id) {
    try {
      await rentalsService.downloadContrato(id);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  return (
    <RentalsContext.Provider
      value={{
        rentals,
        pendientes,
        loading,
        error,
        fetchAllRentals,
        fetchPendientes,
        aprobarSolicitud,
        rechazarSolicitud,
        fetchMyRentals,
        createRental,
        updateRental,
        cancelRental,
        deleteRentalPermanently,
        downloadContrato,
      }}
    >
      {children}
    </RentalsContext.Provider>
  );
}

export function useRentals() {
  const context = useContext(RentalsContext);
  if (!context) {
    throw new Error('useRentals debe usarse dentro de RentalsProvider');
  }
  return context;
}