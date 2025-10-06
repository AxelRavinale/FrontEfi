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
import { useRentals } from "../../contexts/RentalsContext";
import { useProperties } from "../../contexts/PropertiesContext";
import { useClients } from "../../contexts/ClientsContext";

export default function AdminRentals() {
  const { rentals, updateRental, cancelRental, loading } = useRentals();
  const { properties } = useProperties();
  const { clients } = useClients();
  const [visible, setVisible] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [newEstado, setNewEstado] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const estadoOptions = [
    { label: "Pendiente", value: "pendiente" },
    { label: "Aprobado", value: "aprobado" },
    { label: "Activo", value: "activo" },
    { label: "Finalizado", value: "finalizado" },
    { label: "Cancelado", value: "cancelado" },
  ];

  const openChangeStatus = (rental) => {
    setSelectedRental(rental);
    setNewEstado(rental.estado || "pendiente");
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
        detail: error.message || "Error al actualizar",
      });
    }
  };

  const handleCancel = (rental) => {
    confirmDialog({
      message: `¿Está seguro de cancelar este alquiler?`,
      header: "Confirmar Cancelación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sí, cancelar",
      rejectLabel: "No",
      accept: async () => {
        try {
          await cancelRental(rental.id);
          toast.current.show({
            severity: "success",
            summary: "Cancelado",
            detail: "Alquiler cancelado exitosamente",
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
      activo: { severity: "success", label: "Activo" },
      finalizado: { severity: "secondary", label: "Finalizado" },
      cancelado: { severity: "danger", label: "Cancelado" },
    };
    const status = statusMap[rowData.estado] || statusMap.pendiente;
    return <Tag severity={status.severity} value={status.label} />;
  };

  const propertyTemplate = (rowData) => {
    // Buscar la propiedad relacionada
    const property = properties.find((p) => p.id === rowData.propertyId);
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
    // Buscar el cliente relacionado
    const client = clients.find((c) => c.id === rowData.userId);
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
    if (!rowData.createdAt) return <span className="text-muted">-</span>;
    const date = new Date(rowData.createdAt);
    return date.toLocaleDateString("es-AR");
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
      </div>
    );
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <span className="p-input-icon-left w-50">
        <i className="pi pi-search" />
        <InputText
          placeholder="Buscar alquileres..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-100"
        />
      </span>
      <div className="d-flex gap-2 align-items-center">
        <span className="text-muted">
          <i className="pi pi-info-circle me-2"></i>
          Total: {rentals.length} alquileres
        </span>
      </div>
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

      <Card className="premium-card">
        <DataTable
          value={rentals}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          responsiveLayout="scroll"
          emptyMessage="No hay alquileres registrados"
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
            field="estado"
            header="Estado"
            body={statusTemplate}
            sortable
            style={{ minWidth: "130px" }}
          />
          <Column
            header="Acciones"
            body={actionTemplate}
            style={{ minWidth: "140px", textAlign: "center" }}
          />
        </DataTable>
      </Card>

      {/* Dialog para cambiar estado */}
      <Dialog
        visible={visible}
        header={
          <span style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
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