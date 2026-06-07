/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area,
  LineChart, Line
} from 'recharts';
import { Database, TrendingUp, Compass, Award, Activity } from 'lucide-react';
import { HistoryRecord } from '../types/yolo';

interface AnalyticsViewProps {
  history: HistoryRecord[];
}

export default function AnalyticsView({ history }: AnalyticsViewProps) {
  // 1. Compile total baseline statistics
  const statsSummary = useMemo(() => {
    if (history.length === 0) {
      return { total: 0, meanConfidence: 0, classesCount: 0, passesCount: 0 };
    }
    
    let sumObjects = 0;
    let sumConfidence = 0;
    const uniqueClasses = new Set<string>();

    history.forEach(rec => {
      sumObjects += rec.totalCount;
      sumConfidence += rec.avgConfidence;
      Object.keys(rec.detections).forEach(cls => uniqueClasses.add(cls));
    });

    return {
      total: sumObjects,
      meanConfidence: Math.round((sumConfidence / history.length) * 100),
      classesCount: uniqueClasses.size,
      passesCount: history.length
    };
  }, [history]);

  // 2. Chart A: Class Frequencies (Bar Chart)
  const classFreqData = useMemo(() => {
    const counts: { [label: string]: number } = {};
    history.forEach(rec => {
      Object.entries(rec.detections).forEach(([label, qty]) => {
        counts[label] = (counts[label] || 0) + qty;
      });
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      Detections: value
    })).sort((a, b) => b.Detections - a.Detections);
  }, [history]);

  // 3. Chart B: Object Distribution proportions (Pie Chart)
  const pieChartColors = ['#10b981', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4'];
  const distributionData = useMemo(() => {
    return classFreqData.map((d, index) => ({
      name: d.name,
      value: d.Detections,
      fill: pieChartColors[index % pieChartColors.length]
    }));
  }, [classFreqData]);

  // 4. Chart C: Confidence Score Ranges Histogram (Area Chart)
  const confidenceRangesData = useMemo(() => {
    const brackets = [
      { name: '0.1-0.3 (Low)', count: 0 },
      { name: '0.3-0.5 (Mid)', count: 0 },
      { name: '0.5-0.7 (Good)', count: 0 },
      { name: '0.7-0.9 (Sharp)', count: 0 },
      { name: '0.9-1.0 (Exact)', count: 0 },
    ];

    history.forEach(rec => {
      const conf = rec.avgConfidence;
      if (conf < 0.3) brackets[0].count += rec.totalCount;
      else if (conf < 0.5) brackets[1].count += rec.totalCount;
      else if (conf < 0.7) brackets[2].count += rec.totalCount;
      else if (conf < 0.9) brackets[3].count += rec.totalCount;
      else brackets[4].count += rec.totalCount;
    });

    return brackets;
  }, [history]);

  // 5. Chart D: Detection Trends Timeline (Line Chart)
  const trendLineData = useMemo(() => {
    return history.map((rec, idx) => ({
      name: `Pt ${idx + 1}`,
      Objects: rec.totalCount,
      Confidence: Math.round(rec.avgConfidence * 100)
    }));
  }, [history]);

  return (
    <div id="analytics_dashboard_root" className="space-y-8 select-none leading-relaxed font-sans">
      
      {/* 1. SCORE MATRIX HEADER BARS */}
      <div id="analytics_scorecard_matrix" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-950/40 space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest">Total Inferences Volume</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <p id="total_detections_val" className="text-3xl font-extrabold text-white font-display">
            {statsSummary.total}
          </p>
          <div className="text-[10px] text-zinc-400 font-mono">Detections registered across session.</div>
        </div>

        <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-950/40 space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest">Averaged Precision</span>
            <Award className="h-4 w-4 text-blue-400" />
          </div>
          <p id="avg_confidence_val" className="text-3xl font-extrabold text-white font-display">
            {statsSummary.meanConfidence || 0}%
          </p>
          <div className="text-[10px] text-zinc-400 font-mono">Mean COCO probability classification scale.</div>
        </div>

        <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-950/40 space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest">Classified Classes</span>
            <Database className="h-4 w-4 text-purple-400" />
          </div>
          <p id="classes_spread_val" className="text-3xl font-extrabold text-white font-display">
            {statsSummary.classesCount}
          </p>
          <div className="text-[10px] text-zinc-400 font-mono">Distinct visual coordinate patterns mapped.</div>
        </div>

        <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-950/40 space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest">Total Active Runs</span>
            <Compass className="h-4 w-4 text-amber-400" />
          </div>
          <p id="runs_volume_val" className="text-3xl font-extrabold text-white font-display">
            {statsSummary.passesCount}
          </p>
          <div className="text-[10px] text-zinc-400 font-mono">Image + Video + Camera snapshot arrays.</div>
        </div>

      </div>

      {/* 2. ADVANCED CHART GRID PANELS */}
      <div id="analytics_charts_bento_grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART A: Category Frequency Distribution (Bar) */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Category Frequency Histogram</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">Sum of specific classes checked throughout the entire active directory.</p>
          </div>
          <div className="h-64 w-full">
            {classFreqData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs font-mono">
                Launch Inference Studio to populate chart logs!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classFreqData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} fontClassName="font-mono" />
                  <YAxis stroke="#71717a" fontSize={10} fontClassName="font-mono" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6', fontFamily: 'monospace', fontSize: 11 }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Bar dataKey="Detections" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART B: Density Pie Distribution Chart (Pie) */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Coordinate Proportional Ratio</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">Volumetric proportions of target categories captured inside frame boundaries.</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {distributionData.length === 0 ? (
              <div className="text-zinc-500 text-xs font-mono">
                No telemetry registered. Execute snapshot captures first!
              </div>
            ) : (
              <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 items-center">
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090d16', border: '1px solid #27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#f3f4f6', fontFamily: 'monospace' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Labels legend panel */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {distributionData.map((item, idx) => (
                    <div key={item.name} className="flex justify-between items-center text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-zinc-400 capitalize">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                        {item.name}
                      </span>
                      <strong className="text-zinc-200">{item.value} objects</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHART C: Accuracy Threshold Spread (Area) */}
        <div className="border border-zinc-850 rounded-xl bg-zinc-950/45 p-5 space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Confidence Spread Histogram</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">Quantification of detections categorized by confidence score bands.</p>
          </div>
          <div className="h-64 w-full">
            {history.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs font-mono">
                Charts will formulate on first active image upload snap!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={confidenceRangesData}>
                  <defs>
                    <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} fontClassName="font-mono" />
                  <YAxis stroke="#71717a" fontSize={10} fontClassName="font-mono" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6', fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="count" name="Classifications" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorConf)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART D: Temporal Frequency Trendline (Line) */}
        <div className="border border-zinc-850 rounded-xl bg-zinc-950/45 p-5 space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Chronological Inference Velocity</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">Detections count and accuracy benchmarks across running session stages.</p>
          </div>
          <div className="h-64 w-full">
            {history.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs font-mono">
                Trends formulate upon starting image and video analysis loops.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendLineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} fontClassName="font-mono" />
                  <YAxis yAxisId="left" stroke="#71717a" fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={10} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Line yAxisId="left" type="monotone" dataKey="Objects" name="Object Count" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Confidence" name="Avg Confidence" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 3. HISTORIC TRANSACTION CHRONICLE TABLE */}
      <div id="analytics_history_table" className="border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-4">
        <div>
          <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Chronological Telemetry Registers
          </h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">Comprehensive audit spreadsheet documenting session inferences.</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800 font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-500 font-normal">
                <th className="p-3">Reference ID</th>
                <th className="p-3">Timestamp Time</th>
                <th className="p-3">Source Channel</th>
                <th className="p-3">Inference Target Spread</th>
                <th className="p-3">Max Confidence</th>
                <th className="p-3">Total Objects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/10 text-zinc-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-zinc-500">
                    No snap telemetry files cached yet. Initialize image or camera pipelines.
                  </td>
                </tr>
              ) : (
                history.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-900/35 transition-all">
                    <td className="p-3 text-[11px] font-bold text-emerald-400">{rec.id}</td>
                    <td className="p-3 text-zinc-400">{rec.timestamp}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        rec.fileType === 'image' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                          : rec.fileType === 'video'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/10'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/10'
                      }`}>
                        {rec.fileType}
                      </span>
                    </td>
                    <td className="p-3 capitalize truncate max-w-[200px]" title={Object.entries(rec.detections).map(([k,v]) => `${k}:${v}`).join(', ')}>
                      {Object.keys(rec.detections).length === 0 ? 'None' : (
                        Object.entries(rec.detections).map(([k, v]) => `${k} (${v})`).join(', ')
                      )}
                    </td>
                    <td className="p-3">{Math.round(rec.avgConfidence * 100)}%</td>
                    <td className="p-3 font-semibold text-zinc-100">{rec.totalCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
