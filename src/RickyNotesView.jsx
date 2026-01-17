// src/RickyNotesView.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import capitanAlerta from "./assets/capitan-alerta.jpg";
import Header from "./Header";



function RickyNotesView() {
  const navigate = useNavigate();



  // ================= ESTADO =================
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("ricky-notes");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((n) => ({
        id: n.id || Date.now(),
        title: n.title || "Sin título",
        text: n.text || "Sin contenido",
        date: n.date || new Date().toLocaleDateString("es-CL"),
        color: n.color || "normal",
        dueDate: n.dueDate || "",
      }));
    } catch (err) {
      console.error("Error al leer notas guardadas", err);
      return [];
    }
  });



  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newColor, setNewColor] = useState("normal");
  const [search, setSearch] = useState("");
  const [openedNote, setOpenedNote] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [toast, setToast] = useState("");
  const [filterColor, setFilterColor] = useState("todas");
  const [modalVisible, setModalVisible] = useState(false);



  const hasNotes = notes.length > 0;



  // ================= FILTROS =================
  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        !search.trim() ||
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.text.toLowerCase().includes(search.toLowerCase());
      const matchesColor = filterColor === "todas" || note.color === filterColor;
      return matchesSearch && matchesColor;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));



  // ================= FUNCIONES =================
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
      color: newColor,
      dueDate: "",
    };



    setNotes((prev) => [newNote, ...prev]);
    setNewTitle("");
    setNewText("");
    setNewColor("normal");
    setToast("Nota agregada ✅");
    setTimeout(() => setToast(""), 2000);
  };



  const handleDelete = (id) => {
    const note = notes.find((n) => n.id === id);
    setDeleteTarget({ id, name: note ? note.title : "esta nota" });
    setDeleteAllConfirm(false);
    setModalVisible(true);
  };



  const handleDeleteAllModal = () => {
    setDeleteTarget({ id: null, name: "todas las notas" });
    setDeleteAllConfirm(true);
    setModalVisible(true);
  };



  const handleConfirmDelete = () => {
    if (deleteAllConfirm) {
      setNotes([]);
    } else if (deleteTarget) {
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      if (openedNote?.id === deleteTarget.id) setOpenedNote(null);
    }
    setDeleteTarget(null);
    setDeleteAllConfirm(false);
    setModalVisible(false);
  };



  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setDeleteAllConfirm(false);
    setModalVisible(false);
  };



  const openEditModal = (note) => {
    setOpenedNote(note);
    setModalVisible(true);
  };



  const saveOpenedNote = () => {
    if (!openedNote) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === openedNote.id ? { ...openedNote } : n))
    );
    setOpenedNote(null);
    setModalVisible(false);
    setToast("Nota guardada ✅");
    setTimeout(() => setToast(""), 2000);
  };



  const updateOpenedNote = (field, value) => {
    if (!openedNote) return;
    setOpenedNote({ ...openedNote, [field]: value });
  };



  const getNoteBackground = (color) => {
    if (color === "urgente") return "rgba(229, 57, 53, 0.6)";
    if (color === "importante") return "rgba(255, 179, 0, 0.6)";
    return "rgba(15, 23, 42, 0.8)";
  };



  const colorNames = {
    todas: "Todas",
    normal: "Normal",
    importante: "Importante",
    urgente: "Urgente",
  };



  const colorValues = {
    todas: "#6b7280",
    normal: "#1e90ff",
    importante: "#ffb300",
    urgente: "#e53935",
  };



  // ================= GUARDAR EN LOCALSTORAGE =================
  useEffect(() => {
    localStorage.setItem("ricky-notes", JSON.stringify(notes));
  }, [notes]);



  // ================= JSX =================
  return (
    <div className="app-root">
      <div className="app-inner">
        <Header title="Notas" showBack={true} />



        {toast && (
          <div
            style={{
              position: "fixed",
              top: "12px",
              right: "12px",
              background: "#1e90ff",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: "6px",
              zIndex: 100,
            }}
          >
            {toast}
          </div>
        )}



        <div className="notes-wrapper">
          {/* BUSCADOR */}
          <header className="notes-header">
            <input
              className="note-input"
              type="text"
              placeholder="Buscar nota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginTop: "8px" }}
            />
          </header>



          {/* FILTRO POR COLOR */}
          <div
            style={{
              margin: "12px 0",
              display: "flex",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            {Object.keys(colorNames).map((f) => {
              const isActive = filterColor === f;
              return (
                <button
                  key={f}
                  className="add-note-button"
                  style={{
                    padding: "6px 14px",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: "bold",
                    background: isActive
                      ? colorValues[f]
                      : "rgba(15,23,42,0.8)",
                    color: "#fff",
                    boxShadow: isActive ? `0 0 10px ${colorValues[f]}` : "none",
                    cursor: "pointer",
                    transition: "0.2s all",
                  }}
                  onClick={() => setFilterColor(f)}
                >
                  {colorNames[f]}
                </button>
              );
            })}
          </div>



          {/* NUEVA NOTA */}
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
            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
              {["normal", "importante", "urgente"].map((color) => (
                <button
                  type="button"
                  key={color}
                  className="add-note-button"
                  style={{
                    background: newColor === color ? colorValues[color] : undefined,
                  }}
                  onClick={() => setNewColor(color)}
                >
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </button>
              ))}
            </div>
          </form>



          {/* LISTA DE NOTAS */}
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



                    {/* ACCIONES DE NOTA */}
                    <div className="note-actions">
                      <button className="edit-btn" onClick={() => openEditModal(note)}>
                        ✏️ Editar
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(note.id)}>
                        🗑️ Eliminar
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="no-notes-text">No se encontraron notas para “{search}”.</p>
              )}
            </div>
          ) : (
            <p className="no-notes-text">
              Aún no hay notas. Escribe arriba y presiona Enter para guardar.
            </p>
          )}



          {hasNotes && (
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <button className="add-note-button" onClick={handleDeleteAllModal}>
                Borrar todas las notas
              </button>
            </div>
          )}
        </div>



        {/* MODAL NOTA ABIERTA */}
        {openedNote && modalVisible && !deleteAllConfirm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 70,
              opacity: modalVisible ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
            onClick={() => setOpenedNote(null)}
          >
            <div
              style={{
                width: "90%",
                maxWidth: "400px",
                background: "radial-gradient(circle at top, #1e3a8a, #020617)",
                borderRadius: "16px",
                padding: "16px 18px",
                border: "1px solid rgba(125,249,255,0.7)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.9), 0 0 18px rgba(59,130,246,0.7)",
                color: "#e5e7eb",
                position: "relative",
                overflow: "hidden",
                transform: modalVisible ? "scale(1)" : "scale(0.8)",
                transition: "transform 0.3s ease-in-out",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                className="note-input"
                type="text"
                value={openedNote.title}
                onChange={(e) => updateOpenedNote("title", e.target.value)}
              />
              <textarea
                className="note-textarea"
                rows={6}
                value={openedNote.text}
                onChange={(e) => updateOpenedNote("text", e.target.value)}
              />



              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                {["normal", "importante", "urgente"].map((color) => (
                  <button
                    key={color}
                    className="add-note-button"
                    style={{
                      background:
                        openedNote.color === color ? colorValues[color] : undefined,
                    }}
                    onClick={() => updateOpenedNote("color", color)}
                  >
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </button>
                ))}
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
                  onChange={(e) => updateOpenedNote("dueDate", e.target.value)}
                />
              </label>



              <span className="note-date">Creada: {openedNote.date}</span>



              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "10px",
                  justifyContent: "center",
                }}
              >
                <button className="add-note-button" onClick={saveOpenedNote}>
                  Guardar
                </button>
                <button className="add-note-button" onClick={() => setOpenedNote(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}



        {/* MODAL CONFIRMACIÓN ELIMINAR / BORRAR TODAS */}
        {modalVisible && (deleteTarget || deleteAllConfirm) && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 60,
              opacity: modalVisible ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
            onClick={handleCancelDelete}
          >
            <div
              style={{
                width: "90%",
                maxWidth: "360px",
                background: "radial-gradient(circle at top, #1e3a8a, #020617)",
                borderRadius: "16px",
                padding: "16px 18px 14px",
                border: "1px solid rgba(125,249,255,0.7)",
                boxShadow:
                  "0 20px 40px rgba(0,0,0,0.9), 0 0 18px rgba(59,130,246,0.7)",
                color: "#e5e7eb",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                transform: modalVisible ? "scale(1)" : "scale(0.8)",
                transition: "transform 0.3s ease-in-out",
              }}
              onClick={(e) => e.stopPropagation()}
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
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: "1rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#7df9ff",
                  }}
                >
                  ¿Eliminar {deleteAllConfirm ? "todas las notas" : "esta nota"}?
                </h3>
                <p style={{ fontSize: "0.85rem", margin: "0 0 10px", color: "#e5e7eb" }}>
                  Vas a borrar{" "}
                  <span style={{ fontWeight: "bold", color: "#f97316" }}>{deleteTarget?.name}</span>. Esta acción no se puede deshacer.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "8px" }}>
                  <button className="add-note-button" style={{ padding: "6px 14px", background: "rgba(15,23,42,0.9)" }} onClick={handleCancelDelete}>
                    Cancelar
                  </button>
                  <button className="add-note-button" style={{ padding: "6px 14px", background: "rgba(220,38,38,0.9)", borderColor: "rgba(248,113,113,0.9)" }} onClick={handleConfirmDelete}>
                    Sí, borrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



export default RickyNotesView;

