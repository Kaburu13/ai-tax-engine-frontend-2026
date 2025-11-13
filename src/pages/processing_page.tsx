/**
 * Processing Page - FIXED to work with YOUR hooks
 * Uses useProcessingQueue() - no parameters
 */
// src/pages/processing_page.tsx
import React from 'react';
import { useProcessingQueue } from '../hooks';

const ProcessingPage: React.FC = () => {
  const { data: queueData, isLoading, error } = useProcessingQueue();

  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="text-red-800 font-semibold">Error</div>
          <div className="text-red-600 text-sm">{error.message}</div>
        </div>
      </div>
    );
  }

  // Handle response - could be array or object with workbooks
  let workbooks: any[] = [];
  if (Array.isArray(queueData)) {
    workbooks = queueData;
  } else if (queueData && (queueData as any).workbooks) {
    workbooks = (queueData as any).workbooks;
  }
  const count = workbooks.length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Processing Queue</h1>
        <p className="text-gray-600 mt-1">Workbooks currently being processed</p>
      </div>

      <div className="mb-6">
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{count} workbook(s) in queue</span>
        </div>
      </div>

      {count > 0 ? (
        <div className="space-y-4">
          {workbooks.map((workbook: any) => (
            <div key={workbook.id} className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {workbook.file_name || workbook.original_filename || 'Unnamed'}
                  </h3>
                  
                  {workbook.company_name && (
                    <p className="text-sm text-gray-600 mt-1">{workbook.company_name}</p>
                  )}

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Status</div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          workbook.status === 'classifying' ? 'bg-yellow-100 text-yellow-800' :
                          workbook.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {workbook.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase">Sheets</div>
                      <div className="mt-1 text-sm font-medium text-gray-900">
                        {workbook.sheets_count || 0}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase">Started</div>
                      <div className="mt-1 text-sm text-gray-600">
                        {formatRelativeTime(workbook.created_at || workbook.uploaded_at)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workbooks processing</h3>
        </div>
      )}
    </div>
  );
};

export default ProcessingPage;