import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import { challenges } from '../../data/challenges';
import { paths } from '../../data/paths';

import "../../styles/GameBoard.css";
import PlayerToken from '../PlayerToken';
import Dice from '../Dice';
import Koth from '../Koth';
import heartFull from '../../assets/heart_full.png';
import heartEmpty from '../../assets/heart_empty.png';
import LeaveAnimation from "../../animations/LeaveAnimation"; 


// inicijalni igrači iz kvadranta:
const initialPlayers = [
  { id: 1, team: 1, icon: '🌪️', path: paths[1], step: 0, role: 'first' },
  { id: 2, team: 1, icon: '🌪️', path: paths[1], step: 0, role: 'second' },

  { id: 3, team: 2, icon: '🌱', path: paths[2], step: 0, role: 'first' },
  { id: 4, team: 2, icon: '🌱', path: paths[2], step: 0, role: 'second' },

  { id: 5, team: 3, icon: '💧', path: paths[3], step: 0, role: 'first' },
  { id: 6, team: 3, icon: '💧', path: paths[3], step: 0, role: 'second' },

  { id: 7, team: 4, icon: '🔥', path: paths[4], step: 0, role: 'first' },
  { id: 8, team: 4, icon: '🔥', path: paths[4], step: 0, role: 'second' },
];

//POCINJE IGRA
const GameBoard = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [players, setPlayers] = useState(initialPlayers);
  const [currentTeam, setCurrentTeam] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [attackMode, setAttackMode] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeStage, setChallengeStage] = useState(null);
  const [attackerPlayer, setAttackerPlayer] = useState(null);
  const [attackerTeam, setAttackerTeam] = useState(null);
  const [challengeForPlayer, setChallengeForPlayer] = useState(null); 
  const [winnerTeam, setWinnerTeam] = useState(null);
  const isModalOpen = attackMode !== null || challengeStage !== null;
  const diceDisabled = rolling || isModalOpen;
  const [kothAttacker, setKothAttacker] = useState(null);
  const gridSize = 30;
  const activePlayer = useMemo(() => {
  return players.find(p => p.team === currentTeam && !p.isReturning);
  }, [players, currentTeam]);

      // ANIMACIJE ###########################
  const [isLeaving, setIsLeaving] = useState(false);
  const handleLeave = () => {
    if (isLeaving) return;    // da ne klikneš 5x
    setIsLeaving(true);       // pokreće LeaveAnimation
  };

  const handleLeaveComplete = () => {
    navigate("/");            // kad animacija završi → StartScreen
  };


  const currentTeamIcon =
    players.find(p => p.team === currentTeam)?.icon || "❓";

      // KOTH Stateovi ############################
  const [kothRolling, setKothRolling] = useState(false);
  const [kothWinner, setKothWinner] = useState(null);
  const [kothActive, setKothActive] = useState(false);
  const [kothPlayers, setKothPlayers] = useState([]);
  const [teamsReadyForKoth, setTeamsReadyForKoth] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const [teamHearts, setTeamHearts] = useState({
    1: 2,
    2: 2,
    3: 2,
    4: 2,
  });

  // Za praćenje tko je kliknuo Ready
  const [readyStatus, setReadyStatus] = useState({});
  // Koji je tim meta za ovaj izazov
  const [defenderTeam, setDefenderTeam] = useState(null);

 // KOTH state za rundu, rezultate itd.
  const [kothState, setKothState] = useState({
    results: {},
    round: 0,
  });

  // CENTAR
  const centerTiles = new Set([434, 435, 464, 465]);
  const repIndex = idx => (centerTiles.has(idx) ? 434 : idx);
  const isTeamEliminated = (teamId) => { return !players.some(p => p.team === teamId);};


                //#### KOTH useEffecti ####

