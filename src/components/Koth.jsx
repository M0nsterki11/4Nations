import '../styles/Koth.css';

// kothPlayers = array od 4 igrača (po 1 iz svakog tima u sredini)
// kothRolls = { teamId: broj, ... }   (ili kako želiš)
// onRoll = funkcija koju zoveš kad klikneš "Baci"
// onRoundEnd = funkcija kad završi KOTH runda

function Koth({
  kothPlayers,
  kothRolls,
  onRoll,
  winnerTeam,
  onRoundEnd,
  kothRolling,
  isTeamEliminated,
}) {
  // jedinstveni timovi koji sudjeluju u ovoj rundi
  const activeTeams = [...new Set(kothPlayers.map(p => p.team))].filter(
    teamId => !isTeamEliminated(teamId)
  );

  const allRolled =
    activeTeams.length > 0 &&
    activeTeams.every(teamId => kothRolls[teamId] !== undefined);

  return (
    <>
      {/* tamna pozadina kao kod winner/challenge modala */}
      <div className="modal-overlay" />

      <div className="koth-modal">
        <h2>King of the Hill</h2>
        <p className="koth-subtitle">
          Svi timovi koji su u sredini bacaju kocku. Pobjednik ostaje, ostali se vraćaju unatrag.
        </p>

        {/* lista igrača u sredini */}
        <div className="koth-section">
          <h3>Igrači u sredini</h3>
          <ul className="koth-player-list">
            {kothPlayers
              .filter(p => !isTeamEliminated(p.team))
              .map(p => (
                <li key={p.id} className="koth-player-item">
                  <span className="koth-player-icon">{p.icon}</span>
                  <span className="koth-player-label">
                    Tim {p.team}
                    {p.name ? ` — ${p.name}` : ""}
                  </span>
                  <span className="koth-player-roll">
                    {kothRolls[p.team] !== undefined
                      ? `Bacio: ${kothRolls[p.team]}`
                      : "Čeka bacanje"}
                  </span>
                </li>
              ))}
          </ul>
        </div>

        {/* gumbi za bacanje po timu */}
        <div className="koth-section">
          <h3>Bacanja</h3>
          <div className="koth-buttons">
            {activeTeams.map(teamId => (
              <button
                key={teamId}
                className="koth-roll-btn"
                onClick={() => onRoll(teamId)}
                disabled={kothRolls[teamId] !== undefined || kothRolling}
              >
                🎲 Baci za tim {teamId}
              </button>
            ))}
          </div>

          {kothRolling && (
            <p className="koth-status">Bacanje u tijeku...</p>
          )}
          {allRolled && !winnerTeam && (
            <p className="koth-status">
              Svi su bacili – izračunavam pobjednika...
            </p>
          )}
        </div>

        {/* prikaz pobjednika runde + Nastavi */}
        {winnerTeam && (
          <div className="koth-section koth-winner">
            <h3>
              {Array.isArray(winnerTeam) && winnerTeam.length > 1
                ? `Pobjednici KOTH runde: ${winnerTeam
                    .map(t => `Tim ${t}`)
                    .join(", ")}`
                : `Pobjednik KOTH runde: Tim ${
                    Array.isArray(winnerTeam) ? winnerTeam[0] : winnerTeam
                  }`}
            </h3>
            <button className="koth-continue-btn" onClick={onRoundEnd}>
              Nastavi igru
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Koth;
