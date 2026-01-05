from typing import Optional
from pathlib import Path

try:
    from pypdf import PdfReader
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False


class DocumentReader:
    """
    Tool for reading PDF and text documents.
    """
    
    def read_pdf(self, file_path: str) -> str:
        """
        Extract text from a PDF file.
        """
        if not PDF_AVAILABLE:
            raise ImportError("pypdf is not installed. Run: pip install pypdf")
        
        reader = PdfReader(file_path)
        text_parts = []
        
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
        
        full_text = "\n\n".join(text_parts)
        print(f"[DocumentReader] Extracted {len(full_text)} chars from {Path(file_path).name}")
        return full_text

    def read_text(self, file_path: str, encoding: str = "utf-8") -> str:
        """
        Read a plain text file.
        """
        with open(file_path, "r", encoding=encoding) as f:
            content = f.read()
        print(f"[DocumentReader] Read {len(content)} chars from {Path(file_path).name}")
        return content

    def read_bytes(self, content: bytes, filename: str) -> str:
        """
        Read document from bytes (for file uploads).
        """
        if filename.lower().endswith(".pdf"):
            if not PDF_AVAILABLE:
                raise ImportError("pypdf is not installed. Run: pip install pypdf")
            
            import io
            reader = PdfReader(io.BytesIO(content))
            text_parts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            return "\n\n".join(text_parts)
        else:
            # Assume text file
            return content.decode("utf-8", errors="ignore")

    def detect_type(self, filename: str) -> str:
        """Detect document type from filename."""
        ext = Path(filename).suffix.lower()
        if ext == ".pdf":
            return "pdf"
        elif ext in [".txt", ".md", ".csv"]:
            return "text"
        else:
            return "unknown"
