import { Routes, Route } from "react-router-dom";
import WelcomePage from "../Pages/WelcomePage";
import TeamSetupPage from "../Pages/TeamSetupPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/teams" element={<TeamSetupPage />} />
    </Routes>
  );
};

export default AppRoutes;
