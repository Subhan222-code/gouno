import React from 'react';

const JoinRoom = ({ formJoin, setFormJoin, onJoinRoom, onCancel }) => (
  <div style={styles.container}>
    <form onSubmit={onJoinRoom} style={styles.form}>
      <h2 style={styles.title}>🚪 Gabung Room</h2>

      <input
        required
        placeholder="Nama Pemain"
        value={formJoin.playerName}
        onChange={(e) => setFormJoin({ ...formJoin, playerName: e.target.value })}
        style={styles.input}
      />

      <input
        required
        placeholder="ID Room"
        value={formJoin.roomId}
        onChange={(e) =>
          setFormJoin({ ...formJoin, roomId: e.target.value.toUpperCase() })
        }
        style={styles.input}
      />

      <input
        placeholder="Password (opsional)"
        type="password"
        value={formJoin.password}
        onChange={(e) => setFormJoin({ ...formJoin, password: e.target.value })}
        style={styles.input}
      />

      <div style={styles.buttonContainer}>
        <button type="submit" style={{ ...styles.button, ...styles.joinBtn }}>
          Join Room
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ ...styles.button, ...styles.cancelBtn }}
        >
          Kembali
        </button>
      </div>
    </form>
  </div>
);

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
    color: 'white',
    fontFamily: 'Poppins, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    width: '100%',
    maxWidth: 340,
    background: 'rgba(34, 34, 34, 0.95)',
    padding: '28px 24px',
    borderRadius: '14px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(6px)',
    transition: 'transform 0.3s ease',
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
    color: '#00ffaa',
    letterSpacing: '1px',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #444',
    outline: 'none',
    backgroundColor: '#111',
    color: 'white',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    fontSize: '14px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  button: {
    flex: 1,
    padding: '10px 0',
    borderRadius: '8px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'all 0.3s ease',
  },
  joinBtn: {
    background: 'linear-gradient(90deg, #00ffaa, #00cc88)',
  },
  cancelBtn: {
    background: '#555',
  },
};

export default JoinRoom;
