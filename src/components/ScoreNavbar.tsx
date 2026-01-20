import { NavLink } from "react-router-dom";
import "./ScoreNavbar.css";

const ScoreNavbar = () => {
  return (
    <nav className="score-nav">
      <NavLink to="round1" className="nav-item">
        Round 1
      </NavLink>
      <NavLink to="round2" className="nav-item">
        Round 2
      </NavLink>
      <NavLink to="round3" className="nav-item">
        Round 3
      </NavLink>
    </nav>
  );
};

export default ScoreNavbar;
