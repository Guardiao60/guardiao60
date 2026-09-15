import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="headerContainer">

        <Link to="/" className="logo">
          <div className="logoRobot">
            <img
              src="/robozinho.png"
              alt="Robô Guardião Digital 60+"
            />
          </div>

          <div className="logoText">
            <h1>Guardião Digital 60+</h1>
            <p>Tecnologia que protege quem você ama</p>
          </div>
        </Link>

        <nav className="navigation">
          <Link to="/" className="navItem">
            Início
          </Link>

          <Link to="/dados" className="dashboardButton">
            Dashboard
          </Link>
        </nav>

      </div>
    </header>
  );
}

export default Header;
