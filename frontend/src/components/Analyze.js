import { useEffect, useRef } from "react";

const WaveAnimation = () => {
  const canvasRef = useRef(null);
  let animationProgress = 1; 

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    const lines = [];
    const lineCount = 4;
    const waveHeight = 50;
    const waveWidth = canvas.width;
    const speed = 0.003;

    // Initialize wave lines
    for (let i = 0; i < lineCount; i++) {
      lines.push({
        frequency: 0.015 + i * 0.005, // Wave frequency
        amplitude: waveHeight - i * 2.5, // Wave height
        phase: i * Math.PI / 200, // Phase offset
        verticalOffset: i * 70, // Vertical spread effect
      });
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationProgress += speed;

      lines.forEach((line, index) => {
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.setLineDash(animationProgress < 1 ? [8, 4] : []); // Transition from dashed to solid
        ctx.strokeStyle = `rgba(138, 103, 187, ${0.7 - index * 0.03})`;

        for (let x = 0; x <= waveWidth; x += 2) {
          const yOffset = (line.verticalOffset * x) / waveWidth;
          const y =
            canvas.height / 2 +
            yOffset +
            Math.sin(x * line.frequency + animationProgress + line.phase) *
              line.amplitude;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        ctx.stroke();

        // Animate dot along the path
        const dotX = waveWidth * ((animationProgress + line.phase) % 1);
        const yOffset = (line.verticalOffset * dotX) / waveWidth;
        const dotY =
          canvas.height / 2 +
          yOffset +
          Math.sin(dotX * line.frequency + animationProgress + line.phase) *
            line.amplitude;

        ctx.beginPath();
        ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(80, 162, 171, 1)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup function to stop animation when the component unmounts
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        margin: "0",
        background: "linear-gradient(270deg, #59308a, #3a1961)",
        overflow: "hidden",
        position: "relative",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      {/* Canvas for the wave animation */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          backgroundColor: "transparent",
          position: "absolute",
          left: 0,
          right: 0,
          width: "100vw",
          height: "100vh",
        }}
      />

      {/* Analyzing Data Text */}
      <h1
        style={{
          position: "absolute",
          color: "#fff",
          fontSize: "32px",
          fontWeight: "bold",
          textShadow: "0px 0px 10px rgba(255, 255, 255, 0.8)",
          animation: "fadeInOut 2s infinite ease-in-out",
          top: "40%",
        }}
      >
        Analyzing data...
      </h1>

      {/* Vehicle ID Text */}
      <h2
        style={{
          position: "absolute",
          color: "#fff",
          fontSize: "24px",
          fontWeight: "bold",
          textShadow: "0px 0px 10px rgba(255, 255, 255, 0.8)",
          animation: "fadeInOut 2s infinite ease-in-out",
          top: "50%", // Positioned below "Analyzing data..."
        }}
      >
        Vehicle: Nickname
      </h2>

      {/* CSS for Fade-In and Fade-Out Animation */}
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0.2; }
            50% { opacity: 1; }
            100% { opacity: 0.2; }
          }
        `}
      </style>
    </div>
  );
};

export default WaveAnimation;
