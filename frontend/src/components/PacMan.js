import React from "react";
import "./PacMan.css";

const Pacman = () => {
  return (
    <div className="pacman-container">
      <div className="pacman">
        <div className="pacman-eye"></div>
        <div className="pacman-mouth"></div>
        <div className="pacman-food"></div>
      </div>
      {/* Feeding Data Text */}
      <p className="feeding-text">Feeding Data</p>
    </div>
  );
};

export default Pacman;
