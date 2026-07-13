import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import DataTable from '../../components/common/DataTable';

export default function InfluencerListPage() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchInfluencers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/v1/influencers', {
        params: {
          search,
          platform: platformFilter || undefined,
          page,
          per_page: 15,
        }
      });
      setInfluencers(data.data);
      setPagination({
        current_page: data.meta.current_page,
        last_page: data.meta.last_page,
        per_page: data.meta.per_page,
        total: data.meta.total,
      });
    } catch (err) {
      console.error('Error fetching influencers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, platformFilter, page]);

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  const columns = [
    {
      header: 'رمز المؤثر',
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
        <Link to={`/influencers/${row.id}`} className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
          {row.name}
        </Link>
      )
    },
    {
      header: 'المنصة',
      accessor: 'platform',
      render: (row) => {
        const icons = {
          snapchat: '🟡 سناب شات',
          tiktok: '⚫ تيك توك',
          instagram: '📸 إنستغرام',
          twitter: '🐦 تويتر',
          youtube: '🔴 يوتيوب',
          linkedin: '🔵 لينكد إن',
        };
        return (
          <span className="text-xs font-semibold px-2 py-1 rounded bg-surface-100 text-surface-750">
            {icons[row.platform] || row.platform}
          </span>
        );
      }
    },
    {
      header: 'المتابعون',
      accessor: 'followers',
      render: (row) => {
        const count = parseInt(row.followers);
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(0) + 'K';
        return count;
      }
    },
    {
      header: 'سعر البيع',
      accessor: 'sale_price',
      render: (row) => (
        <span className="font-semibold text-primary-700">
          {parseFloat(row.sale_price).toLocaleString('sa-SA')} ر.س
        </span>
      )
    },
    {
      header: 'هامش الربح',
      accessor: 'profit_margin',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-lg">
          {row.profit_margin}%
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
          blacklisted: 'bg-danger/10 text-danger border-danger/20',
        };
        const labels = {
          active: 'نشط',
          inactive: 'غير نشط',
          blacklisted: 'قائمة سوداء',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">دليل المؤثرين صناع المحتوى</h1>
          <p className="text-sm text-surface-600">البحث وتصفية المؤثرين حسب المنصة، الأسعار، والمتابعين</p>
        </div>
        <Link
          to="/influencers/add"
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          ➕ إضافة مؤثر جديد
        </Link>
      </div>

      {/* Grid Filter Actions */}
      <DataTable
        columns={columns}
        data={influencers}
        loading={loading}
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        searchPlaceholder="البحث في المؤثرين (الاسم، اسم المستخدم، الهاتف)..."
        actions={
          <select
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-surface-700 focus:outline-none focus:border-primary-500 text-right cursor-pointer"
          >
            <option value="">كل المنصات</option>
            <option value="snapchat">Snapchat</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">X / Twitter</option>
            <option value="youtube">YouTube</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        }
      />
    </div>
  );
}
