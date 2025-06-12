import React from 'react';

const WinnerDisplay = ({ winner, scores, onPlayAgain, username }) => {
  if (!winner) {
    return null; // Don't render if there's no winner yet
  }

  return (
    <div style={winnerDisplayStyles.winnerAndScoresBanner}>
      <p style={winnerDisplayStyles.winnerText}>🎉 {winner} menang!</p>
      {scores && (
        <div style={winnerDisplayStyles.scoreDetails}>
          <p>Skor akhir ronde:</p>
          <ul>
            <li>{username}: {scores.player}</li>
            <li>Player 1: {scores.player1}</li>
            <li>Player 2: {scores.player2}</li>
            <li>Player 3: {scores.player3}</li>
          </ul>
        </div>
      )}
      <button onClick={onPlayAgain} style={winnerDisplayStyles.playAgainButton}>
        Main Lagi
      </button>
    </div>
  );
};

const winnerDisplayStyles = {
  winnerAndScoresBanner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 10,
    zIndex: 20,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreDetails: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'left',
  },
  playAgainButton: {
    marginTop: 15,
    padding: '10px 20px',
    borderRadius: 5,
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
    fontSize: 18,
  },
};

export default WinnerDisplay;