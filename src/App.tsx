import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import WelcomePage from "./Pages/WelcomePage";
import TeamSetupPage from "./Pages/TeamSetupPage";
import ScoreboardPage from "./Pages/ScoreboardPage";
import Round1Page from "./Pages/Round1Page";
import Round2Page from "./Pages/Round2Page";
import Round3Page from "./Pages/Round3Page";
import Round1SummaryPage from "./Pages/Round1SummaryPage";
import QualifierSummaryPage from "./Pages/QualifierSummaryPage"; // ✅ ADD THIS
import WinnerPage from "./Pages/WinnerPage";

const AppContent = () => {
  const location = useLocation();

  const showNavbar = [
    "/scoreboard",
    "/round1",
    "/round1-summary",
    "/round2",
    "/qualifier-summary", // ✅ ADD THIS
    "/round3",
  ].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/team-setup" element={<TeamSetupPage />} />
        <Route path="/scoreboard" element={<ScoreboardPage />} />

        <Route path="/round1" element={<Round1Page />} />
        <Route path="/round1-summary" element={<Round1SummaryPage />} />

        <Route path="/round2" element={<Round2Page />} />

        {/* ✅ QUALIFIER SUMMARY ROUTE (FIXES BLANK PAGE) */}
        <Route
          path="/qualifier-summary"
          element={<QualifierSummaryPage />}
        />

        <Route path="/round3" element={<Round3Page />} />
        <Route path="/winner" element={<WinnerPage />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
