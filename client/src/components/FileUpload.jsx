import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FileUpload({ onUpload }) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

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
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        onUpload(file);
        setUploading(false);
        setFile(null);
    };

    return (
        <div className="w-full">
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
                />

                <div className="flex flex-col items-center justify-center space-y-4">
                    {file ? (
                        <>
                            <FileText className="h-12 w-12 text-blue-500" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                            <Button
                                onClick={(e) => { e.preventDefault(); handleUpload(); }}
                                disabled={uploading}
                                className="z-10 bg-blue-600"
                            >
                                {uploading ? "Ingesting..." : "Confirm Upload"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Upload className="h-12 w-12 text-muted-foreground" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Drag & drop your framework here</p>
                                <p className="text-xs text-muted-foreground">PDF, TXT, or DOCX (Max 10MB)</p>
                            </div>
                            <Button variant="outline" className="z-10 pointer-events-none">Select File</Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
