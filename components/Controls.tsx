import React from 'react';
import { ShapeTemplate } from '../types';
import { Heart, Flower, Globe, Sparkles, Video, VideoOff } from 'lucide-react';
import clsx from 'clsx';

interface ControlsProps {
  currentTemplate: ShapeTemplate;
  onTemplateChange: (t: ShapeTemplate) => void;
  currentColor: string;
  onColorChange: (c: string) => void;
  isCameraActive: boolean;
  handDetected: boolean;
}

const COLORS = [
  '#FF3366', // Pink/Red
  '#33CCFF', // Cyan
  '#FFCC00', // Gold
  '#CC33FF', // Purple
  '#33FF99', // Green
  '#FFFFFF'  // White
];

const TEMPLATES = [
  { id: ShapeTemplate.HEART, icon: Heart, label: 'Heart' },
  { id: ShapeTemplate.FLOWER, icon: Flower, label: 'Flower' },
  { id: ShapeTemplate.SATURN, icon: Globe, label: 'Saturn' },
  { id: ShapeTemplate.FIREWORKS, icon: Sparkles, label: 'Fireworks' },
];

const Controls: React.FC<ControlsProps> = ({
  currentTemplate,
  onTemplateChange,
  currentColor,
  onColorChange,
  isCameraActive,
  handDetected
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      
      {/* Header / Status - Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
            Gesture Particles
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {isCameraActive 
              ? (handDetected ? "Hands detected • Pinch/Spread to interact" : "Looking for hands...") 
              : "Waiting for camera..."}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {isCameraActive ? (
            <Video className="w-4 h-4 text-green-400" />
          ) : (
            <VideoOff className="w-4 h-4 text-red-400" />
          )}
          <span className="text-xs font-medium text-white/80">
            {isCameraActive ? "Camera On" : "Camera Off"}
          </span>
        </div>
      </div>

      {/* Templates - Left Vertical Sidebar */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="flex flex-col gap-3 bg-black/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
          {TEMPLATES.map((t) => {
            const Icon = t.icon;
            const isActive = currentTemplate === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTemplateChange(t.id)}
                className={clsx(
                  "flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isActive ? "bg-white/10 text-white shadow-inner" : "text-white/50 hover:text-white hover:bg-white/5"
                )}
                title={t.label}
              >
                <div className={clsx(
                  "absolute inset-0 opacity-20 transition-opacity duration-300",
                  isActive ? "bg-gradient-to-tr from-blue-500 to-purple-500 opacity-100" : "opacity-0"
                )} />
                <Icon className={clsx("w-6 h-6 mb-1 relative z-10", isActive && "text-white")} />
                <span className="text-[10px] font-medium uppercase tracking-wide relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors - Right Vertical Sidebar */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="flex flex-col gap-4 bg-black/60 backdrop-blur-xl px-3 py-4 rounded-full border border-white/10 shadow-xl">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={clsx(
                "w-6 h-6 rounded-full transition-transform duration-200 focus:outline-none ring-2 ring-offset-2 ring-offset-black",
                currentColor === c ? "scale-125 ring-white" : "scale-100 ring-transparent hover:scale-110"
              )}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Controls;