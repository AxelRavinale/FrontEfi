import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Timeline } from "primereact/timeline";
import { useSales } from "../../contexts/SalesContext";
import { useProperties } from "../../contexts/PropertiesContext";
import { useAuth } from "../../contexts/AuthContext";

export default function ClienteMisCompras() {
  const { sales, loading } = useSales();
  const { properties } = useProperties();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const toast = useRef(null);

  // Filtrar solo compras del usuario actual
  const misCompras = sales.filter((s) => s.id_cliente === user?.id);

  // Calcular total invertido
  const totalInvertido = misCompras
    .filter((s) => s.estado === "finalizado")
    .reduce((acc, s) => acc + (s.monto_total || 0), 0);

  const statusTemplate = (rowData) => {
    const statusMap = {
      pendiente: { severity: "warning", label: "Pendiente", icon: "pi-clock" },
      aprobado: { severity: "info", label: "Aprobado", icon: "pi-check" },
      finalizado: { severity: "success", label: "Finalizado", icon: "pi-check-circle" },
      cancelado: { severity: "danger", label: "Cancelado", icon: "pi-times-circle" },
    };
    const status = statusMap[rowData.estado] || statusMap.pendiente;
    return (
      <Tag severity={status.severity} value={status.label} icon={`pi ${status.icon}`} />
    );
  };

  const propertyTemplate = (rowData) => {
    const property = properties.find((p) => p.id === rowData.id_propiedad);
    return property ? (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <i className="pi pi-home" style={{ color: "var(--gold)", fontSize: "1.2rem" }}></i>
        <span style={{ fontWeight: "600" }}>{property.nombre}</span>
      </div>
    ) : (
      <span className="text-muted">Propiedad no encontrada</span>
    );
  };

  const addressTemplate = (rowData) => {
    const property = properties.find((p) => p.id === rowData.id_propiedad);
    return property ? (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <i className="pi pi-map-marker" style={{ color: "var(--sage-green)" }}></i>
        <span>{property.direccion}</span>
      </div>
    ) : (
      <span className="text-muted">-</span>
    );
  };

  const dateTemplate = (rowData) => {
    if (!rowData.fecha_venta) return <span className="text-muted">-</span>;
    const date = new Date(rowData.fecha_venta);
    return (
      <span>
        <i className="pi pi-calendar me-2" style={{ color: "var(--light-brown)" }}></i>
        {date.toLocaleDateString("es-AR")}
      </span>
    );
  };

  const amountTemplate = (rowData) => {
    return (
      <span style={{ color: "var(--forest-green)", fontWeight: "700", fontSize: "1.1rem" }}>
        ${(rowData.monto_total || 0).toLocaleString()}
      </span>
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-eye"
          label="Ver"
          className="p-button-sm"
          style={{
            background: "linear-gradient(135deg, var(--sage-green), var(--gold))",
            border: "none",
            color: "white",
          }}
          onClick={() => {
            setSelectedSale(rowData);
            setVisible(true);
          }}
        />
        {rowData.estado === "finalizado" && (
          <Button
            icon="pi pi-file-pdf"
            className="p-button-sm p-button-help"
            tooltip="Descargar Recibo"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              toast.current.show({
                severity: "info",
                summary: "Descarga PDF",
                detail: "Función en desarrollo",
                life: 3000,
              });
            }}
          />
        )}
      </div>
    );
  };

  const getTimelineEvents = (sale) => {
    const events = [
      {
        status: "Solicitud de Compra",
        date: sale.fecha_venta,
        icon: "pi-shopping-cart",
        color: "#D4AF37",
        completed: true,
      },
    ];

    if (sale.estado === "aprobado" || sale.estado === "finalizado") {
      events.push({
        status: "Aprobado",
        icon: "pi-check",
        color: "#87A96B",
        completed: true,
      });
    }

    if (sale.estado === "finalizado") {
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

    if (sale.estado === "cancelado") {
      events.push({
        status: "Cancelado",
        icon: "pi-times-circle",
        color: "#dc3545",
        completed: true,
      });
    }

    if (sale.estado === "pendiente") {
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
        <h1 className="elegant-title">Mis Compras</h1>
        <p className="text-muted">
          Revisa el historial completo de tus compras y descargar documentación
        </p>
      </div>

      {/* Estadísticas */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card
            className="premium-card text-center"
            style={{
              background: "linear-gradient(135deg, #D4AF37, #E8C547)",
              color: "white",
              border: "none",
            }}
          >
            <i
              className="pi pi-shopping-cart mb-2"
              style={{ fontSize: "2.5rem", opacity: 0.9 }}
            ></i>
            <h3 style={{ fontWeight: "700", fontSize: "2rem" }}>
              {misCompras.length}
            </h3>
            <p className="mb-0" style={{ opacity: 0.95 }}>Total Compras</p>
          </Card>
        </div>
        <div className="col-md-3">
          <Card
            className="premium-card text-center"
            style={{
              background: "linear-gradient(135deg, #8B6F3F, #a38a5c)",
              color: "white",
              border: "none",
            }}
          >
            <i
              className="pi pi-clock mb-2"
              style={{ fontSize: "2.5rem", opacity: 0.9 }}
            ></i>
            <h3 style={{ fontWeight: "700", fontSize: "2rem" }}>
              {misCompras.filter((s) => s.estado === "pendiente").length}
            </h3>
            <p className="mb-0" style={{ opacity: 0.95 }}>Pendientes</p>
          </Card>
        </div>
        <div className="col-md-3">
          <Card
            className="premium-card text-center"
            style={{
              background: "linear-gradient(135deg, #2D5016, #3d6a1f)",
              color: "white",
              border: "none",
            }}
          >
            <i
              className="pi pi-check-circle mb-2"
              style={{ fontSize: "2.5rem", opacity: 0.9 }}
            ></i>
            <h3 style={{ fontWeight: "700", fontSize: "2rem" }}>
              {misCompras.filter((s) => s.estado === "finalizado").length}
            </h3>
            <p className="mb-0" style={{ opacity: 0.95 }}>Finalizadas</p>
          </Card>
        </div>
        <div className="col-md-3">
          <Card
            className="premium-card text-center"
            style={{
              background: "linear-gradient(135deg, #87A96B, #a0c184)",
              color: "white",
              border: "none",
            }}
          >
            <i
              className="pi pi-dollar mb-2"
              style={{ fontSize: "2.5rem", opacity: 0.9 }}
            ></i>
            <h3 style={{ fontWeight: "700", fontSize: "1.5rem" }}>
              ${totalInvertido.toLocaleString()}
            </h3>
            <p className="mb-0" style={{ opacity: 0.95 }}>Total Invertido</p>
          </Card>
        </div>
      </div>

      {/* Tabla de Compras */}
      <Card className="premium-card">
        <DataTable
          value={misCompras}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          responsiveLayout="scroll"
          emptyMessage={
            <div className="text-center p-5">
              <i className="pi pi-shopping-bag" style={{ fontSize: "3rem", color: "var(--gold)", marginBottom: "1rem" }}></i>
              <h5 style={{ color: "var(--primary-brown)" }}>No tienes compras registradas</h5>
              <p className="text-muted">Explora nuestras propiedades disponibles y realiza tu primera compra</p>
            </div>
          }
          loading={loading}
          stripedRows
          className="p-datatable-sm"
        >
          <Column
            field="id"
            header="ID"
            sortable
            style={{ minWidth: "80px", fontWeight: "600" }}
          />
          <Column
            header="Propiedad"
            body={propertyTemplate}
            sortable
            style={{ minWidth: "200px" }}
          />
          <Column
            header="Ubicación"
            body={addressTemplate}
            style={{ minWidth: "200px" }}
          />
          <Column
            header="Fecha"
            body={dateTemplate}
            sortable
            style={{ minWidth: "130px" }}
          />
          <Column
            header="Monto"
            body={amountTemplate}
            sortable
            style={{ minWidth: "130px" }}
          />
          <Column
            field="estado"
            header="Estado"
            body={statusTemplate}
            sortable
            style={{ minWidth: "150px" }}
          />
          <Column
            header="Acciones"
            body={actionTemplate}
            style={{ minWidth: "180px", textAlign: "center" }}
          />
        </DataTable>
      </Card>

      {/* Dialog de Detalles */}
      <Dialog
        visible={visible}
        header={
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="pi pi-shopping-cart" style={{ color: "var(--gold)" }}></i>
            <span style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
              Detalles de Compra #{selectedSale?.id}
            </span>
          </div>
        }
        style={{ width: "700px", maxWidth: "90vw" }}
        onHide={() => {
          setVisible(false);
          setSelectedSale(null);
        }}
        draggable={false}
      >
        {selectedSale && (
          <div className="py-3">
            {/* Información de la Propiedad */}
            <Card
              className="mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(135, 169, 107, 0.1))",
                border: "2px solid var(--gold)",
                borderRadius: "15px",
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "15px",
                    background: "linear-gradient(135deg, var(--gold), var(--light-gold))",
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
                    {properties.find((p) => p.id === selectedSale.id_propiedad)?.nombre || "Propiedad"}
                  </h5>
                  <p style={{ color: "var(--medium-text)", marginBottom: "0.5rem" }}>
                    <i className="pi pi-map-marker me-2"></i>
                    {properties.find((p) => p.id === selectedSale.id_propiedad)?.direccion || "-"}
                  </p>
                  <div className="d-flex align-items-center gap-2">
                    {statusTemplate(selectedSale)}
                    <span style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--forest-green)" }}>
                      ${(selectedSale.monto_total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Timeline de Proceso */}
            <div className="mb-4">
              <h6 style={{ color: "var(--primary-brown)", marginBottom: "1rem", fontWeight: "600" }}>
                <i className="pi pi-history me-2"></i>
                Proceso de Compra
              </h6>
              <Timeline
                value={getTimelineEvents(selectedSale)}
                align="left"
                marker={customizedMarker}
                content={customizedContent}
              />
            </div>

            {/* Información Detallada */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <div
                  className="p-3"
                  style={{
                    background: "white",
                    borderRadius: "10px",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <small style={{ color: "var(--medium-text)", display: "block", marginBottom: "0.25rem" }}>
                    ID de Compra
                  </small>
                  <strong style={{ color: "var(--primary-brown)" }}>
                    #{selectedSale.id}
                  </strong>
                </div>
              </div>
              <div className="col-md-4">
                <div
                  className="p-3"
                  style={{
                    background: "white",
                    borderRadius: "10px",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <small style={{ color: "var(--medium-text)", display: "block", marginBottom: "0.25rem" }}>
                    Fecha de Compra
                  </small>
                  <strong style={{ color: "var(--primary-brown)" }}>
                    {selectedSale.fecha_venta
                      ? new Date(selectedSale.fecha_venta).toLocaleDateString("es-AR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </strong>
                </div>
              </div>
              <div className="col-md-4">
                <div
                  className="p-3"
                  style={{
                    background: "white",
                    borderRadius: "10px",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <small style={{ color: "var(--medium-text)", display: "block", marginBottom: "0.25rem" }}>
                    Monto Total
                  </small>
                  <strong style={{ color: "var(--forest-green)", fontSize: "1.2rem" }}>
                    ${(selectedSale.monto_total || 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            {/* Mensajes según estado */}
            {selectedSale.estado === "pendiente" && (
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
                  Tu solicitud de compra está siendo procesada. Te contactaremos pronto para coordinar el pago y la documentación.
                </small>
              </div>
            )}

            {selectedSale.estado === "aprobado" && (
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
                  ¡Tu compra ha sido aprobada! Estamos preparando la documentación final.
                </small>
              </div>
            )}

            {selectedSale.estado === "finalizado" && (
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
                  ¡Felicitaciones! La compra se ha completado exitosamente. Ya puedes descargar tu recibo.
                </small>
              </div>
            )}

            {selectedSale.estado === "cancelado" && (
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
                  Esta compra fue cancelada. Contáctanos si tienes dudas.
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
                  setSelectedSale(null);
                }}
                style={{ color: "var(--medium-text)" }}
              />
              {selectedSale.estado === "finalizado" && (
                <Button
                  label="Descargar Recibo"
                  icon="pi pi-file-pdf"
                  className="btn-premium"
                  onClick={() => {
                    toast.current.show({
                      severity: "success",
                      summary: "Descarga Iniciada",
                      detail: "Tu recibo se está descargando",
                      life: 3000,
                    });
                  }}
                  style={{
                    background: "linear-gradient(135deg, var(--gold), var(--light-gold))",
                    border: "none",
                  }}
                />
              )}
              {(selectedSale.estado === "pendiente" || selectedSale.estado === "aprobado") && (
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