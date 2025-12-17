"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = auto
 const token = localStorage.getItem("token")
 const videoId = useParams()
  useEffect(() => {
    if (!src || !videoRef.current) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        autoStartLoad: true,
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        maxBufferHole: 1,
      });

      hls.loadSource(src);
      hlsRef.current = hls;

      setTimeout(() => hls.attachMedia(videoRef.current), 50);

      // Collect available quality levels
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hls.levels);
      });

      // Handle errors
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => hls.destroy();
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
    }
  }, [src]);

  // Manual quality selection
  const handleQualityChange = (levelIndex) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex; // -1 = auto
    setCurrentLevel(levelIndex);
    console.log("HLS levels:", levelIndex);

  };
 

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        controls
        preload="metadata"
        crossOrigin="anonymous"
        className="w-full max-h-96 bg-black rounded-xl"
      />

      {levels.length > 1 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-md p-1 flex flex-col items-end">
          <select
            value={currentLevel}
            onChange={(e) => handleQualityChange(Number(e.target.value))}
            className="bg-black text-white rounded px-1"
          >
            <option value={-1}>Auto</option>
            {levels.map((level, index) => (
              <option key={index} value={index}>
                {level.height}p
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

