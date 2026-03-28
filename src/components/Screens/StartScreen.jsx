import React from "react";
import { Link } from "react-router-dom";
import "../../styles/StartScreen.css";

function StartScreen() {
  const elementalIcons = ["🌪️", "🌱", "💧", "🔥"];
  const menuHighlights = ["4 Teams", "8 Players", "1 Throne"];

  return (
    <div className="app-root start-screen">
      <div className="start-screen-backdrop" aria-hidden="true">
        <span className="start-orb start-orb-air" />
        <span className="start-orb start-orb-earth" />
        <span className="start-orb start-orb-water" />
        <span className="start-orb start-orb-fire" />

        <div className="start-emblems">
          {elementalIcons.map((icon, index) => (
            <span
              key={icon}
              className={`start-emblem start-emblem-${index + 1}`}
            >
              {icon}
            </span>
          ))}
        </div>
      </div>

      <div className="lobby start-lobby">
        <div className="start-badge">Elemental Arena</div>

        <h1 className="lobby-title">
          <span className="start-title-accent">4NATIONS</span>
        </h1>

        <p className="lobby-subtitle">
          King of the Hill board game where rival elements race for the center
          and hold the throne.
        </p>

        <div className="start-highlights">
          {menuHighlights.map((highlight) => (
            <span key={highlight} className="start-highlight">
              {highlight}
            </span>
          ))}
        </div>

        <div className="lobby-buttons">
          <Link to="/game" className="lobby-btn primary">
            Start Adventure
          </Link>

          <Link to="/settings" className="lobby-btn secondary">
            Open Settings
          </Link>
        </div>

        <p className="start-footer">Choose your element. Take the center.</p>
      </div>
    </div>
  );
}

export default StartScreen;
