// src/components/workbook/workbook_list.tsx
import React, { useState } from 'react';
import { 
  Grid, 
  List, 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  FileSpreadsheet
} from 'lucide-react';
import { Workbook, ProcessingStatus } from '../../types';
import WorkbookCard from './workbook_card';

interface WorkbookListProps {
  workbooks: Workbook[];
  loading?: boolean;
  emptyMessage?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showSort?: boolean;
  defaultView?: 'grid' | 'list';
  className?: string;
}

const WorkbookList: React.FC<WorkbookListProps> = ({
  workbooks,
  loading = false,
  emptyMessage = 'No workbooks found',
  showSearch = true,
  showFilter = true,
  showSort = true,
  defaultView = 'grid',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProcessingStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'company'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'grid' | 'list'>(defaultView);

  const filteredAndSortedWorkbooks = workbooks
    .filter(workbook => {
      const matchesSearch =
        workbook.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (workbook.company_name && workbook.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || workbook.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
          break;
        case 'name':
          comparison = a.file_name.localeCompare(b.file_name);
          break;
        case 'company':
          comparison = (a.company_name || '').localeCompare(b.company_name || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getStatusCount = (status: ProcessingStatus) => {
    return workbooks.filter(w => w.status === status).length;
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
      {/* Controls */}
      {(showSearch || showFilter || showSort) && (
        <div className="mb-6 space-y-4">
          {/* Search and View Toggle */}
          <div className="flex gap-3">
            {showSearch && (
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workbooks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
                />
              </div>
            )}
            
            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`px-4 py-2 ${
                  view === 'grid'
                    ? 'bg-[#00338D] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 border-l border-gray-300 ${
                  view === 'list'
                    ? 'bg-[#00338D] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex gap-3">
            {showFilter && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ProcessingStatus | 'all')}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-[#00338D] focus:border-transparent 
                           appearance-none bg-white"
                >
                  <option value="all">All Status ({workbooks.length})</option>
                  <option value="completed">Completed ({getStatusCount('completed')})</option>
                  <option value="processing">Processing ({getStatusCount('processing')})</option>
                  <option value="failed">Failed ({getStatusCount('failed')})</option>
                  <option value="pending">Pending ({getStatusCount('pending')})</option>
                </select>
              </div>
            )}

            {showSort && (
              <>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'company')}
                  className="px-4 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="company">Sort by Company</option>
                </select>
                
                <button
                  onClick={toggleSortOrder}
                  className="px-4 py-2 border border-gray-300 rounded-lg 
                           hover:bg-gray-50 transition-colors"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="w-4 h-4 text-gray-700" />
                  ) : (
                    <SortDesc className="w-4 h-4 text-gray-700" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Active Filters Info */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Showing {filteredAndSortedWorkbooks.length} of {workbooks.length} workbooks
              </span>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="text-[#00338D] hover:text-[#00205B] font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Workbooks Display */}
      {filteredAndSortedWorkbooks.length === 0 ? (
        <div className="text-center py-20">
          <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{emptyMessage}</p>
          {(searchTerm || statusFilter !== 'all') && (
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          )}
        </div>
      ) : (
        <div
          className={
            view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredAndSortedWorkbooks.map((workbook) => (
            <WorkbookCard
              key={workbook.id}
              workbook={workbook}
              showDetails={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkbookList;