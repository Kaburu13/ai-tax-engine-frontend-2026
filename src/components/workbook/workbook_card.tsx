// src/components/workbook/workbook_card.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Calendar, 
  Building2,
  Timer,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Workbook, ProcessingStatus } from '../../types';

interface WorkbookCardProps {
  workbook: Workbook;
  onClick?: () => void;
  showDetails?: boolean;
  className?: string;
}

const WorkbookCard: React.FC<WorkbookCardProps> = ({
  workbook,
  onClick,
  showDetails = true,
  className = ''
}) => {
  const getStatusColor = (status: ProcessingStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: ProcessingStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'processing':
        return <Timer className="w-4 h-4 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileSpreadsheet className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const cardContent = (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all 
                overflow-hidden border border-gray-200 hover:border-[#00338D] 
                ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-[#00338D] to-[#00205B] p-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center 
                          justify-center flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1 truncate" title={workbook.file_name}>
                {workbook.file_name}
              </h3>
              <p className="text-xs text-blue-100">
                {formatFileSize(workbook.file_size)}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full 
                          text-xs font-medium border ${getStatusColor(workbook.status)}`}>
            {getStatusIcon(workbook.status)}
            {workbook.status.charAt(0).toUpperCase() + workbook.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Company Name */}
        {workbook.company_name && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate">
              {workbook.company_name}
            </span>
          </div>
        )}

        {/* Years */}
        {workbook.current_year && workbook.prior_year && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              {workbook.prior_year} - {workbook.current_year}
            </span>
          </div>
        )}

        {/* Sheets Count */}
        {workbook.sheets && workbook.sheets.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <FileSpreadsheet className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              {workbook.sheets.length} sheet{workbook.sheets.length !== 1 ? 's' : ''} detected
            </span>
          </div>
        )}

        {/* Sector */}
        {workbook.sector && (
          <div className="pt-2 border-t border-gray-200">
            <span className="inline-flex px-2 py-1 rounded text-xs font-medium 
                          bg-blue-100 text-blue-700">
              {workbook.sector}
            </span>
          </div>
        )}

        {/* Upload Date */}
        <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
          Uploaded {formatDate(workbook.uploaded_at)}
        </div>

        {/* Show Details Link/Button */}
        {showDetails && (
          <div className="pt-2">
            <Link
              to={`/workbook/${workbook.id}`}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 
                       bg-[#00338D] text-white rounded-lg font-medium text-sm
                       hover:bg-[#00205B] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return cardContent;
};

export default WorkbookCard;