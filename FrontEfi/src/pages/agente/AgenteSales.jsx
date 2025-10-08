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
import { useProperties } from "../../contexts/PropertiesContext";
import { useClients } from "../../contexts/ClientsContext";

export default function AgenteSales() {
  const { sales, updateSale, cancelSale, loading } = useSales();
  const { properties } = useProperties();
  const { clients } = useClients();
  const [visible, setVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [newEstado, setNewEstado] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const estadoOptions = [
    { label: "Pendiente", value: "pendiente" },
    { label: "Aprobado", value: "aprobado" },
    { label: "Finalizado", value: "finalizado" },
    { label: "Cancelado", value: "cancelado" },
  ];

  const openChangeStatus = (sale) => {
    setSelectedSale(sale);
    setNewEstado(sale.estado || "pendiente");
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
        detail: error.message || "Error al actualizar",
      });
    }
  };

  const handleCancel = (sale) => {
    confirmDialog({
      message: `¿Está seguro de cancelar esta venta?`,
      header: "Confirmar Cancelación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sí, cancelar",
      rejectLabel: "No",
      accept: async () => {
        try {
          await cancelSale(sale.id);
          toast.current.show({
            severity: "success",
            summary: "Cancelado",
            detail: "Venta cancelada exitosamente",
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

  const statusTemplate = (rowData) => {
    const statusMap = {
      pendiente: { severity: "warning", label: "Pendiente" },
      aprobado: { severity: "info", label: "Aprobado" },
      finalizado: { severity: "success", label: "Finalizado" },
      cancelado: { severity: "danger", label: "Cancelado" },
    };
    const status = statusMap[rowData.estado] || statusMap.pendiente;
    return <Tag severity={status.severity} value={status.label} />;
  };

  const propertyTemplate = (rowData) => {
    const property = properties.find((p) => p.id === rowData.id_propiedad);
    return property ? (
      <span>
        <i className="pi pi-home me-2" style={{ color: "var(--gold)" }}></i>
        {property.nombre}
      </span>
    ) : (
      <span className="text-muted">Propiedad no encontrada</span>
    );
  };

  const clientTemplate = (rowData) => {
    const client = clients.find((c) => c.id === rowData.id_cliente);
    return client ? (
      <span>
        <i className="pi pi-user me-2" style={{ color: "var(--sage-green)" }}></i>
        {client.nombre}
      </span>
    ) : (
      <span className="text-muted">Cliente no encontrado</span>
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
        {rowData.estado !== "cancelado" && rowData.estado !== "finalizado" && (
          <Button
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-sm"
            onClick={() => handleCancel(rowData)}
            tooltip="Cancelar"
            tooltipOptions={{ position: "top" }}
          />
        )}
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
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
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
    .filter((s) => s.estado === "finalizado")
    .reduce((acc, s) => acc + (s.monto_total || 0), 0);

  return (
    <div className="fade-in-up">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="elegant-title">Mis Ventas</h1>
        <p className="text-muted">
          Gestiona las ventas de tus propiedades
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
              className="pi pi-clock mb-2"
              style={{ fontSize: "2rem", color: "var(--light-brown)" }}
            ></i>
            <h4>{sales.filter((s) => s.estado === "pendiente").length}</h4>
            <small className="text-muted">Pendientes</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-check-circle mb-2"
              style={{ fontSize: "2rem", color: "var(--sage-green)" }}
            ></i>
            <h4>{sales.filter((s) => s.estado === "finalizado").length}</h4>
            <small className="text-muted">Finalizadas</small>
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
          emptyMessage="No tienes ventas registradas"
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
            style={{ minWidth: "200px" }}
          />
          <Column
            header="Cliente"
            body={clientTemplate}
            sortable
            style={{ minWidth: "180px" }}
          />
          <Column
            header="Fecha"
            body={dateTemplate}
            sortable
            style={{ minWidth: "120px" }}
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
            <label className="form-label fw-semibold">
              <i className="pi pi-tag me-2"></i>
              Nuevo Estado *
            </label>
            <Dropdown
              value={newEstado}
              options={estadoOptions}
              onChange={(e) => setNewEstado(e.value)}
              placeholder="Seleccione un estado"
              className="w-100"
            />
          </div>

          <div
            className="alert alert-success d-flex align-items-center"
            style={{ background: "rgba(135, 169, 107, 0.1)", border: "1px solid var(--sage-green)" }}
          >
            <i className="pi pi-check-circle me-2"></i>
            <small>
              Como agente, puedes gestionar el estado de las ventas de tus propiedades.
            </small>
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