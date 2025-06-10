import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const turnOrderInitial = [0, 3, 1, 2];

function Game1v3() {
  const location = useLocation();
  const { username } = location.state || { username: 'Player' };

  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [botHands, setBotHands] = useState([[], [], []]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [turnOrder, setTurnOrder] = useState([...turnOrderInitial]);
  const [winner, setWinner] = useState(null);
  const [animatingCard, setAnimatingCard] = useState(null);
  const [pendingCard, setPendingCard] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorCallback, setSelectedColorCallback] = useState(null);
  const [skipNext, setSkipNext] = useState(false);
  const [scores, setScores] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  // New state for dealing animation
  const [dealtCards, setDealtCards] = useState([]);

  const turn = turnOrder[turnIndex];
  const topCard = discardPile[discardPile.length - 1];

  useEffect(() => {
    setGameStarted(false);
    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setGameStarted(true);
          startGame(); // Initialize game assets and start dealing animation
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  useEffect(() => {
    if (gameStarted && turn !== 0 && !winner) {
      setTimeout(() => botPlay(turn), 1000);
    }
  }, [turn, gameStarted, winner]); // Added winner to dependency array

  function startGame() {
    const newDeck = generateShuffledDeck();
    const initialPlayerHand = [];
    const initialplayer1Hand = [];
    const initialplayer2Hand = [];
    const initialplayer3Hand = [];
    const cardsToDeal = [];

    // Extract initial cards for dealing animation (7 cards each)
    for (let i = 0; i < 7; i++) {
      initialPlayerHand.push(newDeck.pop());
      initialplayer1Hand.push(newDeck.pop());
      initialplayer2Hand.push(newDeck.pop());
      initialplayer3Hand.push(newDeck.pop());
    }
    const initialTopCard = newDeck.pop();

    setDeck(newDeck);
    setDiscardPile([]); // Start empty for animation
    setPlayerHand([]);
    setBotHands([[], [], []]); // Start empty for animation
    setTurnIndex(0);
    setTurnOrder([...turnOrderInitial]);
    setWinner(null);
    setPendingCard(null);
    setShowColorPicker(false);
    setSkipNext(false);
    setScores(null);

    // Prepare cards for animation, alternating between players (Player, Player 3, Player 1, Player 2)
    const dealingSequence = [];
    for (let i = 0; i < 7; i++) {
      dealingSequence.push({ card: initialPlayerHand[i], target: 'player' });
      dealingSequence.push({ card: initialplayer3Hand[i], target: 'player3' });
      dealingSequence.push({ card: initialplayer1Hand[i], target: 'player1' });
      dealingSequence.push({ card: initialplayer2Hand[i], target: 'player2' });
    }
    dealingSequence.push({ card: initialTopCard, target: 'discard' });

    setDealtCards(dealingSequence); // Set cards to be animated

    // Start sequential dealing animation
    let playerTempHand = [];
    let player1TempHand = [];
    let player2TempHand = [];
    let player3TempHand = [];
    let currentDiscardPile = [];
    let delay = 0;
    // Increased delay between each card deal for slow-motion
    const cardAnimationDelay = 250;

    dealingSequence.forEach((item) => {
      setTimeout(() => {
        setDealtCards((prev) => prev.slice(1)); // Remove the first card from animating array
        if (item.target === 'player') {
          playerTempHand.push(item.card);
          setPlayerHand([...playerTempHand]);
        } else if (item.target === 'player1') {
          player1TempHand.push(item.card);
          setBotHands((prev) => [player1TempHand, prev[1], prev[2]]);
        } else if (item.target === 'player2') {
          player2TempHand.push(item.card);
          setBotHands((prev) => [prev[0], player2TempHand, prev[2]]);
        } else if (item.target === 'player3') {
          player3TempHand.push(item.card);
          setBotHands((prev) => [prev[0], prev[1], player3TempHand]);
        } else if (item.target === 'discard') {
          currentDiscardPile.push(item.card);
          setDiscardPile([...currentDiscardPile]);
        }
      }, delay);
      delay += cardAnimationDelay;
    });
  }

  function generateShuffledDeck() {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', '+2'];
    const deck = [];

    for (let color of colors) {
      for (let value of values) {
        deck.push({ color, value });
        if (value !== '0') deck.push({ color, value });
      }
    }

    for (let i = 0; i < 4; i++) {
      deck.push({ color: 'black', value: 'wild' });
      deck.push({ color: 'black', value: '+4' });
    }

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }

  function isPlayable(card, topCard) {
    if (!topCard) return true; // Allow playing any card if discard pile is empty (e.g., first card)
    return (
      card.color === topCard.color ||
      card.value === topCard.value ||
      card.color === 'black'
    );
  }

  function playCard(card, index) {
    if (turn !== 0 || winner || !gameStarted) return;
    if (!isPlayable(card, topCard)) return;

    if (card.color === 'black') {
      setPendingCard({ card, index });
      setShowColorPicker(true);
      setSelectedColorCallback(() => (color) => {
        card.color = color;
        finalizePlayCard(card, index);
        setShowColorPicker(false);
        setPendingCard(null);
      });
    } else {
      finalizePlayCard(card, index);
    }
  }

  function finalizePlayCard(card, index) {
    const newHand = [...playerHand];
    newHand.splice(index, 1);
    setPlayerHand(newHand);
    setAnimatingCard(card);

    setTimeout(() => {
      setDiscardPile((prev) => [...prev, card]);
      setAnimatingCard(null);
      const shouldSkip = handleSpecialCard(card);
      checkWinner(newHand, username);
      setTurnIndex((prev) => (prev + (shouldSkip ? 2 : 1)) % turnOrder.length);
    }, 500);
  }

  function drawCardPlayer() {
    if (turn !== 0 || winner || deck.length === 0 || !gameStarted) return;
    const newCard = deck.pop();
    setPlayerHand([...playerHand, newCard]);
    setDeck([...deck]);
    setTurnIndex((prev) => (prev + 1) % turnOrder.length);
  }

  function botPlay(botPlayerId) {
    if (!gameStarted) return;

    let botIndex;
    let botName;
    if (botPlayerId === 1) { // Player 1 (index 0 in botHands array)
      botIndex = 0;
      botName = "Player 1";
    } else if (botPlayerId === 2) { // Player 2 (index 1 in botHands array)
      botIndex = 1;
      botName = "Player 2";
    } else if (botPlayerId === 3) { // Player 3 (index 2 in botHands array)
      botIndex = 2;
      botName = "Player 3";
    } else {
      return; // Invalid bot ID
    }

    const botHand = [...botHands[botIndex]];
    const topCard = discardPile[discardPile.length - 1];
    const playableIndex = botHand.findIndex((card) => isPlayable(card, topCard));

    if (playableIndex !== -1) {
      const playedCard = botHand.splice(playableIndex, 1)[0];
      if (playedCard.color === 'black') {
        // Bot chooses a random color
        playedCard.color = ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)];
      }

      setBotHands((prev) => {
        const updated = [...prev];
        updated[botIndex] = botHand;
        return updated;
      });
      setAnimatingCard(playedCard);
      setTimeout(() => {
        setDiscardPile((prev) => [...prev, playedCard]);
        setAnimatingCard(null);
        const shouldSkip = handleSpecialCard(playedCard);
        checkWinner(botHand, botName);
        setTurnIndex((prev) => (prev + (shouldSkip ? 2 : 1)) % turnOrder.length);
      }, 500);
    } else if (deck.length > 0) {
      botHand.push(deck.pop());
      setBotHands((prev) => {
        const updated = [...prev];
        updated[botIndex] = botHand;
        return updated;
      });
      setDeck([...deck]);
      setTurnIndex((prev) => (prev + 1) % turnOrder.length);
    } else {
      // If no playable card and deck is empty, just pass the turn
      setTurnIndex((prev) => (prev + 1) % turnOrder.length);
    }
  }

  function handleSpecialCard(card) {
    const nextIndex = (turnIndex + 1) % turnOrder.length;
    const nextPlayer = turnOrder[nextIndex]; // This is the ID (0 for player, 1,2,3 for bots)

    if (card.value === '+2') {
      const newCards = [deck.pop(), deck.pop()];
      giveCardsToPlayer(nextPlayer, newCards);
      return true; // Skip next player
    } else if (card.value === '+4') {
      const newCards = [deck.pop(), deck.pop(), deck.pop(), deck.pop()];
      giveCardsToPlayer(nextPlayer, newCards);
      return true; // Skip next player
    } else if (card.value === 'skip') {
      return true; // Skip next player
    }
    // No 'reverse' card handling for 1v3 as it doesn't make sense with a fixed turn order.
    // If you add it, you'd need to adjust turnOrder or turnIndex logic.

    return false;
  }

  function giveCardsToPlayer(playerId, cards) {
    if (playerId === 0) { // Player
      setPlayerHand((prev) => [...prev, ...cards]);
    } else { // Bots
      // Map bot ID (1,2,3) to botHands array index (0,1,2)
      const botIdx = playerId === 1 ? 0 : (playerId === 2 ? 1 : 2);
      setBotHands((prev) => {
        const updated = [...prev];
        updated[botIdx] = [...updated[botIdx], ...cards];
        return updated;
      });
    }
  }

  function checkWinner(hand, name) {
    if (hand.length === 0) {
      setWinner(name);
      calculateScores(name);
    }
  }

  function cardValue(card) {
    if (card.value === 'skip' || card.value === 'reverse') return 20;
    if (card.value === '+2') return 20;
    if (card.value === '+4') return 50;
    if (card.value === 'wild') return 50;
    if (!isNaN(parseInt(card.value))) return parseInt(card.value);
    return 0; // Untuk kartu yang tidak dikenal atau error
  }

  // --- LOGIKA PERHITUNGAN SKOR BARU ---
  function calculateScores(winnerName) {
    let playerTotalPoints = 0;
    let player1TotalPoints = 0;
    let player2TotalPoints = 0;
    let player3TotalPoints = 0;

    // Hitung poin dari tangan pemain yang kalah
    if (winnerName !== username) {
      playerTotalPoints = playerHand.reduce((sum, card) => sum + cardValue(card), 0);
    }
    if (winnerName !== 'Player 1') {
      player1TotalPoints = botHands[0].reduce((sum, card) => sum + cardValue(card), 0);
    }
    if (winnerName !== 'Player 2') {
      player2TotalPoints = botHands[1].reduce((sum, card) => sum + cardValue(card), 0);
    }
    if (winnerName !== 'Player 3') {
      player3TotalPoints = botHands[2].reduce((sum, card) => sum + cardValue(card), 0);
    }

    // Tetapkan skor berdasarkan siapa pemenangnya
    let finalPlayerScore = 0;
    let finalplayer1Score = 0;
    let finalplayer2Score = 0;
    let finalplayer3Score = 0;

    if (winnerName === username) {
      finalPlayerScore = player1TotalPoints + player2TotalPoints + player3TotalPoints;
    } else if (winnerName === 'Player 1') {
      finalplayer1Score = playerTotalPoints + player2TotalPoints + player3TotalPoints;
    } else if (winnerName === 'Player 2') {
      finalplayer2Score = playerTotalPoints + player1TotalPoints + player3TotalPoints;
    } else if (winnerName === 'Player 3') {
      finalplayer3Score = playerTotalPoints + player1TotalPoints + player2TotalPoints;
    }

    setScores({
      winner: winnerName,
      player: finalPlayerScore,
      player1: finalplayer1Score,
      player2: finalplayer2Score,
      player3: finalplayer3Score,
    });
  }
  // --- AKHIR LOGIKA PERHITUNGAN SKOR BARU ---

  return (
    <div style={styles.container}>
      {/* Countdown overlay */}
      {!gameStarted && (
        <div style={styles.countdownOverlay}>
          <p style={styles.countdownText}>{countdown}</p>
        </div>
      )}

      {winner && (
        <div style={styles.winnerBanner}>
          🎉 {winner} menang!
          <button onClick={startGame} style={{ marginLeft: 15, padding: '8px 15px', borderRadius: 5, border: 'none', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' }}>
            Main Lagi
          </button>
          {scores && (
            <div style={{ marginTop: 10, fontSize: 16, textAlign: 'left' }}>
              <p>Skor akhir ronde:</p>
              <ul>
                <li>{username}: {scores.player}</li>
                <li>Player 1: {scores.player1}</li>
                <li>Player 2: {scores.player2}</li>
                <li>Player 3: {scores.player3}</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {showColorPicker && (
        <div style={styles.colorPicker}>
          <p>Pilih warna:</p>
          {['red', 'blue', 'green', 'yellow'].map((color) => (
            <button
              key={color}
              style={{ ...styles.colorButton, backgroundColor: color }}
              onClick={() => selectedColorCallback && selectedColorCallback(color)}
            />
          ))}
        </div>
      )}

      {/* Bot Hand 1 (Top) */}
      <div style={{ ...styles.botHandContainer, top: 20, left: '50%', transform: 'translateX(-50%)', position: 'absolute' }}>
        <div style={styles.cardRow}>
          {botHands[0].map((_, i) => (
            <div key={`player1-${i}`} style={{ ...styles.playerCard, backgroundColor: 'gray' }}></div>
          ))}
        </div>
      </div>

      {/* Bot Hand 2 (Right) */}
      <div style={{ ...styles.botHandContainer, right: 20, top: '50%', transform: 'translateY(-50%)', position: 'absolute' }}>
        <div style={styles.cardRowVertical}>
          {botHands[1].map((_, i) => (
            <div key={`player2-${i}`} style={{ ...styles.playerCard, backgroundColor: 'gray', ...styles.rotatedCardRight }}></div>
          ))}
        </div>
      </div>

      {/* Bot Hand 3 (Left) */}
      <div style={{ ...styles.botHandContainer, left: 20, top: '50%', transform: 'translateY(-50%)', position: 'absolute' }}>
        <div style={styles.cardRowVertical}>
          {botHands[2].map((_, i) => (
            <div key={`player3-${i}`} style={{ ...styles.playerCard, backgroundColor: 'gray', ...styles.rotatedCardLeft }}></div>
          ))}
        </div>
      </div>

      <div style={styles.centerArea}>
        {/* Animated dealing cards */}
        <AnimatePresence>
          {dealtCards.map((item, index) => (
            <motion.div
              key={`dealt-${index}`} // Unique key for each animating card
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 0.8,
                rotate: Math.random() * 20 - 10, // Slight random rotation for visual appeal
              }}
              animate={{
                // Target position based on who receives the card
                x: item.target === 'player' ? 0 :
                  item.target === 'player1' ? 0 : // Player 1 (top) will move vertically
                  item.target === 'player2' ? 180 : // Player 2 (right) will move horizontally to the right
                  item.target === 'player3' ? -180 : // Player 3 (left) will move horizontally to the left
                  0, // For discard pile
                y: item.target === 'player' ? 200 :
                  item.target === 'player1' ? -200 : // Player 1 (top) will move vertically upwards
                  item.target === 'player2' ? 0 : // Player 2 (right) stays at similar y-level
                  item.target === 'player3' ? 0 : // Plauer 3 (left) stays at similar y-level
                  0, // For discard pile
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              exit={{ opacity: 0, scale: 0 }} // Cards disappear after reaching destination
              // Increased transition duration for slower individual card movement
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                ...styles.discardPile, // Use discardPile styles for general card appearance
                position: 'absolute',
                // For dealt cards, set background to gray to represent back of card unless it's the discard pile card
                backgroundColor: item.target === 'discard' ? item.card.color : 'gray',
                zIndex: 100 - index, // Stack cards correctly during animation
              }}
            >
              {/* Only show value for the initial discard card */}
              {item.target === 'discard' ? item.card.value : ''}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Card Animation (played card flying to discard pile) */}
        <AnimatePresence>
          {animatingCard && (
            <motion.div
              key="animating"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                ...styles.discardPile,
                backgroundColor: animatingCard.color,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 'auto',
                zIndex: 10,
              }}
            >
              {animatingCard.value}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discard Pile (Top Card) */}
        <div
          style={{
            ...styles.discardPile,
            backgroundColor: topCard?.color,
            position: 'relative',
            zIndex: 5,
          }}
        >
          {topCard?.value}
        </div>

        {/* Draw Card Button */}
        <button
          onClick={drawCardPlayer}
          disabled={turn !== 0 || winner || deck.length === 0 || !gameStarted}
          style={styles.drawButton}
        >
          Ambil Kartu
        </button>
      </div>

      {/* Player's Hand */}
      <div style={styles.playerHand}>
        {playerHand.map((card, i) => (
          <div
            key={i}
            onClick={() => playCard(card, i)}
            style={{
              ...styles.playerCard,
              backgroundColor: card.color,
              cursor: winner || turn !== 0 || !isPlayable(card, topCard) || !gameStarted ? 'default' : 'pointer',
              opacity: isPlayable(card, topCard) && gameStarted ? 1 : 0.5,
            }}
          >
            {card.value}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0b4a0b',
    overflow: 'hidden',
  },
  playerHand: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 8,
  },
  playerCard: {
    width: 60,
    height: 90,
    borderRadius: 8,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
  },
  botHandContainer: {
    display: 'flex',
  },
  cardRow: {
    display: 'flex',
    gap: 6,
  },
  cardRowVertical: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  rotatedCardRight: {
    transform: 'rotate(-90deg)',
    marginTop: '-30px',
  },
  rotatedCardLeft: {
    transform: 'rotate(90deg)',
    marginTop: '-30px',
  },
  centerArea: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 140,
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardPile: {
    width: 80,
    height: 120,
    borderRadius: 10,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  },
  drawButton: {
    marginTop: 12,
    padding: '6px 12px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: ' #999999',
    color: 'white',
    cursor: 'pointer',
  },
  winnerBanner: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 10,
    zIndex: 20,
    textAlign: 'center',
  },
  colorPicker: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    zIndex: 30,
  },
  colorButton: {
    width: 40,
    height: 40,
    margin: 4,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
  },
  // --- New styles for Countdown ---
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark semi-transparent overlay
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, // Make sure it's on top of everything else
  },
  countdownText: {
    fontSize: 72, // Large font size for visibility
    fontWeight: 'bold',
    color: 'white',
  },
};

export default Game1v3;