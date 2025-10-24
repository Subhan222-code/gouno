import React from 'react';

const StartGameButton = ({ isHost, playersCount, onStartGame }) => {
  // Jika bukan host, tidak tampilkan tombol sama sekali
  if (!isHost) return null;

  // Pesan jika pemain belum cukup
  if (playersCount < 2) {
    return (
      <p style={styles.warning}>
        Menunggu pemain lain... ({playersCount}/2)
      </p>
    );
  }

  // Pesan jika pemain terlalu banyak
  if (playersCount > 2) {
    return (
      <p style={styles.warning}>
         Pemain terlalu banyak! Maksimal hanya 2 pemain (Saat ini: {playersCount})
      </p>
    );
  }

  // Tampilkan tombol jika tepat 2 pemain
  return (
    <button onClick={onStartGame} style={styles.button}>
       Mulai Game
    </button>
  );
};

// Gaya tombol dan pesan
const styles = {
  button: {
    background: 'linear-gradient(90deg, #00ffcc, #0099ff)',
    color: '#fff',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
  },
  warning: {
    color: '#ffcc00',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '10px',
    textAlign: 'center',
  },
};

// Efek hover (disarankan gunakan CSS eksternal jika ingin animasi halus)
styles.button[':hover'] = {
  transform: 'scale(1.05)',
  boxShadow: '0 0 20px rgba(0,255,200,0.6)',
};

export default StartGameButton;
