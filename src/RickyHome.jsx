// src/RickyHome.jsx
import { Link } from "react-router-dom";

function RickyHome() {
  return (
    <div className="app-root">
      <div className="app-inner">
        <div className="ricky-top">RICKY</div>

        {/* Aquí solo se ve la portada con el fondo */}

        <div className="bottom-bar">
          <Link to="/notas" className="tab-button">
            NOTAS
          </Link>
          <Link to="/calendario" className="tab-button">
            CALENDARIO
          </Link>
          <Link to="/finanzas" className="tab-button">
            FINANZAS
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RickyHome;
