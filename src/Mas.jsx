import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Mas() {
  const navigate = useNavigate();
  const [showSecurity, setShowSecurity] = useState(false);

  return (
    <div className="app-root">
      <div className="hero-glow" />

      <div className="app-inner">
        {/* HEADER SIMPLE */}
        <div className="app-header">
          <button
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <h2 className="header-title">⚙️ Más</h2>
        </div>

        <div className="mas-grid">
          {/* Finanzas */}
          <button
            className="mas-card"
            onClick={() => navigate("/finanzas")}
          >
            💰 Finanzas
            <span>Control de gastos e ingresos</span>
          </button>

          {/* TURNOS ← NUEVO BOTÓN 1️⃣ */}
          <button
            className="mas-card"
            onClick={() => navigate("/turnos")}
          >
            📅 Turnos
            <span>Lifting, depilación, hydrogloss</span>
          </button>

          {/* Claves (con modal de seguridad) */}
          <button
            className="mas-card secure"
            onClick={() => setShowSecurity(true)}
          >
            🔐 Claves
            <span>Protegido con PIN o patrón</span>
          </button>

          {/* Cumpleaños */}
          <button
            className="mas-card"
            onClick={() => navigate("/cumpleanos")}
          >
            🎂 Cumpleaños
            <span>Fechas importantes</span>
          </button>
        </div>
      </div>

      {/* MODAL SEGURIDAD (sin cambios) */}
      {showSecurity && (
        <div className="pin-overlay">
          <div className="pin-modal">
            <h3>🔐 Acceso protegido</h3>
            <p>Confirma para continuar</p>

            <button
              className="primary-btn"
              onClick={() => navigate("/claves")}
            >
              Continuar
            </button>

            <button
              className="cancel-btn"
              onClick={() => setShowSecurity(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mas;
