/**
 * Reports Page - FIXED to work with YOUR hooks
 * Handles paginated response correctly
 */
// src/pages/reports_page.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkbooks } from '../hooks';

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: workbooksData, isLoading, error } = useWorkbooks();

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold">Error</h2>
          <p className="text-red-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  // Handle paginated response and filter completed
  const allWorkbooks = workbooksData?.results || [];
  const workbooks = allWorkbooks.filter((w: any) => w.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-gray-600">Completed tax reports</p>
        </div>

        {workbooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow border p-6">
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-2xl font-semibold text-gray-900">{workbooks.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow border p-6">
              <p className="text-sm font-medium text-gray-500">Total Sheets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {workbooks.reduce((sum: number, w: any) => sum + (w.sheets_count || 0), 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow border p-6">
              <p className="text-sm font-medium text-gray-500">Companies</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(workbooks.map((w: any) => w.company_name).filter(Boolean)).size}
              </p>
            </div>
          </div>
        )}

        {workbooks.length > 0 ? (
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Workbook
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workbooks.map((workbook: any) => (
                  <tr key={workbook.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {workbook.file_name || workbook.original_filename || 'Unnamed'}
                      </div>
                      {workbook.file_size && (
                        <div className="text-sm text-gray-500">
                          {formatFileSize(workbook.file_size)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {workbook.company_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {workbook.current_year || workbook.current_tax_year || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatRelativeTime(workbook.created_at || workbook.uploaded_at)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/workbooks/${workbook.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border p-12 text-center">
            <h3 className="text-sm font-medium text-gray-900">No reports yet</h3>
            <p className="mt-1 text-sm text-gray-500">Upload a workbook to get started</p>
            <button
              onClick={() => navigate('/upload')}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Upload Workbook
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;