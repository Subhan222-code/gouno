import React from 'react';

const CreateRoom = ({ formCreate, setFormCreate, onCreateRoom, onCancel }) => (
  <div style={styles.container}>
    <form onSubmit={onCreateRoom} style={styles.form}>
      <h2 style={styles.title}>🎮 Buat Room</h2>

      <input
        required
        placeholder="Nama Host"
        value={formCreate.hostName}
        onChange={(e) => setFormCreate({ ...formCreate, hostName: e.target.value })}
        style={styles.input}
      />

      <input
        required
        placeholder="Nama Room"
        value={formCreate.roomName}
        onChange={(e) => setFormCreate({ ...formCreate, roomName: e.target.value })}
        style={styles.input}
      />

      <input
        placeholder="Password (opsional)"
        type="password"
        value={formCreate.password}
        onChange={(e) => setFormCreate({ ...formCreate, password: e.target.value })}
        style={styles.input}
      />

      <input
        type="number"
        min={2}
        max={4}
        value={formCreate.maxPlayers}
        onChange={(e) => setFormCreate({ ...formCreate, maxPlayers: e.target.value })}
        style={styles.input}
        placeholder="Jumlah Pemain (2–4)"
      />

      <div style={styles.buttonContainer}>
        <button type="submit" style={{ ...styles.button, ...styles.createBtn }}>
          Buat Room
        </button>
        <button type="button" onClick={onCancel} style={{ ...styles.button, ...styles.cancelBtn }}>
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
  createBtn: {
    background: 'linear-gradient(90deg, #00ffaa, #00cc88)',
  },
  cancelBtn: {
    background: '#555',
  },
};

// efek hover sederhana
styles.input[':focus'] = {
  borderColor: '#00ffaa',
  boxShadow: '0 0 6px #00ffaa',
};
styles.button[':hover'] = {
  transform: 'scale(1.03)',
};

export default CreateRoom;
