/* ===========================================================
   SMART CODE — Export Utilities
   PDF export (for transfers/invoices) + Excel template downloads
   =========================================================== */

(function(window){
'use strict';

const exports = {
  
  /* ====== Excel: download with SheetJS (already loaded) ====== */
  
  toExcel(data, opts){
    opts = opts || {};
    const wsName = opts.sheetName || 'Sheet1';
    const fileName = opts.fileName || 'export.xlsx';
    
    if(typeof XLSX === 'undefined'){
      console.error('SheetJS (XLSX) not loaded');
      return;
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    if(opts.colWidths){
      ws['!cols'] = opts.colWidths.map(w => ({wch: w}));
    } else if(data.length > 0){
      const keys = Object.keys(data[0]);
      ws['!cols'] = keys.map(k => ({wch: Math.max(12, k.length + 2)}));
    }
    
    // Set RTL
    ws['!views'] = [{RTL: true}];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, wsName);
    XLSX.writeFile(wb, fileName);
  },
  
  /* ====== Excel Templates (pre-built for common imports) ====== */
  
  downloadTemplate(type){
    const templates = {
      influencers: {
        fileName: 'قالب_المؤثرين.xlsx',
        sheetName: 'المؤثرين',
        rows: [
          {
            'الاسم *': 'مثال: محمد العتيبي',
            'اسم المستخدم': '@mohammed_otaibi',
            'المنصة *': 'instagram',
            'المتابعين': 50000,
            'التصنيف': 'A',
            'الفئة': 'أزياء',
            'سعر التكلفة (ر.س)': 1500,
            'سعر البيع (ر.س)': 2500,
            'الجوال': '0501234567',
            'IBAN': 'SA0080000000000000000000',
            'البنك': 'الراجحي',
            'المنطقة': 'الرياض',
            'الجنس': 'ذكر',
            'ملاحظات': 'مؤثر نشط في قطاع الأزياء'
          },
          {
            'الاسم *': 'مثال: سارة الزهراني',
            'اسم المستخدم': 'sara_z',
            'المنصة *': 'tiktok',
            'المتابعين': 120000,
            'التصنيف': 'A+',
            'الفئة': 'تجميل',
            'سعر التكلفة (ر.س)': 3000,
            'سعر البيع (ر.س)': 5000,
            'الجوال': '0509876543',
            'IBAN': 'SA0010000000000000000000',
            'البنك': 'الأهلي',
            'المنطقة': 'جدة',
            'الجنس': 'أنثى',
            'ملاحظات': ''
          }
        ]
      },
      
      customers: {
        fileName: 'قالب_العملاء.xlsx',
        sheetName: 'العملاء',
        rows: [
          {
            'اسم الشركة *': 'مثال: شركة الأمل',
            'اسم جهة الاتصال': 'أحمد المالكي',
            'الجوال *': '0501234567',
            'البريد الإلكتروني': 'contact@example.com',
            'القطاع': 'تجارة إلكترونية',
            'السجل التجاري': '1010123456',
            'الرقم الضريبي': '300012345600003',
            'العنوان': 'الرياض - حي الملقا',
            'ملاحظات': ''
          }
        ]
      },
      
      campaigns: {
        fileName: 'قالب_الحملات.xlsx',
        sheetName: 'الحملات',
        rows: [
          {
            'اسم الحملة *': 'مثال: حملة الصيف 2026',
            'العميل (ID أو اسم) *': 'CL-101',
            'تاريخ البداية': '01/06/2026',
            'تاريخ النهاية': '30/06/2026',
            'الميزانية (ر.س)': 50000,
            'الحالة': 'نشطة',
            'الوصف': 'حملة ترويجية لمنتجات الصيف',
            'ملاحظات': ''
          }
        ]
      }
    };
    
    const tpl = templates[type];
    if(!tpl){
      console.error('Unknown template:', type);
      return;
    }
    
    this.toExcel(tpl.rows, {
      sheetName: tpl.sheetName,
      fileName: tpl.fileName
    });
  },
  
  /* ====== PDF Export using window.print() with print stylesheet ======
     Most reliable cross-browser approach without external library bloat */
  
  toPDFviaPrint(htmlContent, opts){
    opts = opts || {};
    const title = opts.title || 'مستند';
    
    // Open new window with printable HTML
    const win = window.open('', '_blank', 'width=900,height=1100');
    if(!win){
      alert('يرجى السماح بفتح النوافذ المنبثقة لتحميل PDF');
      return;
    }
    
    const printHTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @page{size:A4;margin:15mm}
  *{box-sizing:border-box;margin:0;padding:0;font-variant-numeric:lining-nums tabular-nums}
  body{font-family:'IBM Plex Sans Arabic','Tahoma',sans-serif;color:#0a0a0f;line-height:1.55;padding:20px;background:#fff;direction:rtl}
  .pdf-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:2px solid #0d8a6f;margin-bottom:24px}
  .pdf-brand{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:22px;color:#0d8a6f}
  .pdf-brand small{display:block;font-size:11px;font-weight:500;color:#71717a;letter-spacing:0.5px;margin-top:2px}
  .pdf-meta{text-align:end;font-size:11px;color:#71717a;font-family:'JetBrains Mono',monospace}
  .pdf-meta b{display:block;font-size:12px;color:#0a0a0f;margin-bottom:2px}
  .pdf-title{font-size:22px;font-weight:800;color:#0a0a0f;margin-bottom:14px;text-align:center;font-family:'Plus Jakarta Sans',sans-serif}
  .pdf-section{margin-bottom:18px;page-break-inside:avoid}
  .pdf-section-title{font-size:13px;font-weight:700;color:#0d8a6f;background:#f0fdf4;padding:7px 11px;border-radius:6px;margin-bottom:10px;border-right:3px solid #0d8a6f}
  .pdf-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:8px}
  .pdf-field{font-size:11.5px;line-height:1.5;padding:4px 0;border-bottom:1px dotted #e4e4e7}
  .pdf-field label{color:#71717a;font-weight:600;display:inline-block;min-width:90px}
  .pdf-field b{color:#0a0a0f;font-weight:700}
  table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11.5px}
  th{background:#f5f5f5;color:#0a0a0f;font-weight:700;padding:8px 10px;text-align:start;border:1px solid #e4e4e7}
  td{padding:7px 10px;border:1px solid #e4e4e7;color:#27272a}
  tr:nth-child(even) td{background:#fafafa}
  .pdf-amount{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:18px;color:#0d8a6f}
  .pdf-total-row{background:#f0fdf4 !important}
  .pdf-total-row td{font-weight:700;color:#0d8a6f;font-size:13px;border-top:2px solid #0d8a6f}
  .pdf-footer{margin-top:30px;padding-top:14px;border-top:1px solid #e4e4e7;display:flex;justify-content:space-between;font-size:10.5px;color:#71717a;font-family:'JetBrains Mono',monospace}
  .pdf-sig-box{margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:36px}
  .pdf-sig{text-align:center;padding-top:36px;border-top:1px solid #0a0a0f;font-size:11.5px;color:#0a0a0f;font-weight:600}
  .pdf-stamp{display:inline-block;padding:6px 14px;border:2px solid #0d8a6f;color:#0d8a6f;font-weight:800;font-size:12px;border-radius:6px;font-family:'JetBrains Mono',monospace}
  @media print {
    body{padding:0}
    .no-print{display:none !important}
    .print-btn{display:none !important}
  }
  .print-btn{position:fixed;bottom:20px;inset-inline-start:20px;padding:12px 22px;background:#0d8a6f;color:#fff;border:none;border-radius:8px;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(13,138,111,.3);z-index:9999}
  .print-btn:hover{background:#0a7158}
</style>
</head>
<body>
${htmlContent}
<button class="print-btn no-print" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
<script>
  setTimeout(() => window.print(), 600);
</script>
</body>
</html>`;
    
    win.document.write(printHTML);
    win.document.close();
  },
  
  /* ====== Transfer PDF Export ====== */
  
  transferToPDF(transfer, opts){
    opts = opts || {};
    const fmt = (n) => Number(n || 0).toLocaleString('en-US');
    const fmtDate = (iso) => {
      if(!iso) return '—';
      try {
        const d = new Date(iso);
        return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
      } catch(e){ return iso; }
    };
    
    const stageLabel = (s) => {
      if(s === 'complete' || s === 'completed') return 'مكتملة';
      if(s === 2) return 'بانتظار الفاتورة';
      if(s === 3) return 'إرسال للعميل';
      return 'بانتظار التحويل';
    };
    
    const recipients = transfer.recipients || [];
    const recipientsTable = recipients.length > 0 ? `
      <div class="pdf-section">
        <div class="pdf-section-title">المستلمون</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم</th>
              <th>البنك</th>
              <th>IBAN</th>
              <th>المبلغ الأساسي</th>
              <th>الضريبة</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${recipients.map((r, i) => `
              <tr>
                <td>${i+1}</td>
                <td>${r.name || '—'}</td>
                <td>${r.bank_name || '—'}</td>
                <td style="font-family:'JetBrains Mono',monospace;font-size:10.5px">${r.iban || '—'}</td>
                <td>${fmt(r.amount_base)} ر.س</td>
                <td>${fmt(r.vat)} ر.س</td>
                <td><b>${fmt(r.amount_total)} ر.س</b></td>
              </tr>
            `).join('')}
            <tr class="pdf-total-row">
              <td colspan="4">الإجمالي</td>
              <td>${fmt(transfer.amount_base)} ر.س</td>
              <td>${fmt(transfer.vat)} ر.س</td>
              <td>${fmt(transfer.amount_total)} ر.س</td>
            </tr>
          </tbody>
        </table>
      </div>
    ` : '';
    
    const html = `
      <div class="pdf-header">
        <div class="pdf-brand">
          SmartCode
          <small>INFLUENCER CRM</small>
        </div>
        <div class="pdf-meta">
          <b>تقرير حوالة</b>
          ${fmtDate(new Date().toISOString())}
        </div>
      </div>
      
      <div class="pdf-title">تفاصيل الحوالة ${transfer.id || ''}</div>
      
      <div class="pdf-section">
        <div class="pdf-section-title">معلومات أساسية</div>
        <div class="pdf-grid">
          <div class="pdf-field"><label>رقم الحوالة:</label> <b>${transfer.id || '—'}</b></div>
          <div class="pdf-field"><label>الحالة:</label> <b>${stageLabel(transfer.workflow_stage || transfer.status)}</b></div>
          <div class="pdf-field"><label>الحملة:</label> <b>${transfer.campaign_name || '—'}</b></div>
          <div class="pdf-field"><label>العميل:</label> <b>${transfer.customer_name || '—'}</b></div>
          <div class="pdf-field"><label>تاريخ الإنشاء:</label> <b>${fmtDate(transfer.created_at)}</b></div>
          <div class="pdf-field"><label>آخر تحديث:</label> <b>${fmtDate(transfer.updated_at)}</b></div>
          <div class="pdf-field"><label>الموظف المسؤول:</label> <b>${transfer.assignee || '—'}</b></div>
          <div class="pdf-field"><label>الاتجاه:</label> <b>${transfer.direction === 'incoming' ? 'وارد' : 'صادر'}</b></div>
        </div>
      </div>
      
      ${recipientsTable}
      
      <div class="pdf-section">
        <div class="pdf-section-title">ملخص مالي</div>
        <table>
          <tbody>
            <tr><td>المبلغ الأساسي</td><td style="text-align:end"><b>${fmt(transfer.amount_base)} ر.س</b></td></tr>
            <tr><td>ضريبة القيمة المضافة (15%)</td><td style="text-align:end"><b>${fmt(transfer.vat)} ر.س</b></td></tr>
            <tr class="pdf-total-row"><td>الإجمالي</td><td style="text-align:end"><b>${fmt(transfer.amount_total)} ر.س</b></td></tr>
          </tbody>
        </table>
      </div>
      
      ${transfer.notes ? `
        <div class="pdf-section">
          <div class="pdf-section-title">ملاحظات</div>
          <p style="font-size:12px;color:#27272a;line-height:1.6">${transfer.notes}</p>
        </div>
      ` : ''}
      
      <div class="pdf-sig-box">
        <div class="pdf-sig">المُحاسب المسؤول</div>
        <div class="pdf-sig">مدير المالية</div>
      </div>
      
      <div class="pdf-footer">
        <div>تم الإنشاء بواسطة Smart Code CRM</div>
        <div><span class="pdf-stamp">${transfer.id || 'TR'}</span></div>
      </div>
    `;
    
    this.toPDFviaPrint(html, { title: 'حوالة ' + (transfer.id || '') });
  },
  
  /* ====== Campaign PDF Export ====== */
  
  campaignToPDF(campaign, ads){
    ads = ads || [];
    const fmt = (n) => Number(n || 0).toLocaleString('en-US');
    const fmtDate = (iso) => {
      if(!iso) return '—';
      try {
        const d = new Date(iso);
        return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
      } catch(e){ return iso; }
    };
    
    const totalCost = ads.reduce((s, a) => s + (Number(a.cost_price) || 0), 0);
    const totalSale = ads.reduce((s, a) => s + (Number(a.sale_price) || 0), 0);
    
    const adsTable = ads.length > 0 ? `
      <div class="pdf-section">
        <div class="pdf-section-title">الإعلانات في الحملة (${ads.length})</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>المؤثر</th>
              <th>المنصة</th>
              <th>التاريخ</th>
              <th>سعر التكلفة</th>
              <th>سعر البيع</th>
              <th>الربح</th>
            </tr>
          </thead>
          <tbody>
            ${ads.slice(0, 30).map((a, i) => `
              <tr>
                <td>${i+1}</td>
                <td>${a.influencer_name || '—'}</td>
                <td>${a.platform || '—'}</td>
                <td>${fmtDate(a.ad_date)}</td>
                <td>${fmt(a.cost_price)}</td>
                <td>${fmt(a.sale_price)}</td>
                <td><b>${fmt(Number(a.sale_price||0) - Number(a.cost_price||0))}</b></td>
              </tr>
            `).join('')}
            <tr class="pdf-total-row">
              <td colspan="4">الإجمالي</td>
              <td>${fmt(totalCost)}</td>
              <td>${fmt(totalSale)}</td>
              <td>${fmt(totalSale - totalCost)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    ` : '';
    
    const html = `
      <div class="pdf-header">
        <div class="pdf-brand">
          SmartCode
          <small>INFLUENCER CRM</small>
        </div>
        <div class="pdf-meta">
          <b>تقرير حملة</b>
          ${fmtDate(new Date().toISOString())}
        </div>
      </div>
      
      <div class="pdf-title">${campaign.name || campaign.id || 'حملة'}</div>
      
      <div class="pdf-section">
        <div class="pdf-section-title">معلومات الحملة</div>
        <div class="pdf-grid">
          <div class="pdf-field"><label>رقم الحملة:</label> <b>${campaign.id || '—'}</b></div>
          <div class="pdf-field"><label>الحالة:</label> <b>${campaign.status || '—'}</b></div>
          <div class="pdf-field"><label>العميل:</label> <b>${campaign.customer_name || '—'}</b></div>
          <div class="pdf-field"><label>تاريخ البداية:</label> <b>${fmtDate(campaign.start_date)}</b></div>
          <div class="pdf-field"><label>تاريخ النهاية:</label> <b>${fmtDate(campaign.end_date)}</b></div>
          <div class="pdf-field"><label>الميزانية:</label> <b>${fmt(campaign.budget)} ر.س</b></div>
        </div>
      </div>
      
      ${adsTable}
      
      ${ads.length > 30 ? `<p style="text-align:center;font-size:11px;color:#71717a;margin-top:8px">عرض أول 30 إعلان من ${ads.length}</p>` : ''}
      
      <div class="pdf-footer">
        <div>تم الإنشاء بواسطة Smart Code CRM</div>
        <div><span class="pdf-stamp">${campaign.id || 'CMP'}</span></div>
      </div>
    `;
    
    this.toPDFviaPrint(html, { title: 'حملة ' + (campaign.name || '') });
  }
};

window.SC = window.SC || {};
window.SC.exports = exports;

console.log('Smart Code Exports loaded');

})(window);
