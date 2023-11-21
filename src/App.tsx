"use client";

import { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

export const App = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    ) {
      startVideo();
      loadModels();
    } else {
      console.error(
        "getUserMedia is not supported in this browser or under this protocol."
      );
    }
  }, []);

  const startVideo = () => {
    // const constraints = {
    // 	video: {
    // 		width: { ideal: 1280 },
    // 		height: { ideal: 720 },
    // 	},
    // };
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((currentStream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = currentStream;
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });
    } else {
      console.error("getUserMedia not supported in this browser.");
    }
  };

  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("models");
    await faceapi.nets.faceExpressionNet.loadFromUri("models");
    faceMyDetect();
  };

  const faceMyDetect = () => {
    setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        const displaySize = { width: 940, height: 650 };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        const context = canvasRef.current.getContext("2d");

        if (context) {
          context.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceExpressions(
            canvasRef.current,
            resizedDetections
          );
        }
      }
    }, 1000);
  };

  return (
    <div className="container">
      <div className="myapp">
        <div className="appvideo">
          <video
            crossOrigin="anonymous"
            ref={videoRef}
            autoPlay
            playsInline
            // width={400}
            height={700}
          ></video>
        </div>
        <canvas
          ref={canvasRef}
          width={400}
          height={600}
          className="appcanvas"
        />
        <div className="app-footer">
          <div className="title-wrap">
            <div className="first-letter">
              <h2 className="green-title">Welcome, Lukman </h2>
            </div>
            <div>
              <h2 className="white-title">Lukman Hanif Akbari</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
