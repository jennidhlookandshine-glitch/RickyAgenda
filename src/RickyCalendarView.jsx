// src/RickyCalendarView.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function RickyCalendarView() {
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11

  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().slice(0, 10)
  );

  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteColor, setNewNoteColor] = useState("normal");

  const [notes, setNotes] = useState([]);

  // NUEVO: estado para modal de eliminación
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    try {
      const guardadas = window.localStorage.getItem("ricky-notes");
      if (!guardadas) {
        setNotes([]);
        return;
      }
      const parsed = JSON.parse(guardadas);
      setNotes(parsed);
    } catch (error) {
      console.error("Error al leer notas para calendario", error);
      setNotes([]);
    }
  }, []);

  const notesForDay = notes.filter(
    (note) => note.dueDate && note.dueDate === selectedDate
  );

  const monthNames = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const firstWeekDay = (firstDay.getDay() + 6) % 7;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekDay; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    return cells;
  };

  const calendarCells = generateCalendarDays();

  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      let newMonth = prevMonth - 1;
      let newYear = currentYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      }

      setCurrentYear(newYear);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      let newMonth = prevMonth + 1;
      let newYear = currentYear;

      if (newMonth > 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      }

      setCurrentYear(newYear);
      return newMonth;
    });
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(now.toISOString().slice(0, 10));
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const date = new Date(currentYear, currentMonth, day);
    const iso = date.toISOString().slice(0, 10);
    setSelectedDate(iso);
    setShowAddModal(true);
  };

  const isSelectedDay = (day) => {
    if (!day) return false;
    const date = new Date(currentYear, currentMonth, day)
      .toISOString()
      .slice(0, 10);
    return date === selectedDate;
  };

  const isToday = (day) => {
    if (!day) return false;
    const cellIso = new Date(currentYear, currentMonth, day)
      .toISOString()
      .slice(0, 10);
    const todayIso = today.toISOString().slice(0, 10);
    return cellIso === todayIso;
  };

  const getNoteBackground = (color) => {
    if (color === "urgente") return "rgba(229, 57, 53, 0.6)";
    if (color === "importante") return "rgba(255, 179, 0, 0.6)";
    return "rgba(15, 23, 42, 0.8)";
  };

  const handleSaveNewNote = (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const now = new Date();
    const createdDate = now.toISOString().slice(0, 10);

    const nuevaNota = {
      id: Date.now(),
      title: newNoteTitle.trim(),
      text: newNoteText.trim(),
      color: newNoteColor,
      date: createdDate,
      dueDate: selectedDate,
    };

    const updatedNotes = [nuevaNota, ...notes];
    setNotes(updatedNotes);
    window.localStorage.setItem("ricky-notes", JSON.stringify(updatedNotes));

    setNewNoteTitle("");
    setNewNoteText("");
    setNewNoteColor("normal");
    setShowAddModal(false);
  };

  // Abrir modal para confirmar borrado
  const handleDeleteNote = (id) => {
    const note = notes.find((n) => n.id === id);
    setDeleteTarget({
      id,
      name: note ? note.title : "esta nota",
    });
  };

  // Confirmar desde el modal
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const updated = notes.filter((n) => n.id !== deleteTarget.id);
    setNotes(updated);
    window.localStorage.setItem("ricky-notes", JSON.stringify(updated));
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => setDeleteTarget(null);

  return (
    <div className="app-root">
      <div className="app-inner">
        <div className="ricky-top">RICKY</div>

        <div className="notes-wrapper">
          <header className="notes-header">
            <h2>Calendario</h2>

            {showAddModal && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 50,
                }}
                onClick={() => setShowAddModal(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: "90%",
                    maxWidth: "400px",
                    background: "rgba(15,23,42,0.95)",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 0 20px rgba(59,130,246,0.6)",
                  }}
                >
                  <h3 style={{ marginBottom: "8px" }}>
                    Nueva nota para el {selectedDate}
                  </h3>

                  <form
                    onSubmit={handleSaveNewNote}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <input
                      className="note-input"
                      type="text"
                      placeholder="Título"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                    />
                    <textarea
                      className="note-input"
                      placeholder="Detalle (opcional)"
                      rows={3}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                    />

                    <select
                      className="note-input"
                      value={newNoteColor}
                      onChange={(e) => setNewNoteColor(e.target.value)}
                    >
                      <option value="normal">Normal</option>
                      <option value="importante">Importante</option>
                      <option value="urgente">Urgente</option>
                    </select>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                        marginTop: "4px",
                      }}
                    >
                      <button
                        type="button"
                        className="add-note-button"
                        style={{ background: "rgba(148,163,184,0.5)" }}
                        onClick={() => setShowAddModal(false)}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="add-note-button">
                        Guardar nota
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <button
                className="add-note-button"
                style={{ padding: "4px 8px" }}
                onClick={goToPreviousMonth}
              >
                {"<"}
              </button>

              <button
                type="button"
                onClick={() => setShowMonthPicker((v) => !v)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {monthNames[currentMonth]} {currentYear}
              </button>

              <button
                className="add-note-button"
                style={{ padding: "4px 8px" }}
                onClick={goToNextMonth}
              >
                {">"}
              </button>

              <button
                className="add-note-button"
                style={{ padding: "4px 10px" }}
                onClick={goToToday}
              >
                HOY
              </button>
            </div>
          </header>

          {showMonthPicker && (
            <div
              style={{
                marginTop: "8px",
                padding: "8px",
                borderRadius: "8px",
                background: "rgba(15, 23, 42, 0.9)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  className="note-input"
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                >
                  {monthNames.map((name, index) => (
                    <option key={name} value={index}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <input
                  className="note-input"
                  type="number"
                  value={currentYear}
                  onChange={(e) =>
                    setCurrentYear(Number(e.target.value) || currentYear)
                  }
                  style={{ maxWidth: "120px" }}
                />
                <button
                  type="button"
                  className="add-note-button"
                  style={{ padding: "4px 10px" }}
                  onClick={() => setShowMonthPicker(false)}
                >
                  Listo
                </button>
              </div>
            </div>
          )}

          {/* Calendario mensual en grilla */}
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px",
                marginBottom: "8px",
              }}
            >
              {weekDays.map((d, index) => (
                <div
                  key={`${d}-${index}`}
                  style={{
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    letterSpacing: "0.1em",
                    color: "#e5f4ff",
                    textShadow: "0 0 4px #000",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px",
              }}
            >
              {calendarCells.map((day, idx) => {
                const hasNotesThisDay =
                  day &&
                  notes.some((note) => {
                    if (!note.dueDate) return false;
                    const date = new Date(currentYear, currentMonth, day)
                      .toISOString()
                      .slice(0, 10);
                    return note.dueDate === date;
                  });

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    style={{
                      height: "40px",
                      borderRadius: "8px",
                      border: hasNotesThisDay
                        ? "2px solid #1e90ff"
                        : isToday(day)
                        ? "1px solid #facc15"
                        : "none",
                      cursor: day ? "pointer" : "default",
                      backgroundColor: isSelectedDay(day)
                        ? "#1e90ff"
                        : "rgba(15, 23, 42, 0.8)",
                      color: "#fff",
                      opacity: day ? 1 : 0,
                      position: "relative",
                    }}
                  >
                    {day || ""}

                    {hasNotesThisDay && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "4px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: "#4fd1c5",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notas del día seleccionado */}
          <div style={{ marginTop: "16px" }}>
            <h3 style={{ marginBottom: "4px" }}>
              Notas para el {selectedDate || "día seleccionado"}
            </h3>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#9ca3af",
                marginBottom: "8px",
              }}
            >
              {notesForDay.length} nota(s) para este día
            </p>

            {notesForDay.length > 0 ? (
              <div className="notes-grid">
                {notesForDay.map((note) => (
                  <article
                    key={note.id}
                    className="note-card"
                    style={{ background: getNoteBackground(note.color) }}
                  >
                    <h3>{note.title}</h3>
                    <p className="note-text">{note.text}</p>
                    <span className="note-date">
                      Creada: {note.date} • Prioridad:{" "}
                      {note.color || "normal"}
                    </span>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "6px",
                        marginTop: "6px",
                      }}
                    >
                      <Link
                        to="/notas"
                        state={{ focusNoteId: note.id }}
                        className="add-note-button"
                        style={{
                          padding: "2px 6px",
                          fontSize: "0.75rem",
                          textDecoration: "none",
                        }}
                      >
                        Editar en notas
                      </Link>

                      <button
                        type="button"
                        className="add-note-button"
                        style={{
                          padding: "2px 6px",
                          fontSize: "0.75rem",
                          background: "rgba(248,113,113,0.7)",
                        }}
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Borrar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="no-notes-text">
                No hay notas con fecha de calendario para este día.
              </p>
            )}
          </div>
        </div>

        <div className="bottom-bar">
          <Link to="/" className="tab-button">
            INICIO
          </Link>
          <Link to="/notas" className="tab-button">
            NOTAS
          </Link>
          <Link to="/finanzas" className="tab-button">
            FINANZAS
          </Link>
        </div>
      </div>

      {/* MODAL CAPITÁN AMÉRICA PARA ELIMINAR NOTA DEL CALENDARIO */}
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
                del calendario. Esta acción no se puede deshacer.
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

export default RickyCalendarView;
