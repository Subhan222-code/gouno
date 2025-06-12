// src/components/TimesUpDisplay.js
import React from 'react';

const TimesUpDisplay = ({ onBackToLobby }) => { // Tambahkan onBackToLobby
  const containerStyle = { // Buat container agar tombol bisa di tengah
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

  const timesUpMessageStyle = {
    fontSize: '3.5em',
    fontWeight: 'bold',
    color: '#ffc107', // Kuning/Oranye
    textAlign: 'center',
    textShadow: '0 0 10px rgba(255, 193, 7, 0.5)',
    animation: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both infinite', // Animasi getar
  };

  const backToLobbyButtonStyle = {
    padding: '15px 40px',
    fontSize: '1.8em',
    fontWeight: 'bold',
    backgroundColor: '#007bff', // Biru
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    marginTop: 30, // Jarak dari pesan
  };

  // Keyframes for shake animation
  const styleSheet = document.styleSheets[0];
  const shakeKeyframes = `
    @keyframes shake {
      10%, 90% {
        transform: translate3d(-1px, 0, 0);
      }
      20%, 80% {
        transform: translate3d(2px, 0, 0);
      }
      30%, 50%, 70% {
        transform: translate3d(-4px, 0, 0);
      }
      40%, 60% {
        transform: translate3d(4px, 0, 0);
      }
    }
  `;
  if (![...styleSheet.cssRules].some(rule => rule.name === 'shake')) {
    styleSheet.insertRule(shakeKeyframes, styleSheet.cssRules.length);
  }

  return (
    <div style={containerStyle}>
      <div style={timesUpMessageStyle}>
        ⏰ Waktu Habis! Game Berakhir.
      </div>
      {onBackToLobby && (
        <button
          style={backToLobbyButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onClick={onBackToLobby}
        >
          KEMBALI
        </button>
      )}
    </div>
  );
};

export default TimesUpDisplay;