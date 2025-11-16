import React from "react";
import { Link } from "react-router-dom";
import "../../styles/StartScreen.css"; // ili putanja gdje ti je CSS

function StartScreen() {
  return (
    <div className="app-root">
      <div className="lobby">

        <h1 className="lobby-title">4NATIONS</h1>
        <p className="lobby-subtitle">King of the Hill board game</p>

        <div className="lobby-buttons">
          {/* Start Game */}
          <Link to="/game" className="lobby-btn primary">
            ▶ Start
          </Link>

          {/* Settings */}
          <Link to="/settings" className="lobby-btn secondary">
            ⚙ Settings
          </Link>
        </div>

      </div>
    </div>
  );
}

export default StartScreen;