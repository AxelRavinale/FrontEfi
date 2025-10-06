import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { useUsers } from "../../contexts/UsersContext";

export default function AdminUsers() {
  const { users, createUser, updateUser, deleteUser, loading } = useUsers();
  const [visible, setVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: 18,
    password: "",
    rol: "cliente",
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const rolOptions = [
    { label: "Cliente", value: "cliente" },
    { label: "Agente", value: "agente" },
    { label: "Administrador", value: "admin" },
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      age: 18,
      password: "",
      rol: "cliente",
    });
    setEditingUser(null);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      age: user.age || 18,
      password: "", // No mostramos la contraseña actual
      rol: user.rol || "cliente",
    });
    setVisible(true);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.name || !formData.email) {
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

    // Si es nuevo usuario, la contraseña es obligatoria
    if (!editingUser && !formData.password) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "La contraseña es obligatoria para nuevos usuarios",
      });
      return;
    }

    try {
      if (editingUser) {
        // Si no hay password, no lo enviamos (mantiene el anterior)
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUser(editingUser.id, updateData);
        toast.current.show({
          severity: "success",
          summary: "Actualizado",
          detail: "Usuario actualizado exitosamente",
        });
      } else {
        await createUser(formData);
        toast.current.show({
          severity: "success",
          summary: "Creado",
          detail: "Usuario creado exitosamente",
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

  const handleDelete = (user) => {
    confirmDialog({
      message: `¿Está seguro de eliminar al usuario "${user.name}"?`,
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sí, eliminar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await deleteUser(user.id);
          toast.current.show({
            severity: "success",
            summary: "Eliminado",
            detail: "Usuario eliminado exitosamente",
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

  const rolTemplate = (rowData) => {
    const rolMap = {
      admin: { severity: "danger", label: "Administrador" },
      agente: { severity: "warning", label: "Agente" },
      cliente: { severity: "info", label: "Cliente" },
    };
    const rol = rolMap[rowData.rol] || rolMap.cliente;
    return <Tag severity={rol.severity} value={rol.label} />;
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
      </div>
    );
  };

  const emailTemplate = (rowData) => {
    return (
      <a href={`mailto:${rowData.email}`} className="text-decoration-none">
        <i className="pi pi-envelope me-2"></i>
        {rowData.email}
      </a>
    );
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <span className="p-input-icon-left w-50">
        <i className="pi pi-search" />
        <InputText
          placeholder="Buscar usuarios..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-100"
        />
      </span>
      <Button
        label="Nuevo Usuario"
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
        <h1 className="elegant-title">Gestión de Usuarios</h1>
        <p className="text-muted">
          Administra usuarios del sistema (admins, agentes, clientes)
        </p>
      </div>

      <Card className="premium-card">
        <DataTable
          value={users}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          responsiveLayout="scroll"
          emptyMessage="No hay usuarios registrados"
          header={header}
          globalFilter={globalFilter}
          loading={loading}
          stripedRows
          className="p-datatable-sm"
        >
          <Column
            field="name"
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
            field="age"
            header="Edad"
            sortable
            style={{ minWidth: "80px" }}
          />
          <Column
            field="rol"
            header="Rol"
            body={rolTemplate}
            sortable
            style={{ minWidth: "140px" }}
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
            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
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
            <label className="form-label fw-semibold">Nombre Completo *</label>
            <InputText
              placeholder="Ej: Juan Pérez"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-100"
            />
          </div>

          <div>
            <label className="form-label fw-semibold">Email *</label>
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
            <label className="form-label fw-semibold">Edad *</label>
            <InputNumber
              value={formData.age}
              onValueChange={(e) => setFormData({ ...formData, age: e.value })}
              min={18}
              max={120}
              className="w-100"
            />
          </div>

          <div>
            <label className="form-label fw-semibold">
              Contraseña {editingUser ? "(dejar vacío para mantener)" : "*"}
            </label>
            <Password
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={editingUser ? "Nueva contraseña" : "Contraseña"}
              toggleMask
              className="w-100"
              inputClassName="w-100"
            />
          </div>

          <div>
            <label className="form-label fw-semibold">Rol *</label>
            <Dropdown
              value={formData.rol}
              options={rolOptions}
              onChange={(e) => setFormData({ ...formData, rol: e.value })}
              placeholder="Seleccione un rol"
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