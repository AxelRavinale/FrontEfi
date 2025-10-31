import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import salesService from "../service/sales";

const SalesContext = createContext();

export function SalesProvider({ children }) {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadSales();
    }
  }, [user?.id, user?.rol, user?.clienteId]);

  async function loadSales() {
    if (!user) return;

    if (user.rol === 'admin' || user.rol === 'agente') {
      await fetchAllSales();
    } else if (user.rol === 'cliente' && user.clienteId) {
      await fetchMySales(user.clienteId);
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

  // Obtener solicitudes pendientes
  async function fetchPendientes() {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.getPendientes();
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
      const approved = await salesService.aprobar(id);
      // Actualizar listas
      await fetchPendientes();
      await fetchAllSales();
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
      await salesService.rechazar(id);
      // Actualizar lista de pendientes
      await fetchPendientes();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async function fetchMySales(clientId) {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.getByClient(clientId);
      console.log('🛒 Mis compras cargadas:', data);
      setSales(data);
    } catch (err) {
      console.error('Error al cargar mis compras:', err);
      setError(err.response?.data?.message || err.message);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }

  async function createSale(payload) {
    try {
      const saleData = {
        ...payload,
        id_cliente: user?.clienteId,
      };
      
      console.log('💰 Creando solicitud de venta:', saleData);
      
      const newSale = await salesService.create(saleData);
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

  // ✅ NUEVO: Descargar recibo de venta
  async function downloadRecibo(id) {
    try {
      await salesService.downloadRecibo(id);
      return true;
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
        pendientes,
        loading,
        error,
        fetchAllSales,
        fetchPendientes,
        aprobarSolicitud,
        rechazarSolicitud,
        fetchMySales,
        createSale,
        updateSale,
        cancelSale,
        deleteSalePermanently,
        downloadRecibo,
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