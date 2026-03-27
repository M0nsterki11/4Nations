import { getValidAttackTargets } from "./mapHelpers";

export function AttackModal({ attackMode, onSelectTarget, players }) {
  if (!attackMode) {
    return null;
  }

  const validTargets = getValidAttackTargets(players, attackMode.team);

  if (!validTargets.length) {
    return null;
  }

  return (
    <div className="attack-modal">
      <p>Tim {attackMode.team}, izaberite koga napadate:</p>
      {validTargets.map((teamId) => (
        <button key={teamId} onClick={() => onSelectTarget(teamId)}>
          Tim {teamId}
        </button>
      ))}
    </div>
  );
}

export function ChallengeModal({
  currentChallenge,
  onReady,
  onResolve,
  players,
  readyStatus,
  stage,
}) {
  if (stage === "ready") {
    const readyPlayers = Object.keys(readyStatus)
      .map((playerId) =>
        players.find((player) => player.id === Number(playerId))
      )
      .filter(Boolean);

    return (
      <div className="challenge-modal">
        <p>
          Izazov: <strong>{currentChallenge || "Ucitavam izazov..."}</strong>
        </p>
        <p>Svi kliknite "Ready" kad ste spremni.</p>

        {readyPlayers.map((player) => (
          <button
            key={player.id}
            disabled={readyStatus[player.id]}
            onClick={() => onReady(player.id)}
          >
            {readyStatus[player.id]
              ? `${player.icon} Ready`
              : `Ready ${player.icon}`}
          </button>
        ))}
      </div>
    );
  }

  if (stage === "vote") {
    return (
      <div className="challenge-modal">
        <p>Odaberite rezultat izazova:</p>

        <button onClick={() => onResolve(true)}>Napadac pobijedio</button>
        <button onClick={() => onResolve(false)}>Obrana pobijedila</button>
      </div>
    );
  }

  return null;
}

export function WinnerModal({ onRestart, winnerIcon, winnerTeam }) {
  if (winnerTeam === null) {
    return null;
  }

  return (
    <>
      <div className="modal-overlay" />
      <div className="winner-modal">
        <h2>Pobjednik!</h2>
        <p>
          Tim {winnerTeam} je osvojio igru!{" "}
          <span style={{ fontSize: "2rem" }}>{winnerIcon}</span>
        </p>
        <button onClick={onRestart}>Nova igra</button>
      </div>
    </>
  );
}
