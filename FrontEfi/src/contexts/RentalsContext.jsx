import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import rentalsService from "../service/rentals";

const RentalsContext = createContext();

export function RentalsProvider({ children }) {
  const { token, user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //  Cargar alquileres según rol
  useEffect(() => {
    if (token && user) {
      if (user.rol === "cliente") {
        fetchMyRentals(user.id);
      } else {
        fetchAllRentals();
      }
    }
  }, [token, user]);

  async function fetchAllRentals() {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalsService.getAll(token);
      setRentals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyRentals(clientId) {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalsService.getByClient(clientId, token);
      setRentals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createRental(payload) {
    try {
      const newRental = await rentalsService.create(payload, token);
      setRentals(prev => [...prev, newRental]);
      return newRental;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function updateRental(id, payload) {
    try {
      const updated = await rentalsService.update(id, payload, token);
      setRentals(prev =>
        prev.map(r => (r.id === id ? updated : r))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function cancelRental(id) {
    try {
      const canceled = await rentalsService.cancel(id, token);
      setRentals(prev =>
        prev.map(r => (r.id === id ? canceled : r))
      );
      return canceled;
    } catch (err) {
      setError(err.message);
      return null;
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
      }}
    >
      {children}
    </RentalsContext.Provider>
  );
}

export function useRentals() {
  return useContext(RentalsContext);
}
