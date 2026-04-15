import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import Throbber from "@/components/Throbber";

export default function ReplayScene({ dnfMode, dsqMode }) {
  const params = new URLSearchParams(window.location.search);
  const replayFile = params.get("file");

  const [isLoading, setIsLoading] = useState(true);
  
  const containerRef = useRef(null);
  const dnfModeRef = useRef(dnfMode);
  const dsqModeRef = useRef(dsqMode);

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  const progressRef = useRef(0);
  const isPlayingRef = useRef(true);
  const speedRef = useRef(1);

  useEffect(() => { dnfModeRef.current = dnfMode; }, [dnfMode]);
  useEffect(() => { dsqModeRef.current = dsqMode; }, [dsqMode]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {

    let app;
    let isMounted = true;
    
    async function fetchReplayWithRetry(url, delay = 500) {
      while (true) {
        try {
          const res = await fetch(url);

          if (res.ok) {
            const buffer = await res.arrayBuffer();

            if (buffer.byteLength < 8) throw new Error("Too small");

            const dv = new DataView(buffer);
            const headerLen = dv.getUint32(0, true);

            if (4 + headerLen > buffer.byteLength) {
              throw new Error("Incomplete file");
            }

            return buffer;
          }
        } catch (err) {
          console.log("Retrying...", err.message);
        }

        await new Promise(r => setTimeout(r, delay));
      }
    }

    async function init() {
      
      let buffer;

      try {
        buffer = await fetchReplayWithRetry(`/${replayFile}`);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
        return;
      }

      if (!isMounted) return;

      const dataView = new DataView(buffer);
      const headerLen = dataView.getUint32(0, true);

      const decoder = new TextDecoder("utf-8");
      const headerString = decoder.decode(new Uint8Array(buffer, 4, headerLen));
      const metadata = JSON.parse(headerString);

      let offset = 4 + headerLen;

      app = new PIXI.Application();

      await app.init({
        resizeTo: window,
        backgroundColor: 0x0b0f1a,
        antialias: true,
        resolution: window.devicePixelRatio * 2,
        autoDensity: true
      });

      if (!isMounted) {
        app.destroy(true, true);
        return;
      }

      app.stage.sortableChildren = true;
      containerRef.current.appendChild(app.canvas);
      setIsLoading(false);

      const trackContainer = new PIXI.Container();
      app.stage.addChild(trackContainer);

      const trackLen = metadata.track_len;

      const trackX = new Float32Array(buffer, offset, trackLen);
      offset += trackLen * 4;

      const trackY = new Float32Array(buffer, offset, trackLen);
      offset += trackLen * 4;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      for (let i = 0; i < trackLen; i++) {
        if (trackX[i] < minX) minX = trackX[i];
        if (trackX[i] > maxX) maxX = trackX[i];
        if (trackY[i] < minY) minY = trackY[i];
        if (trackY[i] > maxY) maxY = trackY[i];
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const padding = 100;

      const scale = Math.min(
        (window.innerWidth - padding * 2) / (maxX - minX),
        (window.innerHeight - padding * 2) / (maxY - minY)
      );

      const tx = x => (x - centerX) * scale;
      const ty = y => (y - centerY) * scale;

      let center = Array.from(trackX)
        .map((x, i) => ({ x: tx(x), y: ty(trackY[i]) }))
        .filter((_, i) => i % 3 === 0);

      if (center.length > 2) {
        const first = center[0];
        const last = center[center.length - 1];
        if (Math.hypot(first.x - last.x, first.y - last.y) < 10) center.pop();
      }

      function catmullRom(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        return {
          x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        };
      }

      const spline = [];
      const segments = center.length;

      for (let i = 0; i < segments; i++) {
        const p0 = center[(i - 1 + segments) % segments];
        const p1 = center[i];
        const p2 = center[(i + 1) % segments];
        const p3 = center[(i + 2) % segments];

        for (let t = 0; t < 1; t += 0.01) {
          spline.push(catmullRom(p0, p1, p2, p3, t));
        }
      }

      const roadWidth = 2;
      const borderWidth = 5;
      const halfRoad = roadWidth / 2;

      const roadVertices = [], roadIndices = [];
      const leftBorderVertices = [], leftBorderIndices = [];
      const rightBorderVertices = [], rightBorderIndices = [];

      for (let i = 0; i < spline.length; i++) {

        const prev = spline[(i - 1 + spline.length) % spline.length];
        const curr = spline[i];
        const next = spline[(i + 1) % spline.length];

        const dx = next.x - prev.x;
        const dy = next.y - prev.y;

        const len = Math.hypot(dx, dy) || 1;

        const nx = -dy / len;
        const ny = dx / len;

        const cx = curr.x;
        const cy = curr.y;

        roadVertices.push(cx + nx * halfRoad, cy + ny * halfRoad);
        roadVertices.push(cx - nx * halfRoad, cy - ny * halfRoad);

        leftBorderVertices.push(cx + nx * (halfRoad + borderWidth), cy + ny * (halfRoad + borderWidth));
        leftBorderVertices.push(cx + nx * halfRoad, cy + ny * halfRoad);

        rightBorderVertices.push(cx - nx * halfRoad, cy - ny * halfRoad);
        rightBorderVertices.push(cx - nx * (halfRoad + borderWidth), cy - ny * (halfRoad + borderWidth));
      }

      function buildIndices(arr, count) {
        for (let i = 0; i < count - 1; i++) {
          const base = i * 2;
          arr.push(base, base + 1, base + 2);
          arr.push(base + 1, base + 3, base + 2);
        }

        const last = (count - 1) * 2;
        arr.push(last, last + 1, 0);
        arr.push(last + 1, 1, 0);
      }

      buildIndices(roadIndices, spline.length);
      buildIndices(leftBorderIndices, spline.length);
      buildIndices(rightBorderIndices, spline.length);

      function createMesh(vertices, indices, color) {
        return new PIXI.Mesh({
          geometry: new PIXI.MeshGeometry({
            positions: new Float32Array(vertices),
            indices: new Uint16Array(indices)
          }),
          texture: PIXI.Texture.WHITE,
          tint: color
        });
      }

      trackContainer.addChild(createMesh(roadVertices, roadIndices, 0x1a1a1a));
      trackContainer.addChild(createMesh(leftBorderVertices, leftBorderIndices, 0xffffff));
      trackContainer.addChild(createMesh(rightBorderVertices, rightBorderIndices, 0xffffff));

      trackContainer.position.set(window.innerWidth / 2, window.innerHeight / 2);
      trackContainer.rotation = (metadata.rotation || 0) * (Math.PI / 180);

      const cars = [];

      let globalRaceStart = Infinity;
      let globalRaceEnd = -Infinity;

      metadata.driver_order.forEach(driverId => {

        const info = metadata.drivers[driverId];
        const n = info.length;

        const rawT = new Float32Array(buffer, offset, n); offset += n * 4;
        const rawX = new Float32Array(buffer, offset, n); offset += n * 4;
        const rawY = new Float32Array(buffer, offset, n); offset += n * 4;

        offset += (n * 4) * 2;

        const pitWindows = info.pit_windows || [];

        if (rawT.length > 0) {
          if (rawT[0] < globalRaceStart) globalRaceStart = rawT[0];
          if (rawT[n - 1] > globalRaceEnd) globalRaceEnd = rawT[n - 1];
        }

        const car = new PIXI.Graphics();

        const radius = 4.5;
        const borderWidthCar = 2;

        let color = info.meta?.teamColor
          ? parseInt(info.meta.teamColor.replace("#", ""), 16)
          : 0xffffff;

        car.circle(0, 0, radius)
          .fill({ color, alpha: 1 })
          .stroke({ width: borderWidthCar, color });

        trackContainer.addChild(car);

        const screenX = new Float32Array(n);
        const screenY = new Float32Array(n);

        for (let i = 0; i < n; i++) {
          screenX[i] = tx(rawX[i]);
          screenY[i] = ty(rawY[i]);
        }

        const status = info.meta?.status || "";

        const pitStart = rawT.length > 0 && rawT[0] > globalRaceStart + 2;

        const dt = rawT.length > 1 ? rawT[1] - rawT[0] : 0.1;

        cars.push({
          id: driverId,
          car,
          tArr: rawT,
          xArr: screenX,
          yArr: screenY,
          pitWindows,
          pitStart,
          wasInPit: false,
          isDNF: status.includes("Did not finish") || status.includes("Retired") || status.includes("Accident"),
          isDSQ: status.includes("Disqualified"),
          currentIndex: 0,
          dt,
          tStart: rawT[0],
          length: rawT.length
        });
      });

      const totalTime = globalRaceEnd - globalRaceStart;
      setDuration(totalTime);

      let lastFrameTime = performance.now();

      app.ticker.add(() => {

        const now = performance.now();
        const deltaSec = (now - lastFrameTime) / 1000;
        lastFrameTime = now;

        if (isPlayingRef.current) {
          let newProgress = progressRef.current + (deltaSec * speedRef.current / totalTime);
          if (newProgress > 1) newProgress = 0;
          progressRef.current = newProgress;
          setProgress(newProgress);
        }

        const elapsed = globalRaceStart + (progressRef.current * totalTime);

        cars.forEach(driver => {

          const { car, xArr, yArr, isDNF, isDSQ, pitWindows } = driver;
          const dnf = dnfModeRef.current;
          const dsq = dsqModeRef.current;

          let inPit = false;

          for (let i = 0; i < pitWindows.length; i++) {
            const start = pitWindows[i][0];
            const end = pitWindows[i][1];
            if (elapsed >= start && elapsed <= end) {
              inPit = true;
              break;
            }
          }

          if (driver.pitStart && elapsed < pitWindows[0][1]) {
            car.visible = false;
            return;
          }

          driver.wasInPit = inPit;

          if (inPit) {
            car.visible = false;
            return;
          }

          car.visible = true;

          const lastTime = driver.tArr[driver.length - 1];

          if (isDNF && elapsed > lastTime) {

            if (dnf === "hide") {
              car.visible = false;
              return;
            }

            car.visible = true;
            car.alpha = dnf === "ghost" ? 0.25 : 1.0;
            car.zIndex = dnf === "ghost" ? 0 : 2;

            car.x = xArr[driver.length - 1];
            car.y = yArr[driver.length - 1];
            return;
          }

          if (isDSQ) {
            if (dsq === "hide") {
              car.visible = false;
              return;
            }

            car.visible = true;
            car.alpha = dsq === "ghost" ? 0.5 : 1.0;
          } else {
            car.visible = true;
            car.alpha = 1.0;
          }

          car.zIndex = 1;

          if (driver.length < 2) return;

          let i0 = Math.floor((elapsed - driver.tStart) / driver.dt);

          if (i0 < 0) i0 = 0;
          if (i0 >= driver.length - 1) i0 = driver.length - 2;

          const i1 = i0 + 1;

          const t0 = driver.tArr[i0];
          const t1 = driver.tArr[i1];

          const alpha = Math.max(0, Math.min(1, (elapsed - t0) / (t1 - t0 || 1)));

          car.x = xArr[i0] + (xArr[i1] - xArr[i0]) * alpha;
          car.y = yArr[i0] + (yArr[i1] - yArr[i0]) * alpha;

          car.rotation = Math.atan2(
            yArr[i1] - yArr[i0],
            xArr[i1] - xArr[i0]
          );

        });

      });

    }

    init();

    return () => {
      isMounted = false;
      if (app) app.destroy(true, { children: true });
    };

  }, [replayFile]);

  if (!replayFile) {
    return (
      <div style={{
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "black"
      }}>
        No replay file provided in URL
      </div>
    );
  }

  /*if (isLoading) {
    return <Throbber text="Loading Replay..." />;
  }*/

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {isLoading && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10
        }}>
          <Throbber text="Loading Replay..." />
        </div>
      )}

      <div style={{
        position: "absolute",
        bottom: 40,
        left: "10%",
        right: "10%",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        background: "rgba(11,15,26,0.8)",
        padding: "15px 25px",
        borderRadius: "12px"
      }}>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: "#E10600",
            color: "white",
            border: "none",
            padding: "8px 20px",
            borderRadius: "6px"
          }}
        >
          {isPlaying ? "PAUSE" : "PLAY"}
        </button>

        <select
          value={speed}
          onChange={e => setSpeed(parseFloat(e.target.value))}
          style={{
            background: "#111",
            color: "white",
            borderRadius: "6px",
            padding: "6px"
          }}
        >
          <option value={0.25}>0.25×</option>
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={2}>2×</option>
          <option value={4}>4×</option>
        </select>

        <input
          type="range"
          min="0"
          max="1"
          step="0.0001"
          value={progress}
          onChange={e => {
            const val = parseFloat(e.target.value);
            progressRef.current = val;
            setProgress(val);
          }}
          style={{ flex: 1 }}
        />

        <span style={{ color: "white", fontFamily: "monospace" }}>
          {formatTime(progress * duration)} / {formatTime(duration)}
        </span>

      </div>
    </div>
  );
}

function formatTime(totalSeconds) {

  if (isNaN(totalSeconds)) return "00:00.000";

  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds % 1) * 1000);

  return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}.${ms.toString().padStart(3,"0")}`;
}