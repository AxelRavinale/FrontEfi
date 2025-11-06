import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { useProperties } from "../../contexts/PropertiesContext";
import { useRentals } from "../../contexts/RentalsContext";
import { useSales } from "../../contexts/SalesContext";
import { useClients } from "../../contexts/ClientsContext";
import { useUsers } from "../../contexts/UsersContext";

export default function AdminDashboard() {
  const { properties } = useProperties();
  const { rentals } = useRentals();
  const { sales } = useSales();
  const { clients } = useClients();
  const { users } = useUsers();

  const stats = {
    totalPropiedades: properties.length,
    disponibles: properties.filter((p) => p.estado === "disponible").length,
    alquiladas: properties.filter((p) => p.estado === "alquilada").length,
    vendidas: properties.filter((p) => p.estado === "vendida").length,
    totalAlquileres: rentals.length,
    totalVentas: sales.length,
    totalClientes: clients.length,
    totalUsuarios: users.length,
    ingresosTotales: sales.reduce((acc, s) => acc +  parseFloat(s.monto_total || 0), 0),
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
    labels: ["Alquileres", "Ventas"],
    datasets: [
      {
        label: "Operaciones",
        data: [stats.totalAlquileres, stats.totalVentas],
        backgroundColor: ["#D4AF37", "#6B4423"],
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
      <h1 className="elegant-title mb-4">Dashboard Administrativo</h1>
      <p className="text-muted mb-4">
        Panel de control y métricas del sistema inmobiliario
      </p>

      {/* Grid de estadísticas principales */}
      <div className="row g-4 mb-4">
        <StatCard
          title="Propiedades Totales"
          value={stats.totalPropiedades}
          icon="pi-building"
          color="var(--gold)"
          gradient="linear-gradient(135deg, #D4AF37, #E8C547)"
        />
        <StatCard
          title="Disponibles"
          value={stats.disponibles}
          icon="pi-check-circle"
          color="var(--sage-green)"
          gradient="linear-gradient(135deg, #87A96B, #a0c184)"
        />
        <StatCard
          title="Alquiladas"
          value={stats.alquiladas}
          icon="pi-key"
          color="var(--light-brown)"
          gradient="linear-gradient(135deg, #8B6F3F, #a38a5c)"
        />
        <StatCard
          title="Vendidas"
          value={stats.vendidas}
          icon="pi-dollar"
          color="var(--forest-green)"
          gradient="linear-gradient(135deg, #2D5016, #3d6a1f)"
        />
      </div>

      {/* Estadísticas secundarias */}
      <div className="row g-4 mb-4">
        <StatCard
          title="Total Clientes"
          value={stats.totalClientes}
          icon="pi-users"
          color="#6B4423"
          gradient="linear-gradient(135deg, #6B4423, #8B6F3F)"
        />
        <StatCard
          title="Total Usuarios"
          value={stats.totalUsuarios}
          icon="pi-user"
          color="#2D5016"
          gradient="linear-gradient(135deg, #2D5016, #87A96B)"
        />
        <StatCard
          title="Alquileres Activos"
          value={stats.totalAlquileres}
          icon="pi-bookmark"
          color="#D4AF37"
          gradient="linear-gradient(135deg, #D4AF37, #E8C547)"
        />
        <StatCard
          title="Ingresos Totales"
          value={`$${stats.ingresosTotales.toLocaleString()}`}
          icon="pi-money-bill"
          color="#2D5016"
          gradient="linear-gradient(135deg, #2D5016, #4a8028)"
        />
      </div>

      {/* Gráficos */}
      <div className="row g-4">
        <div className="col-md-6">
          <Card title="Estado de Propiedades" className="premium-card h-100">
            <Chart
              type="doughnut"
              data={chartDataPropiedades}
              options={chartOptions}
              style={{ maxHeight: "300px" }}
            />
          </Card>
        </div>
        <div className="col-md-6">
          <Card title="Operaciones Totales" className="premium-card h-100">
            <Chart
              type="bar"
              data={chartDataOperaciones}
              options={chartOptions}
              style={{ maxHeight: "300px" }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente StatCard reutilizable
function StatCard({ title, value, icon, color, gradient }) {
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