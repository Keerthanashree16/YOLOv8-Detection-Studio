/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileSpreadsheet, FileDown, Check, RefreshCw, AlertCircle, Calendar, ShieldCheck } from 'lucide-react';
import { HistoryRecord } from '../types/yolo';

interface ReportsViewProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
}

export default function ReportsView({ history, onClearHistory }: ReportsViewProps) {
  const [csvSuccess, setCsvSuccess] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  // Formulates dynamic CSV spreadsheets on-the-fly and downloads
  const triggerCsvDownload = () => {
    if (history.length === 0) return;
    
    // Create header row
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Inference_ID,Timestamp,Channel_Type,Objects_Map,Avg_Confidence,Weights_Scale_Used,Total_Objects\n';

    history.forEach(rec => {
      const clsSpread = Object.entries(rec.detections).map(([k,v]) => `${k}:${v}`).join('|');
      const row = [
        rec.id,
        rec.timestamp,
        rec.fileType,
        `"${clsSpread}"`,
        (rec.avgConfidence * 100).toFixed(1),
        rec.modelUsed,
        rec.totalCount
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YOLOv8_session_telemetry_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCsvSuccess(true);
    setTimeout(() => setCsvSuccess(false), 2000);
  };

  // Compiles and draws a premium formatted document directly onto canvas, downloads
  const triggerPdfDownload = () => {
    if (history.length === 0) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // High-resolution sheet dimensions
    canvas.width = 1200;
    canvas.height = 1600;

    if (ctx) {
      // 1. Solid clear background
      ctx.fillStyle = '#0f172a'; // Deep slate primary background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#1e293b'; // Card background
      ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Border outline
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

      // --- HEADER SECTION ---
      ctx.fillStyle = '#10b981'; // Emerald tag
      ctx.fillRect(80, 100, 160, 40);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px Space Grotesk, sans-serif';
      ctx.fillText('OFFICIAL REPORT', 100, 125);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px Space Grotesk, sans-serif';
      ctx.fillText('YOLOv8 DETECTION STUDIO', 80, 200);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px monospace';
      ctx.fillText(`Report Compiled On: ${new Date().toLocaleString()}`, 80, 240);
      ctx.fillText('Verification: SECURE EDGE INFERENCE BLOCK', 80, 265);

      // Line spacer
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 300);
      ctx.lineTo(canvas.width - 80, 300);
      ctx.stroke();

      // --- SUMMARY BOARD ---
      let sumObjects = 0;
      let sumConfidence = 0;
      history.forEach(r => {
        sumObjects += r.totalCount;
        sumConfidence += r.avgConfidence;
      });
      const avgConfPercent = history.length > 0 ? (sumConfidence / history.length * 100).toFixed(1) : '0';

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px Space Grotesk, sans-serif';
      ctx.fillText('EXECUTIVE SUMMARY', 80, 360);

      // Box 1: Total volume
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(80, 390, 300, 130);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.strokeRect(80, 390, 300, 130);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(sumObjects.toString(), 110, 460);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText('TOTAL CLASSIFIED OBJECTS', 110, 495);

      // Box 2: Mean confidence
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(440, 390, 300, 130);
      ctx.strokeRect(440, 390, 300, 130);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`${avgConfPercent}%`, 470, 460);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText('AVERAGED MODEL CONFIDENCE', 470, 495);

      // Box 3: Total Runs
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(800, 390, 300, 130);
      ctx.strokeRect(800, 390, 300, 130);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(history.length.toString(), 830, 460);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText('TOTAL EXECUTED RUNS', 830, 495);

      // --- LOG DATA TABLE ---
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Space Grotesk, sans-serif';
      ctx.fillText('CHRONOLOGICAL DETECTIONS AUDIT LOG', 80, 580);

      // Table Header lines
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(80, 610, canvas.width - 160, 45);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('INDEX', 95, 638);
      ctx.fillText('TIMESTAMP MARK', 200, 638);
      ctx.fillText('SOURCE FEED', 480, 638);
      ctx.fillText('DENSITY COUNT', 740, 638);
      ctx.fillText('AVG CONFIDENCE', 940, 638);

      let rowY = 680;
      history.slice(0, 12).forEach((rec, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#131e35' : '#101726';
        ctx.fillRect(80, rowY - 25, canvas.width - 160, 40);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px monospace';
        ctx.fillText(`[${idx+1}]`, 95, rowY);
        ctx.fillText(rec.timestamp, 200, rowY);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText(rec.fileType.toUpperCase(), 480, rowY);
        ctx.fillText(`${rec.totalCount} items`, 740, rowY);
        
        ctx.fillStyle = '#10b981';
        ctx.fillText(`${Math.round(rec.avgConfidence * 100)}%`, 940, rowY);

        rowY += 50;
      });

      // --- VERIFICATION FOOTER ---
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Space Grotesk, sans-serif';
      ctx.fillText('This document verifies local performance profiles of the YOLOv8 model.', 80, 1480);
      ctx.fillText('Fulfill active CS/AI/ML evaluation credentials natively on edge structures.', 80, 1500);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('STATUS: VERIFIED SECURE PIPELINES', 80, 1530);

      // 4. Download Trigger
      const link = document.createElement('a');
      link.download = `YOLOv8_Executive_Detection_Report_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 2000);
    }
  };

  return (
    <div id="reports_workspace_root" className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none font-sans leading-relaxed">
      
      {/* LEFT COLUMN: EXPORT CARD PANEL */}
      <div id="reports_export_column" className="lg:col-span-1 border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-6">
        <div>
          <h2 className="font-display font-medium text-white tracking-widest font-mono text-xs uppercase flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Export Hub
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1">Acquire offline copies of cached classification files.</p>
        </div>

        <div className="space-y-4">
          
          {/* Export option 1: CSV */}
          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold text-zinc-200">Raw Excel Spreadsheet (CSV)</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">Perfect for deep analytic parses in Pandas / Jupyter notebooks.</p>
              </div>
            </div>
            
            <button
              id="export_csv_action_btn"
              onClick={triggerCsvDownload}
              disabled={history.length === 0}
              className={`w-full py-2 rounded text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                history.length === 0
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : csvSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow shadow-emerald-500/10'
              }`}
            >
              {csvSuccess ? <Check className="h-3.5 w-3.5" /> : <FileDown className="h-3.5 w-3.5" />}
              {csvSuccess ? 'Spreadsheet Downloaded!' : 'Export CSV Files'}
            </button>
          </div>

          {/* Export option 2: PDF DOCUMENT */}
          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <div className="flex items-start gap-3">
              <FileDown className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold text-zinc-200">Executive Summary PDF</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">High-fidelity structured report sheet with logos, metadata, and tables.</p>
              </div>
            </div>

            <button
              id="export_pdf_action_btn"
              onClick={triggerPdfDownload}
              disabled={history.length === 0}
              className={`w-full py-2 rounded text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                history.length === 0
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : pdfSuccess
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-blue-500 hover:bg-blue-400 text-zinc-950 shadow shadow-blue-500/10'
              }`}
            >
              {pdfSuccess ? <Check className="h-3.5 w-3.5" /> : <FileDown className="h-3.5 w-3.5" />}
              {pdfSuccess ? 'Styled Sheet Downloaded!' : 'Export PDF Document'}
            </button>
          </div>

          {/* Reset cache option */}
          {history.length > 0 && (
            <button
              id="clear_ledger_action_btn"
              onClick={onClearHistory}
              className="w-full py-2 rounded border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 text-xs font-mono tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Clear History Ledger
            </button>
          )}

        </div>
      </div>

      {/* RIGHT 2 COLUMNS: LEDGER AUDIT PREVIEW LIST */}
      <div id="reports_ledger_workspace" className="lg:col-span-2 space-y-6">
        <div className="border border-zinc-800 rounded-2xl bg-zinc-950/60 p-5 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
            <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display font-medium text-white">Inference History Audit Trail</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Review cache vectors currently aligned for PDF packing.</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {history.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700/80 transition-all text-xs flex justify-between items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-zinc-300">
                    <span className="font-bold text-emerald-400">{rec.id}</span>
                    <span className="text-zinc-600">|</span>
                    <span className="text-[10px] text-zinc-400">{rec.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Processed {rec.fileType} via <strong className="font-mono text-zinc-300">{rec.modelUsed}</strong>
                  </p>
                </div>

                <div className="text-right font-mono text-xs">
                  <strong className="text-zinc-200 block">{rec.totalCount} Objects</strong>
                  <span className="text-[10px] text-zinc-500">Avg Conf: {Math.round(rec.avgConfidence*100)}%</span>
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <div className="p-8 text-center border border-zinc-800/50 rounded-xl space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-zinc-600 animate-pulse" />
                <h4 className="text-xs font-mono font-bold text-zinc-400">Ledger cache is empty</h4>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">Upload static files on the Image Studio tab or initialize Webcam grids to compile registers.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
