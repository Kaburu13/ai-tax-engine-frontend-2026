// src/components/workbook/workbook_upload.tsx
import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  FileSpreadsheet, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface WorkbookUploadProps {
  onUploadSuccess?: (workbookId: number) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  className?: string;
}

const WorkbookUpload: React.FC<WorkbookUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  maxFileSize = 50,
  acceptedFormats = ['.xlsx', '.xlsm', '.xls'],
  className = ''
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((selectedFile: File): string | null => {
    // Check file extension
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return `Invalid file type. Please upload an Excel file (${acceptedFormats.join(', ')})`;
    }

    // Check file size
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      return `File size exceeds ${maxFileSize}MB limit. Please upload a smaller file.`;
    }

    return null;
  }, [acceptedFormats, maxFileSize]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  }, [validateFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const simulateProgress = useCallback(() => {
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 95) {
        clearInterval(interval);
        setUploadProgress(95);
      } else {
        setUploadProgress(Math.min(progress, 95));
      }
    }, 200);
    return interval;
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    const progressInterval = simulateProgress();

    try {
      // Simulate API call - replace with actual API call
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful response
      const mockResponse = {
        id: Math.floor(Math.random() * 10000),
        file_name: file.name
      };

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      setFile(null);

      if (onUploadSuccess) {
        onUploadSuccess(mockResponse.id);
      }

      // Reset after success
      setTimeout(() => {
        setSuccess(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (err: any) {
      clearInterval(progressInterval);
      const errorMessage = err.response?.data?.error || 'Failed to upload file. Please try again.';
      setError(errorMessage);
      
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  }, [file, onUploadSuccess, onUploadError, simulateProgress]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {!file ? (
        /* Upload Area */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center 
                    transition-all cursor-pointer ${
                      dragActive
                        ? 'border-[#00338D] bg-blue-50'
                        : 'border-gray-300 hover:border-[#00338D] hover:bg-blue-50'
                    }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedFormats.join(',')}
            onChange={handleFileInputChange}
            disabled={uploading}
          />

          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center 
                          justify-center mb-4 md:mb-6 ${
                            dragActive ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
              <Upload className={`w-8 h-8 md:w-10 md:h-10 ${
                dragActive ? 'text-[#00338D]' : 'text-gray-400'
              }`} />
            </div>

            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              {dragActive ? 'Drop your file here' : 'Upload Excel Workbook'}
            </h3>
            
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Drag and drop your file here, or click to browse
            </p>

            <button
              type="button"
              className="px-6 py-3 bg-[#00338D] text-white rounded-lg font-semibold 
                       hover:bg-[#00205B] transition-all shadow-lg text-sm md:text-base"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose File
            </button>

            <p className="text-xs md:text-sm text-gray-500 mt-4">
              Supported formats: {acceptedFormats.join(', ')} • Max size: {maxFileSize}MB
            </p>
          </div>
        </div>
      ) : (
        /* File Preview & Upload */
        <div className="space-y-4">
          {/* Selected File */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg 
                        border border-gray-200">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center 
                            justify-center flex-shrink-0">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            {!uploading && !success && (
              <button
                onClick={handleRemoveFile}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-900 font-medium">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#00338D] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!success && (
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-[#00338D] text-white rounded-lg font-semibold 
                         hover:bg-[#00205B] transition-all disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload & Process
                  </>
                )}
              </button>
              <button
                onClick={handleRemoveFile}
                disabled={uploading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg 
                         font-semibold hover:bg-gray-50 transition-all 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg 
                      flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-900">Upload Failed</h4>
            <p className="text-red-700 mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg 
                      flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900">Upload Successful!</h4>
            <p className="text-green-700 mt-1 text-sm">
              Your workbook is being processed. You'll be redirected shortly.
            </p>
          </div>
        </div>
      )}

      {/* Requirements Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">Upload Requirements</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Excel file format: {acceptedFormats.join(', ')}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Maximum file size: {maxFileSize}MB</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Must contain trial balances, tax computation, and supporting schedules</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Include both current year and prior year sheets for best results</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WorkbookUpload;