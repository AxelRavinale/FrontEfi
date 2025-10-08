import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { Card } from "primereact/card";
import { useClients } from "../../contexts/ClientsContext";

export default function AgenteClients() {
  const { clients, createClient, updateClient, deleteClient, loading } =
    useClients();
  const [visible, setVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
    });
    setEditingClient(null);
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setFormData({
      nombre: client.nombre || "",
      email: client.email || "",
      telefono: client.telefono || "",
    });
    setVisible(true);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.nombre || !formData.email) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Nombre y email son obligatorios",
      });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Email inválido",
      });
      return;
    }

    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
        toast.current.show({
          severity: "success",
          summary: "Actualizado",
          detail: "Cliente actualizado exitosamente",
        });
      } else {
        await createClient(formData);
        toast.current.show({
          severity: "success",
          summary: "Creado",
          detail: "Cliente creado exitosamente",
        });
      }
      setVisible(false);
      resetForm();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Error en la operación",
      });
    }
  };

  const handleDelete = (client) => {
    confirmDialog({
      message: `¿Está seguro de eliminar al cliente "${client.nombre}"?`,
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sí, eliminar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await deleteClient(client.id);
          toast.current.show({
            severity: "success",
            summary: "Eliminado",
            detail: "Cliente eliminado exitosamente",
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

  const actionTemplate = (rowData) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning p-button-sm"
          onClick={() => openEdit(rowData)}
          tooltip="Editar"
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
          icon="pi pi-phone"
          className="p-button-rounded p-button-success p-button-sm"
          tooltip="Contactar"
          tooltipOptions={{ position: "top" }}
          onClick={() => {
            toast.current.show({
              severity: "info",
              summary: "Contacto",
              detail: `Contactando a ${rowData.nombre}`,
            });
          }}
        />
      </div>
    );
  };

  const emailTemplate = (rowData) => {
    return (
      <a href={`mailto:${rowData.email}`} className="text-decoration-none">
        <i className="pi pi-envelope me-2" style={{ color: "var(--sage-green)" }}></i>
        {rowData.email}
      </a>
    );
  };

  const phoneTemplate = (rowData) => {
    return rowData.telefono ? (
      <a href={`tel:${rowData.telefono}`} className="text-decoration-none">
        <i className="pi pi-phone me-2" style={{ color: "var(--gold)" }}></i>
        {rowData.telefono}
      </a>
    ) : (
      <span className="text-muted">Sin teléfono</span>
    );
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
      <span className="p-input-icon-left w-50">
        <i className="pi pi-search" />
        <InputText
          placeholder="Buscar clientes..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-100"
        />
      </span>
      <Button
        label="Nuevo Cliente"
        icon="pi pi-plus"
        className="btn-premium"
        onClick={() => {
          resetForm();
          setVisible(true);
        }}
      />
    </div>
  );

  return (
    <div className="fade-in-up">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="elegant-title">Mis Clientes</h1>
        <p className="text-muted">
          Administra tu cartera de clientes y mantén contacto directo
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="premium-card text-center">
            <i
              className="pi pi-users mb-2"
              style={{ fontSize: "2rem", color: "var(--sage-green)" }}
            ></i>
            <h4>{clients.length}</h4>
            <small className="text-muted">Total Clientes</small>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="premium-card text-center">
            <i
              className="pi pi-envelope mb-2"
              style={{ fontSize: "2rem", color: "var(--gold)" }}
            ></i>
            <h4>{clients.filter((c) => c.email).length}</h4>
            <small className="text-muted">Con Email</small>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="premium-card text-center">
            <i
              className="pi pi-phone mb-2"
              style={{ fontSize: "2rem", color: "var(--primary-brown)" }}
            ></i>
            <h4>{clients.filter((c) => c.telefono).length}</h4>
            <small className="text-muted">Con Teléfono</small>
          </Card>
        </div>
      </div>

      <Card className="premium-card">
        <DataTable
          value={clients}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          responsiveLayout="scroll"
          emptyMessage="No tienes clientes registrados"
          header={header}
          globalFilter={globalFilter}
          loading={loading}
          stripedRows
          className="p-datatable-sm"
        >
          <Column
            field="nombre"
            header="Nombre"
            sortable
            style={{ minWidth: "200px" }}
          />
          <Column
            field="email"
            header="Email"
            body={emailTemplate}
            sortable
            style={{ minWidth: "200px" }}
          />
          <Column
            field="telefono"
            header="Teléfono"
            body={phoneTemplate}
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

      {/* Dialog de formulario */}
      <Dialog
        visible={visible}
        header={
          <span style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
            <i className="pi pi-user me-2"></i>
            {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
          </span>
        }
        style={{ width: "600px" }}
        onHide={() => {
          setVisible(false);
          resetForm();
        }}
        draggable={false}
      >
        <div className="d-flex flex-column gap-3 py-3">
          <div>
            <label className="form-label fw-semibold">
              <i className="pi pi-user me-2"></i>
              Nombre Completo *
            </label>
            <InputText
              placeholder="Ej: Juan Pérez"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-100"
            />
          </div>

          <div>
            <label className="form-label fw-semibold">
              <i className="pi pi-envelope me-2"></i>
              Email *
            </label>
            <InputText
              type="email"
              placeholder="Ej: juan@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-100"
            />
          </div>

          <div>
            <label className="form-label fw-semibold">
              <i className="pi pi-phone me-2"></i>
              Teléfono
            </label>
            <InputText
              placeholder="Ej: +54 9 358 123-4567"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="w-100"
            />
          </div>

          <div
            className="alert alert-success d-flex align-items-center"
            style={{ background: "rgba(135, 169, 107, 0.1)", border: "1px solid var(--sage-green)" }}
          >
            <i className="pi pi-info-circle me-2"></i>
            <small>
              Mantén actualizada la información de contacto de tus clientes para
              brindarles un mejor servicio.
            </small>
          </div>

          <div className="d-flex gap-2 justify-content-end mt-3">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => {
                setVisible(false);
                resetForm();
              }}
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              className="btn-premium"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}