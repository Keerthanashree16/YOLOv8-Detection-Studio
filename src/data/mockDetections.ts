/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Detection } from '../types/yolo';

export interface SampleItem {
  id: string;
  title: string;
  description: string;
  url: string;
  detections: Detection[];
}

export const SAMPLE_IMAGES: SampleItem[] = [
  {
    id: 'traffic-intersection',
    title: 'Smart City Intersection Monitoring',
    description: 'Complex urban crossing with dense vehicle distribution, pedestrian crossings, and infrastructure sensors.',
    url: 'https://images.unsplash.com/photo-1494833194891-89b44b10b343?auto=format&fit=crop&q=80&w=1200',
    detections: [
      { id: 't1', label: 'car', confidence: 0.94, bbox: { x: 12, y: 45, width: 22, height: 18 }, trackingId: 101, color: '#10b981' },
      { id: 't2', label: 'car', confidence: 0.89, bbox: { x: 38, y: 42, width: 14, height: 12 }, trackingId: 102, color: '#10b981' },
      { id: 't3', label: 'car', confidence: 0.76, bbox: { x: 55, y: 40, width: 10, height: 9 }, trackingId: 103, color: '#10b981' },
      { id: 't4', label: 'bus', confidence: 0.91, bbox: { x: 68, y: 35, width: 22, height: 28 }, trackingId: 104, color: '#3b82f6' },
      { id: 't5', label: 'pedestrian', confidence: 0.85, bbox: { x: 5, y: 65, width: 6, height: 18 }, trackingId: 105, color: '#ec4899' },
      { id: 't6', label: 'pedestrian', confidence: 0.82, bbox: { x: 30, y: 62, width: 5, height: 15 }, trackingId: 106, color: '#ec4899' },
      { id: 't7', label: 'traffic light', confidence: 0.97, bbox: { x: 45, y: 15, width: 4, height: 10 }, trackingId: 107, color: '#eab308' },
      { id: 't8', label: 'traffic light', confidence: 0.95, bbox: { x: 74, y: 12, width: 4, height: 10 }, trackingId: 108, color: '#eab308' },
      { id: 't9', label: 'motorcycle', confidence: 0.64, bbox: { x: 42, y: 55, width: 8, height: 12 }, trackingId: 109, color: '#8b5cf6' },
    ],
  },
  {
    id: 'retail-queue',
    title: 'Retail Store Crowd & Queue Management',
    description: 'Shopping mall aisle queue showcasing security tracking, customer density profiling, and dwell counters.',
    url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=1200',
    detections: [
      { id: 'r1', label: 'person', confidence: 0.96, bbox: { x: 18, y: 22, width: 16, height: 68 }, trackingId: 201, color: '#ec4899' },
      { id: 'r2', label: 'person', confidence: 0.92, bbox: { x: 35, y: 28, width: 14, height: 62 }, trackingId: 202, color: '#ec4899' },
      { id: 'r3', label: 'person', confidence: 0.88, bbox: { x: 52, y: 30, width: 15, height: 58 }, trackingId: 203, color: '#ec4899' },
      { id: 'r4', label: 'person', confidence: 0.79, bbox: { x: 72, y: 32, width: 13, height: 52 }, trackingId: 204, color: '#ec4899' },
      { id: 'r5', label: 'handbag', confidence: 0.84, bbox: { x: 44, y: 50, width: 8, height: 18 }, trackingId: 205, color: '#f97316' },
      { id: 'r6', label: 'backpack', confidence: 0.72, bbox: { x: 20, y: 38, width: 10, height: 22 }, trackingId: 206, color: '#f97316' },
      { id: 'r7', label: 'shopping cart', confidence: 0.93, bbox: { x: 48, y: 58, width: 22, height: 35 }, trackingId: 207, color: '#06b6d4' },
    ],
  },
  {
    id: 'workspace-robotics',
    title: 'Smart Office Asset & Workspace Security',
    description: 'High-tech office cubicle with active asset profiling, workstation posture evaluation, and device tracking.',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200',
    detections: [
      { id: 'w1', label: 'person', confidence: 0.95, bbox: { x: 30, y: 15, width: 40, height: 75 }, trackingId: 301, color: '#ec4899' },
      { id: 'w2', label: 'laptop', confidence: 0.98, bbox: { x: 25, y: 52, width: 25, height: 25 }, trackingId: 302, color: '#3b82f6' },
      { id: 'w3', label: 'chair', confidence: 0.87, bbox: { x: 28, y: 40, width: 45, height: 55 }, trackingId: 303, color: '#06b6d4' },
      { id: 'w4', label: 'cell phone', confidence: 0.91, bbox: { x: 62, y: 65, width: 6, height: 12 }, trackingId: 304, color: '#10b981' },
      { id: 'w5', label: 'cup', confidence: 0.78, bbox: { x: 18, y: 65, width: 8, height: 14 }, trackingId: 305, color: '#eab308' },
      { id: 'w6', label: 'book', confidence: 0.73, bbox: { x: 5, y: 70, width: 12, height: 18 }, trackingId: 306, color: '#14b8a6' },
    ],
  },
];

