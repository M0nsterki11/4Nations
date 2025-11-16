import React from "react";
import { Link } from "react-router-dom";
import "../../App.css";

function SettingsScreen() {
  return (
    <div className="app-root">
      <div className="lobby">

        <h1 className="lobby-title">Settings</h1>

        <p className="lobby-subtitle">
          Ovdje ćeš kasnije dodati opcije igre, zvukove, broj igrača...
        </p>

        <div className="lobby-buttons">
          <Link to="/" className="lobby-btn secondary">
            ← Back
          </Link>
        </div>

      </div>
    </div>
  );
}

export default SettingsScreen;
