import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { useSales } from "../../contexts/SalesContext";

export default function AdminSales() {
  const { sales, updateSale, deleteSale, loading } = useSales();
  const [visible, setVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [newEstado, setNewEstado] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const estadoOptions = [
    { label: "Finalizada", value: "finalizada" },
    { label: "Cancelada", value: "cancelada" },
  ];

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

  // ✅ Templates corregidos
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
    // Cliente tiene relación con Usuario
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
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData)}
          tooltip="Eliminar"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-file-pdf"
          className="p-button-rounded p-button-help p-button-sm"
          onClick={() => {
            toast.current.show({
              severity: "info",
              summary: "PDF",
              detail: "Función de descarga en desarrollo",
            });
          }}
          tooltip="Descargar Recibo"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <span className="p-input-icon-left w-50">
        <i className="pi pi-search" />
        <InputText
          placeholder="Buscar ventas..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-100"
        />
      </span>
      <div className="d-flex gap-2 align-items-center">
        <span className="text-muted">
          <i className="pi pi-info-circle me-2"></i>
          Total: {sales.length} ventas
        </span>
      </div>
    </div>
  );

  // Calcular estadísticas
  const totalIngresos = sales
    .filter((s) => s.estado === "finalizada")
    .reduce((acc, s) => acc + (s.monto_total || 0), 0);

  return (
    <div className="fade-in-up">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="elegant-title">Gestión de Ventas</h1>
        <p className="text-muted">
          Administra y supervisa todas las ventas del sistema
        </p>
      </div>

      {/* Estadística rápida */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-shopping-cart mb-2"
              style={{ fontSize: "2rem", color: "var(--gold)" }}
            ></i>
            <h4>{sales.length}</h4>
            <small className="text-muted">Total Ventas</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-check-circle mb-2"
              style={{ fontSize: "2rem", color: "var(--sage-green)" }}
            ></i>
            <h4>{sales.filter((s) => s.estado === "finalizada").length}</h4>
            <small className="text-muted">Finalizadas</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-times-circle mb-2"
              style={{ fontSize: "2rem", color: "var(--light-brown)" }}
            ></i>
            <h4>{sales.filter((s) => s.estado === "cancelada").length}</h4>
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
            <small className="text-muted">Ingresos Totales</small>
          </Card>
        </div>
      </div>

      <Card className="premium-card">
        <DataTable
          value={sales}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          responsiveLayout="scroll"
          emptyMessage="No hay ventas registradas"
          header={header}
          globalFilter={globalFilter}
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
            style={{ minWidth: "180px", textAlign: "center" }}
          />
        </DataTable>
      </Card>

      {/* Dialog para cambiar estado */}
      <Dialog
        visible={visible}
        header={
          <span style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
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