// src/components/tax/investment_allowance_table.tsx
import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Percent,
  Search,
  Download,
  Calculator
} from 'lucide-react';
import { InvestmentAllowance } from '../../types';

interface InvestmentAllowanceTableProps {
  allowances: InvestmentAllowance[];
  loading?: boolean;
  showSearch?: boolean;
  showDownload?: boolean;
  className?: string;
}

const InvestmentAllowanceTable: React.FC<InvestmentAllowanceTableProps> = ({
  allowances,
  loading = false,
  showSearch = true,
  showDownload = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

  const getCategories = () => {
    const categories = new Set(allowances.map(a => a.asset_category));
    return Array.from(categories).sort();
  };

  const filteredAllowances = allowances.filter(allowance => {
    const matchesSearch =
      allowance.asset_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allowance.asset_category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory =
      categoryFilter === 'all' || allowance.asset_category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const calculateTotalCost = () => {
    return filteredAllowances.reduce((sum, a) => sum + (a.cost || 0), 0);
  };

  const calculateTotalAllowance = () => {
    return filteredAllowances.reduce((sum, a) => sum + (a.allowance_amount || 0), 0);
  };

  const calculateTotalAccumulated = () => {
    return filteredAllowances.reduce((sum, a) => sum + (a.accumulated_allowance || 0), 0);
  };

  const calculateTotalWDV = () => {
    return filteredAllowances.reduce((sum, a) => sum + (a.tax_written_down_value || 0), 0);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Building': 'bg-blue-100 text-blue-700',
      'Machinery': 'bg-green-100 text-green-700',
      'Furniture': 'bg-purple-100 text-purple-700',
      'Computer': 'bg-indigo-100 text-indigo-700',
      'Vehicle': 'bg-yellow-100 text-yellow-700',
      'Equipment': 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const handleDownload = () => {
    const csvContent = [
      ['Asset Description', 'Category', 'Cost', 'Rate', 'Current Allowance', 'Accumulated', 'WDV'],
      ...filteredAllowances.map(a => [
        a.asset_description,
        a.asset_category,
        a.cost || 0,
        a.allowance_rate || 0,
        a.allowance_amount || 0,
        a.accumulated_allowance || 0,
        a.tax_written_down_value || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investment-allowances-${Date.now()}.csv`;
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
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Investment Allowances</h2>
              <p className="text-sm text-gray-600">
                {allowances.length} asset{allowances.length !== 1 ? 's' : ''} • 
                Total Allowance: {formatCurrency(calculateTotalAllowance())}
              </p>
            </div>
          </div>
          {showDownload && allowances.length > 0 && (
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
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
              />
            </div>
          )}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Total Cost</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(calculateTotalCost())}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Current Year Allowance</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(calculateTotalAllowance())}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Accumulated Allowance</p>
          <p className="text-lg font-bold text-purple-600">{formatCurrency(calculateTotalAccumulated())}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Tax WDV</p>
          <p className="text-lg font-bold text-blue-600">{formatCurrency(calculateTotalWDV())}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredAllowances.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {allowances.length === 0 ? (
              <>
                <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p>No investment allowances data available</p>
              </>
            ) : (
              <>
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p>No assets match your search</p>
              </>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Description
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Allowance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accumulated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax WDV
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAllowances.map((allowance) => (
                <tr key={allowance.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {allowance.asset_description}
                    </div>
                    <div className="text-xs text-gray-500">Year: {allowance.year}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium 
                                    ${getCategoryColor(allowance.asset_category)}`}>
                      {allowance.asset_category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(allowance.cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Percent className="w-3 h-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatPercentage(allowance.allowance_rate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(allowance.allowance_amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-purple-600">
                    {formatCurrency(allowance.accumulated_allowance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-600">
                    {formatCurrency(allowance.tax_written_down_value)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td colSpan={2} className="px-6 py-4 text-sm text-gray-900">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatCurrency(calculateTotalCost())}
                </td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                  {formatCurrency(calculateTotalAllowance())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-purple-600">
                  {formatCurrency(calculateTotalAccumulated())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-blue-600">
                  {formatCurrency(calculateTotalWDV())}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Info Box */}
      <div className="p-6 bg-blue-50 border-t border-blue-200">
        <div className="flex items-start gap-3">
          <Calculator className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Investment Allowance Calculation</p>
            <p>
              Investment allowances are tax deductions for capital expenditure on qualifying assets.
              The allowance is calculated as: <strong>Cost × Allowance Rate = Current Year Allowance</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentAllowanceTable;