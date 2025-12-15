import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RickyHome from "./RickyHome";
import RickyNotesView from "./RickyNotesView";
import RickyCalendarView from "./RickyCalendarView";
import RickyFinanceSectionsView from "./RickyFinanceSectionsView";
import RickyMonthlySummaryView from "./RickyMonthlySummaryView"; // ⬅ NUEVO

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RickyHome />} />
        <Route path="/notas" element={<RickyNotesView />} />
        <Route path="/calendario" element={<RickyCalendarView />} />
        <Route path="/finanzas" element={<RickyFinanceSectionsView />} />
        {/* ⬅ NUEVO */}
        <Route
          path="/resumen-mensual"
          element={<RickyMonthlySummaryView />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

