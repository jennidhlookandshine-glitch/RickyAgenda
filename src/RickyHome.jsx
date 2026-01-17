import { Link } from "react-router-dom";

function RickyHome() {
  return (
    <div className="app-root">
      <div className="hero-glow" />

      <div className="app-inner">
        <h1 className="ricky-top">RICKY</h1>
      </div>

      {/* BARRA INFERIOR SIMPLE */}
      <div className="bottom-bar">
        <Link to="/notas" className="tab-button">📝 Notas</Link>
        <Link to="/calendario" className="tab-button">📅 Calendario</Link>
        <Link to="/mas" className="tab-button">⚙️ Más</Link>
      </div>
    </div>
  );
}

export default RickyHome;
