import { HandMetrics } from '../types';

declare global {
  interface Window {
    Hands: any;
  }
}

export class HandTrackingService {
  private hands: any = null;
  private videoElement: HTMLVideoElement | null = null;
  private onResultsCallback: (metrics: HandMetrics) => void = () => {};

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Ensure the global Hands class is available
    if (!window.Hands) {
      console.error("MediaPipe Hands script not loaded.");
      return;
    }

    this.hands = new window.Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.hands.onResults(this.onResults);
  }

  public setCallback(cb: (metrics: HandMetrics) => void) {
    this.onResultsCallback = cb;
  }

  public async start(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Browser API navigator.mediaDevices.getUserMedia not available");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      this.videoElement.srcObject = stream;
      
      await new Promise<void>((resolve) => {
        if (this.videoElement!.readyState >= 2) {
           resolve();
        } else {
           this.videoElement!.onloadeddata = () => resolve();
        }
      });

      await this.videoElement.play();
      
      // Start the detection loop
      this.detectFrame();

    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  }

  private detectFrame = async () => {
    if (!this.videoElement || !this.hands) return;

    if (this.videoElement.paused || this.videoElement.ended) return;

    try {
       await this.hands.send({ image: this.videoElement });
    } catch (e) {
       console.error("MediaPipe error:", e);
    }

    requestAnimationFrame(this.detectFrame);
  }

  private onResults = (results: any) => {
    let metrics: HandMetrics = {
      isPresent: false,
      tension: 0,
      centerX: 0,
      centerY: 0
    };

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      metrics.isPresent = true;
      const landmarks = results.multiHandLandmarks;

      if (landmarks.length === 2) {
        // Two hands: Calculate distance between palms (index 0 - Wrist)
        const leftHand = landmarks[0][0];
        const rightHand = landmarks[1][0];
        
        // Distance roughly 0 to 1 in normalized coords
        const dx = leftHand.x - rightHand.x;
        const dy = leftHand.y - rightHand.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Map distance to tension: Closer = 0, Further = 1
        // Typical range is 0.1 to 0.8 depending on camera distance
        metrics.tension = Math.min(Math.max((dist - 0.1) * 2, 0), 1);

        metrics.centerX = ((leftHand.x + rightHand.x) / 2 - 0.5) * 2; // -1 to 1
        metrics.centerY = -((leftHand.y + rightHand.y) / 2 - 0.5) * 2; // Invert Y for 3D
      } else {
        // One hand: Calculate open/closed state (Pinch between Thumb and Index)
        const hand = landmarks[0];
        const thumbTip = hand[4];
        const indexTip = hand[8];
        const dx = thumbTip.x - indexTip.x;
        const dy = thumbTip.y - indexTip.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Pinch (closed) = 0, Open = 1
        // Dist range approx 0.02 (touching) to 0.2 (open)
        metrics.tension = Math.min(Math.max((dist - 0.02) * 6, 0), 1);
        
        metrics.centerX = (hand[9].x - 0.5) * 2;
        metrics.centerY = -(hand[9].y - 0.5) * 2;
      }
    }

    this.onResultsCallback(metrics);
  };
}

export const handTrackingService = new HandTrackingService();