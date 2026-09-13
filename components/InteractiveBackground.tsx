"use client";

import { useEffect, useRef } from "react";

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const pointer = { x: -1000, y: -1000, active: false };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(58, Math.max(26, Math.floor((width * height) / 26000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: (i * 97.13) % width,
        y: (i * 53.71) % height,
        vx: ((i % 5) - 2) * 0.08,
        vy: (((i + 2) % 5) - 2) * 0.08,
        r: 1.4 + (i % 3) * 0.45,
      }));
    };

    const setPointer = (x: number, y: number) => {
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    };

    const onMove = (event: PointerEvent) => setPointer(event.clientX, event.clientY);
    const onLeave = () => { pointer.active = false; };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 145) {
            ctx.strokeStyle = `rgba(21,94,239,${0.035 + (1 - dist / 145) * 0.06})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(21,94,239,0.12)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;

        if (pointer.active) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130 && dist > 0) {
            const force = (130 - dist) / 130;
            node.x -= (dx / dist) * force * 0.35;
            node.y -= (dy / dist) * force * 0.35;
          }
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            ctx.strokeStyle = `rgba(21,94,239,${0.025 + (1 - dist / 150) * 0.08})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const near = pointer.active && Math.hypot(pointer.x - a.x, pointer.y - a.y) < 120;
        ctx.fillStyle = near ? "rgba(21,94,239,0.28)" : "rgba(21,94,239,0.12)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, near ? a.r + 1 : a.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (pointer.active) {
        const radius = 105 + Math.sin(frame / 14) * 8;
        const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
        gradient.addColorStop(0, "rgba(21,94,239,0.055)");
        gradient.addColorStop(1, "rgba(21,94,239,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      frame += 1;
      frame = window.requestAnimationFrame(draw);
    };

    if (reduceMotion.matches) {
      drawStatic();
    } else {
      frame = window.requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (!reduceMotion.matches) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="interactiveBackground" />;
}
