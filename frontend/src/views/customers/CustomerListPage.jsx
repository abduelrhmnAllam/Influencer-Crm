import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import DataTable from '../../components/common/DataTable';

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/v1/customers', {
        params: {
          search,
          page,
          per_page: 15,
        }
      });
      setCustomers(data.data);
      setPagination({
        current_page: data.meta.current_page,
        last_page: data.meta.last_page,
        per_page: data.meta.per_page,
        total: data.meta.total,
      });
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const columns = [
    {
      header: 'كود العميل',
      accessor: 'code',
      render: (row) => (
        <span className="font-mono text-xs bg-surface-100 px-2.5 py-1 rounded-md text-surface-700">
          {row.code}
        </span>
      )
    },
    {
      header: 'الاسم الكلي',
      accessor: 'name',
      render: (row) => (
        <Link to={`/customers/${row.id}`} className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
          {row.name}
        </Link>
      )
    },
    {
      header: 'الشخص المسؤول',
      accessor: 'contact_person',
    },
    {
      header: 'الرقم الضريبي',
      accessor: 'vat_number',
      render: (row) => row.vat_number || <span className="text-surface-200">-</span>
    },
    {
      header: 'إجمالي المبيعات',
      accessor: 'total_spent',
      render: (row) => (
        <span className="font-semibold text-primary-700">
          {parseFloat(row.total_spent).toLocaleString('sa-SA')} ر.س
        </span>
      )
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => {
        const colors = {
          active: 'bg-success/10 text-success border-success/20',
          inactive: 'bg-surface-200 text-surface-700 border-surface-300',
          archived: 'bg-danger/10 text-danger border-danger/20',
        };
        const labels = {
          active: 'نشط',
          inactive: 'غير نشط',
          archived: 'مؤرشف',
        };
        return (
          <span className={`px-2.5 py-1 border text-xs font-bold rounded-lg ${colors[row.status] || colors.inactive}`}>
            {labels[row.status] || row.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">سجل العملاء</h1>
          <p className="text-sm text-surface-600">إدارة معلومات وبيانات العملاء والشركات</p>
        </div>
        <Link
          to="/customers/add"
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          ➕ إضافة عميل جديد
        </Link>
      </div>

      {/* Reusable paginated table */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        searchPlaceholder="بحث في سجل العملاء (الاسم، الكود، الرقم الضريبي)..."
      />
    </div>
  );
}
