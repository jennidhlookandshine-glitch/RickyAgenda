// src/RickyKeysView.jsx - PIN DE 6 DÍGITOS 🔐
import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import { Link } from "react-router-dom";
import calendarioBg from "./assets/calendario-bg.jpg";
import capitanAlerta from "./assets/capitan-alerta.jpg";

function RickyKeysView() {
  // ✅ ESTADO DE BLOQUEO
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [correctPin, setCorrectPin] = useState(null);

  // modos: "unlock" (desbloquear) | "change" (cambiar PIN)
  const [mode, setMode] = useState("unlock");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");

  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [keys, setKeys] = useState(() => {
    try {
      const saved = localStorage.getItem("ricky_keys");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loadedRef = useRef(false);
  useEffect(() => {
    loadedRef.current = true;
  }, []);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // CARGAR PIN al montar
  useEffect(() => {
    const savedPin = localStorage.getItem("ricky_keys_pin");
    if (savedPin) {
      setCorrectPin(savedPin);
    }
  }, []);

  // guardar siempre ordenado alfabéticamente
  useEffect(() => {
    if (!loadedRef.current) return;
    const sorted = [...keys].sort((a, b) =>
      a.title.localeCompare(b.title, "es", { sensitivity: "base" })
    );
    localStorage.setItem("ricky_keys", JSON.stringify(sorted));
  }, [keys]);

  // ✅ MANEJAR PIN DE 6 DÍGITOS
  const handleUnlock = () => {
    if (pin.length !== 6 || pin !== correctPin) {
      alert("PIN incorrecto (debe ser 6 dígitos) 🔒");
      setPin("");
      return;
    }
    setIsLocked(false);
    setPin("");
    setMode("unlock");
  };

  const handleSetPin = () => {
    if (pin.length !== 6) {
      alert("El PIN debe tener EXACTAMENTE 6 dígitos");
      return;
    }
    localStorage.setItem("ricky_keys_pin", pin);
    setCorrectPin(pin);
    setIsLocked(false);
    setPin("");
    setMode("unlock");
  };

  const handleChangePin = () => {
    if (!correctPin) {
      alert("Todavía no hay PIN configurado.");
      return;
    }
    if (oldPin !== correctPin) {
      alert("El PIN actual no es correcto.");
      setOldPin("");
      return;
    }
    if (newPin.length !== 6) {
      alert("El nuevo PIN debe tener EXACTAMENTE 6 dígitos");
      return;
    }
    if (newPin !== confirmNewPin) {
      alert("El nuevo PIN y la confirmación no coinciden.");
      return;
    }

    localStorage.setItem("ricky_keys_pin", newPin);
    setCorrectPin(newPin);
    setMode("unlock");
    setOldPin("");
    setNewPin("");
    setConfirmNewPin("");
    setPin("");
    alert("PIN actualizado correctamente.");
  };

  const handleLock = () => {
    setIsLocked(true);
    setPin("");
    setMode("unlock");
  };

  const handleAddOrEdit = (e) => {
    e.preventDefault();
    if (!title.trim() || !value.trim()) return;

    if (!editingId) {
      const exists = keys.some(
        (k) => k.title.toLowerCase() === title.trim().toLowerCase()
      );
      if (exists) {
        alert("Esa clave ya existe.");
        return;
      }
    }

    if (editingId) {
      const updated = keys.map((k) =>
        k.id === editingId
          ? { ...k, title: title.trim(), value: value.trim() }
          : k
      );
      setKeys(updated);
      setEditingId(null);
    } else {
      const newKey = {
        id: Date.now(),
        title: title.trim(),
        value: value.trim(),
      };
      const updated = [...keys, newKey].sort((a, b) =>
        a.title.localeCompare(b.title, "es", { sensitivity: "base" })
      );
      setKeys(updated);
    }

    setTitle("");
    setValue("");
  };

  const handleAskDelete = (id) => {
    const key = keys.find((k) => k.id === id);
    setDeleteTarget({
      type: "key",
      id,
      name: key ? key.title : "esta clave",
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setKeys((prev) => prev.filter((k) => k.id !== deleteTarget.id));
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const filteredKeys = keys.filter((k) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      k.title.toLowerCase().includes(q) ||
      k.value.toLowerCase().includes(q)
    );
  });

  // SI ESTÁ BLOQUEADO: mostrar PIN
  if (isLocked) {
    return (
      <div
        className="app-root"
        style={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          background: "linear-gradient(135deg, #1e3a8a 0%, #020617 100%)",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            textAlign: "center",
            color: "#e5e7eb",
            padding: "20px",
          }}
        >
          <Header title="🔐 Claves" showBack={true} />

          <div style={{ maxWidth: "400px", width: "100%" }}>
            <div
              style={{
                background: "rgba(15,23,42,0.95)",
                borderRadius: 20,
                padding: 40,
                border: "1px solid rgba(125,249,255,0.3)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                backdropFilter: "blur(20px)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 30px",
                  fontSize: "1.8rem",
                  color: "#38bdf8",
                }}
              >
                🔒 Claves Protegidas
              </h2>

              {!correctPin ? (
                // PRIMERA CONFIGURACIÓN DE PIN
                <>
                  <p
                    style={{
                      marginBottom: 20,
                      fontSize: "1rem",
                      opacity: 0.9,
                    }}
                  >
                    Configura tu <strong>PIN de 6 dígitos</strong>
                  </p>
                  <input
                    type="password"
                    className="note-input"
                    placeholder="______"
                    value={pin}
                    maxLength={6}
                    onChange={(e) =>
                      setPin(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    style={{
                      marginBottom: 20,
                      textAlign: "center",
                      fontSize: "2rem",
                      letterSpacing: "0.5em",
                      padding: "25px 15px",
                      fontFamily: "monospace",
                    }}
                  />
                  <button
                    onClick={handleSetPin}
                    className="add-note-button"
                    style={{
                      width: "100%",
                      padding: "15px",
                      fontSize: "1.1rem",
                    }}
                    disabled={pin.length !== 6}
                  >
                    CONFIGURAR PIN
                  </button>
                </>
              ) : mode === "unlock" ? (
                // DESBLOQUEAR
                <>
                  <p
                    style={{
                      marginBottom: 20,
                      fontSize: "1rem",
                      opacity: 0.9,
                    }}
                  >
                    Ingresa tu PIN de 6 dígitos
                  </p>
                  <input
                    type="password"
                    className="note-input"
                    placeholder="______"
                    value={pin}
                    maxLength={6}
                    onChange={(e) =>
                      setPin(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleUnlock()
                    }
                    style={{
                      marginBottom: 20,
                      textAlign: "center",
                      fontSize: "2rem",
                      letterSpacing: "0.5em",
                      padding: "25px 15px",
                      fontFamily: "monospace",
                    }}
                  />
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={handleUnlock}
                      className="add-note-button"
                      style={{
                        flex: 1,
                        padding: "15px",
                        fontSize: "1.1rem",
                      }}
                      disabled={pin.length !== 6}
                    >
                      DESBLOQUEAR
                    </button>
                    <button
                      onClick={() => {
                        setMode("change");
                        setOldPin("");
                        setNewPin("");
                        setConfirmNewPin("");
                        setPin("");
                      }}
                      style={{
                        padding: "15px",
                        borderRadius: 999,
                        border: "1px solid #94a3b8",
                        background: "transparent",
                        color: "#e5e7eb",
                        flex: 1,
                        fontSize: "1rem",
                        cursor: "pointer",
                      }}
                    >
                      CAMBIAR PIN
                    </button>
                  </div>
                </>
              ) : (
                // CAMBIAR PIN
                <>
                  <p
                    style={{
                      marginBottom: 14,
                      fontSize: "1rem",
                      opacity: 0.9,
                    }}
                  >
                    Para cambiar tu PIN, primero ingresa el PIN actual y
                    luego el nuevo.
                  </p>

                  <input
                    type="password"
                    className="note-input"
                    placeholder="PIN actual"
                    value={oldPin}
                    maxLength={6}
                    onChange={(e) =>
                      setOldPin(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    style={{
                      marginBottom: 12,
                      textAlign: "center",
                      fontSize: "1.4rem",
                      letterSpacing: "0.4em",
                      padding: "18px 12px",
                      fontFamily: "monospace",
                    }}
                  />

                  <input
                    type="password"
                    className="note-input"
                    placeholder="Nuevo PIN"
                    value={newPin}
                    maxLength={6}
                    onChange={(e) =>
                      setNewPin(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    style={{
                      marginBottom: 12,
                      textAlign: "center",
                      fontSize: "1.4rem",
                      letterSpacing: "0.4em",
                      padding: "18px 12px",
                      fontFamily: "monospace",
                    }}
                  />

                  <input
                    type="password"
                    className="note-input"
                    placeholder="Repite nuevo PIN"
                    value={confirmNewPin}
                    maxLength={6}
                    onChange={(e) =>
                      setConfirmNewPin(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    style={{
                      marginBottom: 18,
                      textAlign: "center",
                      fontSize: "1.4rem",
                      letterSpacing: "0.4em",
                      padding: "18px 12px",
                      fontFamily: "monospace",
                    }}
                  />

                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={() => {
                        setMode("unlock");
                        setOldPin("");
                        setNewPin("");
                        setConfirmNewPin("");
                        setPin("");
                      }}
                      style={{
                        padding: "14px",
                        borderRadius: 999,
                        border: "1px solid #9ca3af",
                        background: "transparent",
                        color: "#e5e7eb",
                        flex: 1,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleChangePin}
                      className="add-note-button"
                      style={{
                        flex: 1,
                        padding: "14px",
                        fontSize: "1rem",
                      }}
                    >
                      GUARDAR NUEVO PIN
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resto del código DESBLOQUEADO igual que antes...
  return (
    <div
      className="app-root"
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${calendarioBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.4)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        <div className="app-inner">
          <div className="notes-wrapper">
            <Header title="🔐 Claves" showBack={true} />

            <button
              onClick={handleLock}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                padding: "8px 16px",
                borderRadius: 999,
                border: "1px solid #ef4444",
                background: "rgba(239,68,68,0.2)",
                color: "#ef4444",
                fontSize: "0.8rem",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              🔒 Bloquear
            </button>

            <p
              style={{
                fontSize: "0.9rem",
                color: "#aaa",
                marginTop: 4,
              }}
            >
              Guarda correos, usuarios, contraseñas, códigos, etc. (6
              dígitos PIN)
            </p>

            {/* Búsqueda */}
            <input
              className="note-input"
              type="text"
              placeholder="Buscar por nombre o valor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginTop: 12, marginBottom: 10 }}
            />

            {/* Formulario alta/edición */}
            <form
              onSubmit={handleAddOrEdit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <input
                className="note-input"
                type="text"
                placeholder='Nombre de la clave (ej: "Gmail")'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="note-input"
                type="password"
                placeholder="Valor / contraseña / dato"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <button type="submit" className="add-note-button">
                {editingId ? "Guardar cambios" : "Guardar clave"}
              </button>
            </form>

            {filteredKeys.length === 0 ? (
              <p className="no-notes-text">
                {keys.length === 0
                  ? "Aún no tienes claves guardadas."
                  : "No hay resultados para esa búsqueda."}
              </p>
            ) : (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "14px",
                  alignItems: "center",
                }}
              >
                {filteredKeys.map((k) => (
                  <div
                    key={k.id}
                    style={{
                      width: "100%",
                      maxWidth: "480px",
                      padding: "14px 16px",
                      borderRadius: "20px",
                      background:
                        "radial-gradient(circle at top left, rgba(56,189,248,0.25), rgba(15,23,42,0.95))",
                      boxShadow:
                        "0 18px 35px rgba(0,0,0,0.85), 0 0 18px rgba(56,189,248,0.45)",
                      border: "1px solid rgba(148,163,184,0.7)",
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#bfdbfe",
                          fontSize: "0.95rem",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {k.title}
                      </span>
                      <span
                        style={{
                          color: "#e5e7eb",
                          fontSize: "0.85rem",
                          opacity: 0.85,
                          wordBreak: "break-all",
                          fontFamily: "monospace",
                        }}
                      >
                        {k.value}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        alignItems: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(k.id);
                          setTitle(k.title);
                          setValue(k.value);
                        }}
                        style={{
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "999px",
                          background: "rgba(59,130,246,0.9)",
                          color: "#fff",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow:
                            "0 0 10px rgba(59,130,246,0.7)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAskDelete(k.id)}
                        style={{
                          border: "none",
                          padding: "7px 16px",
                          borderRadius: "999px",
                          background:
                            "linear-gradient(135deg, #fb7185, #ef4444)",
                          color: "#fff",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow:
                            "0 0 14px rgba(248,113,113,0.7)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ✅ BARRA INFERIOR */}
        <div className="bottom-bar">
          <Link to="/" className="tab-button">
            INICIO
          </Link>
          <Link to="/notas" className="tab-button">
            NOTAS
          </Link>
          <Link to="/calendario" className="tab-button">
            CALENDARIO
          </Link>
          <Link to="/finanzas" className="tab-button">
            FINANZAS
          </Link>
          <Link to="/cumpleanos" className="tab-button">
            CUMPLEAÑOS
          </Link>
          <Link to="/claves" className="tab-button">
            CLAVES
          </Link>
        </div>
      </div>

      {/* MODAL ELIMINAR CLAVE */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "90%",
              maxWidth: "360px",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid rgba(148,163,184,0.7)",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.9), 0 0 18px rgba(59,130,246,0.7)",
              background: "rgba(15,23,42,0.95)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${capitanAlerta})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "brightness(0.35)",
                opacity: 0.9,
              }}
            />
            <div
              style={{
                position: "relative",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                color: "#e5e7eb",
              }}
            >
              <h3 style={{ margin: 0 }}>¿Eliminar clave?</h3>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                Vas a borrar <strong>{deleteTarget.name}</strong>. No se
                puede deshacer.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid #9ca3af",
                    background: "transparent",
                    color: "#e5e7eb",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "none",
                    background: "#ef4444",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RickyKeysView;
