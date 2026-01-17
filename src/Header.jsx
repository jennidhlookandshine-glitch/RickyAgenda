import { useNavigate } from "react-router-dom";
import "./styles/Header.css"; // ruta correcta

export default function Header({ title, showBack = true }) {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      {showBack && (
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
      )}
      <div className="header-title">{title}</div>
    </header>
  );
}

