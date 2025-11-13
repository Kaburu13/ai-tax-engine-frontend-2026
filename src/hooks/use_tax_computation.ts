// src/hooks/use_tax_computation.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { processingAPI, reportAPI } from '@/api'
import { getErrorMessage } from '@/api/axios_client'
import type {
  TaxComputation,
  Provision,
  InvestmentAllowance,
  DeferredTax,
} from '@/api/types'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const taxComputationKeys = {
  all: ['tax-computation'] as const,
  computation: (workbookId: number) =>
    [...taxComputationKeys.all, 'workbook', workbookId] as const,
  provisions: (taxComputationId: number) =>
    [...taxComputationKeys.all, 'provisions', taxComputationId] as const,
  investmentAllowances: (taxComputationId: number) =>
    [...taxComputationKeys.all, 'investment-allowances', taxComputationId] as const,
  deferredTax: (taxComputationId: number) =>
    [...taxComputationKeys.all, 'deferred-tax', taxComputationId] as const,
  summary: (workbookId: number) =>
    [...taxComputationKeys.all, 'summary', workbookId] as const,
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get tax computation for a workbook
 */
export function useTaxComputation(
  workbookId: number | undefined,
  options?: Omit<UseQueryOptions<TaxComputation>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: taxComputationKeys.computation(workbookId!),
    queryFn: () => processingAPI.getTaxComputation(workbookId!),
    enabled: workbookId !== undefined,
    staleTime: 60000, // 1 minute
    ...options,
  })
}

/**
 * Get provisions for a tax computation
 */
export function useProvisions(
  taxComputationId: number | undefined,
  options?: Omit<UseQueryOptions<Provision[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: taxComputationKeys.provisions(taxComputationId!),
    queryFn: () => processingAPI.getProvisions(taxComputationId!),
    enabled: taxComputationId !== undefined,
    staleTime: 60000,
    ...options,
  })
}

/**
 * Get investment allowances for a tax computation
 */
export function useInvestmentAllowances(
  taxComputationId: number | undefined,
  options?: Omit<UseQueryOptions<InvestmentAllowance[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: taxComputationKeys.investmentAllowances(taxComputationId!),
    queryFn: () => processingAPI.getInvestmentAllowances(taxComputationId!),
    enabled: taxComputationId !== undefined,
    staleTime: 60000,
    ...options,
  })
}

/**
 * Get deferred tax for a tax computation
 */
export function useDeferredTax(
  taxComputationId: number | undefined,
  options?: Omit<UseQueryOptions<DeferredTax[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: taxComputationKeys.deferredTax(taxComputationId!),
    queryFn: () => processingAPI.getDeferredTax(taxComputationId!),
    enabled: taxComputationId !== undefined,
    staleTime: 60000,
    ...options,
  })
}

/**
 * Get tax computation summary (preview)
 */
export function useTaxComputationSummary(
  workbookId: number | undefined,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: taxComputationKeys.summary(workbookId!),
    queryFn: () => reportAPI.getTaxComputationSummary(workbookId!),
    enabled: workbookId !== undefined,
    staleTime: 60000,
    ...options,
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Recalculate tax computation
 */
export function useRecalculateTaxComputation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taxComputationId: number) =>
      processingAPI.recalculateTaxComputation(taxComputationId),
    onSuccess: (updatedComputation) => {
      // Update computation in cache
      queryClient.setQueryData(
        taxComputationKeys.computation(updatedComputation.workbook),
        updatedComputation
      )

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: taxComputationKeys.provisions(updatedComputation.id),
      })
      queryClient.invalidateQueries({
        queryKey: taxComputationKeys.investmentAllowances(updatedComputation.id),
      })
      queryClient.invalidateQueries({
        queryKey: taxComputationKeys.deferredTax(updatedComputation.id),
      })
      queryClient.invalidateQueries({
        queryKey: taxComputationKeys.summary(updatedComputation.workbook),
      })
    },
  })
}

// ============================================================================
// COMPOSITE HOOKS
// ============================================================================

/**
 * Get complete tax computation data (computation + provisions + allowances + deferred tax)
 */
