import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Remove if not using React Router
import './VOIASSIST.css';
import { createNoise3D } from 'simplex-noise';

//////////////////////////////////////////////
// Utility Functions
//////////////////////////////////////////////
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gradientColor(ctx, cr, cg, cb, ca, x, y, r) {
  const col = `${cr},${cg},${cb}`;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${ca})`);
  g.addColorStop(0.5, `rgba(${col},${ca * 0.5})`);
  g.addColorStop(1, `rgba(${col},0)`);
  return g;
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

//////////////////////////////////////////////
// AnimatedText Component for Typewriter Effect
//////////////////////////////////////////////
const AnimatedText = ({ text, style }) => {
  const words = text.split(" ");
  return (
    <div className="typewriter-text" style={{ ...style, textAlign: 'left' }}>
      {words.map((word, index) => (
        <span key={index} style={{ animationDelay: `${index * 0.489}s` }}>
          {word}&nbsp;
        </span>
      ))}
    </div>
  );
};

//////////////////////////////////////////////
// Shape Class (No Glitch)
//////////////////////////////////////////////
class Shape {
  constructor(app, x, y, index, noise3D) {
    this.app = app;
    this.ctx = app.ctx;
    this.x = x;
    this.y = y;
    this.index = index;
    this.noise3D = noise3D;
    this.cr = 50;
    this.angle = randomNumber(0, 360);
    this.angle2 = randomNumber(0, 360);
    this.c = {
      r: randomNumber(0, 255),
      g: randomNumber(0, 255),
      b: randomNumber(0, 255),
      a: 1
    };
    this.noiseDist = 10;
    this.noiseX = 1000;
    this.noiseY = 1000;
    this.step = this.app.width / 360;
  }

  updateAngles() {
    this.angle += 1;
    this.angle2 += 0.5;
  }

  // Draw the wave animation (mic is active)
  drawLine() {
    const { ctx } = this;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgb(${this.c.r}, ${this.c.g}, ${this.c.b})`;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    for (let x = 0; x <= this.app.width; x += this.step) {
      const n = this.noise3D(
        x / this.noiseX,
        this.y / this.noiseY,
        degToRad(this.angle)
      );
      const yVal = Math.sin((x * Math.PI) / 180 / 2) * (n * this.noiseDist) + this.y;
      ctx.lineTo(x * this.step, yVal);
    }
    for (let x = this.app.width; x > 0; x -= this.step) {
      const n = this.noise3D(
        x / this.noiseX,
        this.y / this.noiseY,
        degToRad(this.angle)
      );
      const yVal = Math.sin((x * Math.PI) / 180 / 2) * (n * -this.noiseDist) + this.y;
      ctx.lineTo(x * this.step, yVal);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draw the circular blob (when recognized text exists or on input timeout)
  drawCircle() {
    const { ctx } = this;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = gradientColor(
      ctx,
      this.c.r,
      this.c.g,
      this.c.b,
      this.c.a,
      this.app.width / 2,
      this.y,
      this.cr
    );
    ctx.translate(this.app.width / 2, this.y);
    ctx.rotate(Math.sin(degToRad(this.angle2)));
    ctx.scale(
      Math.cos(degToRad(this.angle2) * this.index),
      Math.sin(degToRad(this.angle2) * this.index)
    );
    ctx.translate(-this.app.width / 2, -this.y);
    ctx.beginPath();
    ctx.arc(this.app.width / 2, this.y, this.cr, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 5;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = gradientColor(
      ctx,
      this.c.r,
      this.c.g,
      this.c.b,
      this.c.a,
      this.app.width / 2,
      this.y,
      this.cr
    );
    ctx.strokeStyle = gradientColor(
      ctx,
      this.c.r,
      this.c.g,
      this.c.b,
      this.c.a,
      this.app.width / 2,
      this.y,
      this.cr + 5
    );
    ctx.beginPath();
    ctx.arc(this.app.width / 2, this.y, this.cr, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  render() {
    // Render line if no recognized text and no input timeout; else, render circle.
    if (!this.app.recognizedText && !this.app.inputTimeout) {
      this.drawLine();
    } else {
      this.drawCircle();
    }
    this.updateAngles();
    this.changeParams();
    this.shrinkCircle();
  }

  changeParams() {
    if (this.app.behavior === 1) {
      this.noiseDist = 30;
      this.noiseX = 100;
      this.noiseY = 100;
    } else if (this.app.behavior === 2) {
      this.noiseDist *= 1.05;
      this.noiseX *= 1.1;
      this.noiseY *= 1.1;
    } else if (this.app.behavior === 3) {
      this.noiseDist *= 0.9;
      this.noiseX *= 0.9;
      this.noiseY *= 0.9;
    }
  }

  shrinkCircle() {
    if (this.cr > 50) {
      this.cr -= 1;
    }
  }
}

//////////////////////////////////////////////
// CanvasApp Class
//////////////////////////////////////////////
const noise3DInstance = createNoise3D();

class CanvasApp {
  constructor(canvasEl, mes2El, listEl) {
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext('2d');
    this.mes2 = mes2El;
    this.list = listEl;
    this.width = (this.canvas.width = window.innerWidth);
    this.height = (this.canvas.height = window.innerHeight);
    this.shapes = [];
    this.shapeCount = 3;
    this.behavior = 0;
    this.startTime = Date.now();
    this.mouseX = null;
    this.mouseY = null;
    // New properties for recognized text and input timeout flag
    this.recognizedText = '';
    this.inputTimeout = false;
    this.ul = this.list.querySelector('ul');
    this.asks = ["I don't like safari."];
    this.asks = [
      "How's the traffic on my route?",
      "Where is the nearest charging station?",
      "Turn on the AC.",
      "Set the temperature to 22°C.",
      "Fold/unfold the side mirrors.",
      "Why is my hazard light on?",
      "Find a podcast on technology.",
      "Adjust seat position.",
      "When is my next service due?",
      "Open/close the windows.",
      "Redial the last number.",
      "Turn on/off interior lights.",
      "Enable driver fatigue alert.",
      "Turn on eco-driving mode.",
      "Check the oil level.",
      "Turn on windshield wipers.",
      "Switch to night mode display.",
      "Report an accident.",
      "Find a parking spot nearby.",
      "Enable auto wipers.",
      "Play my favorite music."
    ];
    this.populateList();
    this.attachLinkEvents();
  }

  populateList() {
    for (let i = 0; i < 15; i++) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = this.asks[Math.floor(Math.random() * this.asks.length)];
      li.appendChild(a);
      this.ul.appendChild(li);
    }
  }

  attachLinkEvents() {
    const links = this.ul.getElementsByTagName('a');
    for (let link of links) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
      });
    }
  }

  initShapes() {
    this.shapes = [];
    for (let i = 0; i < this.shapeCount; i++) {
      const shape = new Shape(this, 0, this.height - this.height / 5, i + 1, noise3DInstance);
      this.shapes.push(shape);
    }
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.initShapes();
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let shape of this.shapes) {
      shape.render();
    }
    this.updateBehavior();
  }

  updateBehavior() {
    const elapsed = Date.now() - this.startTime;
    if (elapsed > 4000 && this.behavior < 1) {
      this.mes2.classList.add('siri');
      this.behavior = 1;
    }
    if (elapsed > 8000 && this.behavior < 2) {
      this.behavior = 2;
    }
    if (elapsed > 8200 && this.behavior < 3) {
      this.behavior = 3;
    }
    if (elapsed > 8400 && this.behavior < 4) {
      this.behavior = 4;
    }
  }
}

