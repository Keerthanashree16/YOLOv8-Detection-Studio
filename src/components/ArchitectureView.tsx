/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Copy, Check, Terminal, Layers, Cpu, HelpCircle, Network } from 'lucide-react';
import { PYTHON_PROJECT_FILES } from '../data/pythonCode';

export default function ArchitectureView() {
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  const currentPythonFile = PYTHON_PROJECT_FILES[selectedFileIdx];

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(currentPythonFile.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const techStack = [
    { name: 'Python 3.9+', purpose: 'Interpreter Engine', detail: 'The modern foundational ML base.' },
    { name: 'Ultralytics YOLOv8', purpose: 'Object Classifiers', detail: 'Latest decoupled anchor-free convolutional networks.' },
    { name: 'OpenCV (headless)', purpose: 'Image Processing & Decode', detail: 'Provides rapid frame manipulations and canvas drawing matrices.' },
    { name: 'Streamlit 1.30', purpose: 'Local Host Dashboard', detail: 'Quickly constructs responsive single-page visual ports.' },
    { name: 'Pandas & NumPy', purpose: 'Analytical Spreadsheets', detail: 'Aggregates matrix logs and formats telemetry spreads.' },
    { name: 'Matplotlib & Recharts', purpose: 'Visual Telemetry Graphs', detail: 'Renders timelines, distributions, and error boundaries.' },
    { name: 'ReportLab 4.0', purpose: 'Executive PDF Compiler', detail: 'On-the-fly construction of secure verification certificates.' },
  ];

  return (
    <div id="architecture_workspace" className="space-y-8 select-none font-sans leading-relaxed text-zinc-300">
      
      {/* 1. ARCHITECTURE SCHEMATICS BANNING CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CV Workflow Explanation */}
        <div className="lg:col-span-2 border border-zinc-800 rounded-xl bg-zinc-950/40 p-6 space-y-4">
          <h2 className="font-display font-medium text-white text-base uppercase tracking-wider flex items-center gap-2">
            <Network className="h-5 w-5 text-emerald-400" /> YOLOv8 Computer Vision Pipeline
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            YOLOv8 is a single-stage convolutional object detection network. In contrast to multi-stage architectures (which separate regions-of-interest searching from classifier scores), YOLOv8 predicts bounding bounds and category probabilities simultaneously.
          </p>

          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60 font-mono text-xs space-y-3">
            <div className="text-emerald-400 font-semibold uppercase tracking-widest text-[10px]">Inference Pipeline Loops:</div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-950 text-center">
                <span className="block font-bold text-zinc-100">01. DECODE</span>
                <span className="text-[9px] text-zinc-500">Decodes video/image arrays. Resizes to 640x640 tensors.</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-950 text-center">
                <span className="block font-bold text-zinc-100">02. FORWARD PASS</span>
                <span className="text-[9px] text-zinc-500">SPPF extracts multi-scale grid coordinates.</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-950 text-center">
                <span className="block font-bold text-zinc-100">03. NMS FILTER</span>
                <span className="text-[9px] text-zinc-500">NMS (IOU thresholds) isolates duplicate detections.</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-950 text-center">
                <span className="block font-bold text-zinc-100">04. KINEMATICS</span>
                <span className="text-[9px] text-zinc-500">ByteTrack binds linear Kalman coordinates.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technology stack cards */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950/40 p-6 space-y-4">
          <h2 className="font-display font-medium text-white text-base uppercase tracking-wider flex items-center gap-2">
            <Cpu className="h-5 w-5 text-emerald-400" /> Technology Ecosystem
          </h2>
          <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
            {techStack.map((tech) => (
              <div key={tech.name} className="font-mono text-xs border-b border-zinc-900 pb-2 flex justify-between items-start gap-4">
                <div>
                  <strong className="text-zinc-200 block text-[11px] font-sans">{tech.name}</strong>
                  <span className="text-[10px] text-zinc-500 font-sans">{tech.detail}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0 uppercase">{tech.purpose}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 2. LIVE INTEGRATED PYTHON SOURCE IDE EXPLORER */}
      <div id="integrated_ide_workspace" className="border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-4">
        <div className="border-b border-zinc-800/80 pb-4">
          <h2 className="font-display font-bold text-white text-base flex justify-between items-center">
            <span className="flex items-center gap-2"><Terminal className="h-5 w-5 text-emerald-400" /> Modular Python Code Assembly IDE</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Ready-to-copy source scripts suitable for internship submission and local dashboard deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Vertical File Explorer tree */}
          <div className="space-y-2 border-r border-zinc-800/60 pr-4">
            <span className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest pl-2">Object-Detection-YOLO/</span>
            {PYTHON_PROJECT_FILES.map((fileObj, idx) => (
              <button
                key={fileObj.path}
                onClick={() => {
                  setSelectedFileIdx(idx);
                  setIsCopied(false);
                }}
                className={`w-full p-2.5 rounded-lg flex items-center gap-2 text-xs font-mono transition-all text-left cursor-pointer ${
                  selectedFileIdx === idx
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-bold'
                    : 'text-zinc-400 hover:bg-zinc-900/35 hover:text-zinc-200'
                }`}
              >
                <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
                <span>{fileObj.name}</span>
              </button>
            ))}
          </div>

          {/* Syntax Highlighter Viewport box */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-4 bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-t-lg">
              <div>
                <span className="font-mono text-zinc-300 font-bold text-xs">{currentPythonFile.path}</span>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-sans leading-tight">{currentPythonFile.description}</p>
              </div>

              {/* Copy file buttons */}
              <button
                id="copy_file_to_clipboard_btn"
                onClick={handleCopyToClipboard}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-850 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-[0.97]"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-400" /> Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Code editor body */}
            <div className="rounded-b-lg border-x border-b border-zinc-800/80 bg-zinc-950 max-h-[460px] overflow-y-auto p-4 font-mono text-[11px] leading-relaxed text-zinc-400 selection:bg-emerald-500/20">
              <pre id="python_code_render_box" className="whitespace-pre-wrap word-break-all text-left">
                {currentPythonFile.code}
              </pre>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
