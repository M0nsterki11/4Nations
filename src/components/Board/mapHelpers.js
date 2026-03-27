import { paths } from "../../data/paths";

export const GRID_SIZE = 30;
export const TEAM_IDS = [1, 2, 3, 4];
export const CENTER_TILE_REPRESENTATIVE = 434;
export const CENTER_TILE_INDEXES = new Set([434, 435, 464, 465]);
export const CENTER_TILE_ICON = "\u{1F3DD}\uFE0F";

const TEAM_ICONS = {
  1: "\u{1F32A}\uFE0F",
  2: "\u{1F331}",
  3: "\u{1F4A7}",
  4: "\u{1F525}",
};

const TEAM_ELEMENT_CLASSES = {
  1: "team-air",
  2: "team-earth",
  3: "team-water",
  4: "team-fire",
};

export const initialPlayers = [
  { id: 1, team: 1, icon: TEAM_ICONS[1], path: paths[1], step: 0, role: "first" },
  { id: 2, team: 1, icon: TEAM_ICONS[1], path: paths[1], step: 0, role: "second" },
  { id: 3, team: 2, icon: TEAM_ICONS[2], path: paths[2], step: 0, role: "first" },
  { id: 4, team: 2, icon: TEAM_ICONS[2], path: paths[2], step: 0, role: "second" },
  { id: 5, team: 3, icon: TEAM_ICONS[3], path: paths[3], step: 0, role: "first" },
  { id: 6, team: 3, icon: TEAM_ICONS[3], path: paths[3], step: 0, role: "second" },
  { id: 7, team: 4, icon: TEAM_ICONS[4], path: paths[4], step: 0, role: "first" },
  { id: 8, team: 4, icon: TEAM_ICONS[4], path: paths[4], step: 0, role: "second" },
];

export const getRepresentativeIndex = (tileIndex) =>
  CENTER_TILE_INDEXES.has(tileIndex) ? CENTER_TILE_REPRESENTATIVE : tileIndex;

export const isCenterTile = (tileIndex) => CENTER_TILE_INDEXES.has(tileIndex);

export const isPlayerInCenter = (player) =>
  isCenterTile(getRepresentativeIndex(player.path[player.step]));

export const getPlayersInCenter = (players) =>
  players.filter((player) => isPlayerInCenter(player) && !player.isReturning);

export const groupPlayersByTeam = (players) =>
  players.reduce((groups, player) => {
    if (!groups[player.team]) {
      groups[player.team] = [];
    }

    groups[player.team].push(player);
    return groups;
  }, {});

export const getLivingTeams = (players) => [...new Set(players.map((player) => player.team))];

export const isTeamEliminated = (players, teamId) =>
  !players.some((player) => player.team === teamId);

export const getNextTeamId = (teamId) => (teamId === 4 ? 1 : teamId + 1);

export const getTeamElementClass = (teamId) => TEAM_ELEMENT_CLASSES[teamId] ?? "";

export const getTeamIcons = (players, teamId) =>
  players
    .filter((player) => player.team === teamId)
    .map((player) => player.icon)
    .join(" ");

export const getCurrentTeamIcon = (players, teamId) =>
  players.find((player) => player.team === teamId)?.icon ?? "?";

export const getValidAttackTargets = (players, attackerTeam) =>
  TEAM_IDS.filter(
    (teamId) =>
      teamId !== attackerTeam && players.some((player) => player.team === teamId)
  );

export const getInvolvedPlayerIds = (players, attackerTeam, defenderTeam) =>
  players
    .filter(
      (player) => player.team === attackerTeam || player.team === defenderTeam
    )
    .map((player) => player.id);

export const createReadyStatus = (playerIds) =>
  Object.fromEntries(playerIds.map((playerId) => [playerId, false]));

export const getKothWinningTeams = (rolls) => {
  const teamIds = Object.keys(rolls);

  if (!teamIds.length) {
    return [];
  }

  const maxRoll = Math.max(...Object.values(rolls));

  return teamIds
    .filter((teamId) => rolls[teamId] === maxRoll)
    .map(Number);
};
