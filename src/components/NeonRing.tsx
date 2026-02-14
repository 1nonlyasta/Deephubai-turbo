// src/components/NeonRing.tsx
import React, { useEffect, useRef } from "react";

interface NeonRingProps {
    focus?: boolean;
}

export default function NeonRing({ focus = false }: NeonRingProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const focusRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext("webgl", { alpha: true });
        if (!gl) return;

        const resize = () => {
            const size = 420;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener("resize", resize);

        const vertexSrc = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

        const fragmentSrc = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_focus;

      float ring(vec2 uv, float r, float w) {
        float d = abs(length(uv) - r);
        return smoothstep(w, 0.0, d);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;

        float t = u_time * 0.8;
        float wave = sin(uv.y * 18.0 + t * 2.5) * 0.015 * (0.4 + u_focus);
        uv.x += wave;

        float pulse = mix(1.0, 1.35, u_focus);

        float glow =
          ring(uv, 0.34 + 0.015 * sin(t), 0.009) +
          ring(uv, 0.42 + 0.015 * cos(t * 1.2), 0.014);

        vec3 color = vec3(0.18, 0.62, 1.0) * glow * pulse * 2.6;
        gl_FragColor = vec4(color, glow);
      }
    `;

        const compile = (type: number, src: string) => {
            const s = gl.createShader(type);
            if (!s) return null;
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
        };

        const program = gl.createProgram();
        if (!program) return;
        const vertexShader = compile(gl.VERTEX_SHADER, vertexSrc);
        const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSrc);
        if (!vertexShader || !fragmentShader) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW
        );

        const posLoc = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const timeLoc = gl.getUniformLocation(program, "u_time");
        const resLoc = gl.getUniformLocation(program, "u_res");
        const focusLoc = gl.getUniformLocation(program, "u_focus");

        const start = performance.now();

        const render = (now: number) => {
            const t = (now - start) * 0.001;
            focusRef.current += ((focus ? 1 : 0) - focusRef.current) * 0.08;

            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform1f(timeLoc, t);
            gl.uniform2f(resLoc, canvas.width, canvas.height);
            gl.uniform1f(focusLoc, focusRef.current);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            rafRef.current = requestAnimationFrame(render);
        };

        rafRef.current = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
            gl.deleteProgram(program);
        };
    }, [focus]);

    return <canvas ref={canvasRef} className="neon-canvas" />;
}
