import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import StartupScreen from "./components/StartupScreen";
import OCTAHome from "./components/OCTAHome";
import Faultpredictchat from "./components/Faultpredictchat"; 
import VOIASSIST from "./components/VOIASSIST";
import Servicedashboard from "./components/Servicedashboard";
import PacMan from "./components/PacMan";  // Import PacMan animation
import Analyze from "./components/Analyze";  // Import Analyze animation

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartupScreen />} />
        <Route path="/home" element={<OCTAHome />} />
        <Route path="/prognostics" element={<VOIASSIST />} />
        <Route path="/chatbot" element={<Faultpredictchat />} />
        <Route path="/vehicleservice" element={<Servicedashboard />} />
        <Route path="/pacman" element={<PacMan />} />  {/* Add route for PacMan */}
        <Route path="/analyze" element={<Analyze />} />  {/* Add route for Analyze */}
      </Routes>
    </Router>
  );
}

export default App;
