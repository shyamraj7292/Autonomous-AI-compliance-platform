import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadDocument } from '@/lib/api';

export function FileUpload({ onUpload }) {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState([]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = [...files, ...Array.from(e.dataTransfer.files)];
            setFiles(newFiles);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = [...files, ...Array.from(e.target.files)];
            setFiles(newFiles);
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setResults([]);

        try {
            // Create FormData with multiple files
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await fetch('http://localhost:8000/api/agents/ingest', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            setResults(data.results || []);

            if (onUpload) {
                onUpload(data);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setResults([{ status: 'error', error: error.message }]);
        }

        setUploading(false);
        setFiles([]);
    };

    return (
        <div className="w-full space-y-4">
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-muted-foreground/25 hover:border-blue-500/50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept=".pdf,.txt,.docx"
                    multiple
                />

                <div className="flex flex-col items-center justify-center space-y-4">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Drag & drop your files here</p>
                        <p className="text-xs text-muted-foreground">PDF, TXT, or DOCX • Multiple files supported</p>
                    </div>
                    <Button variant="outline" className="z-10 pointer-events-none">Select Files</Button>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">{files.length} file(s) selected:</p>
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-destructive/20 rounded-full"
                            >
                                <X className="h-4 w-4 text-destructive" />
                            </button>
                        </div>
                    ))}
                    <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full bg-blue-600"
                    >
                        {uploading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Ingesting {files.length} file(s)...
                            </div>
                        ) : (
                            `Upload & Analyze ${files.length} file(s)`
                        )}
                    </Button>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Processing Results:</p>
                    {results.map((result, index) => (
                        <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${result.status === 'processed' ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}>
                            {result.status === 'processed' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <X className="h-5 w-5 text-red-500" />
                            )}
                            <div>
                                <p className="text-sm font-medium">{result.filename || 'File'}</p>
                                <p className="text-xs text-muted-foreground">
                                    {result.status === 'processed'
                                        ? `Client: ${result.client} • ${result.chars_extracted} chars extracted`
                                        : result.error
                                    }
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