export function useCompleteTaxComputation(workbookId: number | undefined) {
  const {
    data: computation,
    isLoading: isLoadingComputation,
    error: computationError,
  } = useTaxComputation(workbookId)

  const taxComputationId = computation?.id

  const {
    data: provisions,
    isLoading: isLoadingProvisions,
    error: provisionsError,
  } = useProvisions(taxComputationId)

  const {
    data: investmentAllowances,
    isLoading: isLoadingAllowances,
    error: allowancesError,
  } = useInvestmentAllowances(taxComputationId)

  const {
    data: deferredTax,
    isLoading: isLoadingDeferredTax,
    error: deferredTaxError,
  } = useDeferredTax(taxComputationId)

  const isLoading =
    isLoadingComputation ||
    isLoadingProvisions ||
    isLoadingAllowances ||
    isLoadingDeferredTax

  const error =
    computationError || provisionsError || allowancesError || deferredTaxError

  return {
    computation,
    provisions,
    investmentAllowances,
    deferredTax,
    isLoading,
    error,
  }
}

/**
 * Get tax computation with real-time updates
 */
export function useTaxComputationWithUpdates(workbookId: number | undefined) {
  const queryClient = useQueryClient()

  const computation = useTaxComputation(workbookId, {
    refetchInterval: (data) => {
      // Refetch if workbook is still processing
      const workbook = queryClient.getQueryData(['workbooks', 'detail', workbookId])
      if ((workbook as any)?.status === 'processing') {
        return 5000 // Poll every 5 seconds
      }
      return false
    },
  })

  return computation
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Get formatted tax computation summary
 */
export function useTaxComputationFormatted(workbookId: number | undefined) {
  const { data: computation } = useTaxComputation(workbookId)

  if (!computation) return null

  return {
    year: computation.year,
    accountingProfit: computation.accounting_profit.toLocaleString('en-KE', {
      style: 'currency',
      currency: 'KES',
    }),
    taxAdjustments: computation.tax_adjustments.toLocaleString('en-KE', {
      style: 'currency',
      currency: 'KES',
    }),
    taxableIncome: computation.taxable_income.toLocaleString('en-KE', {
      style: 'currency',
      currency: 'KES',
    }),
    taxRate: `${(computation.tax_rate * 100).toFixed(2)}%`,
    taxPayable: computation.tax_payable.toLocaleString('en-KE', {
      style: 'currency',
      currency: 'KES',
    }),
    provisionalTaxPaid: computation.provisional_tax_paid.toLocaleString('en-KE', {
      style: 'currency',
      currency: 'KES',
    }),
    balanceDue: computation.balance_due.toLocaleString('en-KE', {
      style: 'currency',
      currency: 'KES',
    }),
    effectiveTaxRate: `${(computation.effective_tax_rate * 100).toFixed(2)}%`,
  }
}

/**
 * Check if tax computation is complete
 */
export function useIsTaxComputationComplete(workbookId: number | undefined): boolean {
  const { data: computation } = useTaxComputation(workbookId)
  return !!computation
}

/**
 * Get tax computation error message
 */
export function useTaxComputationError(error: unknown): string | null {
  if (!error) return null
  return getErrorMessage(error)
}

/**
 * Calculate total provisions
 */
export function useTotalProvisions(taxComputationId: number | undefined): number {
  const { data: provisions } = useProvisions(taxComputationId)

  if (!provisions || provisions.length === 0) return 0

  return provisions.reduce((total, provision) => total + provision.tax_effect, 0)
}

/**
 * Calculate total investment allowances
 */
export function useTotalInvestmentAllowances(
  taxComputationId: number | undefined
): number {
  const { data: allowances } = useInvestmentAllowances(taxComputationId)

  if (!allowances || allowances.length === 0) return 0

  return allowances.reduce((total, allowance) => total + allowance.allowance_amount, 0)
}

/**
 * Calculate net deferred tax (DTA - DTL)
 */
export function useNetDeferredTax(
  taxComputationId: number | undefined
): { asset: number; liability: number; net: number } {
  const { data: deferredTax } = useDeferredTax(taxComputationId)

  if (!deferredTax || deferredTax.length === 0) {
    return { asset: 0, liability: 0, net: 0 }
  }

  const asset = deferredTax
    .filter((dt) => dt.category === 'asset')
    .reduce((total, dt) => total + dt.deferred_tax_amount, 0)

  const liability = deferredTax
    .filter((dt) => dt.category === 'liability')
    .reduce((total, dt) => total + dt.deferred_tax_amount, 0)

  return {
    asset,
    liability,
    net: asset - liability,
  }
}

/**
 * Prefetch tax computation data
 */
export function usePrefetchTaxComputation() {
  const queryClient = useQueryClient()

  return (workbookId: number) => {
    queryClient.prefetchQuery({
      queryKey: taxComputationKeys.computation(workbookId),
      queryFn: () => processingAPI.getTaxComputation(workbookId),
      staleTime: 60000,
    })
  }
}