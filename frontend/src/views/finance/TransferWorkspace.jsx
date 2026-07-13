import { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import DataTable from '../../components/common/DataTable';
import { Link } from 'react-router-dom';

export default function TransferWorkspace() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/v1/transfers', {
        params: {
          search,
          stage: stageFilter || undefined,
          page,
          per_page: 15,
        }
      });
      setTransfers(data.data || data);
      if (data.meta) {
        setPagination({
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
        });
      }
    } catch (err) {
      console.error('Error fetching transfers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter, page]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleUploadFile = async (transferId, type, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      await api.post(`/api/v1/transfers/${transferId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('تم رفع المستند بنجاح وتحديث مرحلة التدفق المالي!');
      fetchTransfers();
    } catch (err) {
      alert('فشل رفع الملف: ' . err.response?.data?.message || err.message);
    }
  };

  const handleSendWhatsApp = async (transferId, target) => {
    try {
      await api.post(`/api/v1/transfers/${transferId}/send-${target}`);
      alert(`تم إرسال إشعار الواتساب بنجاح إلى ${target === 'receipt' ? 'المؤثر' : 'العميل'}!`);
      fetchTransfers();
    } catch (err) {
      alert('فشل الإرسال: ' . err.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      header: 'كود الحوالة',
      accessor: 'code',
      render: (row) => <Link to={`/finance/${row.id}`} className='font-mono text-xs text-primary-700 bg-primary-50 px-2 py-1 rounded'>{row.code}</Link>
    },
    {
      header: 'الحملة الإعلانية',
      accessor: 'campaign',
      render: (row) => row.campaign?.name || <span className="text-surface-200">-</span>
    },
    {
      header: 'إجمالي المبلغ',
      accessor: 'amount_total',
      render: (row) => (
        <span className="font-bold text-primary-700">
          {parseFloat(row.amount_total).toLocaleString('sa-SA')} ر.س
        </span>
      )
    },
    {
      header: 'مرحلة التدفق المالي',
      accessor: 'workflow_stage',
      render: (row) => {
        const stages = {
          '1': { label: '1. انتظار التحويل', color: 'bg-warning/10 text-warning border-warning/20' },
          '2': { label: '2. تم التحويل (رفع الإيصال)', color: 'bg-primary-50 text-primary-700 border-primary-200' },
          '3': { label: '3. إصدار الفاتورة للعميل', color: 'bg-success/10 text-success border-success/20' },
          'complete': { label: '4. مكتمل ومطابق', color: 'bg-success text-white border-success' },
        };
        const current = stages[row.workflow_stage] || stages['1'];
        return (
          <span className={`px-2.5 py-1 border text-xs font-bold rounded-lg ${current.color}`}>
            {current.label}
          </span>
        );
      }
    },
    {
      header: 'المستندات المالية والتحكم',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* Stage 1 Upload */}
          {row.workflow_stage === '1' && (
            <label className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
              ➕ إيصال التحويل
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => handleUploadFile(row.id, 'receipt', e.target.files[0])} 
              />
            </label>
          )}

          {/* Stage 2 Actions */}
          {row.workflow_stage === '2' && (
            <div className="flex gap-2">
              <button 
                onClick={() => handleSendWhatsApp(row.id, 'receipt')}
                className="px-3 py-1.5 bg-success text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                💬 إرسال الإيصال للمؤثر
              </button>
              <label className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold cursor-pointer">
                ➕ الفاتورة الضريبية
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleUploadFile(row.id, 'tax_invoice', e.target.files[0])} 
                />
              </label>
            </div>
          )}

          {/* Stage 3 Actions */}
          {row.workflow_stage === '3' && (
            <button 
              onClick={() => handleSendWhatsApp(row.id, 'invoice')}
              className="px-3 py-1.5 bg-success text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              💬 إرسال الفاتورة للعميل
            </button>
          )}

          {row.workflow_stage === 'complete' && (
            <span className="text-xs text-success font-bold">✅ التدفق منتهي ومطابق</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">متابعة الحوالات المالية</h1>
          <p className="text-sm text-surface-600">المطابقة الآلية للتدفق المالي (الطلب ⬅ التحويل ⬅ الفاتورة ⬅ الاكتمال)</p>
        </div>
        <Link to='/finance/request' className='px-4 py-2.5 bg-primary-600 text-white font-bold text-sm rounded-xl'>طلب حوالة جديد</Link>
      </div>

      <DataTable
        columns={columns}
        data={transfers}
        loading={loading}
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        searchPlaceholder="البحث برقم الحوالة أو اسم الحملة..."
        actions={
          <select
            value={stageFilter}
            onChange={(e) => {
              setStageFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-surface-700 focus:outline-none focus:border-primary-500 text-right cursor-pointer"
          >
            <option value="">كل مراحل التدفق</option>
            <option value="1">1. انتظار التحويل</option>
            <option value="2">2. تم التحويل</option>
            <option value="3">3. إصدار الفاتورة</option>
            <option value="complete">4. مكتمل ومطابق</option>
          </select>
        }
      />
    </div>
  );
}