useEffect(() => {
  // 1) Tko je u sredini (i nije u povratku)?
  const playersInCenter = players.filter(
    p => centerTiles.has(repIndex(p.path[p.step])) && !p.isReturning
  );

  const teamsGrouped = playersInCenter.reduce((acc, p) => {
    if (!acc[p.team]) acc[p.team] = [];
    acc[p.team].push(p);
    return acc;
  }, {});

  // 2) TRIGGER ZA ATTACK MODE (isti kao prije)
  for (const team in teamsGrouped) {
    if (teamsGrouped[team].length >= 2 && !attackMode && !challengeStage) {
      const attacker = teamsGrouped[team][1]; // drugi koji je ušao

      setAttackMode({
        attackerId: attacker.id,
        team: attacker.team,
      });
      setChallengeForPlayer(null);
      setAttackerPlayer(attacker);
      setAttackerTeam(attacker.team);
      return; // prekini dalje izvršavanje
    }
  }

  // 3) KOTH LOGIKA

  // timovi koji su u CENTRU u ovom trenutku
  const activeTeams = Object.keys(teamsGrouped).map(Number);

  // svi ŽIVI timovi (oni koji još imaju barem jednog igrača)
  const livingTeams = Array.from(
    new Set(players.map(p => p.team))
  );

  // ne radimo KOTH ako su 2 tima ostala
  if (livingTeams.length < 3) return;

  // svi živi timovi su trenutno u centru?
  const allLivingInCenter =
    activeTeams.length === livingTeams.length &&
    livingTeams.every(teamId => activeTeams.includes(teamId));

  // svi živi timovi su već jednom odabrali metu (ready za KOTH)?
  const allLivingTeamsReady =
    livingTeams.every(teamId => teamsReadyForKoth[teamId]);

  if (
    !kothActive &&
    allLivingInCenter &&
    allLivingTeamsReady &&
    !attackMode &&
    !challengeStage
  ) {
    setKothActive(true);
    setKothWinner(null);
    setKothPlayers(
      Object.values(teamsGrouped).map(players => players[0]) // po 1 igrač iz svakog tima
    );
    setKothState(prev => ({ ...prev, results: {} }));
  }
}, [players, kothActive, attackMode, challengeStage, teamsReadyForKoth]);

useEffect(() => {
  if (!kothActive || kothWinner) return;

  // koji timovi sudjeluju u ovoj KOTH rundi (i nisu eliminirani)
  const teamsInKoth = [...new Set(
    kothPlayers.map(p => p.team)
  )].filter(teamId => !isTeamEliminated(teamId));

  // kad broj rezultata == broj timova, runda je gotova
  if (
    teamsInKoth.length > 0 &&
    Object.keys(kothState.results).length === teamsInKoth.length
  ) {
    handleKothRoundEnd();
  }
}, [kothActive, kothPlayers, kothState, kothWinner]);


useEffect(() => {
  if (challengeStage !== 'ready') return;
  if (Object.values(readyStatus).every(v => v)) {
    setChallengeStage('vote');
  }
}, [readyStatus, challengeStage]);


                        // Safety net da garantira da je currentTeam uvijek active
useEffect(() => {
  // ako nema igrača, nema što raditi
  if (players.length === 0) return;

  const currentTeamAlive = players.some(p => p.team === currentTeam);

  if (!currentTeamAlive) {
    // ➜ prebaci potez na SLJEDEĆI tim po redu,
    // koristeći postojeću nextTurn logiku (getNextTeam + isTeamEliminated)
    nextTurn();
  }
}, [players, currentTeam]);

useEffect(() => {
  // Ako već ima aktivan challenge, čekaj
  if (challengeForPlayer !== null || challengeStage !== null) return;

  // Nađi PRVOG (ili SVE, ali bolje jedan po jedan) igrača koji je stigao do kraja reverse puta
  const candidate = players.find(
    p => p.isReturning && p.step === p.path.length - 1 && p.defenderTeam
  );
  if (candidate) {
    setChallengeForPlayer({
      attackerId: candidate.id,
      attackerTeam: candidate.team,
      defenderTeam: candidate.defenderTeam,
    });
  }
}, [players, challengeForPlayer, challengeStage]);


useEffect(() => {
  if (!challengeForPlayer) return;
  // Pokreni modal, setiraj ready/vote za SVE igrače iz oba tima
  const { attackerTeam, defenderTeam } = challengeForPlayer;

  // Nasumični izazov
  const rand = Math.floor(Math.random() * challenges.length);
  setCurrentChallenge(challenges[rand]);
  setAttackerTeam(attackerTeam);
  setDefenderTeam(defenderTeam);

  const involvedIds = players
    .filter(p => p.team === attackerTeam || p.team === defenderTeam)
    .map(p => p.id);

  setReadyStatus(Object.fromEntries(involvedIds.map(id => [id, false])));
  setChallengeStage("ready");
}, [challengeForPlayer]);

useEffect(() => {
  // Ako već imamo pobjednika ili igra nije gotova, ne radi ništa
  if (winnerTeam !== null) return;
  // Izvuci sve žive timove
  const livingTeams = Array.from(new Set(players.map(p => p.team)));
  if (livingTeams.length === 1) {
    setWinnerTeam(livingTeams[0]);
  }
}, [players, winnerTeam]);

useEffect(() => {
  if (!kothActive || !kothWinner) return;

  const t = setTimeout(() => {
    // zatvori modal i očisti
    setKothActive(false);
    setKothPlayers([]);
    setKothWinner(null);
    setKothRolling(false);
    setRolling(false);
    // mozda dodati nextTurn();
  }, 3000);

  return () => clearTimeout(t);
}, [kothActive, kothWinner]);


