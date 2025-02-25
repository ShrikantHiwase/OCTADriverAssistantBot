// there might be some small changes required for fucntion names and respective actions also make changes in OCTAHome accordingly

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OCTAHome.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faScrewdriverWrench,
  faHeartPulse,
  faStarHalfStroke,
  faCommentMedical,
  faTruckMedical,
  faArrowLeft,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

function OCTAAssistant() {
  const [active, setActive] = useState(false);
  const [hoverText, setHoverText] = useState(""); // Fix: Ensure hover text state is set properly
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        setActive(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  const activateOCTA = () => {
    setActive(true);
  };

  const handleCommand = (command) => {
    switch (command) {
      case "Servicedash":
        navigate("/Servicedashboard");
        break;
      case "Prognostics":
        navigate("/Faultpredictchat");
        break;
      case "YourQuery":
        navigate("/VOIASSIST"); // Fix: Ensure navigation works for chatbot
        break;
      case "RateMe":
        setRating(0);
        setShowFeedbackModal(true);
        break;
      case "CallService":
        alert(" Calling Service ..."); // Fix: Ensure alert appears
        break;
      default:
        console.warn(`Unhandled command: ${command}`);
        break;
    }
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      alert("Oops! Please select a rating before submitting.");
      return;
    }

    const feedbackData = {
      rating,
      feedback,
      timestamp: new Date().toISOString(),
    };

    const existingFeedback = JSON.parse(localStorage.getItem("userFeedback")) || [];
    existingFeedback.push(feedbackData);
    localStorage.setItem("userFeedback", JSON.stringify(existingFeedback));

    alert("🎉 Thanks for your feedback!");

    setRating(0);
    setFeedback("");
    setShowFeedbackModal(false);
  };

  const emojis = ["😡", "😢", "😐", "🙂", "😃"];
  const emojiLabels = ["Very Bad", "Bad", "Neutral", "Good", "Excellent"];

  return (
    <div id="primary-content" className="centered-pen">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <h1 className="display-3">Hello there!</h1>
      <p className="lead">Meet OCTA , Your new personal Onboard Car Troubleshooting Assistant!</p>
      
      <div className="personal-assistant">
        <div id="OCTA" className={`OCTA ${active ? "active" : ""}`} onClick={activateOCTA}>
          <div className="eyes">
            <div className="eye left"></div>
            <div className="eye right"></div>
          </div>
        </div>
        <div className="platform"></div>

        {/* Command List (Appears when clicking OCTA) */}
        {active && (
          <ul className="command-list">
            <li 
              onClick={() => handleCommand("Servicedash")}
              onMouseEnter={() => setHoverText("Vehicle Service dashboard")}
              onMouseLeave={() => setHoverText("")}
            >
              <FontAwesomeIcon icon={faScrewdriverWrench} />
            </li>
            <li 
              onClick={() => handleCommand("YourQuery")}
              onMouseEnter={() => setHoverText("Fault Predict")}
              onMouseLeave={() => setHoverText("")}
            >
              <FontAwesomeIcon icon={faHeartPulse} />
            </li>
            <li 
              onClick={() => handleCommand("Faultpredict")}
              onMouseEnter={() => setHoverText("Voice Assist")}
              onMouseLeave={() => setHoverText("")}
            >
              <FontAwesomeIcon icon={faCommentMedical} />
            </li>
            <li 
              onClick={() => handleCommand("ServiceVan")}
              onMouseEnter={() => setHoverText("Service Van")}
              onMouseLeave={() => setHoverText("")}
            >
              <FontAwesomeIcon icon={faTruckMedical} />
            </li>
            <li 
              onClick={() => handleCommand("RateMe")}
              onMouseEnter={() => setHoverText("Rate Me")}
              onMouseLeave={() => setHoverText("")}
            >
              <FontAwesomeIcon icon={faStarHalfStroke} />
            </li>
          </ul>
        )}
        <div className={`hover-text ${hoverText ? "show" : ""}`}>
          {hoverText}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="feedback-modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowFeedbackModal(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3>Rate Your Experience 🚀</h3>
            <div className="rating-emojis">
              {emojis.map((emoji, index) => (
                <span
                  key={index}
                  className={`emoji ${rating === index + 1 ? "selected" : ""}`}
                  onClick={() => setRating(index + 1)}
                  title={emojiLabels[index]}
                >
                  {emoji}
                </span>
              ))}
            </div>
            <textarea
              placeholder="Tell us more..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="quirky-input"
            ></textarea>
            <button className="submit-button quirky-button" onClick={handleSubmitFeedback}>Send It! 🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OCTAAssistant;
