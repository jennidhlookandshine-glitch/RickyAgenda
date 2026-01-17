// src/RickyBirthdaysView.jsx - COMPLETO CON EDITAR + CONFIRMACIÓN
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import capitanAlerta from "./assets/capitan-alerta.jpg";

function RickyBirthdaysView() {
  const [name, setName] = useState("");
  const [date, setDate] = useState(""); // DD-MM
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Cargar cumpleaños desde localStorage (una sola vez)
  const [birthdays, setBirthdays] = useState(() => {
    try {
      const saved = localStorage.getItem("ricky_birthdays");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loadedRef = useRef(false);

  // marcar fin de carga inicial
  useEffect(() => {
    loadedRef.current = true;
  }, []);

  // Guardar solo después de cargar
  useEffect(() => {
    if (!loadedRef.current) return;
    localStorage.setItem("ricky_birthdays", JSON.stringify(birthdays));
  }, [birthdays]);

  // ✅ ESTADOS PARA CONFIRMACIÓN ELIMINAR
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAddOrEdit = (e) => {
    e.preventDefault();
    if (!name.trim() || !date.trim()) return;

    const [dayStr, monthStr] = date.split("-");
    const day = Number(dayStr);
    const month = Number(monthStr);

    if (
      Number.isNaN(day) ||
      Number.isNaN(month) ||
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12
    ) {
      alert("Formato inválido. Usa DD-MM");
      return;
    }

    if (editingId) {
      // ✅ EDITAR existente
      const updated = birthdays.map((b) =>
        b.id === editingId
          ? {
              ...b,
              name: name.trim(),
              date: `${dayStr.padStart(2, "0")}-${monthStr.padStart(2, "0")}`,
              note: note.trim(),
              day,
              month,
            }
          : b
      );
      setBirthdays(updated);
      setEditingId(null);
    } else {
      // Crear nuevo
      const exists = birthdays.some(
        (b) =>
          b.name.toLowerCase() === name.trim().toLowerCase() &&
          b.day === day &&
          b.month === month
      );

      if (exists) {
        alert("Este cumpleaños ya está guardado 🎂");
        return;
      }

      const newBirthday = {
        id: Date.now(),
        name: name.trim(),
        date: `${dayStr.padStart(2, "0")}-${monthStr.padStart(2, "0")}`,
        note: note.trim(),
        day,
        month,
      };

      const updated = [...birthdays, newBirthday].sort((a, b) =>
        a.month !== b.month ? a.month - b.month : a.day - b.day
      );
      setBirthdays(updated);
    }

    setName("");
    setDate("");
    setNote("");
  };

  // ✅ PREGUNTAR ANTES DE BORRAR
  const handleAskDelete = (birthday) => {
    setDeleteTarget(birthday);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setBirthdays((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // ✅ EDITAR cumpleaños
  const handleEdit = (birthday) => {
    setEditingId(birthday.id);
    setName(birthday.name);
    setDate(birthday.date);
    setNote(birthday.note || "");
  };

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;

  return (
    <div
      className="app-root"
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
     

      {/* ✅ CONTENIDO */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header title="🎂 Cumpleaños" showBack={true} />

        <div className="app-inner" style={{ flex: 1, overflowY: "auto" }}>
          <div className="notes-wrapper">
            <form onSubmit={handleAddOrEdit} style={{ marginBottom: 20 }}>
              <input
                type="text"
                className="note-input"
                placeholder="Nombre (ej: Jenni)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginBottom: 8 }}
              />

              <input
                type="text"
                className="note-input"
                placeholder="DD-MM (ej: 25-12)"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ marginBottom: 8 }}
              />

              <input
                type="text"
                className="note-input"
                placeholder="Nota (opcional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ marginBottom: 12 }}
              />

              <button type="submit" className="add-note-button">
                {editingId ? "Guardar cambios" : "Guardar cumpleaños 🎂"}
              </button>
            </form>

            {birthdays.length === 0 ? (
              <p className="no-notes-text">
                Aún no tienes cumpleaños guardados. 
                <br />
                Agrega el primero arriba 🎈
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {birthdays.map((b) => {
                  const isToday = b.day === todayDay && b.month === todayMonth;

                  return (
                    <div
                      key={b.id}
                      style={{
                        padding: 16,
                        borderRadius: 16,
                        background: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(148,163,184,0.6)",
                        boxShadow: isToday 
                          ? "0 0 20px rgba(239,68,68,0.6)" 
                          : "0 10px 25px rgba(0,0,0,0.5)",
                        borderLeft: isToday ? "4px solid #ef4444" : "4px solid #38bdf8",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <strong style={{ 
                          fontSize: "1.1rem", 
                          color: isToday ? "#ef4444" : "#e5e7eb",
                          textShadow: isToday ? "0 0 10px rgba(239,68,68,0.5)" : "none"
                        }}>
                          {b.name} {isToday && "🎉 HOY!"}
                        </strong>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => handleEdit(b)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 999,
                              border: "none",
                              background: "rgba(59,130,246,0.9)",
                              color: "#fff",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleAskDelete(b)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 999,
                              border: "none",
                              background: "#ef4444",
                              color: "#fff",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: 4 }}>
                        {b.date}
                      </div>
                      
                      {b.note && (
                        <div style={{ color: "#e5e7eb", fontSize: "0.85rem" }}>
                          {b.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

     
      </div>

      {/* ✅ MODAL CONFIRMACIÓN ELIMINAR (igual que los demás) */}
      {showDeleteModal && deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 4000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: 360,
              background: "radial-gradient(circle at top, #1e3a8a, #020617)",
              borderRadius: 16,
              padding: 20,
              border: "1px solid rgba(125,249,255,0.7)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.9), 0 0 18px rgba(59,130,246,0.7)",
              color: "#e5e7eb",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              src={capitanAlerta}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.18,
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <h3 style={{ margin: "0 0 12px" }}>¿Eliminar cumpleaños?</h3>
              <p style={{ margin: "0 0 20px", fontSize: "0.9rem" }}>
                Vas a borrar <strong style={{ color: "#f97316" }}>{deleteTarget.name}</strong>.<br/>
                Esta acción no se puede deshacer.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={handleCancelDelete}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 999,
                    border: "none",
                    background: "rgba(15,23,42,0.9)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 999,
                    border: "none",
                    background: "rgba(220,38,38,0.9)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RickyBirthdaysView;

