import React from 'react';
import { motion } from 'framer-motion';

const WinnerDisplay = ({ winner, username, scores, onRestartGame }) => {
  if (!winner) return null;

  return (
    <div style={styles.overlay}>
      <motion.div
        style={styles.card}
        initial={{ scale: 0.7, opacity: 0, rotateX: -20 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 10 }}
      >
        {/* Title Section */}
        <motion.h2
          style={styles.title}
          animate={{
            textShadow: [
              '0 0 10px #fff',
              '0 0 20px #ff0000',
              '0 0 15px #ffcc00',
              '0 0 10px #fff',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🎉 GAME OVER 🎉
        </motion.h2>

        <p style={styles.winnerText}>
          🏆 <span style={{ color: '#FFD700' }}>{winner.toUpperCase()}</span> IS THE WINNER! 🏆
        </p>

        {/* Scores */}
        {scores && (
          <motion.div
            style={styles.scoreBox}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h3 style={styles.scoreTitle}>FINAL SCORES</h3>
            <ul style={styles.scoreList}>
              <li style={styles.scoreItem}>
                <span>{username.toUpperCase()}</span>
                <span>{scores.player}</span>
              </li>
              <li style={styles.scoreItem}>
                <span>PLAYER 1</span>
                <span>{scores.bot}</span>
              </li>
            </ul>
          </motion.div>
        )}

        {/* Play Again Button */}
        <motion.button
          style={styles.button}
          whileHover={{
            scale: 1.1,
            background: 'linear-gradient(to right, #ff0000, #ffcc00)',
            boxShadow: '0 0 25px rgba(255, 215, 0, 0.9)',
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestartGame}
        >
          🔁 PLAY AGAIN
        </motion.button>
      </motion.div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(circle at center, rgba(0,0,0,0.95), rgba(0,0,0,0.85))',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  card: {
    background: 'linear-gradient(145deg, #8B0000, #FF4500, #FFD700)',
    padding: '50px 70px',
    borderRadius: 25,
    textAlign: 'center',
    boxShadow: '0 15px 45px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.3)',
    fontFamily: '"Poppins", sans-serif',
    color: '#fff',
    maxWidth: '90%',
    width: 520,
    border: '3px solid rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 15,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  winnerText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FFF',
    textShadow: '2px 2px 6px #000',
  },
  scoreBox: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: '20px',
    marginBottom: 35,
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
  },
  scoreTitle: {
    fontSize: 22,
    marginBottom: 15,
    color: '#FFD700',
    letterSpacing: 2,
    textShadow: '0 0 10px #000',
  },
  scoreList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  scoreItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    fontSize: 20,
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    color: '#FFF',
  },
  button: {
    background: 'linear-gradient(to right, #27ae60, #2ecc71)',
    border: 'none',
    color: 'white',
    padding: '16px 40px',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
    transition: 'all 0.3s ease',
  },
};

export default WinnerDisplay;
