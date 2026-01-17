// src/RickyMonthlySummaryView.jsx
import { useState, useEffect, useMemo } from "react";
import Header from "./Header";
import capitanAlerta from "./assets/capitan-alerta.jpg";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= HELPERS ================= */

const formatCLP = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value || 0);

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

const formatRangeLabel = (start, end) => {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  return `${monthNames[s.getMonth()].slice(0, 3)} ${s.getDate()} → ${
    monthNames[e.getMonth()].slice(0, 3)
  } ${e.getDate()}`;
};

/* ================= CARD ================= */

function SummaryCard({ title, color, children }) {
  return (
    <div
      style={{
        background: `${color}22`,
        border: `1px solid ${color}99`,
        borderRadius: "14px",
        padding: "12px",
      }}
    >
      <strong>{title}</strong>
      <div style={{ color, fontSize: "1.2rem", fontWeight: "bold" }}>
        {children}
      </div>
    </div>
  );
}

/* ================= VIEW ================= */

function RickyMonthlySummaryView() {
  const today = new Date();

  const [startDate, setStartDate] = useState(() => {
    const stored = localStorage.getItem("ricky-summary-start");
    if (stored) return stored;
    return new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
  });

  const [endDate, setEndDate] = useState(() => {
    const stored = localStorage.getItem("ricky-summary-end");
    if (stored) return stored;
    return new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
  });

  const [salary, setSalary] = useState("");
  const [sections, setSections] = useState([]);
  const [history, setHistory] = useState([]);

  // modal confirmación
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, name } | null
  const [modalVisible, setModalVisible] = useState(false);

  const periodKeyMemo = useMemo(
    () => `${startDate}_${endDate}`,
    [startDate, endDate]
  );

  /* ================= CARGA INICIAL ================= */

  useEffect(() => {
    const s = localStorage.getItem("ricky-sections");
    setSections(s ? JSON.parse(s) : []);

    const h = localStorage.getItem("ricky-history");
    setHistory(h ? JSON.parse(h) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem("ricky-summary-start", startDate);
    localStorage.setItem("ricky-summary-end", endDate);
  }, [startDate, endDate]);

  /* ================= SUELDO ================= */

  useEffect(() => {
    const stored = localStorage.getItem(`ricky-salary-${periodKeyMemo}`);
    setSalary(stored || "");
  }, [periodKeyMemo]);

  const saveSalary = (val) => {
    setSalary(val);
    localStorage.setItem(`ricky-salary-${periodKeyMemo}`, val);
  };

  const isInRange = (iso) => iso >= startDate && iso <= endDate;

  /* ================= CÁLCULOS MEMOIZADOS ================= */

  const calculations = useMemo(() => {
    let totalGastos = 0;
    let totalCuotas = 0;

    sections.forEach((section) => {
      if (section.type === "simple") {
        totalGastos += section.items?.reduce((s, it) => {
          if (!it.paidAt) return s;
          const iso = it.paidAt.includes("/")
            ? it.paidAt.split("/").reverse().join("-")
            : it.paidAt;
          return isInRange(iso) ? s + (it.amount || 0) : s;
        }, 0);
      }

      if (section.type === "cuotas") {
        totalCuotas += section.items?.reduce((s, it) => {
          if (!it.paidAt) return s;
          const iso = it.paidAt.includes("/")
            ? it.paidAt.split("/").reverse().join("-")
            : it.paidAt;
          return isInRange(iso) ? s + (it.cuotaValue || 0) : s;
        }, 0);
      }
    });

    const totalFavor = sections
      .filter((s) => s.type === "aFavor")
      .flatMap((s) => s.items || [])
      .reduce((s, it) => {
        if (!it.paidAt) return s;
        const iso = it.paidAt.includes("/")
          ? it.paidAt.split("/").reverse().join("-")
          : it.paidAt;
        return isInRange(iso) ? s + (it.amount || 0) : s;
      }, 0);

    return { totalGastos, totalCuotas, totalFavor };
  }, [sections, startDate, endDate]);

  const { totalGastos, totalCuotas, totalFavor } = calculations;

  const totalMesMemo = useMemo(
    () => totalGastos + totalCuotas - totalFavor,
    [totalGastos, totalCuotas, totalFavor]
  );

  const saldoMemo = useMemo(
    () => (Number(salary) || 0) - totalMesMemo,
    [salary, totalMesMemo]
  );

  /* ================= HISTORIAL (GUARDAR) ================= */

  useEffect(() => {
    if (!startDate || !endDate || !periodKeyMemo) return;

    const currentHistory = JSON.parse(
      localStorage.getItem("ricky-history") || "[]"
    );
    const updated = currentHistory.filter((h) => h.key !== periodKeyMemo);

    const existing = updated.find((h) => h.key === periodKeyMemo);
    if (
      !existing ||
      Math.abs(existing.total - totalMesMemo) > 0.01 ||
      Math.abs(existing.saldo - saldoMemo) > 0.01
    ) {
      updated.push({
        key: periodKeyMemo,
        label: formatRangeLabel(startDate, endDate),
        total: totalMesMemo,
        saldo: saldoMemo,
      });
      localStorage.setItem("ricky-history", JSON.stringify(updated));
      setHistory(updated);
    }
  }, [periodKeyMemo, totalMesMemo, saldoMemo, startDate, endDate]);

  /* ================= HISTORIAL (BORRAR) ================= */

  const clearCurrentPeriodFromHistory = () => {
    setDeleteTarget({
      type: "period",
      name: formatRangeLabel(startDate, endDate),
    });
    setModalVisible(true);
  };

  const clearAllHistory = () => {
    setDeleteTarget({
      type: "all",
      name: "todo el historial",
    });
    setModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "period") {
      const currentHistory = JSON.parse(
        localStorage.getItem("ricky-history") || "[]"
      );
      const updated = currentHistory.filter((h) => h.key !== periodKeyMemo);
      localStorage.setItem("ricky-history", JSON.stringify(updated));
      setHistory(updated);
      localStorage.removeItem(`ricky-salary-${periodKeyMemo}`);
    }

    if (deleteTarget.type === "all") {
      localStorage.removeItem("ricky-history");
      setHistory([]);
    }

    setDeleteTarget(null);
    setModalVisible(false);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setModalVisible(false);
  };

  /* ================= UI ================= */

  return (
    <div className="app-root">
      <div className="hero-glow" />

      {/* HEADER GLOBAL */}
      <Header title="📊 Resumen mensual" showBack={true} />

      {/* CONTENIDO RESUMEN */}
      <div className="resumen-wrapper">
        <header className="resumen-card">
          <h2>Resumen del período</h2>

          <small style={{ opacity: 0.8 }}>
            {formatRangeLabel(startDate, endDate)}
          </small>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexDirection: "column",
            }}
          >
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="note-input"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="note-input"
            />
          </div>

          <input
            type="number"
            className="note-input"
            placeholder="Sueldo del período (opcional)"
            value={salary}
            onChange={(e) => saveSalary(e.target.value)}
          />
        </header>

        <div className="notes-grid">
          <SummaryCard title="Gastos simples" color="#f97316">
            {formatCLP(totalGastos)}
          </SummaryCard>
          <SummaryCard title="Cuotas del mes" color="#22c55e">
            {formatCLP(totalCuotas)}
          </SummaryCard>
          <SummaryCard title="Pagos recibidos" color="#2dd4bf">
            {formatCLP(totalFavor)}
          </SummaryCard>
          <SummaryCard title="Total período" color="#fde047">
            {formatCLP(totalMesMemo)}
          </SummaryCard>
          <SummaryCard
            title="Saldo"
            color={saldoMemo >= 0 ? "#4ade80" : "#f97316"}
          >
            {formatCLP(saldoMemo)}
          </SummaryCard>
        </div>

        {/* Botones para borrar historial */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "16px",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={clearCurrentPeriodFromHistory}
            style={{
              background: "rgba(248, 250, 252, 0.05)",
              border: "1px solid rgba(248, 250, 252, 0.3)",
              color: "#f97316",
              padding: "6px 10px",
              borderRadius: "999px",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Borrar período actual
          </button>

          <button
            type="button"
            onClick={clearAllHistory}
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(248, 113, 113, 0.8)",
              color: "#fecaca",
              padding: "6px 10px",
              borderRadius: "999px",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Borrar TODO el historial
          </button>
        </div>

        <h3 style={{ marginTop: "20px" }}>Historial</h3>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ minWidth: "520px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[...history].sort((a, b) =>
                  a.key.localeCompare(b.key)
                )}
              >
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#f97316" />
                <Bar dataKey="saldo" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* MODAL CONFIRMACIÓN ELIMINAR HISTORIAL */}
      {modalVisible && deleteTarget && (
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
                {deleteTarget.type === "all"
                  ? "¿Eliminar todo el historial?"
                  : "¿Eliminar este período?"}
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
                  style={{
                    fontWeight: "bold",
                    color: "#f97316",
                  }}
                >
                  {deleteTarget.name}
                </span>{" "}
                del historial. Esta acción no se puede deshacer.
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

export default RickyMonthlySummaryView;
