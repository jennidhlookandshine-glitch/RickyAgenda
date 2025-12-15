// src/RickyMonthlySummaryView.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  "ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
  "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE",
];

const formatRangeLabel = (start, end) => {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  return `${monthNames[s.getMonth()].slice(0,3)} ${s.getDate()} → ${monthNames[e.getMonth()].slice(0,3)} ${e.getDate()}`;
};

/* ================= VIEW ================= */

function RickyMonthlySummaryView() {
  const today = new Date();

  const [salary, setSalary] = useState("");
  const [sections, setSections] = useState([]);
  const [history, setHistory] = useState([]);

  const [startDate, setStartDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10)
  );

  const periodKey = `${startDate}_${endDate}`;

  /* ================= CARGA ================= */

  useEffect(() => {
    const s = localStorage.getItem("ricky-sections");
    setSections(s ? JSON.parse(s) : []);

    const h = localStorage.getItem("ricky-history");
    setHistory(h ? JSON.parse(h) : []);
  }, []);

  /* ================= SUELDO ================= */

  useEffect(() => {
    const stored = localStorage.getItem(`ricky-salary-${periodKey}`);
    setSalary(stored || "");
  }, [periodKey]);

  const saveSalary = (val) => {
    setSalary(val);
    localStorage.setItem(`ricky-salary-${periodKey}`, val);
  };

  const isInRange = (iso) => iso >= startDate && iso <= endDate;

  /* ================= CÁLCULOS ================= */

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
        const rest = (it.installments || 0) - (it.paid || 0);
        return rest > 0 ? s + (it.cuotaValue || 0) : s;
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

  const totalMes = totalGastos + totalCuotas - totalFavor;
  const sueldo = Number(salary) || 0;
  const saldo = sueldo - totalMes;

  /* ================= HISTORIAL ================= */

  useEffect(() => {
    if (!startDate || !endDate) return;

    const updated = history.filter((h) => h.key !== periodKey);
    updated.push({
      key: periodKey,
      label: formatRangeLabel(startDate, endDate),
      total: totalMes,
      saldo,
    });

    localStorage.setItem("ricky-history", JSON.stringify(updated));
    setHistory(updated);
  }, [totalMes, saldo, startDate, endDate]);

  /* ================= UI ================= */

  return (
    <div className="app-root">
      <div className="app-inner">
        <div className="ricky-top">RICKY</div>

        <div className="notes-wrapper">

          <header className="notes-header">
            <div className="note-card">
              <h2>Resumen del período</h2>

              <small style={{ opacity: 0.8 }}>
                {formatRangeLabel(startDate, endDate)}
              </small>

              <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
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
            </div>
          </header>

          <div className="notes-grid">
            <SummaryCard title="Gastos simples" color="#f97316">
              {formatCLP(totalGastos)}
            </SummaryCard>
            <SummaryCard title="Cuotas" color="#22c55e">
              {formatCLP(totalCuotas)}
            </SummaryCard>
            <SummaryCard title="Pagos recibidos" color="#2dd4bf">
              {formatCLP(totalFavor)}
            </SummaryCard>
            <SummaryCard title="Total período" color="#fde047">
              {formatCLP(totalMes)}
            </SummaryCard>
            <SummaryCard
              title="Saldo"
              color={saldo >= 0 ? "#4ade80" : "#f97316"}
            >
              {formatCLP(saldo)}
            </SummaryCard>
          </div>

          <h3 style={{ marginTop: "28px" }}>Historial</h3>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <div style={{ minWidth: "520px" }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[...history].sort((a, b) => a.key.localeCompare(b.key))}>
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

        <div className="bottom-bar">
          <Link to="/notas" className="tab-button">INICIO</Link>
          <Link to="/notas" className="tab-button">NOTAS</Link>
          <Link to="/calendario" className="tab-button">CALENDARIO</Link>
          <Link to="/finanzas" className="tab-button">FINANZAS</Link>
        </div>
      </div>
    </div>
  );
}

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

export default RickyMonthlySummaryView;
