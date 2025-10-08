import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { useProperties } from "../../contexts/PropertiesContext";

export default function AgenteProperties() {
  const { properties, createProperty, updateProperty, loading } =
    useProperties();
  const [visible, setVisible] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    precio: 0,
    estado: "disponible",
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const estadoOptions = [
    { label: "Disponible", value: "disponible" },
    { label: "Alquilada", value: "alquilada" },
    { label: "Vendida", value: "vendida" },
  ];

  const resetForm = () => {
    setFormData({
      nombre: "",
      direccion: "",
      precio: 0,
      estado: "disponible",
    });
    setEditingProperty(null);
  };

  const openEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      nombre: property.nombre || "",
      direccion: property.direccion || "",
      precio: property.precio || 0,
      estado: property.estado || "disponible",
    });
    setVisible(true);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.nombre || !formData.direccion) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Nombre y dirección son obligatorios",
      });
      return;
    }

    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, formData);
        toast.current.show({
          severity: "success",
          summary: "Actualizado",
          detail: "Propiedad actualizada exitosamente",
        });
      } else {
        await createProperty(formData);
        toast.current.show({
          severity: "success",
          summary: "Creado",
          detail: "Propiedad creada exitosamente",
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

  // Templates para columnas
  const statusTemplate = (rowData) => {
    const statusMap = {
      disponible: { severity: "success", label: "Disponible" },
      alquilada: { severity: "warning", label: "Alquilada" },
      vendida: { severity: "info", label: "Vendida" },
      cancelado: { severity: "danger", label: "Cancelado" },
    };
    const status = statusMap[rowData.estado] || statusMap.disponible;
    return <Tag severity={status.severity} value={status.label} />;
  };

  const priceTemplate = (rowData) => {
    return `$${(rowData.precio || 0).toLocaleString()}`;
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
              detail: `Propiedad: ${rowData.nombre}`,
            });
          }}
        />
      </div>
    );
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
      <span className="p-input-icon-left w-50">
        <i className="pi pi-search" />
        <InputText
          placeholder="Buscar propiedades..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-100"
        />
      </span>
      <Button
        label="Nueva Propiedad"
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
        <h1 className="elegant-title">Mis Propiedades</h1>
        <p className="text-muted">
          Administra las propiedades que gestionas como agente
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-building mb-2"
              style={{ fontSize: "2rem", color: "var(--sage-green)" }}
            ></i>
            <h4>{properties.length}</h4>
            <small className="text-muted">Total Propiedades</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-check-circle mb-2"
              style={{ fontSize: "2rem", color: "var(--gold)" }}
            ></i>
            <h4>
              {properties.filter((p) => p.estado === "disponible").length}
            </h4>
            <small className="text-muted">Disponibles</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-key mb-2"
              style={{ fontSize: "2rem", color: "var(--light-brown)" }}
            ></i>
            <h4>{properties.filter((p) => p.estado === "alquilada").length}</h4>
            <small className="text-muted">Alquiladas</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i
              className="pi pi-dollar mb-2"
              style={{ fontSize: "2rem", color: "var(--forest-green)" }}
            ></i>
            <h4>{properties.filter((p) => p.estado === "vendida").length}</h4>
            <small className="text-muted">Vendidas</small>
          </Card>
        </div>
      </div>

      <Card className="premium-card">
        <DataTable
          value={properties}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          responsiveLayout="scroll"
          emptyMessage="No tienes propiedades registradas"
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
            field="direccion"
            header="Dirección"
            sortable
            style={{ minWidth: "200px" }}
          />
          <Column
            field="precio"
            header="Precio"
            body={priceTemplate}
            sortable
            style={{ minWidth: "120px" }}
          />
          <Column
            field="estado"
            header="Estado"
            body={statusTemplate}
            sortable
            style={{ minWidth: "120px" }}
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
            <i className="pi pi-building me-2"></i>
            {editingProperty ? "Editar Propiedad" : "Nueva Propiedad"}
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
              <i className="pi pi-home me-2"></i>
              Nombre de la Propiedad *
            </label>
            <InputText
              placeholder="Ej: Casa Moderna en Barrio Norte"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-100"
            />
          </div>

          <div>
            <label className="form-label fw-semibold">
              <i className="pi pi-map-marker me-2"></i>
              Dirección *
            </label>
            <InputText
              placeholder="Ej: Av. Libertador 1234"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className="w-100"
            />
          </div>

          <div>
            <label className="form-label fw-semibold">
              <i className="pi pi-dollar me-2"></i>
              Precio
            </label>
            <InputNumber
              value={formData.precio}
              onValueChange={(e) =>
                setFormData({ ...formData, precio: e.value })
              }
              mode="currency"
              currency="USD"
              locale="en-US"
              className="w-100"
            />
          </div>

          <div>
            <label className="form-label fw-semibold">
              <i className="pi pi-info-circle me-2"></i>
              Estado
            </label>
            <Dropdown
              value={formData.estado}
              options={estadoOptions}
              onChange={(e) => setFormData({ ...formData, estado: e.value })}
              placeholder="Seleccione un estado"
              className="w-100"
            />
          </div>

          <div
            className="alert alert-info d-flex align-items-center"
            style={{ background: "rgba(135, 169, 107, 0.1)", border: "1px solid var(--sage-green)" }}
          >
            <i className="pi pi-info-circle me-2"></i>
            <small>
              Como agente, puedes crear y editar propiedades. Solo los
              administradores pueden eliminarlas.
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