// ZAVRŠETAK USE EFEKTA ####################################################################


function handleKothRoll(teamId) {
  if (kothWinner) return;        // već imamo pobjednika, ignoriraj KAK TO RADI ??????
  if (isTeamEliminated(teamId)) return; // eliminirani tim ne može bacati
  if (kothRolling) return;

  setKothRolling(true);

  const roll = Math.floor(Math.random() * 6) + 1;

  setTimeout(() => {
    // očisti listu igrača od eliminiranih timova
    setKothPlayers(prevPlayers =>
      prevPlayers.filter(p => !isTeamEliminated(p.team))
    );

    // upiši rezultat i odmah filtriraj rezultate eliminiranih timova
    setKothState(prev => {
      const updatedResults = {
        ...prev.results,
        [teamId]: roll,
      };

      const filteredResults = Object.fromEntries(
        Object.entries(updatedResults).filter(
          ([t]) => !isTeamEliminated(Number(t))
        )
      );

      return { ...prev, results: filteredResults };
    });

    setKothRolling(false);
  }, 300);
}

function getNextTeam(teamId) {
  return teamId === 4 ? 1 : teamId + 1;
}


function handleKothRoundEnd() {
  const rolls = kothState.results;
  const teamIds = Object.keys(rolls);
  if (teamIds.length === 0) return;

  const maxRoll = Math.max(...Object.values(rolls));
  const winningTeams = teamIds
    .filter(teamId => rolls[teamId] === maxRoll)
    .map(Number);

    console.log('[KOTH] Rezultati runde:', kothState.results);
    console.log('[KOTH] Pobjednici:', winningTeams);

  // samo igrače koji su stvarno bili u KOTH-u smijemo dirati
  const kothIds = new Set(kothPlayers.map(p => p.id));

  // pobjednici ostaju, poraženi se vraćaju unatrag za (max - njihov)
  setPlayers(prev =>
    prev.map(p => {
      if (!kothIds.has(p.id)) return p;         // nije bio u KOTH-u
      const their = rolls[p.team];
      if (their == null) return p;
      if (winningTeams.includes(p.team)) return p;

      const diff = maxRoll - their;
      const newStep = Math.max(0, p.step - diff);
      return { ...p, step: newStep };
    })
  );
  
    // DEBUG STANJA NAKON UPDATE-a za Tokene
  setTimeout(() => {
    console.log('[KOTH] Stanje igrača nakon primjene KOTH logike:', players);
  }, 10);

  // prikaži WINNER / WINNERS banner
  setKothWinner(winningTeams);

  // round++ i reset rezultata (auto-close effect odradi ostalo)
  setKothState(prev => ({
    ...prev,
    round: prev.round + 1,
  }));
}


function nextTurn() {
  let next = currentTeam;
  do {
    next = getNextTeam(next);
  } while (isTeamEliminated(next));
  setCurrentTeam(next);
  setRolling(false);
}

function resolveChallenge(attackerWon) {
  if (!challengeForPlayer) return;

  const { attackerId, defenderTeam } = challengeForPlayer;

  // pronađi tim napadača prema attackerId
  const attackerPlayerObj = players.find(p => p.id === attackerId);
  const attackingTeamId = attackerPlayerObj ? attackerPlayerObj.team : attackerTeam;

  if (attackerWon) {
    // ✅ Napadač pobijedio → defender gubi 1 HP
    setTeamHearts(prev => {
      const before = prev[defenderTeam] ?? 0;
      const newHearts = Math.max(0, before - 1);

      // ako želiš floating ❤️-1, ovdje možeš pozvati showDamage(defenderTeam);

      // ako je pao na 0 → tim ispada iz igre
      if (newHearts === 0) {
        setPlayers(ps => {
          const survivors = ps.filter(p => p.team !== defenderTeam);

          // opcionalno: ako želiš resetirati napadače koji su se vraćali
          return survivors.map(p =>
            p.isReturning && p.defenderTeam === defenderTeam
              ? {
                  ...p,
                  isReturning: false,
                  defenderTeam: null,
                  step: 0,
                  path: [434], // centar
                }
              : p
          );
        });
      }

      return { ...prev, [defenderTeam]: newHearts };
    });

    // ➜ VAŽNO: NEMA više dodatnog setPlayers izvan ovog if-a
  } else {
    // ❌ Napad nije uspio → ATTACKER gubi 1 HP i vraća se u sredinu
    if (attackingTeamId != null) {
      setTeamHearts(prev => ({
        ...prev,
        [attackingTeamId]: Math.max(0, (prev[attackingTeamId] ?? 0) - 1),
      }));
    }

    setPlayers(ps =>
      ps.map(p =>
        p.id === attackerId
          ? {
              ...p,
              step: 0,
              path: [434], // centar
              isReturning: false,
              defenderTeam: null,
            }
          : p
      )
    );
  }

  // resetiraj challenge state
  setChallengeForPlayer(null);
  setCurrentChallenge(null);
  setChallengeStage(null);
  setReadyStatus({});
  setAttackerTeam(null);
  setDefenderTeam(null);
  nextTurn();
}


  // TEAM ROLL ####
