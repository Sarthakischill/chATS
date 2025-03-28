"use client";

import { useState } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";

interface FileUploadProps {
  id: string;
  onFileUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
  acceptedTypes?: string;
  isLoading?: boolean;
  file: File | null;
  error?: string;
  placeholderText?: string;
  description?: string;
  className?: string;
}

export function FileUpload({
  id,
  onFileUpload,
  onRemove,
  acceptedTypes = ".pdf,.txt,.docx,.doc",
  isLoading = false,
  file,
  error,
  placeholderText = "Upload your file",
  description = "Supported formats: PDF, DOCX, TXT",
  className = "",
}: FileUploadProps) {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFile = e.target.files[0];
    await onFileUpload(selectedFile);
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
        error ? 'border-red-500' : 'border-border'
      } hover:border-primary transition-colors ${className}`}
    >
      {file && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted transition-colors"
          type="button"
          aria-label="Remove file"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
      )}
      <input
        type="file"
        id={id}
        className="hidden"
        accept={acceptedTypes}
        onChange={handleChange}
        disabled={isLoading}
      />
      <label 
        htmlFor={id} 
        className="cursor-pointer flex flex-col items-center"
      >
        {!file ? (
          <>
            <Upload className="h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-medium">{placeholderText}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {description}
            </p>
          </>
        ) : (
          <>
            <FileText className="h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            {isLoading && (
              <div className="mt-4 flex items-center justify-center w-full">
                <div className="rounded-lg bg-secondary px-3 py-1 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>
                    {file.type === "application/pdf" 
                      ? "Extracting text from PDF..." 
                      : "Processing file..."}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </label>
    </div>
  );
} 