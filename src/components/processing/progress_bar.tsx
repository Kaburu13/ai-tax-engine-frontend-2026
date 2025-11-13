// src/components/processing/progress_bar.tsx
import React from 'react';
import { Timer, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0-100
  status: 'processing' | 'completed' | 'failed';
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  label,
  showPercentage = true,
  animated = true
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-[#00338D]';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Timer className="w-4 h-4 text-[#00338D] animate-pulse" />;
    }
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {/* Label and Status */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {label && (
              <span className="text-sm font-medium text-gray-700">{label}</span>
            )}
          </div>
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900">
              {clampedProgress}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getStatusColor()} ${
            animated && status === 'processing' ? 'progress-bar-animated' : ''
          }`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Status Text */}
      {status === 'completed' && (
        <p className="text-xs text-green-600 mt-1 font-medium">
          Processing completed successfully
        </p>
      )}
      {status === 'failed' && (
        <p className="text-xs text-red-600 mt-1 font-medium">
          Processing failed
        </p>
      )}

      {/* CSS for animated stripes */}
      <style>{`
        @keyframes progress-bar-stripes {
          0% {
            background-position: 1rem 0;
          }
          100% {
            background-position: 0 0;
          }
        }

        .progress-bar-animated {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%,
            transparent
          );
          background-size: 1rem 1rem;
          animation: progress-bar-stripes 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;