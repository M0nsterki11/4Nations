// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameBoard from "./components/Board/GameBoard";
import StartScreen from "./components/Screens/StartScreen";
import SettingsScreen from "./components/Screens/SettingsScreen";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Lobby */}
        <Route path="/" element={<StartScreen />} />

        {/* Settings */}
        <Route path="/settings" element={<SettingsScreen />} />

        {/* Game */}
        <Route path="/game" element={<GameBoard />} />
      </Routes>
    </Router>
  );
}

export default App;