const handleTeamRoll = () => {
  if (attackMode || challengeStage) return; // blokiraj sve dok traje izazov

  if (
    rolling ||
    attackMode !== null ||
    challengeStage !== null
  ) return;

  setRolling(true);

  const roll1 = Math.floor(Math.random() * 6) + 1;
  const roll2 = Math.floor(Math.random() * 6) + 1;

  // 1. Pomicanje oba člana tima koji NISU u centru
  setPlayers(ps =>
    ps.map(p => {
      if (
  p.team === currentTeam &&
  !centerTiles.has(repIndex(p.path[p.step]))
) {
  // pronađi teammate
  const teammate = ps.find(tp =>
    tp.team === currentTeam &&
    tp.id !== p.id
  );

  // ako je p napadač (isReturning == true), onda teammate mora biti u centru
  if (p.isReturning && teammate && !centerTiles.has(repIndex(teammate.path[teammate.step]))) {
    return p; // NE pomiči napadača dok teammate nije u centru
  }
        const roll = p.role === 'first' ? roll1 : roll2;
        return {
          ...p,
          step: Math.min(p.step + roll, p.path.length - 1)
        };
      }
      return p;
    })
  );

  // 2. Ako ovaj tim ima igrača u centru, onda bacaj za KOTH
  const inCenter = players.some(p =>
    p.team === currentTeam &&
    centerTiles.has(repIndex(p.path[p.step]))
  );

  if (kothActive && inCenter) {
    handleKothRoll(currentTeam);
  }

  setTimeout(() => {
    setRolling(false);
    setCurrentTeam(t => (t === 4 ? 1 : t + 1));
  }, 300);
};



  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPoint({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - startPoint.x,
      y: e.clientY - startPoint.y
    });
  };
  const handleMouseUp = () => setIsDragging(false);


// GENERACIJA MAPE I TOK IGRE

