import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import salesService from "../service/sales";

const SalesContext = createContext();

export function SalesProvider({ children }) {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ CORREGIDO: Removido AbortController que causaba conflictos
  useEffect(() => {
    if (user?.id) {
      loadSales();
    }
  }, [user?.id, user?.rol]);

  async function loadSales() {
    if (!user) return;

    if (user.rol === 'admin' || user.rol === 'agente') {
      await fetchAllSales();
    } else if (user.rol === 'cliente') {
      await fetchMySales(user.id);
    }
  }

  async function fetchAllSales() {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.getAll();
      setSales(data);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      setError(err.response?.data?.message || err.message);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMySales(userId) {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.getByClient(userId);
      setSales(data);
    } catch (err) {
      console.error('Error al cargar mis ventas:', err);
      setError(err.response?.data?.message || err.message);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }

  async function createSale(payload) {
    try {
      const newSale = await salesService.create(payload);
      await loadSales();
      return newSale;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function updateSale(id, payload) {
    try {
      const updated = await salesService.update(id, payload);
      await loadSales();
      return updated;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function cancelSale(id) {
    try {
      await salesService.cancel(id);
      await loadSales();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function deleteSalePermanently(id) {
    try {
      await salesService.removePermanently(id);
      await loadSales();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
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
        deleteSalePermanently,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales debe usarse dentro de SalesProvider');
  }
  return context;
}