//////////////////////////////////////////////
// Main Component with Automatic SSE, Side Pane, and Restart on Circle Click
//////////////////////////////////////////////

  // Function to send a random number to the backend
  const sendRandomNumber = async () => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    console.log("Sending random number:", randomNumber);

    try {
      const response = await fetch("http://localhost:8000/send_random_number", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ number: randomNumber }),
      });

      const data = await response.json();
      console.log("Response from backend:", data);
    } catch (error) {
      console.error("Error sending number to backend:", error);
    }
  };




export default function PrognosBot() {
  const canvasRef = useRef(null);
  const mes2Ref = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate(); // Remove if not using React Router

  const [recognizedText, setRecognizedText] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [error, setError] = useState('');
  const [inputTimeout, setInputTimeout] = useState(false);

  const appRef = useRef(null); // For CanvasApp instance
  const sseRef = useRef(null); // For SSE connection
  const [hasStartedSSE, setHasStartedSSE] = useState(false);
  const [sseStartTime, setSseStartTime] = useState(null);

  // Overlay style: full screen except bottom 25%, with top margin of 3%
  const overlayStyle = {
    position: 'absolute',
    top: '3%',
    left: 0,
    right: 0,
    bottom: '25%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '1.5rem 2rem',
    textAlign: 'left',
    color: '#fff',
    overflowY: 'auto',
    zIndex: 999,
  };

  // Initialize CanvasApp and start SSE automatically
  useEffect(() => {
    const canvasEl = canvasRef.current;
    const mes2El = mes2Ref.current;
    const listEl = listRef.current;
    if (!canvasEl || !mes2El || !listEl) return;

    const app = new CanvasApp(canvasEl, mes2El, listEl);
    appRef.current = app;
    app.initShapes();

    let animId;
    function renderLoop() {
      animId = requestAnimationFrame(() => {
        app.render();
        // Start SSE when behavior reaches 2 and SSE hasn't started yet.
        if (app.behavior >= 2 && !hasStartedSSE) {
          startSSE();
          setHasStartedSSE(true);
          setSseStartTime(Date.now());
        }
        renderLoop();
      });
    }
    renderLoop();

    function onResize() {
      app.resize();
    }
    window.addEventListener('resize', onResize);

    // On canvas click, only trigger if click is inside a circle.
    function onClick(e) {
      // Unlock TTS on first click if needed.
      if (window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.getVoices();
      }
      const rect = canvasEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      let clickedOnCircle = false;
      for (const shape of appRef.current.shapes) {
        const centerX = appRef.current.width / 2;
        const centerY = shape.y;
        const radius = shape.cr;
        const dx = clickX - centerX;
        const dy = clickY - centerY;
        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
          clickedOnCircle = true;
          break;
        }
      }
      // Only restart SSE if click is on a circle and session is complete.
      if (clickedOnCircle && (recognizedText || inputTimeout)) {
        setRecognizedText('');
        setLlmResponse('');
        setInputTimeout(false);
        if (appRef.current) {
          appRef.current.recognizedText = '';
          appRef.current.inputTimeout = false;
        }
        if (listRef.current) {
          listRef.current.style.display = 'none';
          listRef.current.style.opacity = '0';
        }
        // Reset SSE flags for new session.
        setHasStartedSSE(false);
        startSSE();
        setHasStartedSSE(true);
        setSseStartTime(Date.now());
      }
    }
    canvasEl.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (canvasEl) {
        canvasEl.removeEventListener('click', onClick);
      }
    };
  }, [hasStartedSSE, recognizedText, inputTimeout]);

  // Synchronize CanvasApp properties with React state
  useEffect(() => {
    if (appRef.current) {
      appRef.current.recognizedText = recognizedText;
      appRef.current.inputTimeout = inputTimeout;
    }
  }, [recognizedText, inputTimeout]);

  // SSE logic: automatically start listening and receive events
  function startSSE() {
    console.log('Starting SSE automatically...');
    setRecognizedText('');
    setLlmResponse('');
    setError('');
    setInputTimeout(false);

    const sse = new EventSource('http://localhost:8000/stt_query_sse');
    sseRef.current = sse;

    sse.addEventListener('recognized_text', (e) => {
      console.log('recognized_text event:', e.data);
      setRecognizedText(e.data);
    });

    // Combined event: llm_response sends JSON with both text and audio.
    sse.addEventListener('llm_response', (e) => {
      console.log('llm_response event:', e.data);
      try {
        const data = JSON.parse(e.data);
        setLlmResponse(data.text);
        if (data.audio) {
          const audioUrl = `data:audio/wav;base64,${data.audio}`;
          const audioElem = new Audio(audioUrl);
          audioElem.play();
        }
      } catch (err) {
        console.error('Error parsing llm_response:', err);
        setError('Error parsing llm response');
      }
      sse.close();
    });

    sse.addEventListener('error', (e) => {
      console.error('error event:', e.data);
      setError(e.data || 'Unknown SSE error');
      sse.close();
    });

    sse.onmessage = (e) => {
      console.log('default message:', e.data);
    };

    sse.onerror = (err) => {
      console.error('SSE onerror:', err);
      setError('SSE connection error');
      sse.close();
    };

    sse.onclose = () => {
      console.log('SSE connection closed');
      if (!recognizedText) {
        setInputTimeout(true);
      }
    };
  }

  // If no recognized text is received within 10 seconds of SSE start,
  // show the suggestions pane and set inputTimeout to true.
  useEffect(() => {
    if (hasStartedSSE && sseStartTime) {
      const timer = setTimeout(() => {
        if (!recognizedText) {
          if (listRef.current) {
            listRef.current.style.opacity = '1';
            listRef.current.style.display = 'block';
            listRef.current.classList.add('slideUp');
          }
          setInputTimeout(true);
        }
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [hasStartedSSE, sseStartTime, recognizedText]);

  // Optionally hide suggestions pane if recognized text is received
  useEffect(() => {
    if (recognizedText && listRef.current) {
      listRef.current.style.display = 'none';
      listRef.current.style.opacity = '0';
      setInputTimeout(false);
    }
  }, [recognizedText]);

  // Optional TTS using browser speechSynthesis
  function speakText(text) {
    if (!window.speechSynthesis) {
      console.warn('Browser does not support speechSynthesis');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <span className="arrow">&#8592;</span>
      </button>

      {/* Overlay for output: full screen except bottom 25%, left-justified */}
      {(recognizedText || llmResponse) && (
        <div style={overlayStyle}>
          {recognizedText && (
            <AnimatedText text={recognizedText} />
          )}
          {llmResponse && (
            <AnimatedText text={llmResponse} style={{ marginTop: '1rem', color: '#4fc3f7', fontStyle: 'italic' }} />
          )}
        </div>
      )}

      {/* Existing UI for messages & suggestions */}
      <div id="mes2" ref={mes2Ref}>
        <p>Go ahead, I'm listening...</p>
      </div>
      <div id="list" ref={listRef} style={{ display: 'none', opacity: 0 }}>
        <p>Some things you can ask me.</p>
        <ul></ul>
      </div>
      {/* Send Random Number Button */}
      <button className="send-number-button" onClick={sendRandomNumber}>
        Refresh
      </button>

      {/* The Canvas */}
      <canvas ref={canvasRef} />
    </div>
  );
}

