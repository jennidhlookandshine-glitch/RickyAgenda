// src/TurnosView.jsx - TURNOS CAPITÁN AGENDA 🛡️
import { useEffect, useState } from "react";
import Header from "./Header";
import { Link } from "react-router-dom";
import calendarioBg from "./assets/calendario-bg.jpg";
import capitanAlerta from "./assets/capitan-alerta.jpg";

function TurnosView() {
  const [turnos, setTurnos] = useState(() => {
    try {
      const saved = localStorage.getItem("capitan_turnos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [duracion, setDuracion] = useState("30");
  const [estado, setEstado] = useState("pendiente");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  // Tus servicios de estética
  const serviciosPyme = [
    "Lifting de pestañas", "Limpieza facial", "Depilación facial", 
    "Hydrogloss", "Masaje reductivo", "Masaje mixto", 
    "Extensiones pestañas", "Laminado cejas", "Otro"
  ];

  useEffect(() => {
    const sorted = [...turnos].sort((a, b) => new Date(b.fechaCompleta) - new Date(a.fechaCompleta));
    localStorage.setItem("capitan_turnos", JSON.stringify(sorted));
  }, [turnos]);

  const handleGuardar = (e) => {
    e.preventDefault();
    if (!cliente?.trim() || !fecha || !hora || !servicio?.trim()) {
      alert("🛡️ Completa cliente, fecha, hora y servicio");
      return;
    }

    const fechaCompleta = `${fecha}T${hora}`;
    const turno = {
      id: editingId || Date.now(),
      cliente: cliente.trim(),
      telefono: telefono.trim() || "",
      servicio: servicio.trim(),
      fecha, hora, fechaCompleta,
      duracion: duracion + "min",
      estado
    };

    if (editingId) {
      setTurnos(turnos.map(t => t.id === editingId ? turno : t));
      setEditingId(null);
    } else {
      setTurnos([turno, ...turnos]);
    }

    setCliente(""); setTelefono(""); setServicio(""); 
    setFecha(""); setHora(""); setDuracion("30"); setEstado("pendiente");
  };

  const handleEditar = (turno) => {
    setCliente(turno.cliente); setTelefono(turno.telefono);
    setServicio(turno.servicio); setFecha(turno.fecha); setHora(turno.hora);
    setDuracion(turno.duracion.replace("min","")); setEstado(turno.estado);
    setEditingId(turno.id);
  };

  const handleEliminar = (id) => {
    if (confirm(`🛡️ ¿Borrar turno de ${turnos.find(t=>t.id===id)?.cliente}?`)) {
      setTurnos(turnos.filter(t => t.id !== id));
    }
  };

  const turnosHoy = turnos.filter(t => {
    const hoy = new Date().toISOString().split('T')[0];
    return t.fecha === hoy;
  });

  const turnosFiltrados = turnos.filter(t => {
    const q = search.toLowerCase();
    return !q || t.cliente.toLowerCase().includes(q) || 
           t.servicio.toLowerCase().includes(q) || t.telefono.includes(q);
  });

  return (
    <div className="app-root" style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${calendarioBg})`,
        backgroundSize: "cover", backgroundPosition: "center",
        filter: "brightness(0.4)", zIndex: 0
      }}/>
      
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        <div className="app-inner">
          <div className="notes-wrapper">
            <Header title="🛡️ TURNOS" showBack={true} />

            {/* HOY DESTACADO */}
            {turnosHoy.length > 0 && (
              <div style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                margin: 16, padding: 16, borderRadius: 20,
                border: "1px solid rgba(59,130,246,0.5)",
                boxShadow: "0 10px 30px rgba(59,130,246,0.3)"
              }}>
                <h3 style={{ margin: 0, color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                  ⚡ HOY ({turnosHoy.length})
                </h3>
                {turnosHoy.slice(0,3).map(t => (
                  <div key={t.id} style={{ 
                    margin: "6px 0", fontSize: "0.95rem", color: "#e0f2fe" 
                  }}>
                    {t.hora} → {t.cliente} ({t.servicio})
                  </div>
                ))}
              </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={handleGuardar} style={{ 
              display: "flex", flexDirection: "column", gap: 12, padding: 16 
            }}>
              <input className="note-input" placeholder="👩 Cliente *" 
                value={cliente} onChange={e=>setCliente(e.target.value)} required />
              
              <div style={{ display: "flex", gap: 12 }}>
                <input className="note-input" style={{flex:1}} placeholder="📱 Teléfono" 
                  value={telefono} onChange={e=>setTelefono(e.target.value)} />
                <input type="date" className="note-input" style={{flex:1.2}} 
                  value={fecha} onChange={e=>setFecha(e.target.value)} required />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <input type="time" className="note-input" style={{flex:1}} 
                  value={hora} onChange={e=>setHora(e.target.value)} required />
                <select className="note-input" style={{flex:1}} value={duracion} 
                  onChange={e=>setDuracion(e.target.value)}>
                  <option value="30">30min</option><option value="45">45min</option>
                  <option value="60">1h</option><option value="90">1h30</option>
                </select>
              </div>

              <input className="note-input" placeholder="💅 Servicio *" 
                value={servicio} onChange={e=>setServicio(e.target.value)} 
                list="servicios" required />
              <datalist id="servicios">
                {serviciosPyme.map(s => <option key={s} value={s}/>)}
              </datalist>

              <select className="note-input" value={estado} 
                onChange={e=>setEstado(e.target.value)}>
                <option value="pendiente">⏳ Pendiente</option>
                <option value="confirmado">✅ Confirmado</option>
                <option value="completado">✔️ Completado</option>
                <option value="cancelado">❌ Cancelado</option>
              </select>

              <button type="submit" className="add-note-button" style={{fontSize: "1.1rem"}}>
                {editingId ? "🛡️ Actualizar" : "➕ Nuevo turno"}
              </button>
            </form>

            {/* LISTA */}
            <div style={{ padding: 16 }}>
              <input className="note-input" placeholder="🔍 Buscar cliente..." 
                value={search} onChange={e=>setSearch(e.target.value)} 
                style={{marginBottom: 16}} />
              
              {turnosFiltrados.length === 0 ? (
                <p style={{textAlign:"center", color:"#94a3b8", marginTop:40, fontSize:"1.1rem"}}>
                  🛡️ No hay turnos {search && `para "${search}"`}
                </p>
              ) : (
                turnosFiltrados.map(t => (
                  <div key={t.id} style={{
                    background: "rgba(15,23,42,0.95)", marginBottom: 12, 
                    padding: 16, borderRadius: 20,
                    borderLeft: `5px solid ${
                      t.estado==="pendiente"?"#f59e0b":t.estado==="confirmado"?"#10b981":
                      t.estado==="completado"?"#6b7280":"#ef4444"
                    }`,
                    boxShadow: "0 8px 25px rgba(0,0,0,0.6)"
                  }}>
                    <div style={{display:"flex", justifyContent:"space-between"}}>
                      <div>
                        <h3 style={{margin:"0 0 4px 0", color:"#38bdf8"}}>
                          {t.cliente}
                        </h3>
                        <div style={{color:"#94a3b8", fontSize:"0.9rem"}}>
                          📅 {t.fecha} {t.hora} ({t.duracion})
                        </div>
                        <div style={{color:"#e5e7eb", fontSize:"1rem"}}>
                          💅 {t.servicio}
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:"0.85rem", color:"#94a3b8"}}>
                          {t.telefono || "📱 Sin tel"}
                        </div>
                        <div style={{
                          padding:"6px 12px", borderRadius:999, 
                          background:"rgba(59,130,246,0.3)", fontSize:"0.8rem",
                          color:"#60a5fa"
                        }}>
                          {t.estado==="pendiente"?"⏳ Pendiente":
                           t.estado==="confirmado"?"✅ Confirmado":
                           t.estado==="completado"?"✔️ Listo":"❌ Cancelado"}
                        </div>
                      </div>
                    </div>
                    <div style={{marginTop:12, display:"flex", gap:8}}>
                      <button onClick={()=>handleEditar(t)} style={{
                        flex:1, padding:"10px", background:"rgba(59,130,246,0.9)",
                        color:"white", border:"none", borderRadius:12, cursor:"pointer"
                      }}>✏️ Editar</button>
                      <button onClick={()=>handleEliminar(t.id)} style={{
                        flex:1, padding:"10px", background:"rgba(239,68,68,0.9)",
                        color:"white", border:"none", borderRadius:12, cursor:"pointer"
                      }}>🗑️ Borrar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BARRA CAPITÁN */}
          <div className="bottom-bar">
            <Link to="/" className="tab-button">🏠</Link>
            <Link to="/notas" className="tab-button">📝</Link>
            <Link to="/calendario" className="tab-button">📅</Link>
            <Link to="/finanzas" className="tab-button">💰</Link>
            <Link to="/cumpleanos" className="tab-button">🎂</Link>
            <Link to="/claves" className="tab-button">🔐</Link>
            <Link to="/turnos" className="tab-button active">🛡️</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TurnosView;
