// src/components/PlayerToken.jsx
import React from 'react';
import '../styles/GameBoard.css';

const PlayerToken = ({ icon, active }) => (
  <div className={`player-token${active ? ' active' : ''}`}>
    {icon}
  </div>
);

export default PlayerToken;
