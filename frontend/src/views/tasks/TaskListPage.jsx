import { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import DataTable from '../../components/common/DataTable';

export default function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/v1/tasks', {
        params: {
          search,
          status: statusFilter || undefined,
          page,
          per_page: 15,
        }
      });
      // The backend response might vary, usually returning paginated payload
      setTasks(data.data || data);
      if (data.meta) {
        setPagination({
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
        });
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const columns = [
    {
      header: 'عنوان المهمة',
      accessor: 'title',
      render: (row) => (
        <span className="font-bold text-surface-900">
          {row.title}
        </span>
      )
    },
    {
      header: 'المسؤول عنها',
      accessor: 'assignee',
      render: (row) => row.assignee?.name || <span className="text-surface-200">-</span>
    },
    {
      header: 'الأولوية',
      accessor: 'priority',
      render: (row) => {
        const colors = {
          high: 'bg-danger/10 text-danger border-danger/20',
          medium: 'bg-warning/10 text-warning border-warning/20',
          low: 'bg-primary-100 text-primary-700 border-primary-200',
        };
        const labels = {
          high: 'عالية',
          medium: 'متوسطة',
          low: 'منخفضة',
        };
        return (
          <span className={`px-2 py-0.5 border text-xs font-bold rounded-md ${colors[row.priority] || colors.medium}`}>
            {labels[row.priority] || row.priority}
          </span>
        );
      }
    },
    {
      header: 'تاريخ الاستحقاق',
      accessor: 'due_date',
      render: (row) => row.due_date || <span className="text-surface-200">-</span>
    },
    {
      header: 'الإنجاز',
      accessor: 'progress',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-surface-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-primary-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${row.progress || 0}%` }}
            ></div>
          </div>
          <span className="text-xs font-mono text-surface-700">{row.progress || 0}%</span>
        </div>
      )
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => {
        const colors = {
          pending: 'bg-surface-200 text-surface-700 border-surface-300',
          in_progress: 'bg-warning/10 text-warning border-warning/20',
          completed: 'bg-success/10 text-success border-success/20',
        };
        const labels = {
          pending: 'معلقة',
          in_progress: 'قيد التنفيذ',
          completed: 'مكتملة',
        };
        return (
          <span className={`px-2.5 py-1 border text-xs font-bold rounded-lg ${colors[row.status] || colors.pending}`}>
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
          <h1 className="text-2xl font-bold text-surface-900">سجل مهام الموظفين</h1>
          <p className="text-sm text-surface-600">جدولة وتعيين ومتابعة المهام التشغيلية اليومية</p>
        </div>
        <button
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          ➕ إضافة مهمة جديدة
        </button>
      </div>

      <DataTable
        columns={columns}
        data={tasks}
        loading={loading}
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        searchPlaceholder="البحث في المهام (العنوان)..."
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
            <option value="pending">معلقة</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتملة</option>
          </select>
        }
      />
    </div>
  );
}
