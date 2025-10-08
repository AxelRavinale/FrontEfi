import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import salesService from "../service/sales";

const SalesContext = createContext();

export function SalesProvider({ children }) {
  const { token, user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //  Obtener ventas del usuario logueado si es cliente
  useEffect(() => {
    if (token && user) {
      if (user.rol === "cliente") {
        fetchMySales(user.id);
      } else {
        fetchAllSales();
      }
    }
  }, [token, user]);

  async function fetchAllSales() {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.getAll(token);
      setSales(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMySales(clientId) {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.getByClient(clientId, token);
      setSales(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createSale(payload) {
    try {
      const newSale = await salesService.create(payload, token);
      setSales(prev => [...prev, newSale]);
      return newSale;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function updateSale(id, payload) {
    try {
      const updated = await salesService.update(id, payload, token);
      setSales(prev =>
        prev.map(s => (s.id === id ? updated : s))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function cancelSale(id) {
    try {
      const canceled = await salesService.cancel(id, token);
      setSales(prev =>
        prev.map(s => (s.id === id ? canceled : s))
      );
      return canceled;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  return (
    <SalesContext.Provider
      value={{
        sales,
        loading,
        error,
        fetchAllSales,
        fetchMySales,
        createSale,
        updateSale,
        cancelSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  return useContext(SalesContext);
}
