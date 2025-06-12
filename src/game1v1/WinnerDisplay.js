import React from 'react';

const WinnerDisplay = ({ winner, username, scores, onRestartGame }) => {
  if (!winner) {
    return null; 
  }

  return (
    <div style={styles.winnerBanner}>
      <div style={styles.winnerContent}>
        <p style={styles.winnerText}>-- GAME OVER --</p>
        <p style={styles.winnerSubText}>-- {winner.toUpperCase()} IS THE WINNER! --</p>

        {scores && (
          <div style={styles.scoreDetails}>
            <p style={styles.scoreTitle}>FINAL SCORES</p>
            <ul style={styles.scoreList}>
              <li style={styles.scoreItem}>
                <span style={styles.scorePlayer}>{username.toUpperCase()}:</span>
                <span style={styles.scoreValue}>{scores.player}</span>
              </li>
              <li style={styles.scoreItem}>
                <span style={styles.scorePlayer}>PLAYER 1 :</span>
                <span style={styles.scoreValue}>{scores.bot}</span>
              </li>
            </ul>
          </div>
        )}
        <button onClick={onRestartGame} style={styles.restartButton}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

const styles = {
  winnerBanner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom right, #2c3e50, #34495e, #1a2c3e)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    backdropFilter: 'blur(6px)',
  },
  winnerContent: {
    background: 'linear-gradient(160deg, #FF7F50 0%, #FFD700 100%)',
    border: '5px solid #E67E22',
    padding: '40px 60px',
    borderRadius: 15,
    textAlign: 'center',
    color: '#333',
    boxShadow: '0 15px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '90%',
    margin: '20px',
    fontFamily: '"Press Start 2P", cursive',
    textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
    transform: 'scale(1)',
    animation: 'pulse 1.5s infinite alternate',
  },
  winnerText: {
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#7C0A02',
    letterSpacing: '4px',
    textShadow: '3px 3px #FFDDC1',
  },
  winnerSubText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 35,
    color: '#004080',
    letterSpacing: '3px',
    textShadow: '2px 2px 0 #FFF, 4px 4px 0 #17A2B8', 
  },
  scoreDetails: {
    width: '100%',
    marginBottom: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '20px 30px',
    borderRadius: 10,
    border: '3px solid rgba(255,255,255,0.6)',
    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.6)',
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FFF',
    letterSpacing: '3px',
    textShadow: '2px 2px #C0392B',
  },
  scoreList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  scoreItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
    textShadow: '1px 1px #A93226',
  },
  scorePlayer: {
    textAlign: 'left',
    flex: 1,
  },
  scoreValue: {
    textAlign: 'right',
  },
  restartButton: {
    marginTop: 40,
    padding: '18px 40px',
    fontSize: 24,
    borderRadius: 10,
    background: 'linear-gradient(to right, #1ABC9C, #2ECC71)',
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    outline: 'none',
    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: 'bold',
    '&:hover': {
      background: 'linear-gradient(to right, #16A085, #27AE60)',
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: '0 12px 25px rgba(0,0,0,0.5)',
    },
    '&:active': {
      transform: 'translateY(0) scale(0.98)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    },
  },
};

export default WinnerDisplay;