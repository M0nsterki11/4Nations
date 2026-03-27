import PlayerToken from "../PlayerToken";
import {
  CENTER_TILE_ICON,
  CENTER_TILE_INDEXES,
  CENTER_TILE_REPRESENTATIVE,
  GRID_SIZE,
  getRepresentativeIndex,
} from "./mapHelpers";

function buildTiles(players, currentTeam) {
  const tiles = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const index = row * GRID_SIZE + col;

      if (CENTER_TILE_INDEXES.has(index) && index !== CENTER_TILE_REPRESENTATIVE) {
        continue;
      }

      const isPathTile = players.some((player) => player.path.includes(index));
      const playersHere = players.filter(
        (player) => getRepresentativeIndex(player.path[player.step]) === index
      );
      const isCenter = index === CENTER_TILE_REPRESENTATIVE;
      const classes = [
        "tile",
        isCenter && "center-2x2",
        isPathTile && "path-tile",
        playersHere.length > 0 && "has-player",
      ]
        .filter(Boolean)
        .join(" ");

      tiles.push(
        <div key={index} className={classes}>
          {isCenter ? CENTER_TILE_ICON : index}
          {playersHere.map((player) => (
            <PlayerToken
              key={player.id}
              icon={player.icon}
              active={player.team === currentTeam}
            />
          ))}
        </div>
      );
    }
  }

  return tiles;
}

function BoardGrid({
  currentTeam,
  isModalOpen,
  offset,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  players,
}) {
  const mouseHandlers = isModalOpen
    ? {}
    : {
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave: onMouseUp,
      };

  return (
    <div className="viewport" {...mouseHandlers}>
      <div
        className="big-map"
        onMouseDown={isModalOpen ? undefined : onMouseDown}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        <div className="grid">{buildTiles(players, currentTeam)}</div>
      </div>
    </div>
  );
}

export default BoardGrid;
