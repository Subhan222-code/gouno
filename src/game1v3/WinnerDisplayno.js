import React, { useEffect } from 'react';

const WinnerDisplay = ({ winner, scores, onPlayAgain, username }) => {
  useEffect(() => {
    // 🎉 Tambahkan konfeti saat pemenang muncul
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = () => {
      const duration = 2 * 1000;
      const end = Date.now() + duration;
      (function frame() {
        window.confetti({
          particleCount: 6,
          spread: 60,
          startVelocity: 35,
          origin: { y: 0.6 },
          colors: ['#FF0000', '#00FF00', '#FFFF00', '#0000FF'],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    };
    document.body.appendChild(script);
  }, [winner]);

  if (!winner) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <h1 style={styles.title}>🏆 {winner.toUpperCase()} MENANG! 🏆</h1>

        {scores && (
          <div style={styles.scoreBox}>
            <h2 style={styles.scoreTitle}>📊 SKOR AKHIR RONDE</h2>
            <ul style={styles.scoreList}>
              <li><strong>{username}</strong>: {scores.player}</li>
              <li><strong>Player 1</strong>: {scores.player1}</li>
              <li><strong>Player 2</strong>: {scores.player2}</li>
              <li><strong>Player 3</strong>: {scores.player3}</li>
            </ul>
          </div>
        )}

        <button onClick={onPlayAgain} style={styles.button}>
          🔁 Main Lagi
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background:
      'linear-gradient(135deg, #ff0000, #ffcc00, #00ff00, #0066ff)',
    backgroundSize: '400% 400%',
    animation: 'gradientMove 8s ease infinite',
    backdropFilter: 'blur(6px)',
    zIndex: 1000,
  },
  container: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '20px',
    padding: '50px 70px',
    textAlign: 'center',
    color: '#fff',
    fontFamily: '"Poppins", sans-serif',
    boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.2)',
    maxWidth: '600px',
    width: '90%',
    animation: 'scaleUp 0.7s ease',
  },
  title: {
    fontSize: '36px',
    fontWeight: '900',
    marginBottom: '20px',
    color: '#FFD700',
    textShadow: '2px 2px 10px #000, 0 0 20px #FF4500, 0 0 40px #FFD700',
  },
  scoreBox: {
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: '10px',
    padding: '20px 30px',
    marginBottom: '40px',
    textAlign: 'left',
  },
  scoreTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#00FFFF',
    textAlign: 'center',
    textShadow: '1px 1px 3px #000',
  },
  scoreList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    lineHeight: 1.8,
    fontSize: '18px',
  },
  button: {
    padding: '15px 45px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    background:
      'linear-gradient(90deg, #00ffcc, #00ccff, #0099ff, #00ffcc)',
    backgroundSize: '400% 400%',
    animation: 'neonMove 4s linear infinite',
    boxShadow: '0 0 20px rgba(0,255,200,0.6)',
    transition: 'transform 0.3s ease',
  },

  // Keyframes CSS (React inline styles tidak mendukung @keyframes secara langsung)
  '@global': {
    '@keyframes gradientMove': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
    '@keyframes scaleUp': {
      from: { transform: 'scale(0.8)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
    '@keyframes neonMove': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
  },
};

export default WinnerDisplay;
