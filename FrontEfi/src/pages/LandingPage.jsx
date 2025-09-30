function LandingPage() {
return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
    <h1>🏠 Bienvenido a Inmobiliaria Efi</h1>
    <p>Tu sistema de gestión de propiedades y alquileres.</p>
    <p>Podes explorar las propiedades disponibles o iniciar sesión para gestionar tu cuenta.</p>

    <a href="/login" style={{
        padding: "10px 20px",
        background: "#007BFF",
        color: "white",
        textDecoration: "none",
        borderRadius: "5px"
    }}>
        Iniciar Sesión
    </a>
    </div>
);
}

export default LandingPage;
