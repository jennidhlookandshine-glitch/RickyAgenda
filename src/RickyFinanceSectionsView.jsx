// src/RickyFinanceSectionsView.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const formatCLP = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value || 0);

function RickyFinanceSectionsView() {
  const [sections, setSections] = useState(() => {
    try {
      const saved = window.localStorage.getItem("ricky-sections");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error al cargar secciones de finanzas", error);
      return [];
    }
  });

  const [activeSectionId, setActiveSectionId] = useState(() => {
    try {
      const saved = window.localStorage.getItem("ricky-sections");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed[0].id : null;
    } catch {
      return null;
    }
  });

  // NUEVO: estado para el modal de eliminación
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionType, setNewSectionType] = useState("simple");

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "simple") {
      const { sectionId, itemId } = deleteTarget;
      const updatedSections = sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((it) => it.id !== itemId) }
          : s
      );
      setSections(updatedSections);
    }

    if (deleteTarget.type === "section") {
      const { sectionId } = deleteTarget;
      const updated = sections.filter((s) => s.id !== sectionId);
      setSections(updated);
      if (activeSectionId === sectionId) {
        setActiveSectionId(updated.length > 0 ? updated[0].id : null);
      }
    }

    if (deleteTarget.type === "favor") {
      const { sectionId, itemId } = deleteTarget;
      const updatedSections = sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((it) => it.id !== itemId) }
          : s
      );
      setSections(updatedSections);
    }

    if (deleteTarget.type === "debt") {
      const { sectionId, itemId } = deleteTarget;
      const updatedSections = sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((it) => it.id !== itemId) }
          : s
      );
      setSections(updatedSections);
    }

    setDeleteTarget(null);
  };

  const handleCancelDelete = () => setDeleteTarget(null);

  // FORM SIMPLE
  const [simpleTitle, setSimpleTitle] = useState("");
  const [simpleAmount, setSimpleAmount] = useState("");
  const [editingSimpleId, setEditingSimpleId] = useState(null);

  // FORM CUOTAS
  const [debtTitle, setDebtTitle] = useState("");
  const [debtTotal, setDebtTotal] = useState("");
  const [debtInstallments, setDebtInstallments] = useState("");
  const [debtPaid, setDebtPaid] = useState("");
  const [debtNote, setDebtNote] = useState("");
  const [editingDebtId, setEditingDebtId] = useState(null);

  // FORM DEUDAS A FAVOR (me deben)
  const [favorReason, setFavorReason] = useState("");
  const [favorAmount, setFavorAmount] = useState("");
  const [favorInstallments, setFavorInstallments] = useState("");
  const [favorPaid, setFavorPaid] = useState("");
  const [favorStatus, setFavorStatus] = useState("pendiente");
  const [editingFavorId, setEditingFavorId] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem("ricky-sections", JSON.stringify(sections));
    } catch (error) {
      console.error("Error al guardar secciones de finanzas", error);
    }
  }, [sections]);

  const activeSection =
    sections.find((s) => s.id === activeSectionId) || null;

  // -------- SECCIONES --------
  const handleAddSection = (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    const newSection = {
      id: Date.now(),
      name: newSectionName.trim(),
      type: newSectionType, // simple | cuotas | aFavor
      items: [],
    };

    const updated = [newSection, ...sections];
    setSections(updated);
    setActiveSectionId(newSection.id);
    setNewSectionName("");
    setNewSectionType("simple");
  };

  const handleDeleteSection = (id) => {
    const section = sections.find((s) => s.id === id);

    setDeleteTarget({
      type: "section",
      sectionId: id,
      name: section ? section.name : "esta sección",
    });
  };

  // -------- ITEMS SIMPLE --------
  const handleAddOrSaveSimpleItem = (e) => {
    e.preventDefault();
    if (
      !activeSection ||
      activeSection.type === "cuotas" ||
      activeSection.type === "aFavor"
    )
      return;
    if (!simpleTitle.trim() || !simpleAmount.trim()) return;

    const amount = parseFloat(simpleAmount);
    if (Number.isNaN(amount)) return;

    if (editingSimpleId) {
      const updatedSections = sections.map((s) =>
        s.id === activeSection.id
          ? {
              ...s,
              items: s.items.map((it) =>
                it.id === editingSimpleId
                  ? { ...it, title: simpleTitle.trim(), amount }
                  : it
              ),
            }
          : s
      );
      setSections(updatedSections);
      setEditingSimpleId(null);
    } else {
      const newItem = {
        id: Date.now(),
        title: simpleTitle.trim(),
        amount,
      };
      const updatedSections = sections.map((s) =>
        s.id === activeSection.id ? { ...s, items: [newItem, ...s.items] } : s
      );
      setSections(updatedSections);
    }

    setSimpleTitle("");
    setSimpleAmount("");
  };

  const handleDeleteSimpleItem = (sectionId, itemId) => {
    const section = sections.find((s) => s.id === sectionId);
    const item = section?.items.find((it) => it.id === itemId);

    setDeleteTarget({
      type: "simple",
      sectionId,
      itemId,
      name: item ? item.title : "este gasto",
    });
  };

  const totalSimpleSection =
    activeSection && activeSection.type === "simple"
      ? activeSection.items.reduce((sum, it) => sum + it.amount, 0)
      : 0;

  // -------- ITEMS CUOTAS --------
  const handleAddDebtItem = (e) => {
    e.preventDefault();
    if (!activeSection || activeSection.type !== "cuotas") return;
    if (!debtTitle.trim() || !debtTotal.trim() || !debtInstallments.trim()) {
      return;
    }

    const cuotaValue = parseFloat(debtTotal);
    const installments = parseInt(debtInstallments, 10) || 0;
    const paid = parseInt(debtPaid, 10) || 0;

    const newItem = {
      id: Date.now(),
      title: debtTitle.trim(),
      cuotaValue,
      installments,
      paid,
      note: debtNote.trim(),
    };

    const updatedSections = sections.map((s) =>
      s.id === activeSection.id ? { ...s, items: [newItem, ...s.items] } : s
    );
    setSections(updatedSections);

    setDebtTitle("");
    setDebtTotal("");
    setDebtInstallments("");
    setDebtPaid("");
    setDebtNote("");
  };

  const handleStartEditDebt = (item) => {
    setEditingDebtId(item.id);
    setDebtTitle(item.title);
    setDebtTotal(String(item.cuotaValue));
    setDebtInstallments(String(item.installments));
    setDebtPaid(String(item.paid));
    setDebtNote(item.note || "");
  };

  const handleSaveEditDebt = (e) => {
    e.preventDefault();
    if (!activeSection || activeSection.type !== "cuotas") return;
    if (!editingDebtId) return;
    if (!debtTitle.trim() || !debtTotal.trim() || !debtInstallments.trim()) {
      return;
    }

    const cuotaValue = parseFloat(debtTotal);
    const installments = parseInt(debtInstallments, 10) || 0;
    const paid = parseInt(debtPaid, 10) || 0;

    const updatedSections = sections.map((s) =>
      s.id === activeSection.id
        ? {
            ...s,
            items: s.items.map((it) =>
              it.id === editingDebtId
                ? {
                    ...it,
                    title: debtTitle.trim(),
                    cuotaValue,
                    installments,
                    paid,
                    note: debtNote.trim(),
                  }
                : it
            ),
          }
        : s
    );

    setSections(updatedSections);
    setEditingDebtId(null);
    setDebtTitle("");
    setDebtTotal("");
    setDebtInstallments("");
    setDebtPaid("");
    setDebtNote("");
  };

  const handleDeleteDebtItem = (sectionId, itemId) => {
    const section = sections.find((s) => s.id === sectionId);
    const item = section?.items.find((it) => it.id === itemId);

    setDeleteTarget({
      type: "debt",
      sectionId,
      itemId,
      name: item ? item.title : "esta deuda",
    });
  };

  const handlePayOneInstallment = (sectionId, itemId) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id !== sectionId) return section;

        return {
          ...section,
          items: section.items.map((item) => {
            if (item.id !== itemId) return item;

            const total = item.installments || 0;
            const paid = item.paid || 0;
            const newPaid = Math.min(paid + 1, total);

            return {
              ...item,
              paid: newPaid,
              lastPaidAt: formattedDate,
            };
          }),
        };
      })
    );
  };

  const calcularSaldoItem = (item) => {
    const cuota = item.cuotaValue;
    const totales = item.installments || 0;
    const pagadas = item.paid || 0;
    const restantes = Math.max(totales - pagadas, 0);
    const saldo = cuota * restantes;
    return saldo < 0 ? 0 : saldo;
  };

  const totalDebtSection =
    activeSection && activeSection.type === "cuotas"
      ? activeSection.items.reduce(
          (sum, it) => sum + calcularSaldoItem(it),
          0
        )
      : 0;

  const totalCuotasSection =
    activeSection && activeSection.type === "cuotas"
      ? activeSection.items.reduce((sum, it) => {
          const totales = it.installments || 0;
          const pagadas = it.paid || 0;
          const restantes = Math.max(totales - pagadas, 0);

          if (restantes > 0) {
            return sum + (it.cuotaValue || 0);
          }
          return sum;
        }, 0)
      : 0;

  // -------- ITEMS A FAVOR (me deben) --------
  const calcularSaldoFavor = (item) => {
    const cuota = item.amount || 0;
    const totales = item.installments || 0;
    const pagadas = item.paid || 0;
    const pendientes = Math.max(totales - pagadas, 0);

    if (item.status === "pagado") return 0;

    const saldo = cuota * pendientes;
    return saldo < 0 ? 0 : saldo;
  };

  const handleAddOrSaveFavorItem = (e) => {
    e.preventDefault();
    if (!activeSection || activeSection.type !== "aFavor") return;
    if (!favorReason.trim() || !favorAmount.trim()) return;

    const amount = parseFloat(favorAmount);
    if (Number.isNaN(amount)) return;

    const installments = parseInt(favorInstallments, 10) || 0;
    const paid = parseInt(favorPaid, 10) || 0;

    if (editingFavorId) {
      const updatedSections = sections.map((s) =>
        s.id === activeSection.id
          ? {
              ...s,
              items: s.items.map((it) =>
                it.id === editingFavorId
                  ? {
                      ...it,
                      reason: favorReason.trim(),
                      amount,
                      installments,
                      paid,
                      status: favorStatus,
                    }
                  : it
              ),
            }
          : s
      );
      setSections(updatedSections);
      setEditingFavorId(null);
    } else {
      const newItem = {
        id: Date.now(),
        reason: favorReason.trim(),
        amount,
        installments,
        paid,
        status: favorStatus, // pendiente | pagado
      };
      const updatedSections = sections.map((s) =>
        s.id === activeSection.id ? { ...s, items: [newItem, ...s.items] } : s
      );
      setSections(updatedSections);
    }

    setFavorReason("");
    setFavorAmount("");
    setFavorInstallments("");
    setFavorPaid("");
    setFavorStatus("pendiente");
  };

  const handleEditFavorItem = (item) => {
    setEditingFavorId(item.id);
    setFavorReason(item.reason || "");
    setFavorAmount(String(item.amount));
    setFavorInstallments(
      item.installments !== undefined ? String(item.installments) : ""
    );
    setFavorPaid(item.paid !== undefined ? String(item.paid) : "");
    setFavorStatus(item.status || "pendiente");
  };

  const handleDeleteFavorItem = (sectionId, itemId) => {
    const section = sections.find((s) => s.id === sectionId);
    const item = section?.items.find((it) => it.id === itemId);

    setDeleteTarget({
      type: "favor",
      sectionId,
      itemId,
      name: item ? item.reason : "esta deuda a tu favor",
    });
  };

  const handleMarkFavorPaid = (sectionId, itemId) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    const period = `${year}-${month}`;

    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((it) => {
                if (it.id !== itemId) return it;

                const cuotasTotales = it.installments || 0;
                const pagadasPrevias = it.paid || 0;
                const pagadasNuevas = Math.min(
                  pagadasPrevias + 1,
                  cuotasTotales
                );
                const yaTerminada =
                  cuotasTotales > 0 && pagadasNuevas >= cuotasTotales;

                return {
                  ...it,
                  paid: pagadasNuevas,
                  lastPaidPeriod: period,
                  paidAt: formattedDate,
                  lastPaidAmount: it.amount || 0,
                  status: yaTerminada ? "pagado" : "pendiente",
                };
              }),
            }
          : s
      )
    );
  };

  const totalFavorPendiente =
    activeSection && activeSection.type === "aFavor"
      ? activeSection.items.reduce(
          (sum, it) => sum + calcularSaldoFavor(it),
          0
        )
      : 0;

  return (
    <div className="app-root">
      <div className="ricky-top">RICKY</div>

      <div className="notes-wrapper">
        <header className="notes-header">
          <h2>Finanzas</h2>
          <p
            style={{ fontSize: "0.9rem", color: "#aaa", marginTop: "4px" }}
          >
            Organiza tus gastos, deudas y lo que otras personas te deben.
          </p>
        </header>

        {/* FORM SECCIÓN NUEVA */}
        <form
          onSubmit={handleAddSection}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginBottom: "12px",
          }}
        >
          <input
            className="note-input"
            type="text"
            placeholder='Nombre de sección (ej: "Gastos hogar")'
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
          />
          <select
            className="note-input"
            value={newSectionType}
            onChange={(e) => setNewSectionType(e.target.value)}
          >
            <option value="simple">Gastos simples</option>
            <option value="cuotas">Deudas en cuotas</option>
            <option value="aFavor">Me deben</option>
          </select>
          <button type="submit" className="add-note-button">
            Crear sección
          </button>
        </form>

        {/* LISTA DE SECCIONES */}
        <div style={{ marginBottom: "16px" }}>
          {sections.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionId(section.id)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    border:
                      activeSectionId === section.id
                        ? "2px solid #38bdf8"
                        : "1px solid rgba(148, 163, 184, 0.6)",
                    backgroundColor:
                      activeSectionId === section.id
                        ? "rgba(56, 189, 248, 0.2)"
                        : "rgba(15, 23, 42, 0.8)",
                    color: "#e5e7eb",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{section.name}</span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      opacity: 0.7,
                    }}
                  >
                    (
                    {section.type === "simple"
                      ? "simple"
                      : section.type === "cuotas"
                      ? "cuotas"
                      : "a favor"}
                    )
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSection(section.id);
                    }}
                    style={{
                      marginLeft: "4px",
                      fontSize: "0.7rem",
                      color: "#fca5a5",
                    }}
                  >
                    ✕
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="no-notes-text">
              Aún no tienes secciones. Crea una arriba (por ejemplo "Gastos
              hogar").
            </p>
          )}
        </div>

        {/* SECCIÓN SIMPLE */}
        {activeSection && activeSection.type === "simple" && (
          <div
            style={{
              padding: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ marginBottom: "4px" }}>{activeSection.name}</h3>

            <p
              style={{
                fontSize: "0.85rem",
                color: "#4ade80",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Total de esta sección: {formatCLP(totalSimpleSection)}
            </p>

            <form
              onSubmit={handleAddOrSaveSimpleItem}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              <input
                className="note-input"
                type="text"
                placeholder="Nombre (ej: luz, internet, comida)"
                value={simpleTitle}
                onChange={(e) => setSimpleTitle(e.target.value)}
              />
              <input
                className="note-input"
                type="number"
                placeholder="Monto"
                step="0.01"
                value={simpleAmount}
                onChange={(e) => setSimpleAmount(e.target.value)}
              />
              <button type="submit" className="add-note-button">
                {editingSimpleId ? "Guardar cambios" : "Agregar gasto"}
              </button>
            </form>

            {activeSection.items.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {activeSection.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      background: "rgba(15, 23, 42, 0.8)",
                      borderRadius: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <span>{item.title}</span>
                      {item.paidAt && (
                        <small
                          style={{
                            color: "#93c5fd",
                            fontSize: "0.7rem",
                          }}
                        >
                          Pagado el: {item.paidAt}
                        </small>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#f97316",
                          minWidth: "80px",
                          textAlign: "right",
                        }}
                      >
                        {formatCLP(item.amount)}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingSimpleId(item.id);
                          setSimpleTitle(item.title);
                          setSimpleAmount(String(item.amount));
                        }}
                        style={{
                          background: "rgba(59, 130, 246, 0.7)",
                          border: "none",
                          color: "#fff",
                          padding: "3px 7px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const day = String(now.getDate()).padStart(2, "0");
                          const month = String(
                            now.getMonth() + 1
                          ).padStart(2, "0");
                          const year = now.getFullYear();
                          const formattedDate = `${day}/${month}/${year}`;

                          setSections((prev) =>
                            prev.map((s) =>
                              s.id === activeSection.id
                                ? {
                                    ...s,
                                    items: s.items.map((it) =>
                                      it.id === item.id
                                        ? { ...it, paidAt: formattedDate }
                                        : it
                                    ),
                                  }
                                : s
                            )
                          );
                        }}
                        style={{
                          background: "rgba(34, 197, 94, 0.8)",
                          border: "none",
                          color: "#fff",
                          padding: "3px 7px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                      >
                        Pagado
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteSimpleItem(activeSection.id, item.id)
                        }
                        style={{
                          background: "rgba(244, 67, 54, 0.6)",
                          border: "none",
                          color: "#fff",
                          padding: "3px 7px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-notes-text">
                No hay gastos en esta sección todavía.
              </p>
            )}
          </div>
        )}

        {/* SECCIÓN CUOTAS */}
        {activeSection && activeSection.type === "cuotas" && (
          <div
            style={{
              padding: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ marginBottom: "4px" }}>{activeSection.name}</h3>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#aaa",
                marginBottom: "8px",
              }}
            >
              Sección de deudas en cuotas.
            </p>

            <form
              onSubmit={editingDebtId ? handleSaveEditDebt : handleAddDebtItem}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              <input
                className="note-input"
                type="text"
                placeholder="Nombre (ej: bodega, lentes)"
                value={debtTitle}
                onChange={(e) => setDebtTitle(e.target.value)}
              />
              <input
                className="note-input"
                type="number"
                placeholder="Monto cuota"
                step="0.01"
                value={debtTotal}
                onChange={(e) => setDebtTotal(e.target.value)}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  className="note-input"
                  type="number"
                  placeholder="Cuotas totales"
                  value={debtInstallments}
                  onChange={(e) => setDebtInstallments(e.target.value)}
                />
                <input
                  className="note-input"
                  type="number"
                  placeholder="Cuotas pagadas"
                  value={debtPaid}
                  onChange={(e) => setDebtPaid(e.target.value)}
                />
              </div>
              <input
                className="note-input"
                type="text"
                placeholder="Nota / observación (opcional)"
                value={debtNote}
                onChange={(e) => setDebtNote(e.target.value)}
              />
              <button type="submit" className="add-note-button">
                {editingDebtId ? "Guardar cambios" : "Agregar deuda"}
              </button>
            </form>

            {activeSection.items.length > 0 ? (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {activeSection.items.map((item) => {
                    const remainingInstallments = Math.max(
                      (item.installments || 0) - (item.paid || 0),
                      0
                    );

                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: "10px",
                          background: "rgba(15, 23, 42, 0.8)",
                          borderRadius: "8px",
                          borderLeft: "4px solid #f97316",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontWeight: "bold",
                            }}
                          >
                            {item.title}
                          </p>
                        </div>

                        <p
                          style={{
                            margin: 0,
                            fontWeight: "bold",
                            color: "#f97316",
                            fontSize: "1rem",
                          }}
                        >
                          Monto cuota: {formatCLP(item.cuotaValue)}
                        </p>
                        <small style={{ color: "#aaa" }}>
                          Cuotas totales: {item.installments} • Cuotas pagadas:{" "}
                          {item.paid} • Cuotas restantes: {remainingInstallments}
                        </small>

                        {item.lastPaidAt && (
                          <small style={{ color: "#93c5fd" }}>
                            Último pago: {item.lastPaidAt}
                          </small>
                        )}

                        {item.note && (
                          <small style={{ color: "#e5e7eb" }}>
                            {item.note}
                          </small>
                        )}

                        <div
                          style={{
                            marginTop: "4px",
                            alignSelf: "flex-end",
                            display: "flex",
                            gap: "6px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleStartEditDebt(item)}
                            style={{
                              background: "rgba(59, 130, 246, 0.7)",
                              border: "none",
                              color: "#fff",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            Editar
                          </button>

                          {remainingInstallments > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                handlePayOneInstallment(
                                  activeSection.id,
                                  item.id
                                )
                              }
                              style={{
                                background: "rgba(34, 197, 94, 0.7)",
                                border: "none",
                                color: "#fff",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                              }}
                            >
                              Pagar 1 cuota
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteDebtItem(activeSection.id, item.id)
                            }
                            style={{
                              background: "rgba(244, 67, 54, 0.6)",
                              border: "none",
                              color: "#fff",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            Borrar deuda
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p
                  style={{
                    marginTop: "12px",
                    fontSize: "0.9rem",
                    color: "#facc15",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  Total de cuotas del mes en esta sección:{" "}
                  {formatCLP(totalCuotasSection)}
                </p>
              </>
            ) : (
              <p className="no-notes-text">
                No hay deudas en esta sección todavía.
              </p>
            )}
          </div>
        )}

        {/* SECCIÓN A FAVOR (ME DEBEN) */}
        {activeSection && activeSection.type === "aFavor" && (
          <div
            style={{
              padding: "12px",
              background: "rgba(15, 23, 42, 0.6)",
            }}
          >
            <h3 style={{ marginBottom: "4px" }}>{activeSection.name}</h3>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#aaa",
                marginBottom: "8px",
              }}
            >
              Usa esta sección para anotar lo que esta persona te debe.
            </p>

            <form
              onSubmit={handleAddOrSaveFavorItem}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              <input
                className="note-input"
                type="text"
                placeholder="Motivo (ej: servicio, préstamo)"
                value={favorReason}
                onChange={(e) => setFavorReason(e.target.value)}
              />
              <input
                className="note-input"
                type="number"
                placeholder="Monto que te pagan cada vez"
                value={favorAmount}
                onChange={(e) => setFavorAmount(e.target.value)}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  className="note-input"
                  type="number"
                  placeholder="Cuántas veces te paga (cuotas totales)"
                  value={favorInstallments}
                  onChange={(e) => setFavorInstallments(e.target.value)}
                />
                <input
                  className="note-input"
                  type="number"
                  placeholder="Pagos realizados"
                  value={favorPaid}
                  onChange={(e) => setFavorPaid(e.target.value)}
                />
              </div>
              <select
                className="note-input"
                value={favorStatus}
                onChange={(e) => setFavorStatus(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
              </select>
              <button type="submit" className="add-note-button">
                {editingFavorId ? "Guardar cambios" : "Agregar deuda a favor"}
              </button>
            </form>

            <p
              style={{
                fontSize: "0.85rem",
                color: "#4ade80",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Total pendiente: {formatCLP(totalFavorPendiente)}
            </p>

            {activeSection.items.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {activeSection.items.map((item) => {
                  const cuotas = item.installments || 0;
                  const pagadas = item.paid || 0;
                  const pendientes =
                    cuotas > 0 ? Math.max(cuotas - pagadas, 0) : 0;
                  const saldo = calcularSaldoFavor(item);

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: "8px 10px",
                        background: "rgba(15, 23, 42, 0.8)",
                        borderRadius: "8px",
                        borderLeft:
                          item.status === "pagado"
                            ? "4px solid #22c55e"
                            : "4px solid #38bdf8",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <span style={{ fontWeight: "bold" }}>
                          {item.reason || "Sin motivo"}
                        </span>
                        <small style={{ color: "#e5e7eb" }}>
                          Monto por pago: {formatCLP(item.amount || 0)}
                        </small>
                        {cuotas > 0 && (
                          <small style={{ color: "#aaa" }}>
                            Cuotas totales: {cuotas} • Pagadas: {pagadas} •
                            Pendientes: {pendientes}
                          </small>
                        )}
                        <small
                          style={{
                            color:
                              item.status === "pagado"
                                ? "#22c55e"
                                : "#facc15",
                          }}
                        >
                          Estado:{" "}
                          {item.status === "pagado" ? "Pagado" : "Pendiente"}
                        </small>
                        {item.paidAt && (
                          <small style={{ color: "#93c5fd" }}>
                            Último pago: {item.paidAt}
                          </small>
                        )}
                        {saldo > 0 && item.status !== "pagado" && (
                          <small style={{ color: "#fbbf24" }}>
                            {/* aquí podrías mostrar saldo si quieres */}
                          </small>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleEditFavorItem(item)}
                          style={{
                            background: "rgba(59, 130, 246, 0.7)",
                            border: "none",
                            color: "#fff",
                            padding: "3px 7px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                        >
                          Editar
                        </button>

                        {item.status !== "pagado" && pendientes > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkFavorPaid(activeSection.id, item.id)
                            }
                            style={{
                              background: "rgba(34, 197, 94, 0.8)",
                              border: "none",
                              color: "#fff",
                              padding: "3px 7px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                            }}
                          >
                            Me pagó
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteFavorItem(activeSection.id, item.id)
                          }
                          style={{
                            background: "rgba(244, 67, 54, 0.6)",
                            border: "none",
                            color: "#fff",
                            padding: "3px 7px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-notes-text">
                No tienes deudas a tu favor registradas todavía.
              </p>
            )}
          </div>
        )}
      </div>

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
        <Link to="/resumen-mensual" className="tab-button">
          RESUMEN
        </Link>
      </div>

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
                ¿Eliminar este gasto?
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
                de esta sección. Esta acción no se puede deshacer.
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

export default RickyFinanceSectionsView;
