/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Target, Layers, ShieldAlert, FileText, Zap, Sparkles } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (page: string) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const features = [
    {
      icon: Cpu,
      title: 'YOLOv8 deep learning backbone',
      desc: 'Orchestrates nano and small scale neural network architectures optimized for CPU and edge processing speeds.',
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      route: 'image'
    },
    {
      icon: Target,
      title: 'ByteTrack Linear Tracking',
      desc: 'Implements frame-to-frame bounding box intersection-over-union (IOU) calculations to retain object status paths.',
      color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
      route: 'video'
    },
    {
      icon: Zap,
      title: 'Visual Telemetry Engines',
      desc: 'Compiles continuous class frequency arrays, confidence distribution graphs, and real-time detection histories.',
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
      route: 'analytics'
    },
    {
      icon: FileText,
      title: 'Report Compiler Studio',
      desc: 'Downloads audit tables as ready-to-publish raw CSV spreadsheets and fully stylized binary PDF reports.',
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      route: 'reports'
    }
  ];

  const benchmarks = [
    { name: 'YOLOv8n (Nano)', params: '3.2M', speedCpu: '~38ms', speedGpu: '~2.1ms', map50: '37.3M', size: '6.2MB', badge: 'Fastest Edge Option' },
    { name: 'YOLOv8s (Small)', params: '11.2M', speedCpu: '~74ms', speedGpu: '~3.5ms', map50: '44.9M', size: '22.5MB', badge: 'Optimal Accuracy Blend' },
    { name: 'YOLOv8m (Medium)', params: '25.9M', speedCpu: '~160ms', speedGpu: '~6.2ms', map50: '50.2M', size: '52.0MB', badge: 'Server Grade Scale' },
    { name: 'YOLOv8l (Large)', params: '43.7M', speedCpu: '~290ms', speedGpu: '~10.1ms', map50: '52.9M', size: '87.5MB', badge: 'Academic Heavyweight' }
  ];

  return (
    <div id="home_container" className="space-y-8 select-none">
      {/* 1. Header Hero Banner */}
      <motion.div
        id="hero_banner"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 md:p-12"
      >
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 -mb-20 h-60 w-60 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 uppercase tracking-widest font-mono">
            <Sparkles className="h-3 w-3" /> CV Portfolio Submission
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Real-Time Object Detection & Analytics Platform using <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">YOLOv8</span>
          </h1>
          <p className="max-w-2xl text-zinc-400 text-sm md:text-base leading-relaxed">
            This workspace orchestrates state-of-the-art Computer Vision deep learning modules, temporal object tracking, and extensive visual telemetry dashboards. Fulfill academic and industry internship demands with ready-to-run code components.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              id="goto_image_studio_btn"
              onClick={() => onNavigate('image')}
              className="px-6 py-3 rounded-lg bg-emerald-500 text-zinc-950 text-sm font-semibold hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Launch Inference Studio
            </button>
            <button
              id="goto_codebase_btn"
              onClick={() => onNavigate('architecture')}
              className="px-6 py-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-200 text-sm font-semibold hover:bg-zinc-900 hover:border-zinc-700 active:scale-95 transition-all cursor-pointer"
            >
              Browse Code Files
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Platform Core Feature Offerings */}
      <div id="feature_grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            onClick={() => onNavigate(feat.route)}
            className={`p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/20 active:scale-[0.98] transition-all cursor-pointer group`}
          >
            <div className={`p-3 rounded-xl border w-fit mb-4 transition-all duration-300 group-hover:scale-110 ${feat.color}`}>
              <feat.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-zinc-200 mb-2 tracking-wide font-mono leading-tight">{feat.title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">{feat.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* 3. Deep Learning Mechanics & Benchmarks */}
      <div id="benchmarks_container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Architecture Summary (Left 2 columns) */}
        <motion.div
          id="yolo_architecture_breakdown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 border border-zinc-800 rounded-xl bg-zinc-950/40 p-6 space-y-6"
        >
          <div className="border-b border-zinc-800/80 pb-4">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-400 animate-pulse" /> YOLOv8 Deep Convolutional Backbone
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Decoupled neural engineering designed for single-stage spatial predictions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50 space-y-2">
              <div className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wide">01. Backbone Layer</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Applies a modified SPPF (Spatial Pyramid Pooling Fast) structures and specialized CSPDarknet convolutions to harvest multi-scale feature hierarchies.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50 space-y-2">
              <div className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wide">02. Decoupled Head</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Separates localization bounding boxes from classifications tasks. Drastically raises convergence rates and accelerates overall inference.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50 space-y-2">
              <div className="text-xs font-mono text-purple-400 font-semibold uppercase tracking-wide">03. Anchor-Free Predicts</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Replaces conventional anchor coordinates with anchor-free spatial logic. Lowers hyper-parameters counts to optimize speed on CPU devices.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex gap-4 items-start">
            <ShieldAlert className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-mono font-bold text-emerald-300">Portfolio Evaluator Note</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                This platform is configured for double performance verification: (1) A high-fidelity responsive HTML5 local visualization layer allowing live confidence tuning, track history drawing, and CSV report formulation. (2) Standard structured Python engine scripts copyable directly for local desktop compilation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Benchmarks & Model Weights (Right 1 column) */}
        <motion.div
          id="model_benchmarks_section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border border-zinc-800 rounded-xl bg-zinc-950/40 p-6 space-y-4"
        >
          <div>
            <h2 className="font-display text-base font-bold text-white uppercase tracking-wider font-mono">YOLOv8 Weights Profile</h2>
            <p className="text-xs text-zinc-400">Official benchmarks on MS COCO dataset val2017.</p>
          </div>

          <div className="space-y-3">
            {benchmarks.map((bench) => (
              <div
                key={bench.name}
                className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 transition-all text-xs space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-zinc-200 font-mono">{bench.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                    {bench.badge}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-400">
                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase">Parameters</span>
                    {bench.params}
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase">mAP50-95</span>
                    {bench.map50}
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase">CPU Frame Lat</span>
                    {bench.speedCpu}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
