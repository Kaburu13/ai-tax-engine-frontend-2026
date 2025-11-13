// src/components/workbook/sheet_list.tsx
import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { Sheet, SheetType } from '../../types';

interface SheetListProps {
  sheets: Sheet[];
  loading?: boolean;
  showSearch?: boolean;
  showFilter?: boolean;
  showStats?: boolean;
  className?: string;
}

const SheetList: React.FC<SheetListProps> = ({
  sheets,
  loading = false,
  showSearch = true,
  showFilter = true,
  showStats = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<SheetType | 'all'>('all');

  const getSheetTypeColor = (sheetType: SheetType) => {
    const types: { [key: string]: string } = {
      'tax_computation': 'bg-purple-100 text-purple-700 border-purple-200',
      'trial_balance': 'bg-blue-100 text-blue-700 border-blue-200',
      'extended_trial_balance': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'updated_trial_balance': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'provisions': 'bg-green-100 text-green-700 border-green-200',
      'investment_allowances': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'deferred_tax': 'bg-red-100 text-red-700 border-red-200',
      'unknown': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return types[sheetType] || types['unknown'];
  };

  const formatSheetType = (sheetType: SheetType) => {
    return sheetType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSheetTypes = (): SheetType[] => {
    const types = new Set(sheets.map(s => s.sheet_type));
    return Array.from(types).sort();
  };

  const getTypeCount = (type: SheetType) => {
    return sheets.filter(s => s.sheet_type === type).length;
  };

  const filteredSheets = sheets.filter(sheet => {
    const matchesSearch = sheet.sheet_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || sheet.sheet_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getConfidenceColor = (score: number | null) => {
    if (score === null) return 'text-gray-600';
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00338D]"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with Stats */}
      {showStats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Total Sheets</p>
            <p className="text-2xl font-bold text-gray-900">{sheets.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Data Extracted</p>
            <p className="text-2xl font-bold text-green-600">
              {sheets.filter(s => s.data_extracted).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Sheet Types</p>
            <p className="text-2xl font-bold text-blue-600">{getSheetTypes().length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">High Confidence</p>
            <p className="text-2xl font-bold text-purple-600">
              {sheets.filter(s => s.confidence_score && s.confidence_score >= 0.9).length}
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {(showSearch || showFilter) && (
        <div className="mb-6 flex gap-3">
          {showSearch && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sheets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
              />
            </div>
          )}

          {showFilter && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as SheetType | 'all')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-[#00338D] focus:border-transparent 
                         appearance-none bg-white"
              >
                <option value="all">All Types ({sheets.length})</option>
                {getSheetTypes().map(type => (
                  <option key={type} value={type}>
                    {formatSheetType(type)} ({getTypeCount(type)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Sheets List */}
      {filteredSheets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {sheets.length === 0 ? 'No sheets detected yet' : 'No sheets match your search'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSheets.map((sheet) => (
            <div
              key={sheet.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 
                       hover:border-[#00338D] hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Sheet Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center 
                                justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate" title={sheet.sheet_name}>
                      {sheet.sheet_name}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Sheet Type Badge */}
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border
                                      ${getSheetTypeColor(sheet.sheet_type)}`}>
                        {formatSheetType(sheet.sheet_type)}
                      </span>

                      {/* Year Badge */}
                      {sheet.year && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded 
                                       text-xs font-medium bg-gray-100 text-gray-700">
                          <Calendar className="w-3 h-3" />
                          {sheet.year}
                        </span>
                      )}

                      {/* Data Extracted Badge */}
                      {sheet.data_extracted && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded 
                                       text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Data Extracted
                        </span>
                      )}
                    </div>

                    {/* Sheet Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span>{sheet.row_count} rows</span>
                      <span>•</span>
                      <span>{sheet.column_count} columns</span>
                      {sheet.confidence_score !== null && (
                        <>
                          <span>•</span>
                          <span className={getConfidenceColor(sheet.confidence_score)}>
                            {Math.round(sheet.confidence_score * 100)}% confidence
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>Detected {formatDate(sheet.detected_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Icon */}
                <div className="flex-shrink-0">
                  {sheet.confidence_score && sheet.confidence_score >= 0.9 ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : sheet.confidence_score && sheet.confidence_score >= 0.7 ? (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>

              {/* Additional Metadata (if available) */}
              {sheet.metadata && Object.keys(sheet.metadata).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                      View Metadata
                    </summary>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-gray-700 font-mono overflow-x-auto">
                      <pre>{JSON.stringify(sheet.metadata, null, 2)}</pre>
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Results Info */}
      {(searchTerm || typeFilter !== 'all') && filteredSheets.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredSheets.length} of {sheets.length} sheets
          {(searchTerm || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
              }}
              className="ml-2 text-[#00338D] hover:text-[#00205B] font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SheetList;