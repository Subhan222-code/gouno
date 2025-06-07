import React from 'react';

const JoinRoom = ({ formJoin, setFormJoin, onJoinRoom, onCancel }) => (
  <form
    onSubmit={onJoinRoom}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      color: 'white',
      backgroundColor: '#222',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '400px',
      margin: '40px auto',
    }}
  >
    <h2 style={{ color: 'white' }}>Gabung Room</h2>

    <input
      required
      placeholder="Nama Pemain"
      value={formJoin.playerName}
      onChange={(e) => setFormJoin({ ...formJoin, playerName: e.target.value })}
      style={{ padding: '10px', borderRadius: '6px', border: 'none', width: '94%' }}
    />

    <input
      required
      placeholder="ID Room"
      value={formJoin.roomId}
      onChange={(e) => setFormJoin({ ...formJoin, roomId: e.target.value.toUpperCase() })}
      style={{ padding: '10px', borderRadius: '6px', border: 'none', width: '94%' }}
    />

    <input
      placeholder="Password (optional)"
      type="password"
      value={formJoin.password}
      onChange={(e) => setFormJoin({ ...formJoin, password: e.target.value })}
      style={{ padding: '10px', borderRadius: '6px', border: 'none', width: '94%' }}
    />

    <button
      type="submit"
      style={{
        padding: '10px 20px',
        borderRadius: '6px',
        backgroundColor: '#444',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      Join
    </button>

    <button
      type="button"
      onClick={onCancel}
      style={{
        padding: '10px 20px',
        borderRadius: '6px',
        backgroundColor: '#666',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      Back
    </button>
  </form>
);

export default JoinRoom;
