import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import kembali from '../assets/kembali.png';
import { useLocation } from 'react-router-dom';

const turnOrderInitial = [0, 1];

function Game1v1() {
  const location = useLocation();
  const { username } = location.state || { username: 'Player' };

  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [botHand, setBotHand] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [turnOrder, setTurnOrder] = useState([...turnOrderInitial]);
  const [winner, setWinner] = useState(null);
  const [animatingCard, setAnimatingCard] = useState(null);
  const [pendingCard, setPendingCard] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorCallback, setSelectedColorCallback] = useState(null);
  const [scores, setScores] = useState(null);
  const [pendingDraw, setPendingDraw] = useState({ count: 0, type: null });
  const [unoCalled, setUnoCalled] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [dealtCards, setDealtCards] = useState([]); // State for dealing animation

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
      setTimeout(() => botPlay(), 1000);
    }
  }, [turn, gameStarted, winner]);

  function handleBack() {
    window.history.back();
  }

  function startGame() {
    const newDeck = generateShuffledDeck();
    const initialPlayerHand = [];
    const initialBotHand = [];
    const cardsToDeal = [];

    // Extract initial cards for dealing animation
    for (let i = 0; i < 7; i++) {
      initialPlayerHand.push(newDeck.pop());
      initialBotHand.push(newDeck.pop());
    }
    const initialTopCard = newDeck.pop();

    setDeck(newDeck);
    setDiscardPile([]); // Start empty for animation
    setPlayerHand([]);
    setBotHand([]);
    setTurnIndex(0);
    setTurnOrder([...turnOrderInitial]);
    setWinner(null);
    setPendingCard(null);
    setShowColorPicker(false);
    setScores(null);
    setPendingDraw({ count: 0, type: null });
    setUnoCalled(false);

    // Prepare cards for animation, alternating between player and bot
    for (let i = 0; i < 7; i++) {
      cardsToDeal.push({ card: initialPlayerHand[i], target: 'player' });
      cardsToDeal.push({ card: initialBotHand[i], target: 'bot' });
    }
    cardsToDeal.push({ card: initialTopCard, target: 'discard' });

    setDealtCards(cardsToDeal); // Set cards to be animated

    // Start sequential dealing animation
    let playerTempHand = [];
    let botTempHand = [];
    let currentDiscardPile = [];
    let delay = 0;
    // Increased delay between each card deal for slow-motion
    const cardAnimationDelay = 250;

    cardsToDeal.forEach((item) => {
      setTimeout(() => {
        setDealtCards((prev) => prev.slice(1)); // Remove the first card in dealtCards array (optimistic update for visual effect)
        if (item.target === 'player') {
          playerTempHand.push(item.card);
          setPlayerHand([...playerTempHand]);
        } else if (item.target === 'bot') {
          botTempHand.push(item.card);
          setBotHand([...botTempHand]);
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
    if (card.value === pendingDraw.type) return true;
    return (
      card.color === topCard.color ||
      card.value === topCard.value ||
      card.color === 'black'
    );
  }

  function playCard(card, index) {
    if (turn !== 0 || winner || !gameStarted) return;
    if (!isPlayable(card, topCard)) return;
    if (pendingDraw.count && card.value !== pendingDraw.type) return;

    if (playerHand.length === 2 && !unoCalled) {
      applyPenalty(username);
    }

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

    setUnoCalled(false);

    const isStackable = card.value === '+2' || card.value === '+4';
    const stackMatch = pendingDraw.type === card.value;

    setTimeout(() => {
      setDiscardPile((prev) => [...prev, card]);
      setAnimatingCard(null);

      if (isStackable) {
        if (pendingDraw.count && stackMatch) {
          setPendingDraw((prev) => ({
            count: prev.count + (card.value === '+2' ? 2 : 4),
            type: card.value,
          }));
        } else {
          setPendingDraw({ count: card.value === '+2' ? 2 : 4, type: card.value });
        }
      } else {
        setPendingDraw({ count: 0, type: null });
      }

      checkWinner(newHand, username);
      setTurnIndex((prev) => (prev + 1) % turnOrder.length);
    }, 500);
  }

  function drawCardPlayer() {
    if (turn !== 0 || winner || deck.length === 0 || !gameStarted) return;

    if (pendingDraw.count) {
      const newCards = [];
      for (let i = 0; i < pendingDraw.count; i++) {
        if (deck.length > 0) newCards.push(deck.pop());
      }
      setPlayerHand((prev) => [...prev, ...newCards]);
      setDeck([...deck]);
      setPendingDraw({ count: 0, type: null });
      setTurnIndex((prev) => (prev + 1) % turnOrder.length);
      return;
    }

    const newCard = deck.pop();
    setPlayerHand([...playerHand, newCard]);
    setDeck([...deck]);
    setTurnIndex((prev) => (prev + 1) % turnOrder.length);
  }

  function botPlay() {
    if (!gameStarted) return;

    let hand = [...botHand];
    const playableIndex = hand.findIndex(
      (card) =>
        isPlayable(card, topCard) &&
        (!pendingDraw.count || card.value === pendingDraw.type)
    );

    if (playableIndex !== -1) {
      const playedCard = hand.splice(playableIndex, 1)[0];
      if (playedCard.color === 'black') {
        playedCard.color = ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)];
      }

      if (hand.length === 1) {
        setUnoCalled(true);
      }

      setBotHand(hand);
      setAnimatingCard(playedCard);

      const isStackable = playedCard.value === '+2' || playedCard.value === '+4';
      const stackMatch = pendingDraw.type === playedCard.value;

      setTimeout(() => {
        setDiscardPile((prev) => [...prev, playedCard]);
        setAnimatingCard(null);

        if (isStackable) {
          if (pendingDraw.count && stackMatch) {
            setPendingDraw((prev) => ({
              count: prev.count + (playedCard.value === '+2' ? 2 : 4),
              type: playedCard.value,
            }));
          } else {
            setPendingDraw({ count: playedCard.value === '+2' ? 2 : 4, type: playedCard.value });
          }
        } else {
          setPendingDraw({ count: 0, type: null });
        }

        checkWinner(hand, `Bot`);
        setTurnIndex((prev) => (prev + 1) % turnOrder.length);
        setUnoCalled(false);
      }, 500);
    } else if (pendingDraw.count) {
      const newCards = [];
      for (let i = 0; i < pendingDraw.count; i++) {
        if (deck.length > 0) newCards.push(deck.pop());
      }
      setBotHand((prev) => [...prev, ...newCards]);
      setDeck([...deck]);
      setPendingDraw({ count: 0, type: null });
      setTurnIndex((prev) => (prev + 1) % turnOrder.length);
    } else if (deck.length > 0) {
      hand.push(deck.pop());
      setBotHand(hand);
      setDeck([...deck]);
      setTurnIndex((prev) => (prev + 1) % turnOrder.length);
    } else {
      setTurnIndex((prev) => (prev + 1) % turnOrder.length);
    }
  }

  function applyPenalty(player) {
    const penaltyCards = [];
    for (let i = 0; i < 2; i++) {
      if (deck.length > 0) {
        penaltyCards.push(deck.pop());
      }
    }
    if (player === username) {
      setPlayerHand((prev) => [...prev, ...penaltyCards]);
      alert('You forgot to call UNO! 2 cards added to your hand.');
    } else if (player === 'Bot') {
      setBotHand((prev) => [...prev, ...penaltyCards]);
      alert('Bot forgot to call UNO! 2 cards added to Bot hand.');
    }
    setDeck([...deck]);
  }

  function handleUnoCall() {
    if (turn === 0 && playerHand.length === 1 && gameStarted) {
      setUnoCalled(true);
      alert('UNO!');
    }
  }

  function checkWinner(hand, name) {
    if (hand.length === 0) {
      setWinner(name);
      calculateScores(name);
    }
  }

  function calculateScores(winnerName) {
    let playerFinalScore = 0;
    let botFinalScore = 0;

    if (winnerName === username) {
      playerFinalScore = 10;
      botFinalScore = Math.min(5, botHand.reduce((sum, card) => sum + cardValue(card), 0));
    } else if (winnerName === 'Bot') {
      botFinalScore = 10;
      playerFinalScore = Math.min(5, playerHand.reduce((sum, card) => sum + cardValue(card), 0));
    }

    const finalScores = {
      winner: winnerName,
      player: playerFinalScore,
      bot: botFinalScore,
    };

    setScores(finalScores);
    localStorage.setItem('lastGameScore', JSON.stringify(finalScores));
  }

  function cardValue(card) {
    if (card.value === 'skip' || card.value === 'reverse') return 20;
    if (card.value === '+2') return 20;
    if (card.value === '+4') return 50;
    if (card.value === 'wild') return 50;
    if (!isNaN(parseInt(card.value))) return parseInt(card.value);
    return 0;
  }

  return (
    <div style={styles.container}>
      <button onClick={handleBack} style={styles.backButton}>
        <img src={kembali} alt="Kembali" style={styles.backIcon} />
      </button>

      {/* Countdown overlay */}
      {!gameStarted && (
        <div style={styles.countdownOverlay}>
          <p style={styles.countdownText}>{countdown}</p>
        </div>
      )}

      {winner && (
        <div style={styles.winnerBanner}>
          🎉 {winner} wins! <button onClick={startGame}>Restart</button>
          {scores && (
            <div style={{ marginTop: 10, fontSize: 16, textAlign: 'left' }}>
              <p>Final Score:</p>
              <ul>
                <li>{username}: {scores.player}</li>
                <li>Bot: {scores.bot}</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {showColorPicker && (
        <div style={styles.colorPicker}>
          <p>Choose a color:</p>
          {['red', 'blue', 'green', 'yellow'].map((color) => (
            <button
              key={color}
              style={{ ...styles.colorButton, backgroundColor: color }}
              onClick={() => selectedColorCallback && selectedColorCallback(color)}
            />
          ))}
        </div>
      )}

      {/* Bot Hand Container (showing faced-down cards for bot) */}
      <div style={{ ...styles.botHandContainer, top: 20, left: '50%', transform: 'translateX(-50%)', position: 'absolute' }}>
        <div style={styles.cardRow}>
          {botHand.map((_, i) => (
            <div key={i} style={{ ...styles.playerCard, backgroundColor: 'gray' }}></div>
          ))}
        </div>
      </div>

      {/* Center Area (Discard Pile and Draw Deck) */}
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
                x: item.target === 'player' ? -150 + index * 20 : (item.target === 'bot' ? 150 - index * 20 : 0),
                y: item.target === 'player' ? 200 : (item.target === 'bot' ? -200 : 0),
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
                // For dealt cards, set background to gray to represent back of card
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
          {pendingDraw.count ? `Draw ${pendingDraw.count}` : 'Draw Card'}
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

      {/* UNO Button */}
      {playerHand.length === 1 && turn === 0 && !unoCalled && gameStarted && (
        <button onClick={handleUnoCall} style={styles.unoButton}>
          UNO!
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    height: '100vh',
    background: '#228',
    color: 'white',
    fontFamily: 'Arial',
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    zIndex: 50,
  },
  backIcon: {
    width: '40px',
    height: '40px',
  },
  playerHand: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
  },
  playerCard: {
    width: 60,
    height: 90,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
  },
  botHandContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  cardRow: {
    display: 'flex',
    gap: 10,
  },
  centerArea: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  discardPile: {
    width: 70,
    height: 100,
    borderRadius: 10,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 3px 6px rgba(0,0,0,0.5)',
  },
  drawButton: {
    padding: '8px 16px',
    fontSize: 16,
    borderRadius: 8,
    background: '#444',
    color: 'white',
    cursor: 'pointer',
  },
  winnerBanner: {
    position: 'absolute',
    top: 40,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.8)',
    padding: '16px 24px',
    borderRadius: 12,
    fontSize: 24,
    textAlign: 'center',
    zIndex: 20,
  },
  colorPicker: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#222',
    padding: 20,
    borderRadius: 10,
    zIndex: 30,
    textAlign: 'center',
  },
  colorButton: {
    width: 40,
    height: 40,
    margin: 5,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
  },
  unoButton: {
    position: 'absolute',
    bottom: 140,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    fontSize: 24,
    fontWeight: 'bold',
    borderRadius: 15,
    background: '#FF0000',
    color: 'white',
    border: '3px solid #AA0000',
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: '0 5px 10px rgba(0,0,0,0.5)',
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countdownText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
  },
};

export default Game1v1;