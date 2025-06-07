import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import kembali from '../assets/kembali.png';
import { useLocation } from 'react-router-dom';

const turnOrderInitial = [0, 1];

const GAME_TIME_LIMIT = 300; // 5 minutes

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
  const [dealtCards, setDealtCards] = useState([]);

  // State for player's total game time (countdown)
  const [playerGameTime, setPlayerGameTime] = useState(GAME_TIME_LIMIT);

  const turn = turnOrder[turnIndex];
  const topCard = discardPile[discardPile.length - 1];

  useEffect(() => {
    setGameStarted(false);
    setPlayerGameTime(GAME_TIME_LIMIT); // Reset player time at component mount/remount
    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setGameStarted(true); // Mark game as started
          startGame(); // Initialize game assets
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  // useEffect for player's total game time countdown
  useEffect(() => {
    let interval = null;
    if (gameStarted && !winner && playerGameTime > 0) { // Timer runs if game is active, no winner, and time remaining
      interval = setInterval(() => {
        setPlayerGameTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (playerGameTime === 0 && gameStarted && !winner) {
      setWinner('Bot'); // Bot wins if player runs out of time
      alert('Time\'s up! Bot wins!');
      clearInterval(interval);
    } else if (winner || !gameStarted) { // Stop timer if game ends or hasn't started
      clearInterval(interval);
    }
    return () => clearInterval(interval); // Cleanup
  }, [gameStarted, winner, playerGameTime]);


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

    // Reset player time for a new game
    setPlayerGameTime(GAME_TIME_LIMIT);

    for (let i = 0; i < 7; i++) {
      initialPlayerHand.push(newDeck.pop());
      initialBotHand.push(newDeck.pop());
    }
    const initialTopCard = newDeck.pop();
    setDeck(newDeck);
    setDiscardPile([]);
    setPlayerHand([]);
    setBotHand([]);
    setTurnIndex(0);
    setTurnOrder([...turnOrderInitial]);
    setWinner(null);
    setPendingCard(null);
    setShowColorPicker(false);
    setScores(null);
    setPendingDraw({ count: 0, type: null });

    for (let i = 0; i < 7; i++) {
      cardsToDeal.push({ card: initialPlayerHand[i], target: 'player' });
      cardsToDeal.push({ card: initialBotHand[i], target: 'bot' });
    }
    cardsToDeal.push({ card: initialTopCard, target: 'discard' });
    setDealtCards(cardsToDeal);
    let playerTempHand = [];
    let botTempHand = [];
    let currentDiscardPile = [];
    let delay = 0;
    const cardAnimationDelay = 250;
    cardsToDeal.forEach((item) => {
      setTimeout(() => {
        setDealtCards((prev) => prev.slice(1));
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
    if (!topCard) return true;
    if (card.value === pendingDraw.type && pendingDraw.count > 0) return true;
    if (pendingDraw.count > 0 && card.value !== pendingDraw.type && card.color !== 'black') return false; // Added exception for wild cards
    return (
      card.color === topCard.color ||
      card.value === topCard.value ||
      card.color === 'black'
    );
  }

  function playCard(card, index) {
    if (turn !== 0 || winner || !gameStarted) return;
    if (!isPlayable(card, topCard)) return;
    if (playerHand.length === 2 && !unoCalled) {
      applyPenalty(username);
    }
    if (card.color === 'black') {
      setPendingCard({ card, index });
      setShowColorPicker(true);
      setSelectedColorCallback(() => (color) => {
        const chosenCard = { ...card, color: color };
        finalizePlayCard(chosenCard, index);
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
        if (pendingDraw.count > 0 && stackMatch) {
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
      if (newHand.length === 0) {
        checkWinner(newHand, username);
      } else {
        setTurnIndex((prev) => (prev + 1) % turnOrder.length);
      }
    }, 500);
  }

  function drawCardPlayer() {
    if (turn !== 0 || winner || !gameStarted) return;
    if (pendingDraw.count > 0) {
      const newCards = [];
      let currentDeck = [...deck];
      for (let i = 0; i < pendingDraw.count; i++) {
        if (currentDeck.length > 0) {
          newCards.push(currentDeck.pop());
        } else break;
      }
      setPlayerHand((prev) => [...prev, ...newCards]);
      setDeck(currentDeck);
      setPendingDraw({ count: 0, type: null });
    } else if (deck.length > 0) {
      const newCard = deck.pop();
      setPlayerHand([...playerHand, newCard]);
      setDeck([...deck]);
    } else {
      console.log("Deck is empty, cannot draw.");
    }
    setTurnIndex((prev) => (prev + 1) % turnOrder.length);
  }

  function botPlay() {
    if (!gameStarted || winner) return;
    let hand = [...botHand];
    const playableCards = hand.filter(card =>
      isPlayable(card, topCard) &&
      (!pendingDraw.count || card.value === pendingDraw.type || card.color === 'black')
    );
    let playedCard = null;
    if (playableCards.length > 0) {
      const stackablePlay = playableCards.find(card => card.value === pendingDraw.type);
      if (stackablePlay) {
        playedCard = stackablePlay;
      } else if (pendingDraw.count > 0 && playableCards.some(c => c.color === 'black')) {
        playedCard = playableCards.find(c => c.color === 'black');
      } else {
        playedCard = playableCards.find(c => c.color !== 'black') || playableCards[0];
      }
      const playableIndex = hand.findIndex(card => card === playedCard);
      hand.splice(playableIndex, 1);
      if (playedCard.color === 'black') {
        playedCard.color = ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)];
      }
      setUnoCalled(false);
      setBotHand(hand);
      setAnimatingCard(playedCard);
      const isStackable = playedCard.value === '+2' || playedCard.value === '+4';
      const stackMatch = pendingDraw.type === playedCard.value;
      setTimeout(() => {
        setDiscardPile((prev) => [...prev, playedCard]);
        setAnimatingCard(null);
        if (isStackable) {
          if (pendingDraw.count > 0 && stackMatch) {
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
        if (hand.length === 0) {
          checkWinner(hand, `Bot`);
        } else {
          setTurnIndex((prev) => (prev + 1) % turnOrder.length);
        }
      }, 500);
    } else if (pendingDraw.count > 0) {
      const newCards = [];
      let currentDeck = [...deck];
      for (let i = 0; i < pendingDraw.count; i++) {
        if (currentDeck.length > 0) newCards.push(currentDeck.pop());
        else break;
      }
      setBotHand((prev) => [...prev, ...newCards]);
      setDeck(currentDeck);
      setPendingDraw({ count: 0, type: null });
      setTurnIndex((prev) => (prev + 1) % turnOrder.length);
    } else if (deck.length > 0) {
      let currentDeck = [...deck];
      hand.push(currentDeck.pop());
      setBotHand(hand);
      setDeck(currentDeck);
      setTurnIndex((prev) => (prev + 1) % turnOrder.length);
    } else {
      setTurnIndex((prev) => (prev + 1) % turnOrder.length);
    }
  }

  function applyPenalty(player) {
    const penaltyCards = [];
    let currentDeck = [...deck];
    for (let i = 0; i < 2; i++) {
      if (currentDeck.length > 0) {
        penaltyCards.push(currentDeck.pop());
      }
    }
    if (player === username) {
      setPlayerHand((prev) => [...prev, ...penaltyCards]);
    } else if (player === 'Bot') {
      setBotHand((prev) => [...prev, ...penaltyCards]);
      alert('Bot forgot to call UNO! 2 cards added to Bot hand.');
    }
    setDeck(currentDeck);
  }

  function handleUnoCall() {
    if (turn === 0 && playerHand.length === 1 && gameStarted && !unoCalled) {
      setUnoCalled(true);
      alert('UNO!');
    } else if (turn === 0 && playerHand.length !== 1 && unoCalled) {
      setUnoCalled(false);
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
    const finalScores = { winner: winnerName, player: playerFinalScore, bot: botFinalScore };
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

  // Function to format time MM:SS
  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return (
    <div style={styles.container}>
      <button onClick={handleBack} style={styles.backButton}>
        <img src={kembali} alt="Kembali" style={styles.backIcon} />
      </button>

      {/* Display Total Player Game Time (Countdown) */}
      {gameStarted && (
        <div style={styles.playerGameTimeDisplay}>
          Waktu Tersisa: {formatTime(playerGameTime)}
        </div>
      )}

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

      <div style={{ ...styles.botHandContainer, top: 20, left: '50%', transform: 'translateX(-50%)', position: 'absolute' }}>
        <div style={styles.cardRow}>
          {botHand.map((_, i) => (
            <div key={i} style={{ ...styles.playerCard, backgroundColor: 'gray' }}></div>
          ))}
        </div>
      </div>

      <div style={styles.centerArea}>
        <AnimatePresence>
          {dealtCards.map((item, index) => (
            <motion.div
              key={`dealt-${index}`}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.8, rotate: Math.random() * 20 - 10 }}
              animate={{
                x: item.target === 'player' ? -150 + index * 20 : (item.target === 'bot' ? 150 - index * 20 : 0),
                y: item.target === 'player' ? 200 : (item.target === 'bot' ? -200 : 0),
                opacity: 1, scale: 1, rotate: 0,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                ...styles.discardPile, position: 'absolute',
                backgroundColor: item.target === 'discard' ? item.card.color : 'gray',
                zIndex: 100 - index,
              }}
            >
              {item.target === 'discard' ? item.card.value : ''}
            </motion.div>
          ))}
        </AnimatePresence>
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
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, margin: 'auto', zIndex: 10,
              }}
            >
              {animatingCard.value}
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ ...styles.discardPile, backgroundColor: topCard?.color, position: 'relative', zIndex: 5 }}>
          {topCard?.value}
        </div>
        <button
          onClick={drawCardPlayer}
          disabled={turn !== 0 || winner || !gameStarted || (pendingDraw.count > 0 && pendingDraw.type && playerHand.some(card => card.value === pendingDraw.type && card.color !== 'black'))}
          style={styles.drawButton}
        >
          {pendingDraw.count ? `Draw ${pendingDraw.count}` : 'Draw Card'}
        </button>
      </div>

      <div style={styles.playerHand}>
        {playerHand.map((card, i) => (
          <div
            key={i}
            onClick={() => playCard(card, i)}
            style={{
              ...styles.playerCard,
              backgroundColor: card.color,
              cursor: winner || turn !== 0 || !isPlayable(card, topCard) || !gameStarted ? 'default' : 'pointer',
              opacity: isPlayable(card, topCard) && gameStarted && turn === 0 ? 1 : 0.6,
            }}
          >
            {card.value}
          </div>
        ))}
      </div>

      {playerHand.length === 1 && turn === 0 && !unoCalled && gameStarted && (
        <button onClick={handleUnoCall} style={styles.unoButton}>
          UNO!
        </button>
      )}
    </div>
  );
}

const styles = {
  container: { /* ... */ },
  backButton: { /* ... */ },
  backIcon: { /* ... */ },
  playerHand: { /* ... */ },
  playerCard: { /* ... */ },
  botHandContainer: { /* ... */ },
  cardRow: { /* ... */ },
  centerArea: { /* ... */ },
  discardPile: { /* ... */ },
  drawButton: { /* ... */ },
  winnerBanner: { /* ... */ },
  colorPicker: { /* ... */ },
  colorButton: { /* ... */ },
  unoButton: { /* ... */ },
  countdownOverlay: { /* ... */ },
  countdownText: { /* ... */ },
  playerGameTimeDisplay: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    zIndex: 25,
  },
};

Object.assign(styles, {
  container: {
    position: 'relative',
    height: '100vh',
    background: '#228',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
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
  }
});

export default Game1v1;