const generateTiles = () => {
  const tiles = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;

      // preskoči spajanje centra
      if (centerTiles.has(index) && index !== 434) continue;

      // highlight svih path-ova ili samo trenutnog tima?
      // ZA RAZVOJ: highlight svih puteva
      const isPathTile = players.some(p => p.path.includes(index));
      // lociraj igrače na ovom indexu (nakon normalizacije repIndex)
      const playersHere = players.filter(p =>
        repIndex(p.path[p.step]) === index
      );

      const isCenter = index === 434;
      const classes = [
        'tile',
        isCenter && 'center-2x2',
        isPathTile && 'path-tile',
        playersHere.length > 0 && 'has-player'
      ]
        .filter(Boolean)
        .join(' ');

      const content = isCenter ? '🏝️' : index;

      tiles.push(
        <div key={index} className={classes}>
          {content}
          {playersHere.map(p => (
            <PlayerToken
              key={p.id}
              icon={p.icon}
              active={p.team === currentTeam}
            />
          ))}
        </div>
      );
    }
  }

  return tiles;
};

  return (
    <div className="game-container">
      {/* NAVBAR */}
    <div className="game-navbar">
        <button className="leave-button" onClick={handleLeave}>
          <span className="leave-text">Leave</span>
        <span className="leave-smiley">😞</span>
        </button>

        <div className="navbar-title">
          <span className="navbar-logo">4NATIONS</span>
          <span className="navbar-turn">
            — Potez tima:
            {players
              .filter(p => p.team === currentTeam)
              .map(p => (
                <span key={p.id} className="current-icon">
                  {p.icon}
                </span>
              ))}
        </span>
      </div>

      <div className="navbar-dice">
        {[1, 2, 3, 4]
          .filter(teamId => !isTeamEliminated(teamId))
          .map(teamId => {
            const teamIcons = players
              .filter(p => p.team === teamId)
              .map(p => p.icon)
              .join(" ");

            // elemental klasa po timu
            const elementClass =
              teamId === 1
                ? "team-air"   // 🌪️
                : teamId === 2
                ? "team-earth" // 🌱
                : teamId === 3
                ? "team-water" // 💧
                : "team-fire"; // 🔥

            const isActive = teamId === currentTeam;

            return (
              <div
                key={teamId}
                className={`team-slot ${elementClass} ${
                  isActive ? "team-slot-active" : ""
                }`}
              >
                <Dice
                  team={teamIcons}
                  onTeamRoll={handleTeamRoll}
                  disabled={
                    rolling ||
                    attackMode !== null ||
                    challengeStage !== null ||
                    teamId !== currentTeam
                  }
                />

                <div className="team-hp-placeholder">
                <div className="team-hearts">
                  { [0, 1].map(i => {
                    const hearts = teamHearts[teamId] ?? 0;
                    const isFull = i < hearts;
                    return (
                      <img
                        key={i}
                        src={isFull ? heartFull : heartEmpty}
                        alt={isFull ? "Full heart" : "Empty heart"}
                        className="heart-icon"
                            />
                          );
                        })
                      }
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
    
    {attackMode && (
  (() => {
    const validTargets = [1, 2, 3, 4]
      .filter(t => t !== attackMode.team)
      .filter(t => players.some(p => p.team === t));

    if (validTargets.length === 0) return null;

    return (
      <div className="attack-modal">
        <p>Tim {attackMode.team}, izaberite koga napadate:</p>
        {validTargets.map(t => (
          <button
            key={t}
            onClick={() => {
              const attackerId = attackMode.attackerId;
              const defTeam = t;

              setPlayers(ps => ps.map(p =>
                p.id !== attackerId
                  ? p
                  : {
                      ...p,
                      path: [...paths[defTeam]].reverse(),
                      step: 1,
                      isReturning: true,
                      defenderTeam: defTeam,
                    }
              ));
                setTeamsReadyForKoth(prev => ({
                  ...prev,
                  [attackMode.team]: true,   // ovaj tim je sada "u napadu"
                }));
              setAttackMode(null);
            }}
          >
            Tim {t}
          </button>
        ))}
      </div>
    );
  })()
)}


    {challengeStage === "ready" && (
      <div className="challenge-modal">
        <p>Izazov: <strong>{currentChallenge || "Učitavam izazov..."}</strong></p>
        <p>Svi kliknite “Ready” kad ste spremni!</p>

         {Object.keys(readyStatus).map(key => {
            const id = parseInt(key, 10);
            const p  = players.find(pl => pl.id === id);
          return (
            <button
              key={p.id}
              disabled={readyStatus[p.id]}
              onClick={() => setReadyStatus(rs => ({ ...rs, [p.id]: true }))
            }
        >
          {readyStatus[p.id] ? `${p.icon} Ready` : `Ready ${p.icon}`}
        </button>
        );
      })}
    </div>
  )}

    {challengeStage === "vote" && (
      <div className="challenge-modal">
        <p>Odaberite rezultat izazova:</p>

        <button onClick={() => resolveChallenge(true)}>
          Napadač pobijedio
        </button>

        <button onClick={() => resolveChallenge(false)}>
          Obrana pobijedila
        </button>
      </div>
  )}

    {kothActive && (
      <Koth
        kothPlayers={kothPlayers}
        currentTeam={currentTeam}
        onRoll={handleKothRoll}
        winnerTeam={kothWinner}
        kothRolls={kothState.results}
        isRolling={rolling}
        kothRolling={kothRolling}
        isTeamEliminated={isTeamEliminated}
      />
    )}

      <div
        className="viewport"
          onMouseDown={!isModalOpen ? handleMouseDown : undefined}
          onMouseMove={!isModalOpen ? handleMouseMove : undefined}
          onMouseUp={!isModalOpen ? handleMouseUp : undefined}
          onMouseLeave={!isModalOpen ? handleMouseUp : undefined}
      >
        <div
          className="big-map"
          onMouseDown={handleMouseDown}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        >
          <div className="grid">{generateTiles()}</div>
        </div>
      </div>

      <LeaveAnimation
        isLeaving={isLeaving}
        currentIcon={currentTeamIcon}
        onComplete={handleLeaveComplete}
      />

  {winnerTeam !== null && (
  <>
    <div className="modal-overlay"></div>
    <div className="winner-modal">
      <h2>Pobjednik!</h2>
      <p>
        Tim {winnerTeam} je osvojio igru!{" "}
        <span style={{ fontSize: "2rem" }}>
          {players.find(p => p.team === winnerTeam)?.icon}
        </span>
      </p>
      <button onClick={() => window.location.reload()}>Nova igra</button>
    </div>
  </>
)}
    </div>
  );
};
export default GameBoard;