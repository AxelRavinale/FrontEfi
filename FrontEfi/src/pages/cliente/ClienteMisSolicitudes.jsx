import React, { useState, useRef } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Timeline } from "primereact/timeline";
import { confirmDialog } from "primereact/confirmdialog";
import { useRentals } from "../../contexts/RentalsContext";
import { useSales } from "../../contexts/SalesContext";
import { useProperties } from "../../contexts/PropertiesContext";
import { useAuth } from "../../contexts/AuthContext";

export default function ClienteMisSolicitudes() {
  const { rentals, cancelRental, loading: loadingRentals } = useRentals();
  const { sales, cancelSale, loading: loadingSales } = useSales();
  const { properties } = useProperties();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [tipoSolicitud, setTipoSolicitud] = useState("");
  const toast = useRef(null);

  // Filtrar solicitudes del usuario
  const misSolicitudesAlquiler = rentals.filter(
    (r) => r.id_cliente === user?.clienteId
  );
  
  const misSolicitudesVenta = sales.filter(
    (s) => s.id_cliente === user?.clienteId
  );

  // Contar pendientes
  const pendientesAlquiler = misSolicitudesAlquiler.filter(
    (r) => r.estado === "pendiente"
  ).length;
  
  const pendientesVenta = misSolicitudesVenta.filter(
    (s) => s.estado === "pendiente"
  ).length;

  // ========== TEMPLATES COMPARTIDOS ==========

  const statusTemplate = (rowData) => {
    const statusMap = {
      pendiente: { severity: "warning", label: "Pendiente", icon: "pi-clock" },
      aprobado: { severity: "info", label: "Aprobado", icon: "pi-check" },
      activo: { severity: "success", label: "Activo", icon: "pi-check-circle" },
      finalizado: { severity: "success", label: "Finalizado", icon: "pi-flag" },
      finalizada: { severity: "success", label: "Finalizada", icon: "pi-flag" },
      cancelado: { severity: "danger", label: "Cancelado", icon: "pi-times-circle" },
      cancelada: { severity: "danger", label: "Cancelada", icon: "pi-times-circle" },
    };
    const status = statusMap[rowData.estado] || statusMap.pendiente;
    return (
      <Tag severity={status.severity} value={status.label} icon={`pi ${status.icon}`} />
    );
  };

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

  const dateTemplate = (rowData) => {
    const date = new Date(rowData.createdAt || rowData.fecha_venta);
    return (
      <span>
        <i className="pi pi-calendar me-2" style={{ color: "var(--light-brown)" }}></i>
        {date.toLocaleDateString("es-AR")}
      </span>
    );
  };

  // ========== ACCIONES ==========

  const handleCancelar = (item, tipo) => {
    if (item.estado !== "pendiente") {
      toast.current.show({
        severity: "warn",
        summary: "No disponible",
        detail: "Solo puedes cancelar solicitudes pendientes",
      });
      return;
    }

    confirmDialog({
      message: `¿Estás seguro de cancelar esta solicitud?`,
      header: "Confirmar Cancelación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sí, cancelar",
      rejectLabel: "No",
      accept: async () => {
        try {
          if (tipo === "alquiler") {
            await cancelRental(item.id);
          } else {
            await cancelSale(item.id);
          }
          toast.current.show({
            severity: "success",
            summary: "Cancelado",
            detail: "Solicitud cancelada exitosamente",
          });
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.message || "Error al cancelar",
          });
        }
      },
    });
  };

  const handleVerDetalles = (item, tipo) => {
    setSelectedItem(item);
    setTipoSolicitud(tipo);
    setVisible(true);
  };

  // ========== ALQUILERES ==========

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
          icon="pi pi-eye"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => handleVerDetalles(rowData, "alquiler")}
          tooltip="Ver Detalles"
          tooltipOptions={{ position: "top" }}
        />
        {rowData.estado === "pendiente" && (
          <Button
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-sm"
            onClick={() => handleCancelar(rowData, "alquiler")}
            tooltip="Cancelar Solicitud"
            tooltipOptions={{ position: "top" }}
          />
        )}
      </div>
    );
  };

  // ========== VENTAS ==========

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
          icon="pi pi-eye"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => handleVerDetalles(rowData, "venta")}
          tooltip="Ver Detalles"
          tooltipOptions={{ position: "top" }}
        />
        {rowData.estado === "pendiente" && (
          <Button
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-sm"
            onClick={() => handleCancelar(rowData, "venta")}
            tooltip="Cancelar Solicitud"
            tooltipOptions={{ position: "top" }}
          />
        )}
        {(rowData.estado === "finalizada" || rowData.estado === "finalizado") && (
          <Button
            icon="pi pi-file-pdf"
            className="p-button-rounded p-button-help p-button-sm"
            onClick={() => {
              toast.current.show({
                severity: "info",
                summary: "Descarga PDF",
                detail: "Función en desarrollo",
              });
            }}
            tooltip="Descargar Recibo"
            tooltipOptions={{ position: "top" }}
          />
        )}
      </div>
    );
  };

  // ========== TIMELINE ==========

  const getTimelineEvents = (item, tipo) => {
    const events = [
      {
        status: "Solicitud Enviada",
        date: item.createdAt || item.fecha_venta,
        icon: "pi-send",
        color: "#D4AF37",
        completed: true,
      },
    ];

    if (item.estado === "aprobado" || item.estado === "activo" || item.estado === "finalizado" || item.estado === "finalizada") {
      events.push({
        status: "Aprobado",
        icon: "pi-check",
        color: "#87A96B",
        completed: true,
      });
    }

    if (tipo === "alquiler") {
      if (item.estado === "activo" || item.estado === "finalizado") {
        events.push({
          status: "Contrato Activo",
          icon: "pi-file",
          color: "#2D5016",
          completed: true,
        });
      }
      if (item.estado === "finalizado") {
        events.push({
          status: "Finalizado",
          icon: "pi-flag",
          color: "#6B4423",
          completed: true,
        });
      }
    } else {
      if (item.estado === "finalizada") {
        events.push({
          status: "Pago Procesado",
          icon: "pi-dollar",
          color: "#2D5016",
          completed: true,
        });
        events.push({
          status: "Compra Finalizada",
          icon: "pi-check-circle",
          color: "#6B4423",
          completed: true,
        });
      }
    }

    if (item.estado === "cancelado" || item.estado === "cancelada") {
      events.push({
        status: "Cancelado",
        icon: "pi-times-circle",
        color: "#dc3545",
        completed: true,
      });
    }

    if (item.estado === "pendiente") {
      events.push({
        status: "En Revisión",
        icon: "pi-clock",
        color: "#8B6F3F",
        completed: false,
      });
    }

    return events;
  };

  const customizedMarker = (item) => {
    return (
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "50%",
          backgroundColor: item.completed ? item.color : "#e0e0e0",
          color: "white",
          boxShadow: item.completed ? `0 4px 12px ${item.color}50` : "none",
        }}
      >
        <i className={`pi ${item.icon}`} style={{ fontSize: "1rem" }}></i>
      </span>
    );
  };

  const customizedContent = (item) => {
    return (
      <div>
        <h6 style={{ color: "var(--primary-brown)", marginBottom: "0.25rem" }}>
          {item.status}
        </h6>
        {item.date && (
          <small className="text-muted">
            {new Date(item.date).toLocaleDateString("es-AR")}
          </small>
        )}
      </div>
    );
  };

  return (
    <div className="fade-in-up">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="elegant-title">Mis Solicitudes</h1>
        <p className="text-muted">
          Revisa el estado de todas tus solicitudes de alquiler y compra
        </p>
      </div>

      {/* Estadísticas */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <Card
            className="premium-card text-center h-100"
            style={{
              background: "linear-gradient(135deg, rgba(139, 111, 63, 0.1), rgba(139, 111, 63, 0.2))",
              border: "2px solid var(--light-brown)",
            }}
          >
            <i
              className="pi pi-key mb-2"
              style={{ fontSize: "2.5rem", color: "var(--light-brown)" }}
            ></i>
            <h2 style={{ color: "var(--light-brown)", fontWeight: "700" }}>
              {misSolicitudesAlquiler.length}
            </h2>
            <p className="mb-1">Solicitudes de Alquiler</p>
            <small className="text-muted">{pendientesAlquiler} pendientes</small>
          </Card>
        </div>
        <div className="col-md-6">
          <Card
            className="premium-card text-center h-100"
            style={{
              background: "linear-gradient(135deg, rgba(45, 80, 22, 0.1), rgba(45, 80, 22, 0.2))",
              border: "2px solid var(--forest-green)",
            }}
          >
            <i
              className="pi pi-shopping-cart mb-2"
              style={{ fontSize: "2.5rem", color: "var(--forest-green)" }}
            ></i>
            <h2 style={{ color: "var(--forest-green)", fontWeight: "700" }}>
              {misSolicitudesVenta.length}
            </h2>
            <p className="mb-1">Solicitudes de Venta</p>
            <small className="text-muted">{pendientesVenta} pendientes</small>
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
                Alquileres ({misSolicitudesAlquiler.length})
              </span>
            }
          >
            <DataTable
              value={misSolicitudesAlquiler}
              paginator
              rows={10}
              emptyMessage={
                <div className="text-center p-5">
                  <i className="pi pi-inbox" style={{ fontSize: "3rem", color: "var(--light-brown)", marginBottom: "1rem" }}></i>
                  <h5 style={{ color: "var(--primary-brown)" }}>No tienes solicitudes de alquiler</h5>
                  <p className="text-muted">Explora propiedades y envía tu primera solicitud</p>
                </div>
              }
              loading={loadingRentals}
              stripedRows
              className="p-datatable-sm"
            >
              <Column header="Propiedad" body={propertyTemplate} style={{ minWidth: "200px" }} />
              <Column header="Monto" body={alquilerMontoTemplate} style={{ minWidth: "120px" }} />
              <Column header="Período" body={alquilerFechasTemplate} style={{ minWidth: "180px" }} />
              <Column header="Fecha Solicitud" body={dateTemplate} style={{ minWidth: "140px" }} />
              <Column header="Estado" body={statusTemplate} style={{ minWidth: "140px" }} />
              <Column header="Acciones" body={alquilerActionsTemplate} style={{ minWidth: "140px", textAlign: "center" }} />
            </DataTable>
          </TabPanel>

          {/* TAB DE VENTAS */}
          <TabPanel
            header={
              <span style={{ color: "var(--forest-green)" }}>
                <i className="pi pi-shopping-cart me-2"></i>
                Ventas ({misSolicitudesVenta.length})
              </span>
            }
          >
            <DataTable
              value={misSolicitudesVenta}
              paginator
              rows={10}
              emptyMessage={
                <div className="text-center p-5">
                  <i className="pi pi-shopping-bag" style={{ fontSize: "3rem", color: "var(--forest-green)", marginBottom: "1rem" }}></i>
                  <h5 style={{ color: "var(--primary-brown)" }}>No tienes solicitudes de compra</h5>
                  <p className="text-muted">Explora propiedades y envía tu primera solicitud</p>
                </div>
              }
              loading={loadingSales}
              stripedRows
              className="p-datatable-sm"
            >
              <Column header="Propiedad" body={propertyTemplate} style={{ minWidth: "200px" }} />
              <Column header="Monto Total" body={ventaMontoTemplate} style={{ minWidth: "140px" }} />
              <Column header="Fecha Solicitud" body={dateTemplate} style={{ minWidth: "140px" }} />
              <Column header="Estado" body={statusTemplate} style={{ minWidth: "140px" }} />
              <Column header="Acciones" body={ventaActionsTemplate} style={{ minWidth: "160px", textAlign: "center" }} />
            </DataTable>
          </TabPanel>
        </TabView>
      </Card>

      {/* Dialog de Detalles */}
      <Dialog
        visible={visible}
        header={
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className={`pi ${tipoSolicitud === "alquiler" ? "pi-key" : "pi-shopping-cart"}`} style={{ color: "var(--gold)" }}></i>
            <span style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
              Detalles de Solicitud #{selectedItem?.id}
            </span>
          </div>
        }
        style={{ width: "700px", maxWidth: "90vw" }}
        onHide={() => {
          setVisible(false);
          setSelectedItem(null);
          setTipoSolicitud("");
        }}
        draggable={false}
      >
        {selectedItem && (
          <div className="py-3">
            {/* Información de la Propiedad */}
            <Card
              className="mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(135, 169, 107, 0.1), rgba(212, 175, 55, 0.1))",
                border: "2px solid var(--sage-green)",
                borderRadius: "15px",
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "15px",
                    background: "linear-gradient(135deg, var(--sage-green), var(--forest-green))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <i className="pi pi-home" style={{ fontSize: "2rem", color: "white" }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <h5 style={{ color: "var(--primary-brown)", marginBottom: "0.5rem" }}>
                    {properties.find((p) => p.id === selectedItem.id_propiedad)?.direccion || "Propiedad"}
                  </h5>
                  <p style={{ color: "var(--medium-text)", marginBottom: "0.5rem" }}>
                    <i className="pi pi-tag me-2"></i>
                    {tipoSolicitud === "alquiler" ? "Alquiler" : "Compra"}
                  </p>
                  <div className="d-flex align-items-center gap-2">
                    {statusTemplate(selectedItem)}
                    <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--forest-green)" }}>
                      ${(tipoSolicitud === "alquiler" ? selectedItem.monto_mensual : selectedItem.monto_total)?.toLocaleString()}
                      {tipoSolicitud === "alquiler" && "/mes"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Timeline de Estado */}
            <div className="mb-4">
              <h6 style={{ color: "var(--primary-brown)", marginBottom: "1rem", fontWeight: "600" }}>
                <i className="pi pi-history me-2"></i>
                Estado de tu Solicitud
              </h6>
              <Timeline
                value={getTimelineEvents(selectedItem, tipoSolicitud)}
                align="left"
                marker={customizedMarker}
                content={customizedContent}
              />
            </div>

            {/* Información Adicional */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div
                  className="p-3"
                  style={{
                    background: "white",
                    borderRadius: "10px",
                    border: "1px solid rgba(135, 169, 107, 0.2)",
                  }}
                >
                  <small style={{ color: "var(--medium-text)", display: "block", marginBottom: "0.25rem" }}>
                    Fecha de Solicitud
                  </small>
                  <strong style={{ color: "var(--primary-brown)" }}>
                    {(selectedItem.createdAt || selectedItem.fecha_venta)
                      ? new Date(selectedItem.createdAt || selectedItem.fecha_venta).toLocaleDateString("es-AR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </strong>
                </div>
              </div>
              <div className="col-md-6">
                <div
                  className="p-3"
                  style={{
                    background: "white",
                    borderRadius: "10px",
                    border: "1px solid rgba(135, 169, 107, 0.2)",
                  }}
                >
                  <small style={{ color: "var(--medium-text)", display: "block", marginBottom: "0.25rem" }}>
                    ID de Solicitud
                  </small>
                  <strong style={{ color: "var(--primary-brown)" }}>
                    #{selectedItem.id}
                  </strong>
                </div>
              </div>
            </div>

            {/* Mensaje según estado */}
            {selectedItem.estado === "pendiente" && (
              <div
                className="alert alert-warning d-flex align-items-center"
                style={{
                  background: "rgba(139, 111, 63, 0.1)",
                  border: "1px solid var(--light-brown)",
                  borderRadius: "10px",
                }}
              >
                <i className="pi pi-clock me-2" style={{ color: "var(--light-brown)" }}></i>
                <small>
                  Tu solicitud está siendo revisada. Un agente se pondrá en contacto contigo pronto.
                </small>
              </div>
            )}

            {selectedItem.estado === "aprobado" && (
              <div
                className="alert alert-info d-flex align-items-center"
                style={{
                  background: "rgba(135, 169, 107, 0.1)",
                  border: "1px solid var(--sage-green)",
                  borderRadius: "10px",
                }}
              >
                <i className="pi pi-check me-2" style={{ color: "var(--sage-green)" }}></i>
                <small>
                  ¡Tu solicitud ha sido aprobada! Estamos preparando la documentación.
                </small>
              </div>
            )}

            {(selectedItem.estado === "activo" || selectedItem.estado === "finalizado" || selectedItem.estado === "finalizada") && (
              <div
                className="alert alert-success d-flex align-items-center"
                style={{
                  background: "rgba(45, 80, 22, 0.1)",
                  border: "1px solid var(--forest-green)",
                  borderRadius: "10px",
                }}
              >
                <i className="pi pi-check-circle me-2" style={{ color: "var(--forest-green)" }}></i>
                <small>
                  ¡Felicitaciones! Tu solicitud ha sido completada exitosamente.
                </small>
              </div>
            )}

            {(selectedItem.estado === "cancelado" || selectedItem.estado === "cancelada") && (
              <div
                className="alert alert-danger d-flex align-items-center"
                style={{
                  background: "rgba(220, 53, 69, 0.1)",
                  border: "1px solid #dc3545",
                  borderRadius: "10px",
                }}
              >
                <i className="pi pi-times-circle me-2" style={{ color: "#dc3545" }}></i>
                <small>
                  Esta solicitud fue cancelada.
                </small>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="d-flex gap-2 justify-content-end mt-4">
              <Button
                label="Cerrar"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => {
                  setVisible(false);
                  setSelectedItem(null);
                  setTipoSolicitud("");
                }}
                style={{ color: "var(--medium-text)" }}
              />
              {selectedItem.estado === "pendiente" && (
                <Button
                  label="Cancelar Solicitud"
                  icon="pi pi-ban"
                  className="p-button-danger"
                  onClick={() => {
                    setVisible(false);
                    handleCancelar(selectedItem, tipoSolicitud);
                  }}
                />
              )}
              {(selectedItem.estado === "activo" || selectedItem.estado === "aprobado") && (
                <Button
                  label="Contactar Soporte"
                  icon="pi pi-phone"
                  className="btn-premium"
                  onClick={() => {
                    toast.current.show({
                      severity: "info",
                      summary: "Contacto",
                      detail: "Te redirigiremos a soporte",
                      life: 3000,
                    });
                  }}
                  style={{
                    background: "linear-gradient(135deg, var(--forest-green), var(--sage-green))",
                    border: "none",
                  }}
                />
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}