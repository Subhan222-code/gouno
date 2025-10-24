import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import modeImage from '../assets/ModeGame.png';
import kembali from '../assets/kembali.png';
import clickSound from '../sound/mixkit.wav';
import bgMusic from '../sound/Shuffle_Up.mp3';

function Play() {
  const navigate = useNavigate();

  const [clickAudio] = useState(() => new Audio(clickSound));
  const [bgAudio] = useState(() => {
    const audio = new Audio(bgMusic);
    audio.loop = true;
    audio.volume = 0.5;
    return audio;
  });

  // 🔊 Putar musik latar setelah interaksi pengguna
  useEffect(() => {
    const startMusic = () => {
      bgAudio.play().catch((err) => {
        console.warn('Autoplay ditolak, akan menunggu interaksi pengguna:', err);
      });
      document.removeEventListener('click', startMusic);
    };

    // Jika autoplay ditolak, kita tunggu klik pertama pengguna
    document.addEventListener('click', startMusic);

    return () => {
      bgAudio.pause();
      bgAudio.currentTime = 0;
      document.removeEventListener('click', startMusic);
    };
  }, [bgAudio]);

  const playClickSound = useCallback(() => {
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {}); // abaikan error kecil autoplay
  }, [clickAudio]);

  const handleSelectMode = useCallback(
    (mode) => {
      playClickSound();
      bgAudio.pause();
      navigate(`/game/${mode}`);
    },
    [bgAudio, navigate, playClickSound]
  );

  const handleBack = useCallback(() => {
    playClickSound();
    bgAudio.pause();
    navigate(-1);
  }, [bgAudio, navigate, playClickSound]);

  return (
    <div style={styles.container}>
      <button onClick={handleBack} style={styles.backButton} aria-label="Kembali">
        <img src={kembali} alt="Kembali" style={styles.backIcon} />
      </button>

      <img src={modeImage} alt="Pilih Mode Permainan" style={styles.image} />

      <div style={styles.buttonGroup}>
        <button
          style={styles.button}
          onClick={() => handleSelectMode('1v1')}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#009e80')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#00b894')}
        >
          1 vs 1
        </button>
        <button
          style={styles.button}
          onClick={() => handleSelectMode('1v3')}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#009e80')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#00b894')}
        >
          1 vs 3
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    position: 'relative',
    fontFamily: 'Poppins, sans-serif',
  },
  image: {
    width: '300px',
    marginBottom: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '2rem',
  },
  button: {
    padding: '1rem 2rem',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    backgroundColor: '#00b894',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.15s ease',
  },
  backButton: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  backIcon: {
    width: '40px',
    height: '40px',
    transition: 'transform 0.2s ease',
  },
};

export default Play;
