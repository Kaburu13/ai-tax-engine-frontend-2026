// src/components/processing/processing_status.tsx
import React from 'react';
import { 
  Timer, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { ProcessingStatus as Status } from '../../types';

interface ProcessingStatusProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
}

const ProcessingStatusComponent: React.FC<ProcessingStatusProps> = ({
  status,
  size = 'md',
  showLabel = true,
  showIcon = true,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          badge: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3'
        };
      case 'lg':
        return {
          badge: 'px-4 py-2 text-base',
          icon: 'w-6 h-6'
        };
      default: // md
        return {
          badge: 'px-3 py-1.5 text-sm',
          icon: 'w-4 h-4'
        };
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          color: 'text-green-700 bg-green-100 border-green-200',
          icon: <CheckCircle2 className={getSizeClasses().icon} />,
          label: 'Completed'
        };
      case 'processing':
        return {
          color: 'text-blue-700 bg-blue-100 border-blue-200',
          icon: <Loader2 className={`${getSizeClasses().icon} animate-spin`} />,
          label: 'Processing'
        };
      case 'failed':
        return {
          color: 'text-red-700 bg-red-100 border-red-200',
          icon: <XCircle className={getSizeClasses().icon} />,
          label: 'Failed'
        };
      case 'pending':
        return {
          color: 'text-gray-700 bg-gray-100 border-gray-200',
          icon: <Timer className={getSizeClasses().icon} />,
          label: 'Pending'
        };
      default:
        return {
          color: 'text-gray-700 bg-gray-100 border-gray-200',
          icon: <Clock className={getSizeClasses().icon} />,
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = getSizeClasses();

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses.badge} rounded-full 
                font-medium border ${config.color} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && config.icon}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

export default ProcessingStatusComponent;