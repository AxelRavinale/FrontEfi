import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "pi-building",
      title: "Propiedades Premium",
      description: "Catálogo exclusivo de propiedades en las mejores ubicaciones",
      color: "var(--gold)",
    },
    {
      icon: "pi-users",
      title: "Atención Personalizada",
      description: "Equipo de agentes profesionales a tu disposición",
      color: "var(--sage-green)",
    },
    {
      icon: "pi-shield",
      title: "Transacciones Seguras",
      description: "Garantizamos transparencia en cada operación",
      color: "var(--primary-brown)",
    },
    {
      icon: "pi-heart",
      title: "Tu Hogar Ideal",
      description: "Encuentra el espacio perfecto para tu familia",
      color: "var(--light-gold)",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--cream) 0%, var(--off-white) 100%)",
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          background:
            "linear-gradient(135deg, rgba(107, 68, 35, 0.95), rgba(45, 80, 22, 0.95))",
          color: "white",
          padding: "5rem 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(212, 175, 55, 0.05) 2px, rgba(212, 175, 55, 0.05) 4px)",
          }}
        ></div>

        <div className="container text-center" style={{ position: "relative", zIndex: 2 }}>
          <div className="fade-in-up">
            <h1
              className="elegant-title mb-4"
              style={{
                fontSize: "3.5rem",
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              <i className="pi pi-home me-3"></i>
              Inmobiliaria Premium
            </h1>
            <p
              className="lead mb-5"
              style={{
                fontSize: "1.5rem",
                maxWidth: "700px",
                margin: "0 auto 2rem",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              Tu socio de confianza en el mercado inmobiliario. Encuentra el hogar de
              tus sueños o la inversión perfecta.
            </p>

            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Button
                label="Iniciar Sesión"
                icon="pi pi-sign-in"
                className="btn-premium p-3"
                style={{ fontSize: "1.1rem" }}
                onClick={() => navigate("/login")}
              />
              <Button
                label="Registrarse"
                icon="pi pi-user-plus"
                className="p-button-outlined p-3"
                style={{
                  fontSize: "1.1rem",
                  borderColor: "white",
                  color: "white",
                }}
                onClick={() => navigate("/register")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-5">
        <div className="text-center mb-5 fade-in-up">
          <h2 className="elegant-title mb-3">¿Por qué elegirnos?</h2>
          <p className="text-muted" style={{ fontSize: "1.1rem" }}>
            Ofrecemos una experiencia única en el mercado inmobiliario
          </p>
        </div>

        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <Card
                className="premium-card text-center h-100"
                style={{
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <i
                  className={`pi ${feature.icon} mb-3`}
                  style={{ fontSize: "3rem", color: feature.color }}
                ></i>
                <h4
                  style={{
                    color: "var(--primary-brown)",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  {feature.title}
                </h4>
                <p className="text-muted">{feature.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(135, 169, 107, 0.1))",
        }}
      >
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-3">
              <div className="fade-in-up">
                <h2
                  className="elegant-title mb-2"
                  style={{ fontSize: "3rem", color: "var(--gold)" }}
                >
                  500+
                </h2>
                <p className="text-muted fw-semibold">Propiedades</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="fade-in-up">
                <h2
                  className="elegant-title mb-2"
                  style={{ fontSize: "3rem", color: "var(--sage-green)" }}
                >
                  1000+
                </h2>
                <p className="text-muted fw-semibold">Clientes Felices</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="fade-in-up">
                <h2
                  className="elegant-title mb-2"
                  style={{ fontSize: "3rem", color: "var(--primary-brown)" }}
                >
                  15+
                </h2>
                <p className="text-muted fw-semibold">Años de Experiencia</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="fade-in-up">
                <h2
                  className="elegant-title mb-2"
                  style={{ fontSize: "3rem", color: "var(--forest-green)" }}
                >
                  50+
                </h2>
                <p className="text-muted fw-semibold">Agentes Expertos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-5 text-center">
        <Card
          className="premium-card p-5"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-brown), var(--forest-green))",
            color: "white",
            border: "none",
          }}
        >
          <h2
            className="mb-4"
            style={{ fontSize: "2.5rem", fontWeight: "700" }}
          >
            ¿Listo para encontrar tu próximo hogar?
          </h2>
          <p className="lead mb-4" style={{ fontSize: "1.3rem" }}>
            Únete a miles de personas que confiaron en nosotros
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button
              label="Explorar Propiedades"
              icon="pi pi-search"
              className="p-3"
              style={{
                background: "white",
                color: "var(--primary-brown)",
                border: "none",
                fontSize: "1.1rem",
              }}
              onClick={() => navigate("/login")}
            />
            <Button
              label="Contactar Asesor"
              icon="pi pi-phone"
              className="p-button-outlined p-3"
              style={{
                borderColor: "white",
                color: "white",
                fontSize: "1.1rem",
              }}
            />
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "var(--primary-brown)",
          color: "white",
          padding: "3rem 0 1rem",
          marginTop: "3rem",
        }}
      >
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 style={{ color: "var(--gold)", marginBottom: "1rem" }}>
                Inmobiliaria Premium
              </h5>
              <p style={{ opacity: 0.9 }}>
                Tu socio de confianza en el mercado inmobiliario desde hace más de
                15 años.
              </p>
            </div>
            <div className="col-md-4">
              <h5 style={{ color: "var(--gold)", marginBottom: "1rem" }}>
                Contacto
              </h5>
              <p style={{ opacity: 0.9 }}>
                <i className="pi pi-phone me-2"></i>+54 358 123-4567
              </p>
              <p style={{ opacity: 0.9 }}>
                <i className="pi pi-envelope me-2"></i>info@inmobiliaria.com
              </p>
              <p style={{ opacity: 0.9 }}>
                <i className="pi pi-map-marker me-2"></i>Río Cuarto, Córdoba
              </p>
            </div>
            <div className="col-md-4">
              <h5 style={{ color: "var(--gold)", marginBottom: "1rem" }}>
                Enlaces Rápidos
              </h5>
              <div className="d-flex flex-column gap-2">
                <Link
                  to="/login"
                  style={{ color: "white", opacity: 0.9, textDecoration: "none" }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  style={{ color: "white", opacity: 0.9, textDecoration: "none" }}
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
          <hr style={{ borderColor: "rgba(255,255,255,0.2)", margin: "2rem 0 1rem" }} />
          <div className="text-center" style={{ opacity: 0.7 }}>
            <p className="mb-0">
              © 2025 Inmobiliaria Premium. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;