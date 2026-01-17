// src/RickyCalendarView.jsx
import { useState, useEffect } from "react";
import calendarioBg from "./assets/calendario-bg.jpg";
import capitanAlerta from "./assets/capitan-alerta.jpg";
import Header from "./Header";

/* 🔒 FECHA LOCAL ESTABLE (NO UTC) */
const toLocalISO = (date) => date.toLocaleDateString("sv-SE"); // YYYY-MM-DD

function RickyCalendarView() {
  const today = new Date();
  const todayISO = toLocalISO(today);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayISO);

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // ✅ Normalizar notas al cargar (igual que NotesView)
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

  // ✅ Estados para modal de nota + eliminar
  const [openedNote, setOpenedNote] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newColor, setNewColor] = useState("normal");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ✅ Guardar en localStorage (igual que NotesView)
  useEffect(() => {
    localStorage.setItem("ricky-notes", JSON.stringify(notes));
  }, [notes]);

  /* =================== CALENDARIO =================== */
  const monthNames = [
    "ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
    "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE",
  ];

  const weekDays = ["L","M","M","J","V","S","D"];

  const holidays = [
    "2025-01-01","2025-05-01","2025-09-18","2025-09-19","2025-12-25",
  ];

  const isSunday = (y,m,d) => new Date(y,m,d).getDay() === 0;
  const isHoliday = (iso) => holidays.includes(iso);

  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    return [
      ...Array(offset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  };

  const getPriorityDot = (day) => {
    if (!day) return null;
    const iso = toLocalISO(new Date(currentYear, currentMonth, day));
    const note = notes.find((n) => n.dueDate === iso);
    if (!note) return null;
    if (note.color === "urgente") return "#ef4444";
    if (note.color === "importante") return "#facc15";
    return "#38bdf8";
  };

  /* =================== FUNCIONES DE NOTA =================== */
  const colorValues = { normal: "#1e90ff", importante: "#facc15", urgente: "#ef4444" };

  const getNoteBackground = (color) => {
    if (color === "urgente") return "rgba(229,57,53,0.6)";
    if (color === "importante") return "rgba(255,179,0,0.6)";
    return "rgba(15,23,42,0.8)";
  };

  const openNewNoteForDate = (isoDay) => {
    setSelectedDate(isoDay);
    setOpenedNote(null);
    setNewTitle("");
    setNewText("");
    setNewColor("normal");
    setShowNoteModal(true);
  };

  const openExistingNote = (note) => {
    setOpenedNote(note);
    setNewTitle(note.title);
    setNewText(note.text);
    setNewColor(note.color);
    setSelectedDate(note.dueDate || todayISO);
    setShowNoteModal(true);
  };

  const saveNote = () => {
    const today = new Date();
    const dateStr = today
      .toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();

    if (openedNote) {
      // Editar existente
      const updated = notes.map((n) =>
        n.id === openedNote.id
          ? {
              ...n,
              title: newTitle || "Sin título",
              text: newText || "",
              color: newColor,
              dueDate: selectedDate,
            }
          : n
      );
      setNotes(updated);
    } else {
      // Nueva nota
      const newNote = {
        id: Date.now(),
        title: newTitle || "Sin título",
        text: newText || "",
        date: dateStr,
        color: newColor,
        dueDate: selectedDate,
      };
      setNotes((prev) => [newNote, ...prev]);
    }

    setShowNoteModal(false);
    setOpenedNote(null);
    setNewTitle("");
    setNewText("");
    setNewColor("normal");
  };

  const deleteCurrentNote = () => {
    if (!openedNote) return;
    setDeleteTarget(openedNote);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    setShowDeleteModal(false);
    setShowNoteModal(false);
    setOpenedNote(null);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const calendarCells = generateCalendarDays();
  const notesForSelectedDay = notes.filter((n) => n.dueDate === selectedDate);

  /* =================== UI =================== */
  return (
    <div className="app-root">
      <Header />

      {/* Wrapper específico de calendario, alineado con el CSS mobile */}
      <div className="calendar-wrapper">
        <header className="notes-header">
          <h2>CALENDARIO</h2>
          <button
            onClick={() => setShowMonthPicker(true)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {monthNames[currentMonth]} {currentYear}
          </button>
        </header>

        {/* Días semana */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            marginBottom: 6,
          }}
        >
          {weekDays.map((d, i) => (
            <div key={i} style={{ textAlign: "center", opacity: 0.7 }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendario */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 6,
          }}
        >
          {calendarCells.map((day, i) => {
            const isoDay = day
              ? toLocalISO(new Date(currentYear, currentMonth, day))
              : null;
            const dot = getPriorityDot(day);
            const isToday = isoDay === todayISO;
            const isRed =
              day &&
              (isSunday(currentYear, currentMonth, day) ||
                isHoliday(isoDay));

            return (
              <button
                key={i}
                onClick={() => day && openNewNoteForDate(isoDay)}
                style={{
                  height: 52,
                  borderRadius: 12,
                  background: isToday
                    ? "#1e40af"
                    : "rgba(15,23,42,0.9)",
                  color: isRed ? "#ef4444" : "#fff",
                  border: dot
                    ? `2px solid ${dot}`
                    : "1px solid #1e293b",
                  position: "relative",
                }}
              >
                {day}
                {dot && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 6,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: dot,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Notas del día seleccionado */}
        {notesForSelectedDay.length > 0 && (
          <>
            <p
              style={{
                marginBottom: 4,
                fontSize: "0.85rem",
                color: "#e5e7eb",
              }}
            >
              Notas para {selectedDate}:
            </p>
            {notesForSelectedDay.map((note) => (
              <article
                key={note.id}
                className="note-card"
                onClick={() => openExistingNote(note)}
                style={{
                  marginTop: 8,
                  cursor: "pointer",
                  background: getNoteBackground(note.color),
                }}
              >
                <div>
                  <h3>{note.title}</h3>
                  <p className="note-text">{note.text}</p>
                  <span className="note-date">
                    Creada: {note.date}
                    {note.dueDate
                      ? ` • Fecha: ${note.dueDate}`
                      : ""}
                  </span>
                </div>
              </article>
            ))}
          </>
        )}
      </div>

      {/* 🔥 SELECTOR DE MES / AÑO */}
      {showMonthPicker && (
        <div
          onClick={() => setShowMonthPicker(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 2000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: 420,
              padding: 20,
              backgroundImage: `url(${calendarioBg})`,
              backgroundSize: "cover",
              borderRadius: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <button onClick={() => setCurrentYear((y) => y - 1)}>
                ◀
              </button>
              <strong>{currentYear}</strong>
              <button onClick={() => setCurrentYear((y) => y + 1)}>
                ▶
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 10,
              }}
            >
              {monthNames.map((m, i) => (
                <button
                  key={m}
                  onClick={() => {
                    setCurrentMonth(i);
                    setShowMonthPicker(false);
                  }}
                  style={{
                    padding: "12px 8px",
                    borderRadius: 12,
                    border:
                      "1px solid rgba(255,255,255,0.3)",
                    background:
                      i === currentMonth
                        ? "rgba(56,189,248,0.3)"
                        : "transparent",
                    color: "#fff",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de nota */}
      {showNoteModal && (
        <div
          onClick={() => setShowNoteModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: 400,
              background:
                "radial-gradient(circle at top, #1e3a8a, #020617)",
              borderRadius: 16,
              padding: 20,
              border:
                "1px solid rgba(125,249,255,0.7)",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.9)",
              color: "#e5e7eb",
            }}
          >
            <h3
              style={{ marginTop: 0, marginBottom: 12 }}
            >
              {openedNote ? "Editar nota" : "Nueva nota para"}{" "}
              {selectedDate}
            </h3>

            <input
              className="note-input"
              type="text"
              placeholder="Título..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ marginBottom: 12 }}
            />

            <textarea
              className="note-textarea"
              rows={4}
              placeholder="Escribe la nota..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              style={{ marginBottom: 12 }}
            />

            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {["normal", "importante", "urgente"].map(
                (color) => (
                  <button
                    key={color}
                    type="button"
                    className="add-note-button"
                    style={{
                      background:
                        newColor === color
                          ? colorValues[color]
                          : "rgba(15,23,42,0.8)",
                      flex: 1,
                    }}
                    onClick={() => setNewColor(color)}
                  >
                    {color.charAt(0).toUpperCase() +
                      color.slice(1)}
                  </button>
                )
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              {openedNote && (
                <button
                  onClick={deleteCurrentNote}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Eliminar
                </button>
              )}
              <button
                onClick={saveNote}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "none",
                  background: "#38bdf8",
                  color: "#0f172a",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Guardar
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid #6b7280",
                  background: "transparent",
                  color: "#e5e7eb",
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {showDeleteModal && deleteTarget && (
        <div
          onClick={handleCancelDelete}
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
              background:
                "radial-gradient(circle at top, #1e3a8a, #020617)",
              borderRadius: 16,
              padding: 20,
              border:
                "1px solid rgba(125,249,255,0.7)",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.9)",
              color: "#e5e7eb",
              textAlign: "center",
              position: "relative",
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
                borderRadius: 16,
              }}
            />
            <div style={{ position: "relative" }}>
              <h3 style={{ margin: "0 0 12px" }}>
                ¿Eliminar esta nota?
              </h3>
              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: "0.9rem",
                }}
              >
                Vas a borrar{" "}
                <strong style={{ color: "#f97316" }}>
                  {deleteTarget.title}
                </strong>
                .<br />
                Esta acción no se puede deshacer.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
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
