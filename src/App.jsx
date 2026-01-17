import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RickyHome from "./RickyHome";
import RickyNotesView from "./RickyNotesView";
import RickyCalendarView from "./RickyCalendarView";
import RickyFinanceSectionsView from "./RickyFinanceSectionsView";
import RickyMonthlySummaryView from "./RickyMonthlySummaryView";
import RickyBirthdaysView from "./RickyBirthdaysView";
import RickyKeysView from "./RickyKeysView";
import Mas from "./Mas";
import TurnosView from "./TurnosView";  // ← NUEVO 1️⃣

function App() {
  return (
    <BrowserRouter basename="/RickyAgenda">
      <Routes>
        <Route path="/" element={<RickyHome />} />
        <Route path="/notas" element={<RickyNotesView />} />
        <Route path="/calendario" element={<RickyCalendarView />} />
        <Route path="/finanzas" element={<RickyFinanceSectionsView />} />
        <Route path="/resumen-mensual" element={<RickyMonthlySummaryView />} />
        <Route path="/cumpleanos" element={<RickyBirthdaysView />} />
        <Route path="/claves" element={<RickyKeysView />} />
        <Route path="/mas" element={<Mas />} />
        <Route path="/turnos" element={<TurnosView />} />  // ← NUEVO 2️⃣
      </Routes>
    </BrowserRouter>
  );
}

export default App;

