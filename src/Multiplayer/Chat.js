import React from 'react';

const Chat = ({ messages, messageInput, setMessageInput, onSendMessage, playerName }) => {
  return (
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
                <strong>{msg.sender} nama pemain yang chat</strong> {msg.text}
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
  );
};

export default Chat;
