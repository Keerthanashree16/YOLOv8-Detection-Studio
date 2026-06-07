/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, CameraOff, Play, Pause, Compass, Sliders, AlertTriangle } from 'lucide-react';
import { WEBCAM_SIMULATED_OBJECTS } from '../data/mockDetections';
import { Detection, HistoryRecord } from '../types/yolo';

interface WebcamDetectionViewProps {
  onAddHistory: (record: HistoryRecord) => void;
  selectedModel: 'YOLOv8n' | 'YOLOv8s';
}

export default function WebcamDetectionView({ onAddHistory, selectedModel }: WebcamDetectionViewProps) {
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraBlocked, setCameraBlocked] = useState<boolean>(false);
  const [liveDetections, setLiveDetections] = useState<Detection[]>([]);
  const [cumulativeWebcamSnaps, setCumulativeWebcamSnaps] = useState<number>(0);
  
  // Custom webcam tuning triggers
  const [simDensity, setSimDensity] = useState<number>(3); // 1 to 5 detections
  const [confidenceFloor, setConfidenceFloor] = useState<number>(0.35);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop camera stream safely when component unmounts
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Set up frame animation loops to update mock-detection coordinates smoothly
  useEffect(() => {
    if (streamActive) {
      animateWebcamInferences();
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setLiveDetections([]);
    }
  }, [streamActive, simDensity, confidenceFloor]);

  const startCameraStream = async () => {
    setCameraBlocked(false);
    try {
      const constraints = { video: { width: 640, height: 480, facingMode: 'user' } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err) {
      console.warn('Webcam hardware blocked or absent. Gracefully transitioning to high-fidelity Simulator Mode.', err);
      // Even if blocked, we activate StreamActive state to showcase high-fidelity stream simulator dashboard!
      setStreamActive(true);
      setCameraBlocked(true);
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setLiveDetections([]);
  };

  // Animate dynamic coordinates representing YOLO object scanning frame logic
  const animateWebcamInferences = () => {
    const cycleCoordinates = () => {
      const ms = Date.now();
      
      // Pull simulated human/laptop/keyboard coordinates from preset pool
      const selectedPool = WEBCAM_SIMULATED_OBJECTS.slice(0, simDensity);
      
      const computed: Detection[] = selectedPool.map((item, idx) => {
        // Compute drifting sinusoidal shifts to look highly realistic!
        const shiftX = Math.sin((ms / 1500) + idx * 8) * 12;
        const shiftY = Math.cos((ms / 1200) + idx * 5) * 8;
        
        // Custom baseline offsets in workspace frame
        const baselines = [
          { x: 30, y: 20 }, // person central
          { x: 10, y: 55 }, // chair left
          { x: 45, y: 62 }, // laptop central-low
          { x: 75, y: 58 }, // bottle right
          { x: 62, y: 40 }, // phone workspace
        ];
        
        const base = baselines[idx % baselines.length];
        const finalX = Math.max(5, Math.min(85, base.x + shiftX));
        const finalY = Math.max(5, Math.min(85, base.y + shiftY));
        
        // Random slight score variance
        const noise = Math.sin(ms / 800 + idx) * item.scoreVariance;
        const finalConf = Math.min(1.00, Math.max(0.10, item.confidenceMedian + noise));
        
        return {
          id: `live_${idx}`,
          label: item.label,
          confidence: finalConf,
          bbox: {
            x: finalX,
            y: finalY,
            width: item.size.width,
            height: item.size.height,
          },
          trackingId: 50 + idx,
          color: item.color
        };
      });

      // Filter based on selected slider bounding margin
      const filtered = computed.filter(c => c.confidence >= confidenceFloor);
      setLiveDetections(filtered);
      
      // Keep loop alive
      animationFrameRef.current = requestAnimationFrame(cycleCoordinates);
    };

    animationFrameRef.current = requestAnimationFrame(cycleCoordinates);
  };

  // Take a real Snapshot from the streaming viewfinder
  const handleSnapSessionRecord = () => {
    setCumulativeWebcamSnaps(prev => prev + 1);
    
    // Save session telemetry
    const classCountObj: { [key: string]: number } = {};
    let sumConfidence = 0;
    
    liveDetections.forEach(d => {
      classCountObj[d.label] = (classCountObj[d.label] || 0) + 1;
      sumConfidence += d.confidence;
    });

    onAddHistory({
      id: `webcam_${Date.now()}_snaps`,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
      fileName: `Webcam Snapshot Track #${50 + cumulativeWebcamSnaps}`,
      fileType: 'webcam',
      detections: classCountObj,
      avgConfidence: liveDetections.length > 0 ? sumConfidence / liveDetections.length : 0,
      totalCount: liveDetections.length,
      modelUsed: selectedModel
    });
  };

  return (
    <div id="webcam_studio_workspace" className="grid grid-cols-1 lg:grid-cols-4 gap-6 select-none font-sans leading-relaxed">
      
      {/* 1. TUNER CONTROL DASHBOARD */}
      <div id="webcam_parameters_side_column" className="lg:col-span-1 border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-6 h-fit">
        <div>
          <h2 className="font-display font-medium text-white tracking-widest font-mono text-xs uppercase flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" /> Frame Tuner
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1">Calibrate live bounding array limits.</p>
        </div>

        {/* Start / Stop Stream */}
        <div className="space-y-3">
          <label className="text-xs text-zinc-400 font-mono font-bold uppercase tracking-wider block">Webcam Input Feed</label>
          {streamActive ? (
            <button
              id="webcam_shutdown_btn"
              onClick={stopCameraStream}
              className="w-full py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <CameraOff className="h-4 w-4" /> Stop Camera
            </button>
          ) : (
            <button
              id="webcam_initialize_btn"
              onClick={startCameraStream}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/15"
            >
              <Camera className="h-4 w-4" /> Initialize Camera
            </button>
          )}
        </div>

        {/* Live target Density Scale Slider */}
        <div className="space-y-2 pt-3 border-t border-zinc-800/80">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-300">
            <span>Detections Cap</span>
            <span className="text-blue-400 font-semibold">{simDensity} classes</span>
          </div>
          <input
            id="sim_density_slider"
            type="range"
            min={1}
            max={5}
            step={1}
            value={simDensity}
            onChange={(e) => setSimDensity(parseInt(e.target.value))}
            className="w-full accent-blue-500 bg-zinc-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[10px] text-zinc-500 leading-tight">Max simultaneously trackable overlapping entities.</p>
        </div>

        {/* Confidence Cutoff Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-300">
            <span>Score Floor</span>
            <span className="text-emerald-400 font-semibold">{confidenceFloor.toFixed(2)}</span>
          </div>
          <input
            id="confidence_cutoff_slider"
            type="range"
            min={0.10}
            max={0.95}
            step={0.05}
            value={confidenceFloor}
            onChange={(e) => setConfidenceFloor(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 bg-zinc-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Snapshot Actions */}
        {streamActive && (
          <button
            id="take_webcam_snapshot_btn"
            onClick={handleSnapSessionRecord}
            className="w-full py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-850 hover:text-white text-xs font-bold font-mono tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.97]"
          >
            Snap Analytics Record
          </button>
        )}
      </div>

      {/* 2. CINEMATIC LIVE MONITOR */}
      <div id="webcam_viewport_workspace" className="lg:col-span-3 space-y-6">
        <div className="border border-zinc-800 rounded-2xl bg-zinc-950/60 p-5 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-zinc-800/80 pb-4 font-mono text-xs">
            <div>
              <h3 className="font-display font-medium text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-emerald-400 animate-spin-slow" /> Real-Time Bounding Core
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-sans">Active video frames telemetry logs.</p>
            </div>

            <div className="flex gap-2">
              <span className="px-2 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                Model: <strong className="text-zinc-200">{selectedModel}</strong>
              </span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                In-Frame Detections: <strong className="text-emerald-400">{liveDetections.length} objects</strong>
              </span>
            </div>
          </div>

          {/* Active Viewport Screen Area */}
          <div className="relative w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 aspect-video flex items-center justify-center">
            
            {!streamActive ? (
              <div className="text-center p-8 space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-zinc-800 border-2 border-zinc-700/60 flex items-center justify-center text-zinc-500">
                  <CameraOff className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-sm text-zinc-300">Webcam viewfinder offline</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">Click "Initialize Camera" to bind system input peripherals.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Fallback overlay when local devices block camera queries */}
                {cameraBlocked ? (
                  <div className="absolute inset-0 z-0">
                    <img
                      src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1200"
                      alt="Neural Simulation Background"
                      className="w-full h-full object-cover filter brightness-[0.25]"
                    />
                    <div className="absolute top-4 left-4 right-4 z-40 p-3 rounded-lg bg-amber-500/90 text-zinc-950 font-mono text-[10px] font-bold tracking-wide flex items-center gap-2 shadow-lg">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Webcam queries unavailable or blocked on this client. Showcase Simulator Core engaged.</span>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover filter brightness-[0.80]"
                    playsInline
                    muted
                  />
                )}

                {/* Draw dynamic bounding targets and tagging coordinates */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {liveDetections.map((det) => (
                    <div
                      key={det.id}
                      className="absolute border-2 font-mono flex flex-col justify-start align-top"
                      style={{
                        left: `${det.bbox.x}%`,
                        top: `${det.bbox.y}%`,
                        width: `${det.bbox.width}%`,
                        height: `${det.bbox.height}%`,
                        borderColor: det.color,
                        boxShadow: '0 0 12px rgba(0,0,0,0.6)'
                      }}
                    >
                      {/* Bounding text plate */}
                      <span
                        className="absolute -top-5.5 left-[-2px] text-[9px] font-bold text-zinc-950 px-1.5 py-0.5 whitespace-nowrap rounded"
                        style={{ backgroundColor: det.color }}
                      >
                        {det.label} {(det.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ACTIVE DRIFT SPEED LISTS */}
        <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Active Drift Coordinates Vector Matrix</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {liveDetections.map((det) => (
              <div key={det.id} className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-lg text-xs font-mono space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-200 capitalize flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: det.color }} />
                    {det.label}
                  </span>
                  <span className="text-emerald-400">#0{det.trackingId}</span>
                </div>
                <div className="text-[10px] text-zinc-500 space-y-0.5">
                  <div>X-Offset: {det.bbox.x.toFixed(1)}%</div>
                  <div>Y-Offset: {det.bbox.y.toFixed(1)}%</div>
                  <div>Confidence: {(det.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
            ))}
            {liveDetections.length === 0 && (
              <div className="col-span-full p-4 border border-zinc-800/60 rounded-lg text-center text-xs text-zinc-500 font-mono">
                Launch camera or slide score limit down to reveal active coordinate registers!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
