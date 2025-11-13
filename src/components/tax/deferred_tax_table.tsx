// src/components/tax/deferred_tax_table.tsx
import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Percent,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { DeferredTax } from '../../types';

interface DeferredTaxTableProps {
  deferredTaxItems: DeferredTax[];
  loading?: boolean;
  showSearch?: boolean;
  showDownload?: boolean;
  className?: string;
}

const DeferredTaxTable: React.FC<DeferredTaxTableProps> = ({
  deferredTaxItems,
  loading = false,
  showSearch = true,
  showDownload = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'asset' | 'liability'>('all');

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return `${(value * 100).toFixed(2)}%`;
  };

  const getNetPosition = (item: DeferredTax) => {
    const asset = item.deferred_tax_asset || 0;
    const liability = item.deferred_tax_liability || 0;
    return asset - liability;
  };

  const filteredItems = deferredTaxItems.filter(item => {
    const matchesSearch =
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'asset' && (item.deferred_tax_asset || 0) > (item.deferred_tax_liability || 0)) ||
      (typeFilter === 'liability' && (item.deferred_tax_liability || 0) > (item.deferred_tax_asset || 0));
    
    return matchesSearch && matchesType;
  });

  const calculateTotalTempDiff = () => {
    return filteredItems.reduce((sum, item) => sum + (item.temporary_difference || 0), 0);
  };

  const calculateTotalDTA = () => {
    return filteredItems.reduce((sum, item) => sum + (item.deferred_tax_asset || 0), 0);
  };

  const calculateTotalDTL = () => {
    return filteredItems.reduce((sum, item) => sum + (item.deferred_tax_liability || 0), 0);
  };

  const calculateTotalMovement = () => {
    return filteredItems.reduce((sum, item) => sum + (item.movement || 0), 0);
  };

  const calculateNetPosition = () => {
    return calculateTotalDTA() - calculateTotalDTL();
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('provision')) {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
    if (category.toLowerCase().includes('allowance')) {
      return <TrendingDown className="w-4 h-4 text-green-600" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
  };

  const handleDownload = () => {
    const csvContent = [
      ['Category', 'Temporary Difference', 'Tax Rate', 'DT Asset', 'DT Liability', 'Movement'],
      ...filteredItems.map(item => [
        item.category,
        item.temporary_difference || 0,
        item.tax_rate || 0,
        item.deferred_tax_asset || 0,
        item.deferred_tax_liability || 0,
        item.movement || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deferred-tax-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Deferred Tax Schedule</h2>
              <p className="text-sm text-gray-600">
                {deferredTaxItems.length} item{deferredTaxItems.length !== 1 ? 's' : ''} • 
                Net Position: <span className={calculateNetPosition() >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(calculateNetPosition()))} {calculateNetPosition() >= 0 ? 'Asset' : 'Liability'}
                </span>
              </p>
            </div>
          </div>
          {showDownload && deferredTaxItems.length > 0 && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-[#00338D] hover:bg-blue-50 rounded-lg 
                       transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {showSearch && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
              />
            </div>
          )}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'asset' | 'liability')}
            className="px-4 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="asset">Deferred Tax Assets</option>
            <option value="liability">Deferred Tax Liabilities</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Total Temp. Difference</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(calculateTotalTempDiff())}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">DT Assets</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(calculateTotalDTA())}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">DT Liabilities</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(calculateTotalDTL())}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Net Movement</p>
          <p className={`text-lg font-bold ${
            calculateTotalMovement() >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(Math.abs(calculateTotalMovement()))}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {deferredTaxItems.length === 0 ? (
              <>
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p>No deferred tax data available</p>
              </>
            ) : (
              <>
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p>No items match your search</p>
              </>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temporary Difference
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DT Asset
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DT Liability
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Movement
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Position
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const netPosition = getNetPosition(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.category}</div>
                          <div className="text-xs text-gray-500">Year: {item.year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(item.temporary_difference)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Percent className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatPercentage(item.tax_rate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(item.deferred_tax_asset)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-red-600">
                        {formatCurrency(item.deferred_tax_liability)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(item.movement || 0) > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (item.movement || 0) < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : null}
                        <span className={`text-sm font-medium ${
                          (item.movement || 0) > 0 ? 'text-green-600' : 
                          (item.movement || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {formatCurrency(Math.abs(item.movement || 0))}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        netPosition > 0
                          ? 'bg-green-100 text-green-700'
                          : netPosition < 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {netPosition > 0 ? 'Asset' : netPosition < 0 ? 'Liability' : 'Nil'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatCurrency(calculateTotalTempDiff())}
                </td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                  {formatCurrency(calculateTotalDTA())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                  {formatCurrency(calculateTotalDTL())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatCurrency(Math.abs(calculateTotalMovement()))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`text-sm font-semibold ${
                    calculateNetPosition() >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(calculateNetPosition()))}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Info Box */}
      <div className="p-6 bg-red-50 border-t border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <p className="font-semibold mb-1">Deferred Tax Calculation</p>
            <p>
              Deferred tax arises from temporary differences between accounting and tax bases.
              <strong> DT Asset/Liability = Temporary Difference × Tax Rate (30%)</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeferredTaxTable;