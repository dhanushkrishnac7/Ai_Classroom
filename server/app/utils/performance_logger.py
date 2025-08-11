import logging
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

# Create logs directory if it doesn't exist
logs_dir = Path("logs")
logs_dir.mkdir(exist_ok=True)

# Configure performance logger
performance_logger = logging.getLogger("performance")
performance_logger.setLevel(logging.INFO)

# Create file handler for performance logs
performance_handler = logging.FileHandler(logs_dir / "performance.log")
performance_handler.setLevel(logging.INFO)

# Create formatter
formatter = logging.Formatter('%(asctime)s - %(message)s')
performance_handler.setFormatter(formatter)

# Add handler to logger
if not performance_logger.handlers:
    performance_logger.addHandler(performance_handler)

class PerformanceTracker:
    def __init__(self, operation_name: str, doc_id: str = None):
        self.operation_name = operation_name
        self.doc_id = doc_id
        self.start_time = None
        self.metrics = {}
        
    def start(self):
        self.start_time = time.time()
        return self
        
    def log_metric(self, metric_name: str, value: Any):
        self.metrics[metric_name] = value
        
    def finish(self, additional_data: Dict = None):
        if self.start_time is None:
            return
            
        duration = time.time() - self.start_time
        
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "operation": self.operation_name,
            "doc_id": self.doc_id,
            "duration_seconds": round(duration, 2),
            "metrics": self.metrics
        }
        
        if additional_data:
            log_data.update(additional_data)
            
        performance_logger.info(json.dumps(log_data))
        return duration

def log_ocr_batch_performance(doc_id: str, batch_info: Dict):
    """Log OCR batch processing performance."""
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "operation": "ocr_batch",
        "doc_id": doc_id,
        **batch_info
    }
    performance_logger.info(json.dumps(log_data))

def log_processing_summary(doc_id: str, summary: Dict):
    """Log overall document processing summary."""
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "operation": "document_processing_summary",
        "doc_id": doc_id,
        **summary
    }
    performance_logger.info(json.dumps(log_data))