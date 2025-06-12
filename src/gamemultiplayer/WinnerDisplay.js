// src/components/WinnerDisplay.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Tambahkan ini

const WinnerDisplay = ({ winnerName }) => {
  const navigate = useNavigate(); // ✅ Inisialisasi navigate

  const handleBackToMultiplayer = () => {
    navigate('/play'); // ✅ Navigasi ke halaman multiplayer
  };

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    color: 'white',
    fontFamily: 'Arial, sans-serif',
  };

  const winnerTextStyle = {
    fontSize: '6em',
    fontWeight: 'bold',
    color: '#FFD700',
    textShadow: '0 0 15px rgba(255, 215, 0, 0.7)',
    animation: 'pulse 1.5s infinite alternate',
    marginBottom: 20,
    marginTop: 50,
  };

  const messageStyle = {
    fontSize: '3em',
    color: '#00FF00',
    marginBottom: 40,
  };

  const buttonStyle = {
    padding: '15px 30px',
    fontSize: '1.2em',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#00BFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '20px',
  };

  const buttonHoverStyle = {
    backgroundColor: '#009acd',
  };

  const confettiStyle = (delay) => ({
    position: 'absolute',
    width: '15px',
    height: '15px',
    backgroundColor: ['#FFC0CB', '#ADD8E6', '#90EE90', '#FFD700'][Math.floor(Math.random() * 4)],
    borderRadius: '50%',
    opacity: 0.8,
    animation: `fall ${Math.random() * 3 + 2}s linear ${delay}s infinite`,
    left: `${Math.random() * 100}vw`,
    top: `-${Math.random() * 20}px`,
  });

  const styleSheet = document.styleSheets[0];

  const pulseKeyframes = `
    @keyframes pulse {
      0% { transform: scale(1); }
      100% { transform: scale(1.05); }
    }
  `;
  if (![...styleSheet.cssRules].some(rule => rule.name === 'pulse')) {
    styleSheet.insertRule(pulseKeyframes, styleSheet.cssRules.length);
  }

  const fallKeyframes = `
    @keyframes fall {
      0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
  `;
  if (![...styleSheet.cssRules].some(rule => rule.name === 'fall')) {
    styleSheet.insertRule(fallKeyframes, styleSheet.cssRules.length);
  }

  return (
    <div style={containerStyle}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={confettiStyle(i * 0.1)}></div>
      ))}

      <p style={messageStyle}>
        🎉 <span style={{ color: '#00BFFF' }}>SELAMAT!</span> 🎉
      </p>
      <h1 style={winnerTextStyle}>
        {winnerName}
      </h1>
      <p style={messageStyle}>
        MENANG!
      </p>

      <button
        style={buttonStyle}
        onMouseOver={(e) => (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)}
        onMouseOut={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
        onClick={handleBackToMultiplayer} // ✅ Navigasi saat diklik
      >
        Kembali
      </button>
    </div>
  );
};

export default WinnerDisplay;
