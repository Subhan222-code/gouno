import React from 'react';

const CreateRoom = ({ formCreate, setFormCreate, onCreateRoom, onCancel }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#000', // 🔲 background hitam penuh
    }}
  >
    <form
      onSubmit={onCreateRoom}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: 300,
        width: '100%',
        background: '#222', // abu tua untuk kontras
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(255,255,255,0.1)',
        color: 'white',
      }}
    >
      <h2 style={{ textAlign: 'center', color: 'white' }}>Buat Room</h2>

      <input
        required
        placeholder="Nama Host"
        value={formCreate.hostName}
        onChange={(e) => setFormCreate({ ...formCreate, hostName: e.target.value })}
        style={inputStyle}
      />

      <input
        required
        placeholder="Nama Room"
        value={formCreate.roomName}
        onChange={(e) => setFormCreate({ ...formCreate, roomName: e.target.value })}
        style={inputStyle}
      />

      <input
        placeholder="Password (optional)"
        type="password"
        value={formCreate.password}
        onChange={(e) => setFormCreate({ ...formCreate, password: e.target.value })}
        style={inputStyle}
      />

      <input
        type="number"
        min={2}
        max={4}
        value={formCreate.maxPlayers}
        onChange={(e) => setFormCreate({ ...formCreate, maxPlayers: e.target.value })}
        style={inputStyle}
      />

      <button type="submit" style={buttonStyle}>Buat</button>
      <button type="button" onClick={onCancel} style={{ ...buttonStyle, backgroundColor: '#666' }}>
        Kembali
      </button>
    </form>
  </div>
);

const inputStyle = {
  padding: '10px',
  borderRadius: '6px',
  border: 'none',
  outline: 'none',
  width: '94%',
};

const buttonStyle = {
  padding: '10px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#444',
  color: 'white',
  cursor: 'pointer',
  width: '100%',
};

export default CreateRoom;
