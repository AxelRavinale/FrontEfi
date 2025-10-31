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
import { confirmDialog } from "primereact/confirmdialog";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { useSales } from "../../contexts/SalesContext";
import { useProperties } from "../../contexts/PropertiesContext";
import { useUsers } from "../../contexts/UsersContext";

export default function AdminSales() {
  const { sales, updateSale, deleteSale, downloadRecibo, loading } = useSales();
  const { properties } = useProperties();
  const { users } = useUsers();
  
  const [visible, setVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [newEstado, setNewEstado] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [downloading, setDownloading] = useState(null); // Track which PDF is downloading
  
  // ✅ FILTROS AVANZADOS
  const [filters, setFilters] = useState({
    estados: [],
    propiedades: [],
    clientes: [],
    agentes: [],
    montoMin: null,
    montoMax: null,
    fechaDesde: null,
    fechaHasta: null,
  });
  
  const toast = useRef(null);

  const estadoOptions = [
    { label: "Finalizada", value: "finalizada" },
    { label: "Cancelada", value: "cancelada" },
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

  const agenteOptions = users
    .filter(u => u.rol === 'admin' || u.rol === 'agente')
    .map(u => ({
      label: u.nombre,
      value: u.id
    }));

  // ✅ FUNCIÓN DE FILTRADO
  const getFilteredSales = () => {
    let filtered = sales;

    // Filtro de búsqueda global
    if (globalFilter) {
      filtered = filtered.filter(s => 
        s.Propiedad?.direccion?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        s.Cliente?.Usuario?.nombre?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        s.Usuario?.nombre?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        s.id.toString().includes(globalFilter)
      );
    }

    // Filtro por estados
    if (filters.estados.length > 0) {
      filtered = filtered.filter(s => filters.estados.includes(s.estado));
    }

    // Filtro por propiedades
    if (filters.propiedades.length > 0) {
      filtered = filtered.filter(s => filters.propiedades.includes(s.id_propiedad));
    }

    // Filtro por clientes
    if (filters.clientes.length > 0) {
      filtered = filtered.filter(s => filters.clientes.includes(s.Cliente?.id_usuario));
    }

    // Filtro por agentes
    if (filters.agentes.length > 0) {
      filtered = filtered.filter(s => filters.agentes.includes(s.id_agente));
    }

    // Filtro por monto total
    if (filters.montoMin !== null) {
      filtered = filtered.filter(s => parseFloat(s.monto_total) >= filters.montoMin);
    }
    if (filters.montoMax !== null) {
      filtered = filtered.filter(s => parseFloat(s.monto_total) <= filters.montoMax);
    }

    // Filtro por fecha de venta
    if (filters.fechaDesde) {
      filtered = filtered.filter(s => new Date(s.fecha_venta) >= filters.fechaDesde);
    }
    if (filters.fechaHasta) {
      const fechaHastaEnd = new Date(filters.fechaHasta);
      fechaHastaEnd.setHours(23, 59, 59, 999);
      filtered = filtered.filter(s => new Date(s.fecha_venta) <= fechaHastaEnd);
    }

    return filtered;
  };

  const filteredSales = getFilteredSales();

  // Calcular estadísticas dinámicas
  const totalIngresos = filteredSales
    .filter((s) => s.estado === "finalizada")
    .reduce((acc, s) => acc + parseFloat(s.monto_total || 0), 0);

  const resetFilters = () => {
    setFilters({
      estados: [],
      propiedades: [],
      clientes: [],
      agentes: [],
      montoMin: null,
      montoMax: null,
      fechaDesde: null,
      fechaHasta: null,
    });
    setGlobalFilter("");
  };

  const openChangeStatus = (sale) => {
    setSelectedSale(sale);
    setNewEstado(sale.estado || "finalizada");
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
      await updateSale(selectedSale.id, { estado: newEstado });
      toast.current.show({
        severity: "success",
        summary: "Actualizado",
        detail: "Estado de la venta actualizado exitosamente",
      });
      setVisible(false);
      setSelectedSale(null);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || error.message || "Error al actualizar",
      });
    }
  };

  const handleDelete = (sale) => {
    confirmDialog({
      message: `¿Está seguro de eliminar esta venta?`,
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sí, eliminar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await deleteSale(sale.id);
          toast.current.show({
            severity: "success",
            summary: "Eliminado",
            detail: "Venta eliminada exitosamente",
          });
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.message || "Error al eliminar",
          });
        }
      },
    });
  };

  // ✅ NUEVA FUNCIÓN: Descargar recibo
  const handleDownloadRecibo = async (id) => {
    setDownloading(id);
    try {
      await downloadRecibo(id);
      toast.current.show({
        severity: "success",
        summary: "Descarga Exitosa",
        detail: "El recibo se ha descargado correctamente",
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error al Descargar",
        detail: error.response?.data?.message || error.message || "No se pudo descargar el recibo",
        life: 4000,
      });
    } finally {
      setDownloading(null);
    }
  };

  const statusTemplate = (rowData) => {
    const statusMap = {
      finalizada: { severity: "success", label: "Finalizada" },
      cancelada: { severity: "danger", label: "Cancelada" },
    };
    const status = statusMap[rowData.estado] || statusMap.finalizada;
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

  const dateTemplate = (rowData) => {
    if (!rowData.fecha_venta) return <span className="text-muted">-</span>;
    const date = new Date(rowData.fecha_venta);
    return date.toLocaleDateString("es-AR");
  };

  const amountTemplate = (rowData) => {
    return (
      <span style={{ color: "var(--forest-green)", fontWeight: "600" }}>
        ${(rowData.monto_total || 0).toLocaleString()}
      </span>
    );
  };

  const agenteTemplate = (rowData) => {
    return rowData.Usuario?.nombre ? (
      <span>
        <i className="pi pi-briefcase me-2" style={{ color: "var(--light-brown)" }}></i>
        {rowData.Usuario.nombre}
      </span>
    ) : (
      <span className="text-muted">Sin agente</span>
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
        {/* ✅ NUEVO: Botón de descarga de recibo */}
        {rowData.estado === "finalizada" && (
          <Button
            icon="pi pi-file-pdf"
            className="p-button-rounded p-button-help p-button-sm"
            onClick={() => handleDownloadRecibo(rowData.id)}
            tooltip="Descargar Recibo"
            tooltipOptions={{ position: "top" }}
            loading={downloading === rowData.id}
            disabled={downloading !== null}
          />
        )}
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData)}
          tooltip="Eliminar"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  const header = (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-between align-items-center">
        <span className="p-input-icon-left" style={{ width: "400px" }}>
          <i className="pi pi-search" />
          <InputText
            placeholder="Buscar por propiedad, cliente, agente o ID..."
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
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Agentes</label>
            <MultiSelect
              value={filters.agentes}
              options={agenteOptions}
              onChange={(e) => setFilters({ ...filters, agentes: e.value })}
              placeholder="Todos"
              className="w-100"
              display="chip"
              filter
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Monto Total (Min-Max)</label>
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
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Fecha Venta (Desde)</label>
            <Calendar
              value={filters.fechaDesde}
              onChange={(e) => setFilters({ ...filters, fechaDesde: e.value })}
              placeholder="Desde"
              dateFormat="dd/mm/yy"
              showIcon
              className="w-100"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Fecha Venta (Hasta)</label>
            <Calendar
              value={filters.fechaHasta}
              onChange={(e) => setFilters({ ...filters, fechaHasta: e.value })}
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
        <h1 className="elegant-title">Gestión de Ventas</h1>
        <p className="text-muted">
          Administra y supervisa todas las ventas del sistema
        </p>
      </div>

      {/* Estadísticas dinámicas */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-shopping-cart mb-2"
              style={{ fontSize: "2rem", color: "var(--gold)" }}
            ></i>
            <h4>{filteredSales.length}</h4>
            <small className="text-muted">Ventas Filtradas</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-check-circle mb-2"
              style={{ fontSize: "2rem", color: "var(--sage-green)" }}
            ></i>
            <h4>{filteredSales.filter((s) => s.estado === "finalizada").length}</h4>
            <small className="text-muted">Finalizadas</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-times-circle mb-2"
              style={{ fontSize: "2rem", color: "var(--light-brown)" }}
            ></i>
            <h4>{filteredSales.filter((s) => s.estado === "cancelada").length}</h4>
            <small className="text-muted">Canceladas</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-dollar mb-2"
              style={{ fontSize: "2rem", color: "var(--forest-green)" }}
            ></i>
            <h4>${totalIngresos.toLocaleString()}</h4>
            <small className="text-muted">Ingresos Filtrados</small>
          </Card>
        </div>
      </div>

      <Card className="premium-card">
        <DataTable
          value={filteredSales}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          responsiveLayout="scroll"
          emptyMessage="No se encontraron ventas con los filtros aplicados"
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
            header="Agente"
            body={agenteTemplate}
            sortable
            field="Usuario.nombre"
            style={{ minWidth: "150px" }}
          />
          <Column
            header="Fecha"
            body={dateTemplate}
            sortable
            field="fecha_venta"
            style={{ minWidth: "120px" }}
          />
          <Column
            header="Monto"
            body={amountTemplate}
            sortable
            field="monto_total"
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
            style={{ minWidth: "220px", textAlign: "center" }}
          />
        </DataTable>
      </Card>

      {/* Dialog para cambiar estado */}
      <Dialog
        visible={visible}
        header={
          <span style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
            <i className="pi pi-pencil me-2"></i>
            Cambiar Estado de la Venta
          </span>
        }
        style={{ width: "500px" }}
        onHide={() => {
          setVisible(false);
          setSelectedSale(null);
        }}
        draggable={false}
      >
        <div className="d-flex flex-column gap-3 py-3">
          <div className="alert alert-info">
            <i className="pi pi-info-circle me-2"></i>
            <strong>Venta #{selectedSale?.id}</strong>
            <br />
            Estado actual: <strong>{selectedSale?.estado}</strong>
            <br />
            Monto: <strong>${(selectedSale?.monto_total || 0).toLocaleString()}</strong>
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
                setSelectedSale(null);
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