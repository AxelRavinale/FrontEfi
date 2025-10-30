import React, { useState, useEffect, useRef } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { confirmDialog } from "primereact/confirmdialog";
import { useRentals } from "../../contexts/RentalsContext";
import { useSales } from "../../contexts/SalesContext";
import { useProperties } from "../../contexts/PropertiesContext";
import { useClients } from "../../contexts/ClientsContext";

export default function AgenteSolicitudes() {
  const { pendientes: alquileresPendientes, fetchPendientes: fetchAlquileres, aprobarSolicitud: aprobarAlquiler, rechazarSolicitud: rechazarAlquiler, loading: loadingAlquileres } = useRentals();
  const { pendientes: ventasPendientes, fetchPendientes: fetchVentas, aprobarSolicitud: aprobarVenta, rechazarSolicitud: rechazarVenta, loading: loadingVentas } = useSales();
  const { properties } = useProperties();
  const { clients } = useClients();
  const [activeIndex, setActiveIndex] = useState(0);
  const toast = useRef(null);

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    try {
      await Promise.all([fetchAlquileres(), fetchVentas()]);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    }
  };

  // ========== TEMPLATES COMPARTIDOS ==========

  const propertyTemplate = (rowData) => {
    const property = properties.find((p) => p.id === rowData.id_propiedad);
    return property ? (
      <div>
        <i className="pi pi-home me-2" style={{ color: "var(--gold)" }}></i>
        <strong>{property.direccion}</strong>
        <br />
        <small className="text-muted">${property.precio?.toLocaleString()}</small>
      </div>
    ) : (
      <span className="text-muted">Propiedad no encontrada</span>
    );
  };

  const clientTemplate = (rowData) => {
    const client = clients.find((c) => c.id === rowData.id_cliente);
    return client ? (
      <div>
        <i className="pi pi-user me-2" style={{ color: "var(--sage-green)" }}></i>
        <strong>{client.Usuario?.nombre || 'N/A'}</strong>
        <br />
        <small className="text-muted">{client.Usuario?.email || 'N/A'}</small>
      </div>
    ) : (
      <span className="text-muted">Cliente no encontrado</span>
    );
  };

  const dateTemplate = (rowData) => {
    const date = new Date(rowData.createdAt || rowData.fecha_venta);
    return date.toLocaleDateString("es-AR");
  };

  // ========== ALQUILERES ==========

  const handleAprobarAlquiler = (solicitud) => {
    confirmDialog({
      message: `¿Confirmar aprobación del alquiler para ${clients.find(c => c.id === solicitud.id_cliente)?.Usuario?.nombre}?`,
      header: "Aprobar Solicitud",
      icon: "pi pi-check-circle",
      acceptClassName: "p-button-success",
      acceptLabel: "Sí, aprobar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await aprobarAlquiler(solicitud.id);
          toast.current.show({
            severity: "success",
            summary: "Aprobado",
            detail: "Solicitud de alquiler aprobada exitosamente",
          });
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.message || "Error al aprobar",
          });
        }
      },
    });
  };

  const handleRechazarAlquiler = (solicitud) => {
    confirmDialog({
      message: `¿Confirmar rechazo del alquiler?`,
      header: "Rechazar Solicitud",
      icon: "pi pi-times-circle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sí, rechazar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await rechazarAlquiler(solicitud.id);
          toast.current.show({
            severity: "warn",
            summary: "Rechazado",
            detail: "Solicitud de alquiler rechazada",
          });
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.message || "Error al rechazar",
          });
        }
      },
    });
  };

  const alquilerMontoTemplate = (rowData) => {
    return (
      <span style={{ color: "var(--light-brown)", fontWeight: "600" }}>
        ${rowData.monto_mensual?.toLocaleString()}/mes
      </span>
    );
  };

  const alquilerFechasTemplate = (rowData) => {
    const inicio = new Date(rowData.fecha_inicio).toLocaleDateString("es-AR");
    const fin = new Date(rowData.fecha_fin).toLocaleDateString("es-AR");
    return (
      <small>
        <i className="pi pi-calendar me-1"></i>
        {inicio} → {fin}
      </small>
    );
  };

  const alquilerActionsTemplate = (rowData) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-check"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => handleAprobarAlquiler(rowData)}
          tooltip="Aprobar"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => handleRechazarAlquiler(rowData)}
          tooltip="Rechazar"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  // ========== VENTAS ==========

  const handleAprobarVenta = (solicitud) => {
    confirmDialog({
      message: `¿Confirmar aprobación de la venta para ${clients.find(c => c.id === solicitud.id_cliente)?.Usuario?.nombre}?`,
      header: "Aprobar Solicitud",
      icon: "pi pi-check-circle",
      acceptClassName: "p-button-success",
      acceptLabel: "Sí, aprobar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await aprobarVenta(solicitud.id);
          toast.current.show({
            severity: "success",
            summary: "Aprobado",
            detail: "Solicitud de venta aprobada exitosamente",
          });
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.message || "Error al aprobar",
          });
        }
      },
    });
  };

  const handleRechazarVenta = (solicitud) => {
    confirmDialog({
      message: `¿Confirmar rechazo de la venta?`,
      header: "Rechazar Solicitud",
      icon: "pi pi-times-circle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sí, rechazar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await rechazarVenta(solicitud.id);
          toast.current.show({
            severity: "warn",
            summary: "Rechazado",
            detail: "Solicitud de venta rechazada",
          });
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.message || "Error al rechazar",
          });
        }
      },
    });
  };

  const ventaMontoTemplate = (rowData) => {
    return (
      <span style={{ color: "var(--forest-green)", fontWeight: "600", fontSize: "1.1rem" }}>
        ${rowData.monto_total?.toLocaleString()}
      </span>
    );
  };

  const ventaActionsTemplate = (rowData) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-check"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => handleAprobarVenta(rowData)}
          tooltip="Aprobar"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => handleRechazarVenta(rowData)}
          tooltip="Rechazar"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  return (
    <div className="fade-in-up">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="elegant-title">Solicitudes Pendientes</h1>
        <p className="text-muted">
          Gestiona las solicitudes de alquiler y venta de tus clientes
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <Card 
            className="premium-card text-center h-100"
            style={{ 
              background: "linear-gradient(135deg, rgba(139, 111, 63, 0.1), rgba(139, 111, 63, 0.2))",
              border: "2px solid var(--light-brown)"
            }}
          >
            <i
              className="pi pi-key mb-2"
              style={{ fontSize: "2.5rem", color: "var(--light-brown)" }}
            ></i>
            <h2 style={{ color: "var(--light-brown)", fontWeight: "700" }}>
              {alquileresPendientes?.length || 0}
            </h2>
            <p className="mb-0">Solicitudes de Alquiler</p>
          </Card>
        </div>
        <div className="col-md-6">
          <Card 
            className="premium-card text-center h-100"
            style={{ 
              background: "linear-gradient(135deg, rgba(45, 80, 22, 0.1), rgba(45, 80, 22, 0.2))",
              border: "2px solid var(--forest-green)"
            }}
          >
            <i
              className="pi pi-shopping-cart mb-2"
              style={{ fontSize: "2.5rem", color: "var(--forest-green)" }}
            ></i>
            <h2 style={{ color: "var(--forest-green)", fontWeight: "700" }}>
              {ventasPendientes?.length || 0}
            </h2>
            <p className="mb-0">Solicitudes de Venta</p>
          </Card>
        </div>
      </div>

      <Card className="premium-card">
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          {/* TAB DE ALQUILERES */}
          <TabPanel 
            header={
              <span style={{ color: "var(--light-brown)" }}>
                <i className="pi pi-key me-2"></i>
                Alquileres ({alquileresPendientes?.length || 0})
              </span>
            }
          >
            <DataTable
              value={alquileresPendientes}
              paginator
              rows={10}
              emptyMessage="No hay solicitudes de alquiler pendientes"
              loading={loadingAlquileres}
              stripedRows
              className="p-datatable-sm"
            >
              <Column header="Propiedad" body={propertyTemplate} style={{ minWidth: "200px" }} />
              <Column header="Cliente" body={clientTemplate} style={{ minWidth: "180px" }} />
              <Column header="Monto" body={alquilerMontoTemplate} style={{ minWidth: "120px" }} />
              <Column header="Período" body={alquilerFechasTemplate} style={{ minWidth: "180px" }} />
              <Column header="Fecha Solicitud" body={dateTemplate} style={{ minWidth: "120px" }} />
              <Column header="Acciones" body={alquilerActionsTemplate} style={{ minWidth: "120px", textAlign: "center" }} />
            </DataTable>
          </TabPanel>

          {/* TAB DE VENTAS */}
          <TabPanel 
            header={
              <span style={{ color: "var(--forest-green)" }}>
                <i className="pi pi-shopping-cart me-2"></i>
                Ventas ({ventasPendientes?.length || 0})
              </span>
            }
          >
            <DataTable
              value={ventasPendientes}
              paginator
              rows={10}
              emptyMessage="No hay solicitudes de venta pendientes"
              loading={loadingVentas}
              stripedRows
              className="p-datatable-sm"
            >
              <Column header="Propiedad" body={propertyTemplate} style={{ minWidth: "200px" }} />
              <Column header="Cliente" body={clientTemplate} style={{ minWidth: "180px" }} />
              <Column header="Monto Total" body={ventaMontoTemplate} style={{ minWidth: "140px" }} />
              <Column header="Fecha Solicitud" body={dateTemplate} style={{ minWidth: "120px" }} />
              <Column header="Acciones" body={ventaActionsTemplate} style={{ minWidth: "120px", textAlign: "center" }} />
            </DataTable>
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
}