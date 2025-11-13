// src/components/tax/provision_table.tsx
import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2,
  XCircle,
  Search,
  Download
} from 'lucide-react';
import { Provision } from '../../types';

interface ProvisionTableProps {
  provisions: Provision[];
  loading?: boolean;
  showSearch?: boolean;
  showDownload?: boolean;
  className?: string;
}

const ProvisionTable: React.FC<ProvisionTableProps> = ({
  provisions,
  loading = false,
  showSearch = true,
  showDownload = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Provision>('provision_type');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleSort = (field: keyof Provision) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedProvisions = provisions
    .filter(provision =>
      provision.provision_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (provision.notes && provision.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const calculateMovement = (provision: Provision) => {
    const opening = provision.opening_balance || 0;
    const closing = provision.closing_balance || 0;
    return closing - opening;
  };

  const calculateTotalOpening = () => {
    return provisions.reduce((sum, p) => sum + (p.opening_balance || 0), 0);
  };

  const calculateTotalAdditions = () => {
    return provisions.reduce((sum, p) => sum + (p.additions || 0), 0);
  };

  const calculateTotalReversals = () => {
    return provisions.reduce((sum, p) => sum + (p.reversals || 0), 0);
  };

  const calculateTotalClosing = () => {
    return provisions.reduce((sum, p) => sum + (p.closing_balance || 0), 0);
  };

  const handleDownload = () => {
    const csvContent = [
      ['Provision Type', 'Opening Balance', 'Additions', 'Reversals', 'Closing Balance', 'Tax Deductible', 'Notes'],
      ...filteredAndSortedProvisions.map(p => [
        p.provision_type,
        p.opening_balance || 0,
        p.additions || 0,
        p.reversals || 0,
        p.closing_balance || 0,
        p.tax_deductible ? 'Yes' : 'No',
        p.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `provisions-${Date.now()}.csv`;
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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Provisions Schedule</h2>
              <p className="text-sm text-gray-600">{provisions.length} provision{provisions.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {showDownload && provisions.length > 0 && (
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

        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search provisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredAndSortedProvisions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {provisions.length === 0 ? (
              <>
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p>No provisions data available</p>
              </>
            ) : (
              <>
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p>No provisions match your search</p>
              </>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('provision_type')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
                           tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Provision Type
                </th>
                <th
                  onClick={() => handleSort('opening_balance')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase 
                           tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Opening Balance
                </th>
                <th
                  onClick={() => handleSort('additions')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase 
                           tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Additions
                </th>
                <th
                  onClick={() => handleSort('reversals')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase 
                           tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Reversals
                </th>
                <th
                  onClick={() => handleSort('closing_balance')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase 
                           tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Closing Balance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Movement
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Deductible
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedProvisions.map((provision) => {
                const movement = calculateMovement(provision);
                return (
                  <tr key={provision.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {provision.provision_type}
                      </div>
                      {provision.notes && (
                        <div className="text-xs text-gray-500 mt-1">{provision.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(provision.opening_balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <span className="text-green-600 font-medium">
                        {formatCurrency(provision.additions)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <span className="text-red-600 font-medium">
                        {formatCurrency(provision.reversals)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(provision.closing_balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        {movement > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : movement < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : null}
                        <span className={`text-sm font-medium ${
                          movement > 0 ? 'text-green-600' : movement < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {formatCurrency(Math.abs(movement))}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {provision.tax_deductible ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatCurrency(calculateTotalOpening())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                  {formatCurrency(calculateTotalAdditions())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                  {formatCurrency(calculateTotalReversals())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatCurrency(calculateTotalClosing())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                  {formatCurrency(Math.abs(calculateTotalClosing() - calculateTotalOpening()))}
                </td>
                <td className="px-6 py-4"></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProvisionTable;