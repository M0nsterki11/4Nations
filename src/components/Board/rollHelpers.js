import { isPlayerInCenter } from "./mapHelpers";

const PLAYER_ROLE_ORDER = {
  first: 0,
  second: 1,
};

const getPlayerRoleOrder = (player) =>
  PLAYER_ROLE_ORDER[player.role] ?? Number.MAX_SAFE_INTEGER;

export const createRegularRollValues = (randomFn = Math.random) => ({
  first: Math.floor(randomFn() * 6) + 1,
  second: Math.floor(randomFn() * 6) + 1,
});

export const createRegularRollPlayerData = (
  players,
  rollingTeamId,
  rollValuesByRole
) =>
  players
    .filter((player) => player.team === rollingTeamId)
    .sort(
      (leftPlayer, rightPlayer) =>
        getPlayerRoleOrder(leftPlayer) - getPlayerRoleOrder(rightPlayer) ||
        leftPlayer.id - rightPlayer.id
    )
    .map((player) => ({
      playerId: player.id,
      icon: player.icon,
      role: player.role,
      value: rollValuesByRole[player.role] ?? 0,
    }));

export const applyRegularTeamRoll = (
  players,
  rollingTeamId,
  rollValuesByRole
) => {
  const movedPlayers = players.map((player) => {
    if (player.team !== rollingTeamId || isPlayerInCenter(player)) {
      return player;
    }

    const teammate = players.find(
      (candidate) =>
        candidate.team === rollingTeamId && candidate.id !== player.id
    );

    if (player.isReturning && teammate && !isPlayerInCenter(teammate)) {
      return player;
    }

    const roll = rollValuesByRole[player.role] ?? 0;

    return {
      ...player,
      step: Math.min(player.step + roll, player.path.length - 1),
    };
  });

  return {
    movedPlayers,
    teamReachedCenter: movedPlayers.some(
      (player) => player.team === rollingTeamId && isPlayerInCenter(player)
    ),
  };
};
