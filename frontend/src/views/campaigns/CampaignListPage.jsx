import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import DataTable from '../../components/common/DataTable';

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/v1/campaigns', {
        params: {
          search,
          status: statusFilter || undefined,
          page,
          per_page: 15,
        }
      });
      setCampaigns(data.data);
      setPagination({
        current_page: data.meta.current_page,
        last_page: data.meta.last_page,
        per_page: data.meta.per_page,
        total: data.meta.total,
      });
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const columns = [
    {
      header: 'كود الحملة',
      accessor: 'code',
      render: (row) => (
        <span className="font-mono text-xs bg-surface-100 px-2.5 py-1 rounded-md text-surface-700">
          {row.code}
        </span>
      )
    },
    {
      header: 'اسم الحملة',
      accessor: 'name',
      render: (row) => (
        <Link to={`/campaigns/${row.id}`} className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
          {row.name}
        </Link>
      )
    },
    {
      header: 'العميل المموِّل',
      accessor: 'customer',
      render: (row) => row.customer?.name || <span className="text-surface-200">-</span>
    },
    {
      header: 'ميزانية الحملة',
      accessor: 'budget',
      render: (row) => (
        <span className="font-semibold text-primary-700">
          {parseFloat(row.budget).toLocaleString('sa-SA')} ر.س
        </span>
      )
    },
    {
      header: 'تاريخ البدء',
      accessor: 'start_date',
      render: (row) => row.start_date || <span className="text-surface-200">-</span>
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => {
        const colors = {
          draft: 'bg-surface-200 text-surface-700 border-surface-300',
          active: 'bg-success/10 text-success border-success/20',
          paused: 'bg-warning/10 text-warning border-warning/20',
          completed: 'bg-primary-100 text-primary-700 border-primary-200',
          cancelled: 'bg-danger/10 text-danger border-danger/20',
        };
        const labels = {
          draft: 'مسودة',
          active: 'نشطة',
          paused: 'متوقفة مؤقتاً',
          completed: 'مكتملة',
          cancelled: 'ملغاة',
        };
        return (
          <span className={`px-2.5 py-1 border text-xs font-bold rounded-lg ${colors[row.status] || colors.draft}`}>
            {labels[row.status] || row.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">الحملات الإعلانية</h1>
          <p className="text-sm text-surface-600">إدارة ومراقبة حملات المؤثرين الإعلانية والميزانيات</p>
        </div>
        <Link
          to="/campaigns/add"
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          ➕ إنشاء حملة جديدة
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={campaigns}
        loading={loading}
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        searchPlaceholder="البحث في الحملات (الاسم، الكود)..."
        actions={
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-surface-700 focus:outline-none focus:border-primary-500 text-right cursor-pointer"
          >
            <option value="">كل الحالات</option>
            <option value="draft">مسودة</option>
            <option value="active">نشطة</option>
            <option value="paused">متوقفة مؤقتاً</option>
            <option value="completed">مكتملة</option>
            <option value="cancelled">ملغاة</option>
          </select>
        }
      />
    </div>
  );
}
