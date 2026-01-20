import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar-glass">
      <div className="nav-left">Pentathlon</div>
      <div className="nav-right">
        <Link to="/scoreboard">Scoreboard</Link>
        <Link to="/round1">Round 1</Link>
        <Link to="/round2">Round 2</Link>
        <Link to="/round3">Round 3</Link>
      </div>
    </div>
  );
};

export default Navbar;
