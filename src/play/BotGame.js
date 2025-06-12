import React, { useState, useEffect } from 'react';
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
    audio.volume = 0.5; // sesuaikan volume jika perlu
    return audio;
  });

  useEffect(() => {
    bgAudio.play().catch((e) => {
      // Kadang autoplay ditolak browser, jadi kita bisa log atau abaikan
      console.warn('Autoplay ditolak, akan diputar saat interaksi pengguna:', e);
    });

    return () => {
      bgAudio.pause();
      bgAudio.currentTime = 0;
    };
  }, [bgAudio]);

  const playClickSound = () => {
    clickAudio.currentTime = 0;
    clickAudio.play();
  };

  const handleSelectMode = (mode) => {
    playClickSound();
    bgAudio.pause(); // hentikan bgm saat pindah halaman
    navigate(`/game/${mode}`);
  };

  const handleBack = () => {
    bgAudio.pause();
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      <button onClick={handleBack} style={styles.backButton}>
        <img src={kembali} alt="Kembali" style={styles.backIcon} />
      </button>

      <img src={modeImage} alt="Mode" style={styles.image} />

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={() => handleSelectMode('1v1')}>
          1 vs 1
        </button>
        <button style={styles.button} onClick={() => handleSelectMode('1v3')}>
          1 vs 3
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    position: 'relative', 
  },
  image: {
    width: '300px',
    marginBottom: '2rem',
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
    transition: '0.2s ease',
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
  },
};

export default Play;
