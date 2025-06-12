import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import countdownSound from '../sound/5_second.mp3';
import bgMusic from '../sound/Lets_Play.mp3';
import kembali from '../assets/kembali.png';
import { db } from '../firebase'; // Import your db instance
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Import Firestore functions

// Import the new WinnerDisplay component
import WinnerDisplay from './WinnerDisplayno'; 

const turnOrderInitial = [0, 3, 1, 2];

function Game1v3() {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [dealtCards, setDealtCards] = useState([]);

  const countdownAudioRef = useRef(new Audio(countdownSound));
  const bgMusicAudioRef = useRef(new Audio(bgMusic));

  const turn = turnOrder[turnIndex];
  const topCard = discardPile[discardPile.length - 1];

  useEffect(() => {
    setGameStarted(false);
    setCountdown(5);

    countdownAudioRef.current.play().catch(e => console.error("Error playing sound:", e));

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setGameStarted(true);
          startGame();
          countdownAudioRef.current.pause();
          countdownAudioRef.current.currentTime = 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  useEffect(() => {
    if (gameStarted) {
      bgMusicAudioRef.current.loop = true;
      bgMusicAudioRef.current.volume = 0.3;
      bgMusicAudioRef.current.play().catch(e => console.error("Error playing background music:", e));
    } else {
      bgMusicAudioRef.current.pause();
      bgMusicAudioRef.current.currentTime = 0;
    }
    if (winner) {
      bgMusicAudioRef.current.pause();
    }
  }, [gameStarted, winner]);

  useEffect(() => {
    if (gameStarted && turn !== 0 && !winner) {
      setTimeout(() => botPlay(turn), 1000);
    }
  }, [turn, gameStarted, winner]);

  function startGame() {
    const newDeck = generateShuffledDeck();
    const initialPlayerHand = [];
    const initialplayer1Hand = [];
    const initialplayer2Hand = [];
    const initialplayer3Hand = [];
    const cardsToDeal = [];

    for (let i = 0; i < 7; i++) {
      initialPlayerHand.push(newDeck.pop());
      initialplayer1Hand.push(newDeck.pop());
      initialplayer2Hand.push(newDeck.pop());
      initialplayer3Hand.push(newDeck.pop());
    }
    const initialTopCard = newDeck.pop();

    setDeck(newDeck);
    setDiscardPile([]);
    setPlayerHand([]);
    setBotHands([[], [], []]);
    setTurnIndex(0);
    setTurnOrder([...turnOrderInitial]);
    setWinner(null);
    setPendingCard(null);
    setShowColorPicker(false);
    setSkipNext(false);
    setScores(null);

    const dealingSequence = [];
    for (let i = 0; i < 7; i++) {
      dealingSequence.push({ card: initialPlayerHand[i], target: 'player' });
      dealingSequence.push({ card: initialplayer3Hand[i], target: 'player3' });
      dealingSequence.push({ card: initialplayer1Hand[i], target: 'player1' });
      dealingSequence.push({ card: initialplayer2Hand[i], target: 'player2' });
    }
    dealingSequence.push({ card: initialTopCard, target: 'discard' });

    setDealtCards(dealingSequence);

    let playerTempHand = [];
    let player1TempHand = [];
    let player2TempHand = [];
    let player3TempHand = [];
    let currentDiscardPile = [];
    let delay = 0;
    const cardAnimationDelay = 250;

    dealingSequence.forEach((item) => {
      setTimeout(() => {
        setDealtCards((prev) => prev.slice(1));
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
    if (!topCard) return true;
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
    if (botPlayerId === 1) {
      botIndex = 0;
      botName = "Player 1";
    } else if (botPlayerId === 2) {
      botIndex = 1;
      botName = "Player 2";
    } else if (botPlayerId === 3) {
      botIndex = 2;
      botName = "Player 3";
    } else {
      return;
    }

    const botHand = [...botHands[botIndex]];
    const topCard = discardPile[discardPile.length - 1];
    const playableIndex = botHand.findIndex((card) => isPlayable(card, topCard));

    if (playableIndex !== -1) {
      const playedCard = botHand.splice(playableIndex, 1)[0];
      if (playedCard.color === 'black') {
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
      setTurnIndex((prev) => (prev + 1) % turnOrder.length);
    }
  }

  function handleSpecialCard(card) {
    const nextIndex = (turnIndex + 1) % turnOrder.length;
    const nextPlayer = turnOrder[nextIndex];

    if (card.value === '+2') {
      const newCards = [deck.pop(), deck.pop()];
      giveCardsToPlayer(nextPlayer, newCards);
      return true;
    } else if (card.value === '+4') {
      const newCards = [deck.pop(), deck.pop(), deck.pop(), deck.pop()];
      giveCardsToPlayer(nextPlayer, newCards);
      return true;
    } else if (card.value === 'skip') {
      return true;
    }

    return false;
  }

  function giveCardsToPlayer(playerId, cards) {
    if (playerId === 0) {
      setPlayerHand((prev) => [...prev, ...cards]);
    } else {
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
    return 0;
  }

  async function calculateScores(winnerName) {
    let playerTotalPoints = 0;
    let player1TotalPoints = 0;
    let player2TotalPoints = 0;
    let player3TotalPoints = 0;

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

    // --- Firebase Integration ---
    if (username && db) {
      const userRef = doc(db, 'users', username);
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const currentTotalScore = docSnap.data().totalScore || 0;
          const newTotalScore = currentTotalScore + finalPlayerScore;
          await updateDoc(userRef, { totalScore: newTotalScore });
          console.log(`Updated ${username}'s total score to: ${newTotalScore}`);
        } else {
          // If the user document doesn't exist, create it with the score
          await setDoc(userRef, { totalScore: finalPlayerScore, username: username });
          console.log(`Created new document for ${username} with total score: ${finalPlayerScore}`);
        }
      } catch (error) {
        console.error("Error updating score in Firebase:", error);
      }
    }
    // --- End Firebase Integration ---
  }

  // Fungsi untuk kembali ke halaman sebelumnya
  const handleGoBack = () => {
    // Menghentikan musik latar belakang dan suara hitung mundur saat kembali
    bgMusicAudioRef.current.pause();
    countdownAudioRef.current.pause();
    bgMusicAudioRef.current.currentTime = 0;
    countdownAudioRef.current.currentTime = 0;
    navigate(-1); // Kembali ke halaman sebelumnya
  };

  return (
    <div style={styles.container}>
      {/* Tombol kembali di pojok kiri atas */}
      <img
        src={kembali}
        alt="Kembali"
        style={styles.backButton}
        onClick={handleGoBack}
      />

      {!gameStarted && (
        <div style={styles.countdownOverlay}>
          <p style={styles.countdownText}>{countdown}</p>
        </div>
      )}

      {/* Render the WinnerDisplay component */}
      <WinnerDisplay
        winner={winner}
        scores={scores}
        onPlayAgain={startGame}
        username={username}
      />

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

      <div style={{ ...styles.botHandContainer, top: 20, left: '50%', transform: 'translateX(-50%)', position: 'absolute' }}>
        <div style={styles.cardRow}>
          {botHands[0].map((_, i) => (
            <div key={`player1-${i}`} style={{ ...styles.playerCard, backgroundColor: 'gray' }}></div>
          ))}
        </div>
      </div>

      <div style={{ ...styles.botHandContainer, right: 20, top: '50%', transform: 'translateY(-50%)', position: 'absolute' }}>
        <div style={styles.cardRowVertical}>
          {botHands[1].map((_, i) => (
            <div key={`player2-${i}`} style={{ ...styles.playerCard, backgroundColor: 'gray', ...styles.rotatedCardRight }}></div>
          ))}
        </div>
      </div>

      <div style={{ ...styles.botHandContainer, left: 20, top: '50%', transform: 'translateY(-50%)', position: 'absolute' }}>
        <div style={styles.cardRowVertical}>
          {botHands[2].map((_, i) => (
            <div key={`player3-${i}`} style={{ ...styles.playerCard, backgroundColor: 'gray', ...styles.rotatedCardLeft }}></div>
          ))}
        </div>
      </div>

      <div style={styles.centerArea}>
        <AnimatePresence>
          {dealtCards.map((item, index) => (
            <motion.div
              key={`dealt-${index}`}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 0.8,
                rotate: Math.random() * 20 - 10,
              }}
              animate={{
                x: item.target === 'player' ? 0 :
                  item.target === 'player1' ? 0 :
                  item.target === 'player2' ? 180 :
                  item.target === 'player3' ? -180 :
                  0,
                y: item.target === 'player' ? 200 :
                  item.target === 'player1' ? -200 :
                  item.target === 'player2' ? 0 :
                  item.target === 'player3' ? 0 :
                  0,
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                ...styles.discardPile,
                backgroundColor: item.target === 'discard' ? item.card.color : 'gray',
                position: 'absolute',
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

        <button
          onClick={drawCardPlayer}
          disabled={turn !== 0 || winner || deck.length === 0 || !gameStarted}
          style={styles.drawButton}
        >
          Ambil Kartu
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
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 40,
    height: 40,
    cursor: 'pointer',
    zIndex: 100,
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
    lineHeight: '90px',
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
    lineHeight: '120px',
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

export default Game1v3;