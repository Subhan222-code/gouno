// src/components/StartGameButton.js
import React from 'react';

const StartGameButton = ({ isHost, playersCount, onStartGame }) => {
  if (!isHost) return null;
  if (playersCount !== 2)
    return <p>Butuh tepat 2 pemain untuk mulai game! (Saat ini: {playersCount})</p>;

  return <button onClick={onStartGame}>Mulai Game</button>;
};

export default StartGameButton;
