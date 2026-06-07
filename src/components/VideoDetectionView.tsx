/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Target, Cpu, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { SAMPLE_VIDEOS, GENERAL_YOLO_CLASSES } from '../data/mockDetections';
import { Detection, HistoryRecord } from '../types/yolo';

interface VideoDetectionViewProps {
  onAddHistory: (record: HistoryRecord) => void;
  selectedModel: 'YOLOv8n' | 'YOLOv8s';
}

export default function VideoDetectionView({ onAddHistory, selectedModel }: VideoDetectionViewProps) {
  const videoData = SAMPLE_VIDEOS[0];
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [cumulativeUniqueObjects, setCumulativeUniqueObjects] = useState<number>(3);
  
  // Track history coordinate caches for drawing path traces
  const [trackHistories, setTrackHistories] = useState<{ [id: number]: { x: number; y: number }[] }>({
    10: [{ x: 10, y: 35 }],
    11: [{ x: 45, y: 48 }],
    12: [{ x: 68, y: 22 }]
  });

  const [activeFrameDetections, setActiveFrameDetections] = useState<Detection[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and clean up stateful frame intervals
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % videoData.detectionsPerFrame.length;
          
          // Re-render path traces dynamically
          const rawFrameObjects = videoData.detectionsPerFrame[nextIndex];
          updatePathTracks(rawFrameObjects, nextIndex);
          return nextIndex;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  // Hook to calculate frame objects whenever frame index flips
  useEffect(() => {
    const rawObjects = videoData.detectionsPerFrame[currentFrameIndex];
    // Map simulated objects to structural Detections
    const mapped: Detection[] = rawObjects.map((obj, idx) => ({
      id: `${obj.id}_${idx}`,
      label: obj.label,
      confidence: obj.confidence,
      bbox: obj.bbox,
      trackingId: obj.trackingId,
      color: obj.color
    }));
    setActiveFrameDetections(mapped);

    // Calculate unique tracked objects across frames to fulfill the "Prevent duplicate counting" constraint
    const uniqueIdsNow = new Set(rawObjects.map(o => o.trackingId));
    setCumulativeUniqueObjects(prev => {
      const merged = new Set([...Array.from({ length: prev }).map((_, i) => 10 + i), ...Array.from(uniqueIdsNow)]);
      return merged.size;
    });

  }, [currentFrameIndex]);

  // Append new frame coordinate offsets to draw vector trajectories
  const updatePathTracks = (frameObjects: typeof videoData.detectionsPerFrame[0], frameIdx: number) => {
    setTrackHistories(prev => {
      const updated = { ...prev };
      frameObjects.forEach(obj => {
        const tid = obj.trackingId;
        const coord = { x: obj.bbox.x + obj.bbox.width / 2, y: obj.bbox.y + obj.bbox.height / 2 };
        
        if (!updated[tid]) {
          updated[tid] = [];
        }
        
        // Push historical coordinates, max 6 frames back
        const currentPath = [...updated[tid], coord];
        if (currentPath.length > 6) {
          currentPath.shift();
        }
        updated[tid] = currentPath;
      });
      return updated;
    });
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleResetSim = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
    setCumulativeUniqueObjects(3);
    setTrackHistories({
      10: [{ x: 10, y: 35 }],
      11: [{ x: 45, y: 48 }],
      12: [{ x: 68, y: 22 }]
    });
    // Record baseline session log
    saveBatchInference();
  };

  const saveBatchInference = () => {
    onAddHistory({
      id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
      fileName: 'Highway Traffic Flow Stream',
      fileType: 'video',
      detections: { 'car': 3, 'truck': 1 },
      avgConfidence: 0.89,
      totalCount: 4,
      modelUsed: selectedModel
    });
  };

  // Run automatically on first render
  useEffect(() => {
    saveBatchInference();
  }, []);

  return (
    <div id="video_tracking_workspace" className="grid grid-cols-1 lg:grid-cols-4 gap-6 select-none font-sans leading-relaxed">
      
      {/* 1. TRACKING SCORECARD / TELEMETRY BOARD */}
      <div id="tracking_telemetry_sidebar" className="lg:col-span-1 border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-6">
        <div>
          <h2 className="font-display font-medium text-white tracking-widest font-mono text-xs uppercase">ByteTrack Metrics</h2>
          <p className="text-[10px] text-zinc-500 mt-1">Simulates frame-spanning bounding association arrays.</p>
        </div>

        <div className="space-y-4">
          {/* Metric Box: Cumulative Objects Found */}
          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Cumulative Tracks</span>
            <span id="cumulative_tracks_counter" className="text-3xl font-extrabold text-emerald-400 font-display">
              {cumulativeUniqueObjects}
            </span>
            <p className="text-[10px] text-zinc-400 mt-1">Unique entities registered (zero duplicates).</p>
          </div>

          {/* Metric Box: Current active tracks */}
          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Active In-Frame</span>
            <span id="active_in_frame_counter" className="text-2xl font-bold text-blue-400 font-display">
              {activeFrameDetections.length}
            </span>
            <p className="text-[10px] text-zinc-400 mt-1">Tracking labels inside frame bounds.</p>
          </div>

          {/* Controller tools */}
          <div className="pt-3 border-t border-zinc-800/70 space-y-2">
            <div className="flex gap-2">
              <button
                id="play_pause_sim_btn"
                onClick={handleTogglePlay}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isPlaying 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow shadow-emerald-500/20'
                }`}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                {isPlaying ? 'Pause' : 'Start Track'}
              </button>
              
              <button
                id="reset_sim_btn"
                onClick={handleResetSim}
                className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-all cursor-pointer"
                title="Reset simulation parameters"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-[10px] text-zinc-500 pt-1 text-center font-mono">Frame interval is pegged at 1fps.</p>
          </div>
        </div>

        {/* ByteTrack details explanation */}
        <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 space-y-1.5">
          <h4 className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5" /> Track Association Method
          </h4>
          <p className="text-[11px] text-zinc-400 leading-normal font-sans">
            ByteTrack associates high-score and low-score boxes sequentially. Linear Kalman filters match predictions across frames to preserve coordinate identities even under occlusion.
          </p>
        </div>
      </div>

      {/* 2. MAIN ACTIVE MONITOR CANVAS */}
      <div id="video_monitor_screen" className="lg:col-span-3 space-y-6">
        <div className="border border-zinc-800 rounded-2xl bg-zinc-950/60 p-5 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="font-display font-medium text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" /> YOLOv8 + ByteTrack Cinematic Monitor
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Iterative track alignment displaying trajectory histories.</p>
            </div>

            {/* Simulated frame index */}
            <div className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              Telemetry Cache: <strong className="text-emerald-400">Frame {currentFrameIndex + 1}/5</strong>
            </div>
          </div>

          {/* Active Canvas Video Display Container */}
          <div className="relative w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 aspect-video flex items-center justify-center">
            {/* Standard preloaded image background representing the frame */}
            <img 
              src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=1200" 
              alt="Highway Lane View"
              className="object-cover w-full h-full brightness-[0.70] contrast-[1.05]"
            />

            {/* Path Trajectory Vectors Overlays */}
            <svg className="absolute inset-0 z-20 pointer-events-none w-full h-full">
              {Object.entries(trackHistories).map(([idStr, rawPoints]) => {
                const id = parseInt(idStr);
                const points = rawPoints as { x: number; y: number }[];
                const firstColor = id === 10 ? '#10b981' : id === 11 ? '#ec4899' : '#3b82f6';
                if (points.length < 2) return null;
                
                return (
                  <g key={`path-${id}`}>
                    {/* SVG polyline mapping historical paths */}
                    <polyline
                      fill="none"
                      stroke={firstColor}
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      points={points.map(p => `${p.x}%,${p.y}%`).join(' ')}
                    />
                    {points.map((p, idx) => (
                      <circle
                        key={`pt-${id}-${idx}`}
                        cx={`${p.x}%`}
                        cy={`${p.y}%`}
                        r={idx === points.length - 1 ? '4' : '2'}
                        fill={firstColor}
                      />
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* Bounding box overlays */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {activeFrameDetections.map((det) => (
                <div
                  key={det.id}
                  className="absolute border-2 font-mono flex flex-col justify-start align-top transition-all duration-[800ms] ease-out"
                  style={{
                    left: `${det.bbox.x}%`,
                    top: `${det.bbox.y}%`,
                    width: `${det.bbox.width}%`,
                    height: `${det.bbox.height}%`,
                    borderColor: det.color || '#10b981'
                  }}
                >
                  {/* Bounding Label box */}
                  <span
                    className="absolute -top-5.5 left-[-2px] text-[9px] font-bold text-zinc-950 px-1.5 py-0.5 whitespace-nowrap rounded-t"
                    style={{ backgroundColor: det.color || '#10b981' }}
                  >
                    ID: {det.trackingId} | {det.label} {Math.round(det.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end items-center">
            <span className="text-[10px] font-mono text-zinc-500">Video Simulation loop uses sample assets</span>
            <button
              id="trigger_simulate_frame_advance_btn"
              onClick={() => setCurrentFrameIndex(prev => (prev + 1) % videoData.detectionsPerFrame.length)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-xs text-zinc-300 font-mono transition-all cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Step Frame
            </button>
          </div>
        </div>

        {/* CUMULATIVE LIST TABLE */}
        <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> ByteTrack Kalman-Filter Ledger
          </h4>

          <div className="overflow-x-auto rounded-lg border border-zinc-800 font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-500 font-normal">
                  <th className="p-2.5">Track ID</th>
                  <th className="p-2.5">Class Label</th>
                  <th className="p-2.5">Confidence Average</th>
                  <th className="p-2.5">Tracking Frame Spread</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/10">
                <tr className="hover:bg-zinc-900/35 text-zinc-300">
                  <td className="p-2.5 font-bold text-emerald-400">#10</td>
                  <td className="p-2.5 capitalize">car</td>
                  <td className="p-2.5">95.6%</td>
                  <td className="p-2.5">Frame 1 to Frame 5 (Continuous)</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">Active</span></td>
                </tr>
                <tr className="hover:bg-zinc-900/35 text-zinc-300">
                  <td className="p-2.5 font-bold text-emerald-400">#11</td>
                  <td className="p-2.5 capitalize">car</td>
                  <td className="p-2.5">93.4%</td>
                  <td className="p-2.5">Frame 1 to Frame 5 (Continuous)</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">Active</span></td>
                </tr>
                <tr className="hover:bg-zinc-900/35 text-zinc-300">
                  <td className="p-2.5 font-bold text-emerald-400">#12</td>
                  <td className="p-2.5 capitalize">truck</td>
                  <td className="p-2.5">89.8%</td>
                  <td className="p-2.5">Frame 1 to Frame 5 (Continuous)</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">Active</span></td>
                </tr>
                <tr className="hover:bg-zinc-900/35 text-zinc-300">
                  <td className="p-2.5 font-bold text-emerald-400">#13</td>
                  <td className="p-2.5 capitalize">car</td>
                  <td className="p-2.5">80.5%</td>
                  <td className="p-2.5">Frame 2 to Frame 5 (Occluded/Re-acquired)</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
