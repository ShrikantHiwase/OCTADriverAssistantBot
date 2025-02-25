import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/OCTALOGO.gif";
import dummyVideo from "../assets/OCTALOADING.mp4";
import "./StartupScreen.css";

function StartupScreen() {
  const [showVideo, setShowVideo] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    setShowVideo(true);
  };

  return (
    <div className="startup-container">
      {!showVideo ? (
        <>
          <img src={logo} alt="OCTA Logo" className="logo" onClick={handleStart} />
          <div className="logo-text">V.I.R.A.</div>
        </>
      ) : (
        <video className="loading-video" autoPlay onEnded={() => navigate("/home")}>
          <source src={dummyVideo} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

export default StartupScreen;
