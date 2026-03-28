import React from "react";
import { Link } from "react-router-dom";
import FloatingEmblems from "./FloatingEmblems";
import "../../styles/StartScreen.css";

function StartScreen() {
  const menuHighlights = ["4 Nations", "8 Warriors", "1 Throne"];

  return (
    <div className="app-root start-screen">
      <div className="start-screen-backdrop" aria-hidden="true">
        <span className="start-orb start-orb-air" />
        <span className="start-orb start-orb-earth" />
        <span className="start-orb start-orb-water" />
        <span className="start-orb start-orb-fire" />

        <FloatingEmblems />
      </div>

      <div className="lobby start-lobby">
        <div className="start-badge">Arena of Elements</div>

        <h1 className="lobby-title">
          <span className="start-title-accent">4NATIONS</span>
        </h1>

        <p className="lobby-subtitle">
          Enter the elemental arena, rush the center and fight to keep the
          throne before the rival nations take it from you.
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
            Enter Arena
          </Link>

          <Link to="/settings" className="lobby-btn secondary">
            Visit War Council
          </Link>
        </div>

        <p className="start-footer">Choose your nation. Claim the throne.</p>
      </div>
    </div>
  );
}

export default StartScreen;
