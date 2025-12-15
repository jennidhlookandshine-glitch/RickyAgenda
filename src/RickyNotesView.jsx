// src/RickyNotesView.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function RickyNotesView() {
  const [notes, setNotes] = useState(() => {
    try {
      const guardadas = window.localStorage.getItem("ricky-notes");
      if (!guardadas) return [];
      const parsed = JSON.parse(guardadas);
      return parsed.map((n) => ({
        ...n,
        color: n.color || "normal",
        dueDate: n.dueDate || "",
      }));
    } catch (error) {
      console.error("Error al leer notas guardadas", error);
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem("ricky-notes", JSON.stringify(notes));
  }, [notes]);

  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [search, setSearch] = useState("");
  const [openedNote, setOpenedNote] = useState(null);

  // Modal eliminación
  const [deleteTarget, setDeleteTarget] = useState(null);

  const hasNotes = notes.length > 0;

  const filteredNotes = notes
    .filter((note) => {
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        note.title.toLowerCase().includes(term) ||
        note.text.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

  const handleAdd = () => {
    if (!newTitle.trim() && !newText.trim()) return;

    const today = new Date();
    const dateStr = today.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newNote = {
      id: Date.now(),
      title: newTitle || "Sin título",
      text: newText || "Sin contenido",
      date: dateStr.toUpperCase(),
      color: "normal",
      dueDate: "",
    };

    setNotes((prev) => [newNote, ...prev]);
    setNewTitle("");
    setNewText("");
  };

  // Abrir modal de borrado
  const handleDelete = (id) => {
    const note = notes.find((n) => n.id === id);
    setDeleteTarget({
      id,
      name: note ? note.title : "esta nota",
    });
  };

  // Confirmar borrado
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const updated = notes.filter((note) => note.id !== deleteTarget.id);
    setNotes(updated);
    window.localStorage.setItem("ricky-notes", JSON.stringify(updated));
    if (openedNote && openedNote.id === deleteTarget.id) {
      setOpenedNote(null);
    }
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => setDeleteTarget(null);

  const handleDeleteAll = () => {
    const confirmar = window.confirm(
      "¿Seguro que quieres borrar TODAS las notas?"
    );
    if (!confirmar) return;
    setNotes([]);
    window.localStorage.setItem("ricky-notes", JSON.stringify([]));
  };

  const saveOpenedNote = () => {
    if (!openedNote) return;

    setNotes((prev) =>
      prev.map((n) => (n.id === openedNote.id ? openedNote : n))
    );
    setOpenedNote(null);
  };

  const getNoteBackground = (color) => {
    if (color === "urgente") return "rgba(229, 57, 53, 0.6)";
    if (color === "importante") return "rgba(255, 179, 0, 0.6)";
    return "rgba(15, 23, 42, 0.8)";
  };

  return (
    <div className="app-root">
      <div className="app-inner">
        <div className="ricky-top">RICKY</div>

        <div className="notes-wrapper">
          <header className="notes-header">
            <h2>Notas</h2>

            <input
              className="note-input"
              type="text"
              placeholder="Buscar nota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginTop: "8px" }}
            />
          </header>

          <form
            className="note-card note-editor"
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <input
              className="note-input"
              type="text"
              placeholder="Título..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              className="note-textarea"
              rows={3}
              placeholder="Escribe la nota y presiona Enter para guardar..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
          </form>

          {hasNotes ? (
            <div className="notes-grid">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <article
                    key={note.id}
                    className="note-card"
                    style={{ background: getNoteBackground(note.color) }}
                  >
                    <div>
                      <h3>{note.title}</h3>
                      <p className="note-text">{note.text}</p>
                      <span className="note-date">
                        {note.date}
                        {note.dueDate ? ` • Fecha: ${note.dueDate}` : ""}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "6px",
                      }}
                    >
                      <button
                        className="add-note-button"
                        style={{ padding: "4px 10px" }}
                        onClick={() => setOpenedNote(note)}
                      >
                        Editar
                      </button>
                      <button
                        className="add-note-button"
                        style={{ padding: "4px 10px" }}
                        onClick={() => handleDelete(note.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="no-notes-text">
                  No se encontraron notas para “{search}”.
                </p>
              )}
            </div>
          ) : (
            <p className="no-notes-text">
              Aún no hay notas. Escribe arriba y presiona Enter para guardar.
            </p>
          )}

          {hasNotes && (
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <button
                className="add-note-button"
                style={{ padding: "6px 14px" }}
                onClick={handleDeleteAll}
              >
                Borrar todas las notas
              </button>
            </div>
          )}
        </div>

        {openedNote && (
          <div
            className="note-modal-overlay"
            onClick={() => setOpenedNote(null)}
          >
            <div
              className="note-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                className="note-input"
                type="text"
                value={openedNote.title}
                onChange={(e) =>
                  setOpenedNote((prev) =>
                    prev ? { ...prev, title: e.target.value } : prev
                  )
                }
              />

              <textarea
                className="note-textarea"
                rows={8}
                value={openedNote.text}
                onChange={(e) =>
                  setOpenedNote((prev) =>
                    prev ? { ...prev, text: e.target.value } : prev
                  )
                }
              />

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <button
                  type="button"
                  className="add-note-button"
                  style={{
                    padding: "4px 8px",
                    background:
                      openedNote.color === "normal" ? "#1e90ff" : undefined,
                  }}
                  onClick={() =>
                    setOpenedNote((prev) =>
                      prev ? { ...prev, color: "normal" } : prev
                    )
                  }
                >
                  Normal
                </button>
                <button
                  type="button"
                  className="add-note-button"
                  style={{
                    padding: "4px 8px",
                    background:
                      openedNote.color === "importante"
                        ? "#ffb300"
                        : undefined,
                  }}
                  onClick={() =>
                    setOpenedNote((prev) =>
                      prev ? { ...prev, color: "importante" } : prev
                    )
                  }
                >
                  Importante
                </button>
                <button
                  type="button"
                  className="add-note-button"
                  style={{
                    padding: "4px 8px",
                    background:
                      openedNote.color === "urgente" ? "#e53935" : undefined,
                  }}
                  onClick={() =>
                    setOpenedNote((prev) =>
                      prev ? { ...prev, color: "urgente" } : prev
                    )
                  }
                >
                  Urgente
                </button>
              </div>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "0.85rem" }}>
                  Fecha de calendario (para agenda):
                </span>
                <input
                  type="date"
                  className="note-input"
                  value={openedNote.dueDate || ""}
                  onChange={(e) =>
                    setOpenedNote((prev) =>
                      prev ? { ...prev, dueDate: e.target.value } : prev
                    )
                  }
                />
              </label>

              <span className="note-date">Creada: {openedNote.date}</span>

              <div
                style={{ display: "flex", gap: "8px", marginTop: "10px" }}
              >
                <button
                  className="add-note-button"
                  style={{ padding: "4px 10px" }}
                  onClick={saveOpenedNote}
                >
                  Guardar
                </button>
                <button
                  className="add-note-button"
                  style={{ padding: "4px 10px" }}
                  onClick={() => handleDelete(openedNote.id)}
                >
                  Eliminar
                </button>
                <button
                  className="add-note-button"
                  style={{ padding: "4px 10px" }}
                  onClick={() => setOpenedNote(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bottom-bar">
          <Link to="/" className="tab-button">
            INICIO
          </Link>
          <Link to="/calendario" className="tab-button">
            CALENDARIO
          </Link>
          <Link to="/finanzas" className="tab-button">
            FINANZAS
          </Link>
        </div>
      </div>

      {/* MODAL CAPITÁN AMÉRICA PARA ELIMINAR NOTA */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "360px",
              background:
                "radial-gradient(circle at top, #1e3a8a, #020617)",
              borderRadius: "16px",
              padding: "16px 18px 14px",
              border: "1px solid rgba(125,249,255,0.7)",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.9), 0 0 18px rgba(59,130,246,0.7)",
              color: "#e5e7eb",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              src="/capitan-alerta.jpg"
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
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: "1rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#7df9ff",
                }}
              >
                ¿Eliminar esta nota?
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  margin: "0 0 10px",
                  color: "#e5e7eb",
                }}
              >
                Vas a borrar{" "}
                <span
                  style={{ fontWeight: "bold", color: "#f97316" }}
                >
                  {deleteTarget.name}
                </span>{" "}
                de tus notas. Esta acción no se puede deshacer.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  className="add-note-button"
                  style={{
                    padding: "6px 14px",
                    background: "rgba(15,23,42,0.9)",
                  }}
                  onClick={handleCancelDelete}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="add-note-button"
                  style={{
                    padding: "6px 14px",
                    background: "rgba(220,38,38,0.9)",
                    borderColor: "rgba(248,113,113,0.9)",
                  }}
                  onClick={handleConfirmDelete}
                >
                  Sí, borrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RickyNotesView;
