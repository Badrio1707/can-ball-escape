import { useEffect, useRef } from "react";

export default function EscapeSimulation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const center = {
      x: canvas.width / 2,
      y: canvas.height / 2,
    };

    let level = 1;

    let circleRadius = 180;

    let gapAngle = Math.random() * Math.PI * 2;
    let gapSize = 0.45;

    const ball = {
      x: center.x,
      y: center.y,
      radius: 12,
      vx: 4,
      vy: 3,
      color: "#00ffff",
    };

    const trail = [];

    function nextLevel() {
      level++;

      circleRadius = Math.max(90, 180 - level * 2);

      gapAngle = Math.random() * Math.PI * 2;

      ball.x = center.x;
      ball.y = center.y;

      const colors = ["#00ffff", "#ff00ff", "#00ff00", "#ffff00", "#ff5500"];

      ball.color = colors[Math.floor(Math.random() * colors.length)];
    }

    function drawCircle() {
      ctx.beginPath();

      ctx.lineWidth = 10;
      ctx.strokeStyle = "#ffffff";

      ctx.shadowBlur = 20;
      ctx.shadowColor = "#ffffff";

      const startAngle = gapAngle + gapSize / 2;
      const endAngle = gapAngle + Math.PI * 2 - gapSize / 2;

      ctx.arc(center.x, center.y, circleRadius, startAngle, endAngle);

      ctx.stroke();
    }

    function drawTrail() {
      trail.forEach((point, index) => {
        const alpha = index / trail.length;

        ctx.beginPath();

        ctx.fillStyle = point.color
          .replace(")", `, ${alpha})`)
          .replace("rgb", "rgba");

        // fallback neon
        ctx.fillStyle = `rgba(0,255,255,${alpha * 0.5})`;

        ctx.shadowBlur = 10;
        ctx.shadowColor = point.color;

        ctx.arc(point.x, point.y, ball.radius * alpha, 0, Math.PI * 2);

        ctx.fill();
      });
    }

    function drawBall() {
      ctx.beginPath();

      ctx.fillStyle = ball.color;

      ctx.shadowBlur = 20;
      ctx.shadowColor = ball.color;

      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);

      ctx.fill();
    }

    function updateBall() {
      trail.push({
        x: ball.x,
        y: ball.y,
        color: ball.color,
      });

      if (trail.length > 25) {
        trail.shift();
      }

      ball.x += ball.vx;
      ball.y += ball.vy;

      const dx = ball.x - center.x;
      const dy = ball.y - center.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      let angle = Math.atan2(dy, dx);

      if (angle < 0) {
        angle += Math.PI * 2;
      }
      const TWO_PI = Math.PI * 2;

      let start = (gapAngle - gapSize / 2 + TWO_PI) % TWO_PI;

      let end = (gapAngle + gapSize / 2 + TWO_PI) % TWO_PI;

      let inGap = false;

      if (start < end) {
        inGap = angle >= start && angle <= end;
      } else {
        inGap = angle >= start || angle <= end;
      }

      if (distance + ball.radius >= circleRadius - 4) {
        // ESCAPE
        if (inGap) {
          nextLevel();
          return;
        }

        // NORMAL VECTOR
        const normalX = dx / distance;
        const normalY = dy / distance;

        // REFLECT
        const dot = ball.vx * normalX + ball.vy * normalY;

        ball.vx -= 2 * dot * normalX;
        ball.vy -= 2 * dot * normalY;

        // ADD RANDOMNESS
        ball.vx += (Math.random() - 0.5) * 0.8;
        ball.vy += (Math.random() - 0.5) * 0.8;

        // SPEED NORMALIZATION
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

        const targetSpeed = 5;

        ball.vx = (ball.vx / speed) * targetSpeed;
        ball.vy = (ball.vy / speed) * targetSpeed;

        // PUSH INSIDE
        ball.x = center.x + normalX * (circleRadius - ball.radius - 3);

        ball.y = center.y + normalY * (circleRadius - ball.radius - 3);
      }
    }

    function animate() {
      requestAnimationFrame(animate);

      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, width, height);

      drawCircle();

      updateBall();

      const levelText = document.getElementById("level-text");

      if (levelText) {
        levelText.innerText = `Level ${level}`;
      }

      drawTrail();

      drawBall();
      gapAngle += 0.01;

      if (gapAngle > Math.PI * 2) {
        gapAngle = 0;
      }
    }

    animate();

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;

      const size = Math.min(width, height) * 0.7;

      canvas.width = size;
      canvas.height = size;

      center.x = canvas.width / 2;
      center.y = canvas.height / 2;
    }

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          color: "#ffffff",
          fontSize: "24px",
          margin: 0,
          marginBottom: "10px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          textShadow: "0 0 20px #ffffff",
        }}
      >
        Can The Ball Escape?
      </h1>

      <p
        id="level-text"
        style={{
          color: "#00ffff",
          fontSize: "28px",
          marginTop: 0,
          marginBottom: "30px",
          fontWeight: "bold",
          textShadow: "0 0 20px #00ffff",
        }}
      >
        Level 1
      </p>

      <canvas
        ref={canvasRef}
        style={{
          width: "700px",
          height: "700px",
          maxWidth: "90vw",
          maxHeight: "70vh",
          display: "block",
        }}
      />
    </div>
  );
}
