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

function PortalRollOverlay({ onComplete, portalRoll }) {
  if (!portalRoll) {
    return null;
  }

  return (
    <div className="dice-roll-overlay">
      <div
        className="dice-roll-portal"
        style={{ "--dice-roll-duration": `${portalRoll.duration}ms` }}
      >
        <DiceRollAnimation
          key={portalRoll.id}
          frames={diceRollFrames}
          isRolling={portalRoll.isRolling}
          duration={portalRoll.duration}
          onComplete={onComplete}
        />
        <div className="dice-roll-team-label">Tim {portalRoll.team}</div>
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
  onRollAnimationComplete,
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
        onComplete={onRollAnimationComplete}
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
