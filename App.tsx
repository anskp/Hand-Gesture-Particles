import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ParticleSystem from './components/ParticleSystem';
import Controls from './components/Controls';
import { ShapeTemplate, HandMetrics } from './types';
import { handTrackingService } from './services/handTracking';

const App: React.FC = () => {
  const [template, setTemplate] = useState<ShapeTemplate>(ShapeTemplate.HEART);
  const [color, setColor] = useState<string>('#FF3366');
  const [cameraActive, setCameraActive] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Use a ref for hand metrics to avoid React re-renders on every frame (60fps performance)
  const handMetricsRef = useRef<HandMetrics>({
    isPresent: false,
    tension: 0,
    centerX: 0,
    centerY: 0
  });

  useEffect(() => {
    // Start camera and tracking
    const startTracking = async () => {
      if (videoRef.current) {
        try {
          await handTrackingService.start(videoRef.current);
          setCameraActive(true);
          
          handTrackingService.setCallback((metrics) => {
            // Update ref for the 3D loop
            handMetricsRef.current = metrics;
            // Update state for UI feedback (debounced or simple boolean)
            setHandDetected(metrics.isPresent);
          });
        } catch (error) {
          console.error("Failed to start hand tracking:", error);
        }
      }
    };
    
    startTracking();
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Hidden Video Element for MediaPipe */}
      <video
        ref={videoRef}
        className="hidden absolute top-0 left-0 w-px h-px opacity-0"
        playsInline
        muted
      />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 2]}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          
          <ParticleSystem 
            template={template} 
            color={color} 
            handMetrics={handMetricsRef} 
          />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            rotateSpeed={0.5} 
            autoRotate={!handDetected}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <Controls
        currentTemplate={template}
        onTemplateChange={setTemplate}
        currentColor={color}
        onColorChange={setColor}
        isCameraActive={cameraActive}
        handDetected={handDetected}
      />
    </div>
  );
};

export default App;