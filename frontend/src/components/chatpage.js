import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import axios from "axios";
import { Send, ArrowBack } from "@mui/icons-material"; // Added Back Icon
import { Person, Android } from "@mui/icons-material";
import { Card, CardContent, TextField, Button, Box, CircularProgress, IconButton } from "@mui/material";
import './QueryBot.css'; // Ensure this is imported

function ChatbotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false); // State for typing indicator
  const messagesEndRef = useRef(null); // Ref to scroll to the last message
  const navigate = useNavigate(); // Navigation hook

  const handleQuery = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsBotTyping(true); // Start typing animation

    try {
      const res = await axios.post("http://127.0.0.1:8000/query/", { query_text: input });
      const botMessage = { text: res.data.response, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { text: "Error fetching response.", sender: "bot" };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsBotTyping(false); // Stop typing animation
    }
  };

  // Scroll to the latest message automatically
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      height="100vh" 
      width="100vw"
      position="relative"
      sx={{ backgroundColor: "transparent" }} // Ensure no blocking background
    >
      {/* Animated Background */}
      <div className="animated-background" /> {/* Background layer */}

      {/* Back Button */}
      <IconButton 
        onClick={() => navigate(-1)} // Navigate back
        sx={{
          position: "absolute", 
          top: 20, 
          left: 20, 
          color: "white", 
          backgroundColor: "rgba(255,255,255,0.2)", 
          "&:hover": { backgroundColor: "rgba(255,255,255,0.4)" }
        }}
      >
        <ArrowBack />
      </IconButton>

      {/* Chatbot Card */}
      <Card sx={{ 
        width: "90%", 
        height: "85%", 
        padding: 2, 
        borderRadius: 2, 
        boxShadow: 3, 
        backgroundColor: "rgba(0,0,0,0.8)", // Slight transparency 
        color: "white" // Ensure text visibility 
      }} className="glow-border-expand">
        <CardContent>
          <h1 style={{ textAlign: "center", color: "white" }}>Prediction analysis Chatbot</h1>
          <Box sx={{ 
            height: "600px", 
            overflowY: "auto", 
            marginBottom: "20px", 
            padding: "10px", 
            backgroundColor: "rgba(255,255,255,0.1)", // Slight transparency
            borderRadius: "8px", 
            boxShadow: 1
          }}>
            {messages.map((msg, index) => (
              <Box key={index} display="flex" justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"} mb={2}>
                <Box display="flex" alignItems="center" sx={{ backgroundColor: msg.sender === "user" ? "#3f51b5" : "#e0e0e0", color: msg.sender === "user" ? "#fff" : "#000", borderRadius: "16px", padding: "10px 15px", maxWidth: "80%", boxShadow: 2 }}>
                  {msg.sender === "bot" && <Android style={{ marginRight: "8px" }} />}
                  <span>{msg.text}</span>
                  {msg.sender === "user" && <Person style={{ marginLeft: "8px" }} />}
                </Box>
              </Box>
            ))}
            {isBotTyping && (
              <Box display="flex" justifyContent="flex-start" mb={2}>
                <Box display="flex" alignItems="center" sx={{ backgroundColor: "#e0e0e0", color: "#000", borderRadius: "16px", padding: "10px 15px", maxWidth: "80%", boxShadow: 2 }}>
                  <CircularProgress size={20} />
                  <span>Processing Your Query...</span>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <TextField 
              variant="outlined" 
              placeholder="Ask me anything..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleQuery();
                }
              }} 
              sx={{ 
                flex: 1, 
                marginRight: 2, 
                backgroundColor: "rgba(255,255,255,0.2)", 
                borderRadius: 1, 
                input: { color: "white" }, 
                "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.7)" } // Lighter placeholder
              }} 
            />
            <Button variant="contained" color="primary" onClick={handleQuery} endIcon={<Send />}>
              Send
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ChatbotPage;
