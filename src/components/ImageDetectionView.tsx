/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, Eye, EyeOff, Sliders, Play, Download, Check, AlertCircle } from 'lucide-react';
import { SAMPLE_IMAGES, GENERAL_YOLO_CLASSES } from '../data/mockDetections';
import { Detection, InferenceStats, HistoryRecord } from '../types/yolo';

interface ImageDetectionViewProps {
  onAddHistory: (record: HistoryRecord) => void;
  selectedModel: 'YOLOv8n' | 'YOLOv8s';
  onChangeModel: (model: 'YOLOv8n' | 'YOLOv8s') => void;
}

export default function ImageDetectionView({ onAddHistory, selectedModel, onChangeModel }: ImageDetectionViewProps) {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_IMAGES[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [useCustom, setUseCustom] = useState<boolean>(false);
  
  // High-fidelity adjustable CV Threshold sliders
  const [confThreshold, setConfThreshold] = useState<number>(0.25);
  const [iouThreshold, setIouThreshold] = useState<number>(0.45);
  
  // Inference execution states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [inferenceStats, setInferenceStats] = useState<InferenceStats>({
    modelName: 'YOLOv8n',
    inferenceTimeMs: 42,
    totalObjects: 9
  });
  
  const [activeDetections, setActiveDetections] = useState<Detection[]>([]);
  const [isDrawn, setIsDrawn] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // When model scale changes or threshold slides, compute live detections list
  useEffect(() => {
    let rawDetections: Detection[] = [];
    let baseTime = 32; // base inference time in ms
    
    if (useCustom) {
      // Simulate real YOLOv8 outputs for custom-uploaded files! 
      // We'll generate realistic objects with seed logic based on filename length
      const seed = customFileName.length || 10;
      const possibleClasses = ['person', 'cup', 'car', 'laptop', 'chair', 'handbag', 'book'];
      const classCount = (seed % 3) + 2; // 2-4 items
      
      rawDetections = Array.from({ length: classCount }).map((_, idx) => {
        const classIdx = (seed + idx) % possibleClasses.length;
        const label = possibleClasses[classIdx];
        const confVal = Math.round((0.65 + ((seed * (idx + 1)) % 30) / 100) * 100) / 100;
        
        // Custom coordinates safely mapping in-frame %
        const coordOffsets = [
          { x: 15, y: 25, width: 30, height: 45 },
          { x: 50, y: 15, width: 35, height: 65 },
          { x: 40, y: 55, width: 25, height: 28 },
          { x: 10, y: 60, width: 15, height: 20 },
        ];
        const coord = coordOffsets[idx % coordOffsets.length];
        
        return {
          id: `custom_${idx}`,
          label,
          confidence: confVal,
          bbox: coord,
          trackingId: 400 + idx,
          color: label === 'person' ? '#ec4899' : label === 'laptop' ? '#3b82f6' : '#10b981'
        };
      });
      baseTime = 48;
    } else {
      rawDetections = selectedSample.detections;
    }

    // Filter detections in real-time based on the confidence slider! (Exactly like real confidence threshold filter in YOLOv8)
    const filtered = rawDetections.filter(d => d.confidence >= confThreshold);
    
    // Adjust inference statistics
    const isModelS = selectedModel === 'YOLOv8s';
    const finalInferenceTime = Math.round((baseTime * (isModelS ? 1.8 : 1)) + (filtered.length * 0.8));
    
    setActiveDetections(filtered);
    setInferenceStats({
      modelName: selectedModel,
      inferenceTimeMs: finalInferenceTime,
      totalObjects: filtered.length
    });
  }, [selectedSample, useCustom, customFileName, confThreshold, selectedModel]);

  // Handle local system image drag-and-drop / file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setCustomImage(event.target?.result as string);
          setCustomFileName(file.name);
          setUseCustom(true);
          triggerDetectionEffect();
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const triggerDetectionEffect = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      // Automatically register this inference to historical session reports
      saveInferenceToSession();
    }, 600);
  };

  const selectPreloadedSample = (sample: typeof SAMPLE_IMAGES[0]) => {
    setUseCustom(false);
    setSelectedSample(sample);
    triggerDetectionEffect();
  };

  const saveInferenceToSession = () => {
    const classCountObj: { [key: string]: number } = {};
    let sumConfidence = 0;
    
    activeDetections.forEach(d => {
      classCountObj[d.label] = (classCountObj[d.label] || 0) + 1;
      sumConfidence += d.confidence;
    });

    const record: HistoryRecord = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
      fileName: useCustom ? customFileName : selectedSample.title,
      fileType: 'image',
      detections: classCountObj,
      avgConfidence: activeDetections.length > 0 ? sumConfidence / activeDetections.length : 0,
      totalCount: activeDetections.length,
      modelUsed: selectedModel
    };
    onAddHistory(record);
  };

  // Perform a full visual rendering of boxes onto HTML5 canvas for custom download action
  const handleDownloadAnnotatedImage = () => {
    setIsDownloading(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imgElement = document.createElement('img');
    
    imgElement.crossOrigin = 'anonymous'; // Avoid clean canvas security errors
    imgElement.src = useCustom ? (customImage || '') : selectedSample.url;
    
    imgElement.onload = () => {
      canvas.width = imgElement.naturalWidth || 800;
      canvas.height = imgElement.naturalHeight || 600;
      
      if (ctx) {
        // 1. Draw plain base picture
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        
        if (showAnnotations) {
          // 2. Overlay bounding coordinates dynamically scale calculations
          activeDetections.forEach(det => {
            const bx = (det.bbox.x / 100) * canvas.width;
            const by = (det.bbox.y / 100) * canvas.height;
            const bw = (det.bbox.width / 100) * canvas.width;
            const bh = (det.bbox.height / 100) * canvas.height;
            
            // Box Border Styling
            ctx.strokeStyle = det.color || '#10b981';
            ctx.lineWidth = Math.max(3, canvas.width * 0.004);
            ctx.strokeRect(bx, by, bw, bh);
            
            // Tag Label Box
            const tagText = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
            ctx.font = `bold ${Math.max(12, canvas.width * 0.016)}px font-mono, JetBrains Mono, monospace`;
            
            const textWidth = ctx.measureText(tagText).width;
            const padding = Math.max(4, canvas.width * 0.005);
            ctx.fillStyle = det.color || '#10b981';
            
            // Draw background rectangle for tag
            ctx.fillRect(bx, by - Math.max(22, canvas.width * 0.024), textWidth + padding * 2, Math.max(22, canvas.width * 0.024));
            
            // Draw Text
            ctx.fillStyle = '#030712'; // Black contrast text
            ctx.fillText(tagText, bx + padding, by - padding);
          });
          
          // 3. Draw Watermark logo
          ctx.font = 'bold 16px Space Grotesk, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText('YOLOv8 Studio Analytics Platform', 20, canvas.height - 20);
        }
        
        // 4. Fire download blob sequence
        const fileExtension = useCustom ? 'custom_inference' : selectedSample.id;
        const link = document.createElement('a');
        link.download = `yolov8_detections_${fileExtension}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        
        setIsDownloading(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2000);
      }
    };
    imgElement.onerror = () => {
      setIsDownloading(false);
    };
  };

  return (
    <div id="image_studio_root" className="grid grid-cols-1 lg:grid-cols-4 gap-6 select-none leading-relaxed">
      {/* LEFT COLUMN: CONTROL ROOM BAR */}
      <div id="control_side_pannel" className="lg:col-span-1 border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-6 h-fit">
        <h2 className="font-display font-bold text-sm text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-400" /> YOLOv8 parameters
        </h2>

        {/* Model Scale Selector */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 font-mono font-bold flex justify-between">
            Model Scale <span>{selectedModel === 'YOLOv8n' ? '6.2 MB' : '22.5 MB'}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="model_yolov8n_btn"
              onClick={() => onChangeModel('YOLOv8n')}
              className={`p-2.5 rounded-lg border text-xs font-mono font-medium tracking-wide transition-all ${
                selectedModel === 'YOLOv8n'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700/80'
              }`}
            >
              YOLOv8n (Nano)
            </button>
            <button
              id="model_yolov8s_btn"
              onClick={() => onChangeModel('YOLOv8s')}
              className={`p-2.5 rounded-lg border text-xs font-mono font-medium tracking-wide transition-all ${
                selectedModel === 'YOLOv8s'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700/80'
              }`}
            >
              YOLOv8s (Small)
            </button>
          </div>
        </div>

        {/* Confidence Threshold slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-300">
            <span>Confidence Conf</span>
            <span className="text-emerald-400 font-semibold">{confThreshold.toFixed(2)}</span>
          </div>
          <input
            id="confidence_slider"
            type="range"
            min={0.05}
            max={1.0}
            step={0.05}
            value={confThreshold}
            onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[10px] text-zinc-500 leading-tight">Filters out detections falling below threshold.</p>
        </div>

        {/* IOU Threshold Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-300">
            <span>Non-Max IOU</span>
            <span className="text-blue-400 font-semibold">{iouThreshold.toFixed(2)}</span>
          </div>
          <input
            id="iou_slider"
            type="range"
            min={0.10}
            max={1.0}
            step={0.05}
            value={iouThreshold}
            onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
            className="w-full accent-blue-500 bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[10px] text-zinc-500 leading-tight">NMS overlapping box intersection scale.</p>
        </div>

        {/* Action Toggles */}
        <div className="space-y-3 pt-3 border-t border-zinc-800/80">
          <button
            id="toggle_annotations_btn"
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/20 text-xs font-mono text-zinc-300 hover:bg-zinc-900 flex items-center justify-between transition-all"
          >
            <span>Annotation Overlay</span>
            {showAnnotations ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-zinc-500" />}
          </button>

          <button
            id="run_reprocess_inference_btn"
            onClick={triggerDetectionEffect}
            disabled={isProcessing}
            className="w-full p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Save Session Snapshot
          </button>
        </div>
      </div>

      {/* RIGHT 3 COLUMNS: VISUAL VIEWPORT & TARGET TABLE */}
      <div id="image_inference_workspace" className="lg:col-span-3 space-y-6">
        {/* Core Screen */}
        <div className="border border-zinc-800/90 rounded-2xl bg-zinc-950/60 p-5 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-zinc-800/85 pb-4">
            <div>
              <h3 className="font-display font-bold text-base text-white">YOLOv8 Live Inference Canvas</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Visualize deep-layer annotations on selected source images.</p>
            </div>
            
            {/* Live Model Stats Pillbox */}
            <div className="flex gap-2 text-[11px] font-mono">
              <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                Weights: <strong className="text-zinc-200">{inferenceStats.modelName}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                Inference Latency: <strong className="text-emerald-400">{inferenceStats.inferenceTimeMs}ms</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                Count: <strong className="text-blue-400">{inferenceStats.totalObjects} objects</strong>
              </span>
            </div>
          </div>

          {/* Interactive Image Frame */}
          <div ref={containerRef} className="relative w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 max-h-[500px] flex items-center justify-center">
            {isProcessing && (
              <div className="absolute inset-0 bg-zinc-950/70 z-20 flex flex-col items-center justify-center space-y-3">
                <div id="loader_spin" className="h-10 w-10 rounded-full border-2 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                <span className="text-xs font-mono text-zinc-300">YOLOv8 computing tensor weights...</span>
              </div>
            )}
            
            {/* Main Picture display */}
            <img
              src={useCustom ? (customImage || '') : selectedSample.url}
              alt="YOLO Object Source"
              className="object-contain max-h-[500px] w-full"
            />

            {/* Bounding Boxes Layer */}
            {showAnnotations && !isProcessing && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {activeDetections.map((det) => (
                  <div
                    key={det.id}
                    className="absolute border-2 font-mono flex flex-col justify-start align-top"
                    style={{
                      left: `${det.bbox.x}%`,
                      top: `${det.bbox.y}%`,
                      width: `${det.bbox.width}%`,
                      height: `${det.bbox.height}%`,
                      borderColor: det.color || '#10b981',
                      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                    }}
                  >
                    {/* Bounding Tag Label */}
                    <span 
                      className="absolute -top-6 left-[-2px] text-[10px] font-bold text-zinc-950 px-1.5 py-0.5 whitespace-nowrap rounded-t"
                      style={{ backgroundColor: det.color || '#10b981' }}
                    >
                      {det.label} {(det.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer toolbar: Preloads & Upload button */}
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => selectPreloadedSample(sample)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    !useCustom && selectedSample.id === sample.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700/80'
                  }`}
                >
                  {sample.title.split(' ')[0]} Frame
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {/* File Uploader button */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <button
                id="uploader_trigger_btn"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="h-3.5 w-3.5 text-zinc-400" /> Custom Upload
              </button>

              <button
                id="download_annotated_feed_btn"
                onClick={handleDownloadAnnotatedImage}
                disabled={isDownloading}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Saved!
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5 text-zinc-400" /> Export JPG
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE CURRENT CLASS DISTRIBUTION ROWS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Active Bounding Array Ledger</h4>
            <div className="max-h-[160px] overflow-y-auto rounded-lg border border-zinc-800 font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-500 font-normal">
                    <th className="p-2">Tracking ID</th>
                    <th className="p-2">Object Class</th>
                    <th className="p-2">Confidence</th>
                    <th className="p-2">In-Frame Width</th>
                    <th className="p-2">In-Frame Height</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/10">
                  {activeDetections.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-zinc-500">
                        Adjust slider down to reveal target classifications!
                      </td>
                    </tr>
                  ) : (
                    activeDetections.map((det) => (
                      <tr key={det.id} className="hover:bg-zinc-900/45 text-zinc-300">
                        <td className="p-2 font-semibold text-emerald-500">#{det.trackingId || 'N/A'}</td>
                        <td className="p-2 capitalize flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: det.color }} />
                          {det.label}
                        </td>
                        <td className="p-2">{(det.confidence * 100).toFixed(0)}%</td>
                        <td className="p-2">{det.bbox.width}%</td>
                        <td className="p-2">{det.bbox.height}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Context Explanation</h4>
              <p className="text-xs text-zinc-500 leading-relaxed pt-2">
                Confidence slider dynamically isolates coordinates based on YOLOv8 COCO probability parameters. Nano (YOLOv8n) runs faster on edge CPU, while Small (YOLOv8s) maps denser neural profiles.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-800/50 text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-800/40">
              <AlertCircle className="h-4 w-4 text-emerald-400 shrink-0" /> Real-time canvas tracking isolates overlapping bounding grids.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
