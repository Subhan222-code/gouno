import React, { useEffect, useRef } from 'react';
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
  // ✅ Hook harus di paling atas, tidak boleh di bawah return atau if
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Jika data belum ada
  if (!currentRoomData) {
    return <p style={{ color: 'white' }}>Loading...</p>;
  }

  const isHost = currentRoomData.hostName === playerName;

  if (currentRoomData.gameStarted) {
    return <p style={{ color: 'white' }}>Game sudah dimulai...</p>;
  }

  return (
    <div
      style={{
        color: 'white',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #111, #222, #000)',
        padding: '20px',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      {/* Header Room */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '30px',
          animation: 'fadeIn 1s ease-in-out',
        }}
      >
        <h1 style={{ fontSize: '2rem', color: '#ffcc00', marginBottom: '10px' }}>
          🎮 {currentRoomData.roomName}
        </h1>
        <p style={{ color: '#ccc', fontSize: '1.1rem' }}>
          Room ID: <strong>{currentRoomId}</strong>
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '40px',
          flexWrap: 'wrap',
        }}
      >
        {/* Daftar Pemain */}
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '20px',
            borderRadius: '15px',
            width: '250px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <h3
            style={{
              textAlign: 'center',
              marginBottom: '15px',
              color: '#00d4ff',
            }}
          >
            👥 Pemain
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {currentRoomData.players.map((p, i) => (
              <li
                key={i}
                style={{
                  padding: '10px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  background:
                    p.name === currentRoomData.hostName
                      ? 'linear-gradient(90deg, #ff5f00, #ff9500)'
                      : 'linear-gradient(90deg, #007bff, #00d4ff)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {p.name} {p.name === currentRoomData.hostName && '⭐'}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Room */}
        <div
          style={{
            flex: 1,
            maxWidth: '400px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: '10px',
              color: '#ffcc00',
              textAlign: 'center',
            }}
          >
            💬 Chat Room
          </h3>

          <div
            style={{
              maxHeight: '250px',
              overflowY: 'auto',
              border: '1px solid #333',
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: '#111',
              marginBottom: '10px',
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: '#777', textAlign: 'center' }}>
                Belum ada pesan...
              </p>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.name === playerName;
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: isMe ? '#00aa00' : '#333',
                        color: isMe ? '#eaffea' : '#fff',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        maxWidth: '80%',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      }}
                    >
                      {!isMe && (
                        <strong
                          style={{
                            color: '#ffb700',
                            fontSize: '0.9rem',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {msg.name}
                        </strong>
                      )}
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Ketik pesan..."
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid #333',
                backgroundColor: '#222',
                color: 'white',
              }}
            />
            <button
              onClick={onSendMessage}
              style={{
                padding: '10px 18px',
                background: 'linear-gradient(90deg, #0096ff, #00d4ff)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1.0)')}
            >
              Kirim
            </button>
          </div>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
        }}
      >
        <StartGameButton
          isHost={isHost}
          playersCount={currentRoomData.players.length}
          onStartGame={onStartGame}
        />

        <button
          onClick={onLeaveLobby}
          style={{
            padding: '12px 30px',
            borderRadius: '25px',
            border: 'none',
            background: 'linear-gradient(90deg, #ff3c3c, #ff7b00)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1.0)')}
        >
          Keluar Lobby
        </button>
      </div>
    </div>
  );
};

export default Lobby;
