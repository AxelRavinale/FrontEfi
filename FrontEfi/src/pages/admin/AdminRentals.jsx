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

export default function AdminRentals() {
  const { rentals, updateRental, deleteRental, loading } = useRentals();
  const [visible, setVisible] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [newEstado, setNewEstado] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const estadoOptions = [
    { label: "Activo", value: "activo" },
    { label: "Finalizado", value: "finalizado" },
    { label: "Cancelado", value: "cancelado" },
  ];

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

  const handleDelete = (rental) => {
    confirmDialog({
      message: `¿Está seguro de eliminar este alquiler?`,
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sí, eliminar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await deleteRental(rental.id);
          toast.current.show({
            severity: "success",
            summary: "Eliminado",
            detail: "Alquiler eliminado exitosamente",
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