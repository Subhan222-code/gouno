// Game1v1.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import kembali from '../assets/kembali.png';
import { useLocation } from 'react-router-dom';

// Import Firebase Firestore functions
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';

// Import the new WinnerDisplay component
import WinnerDisplay from './WinnerDisplay';
import bgMusic from '../sound/Lets_Play.mp3';
import countdownSound from '../sound/5_second.mp3'; 
const turnOrderInitial = [0, 1];

const GAME_TIME_LIMIT = 180; // 3 menit

// --- Styles moved to a separate object ---
const playerInfoBoxStyles = {
  position: 'absolute',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '10px 20px',
  borderRadius: '10px',
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '5px',
};

const playerInfoTextStyles = {
  margin: 0,
  color: 'white',
  fontSize: '18px',
};

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

  const [playerGameTime, setPlayerGameTime] = useState(GAME_TIME_LIMIT);

  const turn = turnOrder[turnIndex];
  const topCard = discardPile[discardPile.length - 1];

  const bgAudioRef = useRef(new Audio(bgMusic)); // Ref for background music
  const countdownAudioRef = useRef(new Audio(countdownSound)); // Ref for countdown sound

  // Effect for playing and pausing background music
  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    bgAudio.loop = true; // Loop the music

    if (gameStarted && !winner) {
      bgAudio.play().catch(e => console.error("Error playing background audio:", e));
    } else {
      bgAudio.pause();
      bgAudio.currentTime = 0; // Reset music when game ends or is not started
    }

    // Cleanup function to pause and reset music when component unmounts
    return () => {
      bgAudio.pause();
      bgAudio.currentTime = 0;
    };
  }, [gameStarted, winner]); // Depend on gameStarted and winner state

  // Effect for playing countdown sound
  useEffect(() => {
    const countdownAudio = countdownAudioRef.current;

    if (!gameStarted && countdown > 0) {
      // Play the countdown sound when the countdown starts and is active
      countdownAudio.play().catch(e => console.error("Error playing countdown audio:", e));
    } else if (gameStarted || countdown === 0) {
      // Stop and reset the countdown sound once the game starts or countdown finishes
      countdownAudio.pause();
      countdownAudio.currentTime = 0;
    }
    // No cleanup needed here as we want it to finish playing even if component unmounts immediately
    // after countdown finishes. The main bg audio cleanup will handle overall audio.
  }, [gameStarted, countdown]); // Depend on gameStarted and countdown state

  const saveGameResult = async (result) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Tidak ada pengguna yang login. Hasil game tidak dapat disimpan ke Firestore.');
        return;
      }

      await addDoc(collection(db, "gameResults"), {
        playerUsername: result.username,
        playerUid: user.uid,
        botScore: result.botScore,
        playerScore: result.playerScore,
        winner: result.winner,
        timestamp: serverTimestamp(),
        gameDurationSeconds: result.gameDurationSeconds
      });
      console.log("Hasil game berhasil disimpan!");
    } catch (error) {
      console.error("Error saat menyimpan hasil game: ", error);
    }
  };

  useEffect(() => {
    setGameStarted(false);
    setPlayerGameTime(GAME_TIME_LIMIT);
    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setGameStarted(true);
          startGame();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  useEffect(() => {
    let interval = null;
    if (gameStarted && !winner && playerGameTime > 0) {
      interval = setInterval(() => {
        setPlayerGameTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (playerGameTime === 0 && gameStarted && !winner) {
      setWinner('Bot');
      alert('Waktu habis! Bot menang!');
      calculateScores('Bot');
      clearInterval(interval);
    } else if (winner || !gameStarted) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
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
    setUnoCalled(false);

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
    let idCounter = 0;

    for (let color of colors) {
      for (let value of values) {
        deck.push({ id: idCounter++, color, value });
        if (value !== '0') deck.push({ id: idCounter++, color, value });
      }
    }
    for (let i = 0; i < 4; i++) {
      deck.push({ id: idCounter++, color: 'black', value: 'wild' });
      deck.push({ id: idCounter++, color: 'black', value: '+4' });
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
    if (pendingDraw.count > 0 && card.value !== pendingDraw.type && card.color !== 'black') return false;
    return (
      card.color === topCard.color ||
      card.value === topCard.value ||
      card.color === 'black'
    );
  }

  function playCard(cardToPlay) {
    if (turn !== 0 || winner || !gameStarted) return;
    if (!isPlayable(cardToPlay, topCard)) return;

    const index = playerHand.findIndex(c => c.id === cardToPlay.id);
    if (index === -1) return;

    if (playerHand.length === 2 && !unoCalled) {
      applyPenalty(username);
    }
    if (cardToPlay.color === 'black') {
      setPendingCard({ card: cardToPlay, index });
      setShowColorPicker(true);
      setSelectedColorCallback(() => (color) => {
        const chosenCard = { ...cardToPlay, color: color };
        finalizePlayCard(chosenCard, index);
        setShowColorPicker(false);
        setPendingCard(null);
      });
    } else {
      finalizePlayCard(cardToPlay, index);
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
    if (pendingDraw.count > 0 && playerHand.some(card => isPlayable(card, topCard) && (card.value === pendingDraw.type || card.color === 'black'))) {
      alert(`Anda harus memainkan kartu +${pendingDraw.type} atau kartu Wild.`);
      return;
    }

    const newCards = [];
    let currentDeck = [...deck];
    let cardsToDraw = pendingDraw.count > 0 ? pendingDraw.count : 1;

    for (let i = 0; i < cardsToDraw; i++) {
      if (currentDeck.length > 0) {
        newCards.push(currentDeck.pop());
      } else {
        console.log("Deck kosong, tidak bisa mengambil kartu lagi.");
        break;
      }
    }
    setPlayerHand((prev) => [...prev, ...newCards]);
    setDeck(currentDeck);
    setPendingDraw({ count: 0, type: null });
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
      }
      else if (pendingDraw.count > 0 && playableCards.some(c => c.color === 'black')) {
        playedCard = playableCards.find(c => c.color === 'black');
      }
      else {
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
    } else {
      const newCards = [];
      let currentDeck = [...deck];
      let cardsToDraw = pendingDraw.count > 0 ? pendingDraw.count : 1;

      for (let i = 0; i < cardsToDraw; i++) {
        if (currentDeck.length > 0) {
          newCards.push(currentDeck.pop());
        } else {
          console.log("Deck kosong untuk bot, tidak bisa mengambil.");
          break;
        }
      }
      setBotHand((prev) => [...prev, ...newCards]);
      setDeck(currentDeck);
      setPendingDraw({ count: 0, type: null });
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
      alert('Bot lupa memanggil UNO! 2 kartu ditambahkan ke tangan Bot.');
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

  async function calculateScores(winnerName) {
    let playerFinalScore = 0;
    let botFinalScore = 0;
    let gameDuration = GAME_TIME_LIMIT - playerGameTime;

    // Fungsi untuk menghitung nilai satu kartu
    const cardValue = (card) => {
      if (!card) return 0; // Menangani kasus di mana kartu mungkin tidak terdefinisi
      if (['+2', 'skip', 'reverse'].includes(card.value)) return 20;
      if (['+4', 'wild'].includes(card.value)) return 50;
      if (!isNaN(parseInt(card.value))) return parseInt(card.value);
      return 0; // Default untuk tipe kartu yang tidak ditangani
    };

    if (winnerName === username) {
      // Pemain menang: Pemain mendapatkan poin dari kartu di tangan bot
      botHand.forEach(card => {
        playerFinalScore += cardValue(card);
      });
    } else if (winnerName === 'Bot') {
      // Bot menang: Bot mendapatkan poin dari kartu di tangan pemain
      playerHand.forEach(card => {
        botFinalScore += cardValue(card);
      });
    }

    const finalScores = { winner: winnerName, player: playerFinalScore, bot: botFinalScore };
    setScores(finalScores);
    localStorage.setItem('lastGameScore', JSON.stringify(finalScores));

    saveGameResult({
      username: username,
      botScore: botFinalScore,
      playerScore: playerFinalScore,
      winner: winnerName,
      gameDurationSeconds: gameDuration
    });

    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const currentTotalScore = userDoc.data().totalScore || 0;
          // Hanya tambahkan skor pemain ke totalScore mereka
          const newTotalScore = currentTotalScore + playerFinalScore;

          await updateDoc(userDocRef, {
            totalScore: newTotalScore,
          });
          console.log('totalScore berhasil diperbarui di Firestore!');

          const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
          userProfile.totalScore = newTotalScore;
          localStorage.setItem('userProfile', JSON.stringify(userProfile));

        } else {
          console.log('Dokumen pengguna tidak ditemukan.');
        }

      } catch (error) {
        console.error('Gagal memperbarui totalScore:', error);
      }
    } else {
      console.warn('Tidak ada pengguna yang login. totalScore tidak dapat diperbarui.');
    }
  }

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

      {/* Use the WinnerDisplay component here */}
      <WinnerDisplay
        winner={winner}
        username={username}
        scores={scores}
        onRestartGame={startGame}
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

      {/* Bot Hand (existing) */}
      <div style={{ ...styles.botHandContainer, top: 20, left: '50%', transform: 'translateX(-50%)', position: 'absolute' }}>
        <div style={styles.cardRow}>
          {botHand.map((card) => (
            <div key={card.id} style={{ ...styles.playerCard, backgroundColor: 'gray' }}></div>
          ))}
        </div>
      </div>

      <div style={styles.centerArea}>
        <AnimatePresence>
          {dealtCards.map((item, index) => (
            <motion.div
              key={`${item.card.id}-${item.target}-${index}`}
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
              key="animating-card"
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
          disabled={turn !== 0 || winner || !gameStarted || (pendingDraw.count > 0 && playerHand.some(card => isPlayable(card, topCard) && (card.value === pendingDraw.type || card.color === 'black')))}
          style={styles.drawButton}
        >
          {pendingDraw.count ? `Ambil ${pendingDraw.count} Kartu` : 'Ambil Kartu'}
        </button>
      </div>

      {/* Player Username Display */}
      <div style={styles.playerUsernameDisplay}>
        {username}
      </div>

      <div style={styles.playerHand}>
        {playerHand.map((card) => (
          <div
            key={card.id}
            onClick={() => playCard(card)}
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
  colorPicker: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'transparent',
    padding: 20,
    borderRadius: 10,
    zIndex: 30,
    textAlign: 'center',
    color: 'white',
  },
  colorButton: {
    width: 40,
    height: 40,
    margin: 5,
    borderRadius: '50%',
    border: '2px solid white',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countdownText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
  },
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
  playerUsernameDisplay: {
    position: 'absolute',
    bottom: 120, // Positioned above the player's hand
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    zIndex: 15,
  },
};

export default Game1v1;