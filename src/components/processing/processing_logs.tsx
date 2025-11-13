// src/components/processing/processing_logs.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  XCircle,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { ProcessingLog } from '../../types';

interface ProcessingLogsProps {
  logs: ProcessingLog[];
  maxHeight?: string;
  autoScroll?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  showDownload?: boolean;
  className?: string;
}

const ProcessingLogs: React.FC<ProcessingLogsProps> = ({
  logs,
  maxHeight = '400px',
  autoScroll = true,
  showSearch = true,
  showFilter = true,
  showDownload = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [filteredLogs, setFilteredLogs] = useState<ProcessingLog[]>(logs);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Filter logs based on search and level
  useEffect(() => {
    let filtered = logs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter]);

  const getLevelConfig = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info':
        return {
          color: 'text-blue-700 bg-blue-100',
          icon: <Info className="w-4 h-4" />
        };
      case 'success':
        return {
          color: 'text-green-700 bg-green-100',
          icon: <CheckCircle2 className="w-4 h-4" />
        };
      case 'warning':
        return {
          color: 'text-yellow-700 bg-yellow-100',
          icon: <AlertCircle className="w-4 h-4" />
        };
      case 'error':
        return {
          color: 'text-red-700 bg-red-100',
          icon: <XCircle className="w-4 h-4" />
        };
      default:
        return {
          color: 'text-gray-700 bg-gray-100',
          icon: <Activity className="w-4 h-4" />
        };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const handleDownloadLogs = () => {
    const logsText = filteredLogs
      .map(log => `[${formatTimestamp(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processing-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelCount = (level: string) => {
    return logs.filter(log => log.level === level).length;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Processing Logs ({filteredLogs.length})
          </h3>
          {showDownload && (
            <button
              onClick={handleDownloadLogs}
              className="px-3 py-1.5 text-sm text-[#00338D] hover:bg-blue-50 
                       rounded-lg transition-colors flex items-center gap-2"
              disabled={filteredLogs.length === 0}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </div>

        {/* Search and Filter */}
        {(showSearch || showFilter) && (
          <div className="flex gap-3">
            {showSearch && (
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
                />
              </div>
            )}

            {showFilter && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-[#00338D] focus:border-transparent 
                           appearance-none bg-white"
                >
                  <option value="all">All Levels ({logs.length})</option>
                  <option value="info">Info ({getLevelCount('info')})</option>
                  <option value="success">Success ({getLevelCount('success')})</option>
                  <option value="warning">Warning ({getLevelCount('warning')})</option>
                  <option value="error">Error ({getLevelCount('error')})</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logs Content */}
      <div
        className="overflow-y-auto font-mono text-sm"
        style={{ maxHeight }}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mb-3 text-gray-400" />
            <p>
              {logs.length === 0
                ? 'No logs available yet'
                : 'No logs match your search criteria'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log, index) => {
              const config = getLevelConfig(log.level);
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Timestamp */}
                  <span className="text-xs text-gray-500 font-normal mt-1 w-20 flex-shrink-0">
                    {formatTimestamp(log.timestamp)}
                  </span>

                  {/* Level Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full 
                              text-xs font-medium ${config.color} flex-shrink-0`}
                  >
                    {config.icon}
                    {log.level.toUpperCase()}
                  </span>

                  {/* Message */}
                  <span className="text-gray-700 flex-1 break-words">
                    {log.message}
                  </span>
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {logs.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Total: {logs.length} | Showing: {filteredLogs.length}
            </span>
            <div className="flex gap-3">
              {getLevelCount('error') > 0 && (
                <span className="text-red-600 font-medium">
                  {getLevelCount('error')} errors
                </span>
              )}
              {getLevelCount('warning') > 0 && (
                <span className="text-yellow-600 font-medium">
                  {getLevelCount('warning')} warnings
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingLogs;