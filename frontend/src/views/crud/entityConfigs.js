export const entityConfigs = {
  customer: { endpoint:'customers', list:'/customers', title:'عميل', fields:[
    ['name','اسم العميل','text',true],['contact_person','الشخص المسؤول'],['phone','رقم الهاتف'],
    ['email','البريد الإلكتروني','email'],['sector','القطاع'],['cr_number','السجل التجاري'],
    ['vat_number','الرقم الضريبي'],['address','العنوان'],
    ['status','الحالة','select',false,[['active','نشط'],['inactive','غير نشط'],['archived','مؤرشف']]],
    ['notes','ملاحظات','textarea'],
  ]},
  influencer: { endpoint:'influencers', list:'/influencers', title:'مؤثر', fields:[
    ['name','اسم المؤثر','text',true],['username','اسم المستخدم'],['phone','رقم الهاتف'],
    ['email','البريد الإلكتروني','email'],
    ['platform','المنصة','select',true,[['instagram','Instagram'],['tiktok','TikTok'],['snapchat','Snapchat'],['twitter','X'],['youtube','YouTube'],['linkedin','LinkedIn']]],
    ['followers','عدد المتابعين','number'],['category','التصنيف'],
    ['rating','التقييم','select',false,[['A+','A+'],['A','A'],['B','B'],['C','C']]],
    ['region','المنطقة'],['cost_price','سعر التكلفة','number'],['sale_price','سعر البيع','number'],
    ['bank_name','البنك'],['iban','IBAN'],
    ['status','الحالة','select',false,[['active','نشط'],['inactive','غير نشط'],['blacklisted','قائمة سوداء']]],
    ['notes','ملاحظات','textarea'],
  ]},
  campaign: { endpoint:'campaigns', list:'/campaigns', title:'حملة', fields:[
    ['name','اسم الحملة','text',true],['customer_id','العميل','customers',true],
    ['start_date','تاريخ البداية','date'],['end_date','تاريخ النهاية','date'],['budget','الميزانية','number'],
    ['status','الحالة','select',false,[['draft','مسودة'],['active','نشطة'],['paused','متوقفة'],['completed','مكتملة'],['cancelled','ملغاة']]],
    ['description','الوصف','textarea'],['objectives','الأهداف','textarea'],['notes','ملاحظات','textarea'],
  ]},
};
