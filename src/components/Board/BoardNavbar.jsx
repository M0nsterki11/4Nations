import { useEffect, useRef, useState } from "react";
import DiceRollAnimation from "../../animations/DiceRollAnimation";
import frame1 from "../../assets/frame1.png";
import frame2 from "../../assets/frame2.png";
import frame3 from "../../assets/frame3.png";
import frame4 from "../../assets/frame4.png";
import frame5 from "../../assets/frame5.png";
import frame6 from "../../assets/frame6.png";
import Dice from "../Dice";
import "../../styles/NavBar.css";
import heartEmpty from "../../assets/heart_empty.png";
import heartFull from "../../assets/heart_full.png";
import {
  TEAM_IDS,
  getTeamElementClass,
  getTeamIcons,
} from "./mapHelpers";

const diceRollFrames = [frame1, frame2, frame3, frame4, frame5, frame6];
const ROLL_RESULT_DISPLAY_DURATION = 1400;
const PLAYER_ROLE_ORDER = {
  first: 0,
  second: 1,
};

function PortalRollOverlay({ onComplete, portalRoll }) {
  const [showResults, setShowResults] = useState(false);
  const resultTimeoutRef = useRef(null);

  useEffect(() => {
    setShowResults(false);

    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = null;
    }
  }, [portalRoll?.id]);

  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  if (!portalRoll) {
    return null;
  }

  const handleAnimationComplete = () => {
    setShowResults(true);

    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }

    resultTimeoutRef.current = setTimeout(() => {
      resultTimeoutRef.current = null;
      onComplete?.();
    }, ROLL_RESULT_DISPLAY_DURATION);
  };

  const sortedPlayerRolls = [...(portalRoll.playerRolls ?? [])].sort(
    (leftPlayer, rightPlayer) =>
      (PLAYER_ROLE_ORDER[leftPlayer.role] ?? Number.MAX_SAFE_INTEGER) -
        (PLAYER_ROLE_ORDER[rightPlayer.role] ?? Number.MAX_SAFE_INTEGER) ||
      (leftPlayer.playerId ?? 0) - (rightPlayer.playerId ?? 0)
  );

  return (
    <div className="dice-roll-overlay">
      <div
        className="dice-roll-portal dice-roll-portal-dual"
        style={{ "--dice-roll-duration": `${portalRoll.duration}ms` }}
      >
        <div className="dice-roll-team-label">Tim {portalRoll.team}</div>
        <div className="dice-roll-player-grid">
          {sortedPlayerRolls.map((playerRoll, index) => {
            const playerNumber = index + 1;
            const playerKey =
              playerRoll.playerId ?? `${playerRoll.role}-${playerNumber}`;

            return (
              <div key={playerKey} className="dice-roll-player-column">
                <div className="dice-roll-player-title">P{playerNumber}</div>
                <div className="dice-roll-player-slot">
                  {showResults ? (
                    <span className="dice-roll-result-value">
                      {playerRoll.value}
                    </span>
                  ) : (
                    <DiceRollAnimation
                      key={`${portalRoll.id}-${playerKey}`}
                      frames={diceRollFrames}
                      isRolling
                      duration={portalRoll.duration}
                      onComplete={index === 0 ? handleAnimationComplete : undefined}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TeamSlot({
  currentTeam,
  damagePopups,
  isDiceLocked,
  onTeamRoll,
  players,
  teamHearts,
  teamId,
}) {
  const hearts = teamHearts[teamId] ?? 0;
  const teamIcons = getTeamIcons(players, teamId);
  const elementClass = getTeamElementClass(teamId);
  const isActive = teamId === currentTeam;

  return (
    <div
      className={`team-slot ${elementClass} ${
        isActive ? "team-slot-active" : ""
      }`}
    >
      <Dice
        team={teamIcons}
        onTeamRoll={onTeamRoll}
        disabled={isDiceLocked || teamId !== currentTeam}
      />

      <div className="team-hp-placeholder">
        <div className="team-hearts">
          {[0, 1].map((heartIndex) => {
            const isFull = heartIndex < hearts;

            return (
              <img
                key={heartIndex}
                src={isFull ? heartFull : heartEmpty}
                alt={isFull ? "Full heart" : "Empty heart"}
                className="heart-icon"
              />
            );
          })}
        </div>

        {damagePopups
          .filter((popup) => popup.teamId === teamId)
          .map((popup) => (
            <div key={popup.id} className="damage-popup">
              {"\u2764\uFE0F"}-{popup.amount}
            </div>
          ))}
      </div>
    </div>
  );
}

function BoardNavbar({
  currentTeam,
  damagePopups,
  isDiceLocked,
  isTeamEliminated,
  onLeave,
  onPortalRollComplete,
  onTeamRoll,
  players,
  portalRoll,
  teamHearts,
}) {
  const currentTeamPlayers = players.filter((player) => player.team === currentTeam);

  return (
    <div className="game-navbar">
      <button className="leave-button" onClick={onLeave}>
        <span className="leave-text">Leave</span>
        <span className="leave-smiley">{"\u{1F61E}"}</span>
      </button>

      <div className="navbar-title">
        <span className="navbar-logo">4NATIONS</span>
        <span className="navbar-turn">
          Potez tima:
          {currentTeamPlayers.map((player) => (
            <span key={player.id} className="current-icon">
              {player.icon}
            </span>
          ))}
        </span>
      </div>

      <PortalRollOverlay
        onComplete={onPortalRollComplete}
        portalRoll={portalRoll}
      />

      <div className="navbar-dice">
        {TEAM_IDS.filter((teamId) => !isTeamEliminated(teamId)).map((teamId) => (
          <TeamSlot
            key={teamId}
            currentTeam={currentTeam}
            damagePopups={damagePopups}
            isDiceLocked={isDiceLocked}
            onTeamRoll={onTeamRoll}
            players={players}
            teamHearts={teamHearts}
            teamId={teamId}
          />
        ))}
      </div>
    </div>
  );
}

export default BoardNavbar;
