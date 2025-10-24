import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from 'firebase/firestore';

import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import Lobby from './Lobby';
import Game1v1, { generateDeck } from '../gamemultiplayer/Game1vs1';
import MULTIPLAYER_UNO from '../assets/MULTIPLAYER_UNO.png';

function Multiplayer() {
  const [currentView, setCurrentView] = useState('home');
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [currentRoomData, setCurrentRoomData] = useState(null);
  const [playerName, setPlayerName] = useState('');

  const [formCreate, setFormCreate] = useState({
    hostName: '',
    roomName: '',
    password: '',
    maxPlayers: 2,
  });
  const [formJoin, setFormJoin] = useState({
    playerName: '',
    roomId: '',
    password: '',
  });

  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);

  const generateRoomId = () => {
    let id = '';
    const digits = '123456789';
    for (let i = 0; i < 6; i++) id += digits.charAt(Math.floor(Math.random() * digits.length));
    return id;
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    const roomId = generateRoomId();

    const newRoom = {
      id: roomId,
      roomName: formCreate.roomName,
      password: formCreate.password,
      maxPlayers: Number(formCreate.maxPlayers),
      players: [{ name: formCreate.hostName }],
      hostName: formCreate.hostName,
      gameStarted: false,
      createdAt: new Date(),
      messages: [],
      gameData: null,
    };

    try {
      await setDoc(doc(db, 'rooms', roomId), newRoom);
      setCurrentRoomId(roomId);
      setPlayerName(formCreate.hostName);
      setCurrentView('lobby');
    } catch (error) {
      alert('Gagal membuat room: ' + error.message);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    const roomId = formJoin.roomId.toUpperCase();
    const roomRef = doc(db, 'rooms', roomId);

    try {
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        alert('Room ID tidak ditemukan!');
        return;
      }
      const room = roomSnap.data();
      if (room.password !== formJoin.password) {
        alert('Password salah!');
        return;
      }
      if (room.players.length >= room.maxPlayers) {
        alert('Room sudah penuh!');
        return;
      }
      if (room.players.some((p) => p.name === formJoin.playerName)) {
        alert('Nama sudah digunakan di room ini!');
        return;
      }

      await updateDoc(roomRef, {
        players: arrayUnion({ name: formJoin.playerName }),
      });

      setCurrentRoomId(roomId);
      setPlayerName(formJoin.playerName);
      setCurrentView('lobby');
    } catch (error) {
      alert('Gagal join room: ' + error.message);
    }
  };

  useEffect(() => {
    if (!currentRoomId) return;
    const roomRef = doc(db, 'rooms', currentRoomId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentRoomData(data);
        setMessages(data.messages || []);
      } else {
        setCurrentRoomData(null);
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [currentRoomId]);

  const handleStartGame = async () => {
    if (!currentRoomData) return;
    if (currentRoomData.hostName !== playerName) {
      alert('Hanya host yang bisa mulai game!');
      return;
    }
    if (currentRoomData.players.length !== 2) {
      alert('Butuh tepat 2 pemain untuk mulai game!');
      return;
    }

    const deck = generateDeck();
    const playerHands = {};
    const players = currentRoomData.players.map((p) => p.name);
    players.forEach((p) => {
      playerHands[p] = deck.splice(0, 7);
    });
    const pileTop = deck.shift();
    const turn = players[0];

    try {
      const roomRef = doc(db, 'rooms', currentRoomId);
      await updateDoc(roomRef, {
        gameStarted: true,
        'gameData.deck': deck,
        'gameData.playerHands': playerHands,
        'gameData.pileTop': pileTop,
        'gameData.turn': turn,
      });
    } catch (error) {
      alert('Gagal mulai game: ' + error.message);
    }
  };

  const handleLeaveLobby = async () => {
    if (!currentRoomData) return;
    try {
      const roomRef = doc(db, 'rooms', currentRoomId);
      await updateDoc(roomRef, {
        players: currentRoomData.players.filter((p) => p.name !== playerName),
      });
      setCurrentRoomId(null);
      setCurrentRoomData(null);
      setPlayerName('');
      setCurrentView('home');
    } catch (error) {
      alert('Gagal keluar lobby: ' + error.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const roomRef = doc(db, 'rooms', currentRoomId);
      await updateDoc(roomRef, {
        messages: arrayUnion({ name: playerName, text: messageInput }),
      });
      setMessageInput('');
    } catch (error) {
      alert('Gagal kirim pesan: ' + error.message);
    }
  };

  const renderHome = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'radial-gradient(circle at center, #ff1c1c, #000)',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <img
        src={MULTIPLAYER_UNO}
        alt="Multiplayer Uno"
        style={{
          width: '350px',
          marginBottom: '40px',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(255,255,255,0.2)',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '250px',
        }}
      >
        <button
          onClick={() => setCurrentView('create')}
          style={{
            background: 'linear-gradient(90deg, #ffb800, #ff0000)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            padding: '12px',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: '0.3s',
          }}
          onMouseOver={(e) => (e.target.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
        >
          ➕ Buat Room
        </button>

        <button
          onClick={() => setCurrentView('join')}
          style={{
            background: 'linear-gradient(90deg, #00c3ff, #0044ff)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            padding: '12px',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: '0.3s',
          }}
          onMouseOver={(e) => (e.target.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
        >
          🚪 Gabung Room
        </button>
      </div>
    </div>
  );

  const renderLobbyOrGame = () => {
    if (!currentRoomData) return <p style={{ color: 'white' }}>Loading...</p>;
    if (currentRoomData.gameStarted) {
      return (
        <Game1v1
          roomId={currentRoomId}
          playerName={playerName}
          currentRoomData={currentRoomData}
        />
      );
    }
    return (
      <Lobby
        currentRoomData={currentRoomData}
        currentRoomId={currentRoomId}
        playerName={playerName}
        messages={messages}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        onSendMessage={handleSendMessage}
        onStartGame={handleStartGame}
        onLeaveLobby={handleLeaveLobby}
      />
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'black' }}>
      {currentView === 'home' && renderHome()}
      {currentView === 'create' && (
        <CreateRoom
          formCreate={formCreate}
          setFormCreate={setFormCreate}
          onCreateRoom={handleCreateRoom}
          onCancel={() => setCurrentView('home')}
        />
      )}
      {currentView === 'join' && (
        <JoinRoom
          formJoin={formJoin}
          setFormJoin={setFormJoin}
          onJoinRoom={handleJoinRoom}
          onCancel={() => setCurrentView('home')}
        />
      )}
      {currentView === 'lobby' && renderLobbyOrGame()}
    </div>
  );
}

export default Multiplayer;