export const SAMPLE_VIDEOS = [
  {
    id: 'highway-flow',
    title: 'Highway Traffic Flow Stream',
    description: 'Continuous motion analysis tracking vehicular streams, speed vectors, and lane densities.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-on-a-highway-street-41804-large.mp4',
    frameCount: 45,
    fps: 30,
    detectionsPerFrame: [
      // Frame 1
      [
        { id: 'v1_1', label: 'car', confidence: 0.96, bbox: { x: 10, y: 35, width: 8, height: 7 }, trackingId: 10, color: '#10b981' },
        { id: 'v1_2', label: 'car', confidence: 0.92, bbox: { x: 45, y: 48, width: 11, height: 9 }, trackingId: 11, color: '#10b981' },
        { id: 'v1_3', label: 'truck', confidence: 0.88, bbox: { x: 68, y: 22, width: 15, height: 24 }, trackingId: 12, color: '#3b82f6' },
      ],
      // Frame 2
      [
        { id: 'v2_1', label: 'car', confidence: 0.95, bbox: { x: 12, y: 36, width: 8, height: 7 }, trackingId: 10, color: '#10b981' },
        { id: 'v2_2', label: 'car', confidence: 0.93, bbox: { x: 43, y: 50, width: 11, height: 9 }, trackingId: 11, color: '#10b981' },
        { id: 'v2_3', label: 'truck', confidence: 0.89, bbox: { x: 67, y: 24, width: 15, height: 24 }, trackingId: 12, color: '#3b82f6' },
        { id: 'v2_4', label: 'car', confidence: 0.72, bbox: { x: 80, y: 65, width: 14, height: 12 }, trackingId: 13, color: '#10b981' },
      ],
      // Frame 3
      [
        { id: 'v3_1', label: 'car', confidence: 0.94, bbox: { x: 14, y: 37, width: 8, height: 7 }, trackingId: 10, color: '#10b981' },
        { id: 'v3_2', label: 'car', confidence: 0.94, bbox: { x: 41, y: 52, width: 12, height: 10 }, trackingId: 11, color: '#10b981' },
        { id: 'v3_3', label: 'truck', confidence: 0.90, bbox: { x: 66, y: 26, width: 15, height: 24 }, trackingId: 12, color: '#3b82f6' },
        { id: 'v3_4', label: 'car', confidence: 0.79, bbox: { x: 78, y: 68, width: 14, height: 12 }, trackingId: 13, color: '#10b981' },
      ],
      // Frame 4
      [
        { id: 'v4_1', label: 'car', confidence: 0.96, bbox: { x: 16, y: 38, width: 8, height: 7 }, trackingId: 10, color: '#10b981' },
        { id: 'v4_2', label: 'car', confidence: 0.95, bbox: { x: 39, y: 54, width: 12, height: 10 }, trackingId: 11, color: '#10b981' },
        { id: 'v4_3', label: 'truck', confidence: 0.91, bbox: { x: 65, y: 28, width: 15, height: 24 }, trackingId: 12, color: '#3b82f6' },
        { id: 'v4_4', label: 'car', confidence: 0.84, bbox: { x: 76, y: 71, width: 15, height: 13 }, trackingId: 13, color: '#10b981' },
      ],
      // Frame 5
      [
        { id: 'v5_1', label: 'car', confidence: 0.97, bbox: { x: 18, y: 39, width: 8, height: 7 }, trackingId: 10, color: '#10b981' },
        { id: 'v5_2', label: 'car', confidence: 0.93, bbox: { x: 37, y: 56, width: 13, height: 11 }, trackingId: 11, color: '#10b981' },
        { id: 'v5_3', label: 'truck', confidence: 0.91, bbox: { x: 64, y: 30, width: 15, height: 24 }, trackingId: 12, color: '#3b82f6' },
        { id: 'v5_4', label: 'car', confidence: 0.86, bbox: { x: 74, y: 74, width: 15, height: 13 }, trackingId: 13, color: '#10b981' },
      ],
    ],
  },
];

export const WEBCAM_SIMULATED_OBJECTS = [
  { label: 'person', confidenceMedian: 0.92, scoreVariance: 0.05, size: { width: 35, height: 60 }, color: '#ec4899' },
  { label: 'chair', confidenceMedian: 0.83, scoreVariance: 0.08, size: { width: 20, height: 40 }, color: '#06b6d4' },
  { label: 'laptop', confidenceMedian: 0.95, scoreVariance: 0.02, size: { width: 25, height: 25 }, color: '#3b82f6' },
  { label: 'bottle', confidenceMedian: 0.77, scoreVariance: 0.12, size: { width: 8, height: 16 }, color: '#10b981' },
  { label: 'cell phone', confidenceMedian: 0.88, scoreVariance: 0.04, size: { width: 6, height: 12 }, color: '#a855f7' },
  { label: 'keyboard', confidenceMedian: 0.81, scoreVariance: 0.07, size: { width: 18, height: 10 }, color: '#14b8a6' },
  { label: 'cup', confidenceMedian: 0.72, scoreVariance: 0.15, size: { width: 7, height: 12 }, color: '#eab308' },
];

export const GENERAL_YOLO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
  'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
  'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
  'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
  'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
  'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
  'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
  'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
  'toothbrush'
];
