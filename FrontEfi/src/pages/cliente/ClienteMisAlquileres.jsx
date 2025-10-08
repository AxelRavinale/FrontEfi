import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Timeline } from "primereact/timeline";
import { useRentals } from "../../contexts/RentalsContext";
import { useProperties } from "../../contexts/PropertiesContext";
import { useAuth } from "../../contexts/AuthContext";

export default function ClienteMisAlquileres() {
  const { rentals, loading } = useRentals();
  const { properties } = useProperties();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const toast = useRef(null);

  // Filtrar solo alquileres del usuario actual
  const misAlquileres = rentals.filter((r) => r.userId === user?.id);

  const statusTemplate = (rowData) => {
    const statusMap = {
      pendiente: { severity: "warning", label: "Pendiente", icon: "pi-clock" },
      aprobado: { severity: "info", label: "Aprobado", icon: "pi-check" },
      activo: { severity: "success", label: "Activo", icon: "pi-check-circle" },
      finalizado: { severity: "secondary", label: "Finalizado", icon: "pi-flag" },
      cancelado: { severity: "danger", label: "Cancelado", icon: "pi-times-circle" },
    };
    const status = statusMap[rowData.estado] || statusMap.pendiente;
    return (
      <Tag severity={status.severity} value={status.label} icon={`pi ${status.icon}`} />
    );
  };

  const propertyTemplate = (rowData) => {
    const property = properties.find((p) => p.id === rowData.propertyId);
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
    const property = properties.find((p) => p.id === rowData.propertyId);
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
    if (!rowData.createdAt) return <span className="text-muted">-</span>;
    const date = new Date(rowData.createdAt);
    return (
      <span>
        <i className="pi pi-calendar me-2" style={{ color: "var(--light-brown)" }}></i>
        {date.toLocaleDateString("es-AR")}
      </span>
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-eye"
        label="Ver Detalles"
        className="p-button-sm"
        style={{
          background: "linear-gradient(135deg, var(--sage-green), var(--gold))",
          border: "none",
          color: "white",
        }}
        onClick={() => {
          setSelectedRental(rowData);
          setVisible(true);
        }}
      />
    );
  };

  const getTimelineEvents = (rental) => {
    const property = properties.find((p) => p.id === rental.propertyId);
    const events = [
      {
        status: "Solicitud Enviada",
        date: rental.createdAt,
        icon: "pi-send",
        color: "#D4AF37",
        completed: true,
      },
    ];

    if (rental.estado === "aprobado" || rental.estado === "activo" || rental.estado === "finalizado") {
      events.push({
        status: "Aprobado",
        icon: "pi-check",
        color: "#87A96B",
        completed: true,
      });
    }

    if (rental.estado === "activo" || rental.estado === "finalizado") {
      events.push({
        status: "Contrato Activo",
        icon: "pi-file",
        color: "#2D5016",
        completed: true,
      });
    }

    if (rental.estado === "finalizado") {
      events.push({
        status: "Finalizado",
        icon: "pi-flag",
        color: "#6B4423",
        completed: true,
      });
    }

    if (rental.estado === "cancelado") {
      events.push({
        status: "Cancelado",
        icon: "pi-times-circle",
        color: "#dc3545",
        completed: true,
      });
    }

    if (rental.estado === "pendiente") {
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
        <h1 className="elegant-title">Mis Alquileres</h1>
        <p className="text-muted">
          Gestiona y da seguimiento a todas tus solicitudes de alquiler
        </p>
      </div>

      {/* Estadísticas */}
      <div className="row g-3 mb-4">
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
              className="pi pi-key mb-2"
              style={{ fontSize: "2.5rem", opacity: 0.9 }}
            ></i>
            <h3 style={{ fontWeight: "700", fontSize: "2rem" }}>
              {misAlquileres.length}
            </h3>
            <p className="mb-0" style={{ opacity: 0.95 }}>Total Alquileres</p>
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
              {misAlquileres.filter((r) => r.estado === "pendiente").length}
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
              {misAlquileres.filter((r) => r.estado === "activo").length}
            </h3>
            <p className="mb-0" style={{ opacity: 0.95 }}>Activos</p>
          </Card>
        </div>
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
              className="pi pi-flag mb-2"
              style={{ fontSize: "2.5rem", opacity: 0.9 }}
            ></i>
            <h3 style={{ fontWeight: "700", fontSize: "2rem" }}>
              {misAlquileres.filter((r) => r.estado === "finalizado").length}
            </h3>
            <p className="mb-0" style={{ opacity: 0.95 }}>Finalizados</p>
          </Card>
        </div>
      </div>

      {/* Tabla de Alquileres */}
      <Card className="premium-card">
        <DataTable
          value={misAlquileres}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          responsiveLayout="scroll"
          emptyMessage={
            <div className="text-center p-5">
              <i className="pi pi-inbox" style={{ fontSize: "3rem", color: "var(--sage-green)", marginBottom: "1rem" }}></i>
              <h5 style={{ color: "var(--primary-brown)" }}>No tienes alquileres registrados</h5>
              <p className="text-muted">Explora nuestras propiedades disponibles y envía tu primera solicitud</p>
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
            header="Fecha Solicitud"
            body={dateTemplate}
            sortable
            style={{ minWidth: "150px" }}
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
            <i className="pi pi-info-circle" style={{ color: "var(--gold)" }}></i>
            <span style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
              Detalles del Alquiler #{selectedRental?.id}
            </span>
          </div>
        }
        style={{ width: "700px", maxWidth: "90vw" }}
        onHide={() => {
          setVisible(false);
          setSelectedRental(null);
        }}
        draggable={false}
      >
        {selectedRental && (
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
                    {properties.find((p) => p.id === selectedRental.propertyId)?.nombre || "Propiedad"}
                  </h5>
                  <p style={{ color: "var(--medium-text)", marginBottom: "0.5rem" }}>
                    <i className="pi pi-map-marker me-2"></i>
                    {properties.find((p) => p.id === selectedRental.propertyId)?.direccion || "-"}
                  </p>
                  <div>
                    {statusTemplate(selectedRental)}
                  </div>
                </div>
              </div>
            </Card>

            {/* Timeline de Estado */}
            <div className="mb-4">
              <h6 style={{ color: "var(--primary-brown)", marginBottom: "1rem", fontWeight: "600" }}>
                <i className="pi pi-history me-2"></i>
                Historial del Proceso
              </h6>
              <Timeline
                value={getTimelineEvents(selectedRental)}
                align="left"
                marker={customizedMarker}
                content={customizedContent}
              />
            </div>

            {/* Información Adicional */}
            <div className="row g-3">
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
                    {selectedRental.createdAt
                      ? new Date(selectedRental.createdAt).toLocaleDateString("es-AR", {
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
                    #{selectedRental.id}
                  </strong>
                </div>
              </div>
            </div>

            {/* Mensaje según estado */}
            {selectedRental.estado === "pendiente" && (
              <div
                className="alert alert-warning d-flex align-items-center mt-3"
                style={{
                  background: "rgba(139, 111, 63, 0.1)",
                  border: "1px solid var(--light-brown)",
                  borderRadius: "10px",
                }}
              >
                <i className="pi pi-clock me-2" style={{ color: "var(--light-brown)" }}></i>
                <small>
                  Tu solicitud está siendo revisada. Nos pondremos en contacto contigo pronto.
                </small>
              </div>
            )}

            {selectedRental.estado === "aprobado" && (
              <div
                className="alert alert-info d-flex align-items-center mt-3"
                style={{
                  background: "rgba(135, 169, 107, 0.1)",
                  border: "1px solid var(--sage-green)",
                  borderRadius: "10px",
                }}
              >
                <i className="pi pi-check me-2" style={{ color: "var(--sage-green)" }}></i>
                <small>
                  ¡Tu solicitud ha sido aprobada! Pronto se activará el contrato.
                </small>
              </div>
            )}

            {selectedRental.estado === "activo" && (
              <div
                className="alert alert-success d-flex align-items-center mt-3"
                style={{
                  background: "rgba(45, 80, 22, 0.1)",
                  border: "1px solid var(--forest-green)",
                  borderRadius: "10px",
                }}
              >
                <i className="pi pi-check-circle me-2" style={{ color: "var(--forest-green)" }}></i>
                <small>
                  Tu contrato está activo. Disfruta de tu nueva propiedad.
                </small>
              </div>
            )}

            {selectedRental.estado === "finalizado" && (
              <div
                className="alert alert-secondary d-flex align-items-center mt-3"
                style={{
                  background: "rgba(107, 68, 35, 0.1)",
                  border: "1px solid var(--primary-brown)",
                  borderRadius: "10px",
                }}
              >
                <i className="pi pi-flag me-2" style={{ color: "var(--primary-brown)" }}></i>
                <small>
                  Este alquiler ha finalizado. Gracias por confiar en nosotros.
                </small>
              </div>
            )}

            {selectedRental.estado === "cancelado" && (
              <div
                className="alert alert-danger d-flex align-items-center mt-3"
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
                  setSelectedRental(null);
                }}
                style={{ color: "var(--medium-text)" }}
              />
              {(selectedRental.estado === "activo" || selectedRental.estado === "aprobado") && (
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