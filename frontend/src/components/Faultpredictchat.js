import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Send, ArrowBack } from "@mui/icons-material";
import { Person, Android } from "@mui/icons-material";
import { 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Box, 
  CircularProgress, 
  IconButton, 
  Grow 
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStethoscope, faWandMagicSparkles, faGear } from "@fortawesome/free-solid-svg-icons";
import "./Faultpredictchat.css";
import PacMan from "./PacMan";  
import Analyze from "./Analyze";  

function ChatbotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showPacMan, setShowPacMan] = useState(false);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const handleQuery = async () => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsBotTyping(true);
  
    try {
      const res = await axios.post("http://127.0.0.1:8000/query/", { query_text: input });
  
      const botMessage = { text: res.data.response, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { text: "Error fetching response.", sender: "bot" };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsBotTyping(false);
    }
  };

  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePrognosticsClick = () => {
    setShowPacMan(true);

    setTimeout(() => {
      setShowPacMan(false);
      setShowAnalyze(true);
    }, 5000);

    setTimeout(() => {
      setShowAnalyze(false);

      // transitioning from Analyze.js
      const botWarningMessage = { text: "Dummy fault you need to implement fault prediction that fault can be shown here", sender: "bot" };
      setMessages((prev) => [...prev, botWarningMessage]);
    }, 10000);
  };

  return (
    <Box position="relative" width="100vw" height="100vh">
      {showPacMan && <PacMan />}
      {showAnalyze && <Analyze />}

      {!showPacMan && !showAnalyze && (
        <>
          <div className="animated-background" />

          {/* Back Button */}
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              position: "absolute",
              top: 20,
              left: 20,
              color: "white",
              backgroundColor: "rgba(255,255,255,0.2)",
              transition: "0.3s",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.4)", transform: "scale(1.1)" },
            }}
          >
            <ArrowBack />
          </IconButton>

          <Box display="flex" height="100%" px={2}>
            <Box flex={1} display="flex" justifyContent="center" alignItems="center">
              <Grow in timeout={1000}>
                <Card
                  sx={{
                    width: "90%",
                    height: "85%",
                    padding: 2,
                    borderRadius: 2,
                    boxShadow: 5,
                    backgroundColor: "rgba(0,0,0,0.8)",
                    color: "white",
                  }}
                  className="glow-border-expand"
                >
                  <CardContent>
                    <h1 style={{ textAlign: "center", color: "white" }}>
                      Prognostics AI-bot
                    </h1>
                    <Box
                      sx={{
                        height: "600px",
                        overflowY: "auto",
                        marginBottom: "20px",
                        padding: "10px",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        boxShadow: 1,
                      }}
                    >
                      {messages.map((msg, index) => (
                        <Grow in key={index} timeout={500}>
                          <Box
                            display="flex"
                            justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
                            mb={2}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              sx={{
                                backgroundColor: msg.sender === "user" ? "#3f51b5" : "#e0e0e0",
                                color: msg.sender === "user" ? "#fff" : "#000",
                                borderRadius: "16px",
                                padding: "10px 15px",
                                maxWidth: "80%",
                                boxShadow: 2,
                              }}
                            >
                              {msg.sender === "bot" && <Android style={{ marginRight: "8px" }} />}
                              <span>{msg.text}</span>
                              {msg.sender === "user" && <Person style={{ marginLeft: "8px" }} />}
                            </Box>
                          </Box>
                        </Grow>
                      ))}
                      {isBotTyping && (
                        <Grow in>
                          <Box display="flex" justifyContent="flex-start" mb={2}>
                            <Box
                              display="flex"
                              alignItems="center"
                              sx={{
                                backgroundColor: "#e0e0e0",
                                color: "#000",
                                borderRadius: "16px",
                                padding: "10px 15px",
                                maxWidth: "80%",
                                boxShadow: 2,
                              }}
                            >
                              <CircularProgress size={20} />
                              <span style={{ marginLeft: "8px" }}>Processing...</span>
                            </Box>
                          </Box>
                        </Grow>
                      )}
                      <div ref={messagesEndRef} />
                    </Box>

                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <TextField
                        variant="outlined"
                        placeholder="Have a query ask me..."
                        autoComplete="off"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                        sx={{
                          flex: 1,
                          marginRight: 2,
                          marginBottom: 2,
                          backgroundColor: "rgba(255,255,255,0.2)",
                          borderRadius: 1,
                          input: { color: "white" },
                          "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.7)" },
                        }}
                      />
                      <Button variant="contained" color="primary" onClick={handleQuery} endIcon={<Send />}>
                        Send
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Box>

            {/* Restored Icons with Correct Size */}
            <Box width="130px" display="flex" flexDirection="column" alignItems="center" sx={{ pt: 20, pr: 10 }}>
              <Button onClick={handlePrognosticsClick}>
                <FontAwesomeIcon icon={faStethoscope} size="3x" />
              </Button>
              <span>Prognostics</span>

              <Button>
                <FontAwesomeIcon icon={faWandMagicSparkles} size="3x" />
              </Button>
              <span>ProTips</span>

              <Button>
                <FontAwesomeIcon icon={faGear} size="3x" />
              </Button>
              <span>Personalization</span>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

export default ChatbotPage;
