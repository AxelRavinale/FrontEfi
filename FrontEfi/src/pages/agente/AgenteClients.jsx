import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { useClients } from "../../contexts/ClientsContext";
import { useUsers } from "../../contexts/UsersContext";

export default function AgenteClients() {
  const { clients, createClient, updateClient, loading } = useClients();
  const { users } = useUsers();
  const [visible, setVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  // ✅ Campos según el backend
  const [formData, setFormData] = useState({
    documento_identidad: "",
    telefono: "",
    id_usuario: null,
  });
  
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  // ✅ Opciones de usuarios para el dropdown (solo clientes)
  const userOptions = users
    .filter(u => u.rol === 'cliente')
    .map(u => ({
      label: `${u.nombre} (${u.email})`,
      value: u.id
    }));

  const resetForm = () => {
    setFormData({
      documento_identidad: "",
      telefono: "",
      id_usuario: null,
    });
    setEditingClient(null);
  };

  const openNew = () => {
    resetForm();
    setVisible(true);
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setFormData({
      documento_identidad: client.documento_identidad || "",
      telefono: client.telefono || "",
      id_usuario: client.id_usuario || null,
    });
    setVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.documento_identidad || !formData.id_usuario) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Documento de identidad y usuario son obligatorios",
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
        detail: error.response?.data?.message || error.message || "Error en la operación",
      });
    }
  };

  const nombreTemplate = (rowData) => {
    return rowData.Usuario?.nombre || <span className="text-muted">Sin usuario</span>;
  };

  const emailTemplate = (rowData) => {
    return rowData.Usuario?.email ? (
      <a href={`mailto:${rowData.Usuario.email}`} className="text-decoration-none">
        <i className="pi pi-envelope me-2"></i>
        {rowData.Usuario.email}
      </a>
    ) : (
      <span className="text-muted">Sin email</span>
    );
  };

  const phoneTemplate = (rowData) => {
    return rowData.telefono ? (
      <span>
        <i className="pi pi-phone me-2"></i>
        {rowData.telefono}
      </span>
    ) : (
      <span className="text-muted">Sin teléfono</span>
    );
  };

  const documentTemplate = (rowData) => {
    return (
      <span>
        <i className="pi pi-id-card me-2"></i>
        {rowData.documento_identidad}
      </span>
    );
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
          icon="pi pi-eye"
          className="p-button-rounded p-button-info p-button-sm"
          tooltip="Ver Detalles"
          tooltipOptions={{ position: "top" }}
          onClick={() => {
            toast.current.show({
              severity: "info",
              summary: "Detalles",
              detail: `Cliente: ${rowData.Usuario?.nombre || 'Sin nombre'}`,
            });
          }}
        />
      </div>
    );
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center">
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
        onClick={openNew}
      />
    </div>
  );

  return (
    <div className="fade-in-up">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="elegant-title">Mis Clientes</h1>
        <p className="text-muted">
          Gestiona la base de datos de tus clientes
        </p>
      </div>

      <Card className="premium-card">
        <DataTable
          value={clients}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          responsiveLayout="scroll"
          emptyMessage="No hay clientes registrados"
          header={header}
          globalFilter={globalFilter}
          loading={loading}
          stripedRows
          className="p-datatable-sm"
        >
          <Column
            header="Documento"
            body={documentTemplate}
            sortable
            field="documento_identidad"
            style={{ minWidth: "150px" }}
          />
          <Column
            header="Nombre"
            body={nombreTemplate}
            sortable
            field="Usuario.nombre"
            style={{ minWidth: "200px" }}
          />
          <Column
            header="Email"
            body={emailTemplate}
            sortable
            field="Usuario.email"
            style={{ minWidth: "200px" }}
          />
          <Column
            header="Teléfono"
            body={phoneTemplate}
            sortable
            field="telefono"
            style={{ minWidth: "150px" }}
          />
          <Column
            header="Acciones"
            body={actionTemplate}
            style={{ minWidth: "120px", textAlign: "center" }}
          />
        </DataTable>
      </Card>

      {/* Dialog de formulario */}
      <Dialog
        visible={visible}
        header={
          <span style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
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
            <label className="form-label fw-semibold">Usuario *</label>
            <Dropdown
              value={formData.id_usuario}
              options={userOptions}
              onChange={(e) =>
                setFormData({ ...formData, id_usuario: e.value })
              }
              placeholder="Seleccione un usuario"
              filter
              className="w-100"
              disabled={editingClient}
            />
            {editingClient && (
              <small className="text-muted">El usuario no se puede cambiar en edición</small>
            )}
          </div>

          <div>
            <label className="form-label fw-semibold">Documento de Identidad *</label>
            <InputText
              placeholder="Ej: 12345678"
              value={formData.documento_identidad}
              onChange={(e) =>
                setFormData({ ...formData, documento_identidad: e.target.value })
              }
              className="w-100"
            />
          </div>

          <div>
            <label className="form-label fw-semibold">Teléfono</label>
            <InputText
              placeholder="Ej: +54 9 123 456-7890"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="w-100"
            />
          </div>

          <div
            className="alert alert-info d-flex align-items-center"
            style={{ background: "rgba(135, 169, 107, 0.1)", border: "1px solid var(--sage-green)" }}
          >
            <i className="pi pi-info-circle me-2"></i>
            <small>
              Como agente, puedes crear y editar clientes. Solo los
              administradores pueden eliminarlos.
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