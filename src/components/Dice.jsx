import React from 'react';
import '../styles/Dice.css';

const Dice = ({ onTeamRoll, disabled, team }) => {
  return (
    <button className="dice-btn" onClick={onTeamRoll} disabled={disabled}>
      🎲 Tim {team} baci kocke
    </button>
  );
};

export default Dice;