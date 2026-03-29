import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { challenges } from "../../data/challenges";
import { paths } from "../../data/paths";
import LeaveAnimation from "../../animations/LeaveAnimation";
import Koth from "../Koth";
import BoardGrid from "./BoardGrid";
import BoardNavbar from "./BoardNavbar";
import {
  applyRegularTeamRoll,
  createRegularRollPlayerData,
  createRegularRollValues,
} from "./rollHelpers";
import {
  AttackModal,
  ChallengeModal,
  WinnerModal,
} from "./BoardModals";
import {
  CENTER_TILE_REPRESENTATIVE,
  createReadyStatus,
  getCurrentTeamIcon,
  getInvolvedPlayerIds,
  getKothWinningTeams,
  getLivingTeams,
  getNextTeamId,
  getPlayersInCenter,
  groupPlayersByTeam,
  initialPlayers,
  isTeamEliminated,
} from "./mapHelpers";

import "../../styles/GameBoard.css";
import "../../styles/Dice.css";

const initialKothReadyState = {
  1: false,
  2: false,
  3: false,
  4: false,
};

const initialTeamHearts = {
  1: 2,
  2: 2,
  3: 2,
  4: 2,
};

const ROLL_ANIMATION_DURATION = 1100;

const GameBoard = () => {
  const navigate = useNavigate();
  const rollTimeoutRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [players, setPlayers] = useState(initialPlayers);
  const [currentTeam, setCurrentTeam] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [attackMode, setAttackMode] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeStage, setChallengeStage] = useState(null);
  const [attackerTeam, setAttackerTeam] = useState(null);
  const [challengeForPlayer, setChallengeForPlayer] = useState(null);
  const [winnerTeam, setWinnerTeam] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [kothRolling, setKothRolling] = useState(false);
  const [kothWinner, setKothWinner] = useState(null);
  const [kothActive, setKothActive] = useState(false);
  const [kothPlayers, setKothPlayers] = useState([]);
  const [teamsReadyForKoth, setTeamsReadyForKoth] = useState(
    initialKothReadyState
  );
  const [teamHearts, setTeamHearts] = useState(initialTeamHearts);
  const [damagePopups, setDamagePopups] = useState([]);
  const [portalRoll, setPortalRoll] = useState(null);
  const [readyStatus, setReadyStatus] = useState({});
  const [kothState, setKothState] = useState({
    results: {},
    round: 0,
  });

  const isModalOpen = attackMode !== null || challengeStage !== null;
  const isDiceLocked =
    rolling ||
    attackMode !== null ||
    portalRoll !== null ||
    challengeStage !== null;
  const currentTeamIcon = getCurrentTeamIcon(players, currentTeam);

  const handleLeave = () => {
    if (isLeaving) {
      return;
    }

    setIsLeaving(true);
  };

  const handleLeaveComplete = () => {
    navigate("/");
  };

  useEffect(() => {
    return () => {
      if (rollTimeoutRef.current) {
        clearTimeout(rollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const playersInCenter = getPlayersInCenter(players);
    const teamsGrouped = groupPlayersByTeam(playersInCenter);

    for (const teamPlayers of Object.values(teamsGrouped)) {
      if (teamPlayers.length >= 2 && !attackMode && !challengeStage) {
        const attacker = teamPlayers[1];

        setAttackMode({
          attackerId: attacker.id,
          team: attacker.team,
        });
        setChallengeForPlayer(null);
        setAttackerTeam(attacker.team);
        return;
      }
    }

    const activeTeams = Object.keys(teamsGrouped).map(Number);
    const livingTeams = getLivingTeams(players);

    if (livingTeams.length < 3) {
      return;
    }

    const allLivingInCenter =
      activeTeams.length === livingTeams.length &&
      livingTeams.every((teamId) => activeTeams.includes(teamId));
    const allLivingTeamsReady = livingTeams.every(
      (teamId) => teamsReadyForKoth[teamId]
    );

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
        Object.values(teamsGrouped).map((playersInTeam) => playersInTeam[0])
      );
      setKothState((prevState) => ({ ...prevState, results: {} }));
    }
  }, [players, kothActive, attackMode, challengeStage, teamsReadyForKoth]);

  useEffect(() => {
    if (!kothActive || kothWinner) {
      return;
    }

    const teamsInKoth = [...new Set(kothPlayers.map((player) => player.team))].filter(
      (teamId) => !isTeamEliminated(players, teamId)
    );

    if (
      teamsInKoth.length === 0 ||
      Object.keys(kothState.results).length !== teamsInKoth.length
    ) {
      return;
    }

    const rolls = kothState.results;
    const winningTeams = getKothWinningTeams(rolls);

    if (!winningTeams.length) {
      return;
    }

    const maxRoll = Math.max(...Object.values(rolls));
    const kothIds = new Set(kothPlayers.map((player) => player.id));

    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (!kothIds.has(player.id)) {
          return player;
        }

        const playerRoll = rolls[player.team];

        if (playerRoll == null || winningTeams.includes(player.team)) {
          return player;
        }

        return {
          ...player,
          step: Math.max(0, player.step - (maxRoll - playerRoll)),
        };
      })
    );

    setKothWinner(winningTeams);
    setKothState((prevState) => ({
      ...prevState,
      round: prevState.round + 1,
    }));
  }, [kothActive, kothPlayers, kothState, kothWinner, players]);

  useEffect(() => {
    if (challengeStage !== "ready") {
      return;
    }

    if (Object.values(readyStatus).every(Boolean)) {
      setChallengeStage("vote");
    }
  }, [readyStatus, challengeStage]);

  useEffect(() => {
    if (!players.length) {
      return;
    }

    if (isTeamEliminated(players, currentTeam)) {
      let nextTeam = currentTeam;

      do {
        nextTeam = getNextTeamId(nextTeam);
      } while (isTeamEliminated(players, nextTeam));

      setCurrentTeam(nextTeam);
      setRolling(false);
    }
  }, [players, currentTeam]);

  useEffect(() => {
    if (challengeForPlayer !== null || challengeStage !== null) {
      return;
    }

    const candidate = players.find(
      (player) =>
        player.isReturning &&
        player.step === player.path.length - 1 &&
        player.defenderTeam
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
    if (!challengeForPlayer) {
      return;
    }

    const randomChallengeIndex = Math.floor(Math.random() * challenges.length);
    const { attackerTeam: attackingTeamId, defenderTeam: defendingTeamId } =
      challengeForPlayer;
    const involvedPlayerIds = getInvolvedPlayerIds(
      players,
      attackingTeamId,
      defendingTeamId
    );

    setCurrentChallenge(challenges[randomChallengeIndex]);
    setAttackerTeam(attackingTeamId);
    setReadyStatus(createReadyStatus(involvedPlayerIds));
    setChallengeStage("ready");
  }, [challengeForPlayer, players]);

  useEffect(() => {
    if (winnerTeam !== null) {
      return;
    }

    const livingTeams = getLivingTeams(players);

    if (livingTeams.length === 1) {
      setWinnerTeam(livingTeams[0]);
    }
  }, [players, winnerTeam]);

  useEffect(() => {
    if (!kothActive || !kothWinner) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setKothActive(false);
      setKothPlayers([]);
      setKothWinner(null);
      setKothRolling(false);
      setRolling(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [kothActive, kothWinner]);

  function handleKothRoll(teamId) {
    if (kothWinner || kothRolling || isTeamEliminated(players, teamId)) {
      return;
    }

    setKothRolling(true);

    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setKothPlayers((prevPlayers) =>
        prevPlayers.filter((player) => !isTeamEliminated(players, player.team))
      );

      setKothState((prevState) => {
        const updatedResults = {
          ...prevState.results,
          [teamId]: roll,
        };
        const filteredResults = Object.fromEntries(
          Object.entries(updatedResults).filter(
            ([teamKey]) => !isTeamEliminated(players, Number(teamKey))
          )
        );

        return {
          ...prevState,
          results: filteredResults,
        };
      });

      setKothRolling(false);
    }, 300);
  }

  function nextTurn() {
    let nextTeam = currentTeam;

    do {
      nextTeam = getNextTeamId(nextTeam);
    } while (isTeamEliminated(players, nextTeam));

    setCurrentTeam(nextTeam);
    setRolling(false);
  }

  const showDamage = (teamId, amount = 1) => {
    const popupId = Date.now() + Math.random();

    setDamagePopups((prevPopups) => [
      ...prevPopups,
      { id: popupId, teamId, amount },
    ]);

    setTimeout(() => {
      setDamagePopups((prevPopups) =>
        prevPopups.filter((popup) => popup.id !== popupId)
      );
    }, 800);
  };

  const resetChallengeState = () => {
    setChallengeForPlayer(null);
    setCurrentChallenge(null);
    setChallengeStage(null);
    setReadyStatus({});
    setAttackerTeam(null);
  };

  const movePlayerToCenter = (player) => ({
    ...player,
    step: 0,
    path: [CENTER_TILE_REPRESENTATIVE],
    isReturning: false,
    defenderTeam: null,
  });

  function resolveChallenge(attackerWon) {
    if (!challengeForPlayer) {
      return;
    }

    const { attackerId, defenderTeam: defendingTeamId } = challengeForPlayer;
    const attackerPlayer = players.find((player) => player.id === attackerId);
    const attackingTeamId = attackerPlayer
      ? attackerPlayer.team
      : attackerTeam;
    const defenderWillBeEliminated =
      attackerWon &&
      Math.max(0, (teamHearts[defendingTeamId] ?? 0) - 1) === 0;
    const attackerWillBeEliminated =
      !attackerWon &&
      attackingTeamId != null &&
      Math.max(0, (teamHearts[attackingTeamId] ?? 0) - 1) === 0;

    if (attackerWon) {
      setTeamHearts((prevHearts) => {
        const previousHearts = prevHearts[defendingTeamId] ?? 0;
        const newHearts = Math.max(0, previousHearts - 1);

        if (newHearts < previousHearts) {
          showDamage(defendingTeamId, 1);
        }

        return {
          ...prevHearts,
          [defendingTeamId]: newHearts,
        };
      });
    } else {
      if (attackingTeamId != null) {
        setTeamHearts((prevHearts) => {
          const previousHearts = prevHearts[attackingTeamId] ?? 0;
          const newHearts = Math.max(0, previousHearts - 1);

          if (newHearts < previousHearts) {
            showDamage(attackingTeamId, 1);
          }

          return {
            ...prevHearts,
            [attackingTeamId]: newHearts,
          };
        });
      }
    }

    setPlayers((prevPlayers) => {
      const survivingPlayers = prevPlayers.filter((player) => {
        if (defenderWillBeEliminated && player.team === defendingTeamId) {
          return false;
        }

        if (attackerWillBeEliminated && player.team === attackingTeamId) {
          return false;
        }

        return true;
      });

      return survivingPlayers.map((player) => {
        if (player.id === attackerId) {
          return movePlayerToCenter(player);
        }

        if (
          defenderWillBeEliminated &&
          player.isReturning &&
          player.defenderTeam === defendingTeamId
        ) {
          return movePlayerToCenter(player);
        }

        return player;
      });
    });

    resetChallengeState();
    nextTurn();
  }

  const handleTeamRoll = () => {
    if (attackMode || challengeStage || rolling || portalRoll !== null) {
      return;
    }

    setRolling(true);

    const rollingTeamId = currentTeam;
    const rollValuesByRole = createRegularRollValues();
    const playerRolls = createRegularRollPlayerData(
      players,
      rollingTeamId,
      rollValuesByRole
    );

    setPortalRoll({
      id: Date.now() + Math.random(),
      team: rollingTeamId,
      duration: ROLL_ANIMATION_DURATION,
      playerRolls,
    });

    if (rollTimeoutRef.current) {
      clearTimeout(rollTimeoutRef.current);
    }

    rollTimeoutRef.current = setTimeout(() => {
      let teamReachedCenter = false;

      setPlayers((prevPlayers) => {
        const rollResolution = applyRegularTeamRoll(
          prevPlayers,
          rollingTeamId,
          rollValuesByRole
        );

        teamReachedCenter = rollResolution.teamReachedCenter;

        return rollResolution.movedPlayers;
      });

      if (kothActive && teamReachedCenter) {
        handleKothRoll(rollingTeamId);
      }

      rollTimeoutRef.current = null;
      nextTurn();
    }, ROLL_ANIMATION_DURATION);
  };

  const handlePortalRollComplete = () => {
    setPortalRoll(null);
  };

  const handleAttackTargetSelect = (teamId) => {
    if (!attackMode) {
      return;
    }

    const attackerId = attackMode.attackerId;

    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id !== attackerId
          ? player
          : {
              ...player,
              path: [...paths[teamId]].reverse(),
              step: 1,
              isReturning: true,
              defenderTeam: teamId,
            }
      )
    );
    setTeamsReadyForKoth((prevState) => ({
      ...prevState,
      [attackMode.team]: true,
    }));
    setAttackMode(null);
  };

  const handleReadyClick = (playerId) => {
    setReadyStatus((prevStatus) => ({
      ...prevStatus,
      [playerId]: true,
    }));
  };

  const handleMouseDown = (event) => {
    setIsDragging(true);
    setStartPoint({
      x: event.clientX - offset.x,
      y: event.clientY - offset.y,
    });
  };

  const handleMouseMove = (event) => {
    if (!isDragging) {
      return;
    }

    setOffset({
      x: event.clientX - startPoint.x,
      y: event.clientY - startPoint.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const winnerIcon =
    winnerTeam !== null
      ? players.find((player) => player.team === winnerTeam)?.icon
      : null;

  return (
    <div className="game-container">
      <BoardNavbar
        currentTeam={currentTeam}
        damagePopups={damagePopups}
        isDiceLocked={isDiceLocked}
        isTeamEliminated={(teamId) => isTeamEliminated(players, teamId)}
        onLeave={handleLeave}
        onPortalRollComplete={handlePortalRollComplete}
        onTeamRoll={handleTeamRoll}
        players={players}
        portalRoll={portalRoll}
        teamHearts={teamHearts}
      />

      <AttackModal
        attackMode={attackMode}
        onSelectTarget={handleAttackTargetSelect}
        players={players}
      />

      <ChallengeModal
        currentChallenge={currentChallenge}
        onReady={handleReadyClick}
        onResolve={resolveChallenge}
        players={players}
        readyStatus={readyStatus}
        stage={challengeStage}
      />

      {kothActive && (
        <Koth
          kothPlayers={kothPlayers}
          onRoll={handleKothRoll}
          winnerTeam={kothWinner}
          kothRolls={kothState.results}
          kothRolling={kothRolling}
          isTeamEliminated={(teamId) => isTeamEliminated(players, teamId)}
        />
      )}

      <BoardGrid
        currentTeam={currentTeam}
        isModalOpen={isModalOpen}
        offset={offset}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        players={players}
      />

      <LeaveAnimation
        isLeaving={isLeaving}
        currentIcon={currentTeamIcon}
        onComplete={handleLeaveComplete}
      />

      <WinnerModal
        onRestart={() => window.location.reload()}
        winnerIcon={winnerIcon}
        winnerTeam={winnerTeam}
      />
    </div>
  );
};

export default GameBoard;
