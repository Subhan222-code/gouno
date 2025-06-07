import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const generateDeck = () => {
  const colors = ['red', 'green', 'blue', 'yellow'];
  const deck = [];
  for (const color of colors) {
    for (let num = 0; num <= 9; num++) {
      deck.push({ color, number: num });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const Game1v1 = ({ roomId, playerName, currentRoomData }) => {
  const [deck, setDeck] = useState([]);
  const [playerHands, setPlayerHands] = useState({});
  const [pileTop, setPileTop] = useState(null);
  const [turn, setTurn] = useState(null);

  useEffect(() => {
    if (currentRoomData?.gameData) {
      const { deck, playerHands, pileTop, turn } = currentRoomData.gameData;
      setDeck(deck);
      setPlayerHands(playerHands);
      setPileTop(pileTop);
      setTurn(turn);
    }
  }, [currentRoomData]);

  const playCard = async (cardIndex) => {
    if (turn !== playerName) {
      alert('Bukan giliran Anda!');
      return;
    }

    const hand = playerHands[playerName];
    const card = hand[cardIndex];
    if (!card) return;

    if (card.color !== pileTop.color && card.number !== pileTop.number) {
      alert('Kartu tidak cocok!');
      return;
    }

    const newHand = hand.filter((_, i) => i !== cardIndex);
    const newPileTop = card;
    const otherPlayer = Object.keys(playerHands).find(p => p !== playerName);

    const deckCopy = [...deck];
    let newDeck = deckCopy;
    if (deckCopy.length > 0) {
      const drawnCard = deckCopy.shift();
      newHand.push(drawnCard);
      newDeck = deckCopy;
    }

    const newPlayerHands = {
      ...playerHands,
      [playerName]: newHand,
    };

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        'gameData.playerHands': newPlayerHands,
        'gameData.pileTop': newPileTop,
        'gameData.deck': newDeck,
        'gameData.turn': otherPlayer,
      });
    } catch (error) {
      console.error('Gagal update game:', error);
    }
  };

  const drawCard = async () => {
    if (turn !== playerName) {
      alert('Bukan giliran Anda!');
      return;
    }
    if (deck.length === 0) {
      alert('Deck habis!');
      return;
    }
    const cardDrawn = deck[0];
    const newDeck = deck.slice(1);
    const newHand = [...playerHands[playerName], cardDrawn];
    const otherPlayer = Object.keys(playerHands).find(p => p !== playerName);

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
      });
    } catch (error) {
      console.error('Gagal update game:', error);
    }
  };

  const renderCard = (card, index) => (
    <div
      key={index}
      onClick={() => turn === playerName && playCard(index)}
      style={{
        width: 60,
        height: 90,
        borderRadius: 8,
        margin: '0 1px',
        backgroundColor: card.color,
        border: '2px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        userSelect: 'none',
        cursor: turn === playerName ? 'pointer' : 'not-allowed',
        fontSize: 18,
      }}
    >
      {card.number}
    </div>
  );

  const renderCardBack = (index) => (
    <div
      key={index}
      style={{
        width: 60,
        height: 90,
        borderRadius: 8,
        margin: '0 1px',
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

  const hand = playerHands[playerName] || [];
  const opponent = currentRoomData.players.find(p => p.name !== playerName)?.name;
  const opponentHand = playerHands[opponent] || [];

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '80vh',
        textAlign: 'center',
        padding: '20px 20px 40px 20px',
        color: 'white',
      }}
    >
      {/* Giliran di pojok kiri atas */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: '#333',
          color: 'white',
          padding: '5px 10px',
          borderRadius: 5,
          fontWeight: 'bold',
          fontSize: 18,
        }}
      >
        Giliran: {turn}
      </div>

      {/* Kartu lawan */}
      <h3 style={{ fontSize: 24 }}>Kartu Lawan: {opponent}</h3>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        {opponentHand.map((_, i) => renderCardBack(i))}
      </div>

      {/* Kartu atas */}
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <h3 style={{ fontSize: 24 }}></h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {pileTop ? renderCard(pileTop, -1) : renderCardBack(-1)}
        </div>
      </div>

      {/* Kartu pemain */}
      <h3 style={{ fontSize: 24 }}>Kartu Anda:</h3>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 600,
        }}
      >
        {hand.map((card, i) => renderCard(card, i))}
      </div>

      {/* Tombol draw */}
      <button
        onClick={drawCard}
        disabled={turn !== playerName || deck.length === 0}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          fontSize: 18,
          cursor: turn === playerName && deck.length > 0 ? 'pointer' : 'not-allowed',
          color: 'white',
          backgroundColor: '#444',
          border: 'none',
          borderRadius: 5,
        }}
      >
        Draw
      </button>
    </div>
  );
};

export { generateDeck };
export default Game1v1;
