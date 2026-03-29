import React from "react";
import { Link } from "react-router-dom";
import FloatingBackdropOrbs from "./FloatingBackdropOrbs";
import FloatingEmblems from "./FloatingEmblems";
import "../../styles/StartScreen.css";
import "../../styles/Settings.css";

const settingsCards = [
  {
    title: "Arena Rules",
    text: "Kasnije ces ovdje slagati broj srca, tempo meca i uvjete pobjede za svaku bitku.",
  },
  {
    title: "Battle Audio",
    text: "Mjesto za glasnocu, ambience i udarne UI zvukove kad ih dodas u arenu.",
  },
  {
    title: "Arena Visuals",
    text: "Efekti, animacije i tempo prezentacije mogu ici ovdje kad budes htio vise kontrole.",
  },
  {
    title: "Warband Setup",
    text: "Broj igraca, tim setup i eventualni custom modovi mogu kasnije ici u ovaj blok.",
  },
];

function SettingsScreen() {
  return (
    <div className="app-root start-screen settings-screen">
      <div className="start-screen-backdrop" aria-hidden="true">
        <FloatingBackdropOrbs />
        <FloatingEmblems />
      </div>

      <div className="lobby start-lobby settings-lobby">
        <div className="start-badge settings-badge">War Council</div>

        <h1 className="lobby-title settings-title">Arena Settings</h1>

        <p className="lobby-subtitle settings-subtitle">
          Pripremi bojiste prije ulaska u arenu. Ovdje ce kasnije zivjeti sva
          pravila meca, zvukovi i vizualne postavke tvoje bitke.
        </p>

        <div className="settings-grid">
          {settingsCards.map((card) => (
            <div key={card.title} className="settings-card">
              <div className="settings-card-header">
                <h3 className="settings-card-title">{card.title}</h3>
                <span className="settings-chip">Forging</span>
              </div>
              <p className="settings-card-text">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="lobby-buttons settings-actions">
          <Link to="/game" className="lobby-btn primary">
            Enter Arena
          </Link>

          <Link to="/" className="lobby-btn secondary">
            Return To Gate
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SettingsScreen;
