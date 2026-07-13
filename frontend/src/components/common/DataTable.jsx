import { useState } from 'react';

/**
 * Reusable premium DataTable Component
 * 
 * Supports: server-side pagination styling, search headers, status sorting,
 * action menus, and beautiful Saudi HSL color details.
 */
export default function DataTable({ 
  columns, 
  data = [], 
  loading = false, 
  searchPlaceholder = 'بحث...', 
  onSearch, 
  pagination = null, 
  onPageChange,
  actions = null
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  return (
    <div className="bg-white rounded-3xl shadow-card border border-surface-200 overflow-hidden font-sans">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-surface-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-50">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-surface-900 focus:outline-none focus:border-primary-500 text-right"
            placeholder={searchPlaceholder}
          />
          <button type="submit" className="absolute left-3.5 top-3 text-surface-400 cursor-pointer">
            🔍
          </button>
        </form>

        {actions && <div className="flex gap-2 justify-end">{actions}</div>}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-100 text-surface-700 font-bold uppercase border-b border-surface-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-150">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <span className="text-surface-600 font-semibold">جاري تحميل البيانات...</span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-surface-600">
                  📭 لا توجد سجلات مطابقة في النظام حالياً.
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className="hover:bg-surface-50/50 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-surface-900 font-medium">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.total > pagination.per_page && (
        <div className="p-5 border-t border-surface-200 flex items-center justify-between bg-surface-50 text-xs font-semibold text-surface-750">
          <div>
            عرض {data.length} من أصل {pagination.total} سجل
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1 || loading}
              className="px-3 py-1.5 rounded-lg border border-surface-200 bg-white hover:bg-surface-100 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
            >
              السابق
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-primary-50 border border-primary-200 text-primary-700">
              {pagination.current_page}
            </span>
            <button
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page || loading}
              className="px-3 py-1.5 rounded-lg border border-surface-200 bg-white hover:bg-surface-100 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
