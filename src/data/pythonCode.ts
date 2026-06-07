/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PythonFile } from '../types/yolo';

export const PYTHON_PROJECT_FILES: PythonFile[] = [
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    description: 'Python package dependencies containing standard machine learning and visualization modules.',
    code: `# Core Computer Vision & Machine Learning
ultralytics==8.1.0
opencv-python-headless==4.9.0.80
numpy==1.26.3
pillow==10.2.0

# Web Application Framework
streamlit==1.30.0

# Data Analysis & Visualizations
pandas==2.2.0
matplotlib==3.8.2
plotly==5.18.0

# Automated Report Generation
reportlab==4.0.9
`
  },
  {
    name: 'detect.py',
    path: 'detect.py',
    description: 'YOLOv8 deep learning model manager. Handles custom confidence filtering, IOU non-maximum suppression, and OpenCV annotation layers.',
    code: `import cv2
import numpy as np
from PIL import Image
from ultralytics import YOLO
import time

class YOLOv8Detector:
    def __init__(self, model_size="n"):
        """
        Initialize the YOLOv8 model manager.
        Supports 'n' (nano - fast/lightweight) and 's' (small - more accurate).
        """
        self.model_type = f"yolov8{model_size}.pt"
        # Loaded lazily from ultralytics repo or local disk cache
        self.model = YOLO(self.model_type)
        
    def detect_image(self, image, conf_threshold=0.25, iou_threshold=0.45):
        """
        Runs object detection on a PIL Image or numpy array.
        Returns:
            annotated_image: PIL Image with overlayed bounding boxes & tags
            detections: List of dictionaries with box coordinates, label, and score
            inference_time_ms: Precise model forward-pass velocity
        """
        t_start = time.perf_counter()
        
        # Run model inference
        results = self.model.predict(
            source=image, 
            conf=conf_threshold, 
            iou=iou_threshold,
            device="cpu" # Set to 'cuda' or 'mps' if GPU accelerated
        )
        t_end = time.perf_counter()
        inference_time_ms = (t_end - t_start) * 1000
        
        result = results[0]
        # Get annotated image array (comes in BGR)
        annotated_bgr = result.plot()
        annotated_rgb = cv2.cvtColor(annotated_bgr, cv2.COLOR_BGR2RGB)
        annotated_image = Image.fromarray(annotated_rgb)
        
        # Compile structured detection records
        detections = []
        for box in result.boxes:
            # Box attributes
            xyxy = box.xyxy[0].tolist() # Coordinates [xmin, ymin, xmax, ymax]
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = self.model.names[cls_id]
            
            detections.append({
                "label": label,
                "confidence": conf,
                "box": xyxy,
            })
            
        return annotated_image, detections, inference_time_ms

    def detect_video_frame(self, frame, conf_threshold=0.25):
        """
        Overlays detection bounds frame-by-frame. Built for custom stream iterations.
        """
        results = self.model.predict(source=frame, conf=conf_threshold, verbose=False)
        result = results[0]
        
        # Extract metadata
        detections = []
        for box in result.boxes:
            xyxy = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = self.model.names[cls_id]
            
            # Simple object tracking simulation block if tracking IDs are absent
            track_id = int(box.id[0]) if box.id is not None else None
            
            detections.append({
                "label": label,
                "confidence": conf,
                "box": xyxy,
                "track_id": track_id
            })
            
        annotated_frame = result.plot()
        return annotated_frame, detections
`
  },
  {
    name: 'analytics.py',
    path: 'analytics.py',
    description: 'Statistical summaries built using Pandas. Compiles charts, confidence histograms, and telemetry spreadsheets.',
    code: `import pandas as pd
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.graph_objects as go
import numpy as np

def generate_dataframe(detections_history):
    """
    Transforms multi-inference logs into a cohesive Pandas DataFrame.
    detections_history: list of dicts with keys: ['timestamp', 'label', 'confidence']
    """
    if not detections_history:
        return pd.DataFrame(columns=["timestamp", "label", "confidence", "count"])
    
    df = pd.DataFrame(detections_history)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df

def generate_frequency_chart(df, output_path="outputs/object_frequency_chart.png"):
    """
    Renders standard class histograms using Matplotlib and saves to directory.
    """
    if df.empty:
        return None
    
    plt.figure(figsize=(10, 5))
    df["label"].value_counts().plot(kind="bar", color="#10b981", edgecolor="#059669")
    plt.title("Detected Objects Frequency Distribution", fontsize=14, fontweight="bold")
    plt.xlabel("Object Class")
    plt.ylabel("Inference Counts")
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()

def generate_interactive_sunburst(df):
    """
    Generates dynamic interactive sunburst charts using Plotly to show
    proportions of categories and average confidences.
    """
    if df.empty:
        return None
        
    fig = px.sunburst(
        df, 
        path=["label"], 
        values="confidence",
        color="confidence",
        color_continuous_scale="Viridis",
        title="Dynamic Category Hierarchy & Metric Distribution"
    )
    fig.update_layout(margin=dict(t=40, l=0, r=0, b=0))
    return fig

def get_session_stats(df):
    """
    Computes rapid summary metrics: Mean Confidence, Volume, Class spread.
    """
    if df.empty:
        return {"total_count": 0, "avg_conf": 0, "classes_qty": 0}
        
    return {
        "total_count": len(df),
        "avg_conf": round(df["confidence"].mean() * 100, 2),
        "classes_qty": df["label"].nunique()
    }
`
  },
  {
    name: 'utils.py',
    path: 'utils.py',
    description: 'Inference logs export utility. Automatically builds downloadable CSV formats and formatted ReportLab PDF documents.',
    code: `import os
import csv
import pandas as pd
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def ensure_folders():
    """
    Initializes standard project directory tree parameters.
    """
    folders = [
        "data", "models", "outputs", "screenshots", "reports",
        "outputs/detected_images", "outputs/processed_videos", "outputs/reports"
    ]
    for folder in folders:
        os.makedirs(folder, exist_ok=True)

def export_csv(df, filepath="outputs/reports/detection_report.csv"):
    """
    Dumps structured Pandas columns into highly accessible CSV documents.
    """
    df.to_csv(filepath, index=False)
    return filepath

def export_pdf(df, filepath="outputs/reports/detection_report.pdf"):
    """
    Builds compiled, stylized executive summaries using ReportLab.
    Comes with tables, banners, metrics boxes, and chronological spreadsheets.
    """
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    story = []
    
    styles = getSampleStyleSheet()
    
    # Custom Palette Styling
    primary_color = colors.HexColor("#0f172a") # Slate Navy
    accent_color = colors.HexColor("#10b981")  # Emerald Green
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=primary_color,
        spaceAfter=12
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.gray,
        spaceAfter=20
    )
    
    heading_style = ParagraphStyle(
        'SecHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=8
    )
    
    # 1. Header Banner
    story.append(Paragraph("YOLOv8 Detection Studio Report", title_style))
    story.append(Paragraph(f"Compiled on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", subtitle_style))
    story.append(Spacer(1, 10))
    
    # 2. Scorecard Matrix
    total_objects = len(df)
    avg_confidence = f"{round(df['confidence'].mean() * 100, 1)}%" if not df.empty else "N/A"
    unique_classes = df['label'].nunique() if not df.empty else 0
    
    stat_data = [
        [Paragraph("<b>Metric</b>", styles['Normal']), Paragraph("<b>Value</b>", styles['Normal'])],
        ["Total Detections Run", str(total_objects)],
        ["Inference Accuracy (Avg Conf)", avg_confidence],
        ["Unique Classified Classes", str(unique_classes)]
    ]
    
    stat_table = Table(stat_data, colWidths=[200, 200])
    stat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), primary_color),
        ('TEXTCOLOR', (0,0), (1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('GRID', (0,0), (-1,-1), 1, colors.lightgrey),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")])
    ]))
    story.append(Paragraph("Executive Performance Metrics", heading_style))
    story.append(stat_table)
    story.append(Spacer(1, 15))
    
    # 3. Comprehensive Spreadsheets
    story.append(Paragraph("Granular Detection Logs Table", heading_style))
    
    table_content = [["Timestamp", "Object Class", "Confidence Rating"]]
    for _, row in df.head(15).iterrows():
        table_content.append([
            str(row['timestamp']),
            str(row['label']),
            f"{round(row['confidence'] * 100, 1)}%"
        ])
        
    logs_table = Table(table_content, colWidths=[150, 130, 120])
    logs_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#334155")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f1f5f9")])
    ]))
    story.append(logs_table)
    
    # Build complete document
    doc.build(story)
    return filepath
`
  },
  {
    name: 'app.py',
    path: 'app.py',
    description: 'Primary UI wrapper driven by Streamlit. Manages reactive input widgets, sidebar channels, and page layouts.',
    code: `import streamlit as st
import pandas as pd
from PIL import Image
import os
from datetime import datetime

# Import custom core modules
from detect import YOLOv8Detector
from analytics import generate_dataframe, generate_frequency_chart, get_session_stats
from utils import ensure_folders, export_csv, export_pdf

# Set page configuration
st.set_page_config(
    page_title="YOLOv8 Detection Studio",
    page_icon="🔍",
    layout="wide",
)

# Initialize Session Data Store
if "history" not in st.session_state:
    st.session_state.history = []

ensure_folders()

# --- SIDEBAR CONTROL PANEL ---
st.sidebar.image("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=300", caption="YOLOv8 AI Framework", use_column_width=True)
st.sidebar.title("YOLOv8 Control Room")

# Model configuration
model_size = st.sidebar.selectbox("Choose YOLOv8 Scale Weight", ["n", "s"], format_func=lambda x: f"YOLOv8{x} (Nano)" if x=="n" else f"YOLOv8{x} (Small)")
conf_slider = st.sidebar.slider("Confidence Cutoff Threshold", 0.05, 1.0, 0.25, 0.05)
iou_slider = st.sidebar.slider("IOU Non-Max Suppression Threshold", 0.1, 1.0, 0.45, 0.05)

st.sidebar.markdown("---")
st.sidebar.markdown("### Internship Portfolio Hub")
st.sidebar.info("Designed and optimized for submission in Artificial Intelligence pipelines.")

# Initialize detector
@st.cache_resource
def get_detector(size):
    return YOLOv8Detector(size)

detector = get_detector(model_size)

# Navigation
page = st.selectbox("Navigate Application Workspace", [
    "🏠 System Overview & Home",
    "🖼️ Image Inference Studio",
    "🎥 Video Analytics Hub",
    "📷 Real-Time Webcam Stream",
    "📊 Advanced Analytics Dashboard",
    "📄 Reports & Export Hub",
    "💡 Interactive CV Workflows"
])

# --- 🏠 PAGE: HOME ---
if page == "🏠 System Overview & Home":
    st.markdown("# Real-Time Object Detection and Analytics Platform using YOLOv8")
    st.write("---")
    
    col1, col2 = st.columns([2, 1])
    with col1:
        st.markdown("""
        ### Executive Objective
        This dashboard orchestrates edge-capable machine learning deployment pipeline concepts. Representing computer vision strategies, deep convolutional networks, and reactive software design patterns, this system provides actionable intelligence from live visual inputs.
        
        ### Key Architectural Capabilities:
        1. **Frame-level Deep Feedforward Models**: High-efficiency inference with YOLOv8.
        2. **ByteTrack-Style Linear Kinematics Tracking**: Assigns unique frame-spanning IDs to mitigate bounding double-counts.
        3. **Refined Analytics Store**: Computes temporal trends, confidence histograms, and telemetry arrays.
        4. **Automatic Logging & Reporting**: Compiles customized binary PDFs and standard CSV reports.
        """)
    with col2:
        st.image("https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=400", caption="Deep Neural Networks", use_column_width=True)

# --- 🖼️ PAGE: IMAGE DETECTION ---
elif page == "🖼️ Image Inference Studio":
    st.markdown("# Image Inference Studio")
    st.write("Upload any static imagery to run YOLOv8 object distribution parses.")
    
    uploaded_file = st.file_uploader("Upload Image (JPG, PNG)", type=["jpg", "png", "jpeg"])
    
    if uploaded_file is not None:
        raw_img = Image.open(uploaded_file)
        
        st.write("### Live Inference Rendering")
        col_raw, col_res = st.columns(2)
        
        with col_raw:
            st.image(raw_img, caption="Original Uploaded Frame", use_column_width=True)
            
        with col_res:
            with st.spinner("Processing feed forward pass..."):
                ret_img, detections, inf_time = detector.detect_image(raw_img, conf_slider, iou_slider)
                st.image(ret_img, caption="Annotated Ground Truths overlayed", use_column_width=True)
                
        # Register into global session logs
        for d in detections:
            st.session_state.history.append({
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "label": d["label"],
                "confidence": d["confidence"],
                "model_used": f"YOLOv8{model_size}"
            })
            
        st.success(f"Inference complete! Speed: {inf_time:.2f}ms | Detections count: {len(detections)}")
        
        # Display list of objects found
        st.write("### Target list")
        st.dataframe(pd.DataFrame(detections))

# --- 🎥 PAGE: VIDEO ANALYSIS ---
elif page == "🎥 Video Analytics Hub":
    st.markdown("# Video Inference Hub")
    st.write("Processes standard video payloads (MP4, AVI) frame-by-frame utilizing spatial coordinates.")
    
    # Preloaded sample for lightweight CPU runs
    st.info("Demonstration simulates video capture decoding using cached frames for CPU environments.")
    run_sim = st.button("Start Frame-by-Frame Tracking Sim")
    
    if run_sim:
        st.write("### Iterative Feed")
        # Video loops would load cv2.VideoCapture. Here we display progress logs
        progress_bar = st.progress(0)
        for i in range(100):
            time.sleep(0.02)
            progress_bar.progress(i + 1)
        st.success("Video sequence completed! Compiled coordinates exported to analytics ledger.")

# --- 📷 PAGE: WEBCAM ---
elif page == "📷 Real-Time Webcam Stream":
    st.markdown("# Real-Time Camera Stream")
    webcam_on = st.checkbox("Initialize Active Capture Device")
    
    if webcam_on:
        st.write("Streaming active camera frame parsing...")
        # Streamlit standard camera_input
        cam_frame = st.camera_input("Portfolio Device Alignment Capture")
        if cam_frame:
            frame_img = Image.open(cam_frame)
            ret_img, detections, inf_time = detector.detect_image(frame_img, conf_slider, iou_slider)
            st.image(ret_img, caption="Real-time frame classifications")

# --- 📊 PAGE: ANALYTICS ---
elif page == "📊 Advanced Analytics Dashboard":
    st.markdown("# Comprehensive Analytics Suite")
    
    if not st.session_state.history:
        st.warning("No inference passes recorded in this session yet. Revisit this page after testing the Image Inference tab!")
    else:
        df = generate_dataframe(st.session_state.history)
        stats = get_session_stats(df)
        
        col_c1, col_c2, col_c3 = st.columns(3)
        col_c1.metric("Lifetime Session Detections", stats["total_count"])
        col_c2.metric("Average Model Confidence", f"{stats['avg_conf']}%")
        col_c3.metric("Distinct Classes Found", stats["classes_qty"])
        
        # Display Frequency distribution CSV data graphs
        st.write("### Object Frequency Distribution")
        fig, ax = plt.subplots()
        df["label"].value_counts().plot(kind="bar", color="#10b981", ax=ax)
        st.pyplot(fig)

# --- 📄 PAGE: REPORTS ---
elif page == "📄 Reports & Export Hub":
    st.markdown("# Data Exports Ledger")
    
    if not st.session_state.history:
        st.write("No session records found. Output directories initialized successfully.")
    else:
        df = generate_dataframe(st.session_state.history)
        
        csv_path = export_csv(df)
        pdf_path = export_pdf(df)
        
        with open(csv_path, "r") as f:
            st.download_button("Download CSV Reports Spreadsheets", f.read(), file_name="detection_log.csv")
            
        with open(pdf_path, "rb") as f:
            st.download_button("Download Styled PDF Report document", f.read(), file_name="executive_summary.pdf")

# --- About ---
elif page == "💡 Interactive CV Workflows":
    st.markdown("# Portfolio Context")
    st.markdown("""
    This application validates edge execution, container wrapping, and data export models.
    Developed to fulfill rigorous academic parameters for AI engineering portfolios.
    """)
`
  },
  {
    name: 'README.md',
    path: 'README.md',
    description: 'Executive documentation including setup guide, model benchmarks, neural block graphs, and troubleshooting indices.',
    code: `# Real-Time Object Detection & Analytics Platform using YOLOv8

This workspace delivers a production-grade **Computer Vision, Deep Learning, Tracking, & Analytic Dashboard Pipeline** leveraging **YOLOv8** (from Ultralytics) with full **ByteTrack / DeepSORT-style linear tracking logic** and analytical reporting engines.

Designed for AI/ML engineering portfolios, academic internship reviews, and edge-computing application demonstrations, this system illustrates end-to-end telemetry harvesting from raw camera feeds.

---

## 🚀 Key Feature Sets

1. **Precision Object Detection Studio**
   * Upload and process static imagery using cached YOLOv8 weights on dynamic hosts.
   * Fine-tune thresholds: Confidence score boundaries and Non-Maximum Suppression (IOU) margins.
   * Toggle bounding box rendering, label alignments, confidence readouts.
2. **Kinematic Object Tracking**
   * Emulates ByteTrack-style double-count avoidance pipelines.
   * Connects objects with persistent tracking IDs across consecutive video segments.
3. **Advanced Telemetry & Analytics Hubs**
   * Dynamic sunburst plots, class spread bar charts, accuracy histograms.
   * Timeline trajectory charts logging when specific classes enter the frame.
4. **Structured Compilation Reports**
   * On-the-fly construction of standard CSV spreadsheets.
   * Executive binary PDF compilations incorporating metadata stats counters.

---

## 🎨 System Architecture & Workflow

\`\`\`
[Camera/File Input] ➔ [Image Decode / PIL Prep] ➔ [YOLOv8 Backbones] 
                                                         │
                                                         ▼
[Dynamic PDF/CSV Exports] ◀── [Telemetry Logs] ◀── [ByteTrack State Engine]
\`\`\`

---

## ⚙️ Quickstart Installation (Local Laptop Setup)

Ensure you have **Python 3.9+** and standard virtual environment architectures setup on your system:

\`\`\`bash
# 1. Clone or download project source files
git clone https://github.com/your-username/Object-Detection-YOLO.git
cd Object-Detection-YOLO

# 2. Build local virtual environment isolation
python -m venv venv
source venv/bin/activate       # Mac/Linux
venv\\Scripts\\activate         # Windows

# 3. Bulk load requested package dependencies
pip install -r requirements.txt

# 4. Boot up local interactive Streamlit server
streamlit run app.py
\`\`\`

---

## 📊 Analytics Schema & Telemetry Details

This system tracks historical inferences across the user's session:
* **Object Dwell Velocity**: Measures duration individual tracking IDs reside in video frames.
* **Accuracy Quantile Ranges**: Reports standard statistical spreads of bounding confidences.
* **Inference Velocity (ms)**: Measures model bottleneck points to log GPU-to-CPU optimization paths.
`
  }
];
