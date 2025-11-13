// src/components/workbook/workbook_detail.tsx
import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Timer,
  Download,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { Workbook } from '../../types';
import SheetList from './sheet_list';
import TaxComputationView from '../tax/tax_computation_view';
import ProvisionTable from '../tax/provision_table';
import InvestmentAllowanceTable from '../tax/investment_allowance_table';
import DeferredTaxTable from '../tax/deferred_tax_table';

interface WorkbookDetailProps {
  workbook: Workbook;
  onRefresh?: () => void;
  onDownload?: () => void;
  loading?: boolean;
  className?: string;
}

type TabType = 'overview' | 'sheets' | 'computation' | 'provisions' | 'allowances' | 'deferred';

const WorkbookDetail: React.FC<WorkbookDetailProps> = ({
  workbook,
  onRefresh,
  onDownload,
  loading = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'failed':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'processing':
        return <Timer className="w-5 h-5 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <FileSpreadsheet className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'sheets', label: 'Sheets', count: workbook.sheets?.length },
    { id: 'computation', label: 'Tax Computation' },
    { id: 'provisions', label: 'Provisions' },
    { id: 'allowances', label: 'Allowances' },
    { id: 'deferred', label: 'Deferred Tax' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00338D]"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-[#00338D]" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{workbook.file_name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span>{formatFileSize(workbook.file_size)}</span>
                <span>•</span>
                <span>Uploaded {formatDate(workbook.uploaded_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-4 py-2 text-[#00338D] hover:bg-blue-50 rounded-lg 
                         transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
            {onDownload && workbook.status === 'completed' && (
              <button
                onClick={onDownload}
                className="px-4 py-2 bg-[#00338D] text-white rounded-lg font-semibold 
                         hover:bg-[#00205B] transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            )}
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full 
                              text-xs font-medium border mt-1 ${getStatusColor(workbook.status)}`}>
                {getStatusIcon(workbook.status)}
                {workbook.status.charAt(0).toUpperCase() + workbook.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Company */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Company</p>
              <p className="font-semibold text-gray-900 text-sm mt-1">
                {workbook.company_name || 'Detecting...'}
              </p>
            </div>
          </div>

          {/* Years */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Tax Years</p>
              <p className="font-semibold text-gray-900 text-sm mt-1">
                {workbook.prior_year && workbook.current_year
                  ? `${workbook.prior_year} - ${workbook.current_year}`
                  : 'Detecting...'}
              </p>
            </div>
          </div>

          {/* Sheets */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Sheets</p>
              <p className="font-semibold text-gray-900 text-sm mt-1">
                {workbook.sheets?.length || 0} detected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-[#00338D] border-b-2 border-[#00338D]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-[#00338D]'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Workbook Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">File Name</p>
                    <p className="font-medium text-gray-900">{workbook.file_name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Company Name</p>
                    <p className="font-medium text-gray-900">
                      {workbook.company_name || 'Not detected'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Sector</p>
                    <p className="font-medium text-gray-900">
                      {workbook.sector || 'Not detected'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Processing Mode</p>
                    <p className="font-medium text-gray-900">
                      {workbook.processing_mode
                        ? workbook.processing_mode.charAt(0).toUpperCase() + 
                          workbook.processing_mode.slice(1)
                        : 'Determining...'}
                    </p>
                  </div>
                </div>
              </div>

              {workbook.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700">{workbook.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sheets Tab */}
          {activeTab === 'sheets' && (
            <SheetList 
              sheets={workbook.sheets || []} 
              showStats={true}
              showSearch={true}
              showFilter={true}
            />
          )}

          {/* Tax Computation Tab */}
          {activeTab === 'computation' && (
            <TaxComputationView 
              computation={workbook.tax_computation || null}
            />
          )}

          {/* Provisions Tab */}
          {activeTab === 'provisions' && (
            <ProvisionTable 
              provisions={[]} // Pass actual provisions data if available
              showSearch={true}
              showDownload={true}
            />
          )}

          {/* Investment Allowances Tab */}
          {activeTab === 'allowances' && (
            <InvestmentAllowanceTable 
              allowances={[]} // Pass actual allowances data if available
              showSearch={true}
              showDownload={true}
            />
          )}

          {/* Deferred Tax Tab */}
          {activeTab === 'deferred' && (
            <DeferredTaxTable 
              deferredTaxItems={[]} // Pass actual deferred tax data if available
              showSearch={true}
              showDownload={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkbookDetail;