import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { useRentals } from "../../contexts/RentalsContext";
import { useProperties } from "../../contexts/PropertiesContext";
import { useUsers } from "../../contexts/UsersContext";

export default function AgenteRentals() {
  const { rentals, updateRental, downloadContrato, loading } = useRentals();
  const { properties } = useProperties();
  const { users } = useUsers();
  
  const [visible, setVisible] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [newEstado, setNewEstado] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [downloading, setDownloading] = useState(null); // Track which PDF is downloading
  
  // ✅ FILTROS AVANZADOS
  const [filters, setFilters] = useState({
    estados: [],
    propiedades: [],
    clientes: [],
    montoMin: null,
    montoMax: null,
    fechaInicioDesde: null,
    fechaInicioHasta: null,
    fechaFinDesde: null,
    fechaFinHasta: null,
  });
  
  const toast = useRef(null);

  const estadoOptions = [
    { label: "Activo", value: "activo" },
    { label: "Finalizado", value: "finalizado" },
    { label: "Cancelado", value: "cancelado" },
  ];

  // Opciones para filtros
  const propiedadOptions = properties.map(p => ({
    label: p.direccion,
    value: p.id
  }));

  const clienteOptions = users
    .filter(u => u.rol === 'cliente')
    .map(u => ({
      label: u.nombre,
      value: u.id
    }));

  // ✅ FUNCIÓN DE FILTRADO
  const getFilteredRentals = () => {
    let filtered = rentals;

    // Filtro de búsqueda global
    if (globalFilter) {
      filtered = filtered.filter(r => 
        r.Propiedad?.direccion?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        r.Cliente?.Usuario?.nombre?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        r.id.toString().includes(globalFilter)
      );
    }

    // Filtro por estados
    if (filters.estados.length > 0) {
      filtered = filtered.filter(r => filters.estados.includes(r.estado));
    }

    // Filtro por propiedades
    if (filters.propiedades.length > 0) {
      filtered = filtered.filter(r => filters.propiedades.includes(r.id_propiedad));
    }

    // Filtro por clientes
    if (filters.clientes.length > 0) {
      filtered = filtered.filter(r => filters.clientes.includes(r.Cliente?.id_usuario));
    }

    // Filtro por monto mensual
    if (filters.montoMin !== null) {
      filtered = filtered.filter(r => parseFloat(r.monto_mensual) >= filters.montoMin);
    }
    if (filters.montoMax !== null) {
      filtered = filtered.filter(r => parseFloat(r.monto_mensual) <= filters.montoMax);
    }

    // Filtro por fecha de inicio
    if (filters.fechaInicioDesde) {
      filtered = filtered.filter(r => new Date(r.fecha_inicio) >= filters.fechaInicioDesde);
    }
    if (filters.fechaInicioHasta) {
      const fechaHastaEnd = new Date(filters.fechaInicioHasta);
      fechaHastaEnd.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.fecha_inicio) <= fechaHastaEnd);
    }

    // Filtro por fecha de fin
    if (filters.fechaFinDesde) {
      filtered = filtered.filter(r => r.fecha_fin && new Date(r.fecha_fin) >= filters.fechaFinDesde);
    }
    if (filters.fechaFinHasta) {
      const fechaHastaEnd = new Date(filters.fechaFinHasta);
      fechaHastaEnd.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => r.fecha_fin && new Date(r.fecha_fin) <= fechaHastaEnd);
    }

    return filtered;
  };

  const filteredRentals = getFilteredRentals();

  const resetFilters = () => {
    setFilters({
      estados: [],
      propiedades: [],
      clientes: [],
      montoMin: null,
      montoMax: null,
      fechaInicioDesde: null,
      fechaInicioHasta: null,
      fechaFinDesde: null,
      fechaFinHasta: null,
    });
    setGlobalFilter("");
  };

  const openChangeStatus = (rental) => {
    setSelectedRental(rental);
    setNewEstado(rental.estado || "activo");
    setVisible(true);
  };

  const handleChangeStatus = async () => {
    if (!newEstado) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Debe seleccionar un estado",
      });
      return;
    }

    try {
      await updateRental(selectedRental.id, { estado: newEstado });
      toast.current.show({
        severity: "success",
        summary: "Actualizado",
        detail: "Estado del alquiler actualizado exitosamente",
      });
      setVisible(false);
      setSelectedRental(null);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || error.message || "Error al actualizar",
      });
    }
  };

  // ✅ NUEVA FUNCIÓN: Descargar contrato
  const handleDownloadContrato = async (id) => {
    setDownloading(id);
    try {
      await downloadContrato(id);
      toast.current.show({
        severity: "success",
        summary: "Descarga Exitosa",
        detail: "El contrato se ha descargado correctamente",
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error al Descargar",
        detail: error.response?.data?.message || error.message || "No se pudo descargar el contrato",
        life: 4000,
      });
    } finally {
      setDownloading(null);
    }
  };

  const statusTemplate = (rowData) => {
    const statusMap = {
      activo: { severity: "success", label: "Activo" },
      finalizado: { severity: "secondary", label: "Finalizado" },
      cancelado: { severity: "danger", label: "Cancelado" },
    };
    const status = statusMap[rowData.estado] || statusMap.activo;
    return <Tag severity={status.severity} value={status.label} />;
  };

  const propertyTemplate = (rowData) => {
    return rowData.Propiedad?.direccion ? (
      <span>
        <i className="pi pi-home me-2" style={{ color: "var(--gold)" }}></i>
        {rowData.Propiedad.direccion}
      </span>
    ) : (
      <span className="text-muted">Sin propiedad</span>
    );
  };

  const clientTemplate = (rowData) => {
    const userName = rowData.Cliente?.Usuario?.nombre;
    return userName ? (
      <span>
        <i className="pi pi-user me-2" style={{ color: "var(--sage-green)" }}></i>
        {userName}
      </span>
    ) : (
      <span className="text-muted">Sin cliente</span>
    );
  };

  const dateStartTemplate = (rowData) => {
    if (!rowData.fecha_inicio) return <span className="text-muted">-</span>;
    const date = new Date(rowData.fecha_inicio);
    return date.toLocaleDateString("es-AR");
  };

  const dateEndTemplate = (rowData) => {
    if (!rowData.fecha_fin) return <span className="text-muted">-</span>;
    const date = new Date(rowData.fecha_fin);
    return date.toLocaleDateString("es-AR");
  };

  const montoTemplate = (rowData) => {
    return (
      <span style={{ color: "var(--forest-green)", fontWeight: "600" }}>
        ${(rowData.monto_mensual || 0).toLocaleString()}/mes
      </span>
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning p-button-sm"
          onClick={() => openChangeStatus(rowData)}
          tooltip="Cambiar Estado"
          tooltipOptions={{ position: "top" }}
        />
        {/* ✅ NUEVO: Botón de descarga de contrato */}
        {(rowData.estado === "activo" || rowData.estado === "finalizado") && (
          <Button
            icon="pi pi-file-pdf"
            className="p-button-rounded p-button-help p-button-sm"
            onClick={() => handleDownloadContrato(rowData.id)}
            tooltip="Descargar Contrato"
            tooltipOptions={{ position: "top" }}
            loading={downloading === rowData.id}
            disabled={downloading !== null}
          />
        )}
      </div>
    );
  };

  const header = (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-between align-items-center">
        <span className="p-input-icon-left" style={{ width: "400px" }}>
          <i className="pi pi-search" />
          <InputText
            placeholder="Buscar por propiedad, cliente o ID..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-100"
          />
        </span>
        <div className="d-flex gap-2">
          <Button
            label="Limpiar Filtros"
            icon="pi pi-filter-slash"
            className="p-button-outlined"
            onClick={resetFilters}
          />
        </div>
      </div>

      {/* ✅ PANEL DE FILTROS AVANZADOS */}
      <Card className="p-3" style={{ background: "rgba(135, 169, 107, 0.05)" }}>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Estados</label>
            <MultiSelect
              value={filters.estados}
              options={estadoOptions}
              onChange={(e) => setFilters({ ...filters, estados: e.value })}
              placeholder="Todos"
              className="w-100"
              display="chip"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Propiedades</label>
            <MultiSelect
              value={filters.propiedades}
              options={propiedadOptions}
              onChange={(e) => setFilters({ ...filters, propiedades: e.value })}
              placeholder="Todas"
              className="w-100"
              display="chip"
              filter
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Clientes</label>
            <MultiSelect
              value={filters.clientes}
              options={clienteOptions}
              onChange={(e) => setFilters({ ...filters, clientes: e.value })}
              placeholder="Todos"
              className="w-100"
              display="chip"
              filter
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Monto Mensual (Min-Max)</label>
            <div className="d-flex gap-2">
              <InputNumber
                value={filters.montoMin}
                onValueChange={(e) => setFilters({ ...filters, montoMin: e.value })}
                placeholder="Min"
                mode="currency"
                currency="USD"
                locale="en-US"
                className="w-100"
              />
              <InputNumber
                value={filters.montoMax}
                onValueChange={(e) => setFilters({ ...filters, montoMax: e.value })}
                placeholder="Max"
                mode="currency"
                currency="USD"
                locale="en-US"
                className="w-100"
              />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Fecha Inicio (Desde)</label>
            <Calendar
              value={filters.fechaInicioDesde}
              onChange={(e) => setFilters({ ...filters, fechaInicioDesde: e.value })}
              placeholder="Desde"
              dateFormat="dd/mm/yy"
              showIcon
              className="w-100"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Fecha Inicio (Hasta)</label>
            <Calendar
              value={filters.fechaInicioHasta}
              onChange={(e) => setFilters({ ...filters, fechaInicioHasta: e.value })}
              placeholder="Hasta"
              dateFormat="dd/mm/yy"
              showIcon
              className="w-100"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Fecha Fin (Desde)</label>
            <Calendar
              value={filters.fechaFinDesde}
              onChange={(e) => setFilters({ ...filters, fechaFinDesde: e.value })}
              placeholder="Desde"
              dateFormat="dd/mm/yy"
              showIcon
              className="w-100"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Fecha Fin (Hasta)</label>
            <Calendar
              value={filters.fechaFinHasta}
              onChange={(e) => setFilters({ ...filters, fechaFinHasta: e.value })}
              placeholder="Hasta"
              dateFormat="dd/mm/yy"
              showIcon
              className="w-100"
            />
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="fade-in-up">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="elegant-title">Gestión de Alquileres</h1>
        <p className="text-muted">
          Administra y supervisa todos los alquileres del sistema
        </p>
      </div>

      {/* Estadísticas dinámicas */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i className="pi pi-key mb-2" style={{ fontSize: "2rem", color: "var(--sage-green)" }}></i>
            <h4>{filteredRentals.length}</h4>
            <small className="text-muted">Alquileres Filtrados</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i className="pi pi-check-circle mb-2" style={{ fontSize: "2rem", color: "var(--gold)" }}></i>
            <h4>{filteredRentals.filter((r) => r.estado === "activo").length}</h4>
            <small className="text-muted">Activos</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i className="pi pi-flag mb-2" style={{ fontSize: "2rem", color: "var(--light-brown)" }}></i>
            <h4>{filteredRentals.filter((r) => r.estado === "finalizado").length}</h4>
            <small className="text-muted">Finalizados</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i className="pi pi-times-circle mb-2" style={{ fontSize: "2rem", color: "#dc3545" }}></i>
            <h4>{filteredRentals.filter((r) => r.estado === "cancelado").length}</h4>
            <small className="text-muted">Cancelados</small>
          </Card>
        </div>
      </div>

      <Card className="premium-card">
        <DataTable
          value={filteredRentals}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          responsiveLayout="scroll"
          emptyMessage="No se encontraron alquileres con los filtros aplicados"
          header={header}
          loading={loading}
          stripedRows
          className="p-datatable-sm"
        >
          <Column
            field="id"
            header="ID"
            sortable
            style={{ minWidth: "80px" }}
          />
          <Column
            header="Propiedad"
            body={propertyTemplate}
            sortable
            field="Propiedad.direccion"
            style={{ minWidth: "200px" }}
          />
          <Column
            header="Cliente"
            body={clientTemplate}
            sortable
            style={{ minWidth: "180px" }}
          />
          <Column
            header="Inicio"
            body={dateStartTemplate}
            sortable
            field="fecha_inicio"
            style={{ minWidth: "120px" }}
          />
          <Column
            header="Fin"
            body={dateEndTemplate}
            sortable
            field="fecha_fin"
            style={{ minWidth: "120px" }}
          />
          <Column
            header="Monto"
            body={montoTemplate}
            sortable
            field="monto_mensual"
            style={{ minWidth: "130px" }}
          />
          <Column
            field="estado"
            header="Estado"
            body={statusTemplate}
            sortable
            style={{ minWidth: "130px" }}
          />
          <Column
            header="Acciones"
            body={actionTemplate}
            style={{ minWidth: "180px", textAlign: "center" }}
          />
        </DataTable>
      </Card>

      {/* Dialog para cambiar estado */}
      <Dialog
        visible={visible}
        header={
          <span style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
            <i className="pi pi-pencil me-2"></i>
            Cambiar Estado del Alquiler
          </span>
        }
        style={{ width: "500px" }}
        onHide={() => {
          setVisible(false);
          setSelectedRental(null);
        }}
        draggable={false}
      >
        <div className="d-flex flex-column gap-3 py-3">
          <div className="alert alert-info">
            <i className="pi pi-info-circle me-2"></i>
            <strong>Alquiler #{selectedRental?.id}</strong>
            <br />
            Estado actual: <strong>{selectedRental?.estado}</strong>
            <br />
            Monto mensual: <strong>${(selectedRental?.monto_mensual || 0).toLocaleString()}</strong>
          </div>

          <div>
            <label className="form-label fw-semibold">Nuevo Estado *</label>
            <Dropdown
              value={newEstado}
              options={estadoOptions}
              onChange={(e) => setNewEstado(e.value)}
              placeholder="Seleccione un estado"
              className="w-100"
            />
          </div>

          <div className="d-flex gap-2 justify-content-end mt-3">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => {
                setVisible(false);
                setSelectedRental(null);
              }}
            />
            <Button
              label="Actualizar"
              icon="pi pi-check"
              className="btn-premium"
              onClick={handleChangeStatus}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}