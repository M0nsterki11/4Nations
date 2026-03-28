import React from "react";
import { Link } from "react-router-dom";
import "../../styles/StartScreen.css";
import "../../styles/Settings.css";

const elementalIcons = ["🌪️", "🌱", "💧", "🔥"];
const settingsCards = [
  {
    title: "Match Rules",
    text: "Kasnije ces ovdje moci slagati broj srca, trajanje partije i win conditions.",
  },
  {
    title: "Audio",
    text: "Mjesto za glasnocu, ambience i sitne UI zvukove kad ih dodas u igru.",
  },
  {
    title: "Visuals",
    text: "Efekti, animacije i tempo meca mogu ici ovdje kad budes htio vise kontrole.",
  },
  {
    title: "Players",
    text: "Broj igraca, tim setup i eventualni custom modovi mogu kasnije ici u ovaj blok.",
  },
];

function SettingsScreen() {
  return (
    <div className="app-root start-screen settings-screen">
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

      <div className="lobby start-lobby settings-lobby">
        <div className="start-badge settings-badge">Control Chamber</div>

        <h1 className="lobby-title settings-title">Settings</h1>

        <p className="lobby-subtitle settings-subtitle">
          Ekran je sada povezan sa start menijem i spreman da kasnije primi
          prave opcije igre, zvukova i vizualnih postavki.
        </p>

        <div className="settings-grid">
          {settingsCards.map((card) => (
            <div key={card.title} className="settings-card">
              <div className="settings-card-header">
                <h3 className="settings-card-title">{card.title}</h3>
                <span className="settings-chip">Soon</span>
              </div>
              <p className="settings-card-text">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="lobby-buttons settings-actions">
          <Link to="/game" className="lobby-btn primary">
            Launch Match
          </Link>

          <Link to="/" className="lobby-btn secondary">
            Back To Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SettingsScreen;
