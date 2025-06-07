import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import Play from './play/Play';
import BotGame from './play/BotGame';
import Game1v1 from './game1v1/Game1v1'; 
import Game1v3 from './play/Game1v3';
import Multiplayer from './Multiplayer/Multiplayer';  
import Login from './pages/Login';  
import Register from './pages/Register';  

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Play" element={<Play />} />
        <Route path="/bot" element={<BotGame />} />
        <Route path="/game/1v1" element={<Game1v1 />} />
        <Route path="/game/1v3" element={<Game1v3 />} />
        <Route path="/Multiplayer" element={<Multiplayer />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
