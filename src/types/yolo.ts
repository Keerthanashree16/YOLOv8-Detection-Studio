/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BoundingBox {
  x: number; // percentage source 0-100 or absolute
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  id: string;
  label: string;
  confidence: number;
  bbox: BoundingBox;
  trackingId?: number;
  color?: string;
}

export interface InferenceStats {
  modelName: 'YOLOv8n' | 'YOLOv8s';
  inferenceTimeMs: number;
  totalObjects: number;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  fileName: string;
  fileType: 'image' | 'video' | 'webcam';
  detections: { [label: string]: number };
  avgConfidence: number;
  totalCount: number;
  modelUsed: 'YOLOv8n' | 'YOLOv8s';
}

export interface PythonFile {
  name: string;
  path: string;
  description: string;
  code: string;
}
