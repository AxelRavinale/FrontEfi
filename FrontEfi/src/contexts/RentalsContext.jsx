import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import rentalsService from "../service/rentals";

const RentalsContext = createContext();

export function RentalsProvider({ children }) {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ CORREGIDO: Removido AbortController que causaba conflictos
  useEffect(() => {
    if (user?.id) {
      loadRentals();
    }
  }, [user?.id, user?.rol]);

  async function loadRentals() {
    if (!user) return;

    if (user.rol === 'admin' || user.rol === 'agente') {
      await fetchAllRentals();
    } else if (user.rol === 'cliente') {
      await fetchMyRentals(user.id);
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

  async function fetchMyRentals(userId) {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalsService.getByClient(userId);
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
      const newRental = await rentalsService.create(payload);
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

  return (
    <RentalsContext.Provider
      value={{
        rentals,
        loading,
        error,
        fetchAllRentals,
        fetchMyRentals,
        createRental,
        updateRental,
        cancelRental,
        deleteRentalPermanently,
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