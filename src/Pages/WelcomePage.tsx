import { useNavigate } from "react-router-dom";
import "../Styles/WelcomePage.css";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <h1 className="main-title">SCORE BOARD</h1>

      <button
        className="start-btn"
        onClick={() => navigate("/team-setup")}
      >
        START
      </button>
    </div>
  );
};

export default WelcomePage;
