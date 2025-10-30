import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Slider } from "primereact/slider";
import { useProperties } from "../../contexts/PropertiesContext";
import { useRentals } from "../../contexts/RentalsContext";
import { useSales } from "../../contexts/SalesContext";
import { useAuth } from "../../contexts/AuthContext";

export default function ClientePropiedades() {
  const { properties, tiposPropiedad, loading } = useProperties();
  const { createRental } = useRentals();
  const { createSale } = useSales();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [tipoOperacion, setTipoOperacion] = useState("");
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  
  // ✅ FILTROS SIMPLES PARA CLIENTE
  const [filters, setFilters] = useState({
    tipos: [],
    precioMin: null,
    precioMax: null,
    tamañoMin: null,
    tamañoMax: null,
  });
  
  const toast = useRef(null);

  // Solo propiedades disponibles para clientes
  const propiedadesDisponibles = properties.filter(
    (p) => p.estado === "disponible"
  );

  // ✅ FUNCIÓN DE FILTRADO
  const getFilteredProperties = () => {
    let filtered = propiedadesDisponibles;

    // Filtro de búsqueda global
    if (globalFilter) {
      filtered = filtered.filter(p => 
        p.direccion.toLowerCase().includes(globalFilter.toLowerCase()) ||
        p.TipoPropiedad?.nombre.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }

    // Filtro por tipos
    if (filters.tipos.length > 0) {
      filtered = filtered.filter(p => filters.tipos.includes(p.tipo_id));
    }

    // Filtro por precio
    if (filters.precioMin !== null) {
      filtered = filtered.filter(p => parseFloat(p.precio) >= filters.precioMin);
    }
    if (filters.precioMax !== null) {
      filtered = filtered.filter(p => parseFloat(p.precio) <= filters.precioMax);
    }

    // Filtro por tamaño
    if (filters.tamañoMin !== null) {
      filtered = filtered.filter(p => parseFloat(p.tamaño || 0) >= filters.tamañoMin);
    }
    if (filters.tamañoMax !== null) {
      filtered = filtered.filter(p => parseFloat(p.tamaño || 0) <= filters.tamañoMax);
    }

    return filtered;
  };

  const filteredProperties = getFilteredProperties();

  const operacionOptions = [
    { label: "Alquilar", value: "alquiler" },
    { label: "Comprar", value: "compra" },
  ];

  const tipoOptions = tiposPropiedad.map(tipo => ({
    label: tipo.nombre,
    value: tipo.id
  }));

  const resetFilters = () => {
    setFilters({
      tipos: [],
      precioMin: null,
      precioMax: null,
      tamañoMin: null,
      tamañoMax: null,
    });
    setGlobalFilter("");
  };

  const openSolicitud = (property) => {
    setSelectedProperty(property);
    setTipoOperacion("");
    setFechaInicio(null);
    setFechaFin(null);
    setVisible(true);
  };

  const handleSolicitud = async () => {
    if (!user?.clienteId) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo identificar tu perfil de cliente. Por favor, contacta a soporte.",
      });
      return;
    }

    if (!tipoOperacion) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Debe seleccionar tipo de operación",
      });
      return;
    }

    if (tipoOperacion === "alquiler" && (!fechaInicio || !fechaFin)) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Debe seleccionar fechas de inicio y fin para el alquiler",
      });
      return;
    }

    confirmDialog({
      message: `¿Confirmar solicitud de ${tipoOperacion} para "${selectedProperty.direccion}"?`,
      header: "Confirmar Solicitud",
      icon: "pi pi-question-circle",
      acceptClassName: "btn-premium",
      acceptLabel: "Sí, solicitar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          if (tipoOperacion === "alquiler") {
            await createRental({
              id_propiedad: selectedProperty.id,
              id_cliente: user.clienteId,
              fecha_inicio: fechaInicio.toISOString().split('T')[0],
              fecha_fin: fechaFin.toISOString().split('T')[0],
              monto_mensual: selectedProperty.precio || 0,
            });
          } else {
            await createSale({
              id_propiedad: selectedProperty.id,
              id_cliente: user.clienteId,
              fecha_venta: new Date().toISOString().split('T')[0],
              monto_total: selectedProperty.precio || 0,
            });
          }
          
          toast.current.show({
            severity: "success",
            summary: "¡Solicitud Enviada!",
            detail: `Tu solicitud de ${tipoOperacion} ha sido enviada. Un agente se contactará contigo pronto.`,
            life: 5000,
          });
          setVisible(false);
          setSelectedProperty(null);
          setTipoOperacion("");
          setFechaInicio(null);
          setFechaFin(null);
        } catch (error) {
          console.error('❌ Error al enviar solicitud:', error);
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
            }}
          />
        </div>

        <div style={{ color: "var(--medium-text)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <i className="pi pi-map-marker" style={{ color: "var(--gold)" }}></i>
          {property.direccion}
        </div>

        <div style={{ color: "var(--medium-text)", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
          <i className="pi pi-tag me-2" style={{ color: "var(--sage-green)" }}></i>
          {property.TipoPropiedad?.nombre || 'Propiedad'}
        </div>

        <div style={{ color: "var(--medium-text)", marginBottom: "1rem", fontSize: "0.85rem" }}>
          <i className="pi pi-ruler me-2" style={{ color: "var(--light-brown)" }}></i>
          {property.tamaño || 'N/A'} m²
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

  const tipoTemplate = (rowData) => {
    return rowData.TipoPropiedad?.nombre || 'N/A';
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

  return (
    <div className="fade-in-up">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="elegant-title">Propiedades Disponibles</h1>
        <p className="text-muted">
          Explora nuestra selección premium de propiedades para alquiler y compra
        </p>
      </div>

      {/* Estadísticas y filtros */}
      <Card className="premium-card mb-4">
        <div className="row g-3 mb-3">
          <div className="col-md-12">
            <div className="d-flex gap-2 align-items-center justify-content-between">
              <span className="p-input-icon-left flex-grow-1" style={{ maxWidth: "400px" }}>
                <i className="pi pi-search" />
                <InputText
                  placeholder="Buscar por dirección o tipo..."
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
              <div className="d-flex gap-2">
                <Button
                  icon="pi pi-filter-slash"
                  label="Limpiar"
                  className="p-button-outlined"
                  onClick={resetFilters}
                />
                <Button
                  icon="pi pi-th-large"
                  className={viewMode === "grid" ? "btn-premium" : "p-button-outlined"}
                  onClick={() => setViewMode("grid")}
                  tooltip="Vista de tarjetas"
                />
                <Button
                  icon="pi pi-list"
                  className={viewMode === "table" ? "btn-premium" : "p-button-outlined"}
                  onClick={() => setViewMode("table")}
                  tooltip="Vista de tabla"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FILTROS SIMPLES */}
        <div className="row g-3" style={{ background: "rgba(135, 169, 107, 0.05)", padding: "1rem", borderRadius: "10px" }}>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>
              <i className="pi pi-tag me-2"></i>Tipo de Propiedad
            </label>
            <MultiSelect
              value={filters.tipos}
              options={tipoOptions}
              onChange={(e) => setFilters({ ...filters, tipos: e.value })}
              placeholder="Todas"
              className="w-100"
              display="chip"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>
              <i className="pi pi-dollar me-2"></i>Rango de Precio
            </label>
            <div className="d-flex gap-2">
              <InputNumber
                value={filters.precioMin}
                onValueChange={(e) => setFilters({ ...filters, precioMin: e.value })}
                placeholder="Mínimo"
                mode="currency"
                currency="USD"
                locale="en-US"
                className="w-100"
              />
              <InputNumber
                value={filters.precioMax}
                onValueChange={(e) => setFilters({ ...filters, precioMax: e.value })}
                placeholder="Máximo"
                mode="currency"
                currency="USD"
                locale="en-US"
                className="w-100"
              />
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>
              <i className="pi pi-ruler me-2"></i>Rango de m²
            </label>
            <div className="d-flex gap-2">
              <InputNumber
                value={filters.tamañoMin}
                onValueChange={(e) => setFilters({ ...filters, tamañoMin: e.value })}
                placeholder="Mínimo"
                suffix=" m²"
                className="w-100"
              />
              <InputNumber
                value={filters.tamañoMax}
                onValueChange={(e) => setFilters({ ...filters, tamañoMax: e.value })}
                placeholder="Máximo"
                suffix=" m²"
                className="w-100"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 d-flex align-items-center justify-content-between">
          <span style={{ color: "var(--forest-green)", fontWeight: "600" }}>
            <i className="pi pi-home me-2"></i>
            {filteredProperties.length} propiedades encontradas
          </span>
        </div>
      </Card>

      {/* Vista de Grid o Tabla */}
      {viewMode === "grid" ? (
        <div className="row">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
          {filteredProperties.length === 0 && (
            <div className="col-12 text-center py-5">
              <i className="pi pi-inbox" style={{ fontSize: "4rem", color: "var(--sage-green)", opacity: 0.3 }}></i>
              <h4 className="mt-3" style={{ color: "var(--medium-text)" }}>No se encontraron propiedades</h4>
              <p className="text-muted">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      ) : (
        <Card className="premium-card">
          <DataTable
            value={filteredProperties}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            responsiveLayout="scroll"
            emptyMessage="No hay propiedades disponibles con los filtros aplicados"
            loading={loading}
            stripedRows
            className="p-datatable-sm"
          >
            <Column field="direccion" header="Dirección" body={addressTemplate} sortable style={{ minWidth: "200px" }} />
            <Column field="TipoPropiedad.nombre" header="Tipo" body={tipoTemplate} sortable style={{ minWidth: "120px" }} />
            <Column field="precio" header="Precio" body={priceTemplate} sortable style={{ minWidth: "130px" }} />
            <Column field="tamaño" header="Tamaño (m²)" sortable style={{ minWidth: "100px" }} />
            <Column field="estado" header="Estado" body={statusTemplate} style={{ minWidth: "120px" }} />
            <Column header="Acción" body={actionTemplate} style={{ minWidth: "140px", textAlign: "center" }} />
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
          setTipoOperacion("");
          setFechaInicio(null);
          setFechaFin(null);
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
              <i className="pi pi-home" style={{ fontSize: "2.5rem", color: "var(--gold)" }}></i>
              <div>
                <h5 style={{ color: "var(--primary-brown)", marginBottom: "0.5rem" }}>
                  {selectedProperty?.direccion}
                </h5>
                <p style={{ color: "var(--medium-text)", marginBottom: "0.5rem" }}>
                  <i className="pi pi-tag me-2"></i>
                  {selectedProperty?.TipoPropiedad?.nombre || 'Propiedad'}
                </p>
                <p style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--forest-green)", marginBottom: 0 }}>
                  ${(selectedProperty?.precio || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="form-label fw-semibold" style={{ color: "var(--primary-brown)" }}>
              <i className="pi pi-tag me-2"></i>Tipo de Operación *
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

          {tipoOperacion === "alquiler" && (
            <>
              <div>
                <label className="form-label fw-semibold" style={{ color: "var(--primary-brown)" }}>
                  <i className="pi pi-calendar me-2"></i>Fecha de Inicio *
                </label>
                <Calendar
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.value)}
                  placeholder="Selecciona fecha de inicio"
                  className="w-100"
                  dateFormat="dd/mm/yy"
                  minDate={new Date()}
                  showIcon
                />
              </div>

              <div>
                <label className="form-label fw-semibold" style={{ color: "var(--primary-brown)" }}>
                  <i className="pi pi-calendar me-2"></i>Fecha de Fin *
                </label>
                <Calendar
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.value)}
                  placeholder="Selecciona fecha de fin"
                  className="w-100"
                  dateFormat="dd/mm/yy"
                  minDate={fechaInicio || new Date()}
                  showIcon
                />
              </div>
            </>
          )}

          <div className="alert alert-info d-flex align-items-center" style={{ background: "rgba(212, 175, 55, 0.1)", border: "1px solid var(--gold)", borderRadius: "10px" }}>
            <i className="pi pi-info-circle me-2" style={{ color: "var(--gold)" }}></i>
            <small>
              Un agente se pondrá en contacto contigo en las próximas 24 horas para coordinar una visita y completar el proceso.
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
                setTipoOperacion("");
                setFechaInicio(null);
                setFechaFin(null);
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