import Dice from "../Dice";
import heartEmpty from "../../assets/heart_empty.png";
import heartFull from "../../assets/heart_full.png";
import {
  TEAM_IDS,
  getTeamElementClass,
  getTeamIcons,
} from "./mapHelpers";

function PortalRollOverlay({ portalRoll }) {
  if (!portalRoll) {
    return null;
  }

  return (
    <div className="portal-overlay">
      <div className="portal-circle">
        {portalRoll.showDice && (
          <div className="portal-dice">
            <div className="portal-dice-face">
              {portalRoll.roll1 + portalRoll.roll2}
            </div>
            <div className="portal-dice-team">Tim {portalRoll.team}</div>
          </div>
        )}
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

      <PortalRollOverlay portalRoll={portalRoll} />

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
