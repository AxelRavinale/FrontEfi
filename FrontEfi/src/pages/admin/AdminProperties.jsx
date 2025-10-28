import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { TabView, TabPanel } from "primereact/tabview";
import { useProperties } from "../../contexts/PropertiesContext";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminProperties() {
  const { 
    properties, 
    tiposPropiedad,
    createProperty, 
    updateProperty, 
    deleteProperty,
    deletePropertyPermanente,
    getInactiveProperties,
    restoreProperty,
    loading 
  } = useProperties();
  
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Activas, 1: Inactivas
  const [inactiveProperties, setInactiveProperties] = useState([]);
  
  const [formData, setFormData] = useState({
    direccion: "",
    precio: 0,
    estado: "disponible",
    descripcion: "",
    tamaño: 0,
    tipo_id: null
  });
  
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const estadoOptions = [
    { label: "Disponible", value: "disponible" },
    { label: "Alquilada", value: "alquilada" },
    { label: "Vendida", value: "vendida" },
  ];

  // Convertir tipos de propiedad al formato de Dropdown
  const tipoOptions = tiposPropiedad.map(tipo => ({
    label: tipo.nombre,
    value: tipo.id
  }));

  // Cargar propiedades inactivas cuando cambiamos a la pestaña
  const handleTabChange = async (e) => {
    setActiveTab(e.index);
    if (e.index === 1) {
      try {
        const inactive = await getInactiveProperties();
        setInactiveProperties(inactive);
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar propiedades inactivas",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      direccion: "",
      precio: 0,
      estado: "disponible",
      descripcion: "",
      tamaño: 0,
      tipo_id: null
    });
    setEditingProperty(null);
  };

  const openNew = () => {
    resetForm();
    setVisible(true);
  };

  const openEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      direccion: property.direccion || "",
      precio: property.precio || 0,
      estado: property.estado || "disponible",
      descripcion: property.descripcion || "",
      tamaño: property.tamaño || 0,
      tipo_id: property.tipo_id || null
    });
    setVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.direccion || !formData.precio || !formData.tipo_id) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Dirección, precio y tipo son obligatorios",
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

  const handleDelete = (property) => {
    confirmDialog({
      message: `¿Desactivar la propiedad en "${property.direccion}"?`,
      header: "Desactivar Propiedad",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-warning",
      acceptLabel: "Sí, desactivar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await deleteProperty(property.id);
          toast.current.show({
            severity: "success",
            summary: "Desactivada",
            detail: "Propiedad desactivada exitosamente",
          });
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.message || "Error al desactivar",
          });
        }
      },
    });
  };

  const handleDeletePermanente = (property) => {
    confirmDialog({
      message: (
        <div>
          <p className="mb-3">
            <strong>⚠️ ADVERTENCIA:</strong> Esta acción eliminará permanentemente la propiedad:
          </p>
          <p className="mb-3" style={{ color: "var(--primary-brown)" }}>
            <strong>"{property.direccion}"</strong>
          </p>
          <p style={{ color: "red" }}>
            Esta acción NO se puede deshacer. ¿Está absolutamente seguro?
          </p>
        </div>
      ),
      header: "⚠️ Eliminación Permanente",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sí, eliminar permanentemente",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await deletePropertyPermanente(property.id);
          toast.current.show({
            severity: "warn",
            summary: "Eliminada",
            detail: "Propiedad eliminada permanentemente",
            life: 5000,
          });
          // Recargar propiedades inactivas
          const inactive = await getInactiveProperties();
          setInactiveProperties(inactive);
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.message || "Error al eliminar permanentemente",
          });
        }
      },
    });
  };

  const handleRestore = async (property) => {
    try {
      await restoreProperty(property.id);
      toast.current.show({
        severity: "success",
        summary: "Restaurada",
        detail: "Propiedad restaurada exitosamente",
      });
      // Recargar propiedades inactivas
      const inactive = await getInactiveProperties();
      setInactiveProperties(inactive);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Error al restaurar",
      });
    }
  };

  // Templates para columnas
  const statusTemplate = (rowData) => {
    const statusMap = {
      disponible: { severity: "success", label: "Disponible" },
      alquilada: { severity: "warning", label: "Alquilada" },
      vendida: { severity: "info", label: "Vendida" },
    };
    const status = statusMap[rowData.estado] || statusMap.disponible;
    return <Tag severity={status.severity} value={status.label} />;
  };

  const priceTemplate = (rowData) => {
    return `$${(rowData.precio || 0).toLocaleString()}`;
  };

  const tipoTemplate = (rowData) => {
    return rowData.TipoPropiedad?.nombre || 'N/A';
  };

  const agenteTemplate = (rowData) => {
    return rowData.Usuario?.nombre || 'N/A';
  };

  const actionTemplateActive = (rowData) => {
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
          icon="pi pi-ban"
          className="p-button-rounded p-button-warning p-button-sm"
          onClick={() => handleDelete(rowData)}
          tooltip="Desactivar"
          tooltipOptions={{ position: "top" }}
        />
        {user?.rol === 'admin' && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-danger p-button-sm"
            onClick={() => handleDeletePermanente(rowData)}
            tooltip="Eliminar Permanentemente"
            tooltipOptions={{ position: "top" }}
          />
        )}
      </div>
    );
  };

  const actionTemplateInactive = (rowData) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-refresh"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => handleRestore(rowData)}
          tooltip="Restaurar"
          tooltipOptions={{ position: "top" }}
        />
        {user?.rol === 'admin' && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-danger p-button-sm"
            onClick={() => handleDeletePermanente(rowData)}
            tooltip="Eliminar Permanentemente"
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
        onClick={openNew}
      />
    </div>
  );

  return (
    <div className="fade-in-up">
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="elegant-title">Gestión de Propiedades</h1>
        <p className="text-muted">
          Administra el catálogo completo de propiedades disponibles
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i className="pi pi-building mb-2" style={{ fontSize: "2rem", color: "var(--sage-green)" }}></i>
            <h4>{properties.length}</h4>
            <small className="text-muted">Total Propiedades</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i className="pi pi-check-circle mb-2" style={{ fontSize: "2rem", color: "var(--gold)" }}></i>
            <h4>{properties.filter((p) => p.estado === "disponible").length}</h4>
            <small className="text-muted">Disponibles</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i className="pi pi-key mb-2" style={{ fontSize: "2rem", color: "var(--light-brown)" }}></i>
            <h4>{properties.filter((p) => p.estado === "alquilada").length}</h4>
            <small className="text-muted">Alquiladas</small>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center">
            <i className="pi pi-dollar mb-2" style={{ fontSize: "2rem", color: "var(--forest-green)" }}></i>
            <h4>{properties.filter((p) => p.estado === "vendida").length}</h4>
            <small className="text-muted">Vendidas</small>
          </Card>
        </div>
      </div>

      <Card className="premium-card">
        <TabView activeIndex={activeTab} onTabChange={handleTabChange}>
          {/* TAB: Propiedades Activas */}
          <TabPanel header="Propiedades Activas" leftIcon="pi pi-building mr-2">
            <DataTable
              value={properties}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              responsiveLayout="scroll"
              emptyMessage="No hay propiedades activas"
              header={header}
              globalFilter={globalFilter}
              loading={loading}
              stripedRows
              className="p-datatable-sm"
            >
              <Column field="direccion" header="Dirección" sortable style={{ minWidth: "200px" }} />
              <Column field="TipoPropiedad.nombre" header="Tipo" body={tipoTemplate} sortable style={{ minWidth: "120px" }} />
              <Column field="precio" header="Precio" body={priceTemplate} sortable style={{ minWidth: "120px" }} />
              <Column field="tamaño" header="Tamaño (m²)" sortable style={{ minWidth: "100px" }} />
              <Column field="estado" header="Estado" body={statusTemplate} sortable style={{ minWidth: "120px" }} />
              <Column field="Usuario.nombre" header="Agente" body={agenteTemplate} sortable style={{ minWidth: "150px" }} />
              <Column header="Acciones" body={actionTemplateActive} style={{ minWidth: "180px", textAlign: "center" }} />
            </DataTable>
          </TabPanel>

          {/* TAB: Propiedades Inactivas (Solo Admin) */}
          {user?.rol === 'admin' && (
            <TabPanel header="Propiedades Inactivas" leftIcon="pi pi-ban mr-2">
              <DataTable
                value={inactiveProperties}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                responsiveLayout="scroll"
                emptyMessage="No hay propiedades inactivas"
                globalFilter={globalFilter}
                loading={loading}
                stripedRows
                className="p-datatable-sm"
              >
                <Column field="direccion" header="Dirección" sortable style={{ minWidth: "200px" }} />
                <Column field="TipoPropiedad.nombre" header="Tipo" body={tipoTemplate} sortable style={{ minWidth: "120px" }} />
                <Column field="precio" header="Precio" body={priceTemplate} sortable style={{ minWidth: "120px" }} />
                <Column field="tamaño" header="Tamaño (m²)" sortable style={{ minWidth: "100px" }} />
                <Column field="estado" header="Estado" body={statusTemplate} sortable style={{ minWidth: "120px" }} />
                <Column field="Usuario.nombre" header="Agente" body={agenteTemplate} sortable style={{ minWidth: "150px" }} />
                <Column header="Acciones" body={actionTemplateInactive} style={{ minWidth: "150px", textAlign: "center" }} />
              </DataTable>
            </TabPanel>
          )}
        </TabView>
      </Card>

      {/* Dialog de formulario */}
      <Dialog
        visible={visible}
        header={
          <span style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
            {editingProperty ? "Editar Propiedad" : "Nueva Propiedad"}
          </span>
        }
        style={{ width: "650px" }}
        onHide={() => {
          setVisible(false);
          resetForm();
        }}
        draggable={false}
      >
        <div className="d-flex flex-column gap-3 py-3">
          <div>
            <label className="form-label fw-semibold">Dirección *</label>
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
            <label className="form-label fw-semibold">Tipo de Propiedad *</label>
            <Dropdown
              value={formData.tipo_id}
              options={tipoOptions}
              onChange={(e) =>
                setFormData({ ...formData, tipo_id: e.value })
              }
              placeholder="Seleccione un tipo"
              className="w-100"
            />
          </div>

          <div className="row">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Precio *</label>
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
            <div className="col-md-6">
              <label className="form-label fw-semibold">Tamaño (m²)</label>
              <InputNumber
                value={formData.tamaño}
                onValueChange={(e) =>
                  setFormData({ ...formData, tamaño: e.value })
                }
                suffix=" m²"
                className="w-100"
              />
            </div>
          </div>

          <div>
            <label className="form-label fw-semibold">Estado</label>
            <Dropdown
              value={formData.estado}
              options={estadoOptions}
              onChange={(e) =>
                setFormData({ ...formData, estado: e.value })
              }
              placeholder="Seleccione un estado"
              className="w-100"
            />
          </div>

          <div>
            <label className="form-label fw-semibold">Descripción</label>
            <InputTextarea
              placeholder="Descripción detallada de la propiedad"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              rows={4}
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