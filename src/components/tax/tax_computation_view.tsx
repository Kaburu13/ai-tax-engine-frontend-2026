// src/components/tax/tax_computation_view.tsx
import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  Percent,
  FileText,
  AlertCircle
} from 'lucide-react';
import { TaxComputation } from '../../types';

interface TaxComputationViewProps {
  computation: TaxComputation | null;
  loading?: boolean;
  className?: string;
}

const TaxComputationView: React.FC<TaxComputationViewProps> = ({
  computation,
  loading = false,
  className = ''
}) => {
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
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

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-8 ${className}`}>
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00338D]"></div>
        </div>
      </div>
    );
  }

  if (!computation) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-8 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Tax Computation Available
          </h3>
          <p className="text-gray-600">
            Tax computation has not been completed yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00338D] to-[#00205B] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Tax Computation Summary</h2>
            <p className="text-blue-100">Tax Year: {computation.year}</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Calculator className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Figures Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Accounting Profit */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              (computation.accounting_profit || 0) >= 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {(computation.accounting_profit || 0) >= 0 ? 'Profit' : 'Loss'}
            </span>
          </div>
          <p className="text-sm text-blue-700 font-medium mb-2">
            Accounting Profit/(Loss)
          </p>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(computation.accounting_profit)}
          </p>
        </div>

        {/* Taxable Income */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <Calculator className="w-8 h-8 text-green-600" />
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800">
              Adjusted
            </span>
          </div>
          <p className="text-sm text-green-700 font-medium mb-2">
            Taxable Income
          </p>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(computation.taxable_income)}
          </p>
        </div>

        {/* Tax Liability */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-200 text-purple-800">
              30% Rate
            </span>
          </div>
          <p className="text-sm text-purple-700 font-medium mb-2">
            Tax Liability
          </p>
          <p className="text-2xl font-bold text-purple-900">
            {formatCurrency(computation.tax_liability)}
          </p>
        </div>

        {/* Effective Tax Rate */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <Percent className="w-8 h-8 text-yellow-600" />
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
              Rate
            </span>
          </div>
          <p className="text-sm text-yellow-700 font-medium mb-2">
            Effective Tax Rate
          </p>
          <p className="text-2xl font-bold text-yellow-900">
            {formatPercentage(computation.effective_tax_rate)}
          </p>
        </div>
      </div>

      {/* Adjustments Details */}
      {computation.adjustments && Object.keys(computation.adjustments).length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00338D]" />
            Tax Adjustments
          </h3>
          <div className="space-y-3">
            {Object.entries(computation.adjustments).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0"
              >
                <span className="text-gray-700 font-medium">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="text-gray-900 font-semibold">
                  {typeof value === 'number' ? formatCurrency(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Computation Details */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Computation Details
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Tax Year</p>
            <p className="text-base font-semibold text-gray-900">{computation.year}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Computed At</p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(computation.computed_at)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Validation Status</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              computation.validated
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {computation.validated ? 'Validated' : 'Pending Validation'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Corporate Tax Rate</p>
            <p className="text-base font-semibold text-gray-900">30.00%</p>
          </div>
        </div>
      </div>

      {/* Tax Computation Formula */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Tax Computation Formula
        </h3>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Accounting Profit/(Loss)</span>
            <span className="text-blue-900 font-semibold">
              {formatCurrency(computation.accounting_profit)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Add: Non-deductible Expenses</span>
            <span className="text-blue-900 font-semibold">+</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Less: Tax-exempt Income</span>
            <span className="text-blue-900 font-semibold">-</span>
          </div>
          <div className="border-t-2 border-blue-300 pt-2 mt-2 flex justify-between">
            <span className="text-blue-800 font-semibold">Taxable Income</span>
            <span className="text-blue-900 font-bold">
              {formatCurrency(computation.taxable_income)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Tax @ 30%</span>
            <span className="text-blue-900 font-semibold">×</span>
          </div>
          <div className="border-t-2 border-blue-400 pt-2 mt-2 flex justify-between">
            <span className="text-blue-800 font-semibold">Tax Liability</span>
            <span className="text-blue-900 font-bold">
              {formatCurrency(computation.tax_liability)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxComputationView;