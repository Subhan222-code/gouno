import React from 'react';
import StartGameButton from './StartGameButton';

const Lobby = ({
  currentRoomData,
  currentRoomId,
  playerName,
  messages,
  messageInput,
  setMessageInput,
  onSendMessage,
  onStartGame,
  onLeaveLobby,
}) => {
  if (!currentRoomData) return <p>Loading...</p>;

  const isHost = currentRoomData.hostName === playerName;

  if (currentRoomData.gameStarted) {
    return <p>Game sudah dimulai...</p>;
  }

  return (
    <div style={{ position: 'relative', paddingRight: 200, color: 'white' }}>
      <h2>Room: {currentRoomData.roomName}</h2>
      <h2>ID: {currentRoomId}</h2>

      {/* Players list fixed top right */}
      <div
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          width: 180,
          backgroundColor: 'rgb(0, 0, 0)',
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: 10,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          zIndex: 1000,
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>Pemain:</h3>
        <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: 0 }}>
          {currentRoomData.players.map((p, i) => (
            <li
              key={i}
              style={{
                padding: '10px 15px',
                marginBottom: 6,
                fontSize: '18px',
                backgroundColor: '#007bff',
                color: 'white',
                borderRadius: 6,
                cursor: 'default',
                userSelect: 'none',
                textAlign: 'center',
                boxShadow: '0 2px 5px rgba(0, 123, 255, 0.4)',
              }}
            >
              {p.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Start Game Button */}
      <StartGameButton
        isHost={isHost}
        playersCount={currentRoomData.players.length}
        onStartGame={onStartGame}
      />

      {/* Keluar Lobby Button di bawah Start Game */}
      <button onClick={onLeaveLobby} style={{ marginTop: 10 }}>
        Keluar Lobby
      </button>

      {/* Chat Section (formerly Chat component) */}
      <div
        style={{
          position: 'fixed',
          bottom: 10,
          left: 10,
          width: 350,
          backgroundColor: '#111',
          padding: 10,
          borderRadius: 8,
          color: 'white',
          zIndex: 10000,
        }}
      >
        <h3>Chat Room</h3>

        {/* Daftar pesan */}
        <div
          style={{
            maxHeight: 200,
            overflowY: 'auto',
            border: '1px solid #444',
            padding: 10,
            marginBottom: 10,
            borderRadius: 6,
            backgroundColor: '#222',
          }}
        >
          {messages.length === 0 ? (
            <p style={{ color: '#aaa' }}>Belum ada pesan...</p>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.sender === playerName;
              return (
                <div
                  key={index}
                  style={{
                    marginBottom: 6,
                    padding: 6,
                    backgroundColor: isMe ? '#005f00' : '#333',
                    borderRadius: 4,
                    color: isMe ? '#bfffaa' : 'white',
                    fontWeight: isMe ? 'bold' : 'normal',
                  }}
                >
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              );
            })
          )}
        </div>

        {/* Input & tombol kirim */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Ketik pesan..."
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 4,
              border: '1px solid #444',
              backgroundColor: '#222',
              color: 'white',
            }}
          />
          <button onClick={onSendMessage} style={{ padding: '8px 16px' }}>
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;