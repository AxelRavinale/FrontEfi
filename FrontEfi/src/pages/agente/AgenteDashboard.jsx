import React from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { useProperties } from "../../contexts/PropertiesContext";
import { useRentals } from "../../contexts/RentalsContext";
import { useSales } from "../../contexts/SalesContext";
import { useClients } from "../../contexts/ClientsContext";

export default function AgenteDashboard() {
  const { properties } = useProperties();
  const { rentals } = useRentals();
  const { sales } = useSales();
  const { clients } = useClients();

  const stats = {
    totalPropiedades: properties.length,
    disponibles: properties.filter((p) => p.estado === "disponible").length,
    alquiladas: properties.filter((p) => p.estado === "alquilada").length,
    vendidas: properties.filter((p) => p.estado === "vendida").length,
    totalAlquileres: rentals.length,
    alquileresActivos: rentals.filter((r) => r.estado === "activo").length,
    totalVentas: sales.length,
    ventasFinalizadas: sales.filter((s) => s.estado === "finalizado").length,
    totalClientes: clients.length,
    ingresosVentas: sales
      .filter((s) => s.estado === "finalizado")
      .reduce((acc, s) => acc +  parseFloat(s.monto_total || 0), 0),
  };

  const chartDataPropiedades = {
    labels: ["Disponibles", "Alquiladas", "Vendidas"],
    datasets: [
      {
        data: [stats.disponibles, stats.alquiladas, stats.vendidas],
        backgroundColor: ["#87A96B", "#8B6F3F", "#2D5016"],
        hoverBackgroundColor: ["#a0c184", "#a38a5c", "#3d6a1f"],
      },
    ],
  };

  const chartDataOperaciones = {
    labels: ["Alquileres Activos", "Ventas Finalizadas"],
    datasets: [
      {
        label: "Operaciones",
        data: [stats.alquileresActivos, stats.ventasFinalizadas],
        backgroundColor: ["#87A96B", "#D4AF37"],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="fade-in-up">
      <div className="mb-4">
        <h1 className="elegant-title">Panel del Agente</h1>
        <p className="text-muted">
          Bienvenido, gestiona tus propiedades y operaciones desde aquí
        </p>
      </div>

      {/* Grid de estadísticas principales */}
      <div className="row g-4 mb-4">
        <StatCard
          title="Mis Propiedades"
          value={stats.totalPropiedades}
          icon="pi-building"
          gradient="linear-gradient(135deg, #87A96B, #a0c184)"
        />
        <StatCard
          title="Disponibles"
          value={stats.disponibles}
          icon="pi-check-circle"
          gradient="linear-gradient(135deg, #D4AF37, #E8C547)"
        />
        <StatCard
          title="Alquileres"
          value={stats.totalAlquileres}
          icon="pi-key"
          gradient="linear-gradient(135deg, #8B6F3F, #a38a5c)"
        />
        <StatCard
          title="Ventas"
          value={stats.totalVentas}
          icon="pi-shopping-cart"
          gradient="linear-gradient(135deg, #2D5016, #3d6a1f)"
        />
      </div>

      {/* Estadísticas secundarias */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <Card className="premium-card text-center h-100">
            <i
              className="pi pi-users mb-3"
              style={{ fontSize: "2.5rem", color: "var(--sage-green)" }}
            ></i>
            <h3 style={{ color: "var(--primary-brown)", fontWeight: "700" }}>
              {stats.totalClientes}
            </h3>
            <p className="text-muted mb-0">Clientes Gestionados</p>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center h-100">
            <i
              className="pi pi-bookmark mb-3"
              style={{ fontSize: "2.5rem", color: "var(--light-brown)" }}
            ></i>
            <h3 style={{ color: "var(--primary-brown)", fontWeight: "700" }}>
              {stats.alquileresActivos}
            </h3>
            <p className="text-muted mb-0">Alquileres Activos</p>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center h-100">
            <i
              className="pi pi-check-square mb-3"
              style={{ fontSize: "2.5rem", color: "var(--gold)" }}
            ></i>
            <h3 style={{ color: "var(--primary-brown)", fontWeight: "700" }}>
              {stats.ventasFinalizadas}
            </h3>
            <p className="text-muted mb-0">Ventas Finalizadas</p>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="premium-card text-center h-100">
            <i
              className="pi pi-dollar mb-3"
              style={{ fontSize: "2.5rem", color: "var(--forest-green)" }}
            ></i>
            <h3 style={{ color: "var(--primary-brown)", fontWeight: "700" }}>
              ${stats.ingresosVentas.toLocaleString()}
            </h3>
            <p className="text-muted mb-0">Ingresos por Ventas</p>
          </Card>
        </div>
      </div>

      {/* Gráficos */}
      <div className="row g-4">
        <div className="col-md-6">
          <Card
            title="Estado de Mis Propiedades"
            className="premium-card h-100"
          >
            <Chart
              type="doughnut"
              data={chartDataPropiedades}
              options={chartOptions}
              style={{ maxHeight: "300px" }}
            />
          </Card>
        </div>
        <div className="col-md-6">
          <Card
            title="Mis Operaciones Activas"
            className="premium-card h-100"
          >
            <Chart
              type="bar"
              data={chartDataOperaciones}
              options={chartOptions}
              style={{ maxHeight: "300px" }}
            />
          </Card>
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="row mt-4">
        <div className="col-12">
          <Card
            className="premium-card text-center p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(135, 169, 107, 0.1), rgba(212, 175, 55, 0.1))",
              border: "2px solid var(--sage-green)",
            }}
          >
            <i
              className="pi pi-trophy mb-3"
              style={{ fontSize: "3rem", color: "var(--gold)" }}
            ></i>
            <h4 style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
              ¡Excelente trabajo!
            </h4>
            <p className="text-muted mb-0">
              Continúa gestionando tus propiedades y brindando el mejor servicio
              a tus clientes
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente StatCard reutilizable
function StatCard({ title, value, icon, gradient }) {
  return (
    <div className="col-md-3">
      <Card
        className="premium-card text-center h-100"
        style={{
          background: gradient,
          color: "white",
          border: "none",
        }}
      >
        <i
          className={`pi ${icon} mb-3`}
          style={{ fontSize: "3rem", opacity: 0.9 }}
        ></i>
        <h2 className="mb-2" style={{ fontWeight: "700", fontSize: "2.5rem" }}>
          {value}
        </h2>
        <p className="mb-0" style={{ fontSize: "1rem", opacity: 0.95 }}>
          {title}
        </p>
      </Card>
    </div>
  );
}