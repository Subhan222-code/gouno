import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  increment,
} from 'firebase/firestore';

import croppedImage from '../assets/cropped.png';
import tombol_bot from '../assets/mulai.png';
import MULTIPLAYER from '../assets/logo.png';
import Learderboard from '../assets/leaderboard_uno.png';
import bgMusic from '../sound/uno_menu.mp3';
import clickSound from '../sound/mixkit.wav'; 

const Play = () => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [userProfile, setUserProfile] = useState({ username: '', totalScore: 0 });
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);

  // Inisialisasi sound klik
  const [clickAudio] = useState(() => new Audio(clickSound));
  const playClickSound = () => {
    clickAudio.currentTime = 0;
    clickAudio.play();
  };

  const LeaderboardList = ({ entries, onClose }) => (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: 300,
        maxHeight: '70vh',
        overflowY: 'auto',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          border: 'none',
          background: 'transparent',
          fontSize: 20,
          cursor: 'pointer',
        }}
        aria-label="Close leaderboard"
      >
        ×
      </button>
      <h2 style={{ margin: 0, marginBottom: 12, textAlign: 'center', color: '#333' }}>Leaderboard</h2>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>Tidak ada entri</div>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: '6px 0',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: 16,
              color: '#444',
            }}
          >
            <span>{entry.username}</span>
            <span>{entry.totalScore ?? 0}</span>
          </div>
        ))
      )}
    </div>
  );

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    let currentProfile = { username: '', totalScore: 0 };

    if (storedProfile) {
      currentProfile = JSON.parse(storedProfile);
    } else {
      navigate('/login');
      return;
    }

    const lastGameScore = localStorage.getItem('lastGameScore');

    const updateAndFetchProfileAndLeaderboard = async () => {
      const userRef = doc(db, 'users', currentProfile.username);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        currentProfile.totalScore = userDoc.data().totalScore || 0;
      } else {
        await setDoc(userRef, { username: currentProfile.username, totalScore: 0 });
      }

      if (lastGameScore) {
        const parsedScore = JSON.parse(lastGameScore);
        if (parsedScore.winner === currentProfile.username) {
          const scoreToAdd = parsedScore.playerScore;

          try {
            await setDoc(userRef, { totalScore: increment(scoreToAdd) }, { merge: true });
            currentProfile.totalScore += scoreToAdd;
            console.log(`Berhasil memperbarui skor total ${currentProfile.username} sebesar ${scoreToAdd}`);
          } catch (error) {
            console.error('Gagal memperbarui skor total pengguna:', error);
          }
        }
        localStorage.removeItem('lastGameScore');
      }

      setUserProfile(currentProfile);
      localStorage.setItem('userProfile', JSON.stringify(currentProfile));

      try {
        const q = query(
          collection(db, 'users'),
          orderBy('totalScore', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setLeaderboardEntries(entries);
      } catch (error) {
        console.error('Gagal mengambil leaderboard:', error);
      }
    };

    updateAndFetchProfileAndLeaderboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  return (
    <>
      {/* Musik Latar Belakang */}
      <audio
        src={bgMusic}
        autoPlay
        loop
        ref={(audio) => {
          if (audio) audio.volume = 0.4;
        }}
        hidden
      />

      <div
        style={{
          height: '100vh',
          width: '100vw',
          backgroundImage: `url(${croppedImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <div
            onClick={() => setShowLogout(!showLogout)}
            style={{
              background: 'linear-gradient(90deg, orange, yellow)',
              padding: '10px 14px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 4px 10px rgb(245, 78, 1)',
              cursor: 'pointer',
              color: '#fff',
              fontWeight: 'bold',
              userSelect: 'none',
              fontSize: 16,
              minWidth: 100,
              justifyContent: 'center',
            }}
          >
            {userProfile.username || 'Guest'}
          </div>

          <div
            style={{
              background: 'white',
              padding: '6px 12px',
              borderRadius: 12,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              color: '#333',
              fontWeight: 'bold',
              fontSize: 14,
              minWidth: 100,
              textAlign: 'center',
            }}
          >
            Skor: {userProfile.totalScore ?? 0}
          </div>

          {showLogout && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              style={{
                position: 'absolute',
                top: 56 + 8,
                left: 0,
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: '10px 20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#d32f2f',
                fontSize: 16,
                userSelect: 'none',
                zIndex: 150,
                whiteSpace: 'nowrap',
              }}
            >
              Logout
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
          <div
            onClick={() => {
              playClickSound();
              navigate('/bot', { state: { username: userProfile.username } });
            }}
            style={{ cursor: 'pointer' }}
          >
            <img src={tombol_bot} alt="Mode Bot" style={{ width: 160, borderRadius: 16 }} />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 12,
            zIndex: 200,
          }}
        >
          <div
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => {
              playClickSound();
              setShowLeaderboard(true);
            }}
            title="Tampilkan Leaderboard"
          >
            <img src={Learderboard} alt="Leaderboard" style={{ width: 120, borderRadius: 16 }} />
          </div>

          <div
            style={{ cursor: 'pointer' }}
            onClick={() => {
              playClickSound();
              navigate('/multiplayer', { state: { username: userProfile.username } });
            }}
            title="Pergi ke Multiplayer"
          >
            <img src={MULTIPLAYER} alt="Mode Multiplayer" style={{ width: 120, borderRadius: 16 }} />
          </div>
        </div>

        {showLeaderboard && (
          <div
            onClick={() => setShowLeaderboard(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              width: '100vw',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 500,
            }}
          >
            <LeaderboardList entries={leaderboardEntries} onClose={() => setShowLeaderboard(false)} />
          </div>
        )}
      </div>
    </>
  );
};

export default Play;
