import React from "react";
import { useNavigate } from "react-router-dom";

function OCTAHomepage() {
  const navigate = useNavigate();

  return (
    <div className="OCTA-homepage">
      <h1>Welcome to OCTA</h1>
      <button onClick={() => navigate("/chatbot")}>Fault Prediction Chatbot</button>
      <button onClick={() => navigate("/connect")}>Call Service</button>
      <button onClick={() => navigate("/rate")}>Rate Me</button>
      <button onClick={() => navigate("/feedback")}>Feedback</button>
      <button onClick={() => navigate("/call")}>Call</button>
    </div>
  );
}

export default OCTAHomepage;
