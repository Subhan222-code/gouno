import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const generateDeck = () => {
  const colors = ['red', 'green', 'blue', 'yellow'];
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const actionCards = ['skip', 'draw_two', 'reverse'];
  const wildCards = ['wild', 'wild_draw_four'];

  const deck = [];

  for (const color of colors) {
    deck.push({ type: 'number', color, value: 0 });
    for (let num = 1; num <= 9; num++) {
      deck.push({ type: 'number', color, value: num });
      deck.push({ type: 'number', color, value: num });
    }
    for (const action of actionCards) {
      deck.push({ type: 'action', color, value: action });
      deck.push({ type: 'action', color, value: action });
    }
  }

  for (let i = 0; i < 4; i++) {
    deck.push({ type: 'wild', value: 'wild' });
    deck.push({ type: 'wild', value: 'wild_draw_four' });
  }

  return deck.sort(() => Math.random() - 0.5);
};

const Game1v1 = ({ roomId, playerName, currentRoomData }) => {
  const [deck, setDeck] = useState([]);
  const [playerHands, setPlayerHands] = useState({});
  const [pileTop, setPileTop] = useState(null);
  const [turn, setTurn] = useState(null);
  const [gameTimeLeft, setGameTimeLeft] = useState(300);
  const [gameEnded, setGameEnded] = useState(false);
  const [direction, setDirection] = useState(1);
  const [pendingDraw, setPendingDraw] = useState(0);
  const [unoAnnounced, setUnoAnnounced] = useState({});
  const [winner, setWinner] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [cardPlayedByWild, setCardPlayedByWild] = useState(null);

  useEffect(() => {
    if (currentRoomData?.gameData) {
      const { deck, playerHands, pileTop, turn, direction, pendingDraw, unoAnnounced, winner } = currentRoomData.gameData;
      setDeck(deck || []);
      setPlayerHands(playerHands || {});
      setPileTop(pileTop || null);
      setTurn(turn || null);
      setDirection(direction || 1);
      setPendingDraw(pendingDraw || 0);
      setUnoAnnounced(unoAnnounced || {});
      setWinner(winner || null);

      if (winner) {
        setGameEnded(true);
      }
    }
  }, [currentRoomData]);

  useEffect(() => {
    if (gameEnded || winner) return;

    const interval = setInterval(() => {
      setGameTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameEnded, winner]);

  const getOtherPlayer = () => Object.keys(playerHands).find(p => p !== playerName);

  const checkUnoPenalty = async (playerToCheck) => {
    if (!gameEnded && !winner && playerHands[playerToCheck]?.length === 1 && !unoAnnounced[playerToCheck]) {
      const newDeck = [...deck];
      const drawnCards = newDeck.splice(0, 2);

      if (drawnCards.length > 0) {
        const newHand = [...playerHands[playerToCheck], ...drawnCards];
        const newPlayerHands = {
          ...playerHands,
          [playerToCheck]: newHand,
        };

        try {
          const roomRef = doc(db, 'rooms', roomId);
          await updateDoc(roomRef, {
            'gameData.deck': newDeck,
            'gameData.playerHands': newPlayerHands,
          });
          alert(`${playerToCheck} lupa bilang UNO! dan kena penalti +${drawnCards.length} kartu.`);
        } catch (error) {
          console.error('Gagal menerapkan penalti UNO:', error);
        }
      }
    }
  };

  const applyCardEffects = async (card, currentPlayer, otherPlayer, newDeck, newPlayerHands) => {
    let nextTurn = otherPlayer;
    let newPendingDraw = 0;
    let newDirection = direction;
    let newUnoAnnounced = { ...unoAnnounced };
    let finalWinner = null;

    if (newPlayerHands[currentPlayer].length === 0) {
      finalWinner = currentPlayer;
      try {
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
          'gameData.winner': currentPlayer,
        });
      } catch (error) {
        console.error('Gagal menyimpan pemenang ke Firestore:', error);
      }
      setGameEnded(true);
    } else if (newPlayerHands[currentPlayer].length === 1 && !newUnoAnnounced[currentPlayer]) {
    }

    if (card.type === 'action') {
      if (card.value === 'skip') {
        nextTurn = currentPlayer;
      } else if (card.value === 'draw_two') {
        newPendingDraw = pendingDraw + 2;
        nextTurn = otherPlayer;
      } else if (card.value === 'reverse') {
        newDirection = direction * -1;
        nextTurn = currentPlayer;
      }
    } else if (card.type === 'wild') {
      if (card.value === 'wild_draw_four') {
        newPendingDraw = pendingDraw + 4;
        nextTurn = otherPlayer;
      }
      setShowColorPicker(true);
      setCardPlayedByWild(card);
    }

    if (card.type === 'wild' && !finalWinner) {
      try {
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
          'gameData.playerHands': newPlayerHands,
          'gameData.deck': newDeck,
          'gameData.pendingDraw': newPendingDraw,
          'gameData.unoAnnounced': newUnoAnnounced,
        });
      } catch (error) {
        console.error('Gagal update game (awal wild card):', error);
      }
    } else {
      try {
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
          'gameData.playerHands': newPlayerHands,
          'gameData.pileTop': card,
          'gameData.deck': newDeck,
          'gameData.turn': nextTurn,
          'gameData.direction': newDirection,
          'gameData.pendingDraw': newPendingDraw,
          'gameData.unoAnnounced': newUnoAnnounced,
          'gameData.winner': finalWinner,
        });
        checkUnoPenalty(currentPlayer);
      } catch (error) {
        console.error('Gagal update game:', error);
      }
    }
  };

  const playCard = async (cardIndex) => {
    if (gameEnded || winner) {
      alert(winner ? `${winner} telah menang!` : 'Waktu habis! Game telah berakhir.');
      return;
    }

    if (turn !== playerName) {
      alert('Bukan giliran Anda!');
      return;
    }
    if (showColorPicker) {
      alert('Pilih warna untuk kartu Wild Anda terlebih dahulu!');
      return;
    }

    const hand = playerHands[playerName];
    const card = hand[cardIndex];
    if (!card) return;

    const otherPlayer = getOtherPlayer();

    let isValidMove = false;
    if (pileTop) {
      if (card.type === 'wild') {
        isValidMove = true;
      } else if (card.color === pileTop.color || card.value === pileTop.value) {
        isValidMove = true;
      }
    } else {
      if (card.type === 'number' || card.type === 'wild') {
        isValidMove = true;
      } else {
        alert('Tidak bisa memulai dengan kartu aksi!');
        return;
      }
    }

    if (pendingDraw > 0) {
      if (card.type === 'action' && card.value === 'draw_two') {
        isValidMove = true;
      } else if (card.type === 'wild' && card.value === 'wild_draw_four') {
        isValidMove = true;
      } else {
        alert(`Anda harus mengambil ${pendingDraw} kartu atau memainkan kartu +2/+4.`);
        return;
      }
    }

    if (!isValidMove) {
      alert('Kartu tidak cocok!');
      return;
    }

    const newHand = hand.filter((_, i) => i !== cardIndex);
    const newDeck = [...deck];

    const newPlayerHands = {
      ...playerHands,
      [playerName]: newHand,
    };

    await applyCardEffects(card, playerName, otherPlayer, newDeck, newPlayerHands);
  };

  const drawCard = async () => {
    if (gameEnded || winner) {
      alert(winner ? `${winner} telah menang!` : 'Waktu habis! Game telah berakhir.');
      return;
    }
    if (turn !== playerName) {
      alert('Bukan giliran Anda!');
      return;
    }
    if (showColorPicker) {
      alert('Pilih warna untuk kartu Wild Anda terlebih dahulu!');
      return;
    }
    if (deck.length === 0) {
      alert('Deck habis!');
      return;
    }

    let cardsToDraw = 1;
    if (pendingDraw > 0) {
      cardsToDraw = pendingDraw;
    }

    const drawnCards = deck.slice(0, cardsToDraw);
    const newDeck = deck.slice(cardsToDraw);
    const newHand = [...playerHands[playerName], ...drawnCards];
    const otherPlayer = getOtherPlayer();

    const newPlayerHands = {
      ...playerHands,
      [playerName]: newHand,
    };

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        'gameData.deck': newDeck,
        'gameData.playerHands': newPlayerHands,
        'gameData.turn': otherPlayer,
        'gameData.pendingDraw': 0,
      });
      checkUnoPenalty(playerName);
    } catch (error) {
      console.error('Gagal update game:', error);
    }
  };

  const chooseColor = async (chosenColor) => {
    setShowColorPicker(false);

    if (!cardPlayedByWild) return;

    const newPileTop = { ...cardPlayedByWild, color: chosenColor };
    const otherPlayer = getOtherPlayer();

    setCardPlayedByWild(null);

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        'gameData.pileTop': newPileTop,
        'gameData.turn': otherPlayer,
      });
      checkUnoPenalty(playerName);
    } catch (error) {
      console.error('Gagal update warna wild card:', error);
    }
  };

  const announceUno = async () => {
    if (gameEnded || winner) {
      alert(winner ? `${winner} telah menang!` : 'Waktu habis! Game telah berakhir.');
      return;
    }
    if (turn !== playerName) {
      alert('Bukan giliran Anda!');
      return;
    }
    if (playerHands[playerName]?.length !== 1) {
      alert('Anda hanya bisa mengumumkan UNO! saat Anda memiliki 1 kartu.');
      return;
    }
    if (unoAnnounced[playerName]) {
      alert('Anda sudah mengumumkan UNO!');
      return;
    }

    const newUnoAnnounced = { ...unoAnnounced, [playerName]: true };
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        'gameData.unoAnnounced': newUnoAnnounced,
      });
      alert('UNO! diumumkan!');
    } catch (error) {
      console.error('Gagal mengumumkan UNO:', error);
    }
  };

  const gameContainerStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '80vh',
    textAlign: 'center',
    padding: '20px 20px 40px 20px',
    color: 'white',
    backgroundColor: '#000000',
  };

  const turnIndicatorStyle = {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#333',
    color: 'white',
    padding: '5px 10px',
    borderRadius: 5,
    fontWeight: 'bold',
    fontSize: 18,
  };

  const timerStyle = {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#333',
    color: 'white',
    padding: '5px 10px',
    borderRadius: 5,
    fontWeight: 'bold',
    fontSize: 18,
  };

  const winnerMessageStyle = {
    marginTop: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: 'lime',
  };

  const playerHandContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
    maxWidth: 600,
    gap: '5px',
  };

  const buttonBaseStyle = {
    padding: '12px 25px',
    fontSize: 20,
    border: 'none',
    borderRadius: 8,
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    transition: 'background-color 0.2s ease-in-out',
    fontWeight: 'bold',
    color: 'white',
  };

  const drawButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#007bff',
  };

  const unoButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#dc3545',
  };

  const colorPickerContainerStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 30,
    borderRadius: 15,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    boxShadow: '0 0 20px rgba(255,255,255,0.5)',
  };

  const colorCircleBaseStyle = {
    width: 60,
    height: 60,
    borderRadius: '50%',
    cursor: 'pointer',
    border: '3px solid white',
    transition: 'transform 0.2s ease-in-out',
  };

  const renderCard = (card, index) => {
    const isClickable = turn === playerName && !gameEnded && !winner && !showColorPicker;

    const cardStyle = {
      width: 60,
      height: 90,
      borderRadius: 8,
      margin: '0 2px',
      backgroundColor: card.type === 'wild' ? '#333' : card.color,
      border: '2px solid #333',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      userSelect: 'none',
      cursor: isClickable ? 'pointer' : 'not-allowed',
      fontSize: 14,
      transition: 'transform 0.1s ease-in-out',
      boxShadow: isClickable ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
    };

    return (
      <div
        key={index}
        onClick={() => isClickable && playCard(index)}
        style={cardStyle}
      >
        {card.type === 'number' && card.value}
        {card.type === 'action' && (
          <span style={{ fontSize: 16 }}>
            {card.value === 'skip' && '🚫'}
            {card.value === 'draw_two' && '+2'}
            {card.value === 'reverse' && '🔃'}
          </span>
        )}
        {card.type === 'wild' && (
          <span style={{ fontSize: 16 }}>
            {card.value === 'wild' && '🌈'}
            {card.value === 'wild_draw_four' && '+4'}
          </span>
        )}
        {card.color && card.type !== 'wild' && <div style={{ fontSize: 10, marginTop: 2 }}>{card.color.toUpperCase()}</div>}
        {card.type === 'wild' && card.color && pileTop?.color === card.color && (
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: card.color,
            marginTop: 5,
            border: '1px solid white'
          }}></div>
        )}
      </div>
    );
  };

  const renderCardBack = (index) => (
    <div
      key={index}
      style={{
        width: 60,
        height: 90,
        borderRadius: 8,
        margin: '0 2px',
        backgroundColor: 'gray',
        border: '2px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        userSelect: 'none',
        fontSize: 18,
      }}
    >
      ?
    </div>
  );

  const opponent = currentRoomData.players.find(p => p.name !== playerName)?.name;
  const opponentHand = playerHands[opponent] || [];
  const hand = playerHands[playerName] || [];

  return (
    <div style={gameContainerStyle}>
      <div style={turnIndicatorStyle}>
        Giliran: {turn === playerName ? 'Anda' : turn}
      </div>

      <div style={timerStyle}>
        Waktu: {Math.floor(gameTimeLeft / 60)}:{String(gameTimeLeft % 60).padStart(2, '0')}
      </div>

      {winner && (
        <div style={winnerMessageStyle}>
          🎉{winner} MENANG!🎉
        </div>
      )}

      <h3 style={{ fontSize: 24, marginBottom: 10 }}>Kartu Lawan: {opponent} ({opponentHand.length} kartu)</h3>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        {opponentHand.map((_, i) => renderCardBack(i))}
      </div>

      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <h3 style={{ fontSize: 24, marginBottom: 10 }}>Kartu Tumpukan:</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {pileTop ? renderCard(pileTop, -1) : renderCardBack(-1)}
        </div>
      </div>

      <h3 style={{ fontSize: 24, marginBottom: 10 }}>Kartu Anda: ({hand.length} kartu)</h3>
      <div style={playerHandContainerStyle}>
        {hand.map((card, i) => renderCard(card, i))}
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 30 }}>
        <button
          onClick={drawCard}
          disabled={turn !== playerName || deck.length === 0 || gameEnded || winner || showColorPicker}
          style={{
            ...drawButtonStyle,
            cursor: (turn === playerName && deck.length > 0 && !gameEnded && !winner && !showColorPicker) ? 'pointer' : 'not-allowed',
            opacity: (gameEnded || winner || showColorPicker) ? 0.6 : 1,
          }}
        >
          Draw {pendingDraw > 0 ? `(${pendingDraw})` : ''}
        </button>

        <button
          onClick={announceUno}
          disabled={hand.length !== 1 || unoAnnounced[playerName] || turn !== playerName || gameEnded || winner || showColorPicker}
          style={{
            ...unoButtonStyle,
            cursor: (hand.length === 1 && turn === playerName && !unoAnnounced[playerName] && !gameEnded && !winner && !showColorPicker) ? 'pointer' : 'not-allowed',
            opacity: (gameEnded || winner || showColorPicker) ? 0.6 : 1,
          }}
        >
          UNO!
        </button>
      </div>

      {showColorPicker && (
        <div style={colorPickerContainerStyle}>
          <h4 style={{ fontSize: 26, color: 'white', margin: 0 }}>Pilih Warna Baru:</h4>
          <div style={{ display: 'flex', gap: 15 }}>
            {['red', 'green', 'blue', 'yellow'].map(color => (
              <div
                key={color}
                onClick={() => chooseColor(color)}
                style={{
                  ...colorCircleBaseStyle,
                  backgroundColor: color,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {gameEnded && !winner && (
        <div style={{ marginTop: 30, fontSize: 28, fontWeight: 'bold', color: '#ffc107' }}>
          ⏰ Waktu Habis! Game Berakhir.
        </div>
      )}
    </div>
  );
};

export { generateDeck };
export default Game1v1;