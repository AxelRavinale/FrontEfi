import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { useProperties } from "../../contexts/PropertiesContext";
import { useRentals } from "../../contexts/RentalsContext";
import { useSales } from "../../contexts/SalesContext";
import { useAuth } from "../../contexts/AuthContext";

export default function ClientePropiedades() {
  const { properties, loading } = useProperties();
  const { createRental } = useRentals();
  const { createSale } = useSales();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [tipoOperacion, setTipoOperacion] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' o 'table'
  const toast = useRef(null);

  // Solo propiedades disponibles para clientes
  const propiedadesDisponibles = properties.filter(
    (p) => p.estado === "disponible"
  );

  const operacionOptions = [
    { label: "Alquilar", value: "alquiler" },
    { label: "Comprar", value: "compra" },
  ];

  const openSolicitud = (property) => {
    setSelectedProperty(property);
    setTipoOperacion("");
    setVisible(true);
  };

  const handleSolicitud = async () => {
    if (!tipoOperacion) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Debe seleccionar tipo de operación",
      });
      return;
    }

    confirmDialog({
      message: `¿Confirmar solicitud de ${tipoOperacion} para "${selectedProperty.nombre}"?`,
      header: "Confirmar Solicitud",
      icon: "pi pi-question-circle",
      acceptClassName: "btn-premium",
      acceptLabel: "Sí, solicitar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          if (tipoOperacion === "alquiler") {
            await createRental({
              propertyId: selectedProperty.id,
              userId: user.id,
              estado: "pendiente",
            });
          } else {
            await createSale({
              id_propiedad: selectedProperty.id,
              id_cliente: user.id,
              fecha_venta: new Date().toISOString(),
              monto_total: selectedProperty.precio || 0,
              estado: "pendiente",
            });
          }
          
          toast.current.show({
            severity: "success",
            summary: "¡Solicitud Enviada!",
            detail: `Tu solicitud de ${tipoOperacion} ha sido enviada. Te contactaremos pronto.`,
            life: 5000,
          });
          setVisible(false);
          setSelectedProperty(null);
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.message || "Error al enviar solicitud",
          });
        }
      },
    });
  };

  // Template para vista de tarjetas (grid)
  const PropertyCard = ({ property }) => (
    <div className="col-md-6 col-lg-4 mb-4">
      <Card
        className="premium-card property-card-client h-100"
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
          e.currentTarget.style.boxShadow = "0 25px 50px rgba(44, 24, 16, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow = "0 5px 25px rgba(44, 24, 16, 0.08)";
        }}
      >
        <div
          style={{
            height: "200px",
            background: "linear-gradient(135deg, var(--sage-green), var(--forest-green))",
            position: "relative",
            marginBottom: "1rem",
            borderRadius: "15px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "3rem",
              color: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <i className="pi pi-home"></i>
          </div>
          <Tag
            severity="success"
            value="Disponible"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "var(--gold)",
              fontSize: "0.8rem",
              fontWeight: "600",
              animation: "badgeBounce 2s ease-in-out infinite",
            }}
          />
        </div>

        <h4
          style={{
            color: "var(--primary-brown)",
            fontWeight: "600",
            marginBottom: "0.5rem",
          }}
        >
          {property.nombre}
        </h4>

        <div style={{ color: "var(--medium-text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <i className="pi pi-map-marker" style={{ color: "var(--gold)" }}></i>
          {property.direccion}
        </div>

        <div
          style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "var(--forest-green)",
            marginBottom: "1rem",
          }}
        >
          ${(property.precio || 0).toLocaleString()}
        </div>

        <Button
          label="Solicitar"
          icon="pi pi-send"
          className="btn-premium w-100"
          onClick={() => openSolicitud(property)}
          style={{
            background: "linear-gradient(135deg, var(--sage-green), var(--gold))",
            border: "none",
            padding: "0.75rem",
            borderRadius: "10px",
            fontWeight: "600",
          }}
        />
      </Card>
    </div>
  );

  // Templates para vista de tabla
  const statusTemplate = (rowData) => {
    return <Tag severity="success" value="Disponible" />;
  };

  const priceTemplate = (rowData) => {
    return (
      <span style={{ color: "var(--forest-green)", fontWeight: "600", fontSize: "1.1rem" }}>
        ${(rowData.precio || 0).toLocaleString()}
      </span>
    );
  };

  const addressTemplate = (rowData) => {
    return (
      <span>
        <i className="pi pi-map-marker me-2" style={{ color: "var(--gold)" }}></i>
        {rowData.direccion}
      </span>
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-send"
        label="Solicitar"
        className="btn-premium p-button-sm"
        onClick={() => openSolicitud(rowData)}
      />
    );
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
      <div className="d-flex align-items-center gap-3 flex-grow-1">
        <span className="p-input-icon-left" style={{ flex: "1", maxWidth: "400px" }}>
          <i className="pi pi-search" />
          <InputText
            placeholder="Buscar propiedades..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-100"
            style={{
              borderRadius: "25px",
              padding: "0.75rem 1rem 0.75rem 2.5rem",
              border: "2px solid rgba(135, 169, 107, 0.2)",
            }}
          />
        </span>
        <span className="text-muted">
          <i className="pi pi-home me-2"></i>
          {propiedadesDisponibles.length} propiedades disponibles
        </span>
      </div>
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-th-large"
          className={viewMode === "grid" ? "btn-premium" : "p-button-outlined"}
          onClick={() => setViewMode("grid")}
          tooltip="Vista de tarjetas"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-list"
          className={viewMode === "table" ? "btn-premium" : "p-button-outlined"}
          onClick={() => setViewMode("table")}
          tooltip="Vista de tabla"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    </div>
  );

  return (
    <div className="fade-in-up">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="elegant-title">Propiedades Disponibles</h1>
        <p className="text-muted">
          Explora nuestra selección premium de propiedades para alquiler y compra
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card
            className="premium-card text-center"
            style={{
              background: "linear-gradient(135deg, #87A96B, #a0c184)",
              color: "white",
              border: "none",
            }}
          >
            <i
              className="pi pi-building mb-2"
              style={{ fontSize: "2.5rem", opacity: 0.9 }}
            ></i>
            <h3 style={{ fontWeight: "700", fontSize: "2rem" }}>
              {propiedadesDisponibles.length}
            </h3>
            <p className="mb-0" style={{ opacity: 0.95 }}>Propiedades Disponibles</p>
          </Card>
        </div>
        <div className="col-md-4">
          <Card
            className="premium-card text-center"
            style={{
              background: "linear-gradient(135deg, #D4AF37, #E8C547)",
              color: "white",
              border: "none",
            }}
          >
            <i
              className="pi pi-star mb-2"
              style={{ fontSize: "2.5rem", opacity: 0.9 }}
            ></i>
            <h3 style={{ fontWeight: "700", fontSize: "2rem" }}>100%</h3>
            <p className="mb-0" style={{ opacity: 0.95 }}>Verificadas</p>
          </Card>
        </div>
        <div className="col-md-4">
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
            <h3 style={{ fontWeight: "700", fontSize: "2rem" }}>24/7</h3>
            <p className="mb-0" style={{ opacity: 0.95 }}>Soporte</p>
          </Card>
        </div>
      </div>

      {/* Vista de Grid o Tabla */}
      {viewMode === "grid" ? (
        <div>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <span className="p-input-icon-left" style={{ width: "400px" }}>
              <i className="pi pi-search" />
              <InputText
                placeholder="Buscar propiedades..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-100"
                style={{
                  borderRadius: "25px",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  border: "2px solid rgba(135, 169, 107, 0.2)",
                }}
              />
            </span>
            <Button
              icon="pi pi-list"
              label="Vista de Tabla"
              className="p-button-outlined"
              onClick={() => setViewMode("table")}
            />
          </div>
          <div className="row">
            {propiedadesDisponibles
              .filter((p) =>
                globalFilter
                  ? p.nombre.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    p.direccion.toLowerCase().includes(globalFilter.toLowerCase())
                  : true
              )
              .map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
          </div>
        </div>
      ) : (
        <Card className="premium-card">
          <DataTable
            value={propiedadesDisponibles}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            responsiveLayout="scroll"
            emptyMessage="No hay propiedades disponibles"
            header={header}
            globalFilter={globalFilter}
            loading={loading}
            stripedRows
            className="p-datatable-sm"
          >
            <Column
              field="nombre"
              header="Propiedad"
              sortable
              style={{ minWidth: "200px", fontWeight: "600" }}
            />
            <Column
              field="direccion"
              header="Ubicación"
              body={addressTemplate}
              sortable
              style={{ minWidth: "200px" }}
            />
            <Column
              field="precio"
              header="Precio"
              body={priceTemplate}
              sortable
              style={{ minWidth: "130px" }}
            />
            <Column
              field="estado"
              header="Estado"
              body={statusTemplate}
              style={{ minWidth: "120px" }}
            />
            <Column
              header="Acción"
              body={actionTemplate}
              style={{ minWidth: "140px", textAlign: "center" }}
            />
          </DataTable>
        </Card>
      )}

      {/* Dialog de Solicitud */}
      <Dialog
        visible={visible}
        header={
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="pi pi-send" style={{ color: "var(--gold)" }}></i>
            <span style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
              Solicitar Propiedad
            </span>
          </div>
        }
        style={{ width: "600px" }}
        onHide={() => {
          setVisible(false);
          setSelectedProperty(null);
        }}
        draggable={false}
      >
        <div className="d-flex flex-column gap-3 py-3">
          <div
            className="alert"
            style={{
              background: "linear-gradient(135deg, rgba(135, 169, 107, 0.1), rgba(212, 175, 55, 0.1))",
              border: "2px solid var(--sage-green)",
              borderRadius: "15px",
              padding: "1.5rem",
            }}
          >
            <div className="d-flex align-items-start gap-3">
              <i
                className="pi pi-home"
                style={{ fontSize: "2.5rem", color: "var(--gold)" }}
              ></i>
              <div>
                <h5 style={{ color: "var(--primary-brown)", marginBottom: "0.5rem" }}>
                  {selectedProperty?.nombre}
                </h5>
                <p style={{ color: "var(--medium-text)", marginBottom: "0.5rem" }}>
                  <i className="pi pi-map-marker me-2"></i>
                  {selectedProperty?.direccion}
                </p>
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "var(--forest-green)",
                    marginBottom: 0,
                  }}
                >
                  ${(selectedProperty?.precio || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="form-label fw-semibold" style={{ color: "var(--primary-brown)" }}>
              <i className="pi pi-tag me-2"></i>
              Tipo de Operación *
            </label>
            <Dropdown
              value={tipoOperacion}
              options={operacionOptions}
              onChange={(e) => setTipoOperacion(e.value)}
              placeholder="Selecciona una opción"
              className="w-100"
              style={{ borderRadius: "10px" }}
            />
          </div>

          <div
            className="alert alert-info d-flex align-items-center"
            style={{
              background: "rgba(212, 175, 55, 0.1)",
              border: "1px solid var(--gold)",
              borderRadius: "10px",
            }}
          >
            <i className="pi pi-info-circle me-2" style={{ color: "var(--gold)" }}></i>
            <small>
              Un agente se pondrá en contacto contigo en las próximas 24 horas para
              coordinar una visita y completar el proceso.
            </small>
          </div>

          <div className="d-flex gap-2 justify-content-end mt-3">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => {
                setVisible(false);
                setSelectedProperty(null);
              }}
              style={{ color: "var(--medium-text)" }}
            />
            <Button
              label="Enviar Solicitud"
              icon="pi pi-check"
              className="btn-premium"
              onClick={handleSolicitud}
              style={{
                background: "linear-gradient(135deg, var(--forest-green), var(--sage-green))",
                border: "none",
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}