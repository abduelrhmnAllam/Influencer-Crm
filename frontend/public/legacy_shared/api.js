/* ===========================================================
   SMART CODE — Shared API Layer
   CRUD operations لكل الكيانات
   يعتمد على data.js
   =========================================================== */

(function(window){
'use strict';

if(!window.SC || !window.SC.data){
  throw new Error('SC.data must be loaded before api.js');
}

const data = window.SC.data;

/* ============== Helpers ============== */

function uuid(prefix){
  const ts = Date.now().toString(36);
  // SECURITY: Use crypto.getRandomValues for unpredictable IDs (prevents enumeration)
  let rnd;
  try {
    const bytes = new Uint8Array(4);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    rnd = Array.from(bytes, b => b.toString(36)).join('').substring(0, 4).toUpperCase();
  } catch(e){
    // Fallback (very old browsers only)
    rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  return (prefix || 'ID') + '-' + ts.substring(ts.length-4).toUpperCase() + rnd;
}

function nowISO(){
  return new Date().toISOString().split('T')[0];
}

function logActivity(action, entity, entityId, summary){
  const log = data.get('activity_log', []);
  log.unshift({
    id: uuid('LOG'),
    action: action,        // create, update, delete
    entity: entity,        // customer, influencer, ...
    entity_id: entityId,
    summary: summary,
    user: 'عبدالله المدير', // TODO: get from session
    timestamp: new Date().toISOString()
  });
  // Keep only last 200
  if(log.length > 200) log.length = 200;
  data.set('activity_log', log);
}

/* ============== Generic Entity Operations ============== */

function makeEntity(storageKey, idPrefix){
  return {
    list: function(filters){
      let items = data.get(storageKey, []);
      if(!filters) return items;
      
      // Apply filters
      return items.filter(item => {
        for(const key in filters){
          const val = filters[key];
          if(val === null || val === undefined || val === '') continue;
          
          if(key === 'q'){
            // Free-text search across multiple fields
            const search = String(val).toLowerCase();
            const haystack = JSON.stringify(item).toLowerCase();
            if(!haystack.includes(search)) return false;
          } else {
            if(String(item[key]) !== String(val)) return false;
          }
        }
        return true;
      });
    },
    
    get: function(id){
      const items = data.get(storageKey, []);
      return items.find(x => x.id === id) || null;
    },
    
    create: function(payload){
      const items = data.get(storageKey, []);
      const newItem = Object.assign({}, payload, {
        id: payload.id || uuid(idPrefix),
        created_at: payload.created_at || nowISO(),
        updated_at: nowISO()
      });
      items.unshift(newItem);
      data.set(storageKey, items);
      logActivity('create', storageKey, newItem.id, 'تم إضافة سجل جديد');
      // === SYNC: notify other tabs/devices ===
      if(window.SC?.sync?.notifyChange){
        window.SC.sync.notifyChange(storageKey, 'create', newItem.id, newItem);
      }
      return newItem;
    },
    
    update: function(id, patch){
      const items = data.get(storageKey, []);
      const idx = items.findIndex(x => x.id === id);
      if(idx === -1) return null;
      items[idx] = Object.assign({}, items[idx], patch, { updated_at: nowISO() });
      data.set(storageKey, items);
      logActivity('update', storageKey, id, 'تم تحديث السجل');
      // === SYNC: notify other tabs/devices ===
      if(window.SC?.sync?.notifyChange){
        window.SC.sync.notifyChange(storageKey, 'update', id, items[idx]);
      }
      // === Auto-reschedule reminders for daily_ads ===
      if(storageKey === 'daily_ads' && window.SC?.system?.autoScheduleAd){
        // Check if date/time changed
        const dateChanged = patch.scheduled_date !== undefined || patch.ad_date !== undefined || patch.ad_time !== undefined;
        if(dateChanged && (items[idx].scheduled_date || items[idx].ad_date)){
          try { window.SC.system.autoScheduleAd(items[idx]); } catch(e){}
        }
      }
      return items[idx];
    },
    
    remove: function(id){
      const items = data.get(storageKey, []);
      const idx = items.findIndex(x => x.id === id);
      if(idx === -1) return false;
      const removed = items.splice(idx, 1)[0];
      data.set(storageKey, items);
      logActivity('delete', storageKey, id, 'تم حذف '+(removed.name||id));
      // === SYNC: notify other tabs/devices ===
      if(window.SC?.sync?.notifyChange){
        window.SC.sync.notifyChange(storageKey, 'delete', id, removed);
      }
      // === Cancel pending reminders for daily_ads ===
      if(storageKey === 'daily_ads' && window.SC?.system?.cancelReminders){
        try { window.SC.system.cancelReminders(id); } catch(e){}
      }
      return true;
    },
    
    count: function(filter){
      return this.list(filter).length;
    },
    
    bulk_remove: function(ids){
      let items = data.get(storageKey, []);
      const before = items.length;
      items = items.filter(x => !ids.includes(x.id));
      data.set(storageKey, items);
      const removed = before - items.length;
      if(removed > 0){
        logActivity('delete', storageKey, '*', 'حذف جماعي ('+removed+' سجل)');
        // === SYNC: notify other tabs/devices ===
        if(window.SC?.sync?.notifyChange){
          window.SC.sync.notifyChange(storageKey, 'bulk_remove', ids.join(','), { count: removed, ids: ids });
        }
      }
      return removed;
    }
  };
}

/* ============== Entities ============== */

const customers = makeEntity('customers', 'CL');
const influencers = makeEntity('influencers', 'INF');
const campaigns = makeEntity('campaigns', 'CMP');
const transfers = makeEntity('transfers', 'TR');
const daily_ads = makeEntity('daily_ads', 'AD');
const ad_tasks = makeEntity('ad_tasks', 'TASK');
const influencer_notifications = makeEntity('influencer_notifications', 'NOTIF');
const ugc_creators = makeEntity('ugc_creators', 'UGC');

// UGC Creator Network — External Portal entities
const ugc_applications = makeEntity('ugc_applications', 'UAPP');
const ugc_submissions = makeEntity('ugc_submissions', 'USUB');
const ugc_transactions = makeEntity('ugc_transactions', 'UTXN');
// مسار UGC المستقل: باقات + حملات بإدارتها ومتابعتها التشغيلية الخاصة
const ugc_packages = makeEntity('ugc_packages', 'UPKG');
const ugc_campaigns = makeEntity('ugc_campaigns', 'UCMP');
const ugc_notifications_data = makeEntity('ugc_notifications', 'UNOT');

const content = makeEntity('content', 'CNT');
const whatsapp_numbers = makeEntity('whatsapp_numbers', 'WA');
const whatsapp_templates = makeEntity('whatsapp_templates', 'TPL');
const whatsapp_conversations = makeEntity('whatsapp_conversations', 'CONV');
const whatsapp_messages = makeEntity('whatsapp_messages', 'MSG');
const whatsapp_broadcasts = makeEntity('whatsapp_broadcasts', 'BC');
const whatsapp_automations = makeEntity('whatsapp_automations', 'AUTO');
const team = makeEntity('team', 'USR');

/* ═══════════════════════════════════════════════════════════════════
   UGC CREATOR NETWORK — Authentication, Matching, Wallet
   External portal for TikTok content creators
   ═══════════════════════════════════════════════════════════════════ */

/**
 * UGC Creator Authentication (separate from admin auth)
 * Creators login with phone + password
 * Session stored in 'sc_ugc_session' key
 */
const ugc_auth = {
  SESSION_KEY: 'sc_ugc_session',
  
  /** Hash password using same security layer as admin */
  async hashPassword(plain) {
    if(window.SC?.security?.hashPassword) {
      return await window.SC.security.hashPassword(plain);
    }
    // Fallback: simple hash
    const enc = new TextEncoder().encode(plain + 'ugc_salt_v1');
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return 'sha256:' + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  },
  
  /** Verify password */
  async verifyPassword(plain, hash) {
    if(window.SC?.security?.verifyPassword) {
      try { return await window.SC.security.verifyPassword(plain, hash); } catch(e) {}
    }
    const computed = await this.hashPassword(plain);
    return computed === hash;
  },
  
  /** Register a new creator */
  async register(payload) {
    const phone = (payload.phone || '').replace(/[^\d]/g, '');
    if(phone.length < 9) throw new Error('رقم الجوال غير صحيح');
    if(!payload.password || payload.password.length < 6) throw new Error('كلمة المرور 6 أحرف على الأقل');
    if(!payload.full_name) throw new Error('الاسم الكامل مطلوب');
    
    // Check uniqueness
    const all = ugc_creators.list();
    const existing = all.find(c => (c.phone || '').replace(/[^\d]/g, '') === phone);
    if(existing) throw new Error('هذا الرقم مسجّل مسبقاً');
    
    const passHash = await this.hashPassword(payload.password);
    
    const creator = ugc_creators.create({
      full_name: payload.full_name,
      phone: '966' + (phone.startsWith('966') ? phone.substring(3) : phone.replace(/^0/, '')),
      email: payload.email || null,
      password_hash: passHash,
      
      // Profile
      city: payload.city || null,
      gender: payload.gender || null,
      age_range: payload.age_range || null,
      tiktok_handle: payload.tiktok_handle || null,
      tiktok_followers: payload.tiktok_followers || 0,
      tiktok_avg_views: payload.tiktok_avg_views || 0,
      engagement_rate: payload.engagement_rate || 0,
      categories: payload.categories || [],
      content_types: payload.content_types || [],
      
      // Financial
      iban: payload.iban || null,
      bank_name: payload.bank_name || null,
      account_holder_name: payload.account_holder_name || payload.full_name,
      
      // Status
      status: 'active',
      verification_status: 'pending',  // pending|verified|rejected
      level: 'bronze',  // bronze|silver|gold|platinum
      
      // Stats (computed)
      total_earnings: 0,
      pending_earnings: 0,
      completed_campaigns: 0,
      rating: 0,
      
      // Meta
      registered_at: new Date().toISOString(),
      last_login_at: null,
      referral_code: 'UGC-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    });
    
    // 🔗 INTEGRATION: Log to main activity_log so it shows in admin dashboard
    logActivity('create', 'ugc_creators', creator.id, 
      `سجّل صانع محتوى UGC جديد: ${creator.full_name} (${creator.phone})`);
    
    return creator;
  },
  
  /** Login by phone + password */
  async login(phone, password) {
    const phoneClean = (phone || '').replace(/[^\d]/g, '');
    const all = ugc_creators.list();
    const creator = all.find(c => (c.phone || '').replace(/[^\d]/g, '').endsWith(phoneClean.slice(-9)));
    
    if(!creator) throw new Error('لا يوجد حساب بهذا الرقم');
    if(creator.status !== 'active') throw new Error('الحساب موقوف. تواصل مع الدعم');
    
    const valid = await this.verifyPassword(password, creator.password_hash || '');
    if(!valid) throw new Error('كلمة المرور غير صحيحة');
    
    // Update last login
    ugc_creators.update(creator.id, { last_login_at: new Date().toISOString() });
    
    // Create session
    const session = {
      creator_id: creator.id,
      phone: creator.phone,
      name: creator.full_name,
      level: creator.level,
      logged_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()  // 30 days
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return { session, creator };
  },
  
  /** Get current creator session (null if not logged in) */
  getSession() {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      if(!raw) return null;
      const s = JSON.parse(raw);
      if(s.expires_at && new Date(s.expires_at) < new Date()) {
        this.logout();
        return null;
      }
      return s;
    } catch(e) { return null; }
  },
  
  /** Get current creator full record */
  getCurrentCreator() {
    const session = this.getSession();
    if(!session) return null;
    return ugc_creators.get(session.creator_id);
  },
  
  /** Logout */
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  },
  
  /** Generate invitation link */
  generateInviteLink(adminId) {
    const token = 'ref_' + (window.crypto || window.msCrypto).getRandomValues(new Uint32Array(2)).join('');
    return `${window.location.origin}${window.location.pathname.replace(/\/[^\/]*$/, '')}/ugc-portal.html?ref=${token}&inviter=${adminId || 'system'}`;
  }
};

/**
 * UGC Smart Matching Engine
 * Scores creators for a given campaign based on multiple factors
 */
const ugc_matching = {
  /** Score formula:
   * - Followers fit:    25%  (within target range)
   * - Category match:   25%  (overlap with campaign category)
   * - Engagement rate:  20%  (higher = better)
   * - Location match:   15%  (creator city matches target cities)
   * - Past performance: 10%  (rating × completed campaigns)
   * - Availability:      5%  (not currently in conflicting campaign)
   */
  scoreCreator(creator, campaign) {
    if(!creator || !campaign) return 0;
    
    let score = 0;
    const breakdown = {};
    
    // 1. Followers fit (25 points)
    const targetMin = campaign.min_followers || 5000;
    const targetMax = campaign.max_followers || 500000;
    const followers = creator.tiktok_followers || 0;
    let followersScore = 0;
    if(followers >= targetMin && followers <= targetMax) {
      followersScore = 25;
    } else if(followers > 0) {
      // Partial: closer = better
      const distance = followers < targetMin ? (targetMin - followers) / targetMin : (followers - targetMax) / targetMax;
      followersScore = Math.max(0, 25 - distance * 25);
    }
    breakdown.followers = Math.round(followersScore);
    score += followersScore;
    
    // 2. Category match (25 points)
    const campaignCats = (campaign.categories || campaign.industry ? [campaign.industry] : []).map(c => (c || '').toLowerCase());
    const creatorCats = (creator.categories || []).map(c => (c || '').toLowerCase());
    let categoryScore = 0;
    if(campaignCats.length === 0 || creatorCats.length === 0) {
      categoryScore = 12; // Neutral
    } else {
      const matches = creatorCats.filter(c => campaignCats.some(cc => cc.includes(c) || c.includes(cc))).length;
      categoryScore = Math.min(25, (matches / Math.max(campaignCats.length, 1)) * 25);
    }
    breakdown.category = Math.round(categoryScore);
    score += categoryScore;
    
    // 3. Engagement rate (20 points)
    const engagement = creator.engagement_rate || 0;
    let engagementScore = 0;
    if(engagement >= 8) engagementScore = 20;
    else if(engagement >= 5) engagementScore = 16;
    else if(engagement >= 3) engagementScore = 12;
    else if(engagement >= 1) engagementScore = 8;
    else engagementScore = 4;
    breakdown.engagement = Math.round(engagementScore);
    score += engagementScore;
    
    // 4. Location match (15 points)
    const targetCities = (campaign.target_cities || campaign.cities || []).map(c => (c || '').toLowerCase());
    const creatorCity = (creator.city || '').toLowerCase();
    let locationScore = 0;
    if(targetCities.length === 0) {
      locationScore = 10; // Neutral
    } else if(creatorCity && targetCities.includes(creatorCity)) {
      locationScore = 15;
    } else if(creatorCity) {
      locationScore = 5; // Has city but different
    }
    breakdown.location = locationScore;
    score += locationScore;
    
    // 5. Past performance (10 points)
    const rating = Math.min(5, creator.rating || 0);
    const completed = Math.min(20, creator.completed_campaigns || 0);
    const perfScore = (rating / 5) * 5 + (completed / 20) * 5;
    breakdown.performance = Math.round(perfScore);
    score += perfScore;
    
    // 6. Availability (5 points)
    const activeApps = ugc_applications.list().filter(a => 
      a.creator_id === creator.id && 
      ['accepted', 'in_progress', 'pending_review'].includes(a.status)
    );
    const availabilityScore = Math.max(0, 5 - activeApps.length);
    breakdown.availability = availabilityScore;
    score += availabilityScore;
    
    return {
      total: Math.round(score),
      breakdown,
      grade: score >= 80 ? 'ممتاز' : score >= 65 ? 'جيد جداً' : score >= 50 ? 'جيد' : score >= 35 ? 'مقبول' : 'ضعيف'
    };
  },
  
  /** Get top N matches for a campaign */
  getTopMatches(campaignId, limit = 20) {
    const campaign = campaigns.get(campaignId);
    if(!campaign) return [];
    
    const creators = ugc_creators.list().filter(c => c.status === 'active');
    
    return creators
      .map(creator => ({
        creator,
        score: this.scoreCreator(creator, campaign)
      }))
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, limit);
  },
  
  /** Get suggested campaigns for a creator */
  getSuggestedCampaigns(creatorId, limit = 10) {
    const creator = ugc_creators.get(creatorId);
    if(!creator) return [];
    
    const activeCampaigns = campaigns.list().filter(c => 
      c.status === 'active' || c.status === 'planning' || c.status === 'recruiting'
    );
    
    return activeCampaigns
      .map(campaign => ({
        campaign,
        score: this.scoreCreator(creator, campaign)
      }))
      .filter(x => x.score.total >= 35)  // Only show decent matches
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, limit);
  }
};

/**
 * UGC Wallet System
 * Manages creator earnings, withdrawals, and transaction history
 */
const ugc_wallet = {
  /** Get current balance for a creator */
  getBalance(creatorId) {
    const txns = ugc_transactions.list().filter(t => t.creator_id === creatorId);
    let pending = 0;     // Earned but not yet paid
    let available = 0;   // Ready for withdrawal
    let paid = 0;        // Already paid out
    
    txns.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      switch(t.type) {
        case 'earning':
          if(t.status === 'pending') pending += amount;
          else if(t.status === 'available') available += amount;
          break;
        case 'withdrawal':
          if(t.status === 'completed') paid += amount;
          else if(t.status === 'pending') available -= amount;  // reserved
          break;
        case 'bonus':
          available += amount;
          break;
        case 'adjustment':
          available += amount;  // can be negative
          break;
      }
    });
    
    return {
      pending: Math.max(0, pending),
      available: Math.max(0, available),
      paid: paid,
      total_earned: pending + available + paid,
      currency: 'SAR'
    };
  },
  
  /** Credit earnings (when campaign content is approved) */
  credit(creatorId, amount, meta = {}) {
    return ugc_transactions.create({
      creator_id: creatorId,
      type: 'earning',
      amount: parseFloat(amount),
      status: meta.immediately_available ? 'available' : 'pending',
      campaign_id: meta.campaign_id || null,
      application_id: meta.application_id || null,
      submission_id: meta.submission_id || null,
      description: meta.description || 'مستحقات حملة',
      reference: meta.reference || null,
      created_at: new Date().toISOString()
    });
  },
  
  /** Release pending earnings to available */
  releaseEarnings(creatorId, transactionId) {
    const txn = ugc_transactions.get(transactionId);
    if(txn && txn.creator_id === creatorId && txn.status === 'pending') {
      ugc_transactions.update(transactionId, { 
        status: 'available',
        released_at: new Date().toISOString()
      });
      return true;
    }
    return false;
  },
  
  /** Request withdrawal */
  requestWithdrawal(creatorId, amount, meta = {}) {
    const balance = this.getBalance(creatorId);
    if(amount > balance.available) {
      throw new Error('الرصيد المتاح غير كافٍ');
    }
    if(amount < 100) {
      throw new Error('الحد الأدنى للسحب 100 ر.س');
    }
    
    const creator = ugc_creators.get(creatorId);
    if(!creator || !creator.iban) {
      throw new Error('يجب إضافة IBAN في الملف الشخصي أولاً');
    }
    
    const txn = ugc_transactions.create({
      creator_id: creatorId,
      type: 'withdrawal',
      amount: parseFloat(amount),
      status: 'pending',
      iban: creator.iban,
      bank_name: creator.bank_name,
      account_holder: creator.account_holder_name,
      description: meta.description || 'طلب سحب',
      requested_at: new Date().toISOString()
    });
    
    // 🔗 INTEGRATION: Create a real transfer in main finance system
    let linkedTransferId = null;
    try {
      const tr = transfers.create({
        direction: 'outgoing',
        status: 'pending',
        amount_total: parseFloat(amount),
        currency: 'SAR',
        source_type: 'ugc_withdrawal',
        source_id: txn.id,
        ugc_creator_id: creatorId,
        recipient_name: creator.full_name,
        recipient_iban: creator.iban,
        recipient_bank: creator.bank_name,
        recipient_phone: creator.phone,
        description: `سحب أرباح UGC — ${creator.full_name}`,
        notes: meta.description || 'طلب سحب من المحفظة',
        created_via: 'ugc_withdrawal'
      });
      linkedTransferId = tr.id;
      // Cross-link
      ugc_transactions.update(txn.id, { linked_transfer_id: linkedTransferId });
      txn.linked_transfer_id = linkedTransferId; // Update in-memory ref too
    } catch(e){ console.warn('[UGC] Withdrawal transfer link failed:', e); }
    
    // 🔗 INTEGRATION: Activity log
    logActivity('create', 'ugc_transactions', txn.id,
      `طلب سحب UGC من ${creator.full_name}: ${amount} ر.س`);
    
    return txn;
  },
  
  /** Mark withdrawal as completed (admin action) */
  completeWithdrawal(transactionId, meta = {}) {
    const txn = ugc_transactions.get(transactionId);
    const result = ugc_transactions.update(transactionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      bank_reference: meta.bank_reference || null,
      notes: meta.notes || null
    });
    
    // 🔗 INTEGRATION: Sync linked transfer in main finance
    if(txn && txn.linked_transfer_id) {
      try {
        transfers.update(txn.linked_transfer_id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          bank_reference: meta.bank_reference || null
        });
      } catch(e){}
    }
    
    // 🔗 INTEGRATION: Activity log
    if(txn) {
      const creator = ugc_creators.get(txn.creator_id);
      logActivity('update', 'ugc_transactions', transactionId,
        `إكمال سحب UGC لـ ${creator?.full_name || 'صانع'}: ${txn.amount} ر.س`);
    }
    
    return result;
  },
  
  /** Get transaction history */
  getTransactions(creatorId, limit = 50) {
    return ugc_transactions.list()
      .filter(t => t.creator_id === creatorId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }
};

/**
 * UGC Applications & Submissions
 * Wraps the entity APIs with business logic
 */
const ugc_application_helpers = {
  /** Apply to a campaign */
  apply(creatorId, campaignId, meta = {}) {
    const creator = ugc_creators.get(creatorId);
    const campaign = campaigns.get(campaignId);
    if(!creator || !campaign) throw new Error('Invalid creator or campaign');
    
    // Check if already applied
    const existing = ugc_applications.list().find(a => 
      a.creator_id === creatorId && a.campaign_id === campaignId
    );
    if(existing) throw new Error('لقد تقدمت لهذه الحملة سابقاً');
    
    // Calculate match score
    const score = ugc_matching.scoreCreator(creator, campaign);
    
    return ugc_applications.create({
      creator_id: creatorId,
      campaign_id: campaignId,
      campaign_name: campaign.name,
      status: 'pending_review',  // pending_review|nominated|accepted|rejected|in_progress|pending_payment|completed|cancelled
      match_score: score.total,
      match_breakdown: score.breakdown,
      
      proposed_fee: meta.proposed_fee || campaign.budget_per_creator || 0,
      pitch_message: meta.pitch_message || '',
      portfolio_links: meta.portfolio_links || [],
      
      applied_at: new Date().toISOString(),
      reviewed_at: null,
      review_notes: null
    });
  },
  
  /** Admin reviews application (accept/reject/nominate) */
  review(applicationId, action, meta = {}) {
    const validActions = {
      'nominate': 'nominated',
      'accept': 'accepted',
      'reject': 'rejected',
      'cancel': 'cancelled'
    };
    
    const newStatus = validActions[action];
    if(!newStatus) throw new Error('إجراء غير صحيح');
    
    const app = ugc_applications.get(applicationId);
    if(!app) throw new Error('Application not found');
    
    const update = {
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      review_notes: meta.notes || null,
      reviewed_by: meta.reviewed_by || null
    };
    
    if(action === 'accept') {
      update.accepted_fee = meta.accepted_fee || app.proposed_fee;
      update.brief = meta.brief || null;
      update.deadline = meta.deadline || null;
    }
    
    return ugc_applications.update(applicationId, update);
  },
  
  /** Creator submits content */
  submitContent(applicationId, data) {
    const app = ugc_applications.get(applicationId);
    if(!app) throw new Error('طلب غير موجود');
    if(!['accepted', 'in_progress'].includes(app.status)) {
      throw new Error('لا يمكن تسليم المحتوى في الحالة الحالية');
    }
    
    const submission = ugc_submissions.create({
      application_id: applicationId,
      creator_id: app.creator_id,
      campaign_id: app.campaign_id,
      
      tiktok_url: data.tiktok_url || null,
      file_url: data.file_url || null,
      caption: data.caption || '',
      description: data.description || '',
      
      status: 'pending_review',  // pending_review|approved|revisions_requested|rejected
      version: (ugc_submissions.list().filter(s => s.application_id === applicationId).length) + 1,
      
      submitted_at: new Date().toISOString()
    });
    
    // Update application status
    ugc_applications.update(applicationId, { status: 'pending_review' });
    
    return submission;
  },
  
  /** Admin reviews submission */
  reviewSubmission(submissionId, action, meta = {}) {
    const sub = ugc_submissions.get(submissionId);
    if(!sub) throw new Error('Submission not found');
    
    const statuses = {
      'approve': 'approved',
      'request_revision': 'revisions_requested',
      'reject': 'rejected'
    };
    
    const newStatus = statuses[action];
    if(!newStatus) throw new Error('إجراء غير صحيح');
    
    ugc_submissions.update(submissionId, {
      status: newStatus,
      review_notes: meta.notes || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: meta.reviewed_by || null
    });
    
    // If approved → trigger payment + update application
    if(action === 'approve') {
      const app = ugc_applications.get(sub.application_id);
      if(app) {
        ugc_applications.update(app.id, { status: 'pending_payment' });
        
        // Credit earnings to wallet
        ugc_wallet.credit(sub.creator_id, app.accepted_fee || 0, {
          campaign_id: sub.campaign_id,
          application_id: app.id,
          submission_id: submissionId,
          description: `مستحقات حملة: ${app.campaign_name}`,
          reference: 'APP-' + app.id.substring(0, 8)
        });
        
        // Update creator stats
        const creator = ugc_creators.get(sub.creator_id);
        if(creator) {
          ugc_creators.update(creator.id, {
            completed_campaigns: (creator.completed_campaigns || 0) + 1,
            pending_earnings: (creator.pending_earnings || 0) + (app.accepted_fee || 0)
          });
        }
        
        // 🔗 INTEGRATION: Log to main activity_log
        logActivity('approve', 'ugc_submissions', submissionId, 
          `اعتماد محتوى UGC من ${creator?.full_name || 'صانع محتوى'} (${app.accepted_fee || 0} ر.س)`);
        
        // 🔗 INTEGRATION: Auto-create a pending transfer in the main finance system
        // This makes UGC payments visible in the main Finance dashboard
        if(creator && app.accepted_fee && app.accepted_fee > 0) {
          try {
            transfers.create({
              direction: 'outgoing',
              status: 'pending',
              amount_total: app.accepted_fee,
              currency: 'SAR',
              
              // Link to UGC entities
              source_type: 'ugc',
              source_id: app.id,
              ugc_creator_id: creator.id,
              ugc_submission_id: submissionId,
              
              // Display fields
              recipient_name: creator.full_name,
              recipient_iban: creator.iban || null,
              recipient_bank: creator.bank_name || null,
              recipient_phone: creator.phone || null,
              campaign_id: sub.campaign_id,
              campaign_name: app.campaign_name,
              
              description: `مستحقات UGC TikTok — ${creator.full_name}`,
              notes: `حملة: ${app.campaign_name || '-'} · المحتوى: ${sub.tiktok_url || '-'}`,
              created_via: 'ugc_auto'
            });
          } catch(e){ console.warn('[UGC] Auto-transfer creation failed:', e); }
        }
      }
    } else if(action === 'reject') {
      // 🔗 INTEGRATION: Log rejection
      const creator = ugc_creators.get(sub.creator_id);
      logActivity('reject', 'ugc_submissions', submissionId,
        `رفض محتوى UGC من ${creator?.full_name || 'صانع محتوى'}: ${meta.notes || 'لم يُذكر سبب'}`);
    }
    
    return sub;
  }
};

/* WhatsApp Business Account configuration (Meta Cloud API) */
const whatsapp_config = {
  get: function(){
    return data.get('whatsapp_config', {
      // Meta Business credentials
      business_account_id: '',         // WABA ID
      phone_number_id: '',             // Phone Number ID for sending
      display_phone_number: '',        // The actual phone number
      access_token: '',                // Long-lived access token (encrypted in production)
      app_id: '',                      // Meta App ID
      app_secret: '',                  // Meta App Secret (encrypted)
      webhook_verify_token: '',        // For webhook verification
      webhook_url: '',                 // Where Meta will send webhooks
      
      // Status
      connection_status: 'disconnected', // disconnected | connecting | connected | error
      last_connected_at: null,
      last_error: null,
      
      // Business profile
      business_name: '',
      business_description: '',
      business_email: '',
      business_website: '',
      business_about: 'Hey there! I am using SmartCode CRM',
      profile_picture_url: '',
      
      // API settings
      api_version: 'v18.0',            // Meta Graph API version
      messaging_limit_tier: 'TIER_1K', // 1K/10K/100K/UNLIMITED
      quality_rating: 'GREEN',         // GREEN/YELLOW/RED
      
      // Feature flags
      auto_reply_enabled: false,
      working_hours_enabled: false,
      working_hours: { start: '08:00', end: '20:00', timezone: 'Asia/Riyadh' },
      
      created_at: nowISO(),
      updated_at: nowISO()
    });
  },
  
  set: function(patch){
    const current = this.get();
    const updated = Object.assign({}, current, patch, { updated_at: nowISO() });
    data.set('whatsapp_config', updated);
    if(window.SC?.sync?.notifyChange){
      window.SC.sync.notifyChange('whatsapp_config', 'update', 'config', updated);
    }
    return updated;
  },
  
  /* Generate webhook verify token (cryptographically random) */
  generateVerifyToken: function(){
    const bytes = new Uint8Array(24);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    return 'wt_' + Array.from(bytes, b => b.toString(16).padStart(2,'0')).join('');
  },
  
  /* Check if Meta connection is configured (has minimum required fields) */
  isConfigured: function(){
    const c = this.get();
    return !!(c.business_account_id && c.phone_number_id && c.access_token);
  },
  
  /* Get Meta API endpoint URL for a given resource */
  getApiUrl: function(path){
    const c = this.get();
    return `https://graph.facebook.com/${c.api_version}/${path}`;
  }
};

/* ============== Computed/Aggregated ============== */

function dashboardStats(){
  const c = data.get('customers', []);
  const inf = data.get('influencers', []);
  const cmp = data.get('campaigns', []);
  const tr = data.get('transfers', []);
  
  // Campaign by status
  const cmpByStatus = {};
  cmp.forEach(x => { cmpByStatus[x.status] = (cmpByStatus[x.status]||0) + 1; });
  
  // Pending transfers — count ALL transfers awaiting action (both directions)
  // - outgoing pending: حوالات للمؤثرين بانتظار التحويل (مهم لإدارة الدفعات)
  // - incoming pending: حوالات من العملاء بانتظار الاستلام
  // - confirmed/quote_sent/pending_finance/pending_invoice: حوالات بانتظار خطوة
  const PENDING_STATUSES = ['pending', 'quote_sent', 'pending_finance', 'pending_invoice', 'transferred'];
  const pending = tr.filter(x => 
    PENDING_STATUSES.includes(x.status) ||
    (x.status && x.status.startsWith('pending'))
  );
  const pendingAmount = pending.reduce((sum, x) => sum + (x.amount_total||0), 0);
  
  // Break down by direction for finer detail
  const pendingOutgoing = pending.filter(x => x.direction === 'outgoing');
  const pendingIncoming = pending.filter(x => x.direction === 'incoming');
  
  // Total incoming (all time — works with multi-year data)
  const incomingAll = tr.filter(x => 
    x.direction === 'incoming' && 
    ['confirmed','receipt','tax_invoice','completed'].includes(x.status)
  );
  const incomingTotal = incomingAll.reduce((sum, x) => sum + (x.amount_total||0), 0);
  
  // Total outgoing (all time)
  const outgoingAll = tr.filter(x => 
    x.direction === 'outgoing' && 
    ['confirmed','receipt','completed'].includes(x.status)
  );
  const outgoingTotal = outgoingAll.reduce((sum, x) => sum + (x.amount_total||0), 0);
  
  // Latest month with data
  const datesWithData = tr.map(x => (x.created_at||'').substring(0,7)).filter(Boolean).sort();
  const latestMonth = datesWithData.length > 0 ? datesWithData[datesWithData.length-1] : new Date().toISOString().substring(0,7);
  const incomingMonth = incomingAll.filter(x => (x.created_at||'').startsWith(latestMonth));
  const outgoingMonth = outgoingAll.filter(x => (x.created_at||'').startsWith(latestMonth));
  const incomingMonthTotal = incomingMonth.reduce((sum, x) => sum + (x.amount_total||0), 0);
  const outgoingMonthTotal = outgoingMonth.reduce((sum, x) => sum + (x.amount_total||0), 0);
  
  // Daily ads stats
  const ads = data.get('daily_ads', []);
  const adsCompleted = ads.filter(a => a.status === 'completed').length;
  
  // Total revenue from ads (more accurate than transfers since some campaigns lack transfers)
  const totalAdsSell = ads.reduce((s, a) => s + (a.sell_price||0), 0);
  const totalAdsCost = ads.reduce((s, a) => s + (a.cost||0), 0);
  
  // Completion rate
  const totalCompleted = cmp.filter(x => x.status === 'completed').length;
  const completionRate = cmp.length > 0 ? Math.round((totalCompleted / cmp.length) * 100) : 0;
  
  return {
    customers_total: c.length,
    customers_active: c.filter(x => x.status === 'active').length,
    customers_vip: c.filter(x => x.clientType === 'VIP').length,
    
    influencers_total: inf.length,
    influencers_a: inf.filter(x => x.classification === 'A').length,
    
    campaigns_total: cmp.length,
    campaigns_active: cmp.filter(x => ['executing','approved'].includes(x.status)).length,
    campaigns_by_status: cmpByStatus,
    
    transfers_pending: pending.length,
    transfers_pending_amount: pendingAmount,
    transfers_pending_outgoing: pendingOutgoing.length,
    transfers_pending_outgoing_amount: pendingOutgoing.reduce((s,x) => s + (x.amount_total||0), 0),
    transfers_pending_incoming: pendingIncoming.length,
    transfers_pending_incoming_amount: pendingIncoming.reduce((s,x) => s + (x.amount_total||0), 0),
    
    incoming_month: incomingMonthTotal,
    incoming_count: incomingMonth.length,
    outgoing_month: outgoingMonthTotal,
    outgoing_count: outgoingMonth.length,
    
    incoming_total: incomingTotal,
    outgoing_total: outgoingTotal,
    net_total: incomingTotal - outgoingTotal,
    
    daily_ads_total: ads.length,
    daily_ads_completed: adsCompleted,
    total_ads_sell: totalAdsSell,
    total_ads_cost: totalAdsCost,
    total_ads_profit: totalAdsSell - totalAdsCost,
    profit_margin: totalAdsSell > 0 ? Math.round((totalAdsSell - totalAdsCost) / totalAdsSell * 100) : 0,
    
    // 🔗 UGC NETWORK STATS (integrated into main dashboard)
    ugc_creators_total:        ugc_creators.list().length,
    ugc_creators_verified:     ugc_creators.list().filter(c => c.verification_status === 'verified').length,
    ugc_creators_pending:      ugc_creators.list().filter(c => c.verification_status === 'pending').length,
    ugc_applications_pending:  ugc_applications.list().filter(a => a.status === 'pending' || a.status === 'invited').length,
    ugc_submissions_pending:   ugc_submissions.list().filter(s => s.status === 'in_review').length,
    ugc_total_paid:            ugc_transactions.list()
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((s,t) => s + (parseFloat(t.amount)||0), 0),
    ugc_pending_payments:      ugc_transactions.list()
      .filter(t => t.type === 'earning' && (t.status === 'pending' || t.status === 'available'))
      .reduce((s,t) => s + (parseFloat(t.amount)||0), 0),
    
    latest_month: latestMonth,
    
    completion_rate: completionRate
  };
}

function recentActivity(n){
  const log = data.get('activity_log', []);
  return log.slice(0, n || 10);
}

/* ============== Cross-entity helpers ============== */

function getCampaignsForCustomer(customerId){
  return data.get('campaigns', []).filter(c => c.customer_id === customerId);
}

function getTransfersForCampaign(campaignId){
  return data.get('transfers', []).filter(t => t.campaign_id === campaignId);
}

function getInfluencerByPlatformSubs(minSubs, platform){
  return data.get('influencers', []).filter(inf => {
    if(platform){
      const p = (inf.platforms||[]).find(x => x.platform_name === platform);
      return p && p.subs >= (minSubs||0);
    }
    return inf.total_subscribers >= (minSubs||0);
  });
}

/* ============== Settings ============== */

const settings = {
  get: function(key){
    const s = data.get('settings', {});
    return key ? s[key] : s;
  },
  set: function(key, value){
    const s = data.get('settings', {});
    if(typeof key === 'object'){
      Object.assign(s, key);
    } else {
      s[key] = value;
    }
    data.set('settings', s);
    return s;
  }
};

/* ============== System Operations ============== */

function exportAll(){
  const keys = [
    'customers','influencers','campaigns','transfers','daily_ads','content',
    'team','settings','activity_log',
    // UGC Network
    'ugc_creators','ugc_applications','ugc_submissions','ugc_transactions','ugc_notifications',
    // WhatsApp
    'whatsapp_numbers','whatsapp_templates','whatsapp_conversations',
    'whatsapp_messages','whatsapp_broadcasts','whatsapp_automations','whatsapp_config'
  ];
  const dump = { version: data.VERSION, exported_at: new Date().toISOString() };
  keys.forEach(k => { dump[k] = data.get(k, k === 'whatsapp_config' ? null : []); });
  return dump;
}

function importAll(dump){
  if(!dump || !dump.version) return false;
  const keys = [
    'customers','influencers','campaigns','transfers','daily_ads','content',
    'team','settings','activity_log',
    'ugc_creators','ugc_applications','ugc_submissions','ugc_transactions','ugc_notifications',
    'whatsapp_numbers','whatsapp_templates','whatsapp_conversations',
    'whatsapp_messages','whatsapp_broadcasts','whatsapp_automations','whatsapp_config'
  ];
  keys.forEach(k => {
    if(dump[k] !== undefined) data.set(k, dump[k]);
  });
  return true;
}

function storageStats(){
  const stats = {};
  let totalSize = 0;
  const keys = [
    'customers','influencers','campaigns','transfers','daily_ads','content',
    'team','activity_log',
    'ugc_creators','ugc_applications','ugc_submissions','ugc_transactions',
    'whatsapp_numbers','whatsapp_templates','whatsapp_conversations','whatsapp_messages','whatsapp_broadcasts'
  ];
  keys.forEach(k => {
    const items = data.get(k, []);
    const json = JSON.stringify(items);
    stats[k] = {
      count: Array.isArray(items) ? items.length : 0,
      size_bytes: json.length
    };
    totalSize += json.length;
  });
  stats.total_size_bytes = totalSize;
  stats.total_size_kb = Math.round(totalSize / 1024);
  return stats;
}

/* ============== AD ↔ TRANSFER LINKING ============== */

// Link a transfer to a specific daily ad
function linkTransferToAd(transferId, adId){
  const transfer = transfers.get(transferId);
  const ad = daily_ads.get(adId);
  if(!transfer || !ad) return false;
  
  // Set the link on the transfer
  transfers.update(transferId, {
    linked_ad_id: adId,
    influencer_id: transfer.influencer_id || ad.influencer_id,
    influencer_name: transfer.influencer_name || ad.influencer_name,
    campaign_name: transfer.campaign_name || ad.campaign_name,
    ad_date: transfer.ad_date || ad.scheduled_date,
    ad_month: transfer.ad_month || ad.month
  });
  
  // Update the ad with transfer reference and current status
  const ts = computeAdTransferStatus(transferId);
  daily_ads.update(adId, {
    linked_transfer_id: transferId,
    transfer_status: ts
  });
  
  return true;
}

// Compute transfer_status string for an ad based on linked transfer
function computeAdTransferStatus(transferId){
  const t = transfers.get(transferId);
  if(!t) return 'pending';
  
  // If completed (stage 3) → 'completed'
  if(t.status === 'completed' || t.workflow_stage === 3) return 'completed';
  
  // If has receipts → still in progress but money sent
  if(t.workflow_stage === 2) return 'completed';  // Money already transferred at stage 2
  
  // Stage 1: awaiting transfer
  return 'pending';
}

// Auto-sync: when a transfer status changes, update all linked ads
function syncLinkedAds(transferId){
  const transfer = transfers.get(transferId);
  if(!transfer) return;
  
  const newStatus = computeAdTransferStatus(transferId);
  const allAds = daily_ads.list();
  
  // Find ads linked to this transfer
  const linkedAds = allAds.filter(a => a.linked_transfer_id === transferId);
  linkedAds.forEach(ad => {
    daily_ads.update(ad.id, { transfer_status: newStatus });
  });
  
  return linkedAds.length;
}

// Unlink a transfer from an ad
function unlinkTransferFromAd(adId){
  const ad = daily_ads.get(adId);
  if(!ad) return false;
  daily_ads.update(adId, { 
    linked_transfer_id: null,
    transfer_status: 'pending'
  });
  return true;
}

// Get suggested ads for a transfer (matching influencer + recent date)
function getSuggestedAdsForTransfer(transferId){
  const transfer = transfers.get(transferId);
  if(!transfer) return [];
  
  const allAds = daily_ads.list();
  return allAds
    .filter(a => {
      // Not already linked to another transfer
      if(a.linked_transfer_id && a.linked_transfer_id !== transferId) return false;
      // Same influencer name
      if(transfer.influencer_name && a.influencer_name === transfer.influencer_name) return true;
      // Same campaign
      if(transfer.campaign_name && a.campaign_name === transfer.campaign_name) return true;
      return false;
    })
    .sort((a,b) => (b.scheduled_date||'').localeCompare(a.scheduled_date||''))
    .slice(0, 10);
}

// Hook into transfer updates: auto-sync linked ads + send notifications
const originalTransferUpdate = transfers.update.bind(transfers);
transfers.update = function(id, patch){
  const prevTransfer = transfers.get(id);
  const prevStage = prevTransfer?.workflow_stage;
  
  const result = originalTransferUpdate(id, patch);
  
  // After update, sync linked ads
  try { syncLinkedAds(id); } catch(e){}
  
  // Send notifications based on workflow stage transition
  try {
    if(window.SC?.system?.addNotification){
      const newTransfer = transfers.get(id);
      const newStage = newTransfer?.workflow_stage;
      
      // Stage 1 → 2: Receipt uploaded (Finance → Operations)
      if(prevStage === 1 && newStage === 2){
        window.SC.system.addNotification({
          type: 'success',
          subtype: 'transfer_receipt',
          title: 'تم رفع إيصال التحويل',
          message: `الحوالة ${id} للمشهور "${newTransfer.influencer_name || ''}" — تم رفع الإيصال من المالية. يمكن الآن رفع الفاتورة الضريبية.`,
          link: 'transfer-detail.html?id=' + id
        });
      }
      
      // Stage 2 → 3 (completed): Tax invoice uploaded
      if((prevStage === 2 || prevStage === 1) && newTransfer?.status === 'completed'){
        window.SC.system.addNotification({
          type: 'success',
          subtype: 'transfer_completed',
          title: 'اكتملت الحوالة',
          message: `الحوالة ${id} للمشهور "${newTransfer.influencer_name || ''}" بمبلغ ${(newTransfer.amount_total || 0).toLocaleString('en-US')} ر.س مكتملة بنجاح.`,
          link: 'transfer-detail.html?id=' + id
        });
      }
    }
  } catch(e){}
  
  return result;
};

// Hook into transfer create: send notification
const originalTransferCreate = transfers.create.bind(transfers);
transfers.create = function(payload){
  const result = originalTransferCreate(payload);
  
  try {
    if(window.SC?.system?.addNotification && result?.id){
      window.SC.system.addNotification({
        type: 'info',
        subtype: 'new_transfer',
        title: 'حوالة جديدة بانتظار التنفيذ',
        message: `حوالة جديدة ${result.id} للمشهور "${result.influencer_name || ''}" بمبلغ ${(result.amount_total || 0).toLocaleString('en-US')} ر.س — بانتظار المالية.`,
        link: 'transfer-detail.html?id=' + result.id
      });
    }
  } catch(e){}
  
  return result;
};

// Hook into daily_ads create: optional notification
const originalDailyAdCreate = daily_ads.create.bind(daily_ads);
daily_ads.create = function(payload){
  const result = originalDailyAdCreate(payload);
  
  try {
    if(window.SC?.system?.addNotification && result?.id){
      window.SC.system.addNotification({
        type: 'info',
        subtype: 'new_ad',
        title: 'إعلان جديد في الحملة',
        message: `إعلان جديد للمشهور "${result.influencer_name || ''}" — حملة "${result.campaign_name || ''}".`,
        link: result.campaign_id ? `campaign-detail.html?id=${result.campaign_id}` : 'orders-campaigns.html'
      });
    }
  } catch(e){}
  
  return result;
};

// === CAMPAIGN ADS JOURNEY HELPERS ===
// Each ad in a campaign has a simple journey with 4 checkpoints
const campaign_ads = {
  // Get all ads belonging to a campaign
  forCampaign: function(campaignId){
    const all = data.get('daily_ads', []);
    return all.filter(a => a.campaign_id === campaignId);
  },
  
  // Get all ads for a campaign + influencer combination
  forCampaignInfluencer: function(campaignId, influencerId){
    const all = data.get('daily_ads', []);
    return all.filter(a => a.campaign_id === campaignId && a.influencer_id === influencerId);
  },
  
  // Get unique influencer IDs in a campaign
  influencersInCampaign: function(campaignId){
    const ads = this.forCampaign(campaignId);
    const ids = [...new Set(ads.map(a => a.influencer_id).filter(Boolean))];
    return ids;
  },
  
  // Quick create: add a new ad to a campaign for a specific influencer
  addToCampaign: function(campaignId, influencerId, payload){
    const cmp = campaigns.get(campaignId);
    const inf = influencers.get(influencerId);
    if(!cmp || !inf) return null;
    
    // Auto-attach current employee
    const session = (window.SC?.auth?.getSession?.()) || {};
    
    const newAd = daily_ads.create({
      campaign_id: campaignId,
      campaign_name: cmp.name || cmp.title || cmp.campaign_name,
      customer_id: cmp.customer_id,
      customer_name: cmp.customer_name,
      influencer_id: influencerId,
      influencer_name: inf.name,
      platform: payload.platform || inf.platform,
      ad_type: payload.ad_type || null,
      ads_count: Math.max(1, parseInt(payload.ads_count,10) || 1),
      employee_name: payload.employee_name || session.name || '',
      employee_id: payload.employee_id || session.employee_id || '',
      ad_date: payload.ad_date || null,
      scheduled_date: payload.scheduled_date || payload.ad_date || null,
      ad_time: payload.ad_time || null,
      cost: payload.cost || 0,
      sell_price: payload.sell_price || 0,
      revenue: payload.revenue || payload.sell_price || 0,
      notes: payload.notes || '',
      status: 'draft',
      journey: {
        quote_uploaded: false,
        quote_file: null,
        transfer_uploaded: false,
        transfer_file: null,
        receipt_uploaded: false,
        receipt_file: null,
        invoice_uploaded: false,
        invoice_file: null
      }
    });
    
    // Auto-schedule reminders if ad has a date
    if(newAd && (newAd.scheduled_date || newAd.ad_date)){
      try { window.SC?.system?.autoScheduleAd?.(newAd); } catch(e){}
    }
    
    return newAd;
  },
  
  // Update a single journey checkpoint
  updateJourney: function(adId, checkpoint, value, fileData){
    const ad = daily_ads.get(adId);
    if(!ad) return null;
    
    const journey = ad.journey || {
      quote_uploaded: false, quote_file: null,
      transfer_uploaded: false, transfer_file: null,
      receipt_uploaded: false, receipt_file: null,
      invoice_uploaded: false, invoice_file: null
    };
    
    // Valid checkpoints
    const checkpoints = ['quote', 'transfer', 'receipt', 'invoice'];
    if(!checkpoints.includes(checkpoint)) return null;
    
    journey[checkpoint + '_uploaded'] = !!value;
    if(fileData){
      journey[checkpoint + '_file'] = {
        name: fileData.name || 'file',
        size: fileData.size || 0,
        type: fileData.type || 'application/octet-stream',
        data: fileData.data || null,
        uploaded_at: nowISO(),
        uploaded_by: (window.SC?.auth?.getSession?.()?.name) || ''
      };
    } else if(!value){
      journey[checkpoint + '_file'] = null;
    }
    
    // Auto-update status based on completion
    const completed = ['quote_uploaded','transfer_uploaded','receipt_uploaded','invoice_uploaded']
      .filter(k => journey[k]).length;
    let status = ad.status || 'draft';
    if(completed === 0) status = ad.scheduled_date ? 'scheduled' : 'draft';
    else if(completed === 4) status = 'completed';
    else status = 'in_progress';
    
    return daily_ads.update(adId, { journey: journey, status: status });
  },
  
  // Get journey completion percentage
  journeyProgress: function(adId){
    const ad = daily_ads.get(adId);
    if(!ad || !ad.journey) return 0;
    const total = 4;
    const done = ['quote_uploaded','transfer_uploaded','receipt_uploaded','invoice_uploaded']
      .filter(k => ad.journey[k]).length;
    return Math.round((done / total) * 100);
  },
  
  // BULK ADD: add multiple ads at once for one campaign + multiple influencers
  bulkAddToCampaign: function(campaignId, items){
    // items: [{ influencer_id, ad_date, ad_time, cost, sell_price, ad_type, platform, notes }, ...]
    const cmp = campaigns.get(campaignId);
    if(!cmp) return { created: 0, errors: [] };
    
    const session = (window.SC?.auth?.getSession?.()) || {};
    let created = 0;
    const errors = [];
    
    items.forEach((item, idx) => {
      const inf = influencers.get(item.influencer_id);
      if(!inf){
        errors.push({ row: idx + 1, message: `المؤثر ${item.influencer_id} غير موجود` });
        return;
      }
      
      const result = daily_ads.create({
        campaign_id: campaignId,
        campaign_name: cmp.name || cmp.title || cmp.campaign_name,
        customer_id: cmp.customer_id,
        customer_name: cmp.customer_name,
        influencer_id: item.influencer_id,
        influencer_name: inf.name,
        platform: item.platform || inf.platform,
        employee_name: item.employee_name || session.name || '',
        employee_id: item.employee_id || session.employee_id || '',
        ad_date: item.ad_date || null,
        scheduled_date: item.scheduled_date || item.ad_date || null,
        ad_time: item.ad_time || null,
        ad_type: item.ad_type || null,
        cost: parseFloat(item.cost) || 0,
        sell_price: parseFloat(item.sell_price) || 0,
        notes: item.notes || '',
        status: (item.ad_date || item.scheduled_date) ? 'scheduled' : 'draft',
        journey: {
          quote_uploaded: false, quote_file: null,
          transfer_uploaded: false, transfer_file: null,
          receipt_uploaded: false, receipt_file: null,
          invoice_uploaded: false, invoice_file: null
        }
      });
      
      if(result){
        created++;
        // Auto-schedule reminders if has date
        if(result.scheduled_date || result.ad_date){
          try { window.SC?.system?.autoScheduleAd?.(result); } catch(e){}
        }
      }
    });
    
    return { created, errors };
  }
};

// === MY WORK MODULE ===
// Powerful module that ties everything together for the logged-in user
const my_work = {
  // Get all data relevant to current user
  forCurrentUser: function(){
    const session = (window.SC?.auth?.getSession?.()) || {};
    // ROBUST: return empty-but-valid object if no session, never null
    // This prevents "خطأ في تحميل البيانات" on dashboard
    if(!session.username){
      return this._emptyResult();
    }
    
    return this.forUser(session.name || session.username, session.role || 'guest');
  },
  
  // Return a valid empty result structure (used when no data available)
  _emptyResult: function(){
    return {
      stats: { totalAds: 0, completedAds: 0, totalEarned: 0, totalCharged: 0 },
      adsByDay: { overdue: [], today: [], tomorrow: [], thisWeek: [], later: [] },
      tasks: { quotes: [], transfers: [], receipts: [], invoices: [] },
      customers: [],
      campaigns: [],
      transfers: [],
      ads: []
    };
  },
  
  // Get all data for a specific user by name + role
  forUser: function(userName, role){
    const allAds = data.get('daily_ads', []);
    const allTransfers = data.get('transfers', []);
    const allCampaigns = data.get('campaigns', []);
    const allCustomers = data.get('customers', []);
    
    // 1. Ads assigned to this employee (by name match)
    const myAds = allAds.filter(a => 
      a.employee_name === userName || 
      a.assigned_to === userName ||
      a.created_by === userName
    );
    
    // 2. Campaign IDs where I have ads
    const myCampaignIds = [...new Set(myAds.map(a => a.campaign_id).filter(Boolean))];
    const myCampaigns = myCampaignIds.map(id => allCampaigns.find(c => c.id === id)).filter(Boolean);
    
    // 3. Customer IDs from my campaigns
    const myCustomerIds = [...new Set(myCampaigns.map(c => c.customer_id).filter(Boolean))];
    const myCustomers = myCustomerIds.map(id => allCustomers.find(c => c.id === id)).filter(Boolean);
    
    // 4. Transfers I'm involved in
    const myTransfers = allTransfers.filter(t => 
      t.assignee === userName || 
      t.created_by === userName ||
      t.employee_name === userName ||
      myCampaignIds.includes(t.campaign_id)
    );
    
    // 5. Compute time-based buckets
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    
    const adsByDay = {
      overdue: [],     // مواعيد فاتت ولم تكتمل
      today: [],       // اليوم
      tomorrow: [],    // غداً
      thisWeek: [],    // هذا الأسبوع
      later: []        // لاحقاً
    };
    
    myAds.forEach(ad => {
      const dateStr = ad.scheduled_date || ad.ad_date;
      if(!dateStr) return;
      const adDate = new Date(dateStr);
      if(isNaN(adDate.getTime())) return;
      adDate.setHours(0,0,0,0);
      
      if(adDate < today && ad.status !== 'completed'){
        adsByDay.overdue.push(ad);
      } else if(adDate.getTime() === today.getTime()){
        adsByDay.today.push(ad);
      } else if(adDate.getTime() === tomorrow.getTime()){
        adsByDay.tomorrow.push(ad);
      } else if(adDate > tomorrow && adDate <= weekEnd){
        adsByDay.thisWeek.push(ad);
      } else if(adDate > weekEnd){
        adsByDay.later.push(ad);
      }
    });
    
    // 6. Journey-based buckets (tasks needing attention)
    const pendingQuotes    = myAds.filter(a => !a.journey?.quote_uploaded && a.status !== 'completed');
    const pendingTransfers = myAds.filter(a => a.journey?.quote_uploaded && !a.journey?.transfer_uploaded);
    const pendingReceipts  = myAds.filter(a => a.journey?.transfer_uploaded && !a.journey?.receipt_uploaded);
    const pendingInvoices  = myAds.filter(a => a.journey?.receipt_uploaded && !a.journey?.invoice_uploaded);
    
    // 7. Financial summary (for finance roles)
    const totalCost      = myAds.reduce((s, a) => s + (parseFloat(a.cost) || 0), 0);
    const totalRevenue   = myAds.reduce((s, a) => s + (parseFloat(a.sell_price || a.revenue) || 0), 0);
    const totalProfit    = totalRevenue - totalCost;
    const completedCount = myAds.filter(a => a.status === 'completed').length;
    const inProgressCount = myAds.filter(a => a.status === 'in_progress').length;
    const scheduledCount = myAds.filter(a => a.status === 'scheduled').length;
    
    return {
      user: userName,
      role: role,
      ads: myAds,
      campaigns: myCampaigns,
      customers: myCustomers,
      transfers: myTransfers,
      adsByDay,
      tasks: {
        quotes: pendingQuotes,
        transfers: pendingTransfers,
        receipts: pendingReceipts,
        invoices: pendingInvoices
      },
      stats: {
        totalAds: myAds.length,
        totalCampaigns: myCampaigns.length,
        totalCustomers: myCustomers.length,
        totalTransfers: myTransfers.length,
        totalCost,
        totalRevenue,
        totalProfit,
        completedCount,
        inProgressCount,
        scheduledCount
      }
    };
  },
  
  // Get ALL ads in a date range (for calendar view)
  adsInDateRange: function(startDate, endDate, userName){
    const allAds = data.get('daily_ads', []);
    return allAds.filter(a => {
      const dateStr = a.scheduled_date || a.ad_date;
      if(!dateStr) return false;
      
      // If userName provided, filter by user
      if(userName && a.employee_name !== userName) return false;
      
      const adDate = new Date(dateStr);
      if(isNaN(adDate.getTime())) return false;
      
      return adDate >= startDate && adDate <= endDate;
    });
  },
  
  // Get ads grouped by date (for calendar)
  calendarData: function(year, month, userName){
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const ads = this.adsInDateRange(start, end, userName);
    
    // Group by day
    const byDay = {};
    ads.forEach(ad => {
      const dateStr = ad.scheduled_date || ad.ad_date;
      const day = new Date(dateStr).getDate();
      if(!byDay[day]) byDay[day] = [];
      byDay[day].push(ad);
    });
    
    return byDay;
  },
  
  // Get unique team members from ads (for filtering)
  teamMembers: function(){
    const allAds = data.get('daily_ads', []);
    const names = new Set();
    allAds.forEach(a => {
      if(a.employee_name) names.add(a.employee_name);
    });
    return [...names].sort();
  }
};





// ════════════════════════════════════════════════════════════════
// TASKS MODULE — Task assignment system (manager → employee)
// ════════════════════════════════════════════════════════════════
const tasks = {
  
  // List all tasks with optional filters
  list: function(filters){
    let items = data.get('tasks', []);
    if(filters){
      if(filters.assigned_to)  items = items.filter(t => t.assigned_to === filters.assigned_to);
      if(filters.assigned_by)  items = items.filter(t => t.assigned_by === filters.assigned_by);
      if(filters.status)       items = items.filter(t => t.status === filters.status);
      if(filters.priority)     items = items.filter(t => t.priority === filters.priority);
      if(filters.related_to)   items = items.filter(t => t.related_to === filters.related_to);
      if(filters.related_type) items = items.filter(t => t.related_type === filters.related_type);
    }
    return items;
  },
  
  get: function(id){
    return data.get('tasks', []).find(t => t.id === id) || null;
  },
  
  // Create a new task (assigned to an employee)
  create: function(payload){
    const session = (window.SC?.auth?.getSession?.()) || {};
    const items = data.get('tasks', []);
    
    const newTask = {
      id: 'TSK-' + uuid(),
      title: payload.title || 'مهمة بدون عنوان',
      description: payload.description || '',
      
      // Assignment
      assigned_by: payload.assigned_by || session.name || '',
      assigned_by_id: payload.assigned_by_id || session.username || '',
      assigned_to: payload.assigned_to || '',
      assigned_to_email: payload.assigned_to_email || '',
      
      // Linking to other entities
      related_type: payload.related_type || null,   // 'campaign' | 'ad' | 'customer' | 'influencer' | 'transfer' | null
      related_to: payload.related_to || null,        // ID of related entity
      related_name: payload.related_name || '',      // Display name
      
      // Priority & date
      priority: payload.priority || 'medium',        // low | medium | high | urgent
      due_date: payload.due_date || null,            // YYYY-MM-DD
      
      // State
      status: payload.status || 'pending',           // pending | in_progress | done | cancelled
      progress: 0,                                    // 0-100
      
      // Auto-task (workflow-generated) metadata
      auto: payload.auto || false,
      auto_key: payload.auto_key || null,
      workflow_step: payload.workflow_step || null,
      influencer_id: payload.influencer_id || null,
      campaign_id: payload.campaign_id || (payload.related_type==='campaign' ? payload.related_to : null),
      
      // Activity
      comments: [],                                   // [{ author, text, timestamp }]
      attachments: [],                                // [{ name, type, data, uploaded_by, timestamp }]
      activity_log: [{
        action: 'created',
        actor: session.name || 'system',
        timestamp: new Date().toISOString(),
        message: 'تم إنشاء المهمة'
      }],
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null
    };
    
    items.push(newTask);
    data.set('tasks', items);
    
    // Notify
    logActivity('create', 'tasks', newTask.id, `تم إسناد مهمة "${newTask.title}" إلى ${newTask.assigned_to}`);
    
    // Cross-tab sync
    if(window.SC?.sync?.notifyChange){
      window.SC.sync.notifyChange('tasks', 'create', newTask.id, newTask);
    }
    
    // Auto-schedule reminders if due_date
    if(newTask.due_date && window.SC?.system?.autoScheduleTask){
      try { window.SC.system.autoScheduleTask(newTask); } catch(e){}
    }
    
    // Send in-app notification to assignee
    if(window.SC?.system?.addNotificationForUser){
      try {
        window.SC.system.addNotificationForUser(newTask.assigned_to, {
          type: 'info',
          title: 'مهمة جديدة',
          message: `${newTask.assigned_by} أسند إليك: ${newTask.title}`,
          link: 'tasks.html?id=' + newTask.id,
          task_id: newTask.id
        });
      } catch(e){}
    }
    
    return newTask;
  },
  
  // Update task (partial)
  update: function(id, patch){
    const session = (window.SC?.auth?.getSession?.()) || {};
    const items = data.get('tasks', []);
    const idx = items.findIndex(t => t.id === id);
    if(idx === -1) return null;
    
    const old = items[idx];
    const updated = Object.assign({}, old, patch, { updated_at: new Date().toISOString() });
    
    // Track status change in activity log
    if(patch.status && patch.status !== old.status){
      updated.activity_log = (old.activity_log || []).concat({
        action: 'status_changed',
        actor: session.name || 'system',
        timestamp: new Date().toISOString(),
        message: `الحالة: ${getStatusLabel(old.status)} → ${getStatusLabel(patch.status)}`,
        from: old.status,
        to: patch.status
      });
      
      // Mark completion time
      if(patch.status === 'done' && !updated.completed_at){
        updated.completed_at = new Date().toISOString();
        updated.progress = 100;
      }
    }
    
    items[idx] = updated;
    data.set('tasks', items);
    logActivity('update', 'tasks', id, `تم تحديث المهمة`);
    
    if(window.SC?.sync?.notifyChange){
      window.SC.sync.notifyChange('tasks', 'update', id, updated);
    }
    
    return updated;
  },
  
  // Add a comment
  addComment: function(taskId, text){
    const session = (window.SC?.auth?.getSession?.()) || {};
    const items = data.get('tasks', []);
    const idx = items.findIndex(t => t.id === taskId);
    if(idx === -1) return null;
    
    const comment = {
      id: 'CMT-' + uuid(),
      author: session.name || 'مجهول',
      author_id: session.username || '',
      text: text,
      timestamp: new Date().toISOString()
    };
    
    items[idx].comments = (items[idx].comments || []).concat(comment);
    items[idx].activity_log = (items[idx].activity_log || []).concat({
      action: 'commented',
      actor: session.name || 'system',
      timestamp: new Date().toISOString(),
      message: `تعليق جديد`
    });
    items[idx].updated_at = new Date().toISOString();
    data.set('tasks', items);
    
    if(window.SC?.sync?.notifyChange){
      window.SC.sync.notifyChange('tasks', 'update', taskId, items[idx]);
    }
    
    return comment;
  },
  
  // Delete a task
  remove: function(id){
    const items = data.get('tasks', []);
    const idx = items.findIndex(t => t.id === id);
    if(idx === -1) return false;
    const removed = items.splice(idx, 1)[0];
    data.set('tasks', items);
    logActivity('delete', 'tasks', id, `تم حذف مهمة "${removed.title}"`);
    
    if(window.SC?.sync?.notifyChange){
      window.SC.sync.notifyChange('tasks', 'delete', id, removed);
    }
    
    // Cancel reminders
    if(window.SC?.system?.cancelReminders){
      try { window.SC.system.cancelReminders(id); } catch(e){}
    }
    
    return true;
  },
  
  // Get tasks for current user (received + sent)
  forCurrentUser: function(){
    const session = (window.SC?.auth?.getSession?.()) || {};
    if(!session.name) return { received: [], sent: [], stats: {} };
    
    const allTasks = data.get('tasks', []);
    const received = allTasks.filter(t => t.assigned_to === session.name);
    const sent     = allTasks.filter(t => t.assigned_by === session.name && t.assigned_to !== session.name);
    
    const today = new Date(); today.setHours(0,0,0,0);
    
    const stats = {
      total: received.length,
      pending: received.filter(t => t.status === 'pending').length,
      inProgress: received.filter(t => t.status === 'in_progress').length,
      done: received.filter(t => t.status === 'done').length,
      overdue: received.filter(t => {
        if(t.status === 'done' || !t.due_date) return false;
        return new Date(t.due_date) < today;
      }).length,
      dueToday: received.filter(t => {
        if(!t.due_date) return false;
        const d = new Date(t.due_date); d.setHours(0,0,0,0);
        return d.getTime() === today.getTime() && t.status !== 'done';
      }).length,
      highPriority: received.filter(t => 
        (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'done'
      ).length,
      sentTotal: sent.length,
      sentActive: sent.filter(t => t.status !== 'done' && t.status !== 'cancelled').length
    };
    
    return { received, sent, stats };
  }
};

function getStatusLabel(status){
  const labels = { pending:'معلّقة', in_progress:'جاري', done:'مكتملة', cancelled:'ملغاة' };
  return labels[status] || status;
}

/* ═══════════════════════════════════════════════════════════════════
   ██╗███╗   ██╗███████╗██╗     ██╗   ██╗███████╗███╗   ██╗ ██████╗███████╗██████╗ 
   ██║████╗  ██║██╔════╝██║     ██║   ██║██╔════╝████╗  ██║██╔════╝██╔════╝██╔══██╗
   ██║██╔██╗ ██║█████╗  ██║     ██║   ██║█████╗  ██╔██╗ ██║██║     █████╗  ██████╔╝
   ██║██║╚██╗██║██╔══╝  ██║     ██║   ██║██╔══╝  ██║╚██╗██║██║     ██╔══╝  ██╔══██╗
   ██║██║ ╚████║██║     ███████╗╚██████╔╝███████╗██║ ╚████║╚██████╗███████╗██║  ██║
   ╚═╝╚═╝  ╚═══╝╚═╝     ╚══════╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝ ╚═════╝╚══════╝╚═╝  ╚═╝
   PORTAL — Self-service portal for managed influencers
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Influencer Authentication (separate from admin & UGC auth)
 * Login with username/phone/email + password
 * Session stored in 'sc_influencer_session' key
 * Each influencer can only access their own data
 */
const influencer_auth = {
  SESSION_KEY: 'sc_influencer_session',
  
  /** Hash password using local SHA-256 + salt (consistent regardless of SC.security availability)
   *  Format: "sha256:<hex>" — distinguishes from pbkdf2$... used elsewhere */
  async hashPassword(plain) {
    const enc = new TextEncoder().encode(plain + 'inf_salt_v1');
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return 'sha256:' + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  },
  
  /** Verify password against stored hash
   *  Supports both sha256:... (our format) and pbkdf2$... (SC.security format, for future migration) */
  async verifyPassword(plain, hash) {
    if(!hash || !plain) return false;
    // pbkdf2$ format → delegate to SC.security
    if(hash.startsWith('pbkdf2$') && window.SC?.security?.verifyPassword) {
      try { return await window.SC.security.verifyPassword(plain, hash); } catch(e) { return false; }
    }
    // sha256: format → use local comparison
    const computed = await this.hashPassword(plain);
    return computed === hash;
  },
  
  /** Login by username / phone / email + password */
  async login(identifier, password) {
    if(!identifier || !password) throw new Error('البيانات غير مكتملة');
    const id = String(identifier).trim();
    const idDigits = id.replace(/[^\d]/g, '');
    
    const all = influencers.list();
    const inf = all.find(i => {
      if(!i.portal_enabled) return false;
      if(i.username && i.username.toLowerCase() === id.toLowerCase()) return true;
      if(i.email && i.email.toLowerCase() === id.toLowerCase()) return true;
      if(idDigits.length >= 9 && i.phone && i.phone.replace(/[^\d]/g, '').endsWith(idDigits.slice(-9))) return true;
      return false;
    });
    
    if(!inf) throw new Error('لا يوجد حساب مفعّل بهذه البيانات');
    if(inf.status === 'inactive') throw new Error('الحساب موقوف. تواصل مع الإدارة');
    if(!inf.portal_enabled) throw new Error('البوابة غير مفعّلة لهذا الحساب');
    if(!inf.password_hash) throw new Error('لم يتم تعيين كلمة مرور بعد. تواصل مع الإدارة');
    
    const valid = await this.verifyPassword(password, inf.password_hash);
    if(!valid) throw new Error('كلمة المرور غير صحيحة');
    
    influencers.update(inf.id, { last_login_at: new Date().toISOString() });
    
    const session = {
      influencer_id: inf.id,
      name: inf.name,
      logged_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    logActivity('login', 'influencer_portal', inf.id, `دخل المؤثر ${inf.name} للبوابة`);
    return { session, influencer: inf };
  },
  
  getSession() {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      if(!raw) return null;
      const s = JSON.parse(raw);
      if(s.expires_at && new Date(s.expires_at) < new Date()) { this.logout(); return null; }
      return s;
    } catch(e) { return null; }
  },
  
  getCurrentInfluencer() {
    const session = this.getSession();
    if(!session) return null;
    const inf = influencers.get(session.influencer_id);
    if(!inf || !inf.portal_enabled || inf.status === 'inactive') {
      this.logout();
      return null;
    }
    return inf;
  },
  
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  },
  
  /** Admin: enable portal for an influencer with username + temp password */
  async enablePortal(influencerId, username, tempPassword) {
    const inf = influencers.get(influencerId);
    if(!inf) throw new Error('المؤثر غير موجود');
    if(!username || username.length < 3) throw new Error('اسم المستخدم 3 أحرف على الأقل');
    if(!tempPassword || tempPassword.length < 6) throw new Error('كلمة المرور 6 أحرف على الأقل');
    
    // Check username uniqueness
    const conflict = influencers.list().find(i => i.id !== influencerId && i.username && i.username.toLowerCase() === username.toLowerCase());
    if(conflict) throw new Error('اسم المستخدم مستخدم بالفعل');
    
    const passHash = await this.hashPassword(tempPassword);
    influencers.update(influencerId, {
      username: username,
      password_hash: passHash,
      portal_enabled: true,
      portal_enabled_at: new Date().toISOString()
    });
    
    logActivity('portal_enable', 'influencers', influencerId, `تم تفعيل بوابة المؤثر ${inf.name}`);
    return { success: true };
  },
  
  /** Admin: disable portal */
  disablePortal(influencerId) {
    const inf = influencers.get(influencerId);
    if(!inf) throw new Error('المؤثر غير موجود');
    influencers.update(influencerId, { portal_enabled: false });
    logActivity('portal_disable', 'influencers', influencerId, `تم تعطيل بوابة المؤثر ${inf.name}`);
    return { success: true };
  },
  
  /** Admin: reset password */
  async resetPassword(influencerId, newPassword) {
    if(!newPassword || newPassword.length < 6) throw new Error('كلمة المرور 6 أحرف على الأقل');
    const passHash = await this.hashPassword(newPassword);
    influencers.update(influencerId, { password_hash: passHash });
    const inf = influencers.get(influencerId);
    logActivity('portal_reset_password', 'influencers', influencerId, `إعادة تعيين كلمة مرور ${inf?.name || ''}`);
    return { success: true };
  },
  
  /** Self-service: update own profile (security: only allowed fields) */
  updateProfile(updates) {
    const current = this.getCurrentInfluencer();
    if(!current) throw new Error('غير مصرّح');
    
    // Whitelist allowed fields ONLY
    const allowed = ['phone', 'email', 'city', 'tiktok_handle', 'instagram_handle', 'snap_handle', 'iban', 'bank_name'];
    const safePatch = {};
    let bankChanged = false;
    
    for(const key of allowed) {
      if(updates[key] !== undefined) {
        safePatch[key] = updates[key];
        if(key === 'iban' || key === 'bank_name') bankChanged = true;
      }
    }
    
    // Bank info change requires re-verification
    if(bankChanged) {
      safePatch.bank_verified = false;
      logActivity('update', 'influencer_portal', current.id, `المؤثر ${current.name} عدّل بياناته البنكية — يحتاج تحقّق`);
      // Create notification for staff
      influencer_notifications.create({
        influencer_id: current.id,
        type: 'bank_change',
        for_staff: true,
        title: 'تغيير بيانات بنكية',
        message: `قام ${current.name} بتعديل IBAN/البنك. يحتاج مراجعة`,
        read: false
      });
    }
    
    // Compute profile_completed
    const merged = Object.assign({}, current, safePatch);
    const required = ['name','phone','email','city','iban','bank_name','tiktok_handle'];
    const completed = required.every(f => merged[f] && String(merged[f]).trim().length > 0);
    safePatch.profile_completed = completed;
    
    return influencers.update(current.id, safePatch);
  }
};

/**
 * Influencer Portal Data Access
 * All methods rely on currentInfluencer.id — never accept arbitrary IDs from UI
 * This prevents an influencer from viewing another influencer's data
 */
const influencer_portal = {
  /** SANITIZATION: Strip sensitive fields (sell price, profit, margins) from a campaign
   *  before exposing to influencer. Also respects per-influencer visibility settings. */
  _sanitizeCampaign(c, inf) {
    if(!c) return c;
    // Compute cost shown to influencer (the amount they earn from this campaign)
    const costAmount = Number(c.cost) || Number(c.agreed_amount) || Number(c.influencer_cost) || 0;
    
    const safe = {
      id: c.id,
      campaign_name: inf.portal_show_campaign_names === false ? '(حملة)' : (c.campaign_name || c.name || ''),
      // Customer info — only if explicitly allowed
      customer_name: inf.portal_show_customer_names === true ? (c.customer_name || '') : '',
      customer_id: inf.portal_show_customer_names === true ? c.customer_id : null,
      // Cost only — NEVER expose budget, sell_price, profit
      cost: costAmount,
      ads_count: c.ads_count || c.ads || 1,
      influencer_id: c.influencer_id,
      influencer_name: c.influencer_name,
      social_networks: c.social_networks || c.platforms || '',
      audience: c.audience || '',
      type: c.type || c.ad_type || '',
      status: c.status,
      month: c.month || '',
      created_at: c.created_at,
      start_date: c.start_date,
      end_date: c.end_date,
      // Notes — only if allowed
      notes: inf.portal_show_notes === false ? '' : (c.notes_for_influencer || c.influencer_notes || ''),
      attachments: c.attachments_for_influencer || []
    };
    return safe;
  },
  
  /** SANITIZATION: Strip sensitive fields from a transfer */
  _sanitizeTransfer(t, inf) {
    if(!t) return t;
    return {
      id: t.id,
      direction: t.direction,
      campaign_id: t.campaign_id,
      campaign_name: inf.portal_show_campaign_names === false ? '(حملة)' : (t.campaign_name || ''),
      // Influencer sees only what they get paid (amount_total = net to recipient)
      amount_total: t.amount_total || 0,
      // Bank info (their own, not the system's)
      recipient_name: t.recipient_name,
      recipient_iban: t.recipient_iban,
      recipient_bank: t.recipient_bank,
      // Workflow + status (safe)
      workflow_stage: t.workflow_stage,
      status: t.status,
      // Attachments (safe — these are for them to see/use)
      bank_receipt_url: t.bank_receipt_url,
      invoice_url: t.invoice_url,
      invoice_filename: t.invoice_filename,
      invoice_uploaded_by: t.invoice_uploaded_by,
      // Timestamps
      created_at: t.created_at,
      receipt_uploaded_at: t.receipt_uploaded_at,
      invoice_uploaded_at: t.invoice_uploaded_at,
      completed_at: t.completed_at,
      // Notes ONLY if allowed
      notes: inf.portal_show_notes === false ? '' : (t.notes_for_influencer || '')
      // EXPLICITLY EXCLUDED: customer_id, customer_name, vat, amount_base, sell_price, with_vat,
      // assignee, leader_name, profit, margin — none of these expose to influencer
    };
  },
  
  /** Get current influencer's campaigns (SANITIZED — no profit/sell price) */
  getMyCampaigns(filter) {
    const inf = influencer_auth.getCurrentInfluencer();
    if(!inf) return [];
    let myCamps = campaigns.list().filter(c => 
      c.influencer_id === inf.id || c.influencer_name === inf.name
    );
    if(filter === 'active')    myCamps = myCamps.filter(c => c.status === 'executing' || c.status === 'in_progress' || c.status === 'approved');
    if(filter === 'completed') myCamps = myCamps.filter(c => c.status === 'completed');
    if(filter === 'scheduled') myCamps = myCamps.filter(c => c.status === 'draft' || c.status === 'scheduled' || c.status === 'pending');
    return myCamps
      .sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0))
      .map(c => this._sanitizeCampaign(c, inf));
  },
  
  /** Get current influencer's transfers (SANITIZED) */
  getMyTransfers(filter) {
    const inf = influencer_auth.getCurrentInfluencer();
    if(!inf) return [];
    let mine = transfers.list().filter(t => 
      t.direction === 'outgoing' && 
      (t.influencer_id === inf.id || 
       (t.recipient_iban && inf.iban && t.recipient_iban === inf.iban) ||
       t.recipient_name === inf.name)
    );
    if(filter === 'pending_invoice') mine = mine.filter(t => t.workflow_stage === 2);
    if(filter === 'completed')       mine = mine.filter(t => t.workflow_stage === 'complete' || t.status === 'completed');
    if(filter === 'in_progress')     mine = mine.filter(t => t.workflow_stage === 1 || t.workflow_stage === 2 || t.workflow_stage === 3);
    return mine
      .sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0))
      .map(t => this._sanitizeTransfer(t, inf));
  },
  
  /** Get ad tasks (specific ads the influencer needs to publish) */
  getMyAdTasks(filter) {
    const inf = influencer_auth.getCurrentInfluencer();
    if(!inf) return [];
    let tasks = ad_tasks.list().filter(t => t.influencer_id === inf.id);
    if(filter === 'pending')    tasks = tasks.filter(t => t.status === 'pending' || t.status === 'assigned');
    if(filter === 'published')  tasks = tasks.filter(t => t.status === 'published' || t.status === 'completed');
    if(filter === 'overdue') {
      const now = new Date();
      tasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'published' && t.due_date && new Date(t.due_date) < now);
    }
    return tasks.sort((a,b) => new Date(a.due_date||0) - new Date(b.due_date||0));
  },
  
  /** Get individual ads breakdown (daily_ads) for the current influencer
   *  Shows per-ad cost (NEVER sell price) */
  getMyAdsBreakdown(filter) {
    const inf = influencer_auth.getCurrentInfluencer();
    if(!inf) return [];
    let ads = daily_ads.list().filter(a => a.influencer_id === inf.id);
    if(filter === 'completed') ads = ads.filter(a => a.status === 'completed' || a.status === 'published');
    if(filter === 'scheduled') ads = ads.filter(a => a.status === 'scheduled' || a.status === 'pending');
    return ads
      .sort((a,b) => new Date(b.created_at||b.ad_date||0) - new Date(a.created_at||a.ad_date||0))
      .map(a => ({
        id: a.id,
        campaign_id: a.campaign_id,
        campaign_name: inf.portal_show_campaign_names === false ? '(حملة)' : (a.campaign_name || ''),
        customer_name: inf.portal_show_customer_names === true ? (a.customer_name || '') : '',
        platform: a.platform || a.social_network || '',
        ad_type: a.ad_type || a.type || '',
        ad_date: a.ad_date || a.scheduled_date,
        // ONLY cost — never sell price
        cost: Number(a.cost) || Number(a.home_cost) || Number(a.cov_cost) || 0,
        status: a.status,
        publish_url: a.publish_url || a.link || '',
        notes: inf.portal_show_notes === false ? '' : (a.notes_for_influencer || '')
      }));
  },
  
  /** Influencer uploads an invoice for a transfer in Stage 2 */
  async uploadInvoice(transferId, fileData) {
    const inf = influencer_auth.getCurrentInfluencer();
    if(!inf) throw new Error('غير مصرّح');
    
    const t = transfers.get(transferId);
    if(!t) throw new Error('التحويل غير موجود');
    
    // SECURITY: verify ownership
    const isOwned = t.influencer_id === inf.id || t.recipient_iban === inf.iban || t.recipient_name === inf.name;
    if(!isOwned) throw new Error('غير مصرّح بالوصول لهذا التحويل');
    
    // Must be in Stage 2 to accept invoice
    if(t.workflow_stage !== 2) throw new Error('لا يمكن رفع الفاتورة إلا للتحويلات في مرحلة "بانتظار الفاتورة"');
    
    // File security validation if available
    if(window.SC?.fileSecurity?.validateFile && fileData?.file) {
      const validation = await window.SC.fileSecurity.validateFile(fileData.file, ['pdf','jpg','jpeg','png']);
      if(!validation.valid) throw new Error(validation.error || 'ملف غير صالح');
    }
    
    // Update transfer — move from Stage 2 → Stage 3
    transfers.update(transferId, {
      workflow_stage: 3,
      invoice_url: fileData.url || fileData.dataUrl || '',
      invoice_filename: fileData.filename || 'invoice.pdf',
      invoice_uploaded_at: new Date().toISOString(),
      invoice_uploaded_by: 'influencer_portal',
      invoice_uploaded_by_id: inf.id
    });
    
    logActivity('upload_invoice', 'transfers', transferId, 
      `رفع المؤثر ${inf.name} فاتورة التحويل عبر البوابة`);
    if(t.campaign_id){ try { logTimeline(t.campaign_id, 'transfer_invoice_uploaded', inf.name, { transfer_id: transferId, influencer_id: inf.id }); } catch(e){} }
    
    // Notify staff
    influencer_notifications.create({
      influencer_id: inf.id,
      type: 'invoice_uploaded',
      for_staff: true,
      title: 'فاتورة جديدة من مؤثر',
      message: `قام ${inf.name} برفع فاتورة للتحويل ${transferId}`,
      read: false,
      transfer_id: transferId
    });
    
    return transfers.get(transferId);
  },
  
  /** Influencer uploads proof of publication for an ad task */
  async uploadProof(taskId, proofData) {
    const inf = influencer_auth.getCurrentInfluencer();
    if(!inf) throw new Error('غير مصرّح');
    
    const task = ad_tasks.get(taskId);
    if(!task) throw new Error('المهمة غير موجودة');
    if(task.influencer_id !== inf.id) throw new Error('غير مصرّح');
    
    if(window.SC?.fileSecurity?.validateFile && proofData?.file) {
      const validation = await window.SC.fileSecurity.validateFile(proofData.file, ['jpg','jpeg','png','pdf']);
      if(!validation.valid) throw new Error(validation.error || 'ملف غير صالح');
    }
    
    ad_tasks.update(taskId, {
      proof_url: proofData.proof_url || proofData.url || '',
      publish_url: proofData.publish_url || task.publish_url,
      status: 'published',
      completed_at: new Date().toISOString()
    });
    
    logActivity('upload_proof', 'ad_tasks', taskId, 
      `رفع المؤثر ${inf.name} إثبات النشر`);
    
    return ad_tasks.get(taskId);
  },
  
  /** Get notifications for current influencer */
  getNotifications() {
    const inf = influencer_auth.getCurrentInfluencer();
    if(!inf) return [];
    const dynamic = [];
    
    // Auto-generated alerts
    const myTransfers = this.getMyTransfers();
    const needsInvoice = myTransfers.filter(t => t.workflow_stage === 2);
    if(needsInvoice.length > 0) {
      dynamic.push({
        id: 'auto_invoice',
        type: 'warning',
        title: 'فواتير مطلوبة',
        message: `لديك ${needsInvoice.length} تحويل بانتظار رفع الفاتورة`,
        action: 'transfers'
      });
    }
    
    if(!inf.iban || !inf.bank_name) {
      dynamic.push({
        id: 'auto_bank',
        type: 'danger',
        title: 'بيانات بنكية ناقصة',
        message: 'أكمل بياناتك البنكية لاستلام مدفوعاتك',
        action: 'profile'
      });
    }
    
    // Active campaigns
    const activeCamps = this.getMyCampaigns('active');
    if(activeCamps.length > 0) {
      dynamic.push({
        id: 'auto_active',
        type: 'info',
        title: 'حملات قيد التنفيذ',
        message: `لديك ${activeCamps.length} حملة نشطة`,
        action: 'campaigns'
      });
    }
    
    // Upcoming tasks
    const upcomingTasks = this.getMyAdTasks('pending');
    const soon = upcomingTasks.filter(t => {
      if(!t.due_date) return false;
      const diff = new Date(t.due_date) - new Date();
      return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
    });
    if(soon.length > 0) {
      dynamic.push({
        id: 'auto_due',
        type: 'warning',
        title: 'مواعيد نشر قريبة',
        message: `${soon.length} إعلان موعد نشره خلال 3 أيام`,
        action: 'tasks'
      });
    }
    
    // Stored notifications targeted at this influencer (not for staff)
    const stored = influencer_notifications.list()
      .filter(n => n.influencer_id === inf.id && !n.for_staff)
      .slice(0, 20);
    
    return [...dynamic, ...stored];
  },
  
  /** Get summary stats for portal home */
  getStats() {
    const inf = influencer_auth.getCurrentInfluencer();
    if(!inf) return null;
    
    const myCamps = this.getMyCampaigns();
    const myTransfers = this.getMyTransfers();
    const myTasks = this.getMyAdTasks();
    
    const completed = myTransfers.filter(t => t.workflow_stage === 'complete' || t.status === 'completed');
    const pendingInvoice = myTransfers.filter(t => t.workflow_stage === 2);
    const inFlight = myTransfers.filter(t => t.workflow_stage === 1 || t.workflow_stage === 3);
    
    return {
      activeCampaigns: myCamps.filter(c => c.status === 'executing' || c.status === 'approved').length,
      completedCampaigns: myCamps.filter(c => c.status === 'completed').length,
      
      // Total cost across all campaigns (what influencer is supposed to earn)
      // Uses the sanitized `cost` field — never `budget` or `sell_price`
      totalCost:      myCamps.reduce((s,c) => s + (Number(c.cost) || 0), 0),
      
      totalEarned:    completed.reduce((s,t) => s + (t.amount_total || 0), 0),
      pendingAmount:  pendingInvoice.reduce((s,t) => s + (t.amount_total || 0), 0),
      inFlightAmount: inFlight.reduce((s,t) => s + (t.amount_total || 0), 0),
      
      transfersCount: myTransfers.length,
      pendingTasks:   myTasks.filter(t => t.status === 'pending' || t.status === 'assigned').length,
      
      bankVerified:      !!inf.bank_verified,
      profileCompleted:  !!inf.profile_completed,
      hasIban:           !!(inf.iban && inf.bank_name)
    };
  }
};

/* ═══════════════════════════════════════════════════════════════════
   CAMPAIGN OPERATIONAL WORKFLOW — End-to-end pipeline
   • campaign_nominations  (influencer nomination per campaign)
   • calendar_events       (unified calendar: bookings, meetings, personal)
   • campaign_tasks        (task tracking inside each campaign)
   • campaign_timeline     (immutable activity log)
   • approval_tokens       (public client + influencer secure links)
   ═══════════════════════════════════════════════════════════════════ */

const campaign_nominations  = makeEntity('campaign_nominations',  'NOM');
const calendar_events       = makeEntity('calendar_events',       'EVT');
const campaign_tasks        = makeEntity('campaign_tasks',        'CTSK');
const campaign_timeline     = makeEntity('campaign_timeline',     'TL');
const approval_tokens       = makeEntity('approval_tokens',       'TKN');
const campaign_documents    = makeEntity('campaign_documents',    'DOC');

/* ─── CAMPAIGN STATUS MACHINE ─────────────────────────────────────── */
const CAMPAIGN_STATES = [
  'draft',
  'nomination_in_progress',
  'pending_internal_approval',
  'internal_approved',
  'internal_rejected',
  'pending_client_approval',
  'client_approved',
  'client_partially_approved',
  'client_rejected',
  'quotation_issued',
  'client_payment_received',
  'booking_in_progress',
  'transfer_in_progress',
  'ads_in_progress',
  'completed',
  'cancelled'
];

const CAMPAIGN_STATE_LABELS = {
  draft: 'مسودة',
  nomination_in_progress: 'الترشيح قيد التنفيذ',
  pending_internal_approval: 'بانتظار اعتماد داخلي',
  internal_approved: 'معتمد داخلياً',
  internal_rejected: 'مرفوض داخلياً',
  pending_client_approval: 'بانتظار اعتماد العميل',
  client_approved: 'معتمد من العميل',
  client_partially_approved: 'اعتماد جزئي من العميل',
  client_rejected: 'مرفوض من العميل',
  quotation_issued: 'تم إصدار عرض السعر',
  client_payment_received: 'تم تحصيل العميل',
  booking_in_progress: 'حجز المؤثرين جاري',
  transfer_in_progress: 'تحويلات المالية جارية',
  ads_in_progress: 'الإعلانات جارية',
  completed: 'مكتملة',
  cancelled: 'ملغاة'
};

/* ─── TIMELINE: immutable log ─────────────────────────────────────── */
function logTimeline(campaignId, action, actor, payload){
  campaign_timeline.create({
    campaign_id: campaignId,
    action: action,           // e.g. 'campaign_created', 'influencer_nominated', 'client_approved'
    actor: actor || (window.SC?.auth?.getSession?.()?.name) || 'النظام',
    actor_id: window.SC?.auth?.getSession?.()?.id || null,
    payload: payload || {},
    timestamp: new Date().toISOString()
  });
}

/* ─── CAMPAIGN WORKFLOW ENGINE ────────────────────────────────────── */
const campaign_workflow = {
  STATES: CAMPAIGN_STATES,
  LABELS: CAMPAIGN_STATE_LABELS,
  
  /** Get all workflow steps for a campaign with status flags */
  getSteps(campaignId){
    const c = campaigns.get(campaignId);
    if(!c) return [];
    const noms = campaign_nominations.list().filter(n => n.campaign_id === campaignId);
    const myTransfers = transfers.list().filter(t => t.campaign_id === campaignId);
    const myEvents = calendar_events.list().filter(e => e.campaign_id === campaignId);
    
    // internal approval is PERSISTENT (status later becomes booking_confirmed, etc.)
    const internalApproved = noms.filter(n => n.internal_approved_at || n.status === 'internal_approved').length;
    const clientApproved   = noms.filter(n => n.client_decision === 'approved').length;
    const booked           = noms.filter(n => n.influencer_decision === 'approved' || n.status === 'booking_manually_confirmed').length;
    const transferred      = myTransfers.filter(t => t.workflow_stage === 'complete' || t.status === 'completed').length;
    const adsCompleted     = noms.filter(n => n.ad_completed).length;
    
    // Stage 6/7 — quotation + client commitment (paid OR deferred). Contract is OPTIONAL:
    // some clients commit/transfer without signing, so its absence must not block the chain.
    // Derive from the actual document store so any upload path is recognised.
    const myDocs = campaign_documents.list().filter(d => d.campaign_id === campaignId);
    const hasDoc = t => myDocs.some(d => d.type === t);
    const hasQuotation = hasDoc('quotation') || !!(c.quotation_doc_id || c.quotation_url || c.quotation_amount) || !!c.quotation_skipped;
    const hasContract  = hasDoc('contract')  || !!(c.contract_doc_id || c.contract_url);
    const paymentDone  = c.client_payment_status === 'paid'
                      || c.client_payment_status === 'postponed'
                      || c.client_payment_status === 'postponed_approved'
                      || hasDoc('receipt');
    
    const steps = [
      { key:'created',          label:'إنشاء الحملة',           done: true,                              icon:'1' },
      { key:'nomination',       label:'الترشيح',                done: noms.length > 0,                   count: noms.length, icon:'2' },
      { key:'internal_review',  label:'اعتماد داخلي',           done: internalApproved > 0,              count: internalApproved, icon:'3' },
      { key:'client_link',      label:'إرسال للعميل',           done: !!c.client_approval_token,         icon:'4' },
      { key:'client_decision',  label:'قرار العميل',            done: clientApproved > 0,                count: clientApproved, icon:'5' },
      { key:'quotation',        label:'عرض السعر والعقد',       done: hasQuotation,                      icon:'6' },
      { key:'client_payment',   label:'تحصيل من العميل',        done: paymentDone,                       icon:'7' },
      { key:'booking',          label:'حجز المؤثرين',           done: clientApproved > 0 && booked === clientApproved, count: booked, total: clientApproved, icon:'8' },
      { key:'schedule',         label:'الجدولة في التقويم',     done: myEvents.length >= clientApproved && clientApproved > 0, icon:'9' },
      { key:'transfers',        label:'الحوالات المالية',       done: clientApproved > 0 && transferred === clientApproved, count: transferred, total: clientApproved, icon:'10' },
      { key:'ads_published',    label:'متابعة ونشر الإعلانات',  done: clientApproved > 0 && adsCompleted === clientApproved, count: adsCompleted, total: clientApproved, icon:'11' },
      { key:'content_saved',    label:'حفظ المحتوى',            done: noms.some(n => n.content_saved),   icon:'12' },
      { key:'closed',           label:'إقفال الحملة',           done: c.status === 'completed',          icon:'13' }
    ];
    
    return steps;
  },
  
  /** Is stage 6+7 satisfied so the campaign may proceed to booking? */
  canProceedToBooking(campaignId){
    const c = campaigns.get(campaignId);
    if(!c) return { ok:false, missing:['الحملة غير موجودة'] };
    // Check the actual document store (not just campaign fields) so any upload path counts
    const docs = campaign_documents.list().filter(d => d.campaign_id === campaignId);
    const hasDoc = t => docs.some(d => d.type === t);
    const hasQuotation = hasDoc('quotation') || !!(c.quotation_doc_id || c.quotation_url || c.quotation_amount) || !!c.quotation_skipped;
    const hasContract  = hasDoc('contract')  || !!(c.contract_doc_id || c.contract_url);
    const hasReceipt   = hasDoc('receipt');
    const pay = c.client_payment_status;
    // Contract is OPTIONAL — client commitment (paid, آجل, OR a recorded receipt) is sufficient
    const paymentDone = pay === 'paid' || pay === 'postponed' || pay === 'postponed_approved' || hasReceipt;
    const missing = [];
    if(!hasQuotation) missing.push('إصدار عرض السعر');
    if(!paymentDone) missing.push('تحصيل العميل أو تعليمه «آجل» (التزام العميل)');
    return { ok: missing.length === 0, missing, hasQuotation, hasContract, paymentDone, deferred: pay === 'postponed' };
  },
  
  /** Operations guidance — tells the user EXACTLY where they are, what's next,
      who is responsible, where to do it, and why a step is blocked. */
  getGuidance(campaignId){
    const c = campaigns.get(campaignId);
    if(!c) return null;
    const steps = this.getSteps(campaignId);
    const noms = campaign_nominations.list().filter(n => n.campaign_id === campaignId);
    const clientApprovedN = noms.filter(n => n.client_decision === 'approved').length;
    const clientPendingN  = noms.filter(n => n.client_decision === 'pending').length;
    const gate = this.canProceedToBooking(campaignId);
    const val = this.validateCompletion(campaignId);

    // step → {who, where, hint to act}
    const MAP = {
      created:        { who:'منشئ الحملة',          where:'تم إنشاؤها' },
      nomination:     { who:'منسّق المؤثرين',       where:'محرّك الترشيح داخل الحملة (زر «ابدأ ترشيح المؤثرين»)', action:'open_nomination', actionLabel:'ابدأ الترشيح' },
      internal_review:{ who:'مدير العمليات',         where:'صفحة الاعتماد الداخلي', action:'open_internal_review', actionLabel:'مراجعة الاعتمادات' },
      client_link:    { who:'منسّق الحملة',          where:'زر «إرسال للعميل» — يُنشئ رابطاً آمناً', action:'send_client_link', actionLabel:'إرسال للعميل' },
      client_decision:{ who:'العميل (خارج النظام)',  where:'رابط اعتماد العميل المُرسل له — بانتظار قراره' },
      quotation:      { who:'منسّق الحملة / المالية', where:'قسم «عرض السعر والعقود والإيصالات»', action:'open_quotation', actionLabel:'إدارة المستندات' },
      client_payment: { who:'المالية',               where:'قسم التحصيل داخل المستندات', action:'open_quotation', actionLabel:'تسجيل التحصيل' },
      booking:        { who:'منسّق المؤثرين',        where:'«إدارة حجوزات المؤثرين» — يُرسل رابطاً لكل مشهور', action:'open_booking', actionLabel:'إدارة الحجوزات' },
      schedule:       { who:'تلقائي',                where:'يُجدول في التقويم تلقائياً عند تأكيد المشهور' },
      transfers:      { who:'المالية',               where:'«إنشاء طلبات التحويل» ثم متابعتها في صفحة المالية', action:'open_transfers', actionLabel:'إنشاء الحوالات' },
      ads_published:  { who:'منسّق المؤثرين',        where:'«تسجيل إثبات الإعلانات» لكل مشهور', action:'open_ads', actionLabel:'تسجيل الإثبات' },
      content_saved:  { who:'تلقائي / منسّق',        where:'يُحفظ في قسم المحتوى عند رفع الإثبات' },
      closed:         { who:'المدير',                where:'زر «إقفال الحملة» — بعد اكتمال كل المتطلبات', action:'close_campaign', actionLabel:'إقفال الحملة' }
    };

    // current = last done; next = first not-done
    const doneSteps = steps.filter(s => s.done);
    const current = doneSteps[doneSteps.length - 1] || steps[0];
    // حملة مُقفلة/ملغاة = مكتملة في الدليل (الخطوات الاختيارية لا تُعيد فتح الرحلة بعد الإقفال)
    const terminal = c.status === 'completed' || c.status === 'cancelled';
    const next = terminal ? null : (steps.find(s => !s.done) || null);

    // blockage reason for the next step
    let blocked = false, reason = '';
    if(next){
      if(next.key === 'client_decision'){
        blocked = !!c.client_approval_token && clientApprovedN === 0;
        reason = blocked ? (clientPendingN>0 ? `بانتظار قرار العميل (${clientPendingN} مؤثر معلّق)` : 'بانتظار اعتماد العميل للترشيحات المُرسلة') : '';
      } else if(next.key === 'booking' && !gate.ok){
        blocked = true; reason = 'إلزامي قبل الحجز: ' + gate.missing.join(' · ');
      } else if(next.key === 'closed' && !val.canComplete){
        blocked = true; reason = 'لا يمكن الإقفال قبل: ' + val.missing.slice(0,4).join(' · ') + (val.missing.length>4?' …':'');
      }
    }

    const meta = next ? (MAP[next.key] || {}) : (MAP.closed);
    const progress = Math.round(steps.filter(s=>s.done).length / steps.length * 100);
    return {
      done: !next,
      progress,
      stageIndex: steps.indexOf(current) + 1,
      totalStages: steps.length,
      currentLabel: current ? current.label : '—',
      nextKey: next ? next.key : null,
      nextLabel: next ? next.label : 'الحملة مكتملة',
      responsible: meta.who || '—',
      where: meta.where || '',
      action: (!blocked || next && next.key==='booking') ? (meta.action || null) : (meta.action || null),
      actionLabel: meta.actionLabel || null,
      blocked,
      reason,
      financiallyOpen: val.financiallyOpen
    };
  },
  
  /** Validate that a campaign can be closed (all required steps done) */
  validateCompletion(campaignId){
    const c = campaigns.get(campaignId);
    if(!c) return { canComplete: false, canClose: false, missing: ['الحملة غير موجودة'], completed: 0, total: 0 };
    
    const steps = this.getSteps(campaignId);
    const missing = [];
    
    // Required OPERATIONAL steps for closure (publishing for ALL influencers is the gate).
    // Influencer transfers are tracked separately and MAY be deferred (بالأجل) — like deferred
    // client payments — so they do not hard-block operational closure; they stay visible in finance.
    const required = ['internal_review','client_decision','booking','ads_published'];
    const requiredSteps = steps.filter(s => required.includes(s.key));
    requiredSteps.forEach(s => { if(!s.done) missing.push(s.label); });

    // Influencer transfers: informational closure note only (not a blocker — may be deferred)
    const transfersStep = steps.find(s => s.key === 'transfers');
    const transfersPending = transfersStep && !transfersStep.done;
    
    // ── Document & finance requirements (no closure without a complete paper trail) ──
    const docs = campaign_documents.list().filter(d => d.campaign_id === campaignId);
    const has = t => docs.some(d => d.type === t);
    const hasQuotation = has('quotation') || !!c.quotation_doc_id || !!c.quotation_url || !!c.quotation_amount;
    const hasContract  = has('contract')  || !!c.contract_doc_id  || !!c.contract_url || !!c.contract_skipped;
    const hasReceipt   = has('receipt')   || c.client_payment_status === 'paid';
    const hasInvoice   = has('invoice')   || !!c.invoice_doc_id || !!c.invoice_issued;
    const receiptsMatched = docs.filter(d => d.type === 'receipt').every(d => (d.match_status||'pending') === 'matched');
    
    if(!hasQuotation) missing.push('رفع عرض السعر');
    // Contract is OPTIONAL — not a closure gate. Some clients commit/transfer without signing.
    if(!hasInvoice)   missing.push('إصدار/إرفاق الفاتورة');
    
    const deferred = c.client_payment_status === 'postponed';
    if(deferred){
      if(!c.allow_close_with_postponed){
        // Deferred campaigns stay financially open until collected or admin-approved
        missing.push('الدفع آجل — تبقى الحملة مفتوحة مالياً حتى التحصيل أو اعتماد الإدارة');
      }
      // else: admin approved closure — the signed contract is the commitment, no receipt required yet
    } else {
      // Non-deferred: receipt + financial matching are required
      if(!hasReceipt) missing.push('رفع إيصال تحويل العميل');
      if(hasReceipt && !receiptsMatched) missing.push('إكمال المطابقة المالية للإيصالات');
    }
    
    const completed = requiredSteps.filter(s => s.done).length;
    const total = requiredSteps.length;
    const canComplete = missing.length === 0;
    
    return { 
      canComplete, 
      canClose: canComplete,  // alias for backward compat
      missing, 
      completed,
      total,
      deferred,
      financiallyOpen: deferred && !c.allow_close_with_postponed,
      transfersPending: !!transfersPending,
      progress: total > 0 ? Math.round(completed / total * 100) : 0,
      steps 
    };
  },
  
  /** Advance a campaign to a new state (with timeline logging) */
  advance(campaignId, newStatus, payload){
    if(!CAMPAIGN_STATES.includes(newStatus)) throw new Error('حالة غير صالحة');
    const c = campaigns.get(campaignId);
    if(!c) throw new Error('الحملة غير موجودة');
    
    const oldStatus = c.status;
    campaigns.update(campaignId, Object.assign({ status: newStatus }, payload || {}));
    logTimeline(campaignId, 'status_change', null, { from: oldStatus, to: newStatus, payload: payload || {} });
    return campaigns.get(campaignId);
  },
  
  getStateLabel(s){ return CAMPAIGN_STATE_LABELS[s] || s; },
  getTimeline(campaignId){
    return campaign_timeline.list()
      .filter(t => t.campaign_id === campaignId)
      .sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
};

/* ─── CAMPAIGN DOCUMENTS — quotations · contracts · receipts ─────────
   Every document is a real archived record linked to BOTH the campaign
   and the customer, viewable on its own page (document.html?id=…). */
const DOC_TYPES = {
  quotation:  { label: 'عرض السعر',     icon: 'file-text', color: '#2563eb' },
  contract:   { label: 'العقد',          icon: 'file-text', color: '#7c3aed' },
  receipt:    { label: 'إيصال تحويل العميل', icon: 'receipt',  color: '#16a34a' },
  invoice:    { label: 'الفاتورة',       icon: 'receipt',   color: '#d97706' },
  attachment: { label: 'مرفق إضافي',     icon: 'paperclip', color: '#64748b' }
};
const campaign_documents_api = {
  TYPES: DOC_TYPES,
  typeLabel(t){ return (DOC_TYPES[t] && DOC_TYPES[t].label) || t; },
  
  list(filter){
    filter = filter || {};
    let docs = campaign_documents.list();
    if(filter.campaign_id) docs = docs.filter(d => d.campaign_id === filter.campaign_id);
    if(filter.customer_id) docs = docs.filter(d => d.customer_id === filter.customer_id);
    if(filter.type)        docs = docs.filter(d => d.type === filter.type);
    return docs.sort((a,b) => new Date(b.issued_at||b.created_at||0) - new Date(a.issued_at||a.created_at||0));
  },
  get(id){ return campaign_documents.get(id); },
  byCampaign(campaignId){ return this.list({ campaign_id: campaignId }); },
  byCustomer(customerId){ return this.list({ customer_id: customerId }); },
  latest(campaignId, type){ return this.list({ campaign_id: campaignId, type })[0] || null; },
  
  /** Create a document of a given type for a campaign (auto-linked to customer + finance) */
  create(campaignId, type, payload){
    if(!DOC_TYPES[type]) throw new Error('نوع المستند غير صالح');
    const c = campaigns.get(campaignId);
    if(!c) throw new Error('الحملة غير موجودة');
    const cust = c.customer_id ? customers.get(c.customer_id) : null;
    payload = payload || {};
    const sess = window.SC?.auth?.getSession?.() || {};
    const doc = campaign_documents.create({
      type,
      campaign_id: campaignId,
      campaign_name: c.campaign_name || c.name || '',
      customer_id: c.customer_id || null,
      customer_name: (cust && cust.name) || c.customer_name || '',
      title: payload.title || (DOC_TYPES[type].label + ' — ' + (c.campaign_name || c.name || '')),
      amount: payload.amount != null ? Number(payload.amount) : null,
      url: payload.url || '',
      // attached file (base64 data-url for PDFs/images received via WhatsApp, etc.)
      file_data: payload.file_data || '',
      file_name: payload.file_name || '',
      file_type: payload.file_type || '',
      file_size: payload.file_size || 0,
      status: payload.status || 'issued',
      method: payload.method || '',
      // finance flags (for receipts/invoices)
      match_status: payload.match_status || 'pending',   // pending | matched | unmatched
      billing_status: payload.billing_status || 'unbilled', // unbilled | billed
      notes: payload.notes || '',
      issued_at: payload.issued_at || new Date().toISOString(),
      created_by: payload.created_by || sess.name || '',
      created_by_id: sess.id || null,
      created_at: new Date().toISOString()
    });
    // A client receipt means the client has PAID — reconcile collection status across the
    // whole system (workflow, finance, dashboard) regardless of which UI path created it.
    if(type === 'receipt'){
      try {
        const patch = { client_payment_status: 'paid', client_payment_doc_id: doc.id };
        if(doc.amount != null) patch.client_payment_amount = Number(doc.amount);
        if(doc.method) patch.client_payment_method = doc.method;
        campaigns.update(campaignId, patch);
        const cc = campaigns.get(campaignId);
        if(cc && ['client_approved','client_partially_approved','quotation_issued'].indexOf(cc.status) > -1){
          try { campaign_workflow.advance(campaignId, 'client_payment_received'); } catch(e){}
        }
        try { campaign_tasks_api.autoSync(campaignId); } catch(e){}
      } catch(e){}
    }
    return doc;
  },
  update(id, patch){
    patch = patch || {};
    const sess = window.SC?.auth?.getSession?.() || {};
    patch.updated_by = sess.name || patch.updated_by || '';
    patch.updated_at = new Date().toISOString();
    return campaign_documents.update(id, patch);
  },
  remove(id){ return campaign_documents.remove(id); },
  
  /** Backfill: if a receipt exists but the campaign isn't marked collected, fix it (existing data). */
  syncReceiptStatus(campaignId){
    const c = campaigns.get(campaignId); if(!c) return false;
    if(c.client_payment_status === 'paid' || c.client_payment_status === 'postponed') return false;
    const r = this.latest(campaignId, 'receipt');
    if(!r) return false;
    const patch = { client_payment_status:'paid', client_payment_doc_id:r.id };
    if(r.amount != null) patch.client_payment_amount = Number(r.amount);
    if(r.method) patch.client_payment_method = r.method;
    campaigns.update(campaignId, patch);
    try { campaign_tasks_api.autoSync(campaignId); } catch(e){}
    return true;
  },
  
  /** Generic file upload/attach for any type — archives + links + logs */
  attachFile(campaignId, type, payload){
    payload = payload || {};
    const doc = this.create(campaignId, type, payload);
    logTimeline(campaignId, 'document_uploaded', null, { doc_id: doc.id, doc_type: type, file_name: payload.file_name || '' });
    return doc;
  },
  /** Record/attach an invoice (الفاتورة) */
  recordInvoice(campaignId, payload){
    payload = payload || {};
    const doc = this.create(campaignId, 'invoice', Object.assign({ billing_status: 'billed' }, payload));
    campaigns.update(campaignId, { invoice_doc_id: doc.id, invoice_url: payload.url || ('document.html?id=' + doc.id), invoice_issued: true });
    logTimeline(campaignId, 'invoice_recorded', null, { doc_id: doc.id, amount: payload.amount || null });
    return doc;
  },
  
  /* ── STAGE 6: quotation + contract ── */
  issueQuotation(campaignId, payload){
    payload = payload || {};
    const doc = this.create(campaignId, 'quotation', payload);
    const patch = { quotation_url: payload.url || ('document.html?id=' + doc.id), quotation_doc_id: doc.id };
    if(payload.amount != null) patch.quotation_amount = Number(payload.amount);
    campaigns.update(campaignId, patch);
    const c = campaigns.get(campaignId);
    if(c.status === 'client_approved' || c.status === 'client_partially_approved'){
      campaign_workflow.advance(campaignId, 'quotation_issued');
    }
    logTimeline(campaignId, 'quotation_issued', null, { doc_id: doc.id, amount: payload.amount || null });
    return doc;
  },
  attachContract(campaignId, payload){
    payload = payload || {};
    const doc = this.create(campaignId, 'contract', payload);
    campaigns.update(campaignId, { contract_url: payload.url || ('document.html?id=' + doc.id), contract_doc_id: doc.id });
    logTimeline(campaignId, 'contract_attached', null, { doc_id: doc.id });
    return doc;
  },
  
  /* ── STAGE 7: collect client payment + receipt ── */
  recordClientPayment(campaignId, payload){
    payload = payload || {};
    const status = payload.status || 'paid';   // paid | postponed
    let doc = null;
    if(status === 'paid'){
      doc = this.create(campaignId, 'receipt', {
        url: payload.url || payload.receipt_url || '',
        file_data: payload.file_data || '',
        file_name: payload.file_name || '',
        file_type: payload.file_type || '',
        file_size: payload.file_size || 0,
        amount: payload.amount,
        method: payload.method || '',
        notes: payload.notes || '',
        status: 'paid'
      });
    }
    const patch = { client_payment_status: status };
    if(payload.amount != null)  patch.client_payment_amount = Number(payload.amount);
    if(payload.method)          patch.client_payment_method = payload.method;
    if(payload.receipt_url || payload.url) patch.client_payment_receipt_url = payload.receipt_url || payload.url;
    if(doc)                     patch.client_payment_doc_id = doc.id;
    campaigns.update(campaignId, patch);
    if(status === 'paid'){
      const c = campaigns.get(campaignId);
      if(['client_approved','client_partially_approved','quotation_issued'].indexOf(c.status) > -1){
        campaign_workflow.advance(campaignId, 'client_payment_received');
      }
    }
    logTimeline(campaignId, 'client_payment_recorded', null, { status, amount: payload.amount || null, doc_id: doc ? doc.id : null });
    return doc;
  }
};

/* ─── CAMPAIGN NOMINATIONS API ────────────────────────────────────── */
const campaign_nominations_api = {
  list(campaignId){
    return campaign_nominations.list().filter(n => !campaignId || n.campaign_id === campaignId);
  },
  
  get(nomId){ return campaign_nominations.get(nomId); },
  
  /** Add an influencer as a nominee in a campaign (supports UGC creators via 'UGC-' prefixed ids) */
  create(campaignId, influencerId, payload){
    return this._createNom(campaignId, influencerId, payload, {});
  },
  
  /** Internal creator — kind:{alternativeFor, alternativeForName, isAlternative} */
  _createNom(campaignId, influencerId, payload, kind){
    kind = kind || {};
    let inf = influencers.get(influencerId);
    let isUgc = false;
    if(!inf){
      // UGC creators live in their own table; engine passes ids like 'UGC-<id>'
      const rawId = String(influencerId).replace(/^UGC-/, '');
      const ugc = (typeof ugc_creators !== 'undefined' && ugc_creators.get) ? (ugc_creators.get(rawId) || ugc_creators.get(influencerId)) : null;
      if(ugc){
        isUgc = true;
        inf = { id: influencerId, name: ugc.name, classification: 'UGC', city: ugc.city || '', cov_cost: null, home_cost: null, cov_sell: null, home_sell: null };
      }
    }
    if(!inf) throw new Error('المؤثر غير موجود');
    
    payload = payload || {};
    // Number of ads for this influencer in this campaign (contracts may bundle several)
    const adsCount = Math.max(1, parseInt(payload.ads_count, 10) || 1);
    
    // Default prices from influencer data if available
    const cost   = (payload && payload.cost_price !== undefined) ? Number(payload.cost_price)    : (Number(inf.cov_cost) || Number(inf.home_cost) || Number(inf.cost) || null);
    const sell   = (payload && payload.selling_price !== undefined) ? Number(payload.selling_price) : (Number(inf.cov_sell) || Number(inf.home_sell) || Number(inf.sell_price) || null);
    const profit = (sell != null && cost != null) ? (sell - cost) : null;
    const margin = (sell != null && cost != null && sell > 0) ? Math.round(profit / sell * 1000) / 10 : null;
    
    const c0 = campaigns.get(campaignId);
    const round = (c0 && Number(c0.approval_round)) || 1;
    // هل القائمة تتغيّر بعد اكتمال اعتماد سابق؟ (إضافة بعد الاعتماد الداخلي/العميل)
    const APPROVED_STATES = ['internal_approved','pending_client_approval','client_approved','client_partially_approved','client_rejected'];
    const listChangingAfterApproval = !!(c0 && (APPROVED_STATES.indexOf(c0.status) !== -1 || c0.client_approval_token));
    
    const nom = campaign_nominations.create(Object.assign({
      campaign_id: campaignId,
      influencer_id: influencerId,
      influencer_name: inf.name,
      influencer_classification: inf.classification,
      influencer_city: inf.city,
      is_ugc: isUgc || undefined,
      platforms: payload?.platforms || [],
      ads_count: adsCount,
      selling_price: sell,
      cost_price: cost,
      profit_amount: profit,
      profit_margin: margin,
      status: 'pending_internal_review',
      notes: payload?.notes || '',
      selected_by: window.SC?.auth?.getSession?.()?.name || '',
      selected_at: new Date().toISOString(),
      approval_round: round,
      is_new_in_round: round > 1 || listChangingAfterApproval,
      previously_approved: false,
      alternative_for_nomination_id: kind.alternativeFor || null,
      alternative_for_influencer_name: kind.alternativeForName || null,
      replaced_by_nomination_id: null,
      internal_hold_reason: null,
      client_decision: null,
      client_decision_at: null,
      influencer_decision: null,
      influencer_decision_at: null,
      booking_date: null,
      booking_time: null,
      alternative_date: null,
      alternative_time: null,
      proof_url: null,
      drive_folder_url: null,
      ad_completed: false,
      content_saved: false
    }, payload || {}, { ads_count: adsCount }));
    
    logTimeline(campaignId, kind.isAlternative ? 'alternative_nominated' : 'influencer_nominated', null, { 
      influencer_id: influencerId, influencer_name: inf.name, nomination_id: nom.id,
      alternative_for: kind.alternativeForName || null
    });
    
    // Move campaign to nomination state if still draft
    const c = campaigns.get(campaignId);
    if(c && c.status === 'draft'){
      campaigns.update(campaignId, { status: 'nomination_in_progress' });
    }
    // إن تغيّرت قائمة الترشيحات بعد اعتماد سابق → ابدأ دورة اعتماد جديدة
    if(listChangingAfterApproval){
      this._handleListChangeAfterApproval(campaignId, nom, kind.isAlternative ? 'alternative' : 'new_influencer');
    }
    try { campaign_tasks_api.autoSync(campaignId); } catch(e){}
    return nom;
  },
  
  /** إنشاء «ترشيح بديل» لمؤثر مرفوض/معلّق — مرتبط بالأصل في السجل والتاريخ التشغيلي */
  createAlternative(originalNomId, newInfluencerId, payload){
    const orig = campaign_nominations.get(originalNomId);
    if(!orig) throw new Error('الترشيح الأصلي غير موجود');
    if(!['internal_rejected','internal_on_hold'].includes(orig.status)){
      throw new Error('الترشيح البديل متاح فقط للمؤثر المرفوض أو المعلّق');
    }
    const alt = this._createNom(orig.campaign_id, newInfluencerId, payload || {}, {
      alternativeFor: originalNomId,
      alternativeForName: orig.influencer_name,
      isAlternative: true
    });
    // اربط الأصل بالبديل (يبقى الأصل محفوظاً في السجل، غير محذوف)
    campaign_nominations.update(originalNomId, { replaced_by_nomination_id: alt.id });
    return alt;
  },
  
  /** عند تغيّر قائمة الترشيحات بعد اعتماد سابق:
      إلغاء الاعتماد السابق، حفظ السجل، بدء دورة جديدة، إبطال رابط العميل، وتمييز الجديد/السابق. */
  _handleListChangeAfterApproval(campaignId, newNom, changeKind){
    const c = campaigns.get(campaignId);
    if(!c) return;
    const now = new Date().toISOString();
    const prevRound = Number(c.approval_round) || 1;
    const noms = this.list(campaignId).filter(n => n.id !== (newNom && newNom.id));
    
    // 1) لقطة للسجل (محفوظة، لا تُحذف)
    const snapshot = {
      round: prevRound,
      snapshot_at: now,
      prev_status: c.status,
      trigger: changeKind,                       // 'alternative' | 'new_influencer'
      trigger_influencer: newNom ? newNom.influencer_name : '',
      nominations: noms.map(n => ({
        nomination_id: n.id, influencer_name: n.influencer_name,
        internal_status: n.status, client_decision: n.client_decision || null
      }))
    };
    const history = Array.isArray(c.approval_history) ? c.approval_history.slice() : [];
    history.push(snapshot);
    
    // 2) تمييز المؤثرين الذين تمت الموافقة عليهم سابقاً + إلغاء قرار العميل (يعيد العميل اعتماد القائمة الجديدة)
    noms.forEach(n => {
      const patch = {};
      if(this._internalDecision(n) === 'approved'){
        patch.previously_approved = true;
        patch.prev_round = prevRound;
      }
      if(n.client_decision){
        patch.prior_client_decision = n.client_decision;
        patch.prior_client_decision_at = n.client_decision_at || null;
        patch.client_decision = null;
        patch.client_decision_at = null;
      }
      if(Object.keys(patch).length) campaign_nominations.update(n.id, patch);
    });
    
    // 3) إبطال رابط اعتماد العميل القديم (سيُنشأ رابط جديد عند الإرسال)
    if(c.client_approval_token){
      try {
        const tok = approval_tokens.list().find(x => x.token === c.client_approval_token && x.type === 'client_approval');
        if(tok) approval_tokens.update(tok.id, { revoked_at: now, revoked_reason: 'تغيّرت قائمة الترشيحات — دورة اعتماد جديدة' });
      } catch(e){}
    }
    
    // 4) بدء دورة جديدة + إرجاع الحملة للاعتماد الداخلي + إلغاء الاعتماد السابق
    campaigns.update(campaignId, {
      status: 'pending_internal_approval',
      approval_round: prevRound + 1,
      approval_history: history,
      client_approval_token: null,
      client_decision_completed_at: null,
      approval_invalidated_at: now,
      approval_invalidated_reason: changeKind === 'alternative' ? 'إضافة ترشيح بديل' : 'إضافة مؤثر جديد'
    });
    
    // 5) سجل العمليات في التاريخ التشغيلي
    logTimeline(campaignId, 'approval_cycle_restarted', null, {
      round: prevRound + 1, trigger: changeKind,
      trigger_influencer: newNom ? newNom.influencer_name : ''
    });
  },
  
  update(nomId, payload){
    const nom = campaign_nominations.get(nomId);
    if(!nom) throw new Error('الترشيح غير موجود');
    // Recompute profit/margin if prices changed
    const merged = Object.assign({}, nom, payload);
    if(merged.selling_price != null && merged.cost_price != null){
      merged.profit_amount = Number(merged.selling_price) - Number(merged.cost_price);
      merged.profit_margin = Number(merged.selling_price) > 0 
        ? Math.round(merged.profit_amount / Number(merged.selling_price) * 1000) / 10 
        : null;
    }
    return campaign_nominations.update(nomId, merged);
  },
  
  remove(nomId){
    const nom = campaign_nominations.get(nomId);
    if(nom) logTimeline(nom.campaign_id, 'nomination_removed', null, { nomination_id: nomId });
    return campaign_nominations.remove(nomId);
  },
  
  /** Submit all nominations for internal manager review */
  submitForInternalReview(campaignId, comment){
    const noms = this.list(campaignId);
    if(noms.length === 0) throw new Error('لا يوجد ترشيحات للإرسال');
    noms.forEach(n => campaign_nominations.update(n.id, { status: 'pending_internal_review' }));
    campaigns.update(campaignId, { 
      status: 'pending_internal_approval',
      nomination_submitted_at: new Date().toISOString(),
      nomination_comment: comment || ''
    });
    logTimeline(campaignId, 'submitted_for_internal_review', null, { comment, count: noms.length });
    return { success: true, count: noms.length };
  },
  
  /** Approve a nomination internally */
  approveInternal(nomId, payload){
    const nom = campaign_nominations.get(nomId);
    if(!nom) throw new Error('الترشيح غير موجود');
    campaign_nominations.update(nomId, {
      status: 'internal_approved',
      internal_approved_by: window.SC?.auth?.getSession?.()?.name || '',
      internal_approved_at: new Date().toISOString(),
      internal_notes: payload?.notes || ''
    });
    logTimeline(nom.campaign_id, 'nomination_internal_approved', null, { 
      nomination_id: nomId, influencer_name: nom.influencer_name 
    });
    
    // Check if all are decided → move campaign forward
    this._maybeAdvanceCampaign(nom.campaign_id);
    return campaign_nominations.get(nomId);
  },
  
  /** Reject a nomination internally — reason is MANDATORY and linked to the timeline */
  rejectInternal(nomId, reason){
    const nom = campaign_nominations.get(nomId);
    if(!nom) throw new Error('الترشيح غير موجود');
    if(!reason || !String(reason).trim()) throw new Error('سبب الرفض إلزامي');
    campaign_nominations.update(nomId, {
      status: 'internal_rejected',
      internal_rejected_by: window.SC?.auth?.getSession?.()?.name || '',
      internal_rejected_at: new Date().toISOString(),
      internal_reject_reason: String(reason).trim(),
      internal_hold_reason: null
    });
    logTimeline(nom.campaign_id, 'nomination_internal_rejected', null, { 
      nomination_id: nomId, influencer_name: nom.influencer_name, reason: String(reason).trim()
    });
    this._maybeAdvanceCampaign(nom.campaign_id);
    return campaign_nominations.get(nomId);
  },
  
  /** Hold a nomination internally (معلّق) — distinct decision; reason MANDATORY + linked to timeline.
      A held nomination BLOCKS full campaign approval. */
  holdInternal(nomId, reason){
    const nom = campaign_nominations.get(nomId);
    if(!nom) throw new Error('الترشيح غير موجود');
    if(!reason || !String(reason).trim()) throw new Error('سبب التعليق إلزامي');
    campaign_nominations.update(nomId, {
      status: 'internal_on_hold',
      internal_held_by: window.SC?.auth?.getSession?.()?.name || '',
      internal_held_at: new Date().toISOString(),
      internal_hold_reason: String(reason).trim(),
      internal_approved_by: null, internal_approved_at: null,
      internal_rejected_by: null, internal_rejected_at: null, internal_reject_reason: null
    });
    logTimeline(nom.campaign_id, 'nomination_internal_held', null, {
      nomination_id: nomId, influencer_name: nom.influencer_name, reason: String(reason).trim()
    });
    this._maybeAdvanceCampaign(nom.campaign_id);
    return campaign_nominations.get(nomId);
  },
  
  /** Reset a nomination back to "awaiting decision" — cancels a prior approve/reject/hold (re-editable) */
  suspendInternal(nomId){
    const nom = campaign_nominations.get(nomId);
    if(!nom) throw new Error('الترشيح غير موجود');
    campaign_nominations.update(nomId, {
      status: 'pending_internal_review',
      internal_approved_by: null, internal_approved_at: null,
      internal_rejected_by: null, internal_rejected_at: null, internal_reject_reason: null,
      internal_held_by: null, internal_held_at: null, internal_hold_reason: null
    });
    logTimeline(nom.campaign_id, 'nomination_internal_pending', null, {
      nomination_id: nomId, influencer_name: nom.influencer_name
    });
    return campaign_nominations.get(nomId);
  },
  
  /** Unified per-row decision setter. reason required for rejected/held. */
  setInternalDecision(nomId, decision, reason){
    if(decision === 'approved') return this.approveInternal(nomId, {});
    if(decision === 'rejected') return this.rejectInternal(nomId, reason);
    if(decision === 'held')     return this.holdInternal(nomId, reason);
    if(decision === 'pending')  return this.suspendInternal(nomId);
    throw new Error('قرار غير صالح');
  },
  
  /** Approve all pending nominations at once (bulk) */
  approveAllInternal(campaignId){
    const noms = this.list(campaignId).filter(n => n.status === 'pending_internal_review');
    noms.forEach(n => this.approveInternal(n.id, {}));
    return { count: noms.length };
  },
  
  /**
   * Bulk decision over a whole campaign's nominations + ONE shared comment.
   * decision: 'approved' | 'rejected' | 'pending'
   * scope:    'all' (default) | 'pending'
   * The reason/comment is captured once for the whole batch (not per-influencer)
   * and recorded as a single entry in the unified timeline + conversation thread.
   */
  bulkSetInternal(campaignId, decision, comment, scope){
    if(['approved','rejected','pending','held'].indexOf(decision) === -1) throw new Error('قرار غير صالح');
    if((decision === 'rejected' || decision === 'held') && (!comment || !String(comment).trim())){
      throw new Error(decision === 'rejected' ? 'سبب الرفض إلزامي' : 'سبب التعليق إلزامي');
    }
    scope = scope || 'all';
    const sess = window.SC?.auth?.getSession?.() || {};
    const now  = new Date().toISOString();
    let noms = this.list(campaignId);
    if(scope === 'pending') noms = noms.filter(n => n.status === 'pending_internal_review');
    let count = 0;
    noms.forEach(n => {
      try {
        if(decision === 'approved'){
          campaign_nominations.update(n.id, {
            status: 'internal_approved',
            internal_approved_by: sess.name || '', internal_approved_at: now,
            internal_rejected_by: null, internal_rejected_at: null, internal_reject_reason: null,
            internal_held_by: null, internal_held_at: null, internal_hold_reason: null
          });
        } else if(decision === 'rejected'){
          campaign_nominations.update(n.id, {
            status: 'internal_rejected',
            internal_rejected_by: sess.name || '', internal_rejected_at: now,
            internal_reject_reason: String(comment).trim(),
            internal_approved_by: null, internal_approved_at: null,
            internal_held_by: null, internal_held_at: null, internal_hold_reason: null
          });
        } else if(decision === 'held'){
          campaign_nominations.update(n.id, {
            status: 'internal_on_hold',
            internal_held_by: sess.name || '', internal_held_at: now,
            internal_hold_reason: String(comment).trim(),
            internal_approved_by: null, internal_approved_at: null,
            internal_rejected_by: null, internal_rejected_at: null, internal_reject_reason: null
          });
        } else { // pending (إعادة لبانتظار القرار)
          campaign_nominations.update(n.id, {
            status: 'pending_internal_review',
            internal_approved_by: null, internal_approved_at: null,
            internal_rejected_by: null, internal_rejected_at: null, internal_reject_reason: null,
            internal_held_by: null, internal_held_at: null, internal_hold_reason: null
          });
        }
        count++;
      } catch(e){}
    });
    this._maybeAdvanceCampaign(campaignId);
    const stats = this.qualityStats(campaignId);
    // ── ONE unified timeline entry for the whole batch (not per-influencer) ──
    logTimeline(campaignId, 'nominations_bulk_decision', null, {
      decision, scope, count, comment: comment || '',
      accepted: stats.accepted, rejected: stats.rejected, held: stats.held, pending: stats.pending
    });
    // ── Shared comment into the conversation thread (single, not per row) ──
    if(comment && comment.trim()){
      campaign_timeline.create({
        campaign_id: campaignId, action: 'approval_comment', timestamp: now, actor: sess.name || '',
        payload: {
          text: comment.trim(), author: sess.name || '', author_role: sess.role || '',
          author_role_label: window.SC?.auth?.ROLES?.[sess.role]?.label || sess.role || ''
        }
      });
    }
    return { count, decision };
  },
  
  /** Nomination-quality statistics — overall + per nominating employee (links quality to staff performance) */
  /** القرار الداخلي الثابت (يعتمد حقول القرار لا الحالة المتغيّرة بعد الاعتماد) */
  _internalDecision(n){
    if(!n) return 'pending';
    if(n.internal_rejected_at || n.status === 'internal_rejected') return 'rejected';
    if(n.internal_held_at     || n.status === 'internal_on_hold')  return 'held';
    if(n.internal_approved_at || n.status === 'internal_approved') return 'approved';
    return 'pending';
  },
  
  qualityStats(campaignId){
    const noms = this.list(campaignId);
    const total    = noms.length;
    const dec = noms.map(n => ({ n, d: this._internalDecision(n) }));
    const accepted = dec.filter(x => x.d === 'approved').length;
    const rejected = dec.filter(x => x.d === 'rejected').length;
    const held     = dec.filter(x => x.d === 'held').length;
    const pending  = dec.filter(x => x.d === 'pending').length; // بانتظار القرار
    const decided  = accepted + rejected;
    const acceptanceRate = decided > 0 ? Math.round(accepted / decided * 100) : 0;
    const rejectionRate  = decided > 0 ? Math.round(rejected / decided * 100) : 0;
    const byEmp = {};
    dec.forEach(({ n, d }) => {
      const k = n.selected_by || '—';
      if(!byEmp[k]) byEmp[k] = { employee: k, total: 0, accepted: 0, rejected: 0, held: 0, pending: 0 };
      byEmp[k].total++;
      if(d === 'approved') byEmp[k].accepted++;
      else if(d === 'rejected') byEmp[k].rejected++;
      else if(d === 'held') byEmp[k].held++;
      else byEmp[k].pending++;
    });
    const byEmployee = Object.keys(byEmp).map(k => {
      const e = byEmp[k];
      const d2 = e.accepted + e.rejected;
      e.acceptanceRate = d2 > 0 ? Math.round(e.accepted / d2 * 100) : 0;
      e.rejectionRate  = d2 > 0 ? Math.round(e.rejected / d2 * 100) : 0;
      e.qualityScore   = e.total > 0 ? Math.round(e.accepted / e.total * 100) : 0;
      return e;
    }).sort((a, b) => b.qualityScore - a.qualityScore || b.total - a.total);
    return { total, accepted, rejected, held, pending, awaiting: pending, decided, acceptanceRate, rejectionRate, byEmployee };
  },
  
  /** Single consolidated summary of the whole nomination process — feeds the unified timeline entry */
  nominationSummary(campaignId){
    const noms = this.list(campaignId);
    if(noms.length === 0) return null;
    const times = noms
      .map(n => new Date(n.selected_at || n.created_at || 0).getTime())
      .filter(t => t > 0)
      .sort((a, b) => a - b);
    const firstAt = times.length ? new Date(times[0]).toISOString() : null;
    const lastAt  = times.length ? new Date(times[times.length - 1]).toISOString() : null;
    const employees = Array.from(new Set(noms.map(n => n.selected_by).filter(Boolean)));
    const stats = this.qualityStats(campaignId);
    return {
      firstAt, lastAt, employees, count: noms.length,
      accepted: stats.accepted, rejected: stats.rejected, pending: stats.pending
    };
  },
  
  /** Consolidated view of the client's review — ONE event, not per-influencer fragments */
  clientDecisionSummary(campaignId){
    const noms = this.list(campaignId);
    // العميل يراجع الترشيحات المعتمدة داخلياً (أو التي صدر فيها قرار عميل مسبق)
    const reviewable = noms.filter(n => this._internalDecision(n) === 'approved' || n.client_decision);
    const approved = reviewable.filter(n => n.client_decision === 'approved').length;
    const rejected = reviewable.filter(n => n.client_decision === 'rejected').length;
    const held     = reviewable.filter(n => n.client_decision === 'pending').length; // معلّق من العميل
    const decidedList = reviewable.filter(n => n.client_decision);
    const awaiting = reviewable.length - decidedList.length;            // بانتظار قرار العميل
    if(reviewable.length === 0) return null;
    const times = decidedList
      .map(n => new Date(n.client_decision_at || 0).getTime())
      .filter(t => t > 0)
      .sort((a, b) => a - b);
    const firstAt = times.length ? new Date(times[0]).toISOString() : null;
    const lastAt  = times.length ? new Date(times[times.length - 1]).toISOString() : null;
    const c = campaigns.get(campaignId);
    return {
      count: decidedList.length, total: reviewable.length,
      approved, rejected, held, awaiting,
      general_note: (c && c.client_general_notes) || '',
      firstAt, lastAt
    };
  },
  
  /** ملاحظة عامة على كامل الترشيح — scope:'internal'|'client' */
  setGeneralNote(campaignId, scope, text){
    const c = campaigns.get(campaignId);
    if(!c) throw new Error('الحملة غير موجودة');
    const sess = window.SC?.auth?.getSession?.() || {};
    if(scope === 'client'){
      campaigns.update(campaignId, { client_general_notes: text || '' });
      logTimeline(campaignId, 'approval_comment', 'العميل', { text: text || '', author:'العميل', scope:'client_general' });
    } else {
      campaigns.update(campaignId, { internal_general_note: text || '', nomination_comment: text || '' });
      logTimeline(campaignId, 'approval_comment', sess.name || '', { text: text || '', author: sess.name || '', scope:'internal_general' });
    }
    return true;
  },
  
  /** البوابة: حالة الاعتماد الكاملة + هل الحملة معتمدة فعلاً (لا معلّق/بانتظار/جديد غير مُقرّر) */
  approvalState(campaignId){
    const c = campaigns.get(campaignId) || {};
    const noms = this.list(campaignId);
    const internal = this.qualityStats(campaignId);
    const client = this.clientDecisionSummary(campaignId) || { approved:0, rejected:0, held:0, awaiting:0, total:0, general_note:'' };
    const newUndecided = noms.filter(n => n.is_new_in_round && n.status === 'pending_internal_review').length;
    const internalFullyApproved = internal.total > 0 && internal.held === 0 && internal.pending === 0 && internal.accepted > 0;
    const clientFullyApproved = client.total > 0 && client.held === 0 && client.awaiting === 0 && client.approved > 0;
    return {
      round: Number(c.approval_round) || 1,
      internal, client,
      newUndecided,
      internalFullyApproved,
      clientFullyApproved,
      // البوابة: لا تُعتبر الحملة معتمدة إن تغيّرت القائمة دون استكمال الدورة
      approvalValid: internalFullyApproved && (client.total === 0 || clientFullyApproved),
      history: Array.isArray(c.approval_history) ? c.approval_history : [],
      invalidatedReason: c.approval_invalidated_reason || null
    };
  },
  
  _maybeAdvanceCampaign(campaignId){
    const noms = this.list(campaignId);
    if(noms.length === 0) return;
    const dec = noms.map(n => this._internalDecision(n));
    const pendingCount  = dec.filter(d => d === 'pending').length;
    const heldCount     = dec.filter(d => d === 'held').length;
    const approvedCount = dec.filter(d => d === 'approved').length;
    // لا تُعتبر الحملة معتمدة داخلياً إن وُجد أي ترشيح معلّق أو بانتظار القرار
    if(pendingCount === 0 && heldCount === 0 && approvedCount > 0){
      const c = campaigns.get(campaignId);
      if(c && ['nomination_in_progress','pending_internal_approval'].includes(c.status)){
        campaigns.update(campaignId, { status: 'internal_approved' });
      }
    } else {
      const c = campaigns.get(campaignId);
      if(c && c.status === 'internal_approved' && (pendingCount > 0 || heldCount > 0)){
        campaigns.update(campaignId, { status: 'pending_internal_approval' });
      }
    }
  },
  
  /** Public: client decides on a nomination (via token). decision: approved|rejected|pending. opts.date → auto-passed to booking */
  clientDecision(nominationId, decision, notes, opts){
    opts = opts || {};
    const nom = campaign_nominations.get(nominationId);
    if(!nom) throw new Error('الترشيح غير موجود');
    if(['approved','rejected','pending'].indexOf(decision) === -1) throw new Error('قرار غير صالح');
    
    const update = {
      client_decision: decision,
      client_decision_at: new Date().toISOString(),
      client_notes: notes || ''
    };
    // Unified notes mechanism: the client's note flows to the influencer-approval page
    if(notes) update.notes_for_influencer = notes;
    // Date chosen by the client → stored and auto-passed to the influencer-approval page
    if(opts.date){
      update.client_suggested_date = opts.date;
      update.booking_date = opts.date;   // influencer-booking reads this as proposed_date
    }
    campaign_nominations.update(nominationId, update);
    logTimeline(nom.campaign_id, 'client_decision_per_nomination', 'العميل', { 
      nomination_id: nominationId, decision, notes, date: opts.date || null 
    });
    
    // Update campaign state based on all FINAL client decisions (pending ≠ final)
    const noms = this.list(nom.campaign_id);
    const decided = noms.filter(n => n.client_decision === 'approved' || n.client_decision === 'rejected');
    const approved = noms.filter(n => n.client_decision === 'approved');
    
    if(decided.length === noms.length){
      let newStatus;
      if(approved.length === noms.length) newStatus = 'client_approved';
      else if(approved.length > 0) newStatus = 'client_partially_approved';
      else newStatus = 'client_rejected';
      campaigns.update(nom.campaign_id, { 
        status: newStatus,
        client_decision_completed_at: new Date().toISOString()
      });
    }
    
    try { campaign_tasks_api.autoSync(nom.campaign_id); } catch(e){}
    return campaign_nominations.get(nominationId);
  },
  
  /** Influencer decides on booking (via token) */
  influencerDecision(nominationId, decision, payload){
    const nom = campaign_nominations.get(nominationId);
    if(!nom) throw new Error('الترشيح غير موجود');
    
    const update = {
      influencer_decision: decision,
      influencer_decision_at: new Date().toISOString(),
      influencer_notes: payload?.notes || ''
    };
    
    // Capture booking date/time from payload (if provided)
    if(payload?.booking_date) update.booking_date = payload.booking_date;
    if(payload?.booking_time) update.booking_time = payload.booking_time;
    
    if(decision === 'approved') update.status = 'booking_confirmed';
    if(decision === 'rejected') update.status = 'booking_cancelled';
    if(decision === 'reschedule'){
      update.status = 'booking_reschedule_requested';
      update.alternative_date = payload?.alternative_date || null;
      update.alternative_time = payload?.alternative_time || null;
    }
    
    campaign_nominations.update(nominationId, update);
    logTimeline(nom.campaign_id, 'influencer_booking_decision', nom.influencer_name, { 
      nomination_id: nominationId, decision, payload 
    });
    
    // Notify the campaign manager of the influencer's decision
    if(window.SC?.system?.addNotification){
      const link = 'campaign-detail.html?id=' + nom.campaign_id;
      if(decision === 'approved'){
        window.SC.system.addNotification({ type:'success', subtype:'booking_confirmed',
          title:'تأكيد حجز من المشهور', message:`المشهور "${nom.influencer_name}" وافق على الحجز.`, link });
      } else if(decision === 'reschedule'){
        window.SC.system.addNotification({ type:'warning', subtype:'booking_reschedule',
          title:'طلب تعديل موعد', message:`المشهور "${nom.influencer_name}" طلب تعديل موعد الحجز — بانتظار اعتماد الموعد الجديد.`, link });
      } else if(decision === 'rejected'){
        window.SC.system.addNotification({ type:'danger', subtype:'booking_rejected',
          title:'المشهور غير متاح', message:`المشهور "${nom.influencer_name}" اعتذر عن الحجز.`, link });
      }
    }
    
    // If approved → auto-create calendar event (use FINAL values, not stale nom)
    const finalDate = update.booking_date || nom.booking_date;
    const finalTime = update.booking_time || nom.booking_time;
    if(decision === 'approved' && finalDate){
      calendar_events_api.create({
        type: 'campaign_ad_booking',
        campaign_id: nom.campaign_id,
        influencer_id: nom.influencer_id,
        influencer_name: nom.influencer_name,
        nomination_id: nominationId,
        date: finalDate,
        time: finalTime || '',
        title: 'حجز ' + nom.influencer_name,
        source: 'auto_from_booking',
        created_from_token: true,
        confirmed: true,
        status: 'confirmed'
      });
    }
    
    try { campaign_tasks_api.autoSync(nom.campaign_id); } catch(e){}
    return campaign_nominations.get(nominationId);
  },
  
  /** Confirm a booking DIRECTLY inside the system (no external link needed).
      The responsible employee coordinates with the influencer offline, then records
      the confirmed booking here — fully tracked, no manual link/copy round-trip. */
  confirmBookingManually(nominationId, payload){
    payload = payload || {};
    const nom = campaign_nominations.get(nominationId);
    if(!nom) throw new Error('الترشيح غير موجود');
    if(nom.client_decision !== 'approved') throw new Error('لا يمكن الحجز قبل اعتماد العميل لهذا المؤثر');
    const sess = window.SC?.auth?.getSession?.() || {};
    const update = {
      influencer_decision: 'approved',
      influencer_decision_at: new Date().toISOString(),
      influencer_notes: payload.notes || '',
      status: 'booking_manually_confirmed',
      booking_confirmed_by: sess.name || '',
      booking_confirmed_internally: true
    };
    if(payload.booking_date) update.booking_date = payload.booking_date;
    if(payload.booking_time) update.booking_time = payload.booking_time;
    campaign_nominations.update(nominationId, update);
    logTimeline(nom.campaign_id, 'booking_confirmed_internally', sess.name || 'الموظف المسؤول', {
      nomination_id: nominationId, influencer_name: nom.influencer_name,
      booking_date: payload.booking_date || nom.booking_date || null,
      booking_time: payload.booking_time || null
    });
    // Auto-create the confirmed calendar event
    const finalDate = update.booking_date || nom.booking_date;
    if(finalDate){
      try { calendar_events_api.create({
        type:'campaign_ad_booking', campaign_id:nom.campaign_id, influencer_id:nom.influencer_id,
        influencer_name:nom.influencer_name, nomination_id:nominationId, date:finalDate,
        time:(update.booking_time||nom.booking_time||''), title:'حجز '+nom.influencer_name,
        source:'manual_internal_booking', confirmed:true, status:'confirmed'
      }); } catch(e){}
    }
    if(window.SC?.system?.addNotification){
      window.SC.system.addNotification({ type:'success', subtype:'booking_confirmed',
        title:'تم تأكيد الحجز', message:`تم تأكيد حجز "${nom.influencer_name}" داخلياً${finalDate?' بتاريخ '+finalDate:''}.`,
        link:'campaign-detail.html?id='+nom.campaign_id });
    }
    try { campaign_tasks_api.autoSync(nom.campaign_id); } catch(e){}
    return campaign_nominations.get(nominationId);
  }
};

/* ─── UNIFIED CAMPAIGN TIMELINE — single source of truth for ALL pages ───
   The raw timeline keeps a full per-event audit trail, but every page renders
   the SAME consolidated view: ONE entry for the whole nomination operation
   (not a row per influencer), plus process-level events and comments.
   Change the behaviour here once → it propagates across the entire system. */

// Per-influencer events that must NOT clutter the unified timeline
campaign_timeline.NOISE_ACTIONS = [
  'influencer_nominated','nomination_added','nomination_removed',
  'nomination_internal_approved','nomination_internal_rejected','nomination_internal_pending',
  'client_decision_per_nomination'   // collapsed into ONE consolidated client-review entry
];

// Shared visual metadata (icon · kind · label)
campaign_timeline.META = {
  'campaign_created':              { icon:'rocket',        kind:'brand',   label:'تم إنشاء الحملة' },
  'influencer_nominated':          { icon:'user-plus',     kind:'info',    label:'ترشيح مؤثر' },
  'nomination_added':              { icon:'user-plus',     kind:'info',    label:'إضافة ترشيح' },
  'nomination_removed':            { icon:'trash',         kind:'warning', label:'إزالة ترشيح' },
  'internal_approved':             { icon:'shield',        kind:'success', label:'اعتماد داخلي' },
  'internal_rejected':             { icon:'x',             kind:'danger',  label:'رفض داخلي' },
  'nomination_internal_held':      { icon:'pause',         kind:'warning', label:'تعليق ترشيح داخلياً' },
  'nomination_internal_pending':   { icon:'clock',         kind:'info',    label:'إعادة ترشيح لبانتظار القرار' },
  'alternative_nominated':         { icon:'refresh',       kind:'info',    label:'ترشيح بديل' },
  'approval_cycle_restarted':      { icon:'rotate',        kind:'warning', label:'بدء دورة اعتماد جديدة' },
  'booking_manually_confirmed':    { icon:'calendar',      kind:'success', label:'تأكيد حجز يدوي' },
  'created':                       { icon:'rocket',        kind:'brand',   label:'تم إنشاء الحملة' },
  'nomination_summary':            { icon:'user-check',    kind:'info',    label:'ترشيح الحملة' },
  'submitted_for_internal_review': { icon:'send',          kind:'info',    label:'أُرسل للتعميد الداخلي' },
  'nominations_bulk_decision':     { icon:'shield-check',  kind:'success', label:'قرار جماعي على الترشيحات' },
  'approval_price_edit':           { icon:'edit',          kind:'warning', label:'تعديل سعر' },
  'approval_comment':              { icon:'message',       kind:'info',    label:'تعليق' },
  'status_change':                 { icon:'refresh',       kind:'info',    label:'تغيّرت حالة الحملة' },
  'task_created':                  { icon:'plus',          kind:'info',    label:'أُنشئت مهمة' },
  'task_completed':                { icon:'check',         kind:'success', label:'اكتملت مهمة' },
  'client_approval_link_created':  { icon:'link',          kind:'info',    label:'تم إنشاء رابط العميل' },
  'client_decision':               { icon:'thumbs-up',     kind:'success', label:'قرار العميل' },
  'client_decision_per_nomination':{ icon:'thumbs-up',     kind:'success', label:'قرار العميل' },
  'client_decision_summary':       { icon:'user-check',    kind:'success', label:'مراجعة العميل للحملة' },
  'booking_link_sent':             { icon:'send',          kind:'info',    label:'تم إرسال رابط الحجز' },
  'influencer_booking_decision':   { icon:'calendar-check',kind:'success', label:'قرار المؤثر على الحجز' },
  'booking_date_updated':          { icon:'calendar',      kind:'warning', label:'تم تعديل تاريخ الحجز' },
  'quotation_issued':              { icon:'file-text',     kind:'info',    label:'تم إصدار عرض السعر' },
  'contract_attached':             { icon:'paperclip',     kind:'info',    label:'تم إرفاق العقد' },
  'client_payment_recorded':       { icon:'dollar',        kind:'success', label:'تم تسجيل تحصيل العميل' },
  'document_uploaded':             { icon:'paperclip',     kind:'info',    label:'تم رفع مستند' },
  'invoice_recorded':              { icon:'receipt',       kind:'success', label:'تم إصدار/إرفاق الفاتورة' },
  'transfer_request_created':      { icon:'dollar',        kind:'info',    label:'تم إنشاء حوالة' },
  'transfer_approved':             { icon:'shield-check',  kind:'success', label:'تم اعتماد الحوالة' },
  'transfer_rejected':             { icon:'x-circle',      kind:'danger',  label:'تم رفض الحوالة' },
  'transfer_paid':                 { icon:'check-circle',  kind:'success', label:'تم تنفيذ التحويل' },
  'receipt_uploaded':              { icon:'receipt',       kind:'success', label:'تم رفع إيصال البنك' },
  'ad_proof_uploaded':             { icon:'image',         kind:'success', label:'تم رفع إثبات الإعلان' },
  'campaign_completed':            { icon:'flag-finish',   kind:'success', label:'تم إقفال الحملة' },
  'completed':                     { icon:'flag-finish',   kind:'success', label:'تم إقفال الحملة' }
};

/** Consolidated timeline for a campaign — used by EVERY page.
 *  opts: { limit, order:'asc'|'desc', commentsOnly, excludeComments, includeNominationSummary } */
campaign_timeline.unified = function(campaignId, opts){
  opts = opts || {};
  const noise = campaign_timeline.NOISE_ACTIONS;
  let items = campaign_timeline.list()
    .filter(t => t.campaign_id === campaignId && noise.indexOf(t.action) === -1);
  if(opts.includeNominationSummary !== false){
    try {
      const s = campaign_nominations_api.nominationSummary(campaignId);
      if(s && s.count > 0){
        items.push({
          id: 'nomsum-' + campaignId,
          action: 'nomination_summary',
          actor: (s.employees || []).join('، ') || 'النظام',
          timestamp: s.firstAt || new Date().toISOString(),
          payload: { __summary: s }
        });
      }
    } catch(e){}
  }
  // ONE consolidated client-review entry (instead of one per influencer)
  try {
    const cs = campaign_nominations_api.clientDecisionSummary(campaignId);
    if(cs && cs.count > 0){
      items.push({
        id: 'clientsum-' + campaignId,
        action: 'client_decision_summary',
        actor: 'العميل',
        timestamp: cs.lastAt || cs.firstAt || new Date().toISOString(),
        payload: { __clientSummary: cs }
      });
    }
  } catch(e){}
  if(opts.commentsOnly)   items = items.filter(t => t.action === 'approval_comment');
  if(opts.excludeComments) items = items.filter(t => t.action !== 'approval_comment');
  const dir = opts.order === 'asc' ? -1 : 1;
  items.sort((a,b) => dir * (new Date(b.timestamp) - new Date(a.timestamp)));
  if(opts.limit) items = items.slice(0, opts.limit);
  return items;
};

/** Only the human conversation (comments) — consistent everywhere */
campaign_timeline.conversation = function(campaignId){
  return campaign_timeline.list()
    .filter(t => t.campaign_id === campaignId && t.action === 'approval_comment'
                 && !String((t.payload && t.payload.text) || '').startsWith('💰'))
    .sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
};

/** Describe a single entry → { icon, kind, label, desc } (desc may contain HTML) */
campaign_timeline.describe = function(t){
  const esc = (window.SC && window.SC.h && window.SC.h.escape) ? window.SC.h.escape : (s => String(s==null?'':s));
  const meta = campaign_timeline.META[t.action] || { icon:'refresh', kind:'neutral', label:'حدث بالنظام' };
  const p = t.payload || {};
  let desc = '';
  if(t.action === 'nomination_summary' && p.__summary){
    const s = p.__summary;
    const emps = (s.employees && s.employees.length) ? s.employees.map(e=>esc(e)).join('، ') : '—';
    desc = 'الموظف المنفّذ: <b>'+emps+'</b> · عدد المشاهير: <b>'+s.count+'</b>'
         + '<br>نتائج الاعتماد: <span style="color:#16a34a;font-weight:700">'+s.accepted+' مقبول</span>'
         + ' · <span style="color:#dc2626;font-weight:700">'+s.rejected+' مرفوض</span>'
         + ' · <span style="color:#64748b;font-weight:700">'+s.pending+' معلّق</span>';
  } else if(t.action === 'client_decision_summary' && p.__clientSummary){
    const s = p.__clientSummary;
    desc = 'راجع العميل <b>'+s.count+'</b> من <b>'+s.total+'</b> مشهور'
         + '<br>القرار: <span style="color:#16a34a;font-weight:700">'+s.approved+' مقبول</span>'
         + ' · <span style="color:#dc2626;font-weight:700">'+s.rejected+' مرفوض</span>'
         + ' · <span style="color:#d97706;font-weight:700">'+s.pending+' معلّق</span>';
  } else if(t.action === 'nominations_bulk_decision'){
    const dl = p.decision==='approved'?'اعتماد جماعي':p.decision==='rejected'?'رفض جماعي':'تعليق جماعي';
    desc = dl+' لـ <b>'+(p.count||0)+'</b> ترشيح'+(p.comment?' — '+esc(String(p.comment).slice(0,100)):'');
  } else if(t.action === 'submitted_for_internal_review'){
    desc = 'عدد المشاهير: <b>'+(p.count||0)+'</b>'+(p.comment?' — '+esc(String(p.comment).slice(0,100)):'');
  } else if(t.action === 'status_change'){
    const L = CAMPAIGN_STATE_LABELS || {};
    desc = esc(L[p.from]||p.from||'')+' ← '+esc(L[p.to]||p.to||'');
  } else if(t.action === 'approval_price_edit'){
    desc = esc(String(p.text||'').replace(/^💰\s*/,'').slice(0,120));
  } else if(p && typeof p === 'object'){
    desc = p.text ? esc(String(p.text).slice(0,120))
         : p.influencer_name ? 'للمؤثر: '+esc(p.influencer_name)
         : p.reason ? 'السبب: '+esc(p.reason)
         : p.amount ? 'المبلغ: '+esc(String(p.amount))+' ر.س' : '';
  }
  return { icon: meta.icon, kind: meta.kind, label: meta.label, desc: desc };
};
const calendar_events_api = {
  TYPES: ['campaign_ad_booking', 'influencer_available_slot', 'meeting', 'personal_event', 'task_due', 'finance_due', 'client_payment_due'],
  
  /** List events; filter by current user for personal_event */
  list(filters){
    filters = filters || {};
    const currentUserId = window.SC?.auth?.getSession?.()?.id;
    const currentUserName = window.SC?.auth?.getSession?.()?.name;
    const isAdmin = window.SC?.auth?.canDoAction?.('*') || (window.SC?.auth?.getSession?.()?.role === 'admin') || false;
    
    let events = calendar_events.list();
    
    // Personal events: only owner + admin can see
    events = events.filter(e => {
      if(e.type !== 'personal_event') return true;
      if(isAdmin) return true;
      return e.owner_id === currentUserId || e.owner_name === currentUserName;
    });
    
    if(filters.type)         events = events.filter(e => e.type === filters.type);
    if(filters.campaign_id)  events = events.filter(e => e.campaign_id === filters.campaign_id);
    if(filters.influencer_id)events = events.filter(e => e.influencer_id === filters.influencer_id);
    if(filters.owner_id)     events = events.filter(e => e.owner_id === filters.owner_id);
    if(filters.from)         events = events.filter(e => new Date(e.date) >= new Date(filters.from));
    if(filters.to)           events = events.filter(e => new Date(e.date) <= new Date(filters.to));
    
    return events.sort((a,b) => new Date(a.date) - new Date(b.date));
  },
  
  create(payload){
    if(!payload.type || !this.TYPES.includes(payload.type)) throw new Error('نوع الحدث غير صالح');
    if(!payload.date) throw new Error('التاريخ مطلوب');
    
    const currentUser = window.SC?.auth?.getSession?.();
    const event = calendar_events.create(Object.assign({
      type: payload.type,
      title: payload.title || '',
      description: payload.description || '',
      date: payload.date,
      time: payload.time || null,
      duration_minutes: payload.duration_minutes || 60,
      
      // Relationships
      campaign_id: payload.campaign_id || null,
      influencer_id: payload.influencer_id || null,
      nomination_id: payload.nomination_id || null,
      transfer_id: payload.transfer_id || null,
      task_id: payload.task_id || null,
      
      // Ownership
      owner_id: payload.owner_id || currentUser?.id || null,
      owner_name: payload.owner_name || currentUser?.name || '',
      
      // Status
      confirmed: payload.confirmed !== undefined ? payload.confirmed : true,
      cancelled: false,
      notes: payload.notes || '',
      
      created_at: new Date().toISOString()
    }, payload));
    
    return event;
  },
  
  update(eventId, payload){
    return calendar_events.update(eventId, payload);
  },
  
  remove(eventId){
    return calendar_events.remove(eventId);
  },
  
  /** Check if an influencer has a conflict on a given date */
  checkConflict(influencerId, date, time){
    if(!influencerId || !date) return { hasConflict: false, conflicts: [], reason: '', alternatives: [] };
    const targetDate = String(date).slice(0, 10);
    
    const conflicts = calendar_events.list().filter(e => 
      e.influencer_id === influencerId &&
      e.type === 'campaign_ad_booking' &&
      !e.cancelled &&
      String(e.date).slice(0, 10) === targetDate
    );
    
    const hasConflict = conflicts.length > 0;
    let reason = '';
    let alternatives = [];
    
    if(hasConflict){
      const inf = influencers.get(influencerId);
      const campNames = conflicts.map(c => {
        const camp = c.campaign_id ? campaigns.get(c.campaign_id) : null;
        return camp?.campaign_name || c.title || 'حملة';
      });
      reason = `${inf?.name || 'المؤثر'} محجوز في ${targetDate} ضمن: ${campNames.join('، ')}`;
      alternatives = this.suggestAlternatives(influencerId, targetDate);
    }
    
    return {
      hasConflict,
      reason,
      alternatives,
      conflicts: conflicts.map(c => ({
        event_id: c.id,
        campaign_id: c.campaign_id,
        campaign_name: c.campaign_id ? (campaigns.get(c.campaign_id)?.campaign_name || c.title) : c.title,
        date: c.date,
        time: c.time,
        confirmed: c.confirmed
      }))
    };
  },
  
  /** Suggest 3 alternative dates near the requested date */
  suggestAlternatives(influencerId, date){
    if(!date) return [];
    const base = new Date(date);
    const suggestions = [];
    
    for(let i = 1; i <= 14 && suggestions.length < 3; i++){
      // Try +i days
      const d1 = new Date(base); d1.setDate(d1.getDate() + i);
      const c1 = this.checkConflict(influencerId, d1.toISOString().slice(0,10));
      if(!c1.hasConflict) suggestions.push(d1.toISOString().slice(0,10));
      if(suggestions.length >= 3) break;
      
      // Try -i days (must be future)
      const d2 = new Date(base); d2.setDate(d2.getDate() - i);
      if(d2 < new Date()) continue;
      const c2 = this.checkConflict(influencerId, d2.toISOString().slice(0,10));
      if(!c2.hasConflict) suggestions.push(d2.toISOString().slice(0,10));
    }
    
    return suggestions;
  }
};

/* ─── CAMPAIGN TASKS API ──────────────────────────────────────────── */
const campaign_tasks_api = {
  list(campaignId){
    return campaign_tasks.list()
      .filter(t => !campaignId || t.campaign_id === campaignId)
      .sort((a,b) => new Date(a.due_date || 0) - new Date(b.due_date || 0));
  },
  
  create(campaignId, payload){
    const currentUser = window.SC?.auth?.getSession?.();
    const task = campaign_tasks.create({
      campaign_id: campaignId,
      title: payload.title || '',
      description: payload.description || '',
      start_date: payload.start_date || null,
      start_time: payload.start_time || null,
      due_date: payload.due_date || null,
      due_time: payload.due_time || null,
      assignee_id: payload.assignee_id || null,
      assignee_name: payload.assignee_name || '',
      status: payload.status || 'pending',
      priority: payload.priority || 'medium',
      workflow_step: payload.workflow_step || null,
      notes: payload.notes || '',
      attachments: payload.attachments || [],
      completed_at: null,
      completed_by: null,
      created_by: currentUser?.name || '',
      created_by_id: currentUser?.id || null,
      created_at: new Date().toISOString()
    });
    
    logTimeline(campaignId, 'task_created', null, { task_id: task.id, title: task.title });
    
    // Auto-add to calendar if has due date
    if(task.due_date && task.assignee_id){
      calendar_events_api.create({
        type: 'task_due',
        campaign_id: campaignId,
        task_id: task.id,
        owner_id: task.assignee_id,
        owner_name: task.assignee_name,
        title: 'مهمة: ' + task.title,
        date: task.due_date,
        time: task.due_time
      });
    }
    return task;
  },
  
  update(taskId, payload){ return campaign_tasks.update(taskId, payload); },
  
  /* ════════════ AUTO-TASK ENGINE — tasks are a by-product of the workflow ════════════
     Tasks are created/updated/closed automatically from the campaign's current stage.
     Idempotent: each auto-task has a stable auto_key so re-running never duplicates. */
  
  /** Resolve a REAL responsible person from current data — never a bare role label.
      Every operation must land on an actual user so nothing relies on personal memory. */
  _resolveOwner(kind, ctx){
    ctx = ctx || {};
    let users = [];
    try { users = (window.SC?.auth?.getUsers?.()) || []; } catch(e){}
    const byRole = (...roles) => { const u = users.find(u => roles.indexOf(u.role) > -1); return u ? u.name : ''; };
    const exists = name => name && users.some(u => u.name === name);
    const adminName = byRole('admin') || (users[0] && users[0].name) || 'مدير النظام';
    if(kind === 'finance'){
      // محاسب → مدير حسابات → مدير عمليات → آدمن
      return byRole('accountant') || byRole('accounts_manager') || byRole('operations_manager') || adminName;
    }
    if(kind === 'influencer'){
      // الموظف المسجّل في بيانات المؤثر → منسّق مشاهير → منسّق الحملة → عمليات → آدمن
      if(exists(ctx.account_manager)) return ctx.account_manager;
      if(ctx.account_manager) return ctx.account_manager; // اسم خارج المستخدمين لكنه محدّد
      return (exists(ctx.coordinator) && ctx.coordinator) || byRole('influencer_coordinator') || byRole('campaign_coordinator') || byRole('operations_manager') || adminName;
    }
    // coordinator (التنسيق العام): منسّق الحملة → منسّق العميل → منسّق حملات → عمليات → آدمن
    if(exists(ctx.coordinator)) return ctx.coordinator;
    if(ctx.coordinator) return ctx.coordinator;
    if(exists(ctx.customer_coordinator)) return ctx.customer_coordinator;
    if(ctx.customer_coordinator) return ctx.customer_coordinator;
    return byRole('campaign_coordinator') || byRole('operations_manager') || adminName;
  },
  
  /** Compute the tasks that SHOULD exist right now, given the campaign state. */
  _expectedTasks(campaignId){
    const c = campaigns.get(campaignId);
    if(!c) return [];
    const noms = campaign_nominations.list().filter(n => n.campaign_id === campaignId);
    const trs  = transfers.list().filter(t => t.campaign_id === campaignId);
    const rawCoord = (Array.isArray(c.coordinator_names) ? c.coordinator_names[0] : c.coordinator_names) || c.assignee_name || c.leader_name || '';
    // customer's own coordinator (from customer data) as a fallback owner
    let custCoord = ''; try { const cu = customers.get(c.customer_id); custCoord = cu ? (cu.coordinator || '') : ''; } catch(e){}
    const coord = this._resolveOwner('coordinator', { coordinator: rawCoord, customer_coordinator: custCoord });
    const financeOwner = this._resolveOwner('finance', {});
    const cName = c.campaign_name || c.name || '';
    const custName = c.customer_name || '';
    const fmtD = d => { if(!d) return ''; const t=new Date(d); return isNaN(t)?'':t.toISOString().slice(0,10); };
    const plusDays = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
    const out = [];
    const clientDecided = noms.some(n => n.client_decision === 'approved' || n.client_decision === 'rejected') ||
      ['client_approved','client_partially_approved','booking','transfers','ads_published','completed'].indexOf(c.status) > -1;
    
    // 1) بدء الترشيح → مهمة ترشيح/اعتماد داخلي + إرسال للعميل
    if(noms.length > 0 && !clientDecided){
      out.push({ key:'nomination', stage:'الترشيح', who: coord, due: plusDays(2), priority:'high',
        title:'متابعة الترشيحات واعتمادها داخلياً وإرسالها للعميل',
        details:'الحملة: '+cName+(custName?' · العميل: '+custName:'')+'\nالمطلوب: مراجعة الترشيحات ('+noms.length+') واعتمادها داخلياً ثم إرسالها للعميل عبر النظام.' });
    }
    // 2) اعتماد العميل → لكل مؤثر معتمَد غير محجوز: مهمة حجز تُسند للموظف المسؤول المسجّل في بيانات المؤثر
    noms.filter(n => n.client_decision === 'approved').forEach(n => {
      const booked = n.influencer_decision === 'approved' || n.status === 'booking_manually_confirmed';
      if(!booked){
        const inf = influencers.get(n.influencer_id) || {};
        const owner = this._resolveOwner('influencer', { account_manager: inf.account_manager, coordinator: coord });
        const platforms = (n.platforms||[]).map(p=>typeof p==='string'?p:(p.platform_name||p.name||'')).filter(Boolean).join('، ');
        const bdate = fmtD(n.booking_date || n.client_suggested_date);
        // booking link is embedded INSIDE the task (no manual copy/paste) so the action stays tracked
        let bookingLink = ''; try { bookingLink = influencer_booking_api.createLink(n.id).url; } catch(e){}
        out.push({ key:'booking:'+n.id, stage:'الحجز والتنسيق', who:owner, influencer_id:n.influencer_id, due: bdate || plusDays(1), priority:'high', notify:true,
          title:'حجز وتنسيق المؤثر '+(n.influencer_name||'')+' — '+cName,
          details:'أنت المسؤول عن التواصل والتنسيق والمتابعة مع هذا المؤثر أو إدارة أعماله.\n'
            +'• الحملة: '+cName+(custName?' · العميل: '+custName:'')+'\n'
            +'• المؤثر: '+(n.influencer_name||'')+(platforms?' · المنصات: '+platforms:'')+'\n'
            +(bdate?'• التاريخ المطلوب: '+bdate+'\n':'')
            +(n.selling_price!=null?'• القيمة: '+Number(n.selling_price).toLocaleString('en-US')+' ر.س\n':'')
            +(n.notes_for_influencer?'• تعليمات العميل: '+n.notes_for_influencer+'\n':'')
            +'• نفّذ التأكيد داخل النظام وحدّث حالة الحجز — تُوثَّق كل خطوة في السجل الزمني.'
            +(bookingLink?'\n• رابط تأكيد الحجز (داخل النظام): '+bookingLink:'') });
      }
    });
    // 3) تأكيد الحجز → مهمة متابعة النشر
    noms.filter(n => (n.influencer_decision === 'approved' || n.status === 'booking_manually_confirmed') && !n.ad_completed).forEach(n => {
      const inf = influencers.get(n.influencer_id) || {};
      const owner = this._resolveOwner('influencer', { account_manager: inf.account_manager, coordinator: coord });
      out.push({ key:'publish:'+n.id, stage:'النشر والإثبات', who:owner, influencer_id:n.influencer_id, due: plusDays(3), priority:'medium', notify:true,
        title:'متابعة نشر إعلان '+(n.influencer_name||'')+' ورفع الإثبات — '+cName,
        details:'تابع نشر الإعلان مع المؤثر وارفع إثبات النشر داخل النظام.\n• الحملة: '+cName+'\n• المؤثر: '+(n.influencer_name||'') });
    });
    // 4) انتظار التحويل → مهمة مطابقة مالية وتنفيذ (المالية)
    trs.filter(t => t.workflow_stage !== 'complete' && t.status !== 'completed').forEach(t => {
      out.push({ key:'transfer:'+t.id, stage:'المطابقة المالية', who:financeOwner, influencer_id:t.influencer_id, due: plusDays(2), priority:'high', notify:true,
        title:'المطابقة المالية وتنفيذ تحويل '+(t.influencer_name||t.recipient_name||'')+' — '+cName,
        details:'طابِق المستندات ونفّذ التحويل البنكي وارفع الإيصال.\n• الحملة: '+cName+'\n• المبلغ: '+(Number(t.amount_total)||0).toLocaleString('en-US')+' ر.س' });
    });
    // 5) تعثّر/نقص → مهمة معالجة
    try {
      const g = campaign_workflow.canProceedToBooking(campaignId);
      if(g && !g.ok && g.missing && g.missing.length && noms.some(n=>n.client_decision==='approved')){
        out.push({ key:'block', stage:'معالجة التعثر', who: coord, due: plusDays(1), priority:'high', notify:true,
          title:'معالجة نواقص الحملة '+cName+': '+g.missing.join(' · '),
          details:'النواقص الحالية:\n• '+g.missing.join('\n• ') });
      }
    } catch(e){}
    return out;
  },
  
  /** Auto-tasks for a campaign, read from the unified task store. */
  autoTasksFor(campaignId){
    return data.get('tasks', []).filter(t => t.auto && (t.campaign_id === campaignId || (t.related_type==='campaign' && t.related_to===campaignId)));
  },
  
  /** Reconcile actual auto-tasks to match the expected set (create new, close passed).
      Writes into the UNIFIED tasks store so they appear on the dashboard, notify the
      assignee (system + dashboard + email), and count toward employee KPIs. */
  autoSync(campaignId){
    if(!campaignId) return;
    let expected; try { expected = this._expectedTasks(campaignId); } catch(e){ return; }
    const c = campaigns.get(campaignId) || {};
    const cName = c.campaign_name || c.name || '';
    const expectedByKey = {}; expected.forEach(e => expectedByKey[e.key] = e);
    const existing = this.autoTasksFor(campaignId);
    const existingByKey = {}; existing.forEach(t => existingByKey[t.auto_key] = t);
    // create missing → tasks.create fires notification + email + dashboard + KPI
    expected.forEach(e => {
      if(!existingByKey[e.key]){
        const task = tasks.create({
          title: e.title, description: e.details || (e.who ? ('المسؤول: '+e.who) : ''),
          assigned_by: 'النظام (تلقائي)', assigned_by_id: 'system',
          assigned_to: e.who || '',
          related_type: 'campaign', related_to: campaignId, related_name: cName,
          campaign_id: campaignId, influencer_id: e.influencer_id || null,
          workflow_step: e.stage, priority: e.priority || 'medium',
          due_date: e.due || null, status: 'pending',
          auto: true, auto_key: e.key
        });
        try { logTimeline(campaignId, 'task_created', 'النظام', { task_id: task.id, title: task.title, auto: true, assignee: e.who }); } catch(e2){}
      } else {
        const t = existingByKey[e.key];
        if(t.status !== 'done' && t.title !== e.title) tasks.update(t.id, { title: e.title, description: e.details || t.description });
      }
    });
    // auto-close tasks whose stage has passed
    existing.forEach(t => {
      if(t.status !== 'done' && !expectedByKey[t.auto_key]){
        tasks.update(t.id, { status:'done', completed_at:new Date().toISOString(), completed_by:'النظام (تلقائي)', auto_closed:true });
        try { logTimeline(campaignId, 'task_completed', 'النظام', { task_id: t.id, title: t.title, auto: true }); } catch(e2){}
      }
    });
    return this.autoTasksFor(campaignId);
  },
  
  complete(taskId, payload){
    const t = campaign_tasks.get(taskId);
    if(!t) throw new Error('المهمة غير موجودة');
    const currentUser = window.SC?.auth?.getSession?.();
    campaign_tasks.update(taskId, {
      status: 'done',
      completed_at: new Date().toISOString(),
      completed_by: currentUser?.name || '',
      completed_notes: payload?.notes || ''
    });
    logTimeline(t.campaign_id, 'task_completed', null, { task_id: taskId, title: t.title });
    return campaign_tasks.get(taskId);
  }
};

/* ─── PUBLIC TOKENS (Client Approval + Influencer Booking) ────────── */
function generateToken(){
  return 'tkn_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* رمز قصير لروابط المشاركة العامة (مثل: 4tb-z1tn) — بلا أحرف ملتبسة */
function generateShortCode(){
  const A = 'abcdefghjkmnpqrstuvwxyz23456789'; // بلا 0/1/i/l/o لتفادي اللبس
  const pick = n => Array.from({length:n}, () => A[Math.floor(Math.random()*A.length)]).join('');
  return pick(4) + '-' + pick(4);
}

const client_approval_api = {
  /** Create a secure public link for a client to review nominations */
  createLink(campaignId){
    const c = campaigns.get(campaignId);
    if(!c) throw new Error('الحملة غير موجودة');
    // البوابة: لا يُنشأ رابط العميل ما لم يكتمل الاعتماد الداخلي (لا معلّق ولا بانتظار قرار)
    const st = campaign_nominations_api.approvalState(campaignId);
    if(!st.internalFullyApproved){
      if(st.internal.held > 0) throw new Error('يوجد ترشيحات معلّقة — لا يمكن إرسال القائمة للعميل قبل البتّ فيها');
      if(st.internal.pending > 0) throw new Error('يوجد ترشيحات بانتظار القرار — أكمل الاعتماد الداخلي أولاً');
      throw new Error('لا يوجد ترشيحات معتمدة داخلياً لإرسالها للعميل');
    }
    
    // Reuse existing token if already created
    if(c.client_approval_token) return { token: c.client_approval_token, url: `client-approval.html?token=${c.client_approval_token}` };
    
    const token = generateToken();
    approval_tokens.create({
      token: token,
      type: 'client_approval',
      campaign_id: campaignId,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });
    
    campaigns.update(campaignId, { 
      client_approval_token: token,
      client_approval_link_sent_at: new Date().toISOString(),
      status: 'pending_client_approval'
    });
    
    logTimeline(campaignId, 'client_approval_link_created', null, { token });
    return { token, url: `client-approval.html?token=${token}` };
  },
  
  getByToken(token){
    const t = approval_tokens.list().find(x => x.token === token && x.type === 'client_approval');
    if(!t) return null;
    if(t.expires_at && new Date(t.expires_at) < new Date()) return null;
    
    const c = campaigns.get(t.campaign_id);
    if(!c) return null;
    const customer = c.customer_id ? customers.get(c.customer_id) : null;
    
    // Show only internally-approved nominations to client (persistent decision, survives status advancement)
    const noms = campaign_nominations.list()
      .filter(n => n.campaign_id === t.campaign_id && n.internal_approved_at && !n.internal_rejected_at && !n.internal_held_at)
      .map(n => {
        const inf = influencers.get(n.influencer_id);
        // Auto-fetch influencer social account links from the data (platforms[].url)
        const socialLinks = (inf && Array.isArray(inf.platforms) ? inf.platforms : [])
          .filter(p => p && p.url)
          .map(p => ({ platform: p.platform_name || '', url: p.url }));
        return {
          id: n.id,
          influencer_name: n.influencer_name,
          platforms: n.platforms,
          social_links: socialLinks,
          ad_type: n.ad_type || c.type || c.ad_type || '',
          ads_count: n.ads_count || c.ads_count || c.ads || 1,
          selling_price: n.selling_price,  // Only sell price (price for client)
          client_decision: n.client_decision,
          client_notes: n.client_notes,
          client_suggested_date: n.client_suggested_date || n.booking_date || null,
          avatar: inf?.avatar || null
        };
      });
    
    return {
      campaign: {
        id: c.id,
        campaign_name: c.campaign_name || c.name,
        social_networks: c.social_networks,
        ads_count: c.ads_count || c.ads || null,
        budget: Number(c.budget_max || c.budget || c.budget_min || 0) || 0,
        suggested_from: c.client_suggested_from || c.start_date || null,
        suggested_to: c.client_suggested_to || c.end_date || null,
        general_notes: c.client_general_notes || '',
        created_at: c.created_at
      },
      customer: customer ? { name: customer.name, contact: customer.phone } : { name: c.customer_name },
      nominations: noms,
      status: c.status,
      already_decided: noms.every(n => n.client_decision === 'approved' || n.client_decision === 'rejected')
    };
  },
  
  /** Submit client's final decisions (one or many). Each decision may carry a date.
   *  meta = { from, to, general_notes } stores the client's suggested window + campaign-wide notes. */
  submitDecision(token, decisions, meta){
    const t = approval_tokens.list().find(x => x.token === token && x.type === 'client_approval');
    if(!t) throw new Error('رابط غير صالح');
    if(t.expires_at && new Date(t.expires_at) < new Date()) throw new Error('انتهت صلاحية الرابط');
    
    meta = meta || {};
    const campPatch = {};
    if(meta.from || meta.to){ campPatch.client_suggested_from = meta.from || null; campPatch.client_suggested_to = meta.to || null; }
    if(meta.general_notes !== undefined){ campPatch.client_general_notes = meta.general_notes || ''; }
    if(Object.keys(campPatch).length) campaigns.update(t.campaign_id, campPatch);
    
    (decisions || []).forEach(d => {
      campaign_nominations_api.clientDecision(d.nomination_id, d.decision, d.notes, { date: d.date || null });
    });
    
    // Mark token as used after processing (audit trail)
    approval_tokens.update(t.id, {
      used_at: new Date().toISOString(),
      use_count: (t.use_count || 0) + 1,
      last_decision_count: (decisions || []).length
    });
    
    return { success: true };
  }
};

const influencer_booking_api = {
  /** Create a secure booking link for an influencer */
  createLink(nominationId){
    const nom = campaign_nominations.get(nominationId);
    if(!nom) throw new Error('الترشيح غير موجود');
    
    if(nom.booking_token) return { token: nom.booking_token, url: `p/${nom.booking_token}`, legacyUrl: `influencer-booking.html?token=${nom.booking_token}` };
    
    const token = generateShortCode();
    approval_tokens.create({
      token: token,
      type: 'influencer_booking',
      campaign_id: nom.campaign_id,
      nomination_id: nominationId,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    campaign_nominations.update(nominationId, {
      booking_token: token,
      booking_sent_at: new Date().toISOString(),
      status: 'booking_sent'
    });
    
    logTimeline(nom.campaign_id, 'booking_link_sent', null, { 
      nomination_id: nominationId, influencer_name: nom.influencer_name 
    });
    
    return { token, url: `p/${token}`, legacyUrl: `influencer-booking.html?token=${token}` };
  },
  
  getByToken(token){
    const t = approval_tokens.list().find(x => x.token === token && x.type === 'influencer_booking');
    if(!t) return null;
    if(t.expires_at && new Date(t.expires_at) < new Date()) return null;
    
    const nom = campaign_nominations.get(t.nomination_id);
    if(!nom) return null;
    const c = campaigns.get(nom.campaign_id);
    if(!c) return null;
    const cust = c.customer_id ? customers.get(c.customer_id) : null;
    
    return {
      nomination_id: nom.id,
      influencer_name: nom.influencer_name,
      campaign_name: c.campaign_name || c.name,
      customer_name: (cust && cust.name) || c.customer_name || '',
      platforms: nom.platforms,
      // ad_type reflects EXACTLY what was chosen at nomination (منزلي/تغطية), then falls back
      ad_type: nom.ad_type || c.type || c.ad_type || (Array.isArray(nom.platforms) && nom.platforms.length ? nom.platforms.join('، ') : 'إعلان'),
      ads_count: nom.ads_count || c.ads_count || c.ads || 1,
      fee: (nom.cost_price != null ? Number(nom.cost_price) : null),  // what the influencer is paid
      is_ugc: !!nom.is_ugc,
      proposed_date: nom.booking_date,
      proposed_time: nom.booking_time,
      // The proposed date came directly from the client's approval when client_suggested_date is set
      date_from_client: !!nom.client_suggested_date,
      notes_for_influencer: c.notes_for_influencer || nom.notes_for_influencer || '',
      attachments: (Array.isArray(nom.attachments) && nom.attachments.length ? nom.attachments : (c.attachments || [])) || [],
      // ── Client-approved details shown to the influencer ──
      client_decision: nom.client_decision || null,
      client_notes: nom.client_notes || '',
      campaign: {
        name: c.campaign_name || c.name,
        type: c.type || c.ad_type || '',
        social_networks: c.social_networks || '',
        duration_days: c.duration_days || null,
        suggested_from: c.client_suggested_from || c.start_date || null,
        suggested_to: c.client_suggested_to || c.end_date || null
      },
      already_decided: !!nom.influencer_decision,
      decision: nom.influencer_decision
    };
  },
  
  submitDecision(token, payload){
    const t = approval_tokens.list().find(x => x.token === token && x.type === 'influencer_booking');
    if(!t) throw new Error('رابط غير صالح');
    if(t.expires_at && new Date(t.expires_at) < new Date()) throw new Error('انتهت صلاحية الرابط');
    
    const result = campaign_nominations_api.influencerDecision(t.nomination_id, payload.decision, payload);
    
    // Mark token as used (audit trail)
    approval_tokens.update(t.id, {
      used_at: new Date().toISOString(),
      use_count: (t.use_count || 0) + 1,
      decision: payload.decision
    });
    
    return result;
  }
};

/* ─── CAMPAIGN FINANCE (transfer requests from inside a campaign) ─── */
const campaign_finance_api = {
  /** INCOMING client documents (quotations · receipts · invoices) across all campaigns.
      Replaces the WhatsApp matching/billing groups — everything lives in the system. */
  incomingReceipts(filter){
    filter = filter || {};
    let docs = campaign_documents.list().filter(d => ['quotation','receipt','invoice'].indexOf(d.type) > -1);
    if(filter.customer_id) docs = docs.filter(d => d.customer_id === filter.customer_id);
    if(filter.campaign_id) docs = docs.filter(d => d.campaign_id === filter.campaign_id);
    if(filter.type)        docs = docs.filter(d => d.type === filter.type);
    if(filter.match_status)   docs = docs.filter(d => (d.match_status||'pending') === filter.match_status);
    if(filter.billing_status) docs = docs.filter(d => (d.billing_status||'unbilled') === filter.billing_status);
    return docs.sort((a,b) => new Date(b.issued_at||b.created_at||0) - new Date(a.issued_at||a.created_at||0));
  },
  /** Summary counters for the incoming-receipts dashboard */
  incomingSummary(){
    const docs = this.incomingReceipts();
    const receipts = docs.filter(d => d.type === 'receipt');
    const invoices = docs.filter(d => d.type === 'invoice');
    return {
      total: docs.length,
      receipts: receipts.length,
      invoices: invoices.length,
      collected: receipts.reduce((s,d)=>s+(Number(d.amount)||0),0),
      unmatched: docs.filter(d => (d.match_status||'pending') !== 'matched').length,
      unbilled: receipts.filter(d => (d.billing_status||'unbilled') !== 'billed').length
    };
  },
  /** Mark a client document as matched / billed (logged to the unified timeline) */
  setDocStatus(docId, patch){
    const before = campaign_documents.get(docId);
    const res = campaign_documents.update(docId, patch || {});
    try {
      const d = res || before;
      if(d && d.campaign_id){
        if(patch && patch.match_status && (!before || before.match_status !== patch.match_status)){
          logTimeline(d.campaign_id, patch.match_status === 'matched' ? 'financial_matched' : 'financial_unmatched', null, { doc_id: docId, type: d.type, amount: d.amount || null });
        }
        if(patch && patch.billing_status && (!before || before.billing_status !== patch.billing_status)){
          logTimeline(d.campaign_id, patch.billing_status === 'billed' ? 'financial_billed' : 'financial_unbilled', null, { doc_id: docId, type: d.type, amount: d.amount || null });
        }
      }
    } catch(e){}
    return res;
  },
  
  /** UNIFIED FINANCIAL TIMELINE — single source (campaign_timeline), filterable by party.
      filter: { campaign_id, customer_id, influencer_id, ugc:true|false, limit } */
  financialTimeline(filter){
    filter = filter || {};
    const FIN = {
      quotation_issued:       { label:'إنشاء عرض السعر',        icon:'file-text',   kind:'in' },
      contract_attached:      { label:'رفع العقد',              icon:'file-text',   kind:'in' },
      document_uploaded:      { label:'رفع مستند',              icon:'file',   kind:'neutral' },
      client_payment_recorded:{ label:'رفع إيصال العميل / تحصيل', icon:'receipt',   kind:'in' },
      financial_matched:      { label:'مطابقة مالية',           icon:'check',kind:'in' },
      financial_unmatched:    { label:'إلغاء المطابقة',         icon:'x',    kind:'neutral' },
      financial_billed:       { label:'تعليم كمُفوتر',          icon:'receipt',     kind:'in' },
      financial_unbilled:     { label:'إلغاء الفوترة',          icon:'x',    kind:'neutral' },
      invoice_recorded:       { label:'إصدار الفاتورة الضريبية', icon:'receipt',    kind:'in' },
      transfer_request_created:{ label:'إنشاء حوالة مؤثر',      icon:'wallet',      kind:'out' },
      transfer_approved:      { label:'اعتماد الحوالة',          icon:'check',kind:'out' },
      transfer_rejected:      { label:'رفض الحوالة',            icon:'x',    kind:'out' },
      transfer_executed:      { label:'تنفيذ التحويل البنكي',    icon:'wallet',      kind:'out' },
      transfer_receipt_uploaded:{ label:'رفع إيصال الحوالة',    icon:'receipt',     kind:'out' },
      transfer_invoice_uploaded:{ label:'رفع فاتورة المؤثر',    icon:'receipt',     kind:'out' }
    };
    let items = campaign_timeline.list().filter(t => FIN[t.action]);
    // enrich + scope
    const campCache = {};
    const getCamp = id => { if(!(id in campCache)) campCache[id] = campaigns.get(id); return campCache[id]; };
    const out = [];
    items.forEach(t => {
      const c = getCamp(t.campaign_id) || {};
      const p = t.payload || {};
      // resolve influencer from payload (direct, or via transfer/nomination)
      let infId = p.influencer_id || null;
      if(!infId && p.transfer_id){ const tr = transfers.get(p.transfer_id); if(tr) infId = tr.influencer_id || null; }
      if(!infId && p.nomination_id){ const nm = campaign_nominations.get(p.nomination_id); if(nm) infId = nm.influencer_id || null; }
      const isUgc = !!(c.is_ugc || (p && p.is_ugc) || (String(c.type||'').toLowerCase().indexOf('ugc')>-1));
      if(filter.campaign_id && t.campaign_id !== filter.campaign_id) return;
      if(filter.customer_id && c.customer_id !== filter.customer_id) return;
      if(filter.influencer_id && infId !== filter.influencer_id) return;
      if(filter.ugc === true && !isUgc) return;
      if(filter.ugc === false && isUgc) return;
      const meta = FIN[t.action];
      out.push({
        id: t.id, action: t.action, label: meta.label, icon: meta.icon, kind: meta.kind,
        actor: t.actor || 'النظام', actor_id: t.actor_id || null,
        timestamp: t.timestamp,
        amount: (p.amount != null ? p.amount : null),
        notes: p.notes || '',
        campaign_id: t.campaign_id, campaign_name: c.campaign_name || '',
        customer_id: c.customer_id || null, customer_name: c.customer_name || '',
        influencer_id: infId,
        is_ugc: isUgc
      });
    });
    out.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    return filter.limit ? out.slice(0, filter.limit) : out;
  },
  
  /** OUTGOING payments to influencers/suppliers (the existing transfers, framed financially) */
  outgoingPayments(filter){
    filter = filter || {};
    let list = transfers.list({ direction: 'outgoing' });
    if(filter.campaign_id) list = list.filter(t => t.campaign_id === filter.campaign_id);
    if(filter.influencer_id) list = list.filter(t => t.influencer_id === filter.influencer_id);
    return list;
  },
  
  /** SINGLE SOURCE financial overview — collections in vs payments out, per the real cycle */
  financialOverview(){
    const docs = campaign_documents.list();
    const receipts = docs.filter(d => d.type === 'receipt');
    const invoices = docs.filter(d => d.type === 'invoice');
    const quotations = docs.filter(d => d.type === 'quotation');
    const out = transfers.list({ direction: 'outgoing' });
    const isComplete = t => (t.workflow_stage === 'complete' || t.status === 'completed');
    const camps = campaigns.list();
    // INCOMING (from clients)
    const collected = receipts.reduce((s,d)=>s+(Number(d.amount)||0),0);
    const invoiced  = invoices.reduce((s,d)=>s+(Number(d.amount)||0),0);
    const quoted    = quotations.reduce((s,d)=>s+(Number(d.amount)||0),0);
    // OUTSTANDING (deferred client payments not yet collected)
    const outstanding = camps.filter(c => c.client_payment_status === 'postponed')
      .reduce((s,c)=> s + (Number(c.quotation_amount)|| Number(c.budget) ||0), 0);
    // OUTGOING (to influencers/suppliers)
    const paidOut    = out.filter(isComplete).reduce((s,t)=>s+(Number(t.amount_total)||0),0);
    const pendingOut = out.filter(t=>!isComplete(t)).reduce((s,t)=>s+(Number(t.amount_total)||0),0);
    return {
      collected, invoiced, quoted, outstanding,
      paidOut, pendingOut,
      net: collected - paidOut,
      counts: {
        receipts: receipts.length, invoices: invoices.length, quotations: quotations.length,
        outTotal: out.length, outComplete: out.filter(isComplete).length,
        unmatched: receipts.filter(d => (d.match_status||'pending') !== 'matched').length,
        unbilled: receipts.filter(d => (d.billing_status||'unbilled') !== 'billed').length,
        deferred: camps.filter(c => c.client_payment_status === 'postponed').length
      }
    };
  },
  
  /* ════════ TWO REAL MONEY FLOWS (single source of truth) ════════ */
  
  /** INCOMING collection pipeline for ONE campaign:
      عرض السعر → اعتماد العميل → إيصال التحويل → المطابقة → الفاتورة الضريبية → إقفال التحصيل */
  collectionStatus(campaignId){
    const c = campaigns.get(campaignId);
    if(!c) return null;
    const docs = campaign_documents.list().filter(d => d.campaign_id === campaignId);
    const quotation = docs.find(d => d.type === 'quotation');
    const contract  = docs.find(d => d.type === 'contract');
    const receipt   = docs.filter(d => d.type === 'receipt').sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0))[0];
    const invoice   = docs.find(d => d.type === 'invoice');
    const noms = campaign_nominations.list().filter(n => n.campaign_id === campaignId);
    const clientApproved = noms.some(n => n.client_decision === 'approved') ||
      ['client_approved','client_partially_approved','quotation_issued','booking','transfers','ads_published','completed'].indexOf(c.status) > -1;
    const deferred = c.client_payment_status === 'postponed';
    const paid = c.client_payment_status === 'paid' || !!receipt;
    const matched = !!receipt && (receipt.match_status === 'matched');
    const billed  = !!receipt && (receipt.billing_status === 'billed');
    const steps = [
      { key:'quotation',      label:'عرض السعر',        done: !!quotation || !!c.quotation_skipped, who:'منسّق الحملة', amount: quotation?Number(quotation.amount)||0:0 },
      { key:'client_approval',label:'اعتماد العميل',     done: clientApproved,                       who:'العميل' },
      { key:'receipt',        label:'إيصال التحويل',      done: paid || deferred,                     who:'المالية', amount: receipt?Number(receipt.amount)||0:0, deferred },
      { key:'matching',       label:'المطابقة المالية',   done: matched,                              who:'المالية' },
      { key:'invoice',        label:'الفاتورة الضريبية',  done: !!invoice,                            who:'المالية', amount: invoice?Number(invoice.amount)||0:0 },
      { key:'closure',        label:'إقفال التحصيل',      done: billed || (paid && matched && !!invoice), who:'المالية' }
    ];
    const next = steps.find(s => !s.done) || null;
    const doneCount = steps.filter(s => s.done).length;
    return {
      campaign_id: campaignId, campaign_name: c.campaign_name || '',
      customer_id: c.customer_id, customer_name: c.customer_name || '',
      amount: Number(quotation?.amount) || Number(c.quotation_amount) || Number(c.budget) || 0,
      collected: receipt ? (Number(receipt.amount)||0) : 0,
      deferred, paid,
      steps, progress: Math.round(doneCount/steps.length*100),
      currentLabel: next ? (steps.filter(s=>s.done).slice(-1)[0]?.label || 'البداية') : 'مكتمل',
      nextKey: next?next.key:null, nextLabel: next?next.label:'تم الإقفال', responsible: next?next.who:'—',
      done: !next,
      documents: { quotation, contract, receipt, invoice }
    };
  },
  
  /** All campaigns in the INCOMING collection pipeline (have a quotation or a payment state) */
  collectionPipeline(filter){
    filter = filter || {};
    const self = this;
    let camps = campaigns.list().filter(c => {
      const docs = campaign_documents.list().filter(d => d.campaign_id === c.id);
      const hasFinancialActivity = c.quotation_amount || c.quotation_doc_id || c.client_payment_status ||
        docs.some(d => ['quotation','receipt','invoice','contract'].indexOf(d.type) > -1);
      return hasFinancialActivity;
    });
    if(filter.customer_id) camps = camps.filter(c => c.customer_id === filter.customer_id);
    return camps.map(c => self.collectionStatus(c.id)).filter(Boolean)
      .sort((a,b) => (a.done?1:0)-(b.done?1:0) || a.progress-b.progress);
  },
  
  /** OUTGOING payment pipeline status for ONE transfer:
      حجز المؤثر → اعتماد الحوالة → التحويل البنكي → إيصال التحويل → الفاتورة الضريبية → إقفال المدفوعات */
  paymentStatus(transfer){
    const t = (typeof transfer === 'string') ? transfers.get(transfer) : transfer;
    if(!t) return null;
    const stage = t.workflow_stage || 1;
    const approved = t.campaign_request_status === 'approved' || stage >= 2 || ['transferred','pending_invoice','completed'].indexOf(t.status) > -1;
    const transferred = stage >= 2 || ['transferred','pending_invoice','completed'].indexOf(t.status) > -1 || stage === 'complete';
    const hasReceipt = !!(t.attachments?.receipt?.uploaded) || (Array.isArray(t.attachments?.receipts) && t.attachments.receipts.length) || (Array.isArray(t.recipients) && t.recipients.some(r => r.receipt)) || t.receipt_uploaded;
    const hasInvoice = !!(t.attachments?.invoice?.uploaded) || t.invoice_uploaded || !!t.invoice_uploaded_by;
    const closed = t.status === 'completed' || stage === 'complete' || stage === 3;
    const steps = [
      { key:'booking',   label:'حجز المؤثر',         done: true,         who:'منسّق المؤثرين' },
      { key:'approval',  label:'اعتماد الحوالة',     done: !!approved,   who:'المدير' },
      { key:'transfer',  label:'التحويل البنكي',     done: !!transferred,who:'المالية' },
      { key:'receipt',   label:'إيصال التحويل',      done: !!hasReceipt, who:'المالية' },
      { key:'invoice',   label:'الفاتورة الضريبية',  done: !!hasInvoice, who:'المالية' },
      { key:'closure',   label:'إقفال المدفوعات',    done: !!closed,     who:'المالية' }
    ];
    const next = steps.find(s => !s.done) || null;
    const doneCount = steps.filter(s => s.done).length;
    return {
      transfer_id: t.id, campaign_id: t.campaign_id, campaign_name: t.campaign_name || '',
      influencer_id: t.influencer_id, influencer_name: t.influencer_name || t.recipient_name || '',
      amount: Number(t.amount_total) || 0,
      is_ugc: !!(t.source_type && String(t.source_type).startsWith('ugc')),
      steps, progress: Math.round(doneCount/steps.length*100),
      nextKey: next?next.key:null, nextLabel: next?next.label:'تم الإقفال', responsible: next?next.who:'—',
      done: !next
    };
  },
  
  /** All OUTGOING payments. opts.ugc: true=UGC only, false=exclude UGC, undefined=all */
  paymentsPipeline(opts){
    opts = opts || {};
    const self = this;
    let list = transfers.list({ direction: 'outgoing' });
    if(opts.ugc === true)  list = list.filter(t => t.source_type && String(t.source_type).startsWith('ugc'));
    if(opts.ugc === false) list = list.filter(t => !(t.source_type && String(t.source_type).startsWith('ugc')));
    if(opts.campaign_id)   list = list.filter(t => t.campaign_id === opts.campaign_id);
    return list.map(t => self.paymentStatus(t)).filter(Boolean)
      .sort((a,b) => (a.done?1:0)-(b.done?1:0) || a.progress-b.progress);
  },
  
  /** Complete FINANCIAL FILE of a campaign — everything in one place */
  campaignFinancialFile(campaignId){
    const c = campaigns.get(campaignId);
    if(!c) return null;
    const collection = this.collectionStatus(campaignId);
    const payments = this.paymentsPipeline({ campaign_id: campaignId });
    const docs = campaign_documents.list().filter(d => d.campaign_id === campaignId)
      .sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
    const paidOut = payments.filter(p=>p.done).reduce((s,p)=>s+p.amount,0);
    const pendingOut = payments.filter(p=>!p.done).reduce((s,p)=>s+p.amount,0);
    return {
      campaign_id: campaignId, campaign_name: c.campaign_name || '',
      customer_id: c.customer_id, customer_name: c.customer_name || '',
      budget: Number(c.budget) || 0,
      collection,
      collected: collection ? collection.collected : 0,
      payments, paidOut, pendingOut,
      net: (collection ? collection.collected : 0) - paidOut,
      documents: docs
    };
  },
  
  /** UGC platform finance — fully separate track (packages/pricing differ) */
  ugcFinance(){
    const pays = this.paymentsPipeline({ ugc: true });
    const paidOut = pays.filter(p=>p.done).reduce((s,p)=>s+p.amount,0);
    const pendingOut = pays.filter(p=>!p.done).reduce((s,p)=>s+p.amount,0);
    let ugcCamps = []; try { ugcCamps = ugc_campaigns.list(); } catch(e){ ugcCamps = []; }
    return {
      payments: pays, count: pays.length,
      paidOut, pendingOut,
      done: pays.filter(p=>p.done).length, pending: pays.filter(p=>!p.done).length,
      campaigns: ugcCamps.length
    };
  },
  
  /** Create a transfer request for an approved nomination */
  createTransferRequest(campaignId, nominationId){
    const nom = campaign_nominations.get(nominationId);
    if(!nom) throw new Error('الترشيح غير موجود');
    if(nom.client_decision !== 'approved') throw new Error('يجب اعتماد العميل أولاً');
    
    const inf = influencers.get(nom.influencer_id);
    if(!inf) throw new Error('المؤثر غير موجود');
    
    const transfer = transfers.create({
      direction: 'outgoing',
      source: 'campaign_workflow',   // ← Tag for analytics + finance filter
      campaign_id: campaignId,
      campaign_name: campaigns.get(campaignId)?.campaign_name || '',
      influencer_id: nom.influencer_id,
      influencer_name: nom.influencer_name,
      nomination_id: nominationId,
      
      // Use cost_price (what we pay influencer) — never sell price
      amount_total: Number(nom.cost_price) || 0,
      amount_net: Number(nom.cost_price) || 0,
      
      recipient_name: inf.name,
      recipient_iban: inf.iban || '',
      recipient_bank: inf.bank_name || '',
      
      workflow_stage: 1,  // Initial: pending bank transfer
      status: 'pending',
      campaign_request_status: 'pending_manager_review',
      
      assignee: window.SC?.auth?.getSession?.()?.name || '',
      created_at: new Date().toISOString()
    });
    
    campaign_nominations.update(nominationId, {
      transfer_id: transfer.id,
      transfer_request_status: 'pending_manager_review'
    });
    
    logTimeline(campaignId, 'transfer_request_created', null, { 
      nomination_id: nominationId, transfer_id: transfer.id, amount: transfer.amount_total 
    });
    try { campaign_tasks_api.autoSync(campaignId); } catch(e){}
    return transfer;
  },
  
  approveTransferRequest(transferId, approved){
    const t = transfers.get(transferId);
    if(!t) throw new Error('التحويل غير موجود');
    const now = new Date().toISOString();
    transfers.update(transferId, {
      campaign_request_status: approved ? 'approved' : 'rejected',
      manager_approved_by: window.SC?.auth?.getSession?.()?.name || '',
      manager_approved_at: now,
      approved_at: approved ? now : null,    // ← alias for analytics + other consumers
      approved_by: approved ? (window.SC?.auth?.getSession?.()?.name || '') : null
    });
    if(t.nomination_id){
      campaign_nominations.update(t.nomination_id, {
        transfer_request_status: approved ? 'approved' : 'rejected'
      });
    }
    if(t.campaign_id){
      logTimeline(t.campaign_id, approved ? 'transfer_approved' : 'transfer_rejected', null, { 
        transfer_id: transferId 
      });
      try { campaign_tasks_api.autoSync(t.campaign_id); } catch(e){}
    }
    return transfers.get(transferId);
  },
  
  /** Approve all pending transfer requests for a campaign at once */
  approveAllTransferRequests(campaignId){
    const myTransfers = transfers.list().filter(t => 
      t.campaign_id === campaignId && t.campaign_request_status === 'pending_manager_review'
    );
    myTransfers.forEach(t => this.approveTransferRequest(t.id, true));
    return { count: myTransfers.length };
  },
  
  getTransferStatus(campaignId){
    return transfers.list()
      .filter(t => t.campaign_id === campaignId)
      .map(t => ({
        id: t.id,
        influencer_name: t.influencer_name || t.recipient_name,
        amount: t.amount_total,
        iban: t.recipient_iban,
        bank: t.recipient_bank,
        workflow_stage: t.workflow_stage,
        campaign_request_status: t.campaign_request_status,
        bank_receipt_url: t.bank_receipt_url,
        invoice_url: t.invoice_url,
        completed_at: t.completed_at,
        status: t.status
      }));
  }
};

/* ─── CAMPAIGN CONTENT (auto-save published ad proof) ─────────────── */
const campaign_content_api = {
  /** Save ad proof — automatically creates content entry */
  saveProof(payload){
    if(!payload.nomination_id) throw new Error('الترشيح مطلوب');
    const nom = campaign_nominations.get(payload.nomination_id);
    if(!nom) throw new Error('الترشيح غير موجود');
    
    // Update nomination
    campaign_nominations.update(payload.nomination_id, {
      ad_completed: true,
      proof_url: payload.proof_url || '',
      drive_folder_url: payload.drive_folder_url || '',
      publish_url: payload.publish_url || '',
      platforms: payload.platform ? [payload.platform] : (nom.platforms || []),
      content_rating: payload.rating || nom.content_rating || '',
      content_file_data: payload.file_data || nom.content_file_data || '',
      content_file_name: payload.file_name || nom.content_file_name || '',
      content_file_type: payload.file_type || nom.content_file_type || '',
      content_file_size: payload.file_size || nom.content_file_size || 0,
      publish_date_actual: payload.publish_date_actual || new Date().toISOString(),
      publish_time_actual: payload.publish_time_actual || null,
      ad_status_label: payload.ad_status_label || 'تم النشر',
      ad_status_reason: payload.ad_status_reason || '',
      content_saved: true
    });
    
    // Auto-create content record
    const contentEntry = content.create({
      type: 'ad_proof',
      campaign_id: nom.campaign_id,
      customer_id: campaigns.get(nom.campaign_id)?.customer_id,
      customer_name: campaigns.get(nom.campaign_id)?.customer_name,
      influencer_id: nom.influencer_id,
      influencer_name: nom.influencer_name,
      platform: payload.platform || (Array.isArray(nom.platforms) ? nom.platforms.join(', ') : nom.platforms) || '',
      rating: payload.rating || '',
      publish_date: payload.publish_date_actual || new Date().toISOString(),
      drive_url: payload.drive_folder_url || '',
      proof_url: payload.proof_url || '',
      publish_url: payload.publish_url || '',
      file_data: payload.file_data || '',
      file_name: payload.file_name || '',
      file_type: payload.file_type || '',
      file_size: payload.file_size || 0,
      title: 'إعلان ' + nom.influencer_name + ' - ' + (campaigns.get(nom.campaign_id)?.campaign_name || ''),
      status: 'approved',
      source: 'campaign_auto_save',
      created_at: new Date().toISOString()
    });

    // Propagate content-quality rating to the influencer's numeric rating (feeds analytics & scoring)
    if(payload.rating){
      try {
        const RMAP = { 'ممتاز':5, 'جيد':4, 'مقبول':3 };
        const infId = nom.influencer_id;
        const rated = content.list().filter(c => c.influencer_id === infId && RMAP[c.rating]);
        if(rated.length){
          const avg = rated.reduce((s,c)=>s+RMAP[c.rating],0) / rated.length;
          const inf = influencers.get(infId);
          if(inf) influencers.update(infId, {
            rating: Math.round(avg*10)/10,
            content_rating_avg: Math.round(avg*10)/10,
            content_rated_count: rated.length
          });
        }
        // Propagate to CAMPAIGN statistics (content-quality average + distribution across the campaign)
        const campRated = content.list().filter(c => c.campaign_id === nom.campaign_id && RMAP[c.rating]);
        if(campRated.length){
          const cavg = campRated.reduce((s,c)=>s+RMAP[c.rating],0) / campRated.length;
          const dist = { 'ممتاز':0, 'جيد':0, 'مقبول':0 };
          campRated.forEach(c => { dist[c.rating] = (dist[c.rating]||0) + 1; });
          campaigns.update(nom.campaign_id, {
            content_rating_avg: Math.round(cavg*10)/10,
            content_rated_count: campRated.length,
            content_rating_dist: dist
          });
        }
      } catch(e){}
    }
    
    logTimeline(nom.campaign_id, 'ad_proof_uploaded', null, { 
      nomination_id: nom.id, influencer_name: nom.influencer_name, content_id: contentEntry.id 
    });
    
    return { nomination: campaign_nominations.get(payload.nomination_id), content: contentEntry };
  }
};

/* ═══════════════════════════════════════════════════════════════════
   ANALYTICS API — Real data only, never invent numbers
   All metrics computed from actual entities in the system
   ═══════════════════════════════════════════════════════════════════ */
const analytics_api = {
  /** Apply date-range filter to an array of items */
  _filterByDate(items, from, to, dateField){
    if(!from && !to) return items;
    const fromDate = from ? new Date(from).getTime() : 0;
    const toDate = to ? new Date(to).getTime() + 86400000 : Infinity;
    return items.filter(item => {
      const d = item[dateField || 'created_at'];
      if(!d) return false;
      const t = new Date(d).getTime();
      return t >= fromDate && t < toDate;
    });
  },
  
  /** 1. Operational Summary — top-level KPIs for executive view */
  getOperationalSummary(filters){
    const f = filters || {};
    let camps      = this._filterByDate(campaigns.list(), f.from, f.to, 'created_at');
    let noms       = this._filterByDate(campaign_nominations.list(), f.from, f.to, 'selected_at');
    let tfs        = this._filterByDate(transfers.list(), f.from, f.to, 'created_at');
    let events     = this._filterByDate(calendar_events.list(), f.from, f.to, 'date');
    let contents   = this._filterByDate(content.list(), f.from, f.to, 'created_at');
    let ctasks     = this._filterByDate(campaign_tasks.list(), f.from, f.to, 'created_at');
    
    // Optional employee filter
    if(f.employee){
      camps = camps.filter(c => c.leader_name === f.employee);
      noms = noms.filter(n => n.selected_by === f.employee);
      ctasks = ctasks.filter(t => t.assignee === f.employee);
    }
    
    return {
      // Campaign counts
      campaigns_total:                camps.length,
      campaigns_completed:            camps.filter(c => c.status === 'completed').length,
      campaigns_pending:              camps.filter(c => ['pending_internal_approval','pending_client_approval'].includes(c.status)).length,
      campaigns_in_nomination:        camps.filter(c => c.status === 'nomination_in_progress').length,
      campaigns_executing:            camps.filter(c => ['executing','in_progress','ads_in_progress','booking_in_progress','transfer_in_progress'].includes(c.status)).length,
      campaigns_cancelled:            camps.filter(c => c.status === 'cancelled').length,
      
      // Nomination counts (real)
      nominations_total:              noms.length,
      nominations_internal_approved:  noms.filter(n => n.status === 'internal_approved' || n.client_decision === 'approved').length,
      nominations_internal_rejected:  noms.filter(n => n.status === 'internal_rejected').length,
      nominations_client_approved:    noms.filter(n => n.client_decision === 'approved').length,
      nominations_client_rejected:    noms.filter(n => n.client_decision === 'rejected').length,
      
      // Client approval links
      client_approval_links_sent:     approval_tokens.list().filter(t => t.type === 'client_approval').length,
      client_approval_links_used:     approval_tokens.list().filter(t => t.type === 'client_approval' && t.used_at).length,
      
      // Influencer bookings (real)
      bookings_sent:                  approval_tokens.list().filter(t => t.type === 'influencer_booking').length,
      bookings_confirmed:             noms.filter(n => n.influencer_decision === 'approved').length,
      bookings_rescheduled:           noms.filter(n => n.influencer_decision === 'reschedule_requested' || n.alternative_date).length,
      
      // Calendar events (real)
      calendar_events_total:          events.length,
      ads_scheduled:                  events.filter(e => e.type === 'campaign_ad_booking').length,
      ads_published:                  noms.filter(n => n.ad_completed).length,
      
      // Content (real)
      content_saved_auto:             contents.filter(c => c.source === 'campaign_auto_save').length,
      content_total:                  contents.length,
      
      // Tasks (real)
      tasks_total:                    ctasks.length,
      tasks_completed:                ctasks.filter(t => t.status === 'completed' || t.status === 'done').length,
      tasks_overdue: (() => {
        const now = Date.now();
        return ctasks.filter(t => 
          t.due_date && new Date(t.due_date).getTime() < now && 
          t.status !== 'completed' && t.status !== 'done'
        ).length;
      })(),
      
      // Finance (real)
      transfers_total:                tfs.length,
      transfers_pending_review:       tfs.filter(t => t.workflow_stage === 1 && t.status === 'pending').length,
      transfers_approved:             tfs.filter(t => t.approved_at).length,
      transfers_paid_receipt:         tfs.filter(t => t.workflow_stage >= 2 && t.bank_receipt_url).length,
      transfers_invoice_pending:      tfs.filter(t => t.workflow_stage === 2).length,
      transfers_completed:            tfs.filter(t => t.workflow_stage === 'complete' || t.status === 'completed').length,
      transfers_invoice_received:     tfs.filter(t => t.invoice_url).length,
      
      // Client payments
      client_receipts_uploaded:       camps.filter(c => c.client_payment_receipt_url).length,
      campaigns_paid_cash:            camps.filter(c => c.client_payment_status === 'paid').length,
      campaigns_postponed_payment:    camps.filter(c => c.client_payment_status === 'postponed').length
    };
  },
  
  /** 2. Employee Effort Dashboard — real effort metrics per employee */
  getEmployeeEffort(filters){
    const f = filters || {};
    const allCampaigns = this._filterByDate(campaigns.list(), f.from, f.to, 'created_at');
    const allNoms      = this._filterByDate(campaign_nominations.list(), f.from, f.to, 'selected_at');
    const allTasks     = this._filterByDate(campaign_tasks.list(), f.from, f.to, 'created_at');
    const allEvents    = this._filterByDate(calendar_events.list(), f.from, f.to, 'date');
    const allTimeline  = this._filterByDate(campaign_timeline.list(), f.from, f.to, 'timestamp');
    const allTfs       = this._filterByDate(transfers.list(), f.from, f.to, 'created_at');
    
    // Build unique employees set from real data sources
    const employeeNames = new Set();
    allCampaigns.forEach(c => c.leader_name && employeeNames.add(c.leader_name));
    allNoms.forEach(n => n.selected_by && employeeNames.add(n.selected_by));
    allTasks.forEach(t => t.assignee && employeeNames.add(t.assignee));
    allTimeline.forEach(t => t.actor && t.actor !== 'النظام' && t.actor !== 'العميل' && employeeNames.add(t.actor));
    
    const employees = Array.from(employeeNames).filter(n => n).map(name => {
      const myCampaigns = allCampaigns.filter(c => c.leader_name === name);
      const myNoms = allNoms.filter(n => n.selected_by === name);
      const myTasks = allTasks.filter(t => t.assignee === name);
      const myTimeline = allTimeline.filter(t => t.actor === name);
      const myEvents = allEvents.filter(e => e.created_by === name || e.assignee === name);
      const myTfs = allTfs.filter(t => t.assignee === name || t.created_by === name);
      
      // Real metrics
      const campaignsManaged = myCampaigns.length;
      const completedCampaigns = myCampaigns.filter(c => c.status === 'completed').length;
      const nominations = myNoms.length;
      const approvals = myTimeline.filter(t => ['internal_approval','client_approval_link_created','transfer_approved'].includes(t.action)).length;
      const bookings = myEvents.filter(e => e.type === 'campaign_ad_booking').length;
      const calendarUpdates = myTimeline.filter(t => t.action && t.action.includes('booking')).length;
      const proofUploads = myTimeline.filter(t => t.action === 'ad_proof_uploaded').length;
      const transferFollowups = myTfs.length;
      const tasksCompleted = myTasks.filter(t => t.status === 'completed' || t.status === 'done').length;
      const tasksTotal = myTasks.length;
      const tasksOverdue = myTasks.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && 
        t.status !== 'completed' && t.status !== 'done'
      ).length;
      const timelineEvents = myTimeline.length;
      
      // Operational Effort Score — weighted sum of real operations
      // NOT used as employee judgment, just as effort indicator
      const effortScore = (
        campaignsManaged * 5 +
        nominations * 3 +
        approvals * 2 +
        bookings * 2 +
        proofUploads * 4 +
        transferFollowups * 3 +
        tasksCompleted * 2 +
        timelineEvents * 1
      );
      
      // On-time completion rate (real)
      const onTimeRate = tasksTotal > 0 
        ? Math.round((tasksCompleted - tasksOverdue) / tasksTotal * 100) 
        : null;
      
      return {
        name,
        campaigns_managed: campaignsManaged,
        campaigns_completed: completedCampaigns,
        completion_rate: campaignsManaged > 0 ? Math.round(completedCampaigns / campaignsManaged * 100) : 0,
        nominations,
        approvals,
        bookings,
        calendar_updates: calendarUpdates,
        proof_uploads: proofUploads,
        transfer_followups: transferFollowups,
        tasks_completed: tasksCompleted,
        tasks_overdue: tasksOverdue,
        tasks_total: tasksTotal,
        timeline_events: timelineEvents,
        on_time_rate: onTimeRate,
        effort_score: effortScore
      };
    });
    
    // Sort by effort score
    employees.sort((a,b) => b.effort_score - a.effort_score);
    return employees;
  },
  
  /** 3. Campaign Health — detailed status per campaign */
  getCampaignHealth(filters){
    const f = filters || {};
    let camps = this._filterByDate(campaigns.list(), f.from, f.to, 'created_at');
    
    return camps.map(c => {
      const validation = campaign_workflow.validateCompletion(c.id);
      const myNoms = campaign_nominations.list().filter(n => n.campaign_id === c.id);
      const myTfs = transfers.list().filter(t => t.campaign_id === c.id);
      const myEvents = calendar_events.list().filter(e => e.campaign_id === c.id);
      const timeline = campaign_timeline.list().filter(t => t.campaign_id === c.id);
      
      // Find the blocking stage (which step is currently waiting)
      let blockingStage = null;
      if(validation && validation.missing && validation.missing.length > 0){
        blockingStage = validation.missing[0];
      }
      
      return {
        id: c.id,
        name: c.campaign_name || c.name,
        customer_name: c.customer_name,
        leader_name: c.leader_name,
        status: c.status,
        status_label: CAMPAIGN_STATE_LABELS[c.status] || c.status,
        progress: validation?.progress || 0,
        completion_completed: validation?.completed || 0,
        completion_total: validation?.total || 0,
        nominations: myNoms.length,
        nominations_approved: myNoms.filter(n => n.client_decision === 'approved').length,
        bookings: myEvents.filter(e => e.type === 'campaign_ad_booking').length,
        transfers: myTfs.length,
        transfers_completed: myTfs.filter(t => t.workflow_stage === 'complete' || t.status === 'completed').length,
        ads_published: myNoms.filter(n => n.ad_completed).length,
        timeline_events: timeline.length,
        blocking_stage: blockingStage,
        budget_min: c.budget_min || c.budget,
        budget_max: c.budget_max || c.budget,
        client_payment_status: c.client_payment_status || null,
        created_at: c.created_at,
        // Days waiting (only for in-progress)
        days_open: c.created_at ? Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86400000) : null
      };
    });
  },
  
  /** 4. Finance Workflow Dashboard */
  getFinanceWorkflow(filters){
    const f = filters || {};
    const tfs = this._filterByDate(transfers.list(), f.from, f.to, 'created_at');
    
    return {
      // By stage
      stage_1_pending_bank:        tfs.filter(t => t.workflow_stage === 1).length,
      stage_2_pending_invoice:     tfs.filter(t => t.workflow_stage === 2).length,
      stage_3_pending_final:       tfs.filter(t => t.workflow_stage === 3).length,
      stage_complete:              tfs.filter(t => t.workflow_stage === 'complete').length,
      
      // By approval
      pending_manager_review:      tfs.filter(t => !t.approved_at && t.workflow_stage === 1).length,
      approved:                    tfs.filter(t => t.approved_at).length,
      
      // By source  
      from_campaigns:              tfs.filter(t => t.campaign_id).length,
      direct_creates:              tfs.filter(t => !t.campaign_id).length,
      from_portal_invoices:        tfs.filter(t => t.invoice_uploaded_by === 'influencer_portal').length,
      
      // Amounts (real)
      total_amount:                tfs.reduce((s,t) => s + (Number(t.amount_total) || 0), 0),
      completed_amount:            tfs.filter(t => t.workflow_stage === 'complete' || t.status === 'completed').reduce((s,t) => s + (Number(t.amount_total) || 0), 0),
      pending_amount:              tfs.filter(t => t.workflow_stage !== 'complete' && t.status !== 'completed').reduce((s,t) => s + (Number(t.amount_total) || 0), 0),
      
      // Recent activity (real)
      receipts_uploaded_count:     tfs.filter(t => t.bank_receipt_url).length,
      invoices_uploaded_count:     tfs.filter(t => t.invoice_url).length,
      
      // List (for table display)
      transfers: tfs.map(t => ({
        id: t.id,
        amount: t.amount_total,
        stage: t.workflow_stage,
        status: t.status,
        recipient: t.recipient_name,
        campaign_id: t.campaign_id,
        campaign_name: t.campaign_name,
        created_at: t.created_at,
        has_receipt: !!t.bank_receipt_url,
        has_invoice: !!t.invoice_url
      }))
    };
  },
  
  /** 5. Influencer Performance — based on nominations + bookings + ads */
  getInfluencerPerformance(filters){
    const f = filters || {};
    const noms = this._filterByDate(campaign_nominations.list(), f.from, f.to, 'selected_at');
    const tfs  = this._filterByDate(transfers.list(), f.from, f.to, 'created_at');
    
    // Build per-influencer aggregates from real data
    const map = new Map();
    
    noms.forEach(n => {
      if(!n.influencer_id) return;
      if(!map.has(n.influencer_id)){
        const inf = influencers.get(n.influencer_id);
        map.set(n.influencer_id, {
          id: n.influencer_id,
          name: n.influencer_name || (inf?.name || '—'),
          city: n.influencer_city || (inf?.city || '—'),
          classification: n.influencer_classification || (inf?.classification || '—'),
          nominations: 0,
          approved_by_client: 0,
          rejected_by_client: 0,
          accepted_booking: 0,
          rescheduled: 0,
          ads_completed: 0,
          transfers_received: 0,
          total_earned: 0,
          on_time_count: 0
        });
      }
      const e = map.get(n.influencer_id);
      e.nominations++;
      if(n.client_decision === 'approved') e.approved_by_client++;
      if(n.client_decision === 'rejected') e.rejected_by_client++;
      if(n.influencer_decision === 'approved') e.accepted_booking++;
      if(n.influencer_decision === 'reschedule_requested') e.rescheduled++;
      if(n.ad_completed) {
        e.ads_completed++;
        // Check if completed on-time (proof_uploaded_at vs booking_date)
        if(n.booking_date && n.proof_uploaded_at && new Date(n.proof_uploaded_at) <= new Date(new Date(n.booking_date).getTime() + 86400000)){
          e.on_time_count++;
        }
      }
    });
    
    // Add transfer data
    tfs.filter(t => t.influencer_id && map.has(t.influencer_id)).forEach(t => {
      const e = map.get(t.influencer_id);
      e.transfers_received++;
      if(t.workflow_stage === 'complete' || t.status === 'completed'){
        e.total_earned += Number(t.amount_total) || 0;
      }
    });
    
    return Array.from(map.values()).map(e => ({
      ...e,
      approval_rate: e.nominations > 0 ? Math.round(e.approved_by_client / e.nominations * 100) : 0,
      commitment_rate: e.ads_completed > 0 ? Math.round(e.on_time_count / e.ads_completed * 100) : null
    })).sort((a,b) => b.nominations - a.nominations);
  },
  
  /** 6. Client Status Dashboard */
  getClientStatus(filters){
    const f = filters || {};
    const camps = this._filterByDate(campaigns.list(), f.from, f.to, 'created_at');
    
    const map = new Map();
    camps.forEach(c => {
      if(!c.customer_id && !c.customer_name) return;
      const key = c.customer_id || c.customer_name;
      if(!map.has(key)){
        const cust = c.customer_id ? customers.get(c.customer_id) : null;
        map.set(key, {
          id: c.customer_id,
          name: c.customer_name || cust?.name || '—',
          city: cust?.city || '—',
          campaigns_total: 0,
          campaigns_completed: 0,
          campaigns_active: 0,
          campaigns_pending_approval: 0,
          paid_campaigns: 0,
          postponed_campaigns: 0,
          total_billed: 0,
          last_activity: null
        });
      }
      const e = map.get(key);
      e.campaigns_total++;
      if(c.status === 'completed') e.campaigns_completed++;
      if(['executing','in_progress','ads_in_progress','booking_in_progress','transfer_in_progress'].includes(c.status)) e.campaigns_active++;
      if(['pending_internal_approval','pending_client_approval'].includes(c.status)) e.campaigns_pending_approval++;
      if(c.client_payment_status === 'paid') e.paid_campaigns++;
      if(c.client_payment_status === 'postponed') e.postponed_campaigns++;
      const billed = Number(c.budget_max || c.budget) || 0;
      e.total_billed += billed;
      const updated = c.updated_at || c.created_at;
      if(updated && (!e.last_activity || new Date(updated) > new Date(e.last_activity))){
        e.last_activity = updated;
      }
    });
    
    return Array.from(map.values()).sort((a,b) => b.campaigns_total - a.campaigns_total);
  },
  
  /** 7. Automation Impact — measures system value */
  getAutomationImpact(filters){
    const f = filters || {};
    const ctnt = this._filterByDate(content.list(), f.from, f.to, 'created_at');
    const tokens = approval_tokens.list();
    const tl = campaign_timeline.list();
    
    return {
      // Auto-content saves
      content_auto_saved:        ctnt.filter(c => c.source === 'campaign_auto_save').length,
      
      // Approval links (replaces manual coordination)
      client_links_generated:    tokens.filter(t => t.type === 'client_approval').length,
      booking_links_generated:   tokens.filter(t => t.type === 'influencer_booking').length,
      
      // Auto-events on calendar
      calendar_auto_bookings:    calendar_events.list().filter(e => e.source === 'auto_from_booking' || e.created_from_token).length,
      
      // Auto-timeline (everything done via API logs)
      timeline_events_logged:    tl.length,
      
      // Transfers auto-created from campaigns
      transfers_from_campaigns:  transfers.list().filter(t => t.source === 'campaign_workflow').length,
      
      // Portal invoices (instead of manual)
      portal_invoices_received:  transfers.list().filter(t => t.invoice_uploaded_by === 'influencer_portal').length
    };
  },
  
  /** 8. Average time per stage — real time measurements from timeline */
  getStageTimeMetrics(filters){
    const f = filters || {};
    const tl = this._filterByDate(campaign_timeline.list(), f.from, f.to, 'timestamp');
    const camps = campaigns.list();
    
    // Compute per-campaign stage durations
    const durations = { nomination: [], internal_approval: [], client_approval: [], booking: [], transfer: [], ad_execution: [], total: [] };
    
    camps.forEach(c => {
      const ct = tl.filter(t => t.campaign_id === c.id).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
      if(ct.length < 2) return;
      
      const created = ct.find(t => t.action === 'campaign_created' || t.action === 'created');
      const nominated = ct.find(t => t.action === 'influencer_nominated');
      const internalApproved = ct.find(t => t.action === 'internal_approval');
      const clientLinkSent = ct.find(t => t.action === 'client_approval_link_created');
      const clientDecided = ct.find(t => t.action === 'client_decision_per_nomination');
      const bookingSent = ct.find(t => t.action === 'booking_link_sent');
      const bookingConfirmed = ct.find(t => t.action === 'influencer_booking_decision');
      const transferCreated = ct.find(t => t.action === 'transfer_request_created');
      const adsPublished = ct.find(t => t.action === 'ad_proof_uploaded');
      
      const diff = (a, b) => a && b ? (new Date(b.timestamp) - new Date(a.timestamp)) / 86400000 : null;  // days
      
      const d1 = diff(created, nominated);
      const d2 = diff(nominated, internalApproved);
      const d3 = diff(clientLinkSent, clientDecided);
      const d4 = diff(bookingSent, bookingConfirmed);
      const d5 = diff(transferCreated, ct.find(t => t.action === 'transfer_completed'));
      const d6 = diff(bookingConfirmed, adsPublished);
      
      if(d1 != null) durations.nomination.push(d1);
      if(d2 != null) durations.internal_approval.push(d2);
      if(d3 != null) durations.client_approval.push(d3);
      if(d4 != null) durations.booking.push(d4);
      if(d5 != null) durations.transfer.push(d5);
      if(d6 != null) durations.ad_execution.push(d6);
      if(c.status === 'completed' && created){
        const last = ct[ct.length - 1];
        const total = diff(created, last);
        if(total != null) durations.total.push(total);
      }
    });
    
    const avg = arr => arr.length > 0 ? Math.round(arr.reduce((s,n) => s + n, 0) / arr.length * 10) / 10 : null;
    
    return {
      avg_nomination_days:        avg(durations.nomination),
      avg_internal_approval_days: avg(durations.internal_approval),
      avg_client_approval_days:   avg(durations.client_approval),
      avg_booking_days:           avg(durations.booking),
      avg_transfer_days:          avg(durations.transfer),
      avg_ad_execution_days:      avg(durations.ad_execution),
      avg_total_days:             avg(durations.total),
      
      // Samples count (for credibility)
      samples: {
        nomination: durations.nomination.length,
        internal_approval: durations.internal_approval.length,
        client_approval: durations.client_approval.length,
        booking: durations.booking.length,
        transfer: durations.transfer.length,
        ad_execution: durations.ad_execution.length,
        total: durations.total.length
      }
    };
  },
  
  /** PDF export — triggers print with print-ready CSS (no fake numbers) */
  exportPDF(opts){
    // This is called from the page; the page provides the DOM
    // Returns metadata about the export
    const meta = {
      generated_at: new Date().toISOString(),
      generated_by: window.SC?.auth?.getSession?.()?.name || 'النظام',
      filters: opts?.filters || {},
      report_type: opts?.type || 'executive_summary'
    };
    // Save to analytics_exports for audit trail
    try {
      const exports = JSON.parse(localStorage.getItem('sc_v5_analytics_exports') || '[]');
      exports.unshift(meta);
      if(exports.length > 50) exports.length = 50;
      localStorage.setItem('sc_v5_analytics_exports', JSON.stringify(exports));
    } catch(e) {}
    return meta;
  },

  /** ════════════════════════════════════════════════════════════════
   *  INTELLIGENCE ENGINE — one comprehensive, REAL-DATA analytics object.
   *  filters: {from,to,customer_id,campaign_id,employee,influencer_id,status,ugc_platform}
   *  Every number below is derived from actual records in the system.
   *  ════════════════════════════════════════════════════════════════ */
  getIntelligence(filters){
    const f = filters || {};
    const now = Date.now();
    const DAY = 86400000;
    const dateIn = (d) => { if(!f.from && !f.to) return true; if(!d) return false; const t=new Date(d).getTime(); if(isNaN(t)) return false; const lo=f.from?new Date(f.from).getTime():0; const hi=f.to?new Date(f.to).getTime()+DAY:Infinity; return t>=lo && t<hi; };
    const days = (a,b) => { if(!a||!b) return null; const d=(new Date(b).getTime()-new Date(a).getTime())/DAY; return (isNaN(d)||d<0)?null:d; };
    const avg = arr => arr.length ? arr.reduce((s,x)=>s+x,0)/arr.length : 0;
    const num = n => Number(n)||0;

    // ── Base datasets with filters ──
    let camps = campaigns.list().filter(c => dateIn(c.created_at));
    if(f.customer_id) camps = camps.filter(c => c.customer_id===f.customer_id);
    if(f.campaign_id) camps = camps.filter(c => c.id===f.campaign_id);
    if(f.status) camps = camps.filter(c => (this._statusBucket(c))===f.status);
    if(f.employee) camps = camps.filter(c => this._campEmployees(c).indexOf(f.employee)>-1);
    const campIds = new Set(camps.map(c=>c.id));

    let noms = campaign_nominations.list().filter(n => campIds.has(n.campaign_id));
    if(f.influencer_id) noms = noms.filter(n => n.influencer_id===f.influencer_id);
    const tfs  = transfers.list().filter(t => campIds.has(t.campaign_id));
    const docs = campaign_documents.list().filter(d => campIds.has(d.campaign_id));
    let tasks  = data.get('tasks',[]).filter(t => t.auto && (t.campaign_id ? campIds.has(t.campaign_id) : (t.related_type==='campaign'&&campIds.has(t.related_to))));
    if(f.employee) tasks = tasks.filter(t => t.assigned_to===f.employee);
    const allEvents = calendar_events.list().filter(e => campIds.has(e.campaign_id));
    const allContent = content.list().filter(c => !c.campaign_id || campIds.has(c.campaign_id));
    const tl = campaign_timeline.list().filter(t => campIds.has(t.campaign_id));

    // ── Campaign status breakdown ──
    const bucket = c => this._statusBucket(c);
    const completed = camps.filter(c => bucket(c)==='completed');
    const active    = camps.filter(c => bucket(c)==='active');
    const stalled   = camps.filter(c => bucket(c)==='stalled');
    const cancelled = camps.filter(c => bucket(c)==='cancelled');

    // ── Nomination / acceptance rates ──
    const clientApproved = noms.filter(n => n.client_decision==='approved');
    const clientRejected = noms.filter(n => n.client_decision==='rejected');
    const clientDecided  = clientApproved.length + clientRejected.length;
    const booked = noms.filter(n => n.influencer_decision==='approved' || n.status==='booking_manually_confirmed');
    const infDeclined = noms.filter(n => n.influencer_decision==='rejected');
    const infDecided = booked.length + infDeclined.length;
    const pct = (a,b) => b>0 ? Math.round((a/b)*1000)/10 : 0;

    // ── Durations (real) ──
    const completionDays = completed.map(c => days(c.created_at, c.completed_at)).filter(x=>x!=null);
    const bookingDays = booked.map(n => days(n.client_decision_at||n.created_at, n.influencer_decision_at||n.booking_date)).filter(x=>x!=null);
    const collectionDays = camps.map(c => { const r=docs.find(d=>d.campaign_id===c.id && d.type==='receipt'); return r?days(c.created_at, r.created_at):null; }).filter(x=>x!=null);

    // ── Finance (real) ──
    const collectedIn = docs.filter(d=>d.type==='receipt').reduce((s,d)=>s+num(d.amount),0)
      || camps.filter(c=>c.client_payment_status==='paid').reduce((s,c)=>s+num(c.client_payment_amount||c.budget),0);
    const paidOut = tfs.filter(t=>t.workflow_stage==='complete'||t.status==='completed').reduce((s,t)=>s+num(t.amount_total),0);
    const nomProfit = noms.reduce((s,n)=>s+(num(n.selling_price)-num(n.cost_price)),0);
    const totalSell = noms.reduce((s,n)=>s+num(n.selling_price),0);
    const totalCost = noms.reduce((s,n)=>s+num(n.cost_price),0);
    const pendingCollection = camps.filter(c=>c.client_payment_status==='postponed').reduce((s,c)=>s+num(c.client_payment_amount||c.budget),0);
    const pendingPayments = tfs.filter(t=>t.workflow_stage!=='complete'&&t.status!=='completed').reduce((s,t)=>s+num(t.amount_total),0);

    // ── Group helpers ──
    const groupSum = (items, keyFn, valFn) => { const m={}; items.forEach(it=>{ const k=keyFn(it); if(k==null||k==='') return; m[k]=(m[k]||0)+(valFn?valFn(it):1); }); return m; };
    const topN = (obj, n) => Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,v])=>({key:k,value:v}));

    // Profit by dimension (real, from nomination profit)
    const profitByCustomer = {}; const profitByCampaign = {}; const profitByInfluencer = {}; const profitByMonth = {};
    noms.forEach(n => {
      const p = num(n.selling_price)-num(n.cost_price);
      const c = campaigns.get(n.campaign_id);
      const custName = c ? (c.customer_name||'—') : '—';
      const campName = c ? (c.campaign_name||c.name||n.campaign_id) : n.campaign_id;
      profitByCustomer[custName] = (profitByCustomer[custName]||0)+p;
      profitByCampaign[campName] = (profitByCampaign[campName]||0)+p;
      if(n.influencer_name) profitByInfluencer[n.influencer_name] = (profitByInfluencer[n.influencer_name]||0)+p;
      const d = c?c.created_at:n.created_at; if(d){ const mk=String(d).slice(0,7); profitByMonth[mk]=(profitByMonth[mk]||0)+p; }
    });

    // Top customers (by campaigns + revenue)
    const custCampaigns = groupSum(camps, c=>c.customer_name);
    const custRevenue = {}; camps.forEach(c=>{ const k=c.customer_name; if(k) custRevenue[k]=(custRevenue[k]||0)+num(c.client_payment_amount||c.budget); });
    // Top influencers (by executed/booked + revenue)
    const infExecuted = groupSum(booked, n=>n.influencer_name);
    const infRevenue = {}; noms.forEach(n=>{ if(n.influencer_name) infRevenue[n.influencer_name]=(infRevenue[n.influencer_name]||0)+num(n.selling_price); });

    // ── Monthly time-series (for charts) ──
    const monthsSet = {};
    camps.forEach(c=>{ if(c.created_at){ const k=String(c.created_at).slice(0,7); (monthsSet[k]=monthsSet[k]||{campaigns:0,revenue:0,profit:0,collected:0,paid:0}).campaigns++; } });
    noms.forEach(n=>{ const c=campaigns.get(n.campaign_id); const d=c?c.created_at:n.created_at; if(d){ const k=String(d).slice(0,7); const m=(monthsSet[k]=monthsSet[k]||{campaigns:0,revenue:0,profit:0,collected:0,paid:0}); m.profit+=(num(n.selling_price)-num(n.cost_price)); m.revenue+=num(n.selling_price); } });
    docs.filter(d=>d.type==='receipt').forEach(d=>{ if(d.created_at){ const k=String(d.created_at).slice(0,7); (monthsSet[k]=monthsSet[k]||{campaigns:0,revenue:0,profit:0,collected:0,paid:0}).collected+=num(d.amount); } });
    tfs.filter(t=>t.status==='completed'||t.workflow_stage==='complete').forEach(t=>{ const d=t.completed_at||t.created_at; if(d){ const k=String(d).slice(0,7); (monthsSet[k]=monthsSet[k]||{campaigns:0,revenue:0,profit:0,collected:0,paid:0}).paid+=num(t.amount_total); } });
    const months = Object.keys(monthsSet).sort();
    const timeSeries = months.map(m => Object.assign({month:m}, monthsSet[m]));

    // ── UGC (real) ──
    const ugcSubs = ugc_submissions.list();
    const ugcTxns = ugc_transactions.list();
    const ugcCamps = ugc_campaigns.list();
    const ugcCreators = ugc_creators.list();
    const ugc = {
      creators: ugcCreators.length,
      campaigns: ugcCamps.length,
      submissions: ugcSubs.length,
      submissions_approved: ugcSubs.filter(s=>s.status==='approved'||s.status==='accepted').length,
      transactions: ugcTxns.length,
      revenue: ugcTxns.reduce((s,t)=>s+num(t.amount),0),
      paid: ugcTxns.filter(t=>t.status==='paid'||t.status==='completed').reduce((s,t)=>s+num(t.amount),0)
    };

    // ── Employee performance (real, from unified data) ──
    const users = (window.SC?.auth?.getUsers?.()||[]).map(u=>u.name);
    const empSet = {};
    const ensureEmp = name => empSet[name] = empSet[name] || {name, campaigns:0, nominations:0, bookings:0, followups:0, completedOps:0, autoTasks:0, autoDone:0, overdue:0, financial:0};
    camps.forEach(c => this._campEmployees(c).forEach(e => { if(e) ensureEmp(e).campaigns++; }));
    noms.forEach(n => { const c=campaigns.get(n.campaign_id); const owner=(c&&this._campEmployees(c)[0])||null; if(owner){ ensureEmp(owner).nominations++; } });
    booked.forEach(n => { const inf=influencers.get(n.influencer_id); const owner=(inf&&inf.account_manager)|| (campaigns.get(n.campaign_id)&&this._campEmployees(campaigns.get(n.campaign_id))[0]); if(owner) ensureEmp(owner).bookings++; });
    tl.forEach(t => { if(t.actor && users.indexOf(t.actor)>-1){ ensureEmp(t.actor).followups++; } });
    tasks.forEach(t => { if(!t.assigned_to) return; const e=ensureEmp(t.assigned_to); e.autoTasks++; if(t.status==='done'){ e.autoDone++; e.completedOps++; } else if(t.due_date && new Date(t.due_date).getTime()<now){ e.overdue++; } });
    // financial contribution = profit of campaigns the employee leads
    camps.forEach(c => { const owner=this._campEmployees(c)[0]; if(!owner) return; const p=campaign_nominations.list().filter(n=>n.campaign_id===c.id).reduce((s,n)=>s+(num(n.selling_price)-num(n.cost_price)),0); ensureEmp(owner).financial+=p; });
    const employees = Object.values(empSet).map(e => {
      const totalTasks = e.autoTasks || 0;
      e.completionRate = totalTasks ? Math.round((e.autoDone/totalTasks)*1000)/10 : 0;
      e.delayRate = totalTasks ? Math.round((e.overdue/totalTasks)*1000)/10 : 0;
      // estimated operational hours: weighted by activity (real counts, transparent heuristic)
      e.estHours = Math.round((e.campaigns*2 + e.nominations*0.5 + e.bookings*1 + e.followups*0.25 + e.autoDone*0.75)*10)/10;
      return e;
    }).sort((a,b)=>b.campaigns-a.campaigns || b.financial-a.financial);

    return {
      filters: f,
      generated_at: new Date().toISOString(),
      company: {
        campaigns_total: camps.length,
        campaigns_active: active.length,
        campaigns_completed: completed.length,
        campaigns_stalled: stalled.length,
        campaigns_cancelled: cancelled.length,
        customers_total: new Set(camps.map(c=>c.customer_id).filter(Boolean)).size,
        influencers_engaged: new Set(noms.map(n=>n.influencer_id).filter(Boolean)).size,
        nominations_total: noms.length,
        bookings_total: booked.length,
        revenue: totalSell, collected: collectedIn, paidOut: paidOut,
        profit: nomProfit, margin: totalSell>0?Math.round((nomProfit/totalSell)*1000)/10:0,
        pendingCollection, pendingPayments,
        documents: docs.length, content: allContent.length,
        autoTasks: tasks.length, autoTasksDone: tasks.filter(t=>t.status==='done').length,
        autoTasksOpen: tasks.filter(t=>t.status!=='done').length,
        autoTasksOverdue: tasks.filter(t=>t.status!=='done'&&t.due_date&&new Date(t.due_date).getTime()<now).length
      },
      rates: {
        nomination_success: pct(clientApproved.length, noms.length),
        client_acceptance: pct(clientApproved.length, clientDecided),
        influencer_acceptance: pct(booked.length, infDecided),
        booking_completion: pct(booked.length, clientApproved.length),
        collection_rate: pct(camps.filter(c=>c.client_payment_status==='paid').length, camps.length)
      },
      durations: {
        avg_completion_days: Math.round(avg(completionDays)*10)/10,
        avg_booking_days: Math.round(avg(bookingDays)*10)/10,
        avg_collection_days: Math.round(avg(collectionDays)*10)/10
      },
      finance: { collectedIn, paidOut, grossProfit: nomProfit, totalSell, totalCost, pendingCollection, pendingPayments,
        net: collectedIn - paidOut },
      profit: {
        byCustomer: topN(profitByCustomer, 12),
        byCampaign: topN(profitByCampaign, 12),
        byInfluencer: topN(profitByInfluencer, 12),
        byMonth: Object.keys(profitByMonth).sort().map(k=>({key:k,value:Math.round(profitByMonth[k])}))
      },
      top: {
        customersByCampaigns: topN(custCampaigns, 10),
        customersByRevenue: topN(custRevenue, 10),
        influencersByExecuted: topN(infExecuted, 10),
        influencersByRevenue: topN(infRevenue, 10)
      },
      timeSeries,
      ugc,
      employees,
      statusBreakdown: [
        {key:'نشطة', value:active.length, color:'#0d8a6f'},
        {key:'مكتملة', value:completed.length, color:'#16a34a'},
        {key:'متعثرة', value:stalled.length, color:'#d97706'},
        {key:'ملغاة', value:cancelled.length, color:'#dc2626'}
      ],
      lists: {
        stalledCampaigns: stalled.map(c=>({id:c.id, name:c.campaign_name||c.name, customer:c.customer_name, status_label:this._statusLabel(c), reason:this._stallReason(c, docs, tasks), owner:this._campEmployees(c)[0]||'—', created:c.created_at})).slice(0,30),
        recentTimeline: tl.slice(-40).reverse().map(t=>({action:((campaign_timeline.META&&campaign_timeline.META[t.action]&&campaign_timeline.META[t.action].label)||t.action), actor:t.actor, campaign:(campaigns.get(t.campaign_id)||{}).campaign_name||t.campaign_id, at:t.timestamp||t.created_at}))
      },
      detail: (() => {
        // ── Per-campaign full table ──
        const campaignsTable = camps.map(c => {
          const cn = noms.filter(n=>n.campaign_id===c.id);
          const sell = cn.reduce((s,n)=>s+num(n.selling_price),0);
          const cost = cn.reduce((s,n)=>s+num(n.cost_price),0);
          const r = docs.find(d=>d.campaign_id===c.id && d.type==='receipt');
          return { id:c.id, name:c.campaign_name||c.name||'—', customer:c.customer_name||'—', owner:this._campEmployees(c)[0]||'—',
            status:this._statusLabel(c), bucket:this._statusBucket(c), influencers:cn.length, booked:cn.filter(n=>n.influencer_decision==='approved'||n.status==='booking_manually_confirmed').length,
            sell, cost, profit:sell-cost, margin:sell>0?Math.round((sell-cost)/sell*1000)/10:0,
            collected:r?'محصّل':(c.client_payment_status==='postponed'?'آجل':'لم يُحصّل'), created:c.created_at };
        }).sort((a,b)=>b.sell-a.sell);
        // ── Per-customer finance ──
        const cf={}; camps.forEach(c=>{ const k=c.customer_name||'—'; const o=(cf[k]=cf[k]||{name:k,campaigns:0,sell:0,cost:0,collected:0,pending:0}); o.campaigns++; });
        noms.forEach(n=>{ const c=campaigns.get(n.campaign_id); const k=c?(c.customer_name||'—'):'—'; const o=(cf[k]=cf[k]||{name:k,campaigns:0,sell:0,cost:0,collected:0,pending:0}); o.sell+=num(n.selling_price); o.cost+=num(n.cost_price); });
        camps.forEach(c=>{ const k=c.customer_name||'—'; const o=cf[k]; if(!o) return; if(c.client_payment_status==='paid') o.collected+=num(c.client_payment_amount||c.budget); else if(c.client_payment_status==='postponed') o.pending+=num(c.client_payment_amount||c.budget); });
        const customerFinance = Object.values(cf).map(o=>Object.assign(o,{profit:o.sell-o.cost, margin:o.sell>0?Math.round((o.sell-o.cost)/o.sell*1000)/10:0})).sort((a,b)=>b.sell-a.sell);
        // ── Platform performance (from nomination platforms) ──
        const pf={}; const PLAB={snapchat:'سناب شات',tiktok:'تيك توك',instagram:'إنستقرام',youtube:'يوتيوب',twitter:'تويتر',x:'X'};
        noms.forEach(n=>{ let plats=Array.isArray(n.platforms)?n.platforms:[]; if(!plats.length){ const inf=influencers.get(n.influencer_id); plats=(inf&&Array.isArray(inf.platforms))?inf.platforms.map(p=>p.platform_name):[]; } const uniq=[...new Set(plats.map(p=>typeof p==='string'?p:(p&&(p.platform_name||p.name))).filter(Boolean))]; const share=uniq.length||1; uniq.forEach(p=>{ const k=PLAB[p]||p; const o=(pf[k]=pf[k]||{platform:k,ads:0,sell:0,cost:0}); o.ads++; o.sell+=num(n.selling_price)/share; o.cost+=num(n.cost_price)/share; }); });
        const totSell2=Object.values(pf).reduce((s,o)=>s+o.sell,0)||1;
        const platformPerf = Object.values(pf).map(o=>Object.assign(o,{sell:Math.round(o.sell),cost:Math.round(o.cost),profit:Math.round(o.sell-o.cost),margin:o.sell>0?Math.round((o.sell-o.cost)/o.sell*1000)/10:0,share:Math.round(o.sell/totSell2*1000)/10})).sort((a,b)=>b.sell-a.sell);
        // ── Full influencer performance ──
        const inf={}; noms.forEach(n=>{ if(!n.influencer_id) return; const o=(inf[n.influencer_id]=inf[n.influencer_id]||{id:n.influencer_id,name:n.influencer_name||'—',ads:0,booked:0,sell:0,cost:0}); o.ads++; if(n.influencer_decision==='approved'||n.status==='booking_manually_confirmed') o.booked++; o.sell+=num(n.selling_price); o.cost+=num(n.cost_price); });
        const influencerTable = Object.values(inf).map(o=>{ const e=influencers.get(o.id)||{}; return Object.assign(o,{platform:(Array.isArray(e.platforms)&&e.platforms[0]&&(PLAB[e.platforms[0].platform_name]||e.platforms[0].platform_name))||'—',tier:e.classification||'—',profit:o.sell-o.cost,margin:o.sell>0?Math.round((o.sell-o.cost)/o.sell*1000)/10:0}); }).sort((a,b)=>b.sell-a.sell).slice(0,25);
        // ── Nomination funnel + booking detail ──
        const funnel = { nominated:noms.length, internal:noms.filter(n=>n.internal_approved_at||n.status==='internal_approved'||n.client_decision).length, clientApproved:clientApproved.length, booked:booked.length, published:noms.filter(n=>n.ad_completed).length };
        // ── Auto-tasks by stage + overdue ──
        const byStage={}; tasks.forEach(t=>{ const k=t.workflow_step||'أخرى'; const o=(byStage[k]=byStage[k]||{stage:k,total:0,done:0,open:0,overdue:0}); o.total++; if(t.status==='done') o.done++; else { o.open++; if(t.due_date&&new Date(t.due_date).getTime()<now) o.overdue++; } });
        const autoTasksByStage = Object.values(byStage).sort((a,b)=>b.total-a.total);
        // ── UGC detail ──
        const ugcCreatorsTable = ugc_creators.list().slice(0,25).map(cr=>({name:cr.name||cr.creator_name||'—', status:cr.status||'—', rating:cr.rating||0, submissions:ugc_submissions.list().filter(s=>s.creator_id===cr.id).length, earned:ugc_transactions.list().filter(t=>t.creator_id===cr.id).reduce((s,t)=>s+num(t.amount),0)})).sort((a,b)=>b.earned-a.earned);
        return { campaignsTable, customerFinance, platformPerf, influencerTable, funnel, autoTasksByStage, ugcCreatorsTable };
      })()
    };
  },

  /** Classify a campaign into active|completed|stalled|cancelled from REAL state. */
  _statusBucket(c){
    if(c.status==='completed') return 'completed';
    if(c.status==='cancelled' || c.status==='rejected') return 'cancelled';
    const now = Date.now(), DAY=86400000;
    const overdue = data.get('tasks',[]).some(t => t.auto && (t.campaign_id===c.id) && t.status!=='done' && t.due_date && new Date(t.due_date).getTime()<now);
    const ageDays = c.created_at ? (now-new Date(c.created_at).getTime())/DAY : 0;
    if(overdue || ageDays>30) return 'stalled';
    return 'active';
  },
  _statusLabel(c){ const b=this._statusBucket(c); return {active:'نشطة',completed:'مكتملة',stalled:'متعثرة',cancelled:'ملغاة'}[b]; },
  _stallReason(c, docs, tasks){
    try { const g = campaign_workflow.canProceedToBooking(c.id); if(g && !g.ok && g.missing && g.missing.length) return g.missing.join(' · '); } catch(e){}
    const overdue = (tasks||data.get('tasks',[])).filter(t=>t.auto&&t.campaign_id===c.id&&t.status!=='done'&&t.due_date&&new Date(t.due_date).getTime()<Date.now());
    if(overdue.length) return overdue.length+' مهمة متأخرة';
    return 'بدون تقدّم منذ فترة';
  },
  _campEmployees(c){
    const arr = [];
    if(Array.isArray(c.coordinator_names)) arr.push(...c.coordinator_names);
    else if(c.coordinator_names) arr.push(c.coordinator_names);
    if(c.assignee_name) arr.push(c.assignee_name);
    if(c.leader_name) arr.push(c.leader_name);
    return [...new Set(arr.filter(Boolean))];
  }
};


/* ════════════════════════════════════════════════════════════════
   SMART ASSISTANT — محرك تحليل حقيقي يعتمد بيانات النظام
   ════════════════════════════════════════════════════════════════ */
const assistant_api = {
  /* ---------- 1) بحث شامل داخل النظام ---------- */
  search(query){
    const q = String(query||'').trim().toLowerCase();
    if(!q) return { query:'', total:0, groups:[] };
    const groups = [];
    const scan = (label, key, fields, route, nameField) => {
      const items = (data.get(key,[])||[]).filter(it => fields.some(f => String(it[f]==null?'':it[f]).toLowerCase().includes(q)));
      if(items.length) groups.push({ label, key, route, count: items.length,
        items: items.slice(0,8).map(it => ({ id: it.id, name: it[nameField]||it.name||it.title||it.id, sub: it.status||it.city||it.customer_name||'' })) });
    };
    scan('العملاء','customers',['name','company','company_name','phone','email'],'customer-detail.html?id=','name');
    scan('المؤثرون','influencers',['name','username','phone','city'],'influencer-detail.html?id=','name');
    scan('الحملات','campaigns',['name','customer_name'],'campaign-detail.html?id=','name');
    scan('الحوالات','transfers',['influencer_name','beneficiary_name','campaign_name','ref','reference'],'transfer-detail.html?id=','influencer_name');
    scan('المهام','tasks',['title','description'],'tasks.html','title');
    return { query, total: groups.reduce((s,g)=>s+g.count,0), groups };
  },

  /* ---------- 2) اكتشاف التعثرات عبر النظام ---------- */
  detectStalls(){
    const out = { campaigns:[], tasks:0, approvals:0, bookings:0, collections:0, payments:0 };
    try{
      const health = analytics_api.getCampaignHealth() || [];
      out.campaigns = health.filter(c => c.status!=='completed' && c.status!=='cancelled' && (c.progress!=null && c.progress<50))
        .map(c => ({ id:c.id, name:c.name, customer:c.customer_name, progress:c.progress, leader:c.leader_name }));
    }catch(e){}
    try{
      const now = Date.now();
      out.tasks = (data.get('tasks',[])||[]).filter(t => t.status!=='done' && t.due_date && new Date(t.due_date).getTime()<now).length;
    }catch(e){}
    try{
      const s = analytics_api.getOperationalSummary() || {};
      out.approvals = (s.nominations_total||0) - (s.client_approved||0) - (s.client_rejected||0);
      if(out.approvals<0) out.approvals=0;
      out.bookings = Math.max(0,(s.bookings_sent||0) - (s.bookings_confirmed||0));
      out.collections = s.campaigns_postponed_payment||0;
      out.payments = (s.transfers_pending_review||0) + (s.invoice_pending||0);
    }catch(e){}
    return out;
  },

  /* ---------- 3) تحليل حملة ---------- */
  analyzeCampaign(id){
    const c = campaigns.get(id); if(!c) return null;
    let health=null; try{ health=(analytics_api.getCampaignHealth()||[]).find(x=>x.id===id); }catch(e){}
    const noms = (data.get('campaign_nominations',[])||[]).filter(n=>n.campaign_id===id);
    const trs  = (data.get('transfers',[])||[]).filter(t=>t.campaign_id===id);
    const tasksOpen = (data.get('tasks',[])||[]).filter(t=>t.campaign_id===id && t.status!=='done');
    const approved = noms.filter(n=>/approved|confirmed|booking|done/i.test(n.status||'')).length;
    return {
      id, name:c.name, customer:c.customer_name, status:c.status,
      progress: health?health.progress:null,
      nominations: noms.length, approved,
      bookings: noms.filter(n=>n.status==='booking_sent'||n.booking_token).length,
      transfers: trs.length, transfers_done: trs.filter(t=>/paid|completed|done/i.test(t.status||'')).length,
      open_tasks: tasksOpen.length,
      next: assistant_api.nextSteps('campaign', id)
    };
  },

  /* ---------- 4) تحليل عميل ---------- */
  analyzeClient(id){
    const cl = customers.get(id); if(!cl) return null;
    let row=null; try{ row=(analytics_api.getClientStatus()||[]).find(x=>x.id===id); }catch(e){}
    const camps = (data.get('campaigns',[])||[]).filter(c=>c.customer_id===id);
    return {
      id, name:cl.name,
      campaigns_total: camps.length,
      completed: camps.filter(c=>c.status==='completed').length,
      active: camps.filter(c=>c.status!=='completed'&&c.status!=='cancelled').length,
      total_billed: row?row.total_billed:null,
      pending_approval: row?row.pending_approval:null,
      next: assistant_api.nextSteps('client', id)
    };
  },

  /* ---------- 5) تحليل مؤثر ---------- */
  analyzeInfluencer(id){
    const inf = influencers.get(id); if(!inf) return null;
    let row=null; try{ row=(analytics_api.getInfluencerPerformance()||[]).find(x=>x.id===id); }catch(e){}
    const noms = (data.get('campaign_nominations',[])||[]).filter(n=>n.influencer_id===id);
    const trs  = (data.get('transfers',[])||[]).filter(t=>t.influencer_id===id);
    return {
      id, name:inf.name, city:inf.city, classification:inf.classification, rating:inf.rating,
      nominations: noms.length,
      approval_rate: row?row.approval_rate:null,
      ads_completed: row?row.ads_completed:null,
      total_earned: row?row.total_earned:null,
      transfers: trs.length,
      next: assistant_api.nextSteps('influencer', id)
    };
  },

  /* ---------- 6) تحليل الحالة المالية ---------- */
  analyzeFinance(){
    let f={}, s={};
    try{ f=analytics_api.getFinanceWorkflow()||{}; }catch(e){}
    try{ s=analytics_api.getOperationalSummary()||{}; }catch(e){}
    return {
      total_amount: f.total_amount||0, completed_amount: f.completed_amount||0, pending_amount: f.pending_amount||0,
      pending_manager_review: f.pending_manager_review||0, approved: f.approved||0,
      receipts: f.receipts_uploaded_count||0, invoices: f.invoices_uploaded_count||0,
      pending_collections: s.campaigns_postponed_payment||0,
      pending_payments: (s.transfers_pending_review||0)+(s.invoice_pending||0),
      next: assistant_api.nextSteps('finance')
    };
  },

  /* ---------- 7) الخطوة التالية المقترحة ---------- */
  nextSteps(scope, id){
    const steps = [];
    try{
      if(scope==='campaign'){
        const c = campaigns.get(id); if(!c) return steps;
        const noms = (data.get('campaign_nominations',[])||[]).filter(n=>n.campaign_id===id);
        if(!noms.length) steps.push('لا يوجد ترشيحات بعد — ابدأ بترشيح المؤثرين.');
        else {
          const pendingClient = noms.filter(n=>/internal_approved|nominated/i.test(n.status||'')).length;
          if(pendingClient) steps.push(pendingClient+' ترشيح بانتظار اعتماد العميل — أرسل رابط الاعتماد.');
          const needBooking = noms.filter(n=>/client_approved/i.test(n.status||'') && !n.booking_token).length;
          if(needBooking) steps.push(needBooking+' مؤثر معتمد بلا حجز — أنشئ روابط الحجز.');
        }
        const overdue = (data.get('tasks',[])||[]).filter(t=>t.campaign_id===id&&t.status!=='done'&&t.due_date&&new Date(t.due_date)<new Date()).length;
        if(overdue) steps.push(overdue+' مهمة متأخرة على هذه الحملة — راجعها.');
        if(!steps.length && c.status!=='completed') steps.push('الحملة تسير جيداً — تابع تنفيذ الإعلانات والإثباتات.');
      } else if(scope==='client'){
        const camps=(data.get('campaigns',[])||[]).filter(c=>c.customer_id===id);
        const pend=camps.filter(c=>c.status!=='completed'&&c.status!=='cancelled').length;
        if(pend) steps.push(pend+' حملة نشطة لهذا العميل — تابع تقدّمها.');
        else steps.push('لا حملات نشطة حالياً — فرصة لاقتراح حملة جديدة.');
      } else if(scope==='influencer'){
        const noms=(data.get('campaign_nominations',[])||[]).filter(n=>n.influencer_id===id);
        const open=noms.filter(n=>!/done|completed|rejected/i.test(n.status||'')).length;
        if(open) steps.push(open+' ترشيح نشط لهذا المؤثر — تابع الحجز والتنفيذ.');
      } else if(scope==='finance'){
        const st=assistant_api.detectStalls();
        if(st.payments) steps.push(st.payments+' مدفوعات بانتظار المراجعة/الفاتورة.');
        if(st.collections) steps.push(st.collections+' تحصيلات مؤجلة بانتظار المتابعة.');
      }
    }catch(e){}
    return steps;
  },

  /* ---------- 8) رؤى موحّدة للتضمين داخل الصفحات ---------- */
  /* الناتج: مصفوفة {level:'alert'|'suggest'|'info', icon, title, detail, href} */
  getInsights(scope, id){
    const out = [];
    try{
      if(scope==='dashboard'){
        const st = assistant_api.detectStalls();
        if(st.campaigns.length) out.push({level:'alert',icon:'alert',title:st.campaigns.length+' حملات متعثرة',detail:st.campaigns.slice(0,3).map(c=>c.name+' ('+c.progress+'%)').join(' · '),href:'orders-campaigns.html'});
        if(st.approvals) out.push({level:'suggest',icon:'user-check',title:st.approvals+' اعتمادات معلّقة',detail:'ترشيحات بانتظار قرار العميل',href:'orders-campaigns.html'});
        if(st.bookings) out.push({level:'suggest',icon:'calendar',title:st.bookings+' حجوزات معلّقة',detail:'روابط حجز أُرسلت ولم تُؤكَّد',href:'orders-campaigns.html'});
        if(st.collections) out.push({level:'alert',icon:'wallet',title:st.collections+' تحصيلات مؤجلة',detail:'دفعات عملاء مؤجلة بانتظار التحصيل',href:'finance.html'});
        if(st.payments) out.push({level:'suggest',icon:'wallet',title:st.payments+' مدفوعات معلّقة',detail:'حوالات/فواتير بانتظار المراجعة',href:'finance.html'});
        if(st.tasks) out.push({level:'alert',icon:'clock',title:st.tasks+' مهام متأخرة',detail:'مهام تشغيلية تجاوزت موعدها',href:'tasks.html'});
        if(!out.length) out.push({level:'info',icon:'check',title:'كل شيء على ما يرام',detail:'لا تعثرات أو معلّقات تحتاج إجراءً الآن'});
      } else if(scope==='campaign'){
        const a = assistant_api.analyzeCampaign(id); if(a){ (a.next||[]).forEach(s=>out.push({level: /متأخرة|بلا حجز|بانتظار/.test(s)?'alert':'suggest', icon:'zap', title:s})); }
      } else if(scope==='client'){
        const a = assistant_api.analyzeClient(id); if(a){ if(a.pending_approval) out.push({level:'suggest',icon:'user-check',title:a.pending_approval+' بانتظار اعتماد العميل'}); (a.next||[]).forEach(s=>out.push({level:'info',icon:'zap',title:s})); }
      } else if(scope==='influencer'){
        const a = assistant_api.analyzeInfluencer(id); if(a){ (a.next||[]).forEach(s=>out.push({level:'suggest',icon:'zap',title:s})); if(a.approval_rate!=null && a.approval_rate<40) out.push({level:'info',icon:'info',title:'معدل اعتماد منخفض ('+a.approval_rate+'%)'}); }
      } else if(scope==='finance'){
        const a = assistant_api.analyzeFinance();
        if(a.pending_collections) out.push({level:'alert',icon:'wallet',title:a.pending_collections+' تحصيلات مؤجلة'});
        if(a.pending_payments) out.push({level:'suggest',icon:'wallet',title:a.pending_payments+' مدفوعات بانتظار المراجعة'});
        if(a.receipts!=null) out.push({level:'info',icon:'file',title:a.receipts+' إيصالات مرفوعة · '+a.invoices+' فواتير'});
      }
    }catch(e){}
    return out;
  },

  /* ---------- 9) تقرير ذكي نصي ---------- */
  buildReport(scope, id){
    const L=[];
    if(scope==='campaign'){ const a=assistant_api.analyzeCampaign(id); if(!a) return 'الحملة غير موجودة'; 
      L.push('تقرير الحملة: '+a.name, 'العميل: '+(a.customer||'—')+' · الحالة: '+(a.status||'—')+(a.progress!=null?' · التقدّم: '+a.progress+'%':''),
        'الترشيحات: '+a.nominations+' (معتمد: '+a.approved+') · الحجوزات: '+a.bookings, 'الحوالات: '+a.transfers+' (منفّذة: '+a.transfers_done+') · مهام مفتوحة: '+a.open_tasks);
      if(a.next&&a.next.length){ L.push('الخطوات التالية:'); a.next.forEach(s=>L.push(' • '+s)); }
    } else if(scope==='client'){ const a=assistant_api.analyzeClient(id); if(!a) return 'العميل غير موجود';
      L.push('تقرير العميل: '+a.name, 'الحملات: '+a.campaigns_total+' (نشطة: '+a.active+' · مكتملة: '+a.completed+')'+(a.total_billed!=null?' · إجمالي الفوترة: '+a.total_billed:''));
      if(a.next&&a.next.length){ L.push('الخطوات التالية:'); a.next.forEach(s=>L.push(' • '+s)); }
    } else if(scope==='influencer'){ const a=assistant_api.analyzeInfluencer(id); if(!a) return 'المؤثر غير موجود';
      L.push('تقرير المؤثر: '+a.name, (a.city||'')+(a.classification?' · '+a.classification:'')+(a.rating?' · التقييم: '+a.rating:''),
        'الترشيحات: '+a.nominations+(a.approval_rate!=null?' · معدل الاعتماد: '+a.approval_rate+'%':'')+(a.ads_completed!=null?' · إعلانات منفّذة: '+a.ads_completed:'')+(a.total_earned!=null?' · إجمالي العوائد: '+a.total_earned:''));
    } else if(scope==='finance'){ const a=assistant_api.analyzeFinance();
      L.push('التقرير المالي', 'الإجمالي: '+a.total_amount+' · منفّذ: '+a.completed_amount+' · معلّق: '+a.pending_amount,
        'تحصيلات مؤجلة: '+a.pending_collections+' · مدفوعات معلّقة: '+a.pending_payments, 'إيصالات: '+a.receipts+' · فواتير: '+a.invoices);
    } else {
      const st=assistant_api.detectStalls();
      L.push('الملخّص التشغيلي', 'حملات متعثرة: '+st.campaigns.length+' · اعتمادات معلّقة: '+st.approvals+' · حجوزات معلّقة: '+st.bookings, 'تحصيلات: '+st.collections+' · مدفوعات: '+st.payments+' · مهام متأخرة: '+st.tasks);
    }
    return L.join('\n');
  },

  /* ---------- 10) لقطة سياق مضغوطة للنموذج اللغوي ---------- */
  _contextSnapshot(ctx){
    ctx = ctx||{};
    const snap = {};
    try{ snap.summary = analytics_api.getOperationalSummary(); }catch(e){}
    try{ snap.stalls = assistant_api.detectStalls(); }catch(e){}
    if(ctx.scope==='campaign' && ctx.id){ snap.campaign = assistant_api.analyzeCampaign(ctx.id); }
    if(ctx.scope==='client' && ctx.id){ snap.client = assistant_api.analyzeClient(ctx.id); }
    if(ctx.scope==='influencer' && ctx.id){ snap.influencer = assistant_api.analyzeInfluencer(ctx.id); }
    if(ctx.scope==='finance'){ snap.finance = assistant_api.analyzeFinance(); }
    return JSON.stringify(snap).slice(0, 6000);
  },

  /* ---------- 11) سؤال حر — تحليل فوري على بيانات النظام ---------- */
  async ask(question, ctx){
    ctx = ctx||{};
    const q = String(question||'').trim();
    const local = assistant_api._localAnswer(q, ctx);
    return { answer: local.text, local, data: local.data };
  },

  /* إجابة محلية حتمية بلا نموذج خارجي */
  _localAnswer(q, ctx){
    const ql = q.toLowerCase();
    // نية البحث
    const sr = assistant_api.search(q);
    if(sr.total && (ql.length<40)){
      const lines = sr.groups.map(g=>g.label+': '+g.count+' نتيجة'); 
      return { kind:'search', text:'نتائج البحث عن «'+q+'»:\n'+lines.join('\n'), data:sr };
    }
    // نية تقرير/تحليل حسب السياق
    if(ctx.scope){ return { kind:'report', text: assistant_api.buildReport(ctx.scope, ctx.id), data:null }; }
    // افتراضي: ملخّص تشغيلي
    return { kind:'summary', text: assistant_api.buildReport('dashboard'), data: assistant_api.detectStalls() };
  }
};




/* ═══════════════════════════════════════════════════════════════════════
   REQUESTS MODULE — منصة الطلبات
   نقطة البداية الرسمية لطلبات علاقات المؤثرين. تستقبل البريف، تُقيّمه،
   تُرشّح، تُعتمد، تُسعّر، تُحصّل، ثم تتحوّل تلقائياً إلى حملة فعلية.
   مصدر بيانات واحد — لا تكرار: العميل/الترشيح/المستندات تُعاد لاستخدامها في الحملة.
   ═══════════════════════════════════════════════════════════════════════ */
const requests         = makeEntity('requests',         'REQ');
const request_users    = makeEntity('request_users',    'RQU');
const request_timeline = makeEntity('request_timeline', 'RTL');
const request_messages = makeEntity('request_messages', 'RMSG');

const REQUEST_TYPES = {
  campaign:   'طلب حملة مؤثرين',
  nomination: 'طلب ترشيح مؤثرين فقط',
  ugc:        'طلب مشروع UGC',
  coverage:   'طلب تغطية',
  quotation:  'طلب عرض سعر',
  restart:    'طلب إعادة تشغيل حملة',
  special:    'طلب خاص'
};
const REQUEST_SOURCES = {
  internal_employee:  'موظف داخلي',
  project_management: 'إدارة المشاريع',
  external_client:    'عميل خارجي',
  external_user:      'مستخدم خارجي مصرّح',
  secure_link:        'رابط طلب آمن',
  from_customer:      'من صفحة العميل'
};
const REQUEST_STATUSES = [
  'new','under_review','awaiting_completion','ready_for_nomination',
  'awaiting_internal_approval','awaiting_client_approval','awaiting_quotation',
  'awaiting_collection','ready_for_campaign','converted','stalled','completed','cancelled'
];
const REQUEST_STATUS_LABELS = {
  new:'جديد', under_review:'قيد المراجعة', awaiting_completion:'بانتظار الاستكمال',
  ready_for_nomination:'جاهز للترشيح', awaiting_internal_approval:'بانتظار الاعتماد الداخلي',
  awaiting_client_approval:'بانتظار اعتماد العميل', awaiting_quotation:'بانتظار عرض السعر',
  awaiting_collection:'بانتظار التحصيل', ready_for_campaign:'جاهز للتحويل إلى حملة',
  converted:'محوّل إلى حملة', stalled:'متعثّر', completed:'مكتمل', cancelled:'ملغى'
};
// حقول البريف — تقييم الاكتمال يعتمدها
const BRIEF_FIELDS = [
  { key:'project_name',  label:'اسم المشروع',        required:true },
  { key:'goal',          label:'هدف الحملة',          required:true },
  { key:'description',   label:'وصف الحملة',          required:true },
  { key:'audience',      label:'الجمهور المستهدف',    required:true },
  { key:'platforms',     label:'المنصات',             required:true, isList:true },
  { key:'budget',        label:'الميزانية',           required:true },
  { key:'with_vat',      label:'هل المبلغ شامل الضريبة؟', required:false, isBool:true },
  { key:'period',        label:'الفترة المقترحة',     required:true },
  { key:'cities',        label:'المدن المستهدفة',     required:false, isList:true },
  { key:'influencer_type',label:'نوع المؤثرين',       required:false },
  { key:'influencer_count',label:'عدد المؤثرين',      required:true },
  { key:'content_type',  label:'نوع المحتوى',         required:false },
  { key:'links',         label:'الروابط المهمة',      required:false, isList:true },
  { key:'notes',         label:'ملاحظات',             required:false },
  { key:'shipping',      label:'عناوين الشحن',        required:false }
];

function _reqActor(){ return window.SC?.auth?.getSession?.()?.name || 'النظام'; }

function logRequestTimeline(requestId, action, actor, payload){
  request_timeline.create({
    request_id: requestId, action,
    actor: actor || _reqActor(),
    actor_id: window.SC?.auth?.getSession?.()?.id || null,
    payload: payload || {}, timestamp: new Date().toISOString()
  });
}

const requests_api = {
  TYPES: REQUEST_TYPES, SOURCES: REQUEST_SOURCES,
  STATUSES: REQUEST_STATUSES, STATUS_LABELS: REQUEST_STATUS_LABELS,
  BRIEF_FIELDS,

  list(filters){ return requests.list(filters); },
  get(id){ return requests.get(id); },
  update(id, patch){ return requests.update(id, patch); },

  typeLabel(t){ return REQUEST_TYPES[t] || t || '—'; },
  sourceLabel(s){ return REQUEST_SOURCES[s] || s || '—'; },
  statusLabel(s){ return REQUEST_STATUS_LABELS[s] || s || '—'; },

  /** إنشاء طلب — يولّد رقماً، يسجّل، ينشئ مهمة مراجعة تلقائية، ويشعر */
  create(payload){
    payload = payload || {};
    // مصدر واحد: إن ارتبط بعميل موجود، انسخ اسمه دون إعادة إدخال
    let customerName = payload.customer_name || '';
    if(payload.customer_id){
      const cust = customers.get(payload.customer_id);
      if(cust) customerName = cust.name;
    }
    const brief = Object.assign({}, payload.brief || {});
    // إن لم يُمرّر اسم مشروع، استخدم اسم الطلب
    if(!brief.project_name && payload.title) brief.project_name = payload.title;
    const req = requests.create({
      number: payload.number || ('REQ-' + Math.random().toString(36).slice(2,7).toUpperCase()),
      title: payload.title || brief.project_name || 'طلب جديد',
      type: payload.type || 'campaign',
      source: payload.source || 'internal_employee',
      customer_id: payload.customer_id || null,
      customer_name: customerName || null,
      requested_by: payload.requested_by || _reqActor(),
      request_user_id: payload.request_user_id || null,     // المستخدم الخارجي إن وُجد
      owner: payload.owner || '',                            // الموظف المسؤول
      status: payload.status || 'new',
      priority: payload.priority || 'medium',
      brief,
      campaign_id: null,
      converted_at: null,
      stalled_reason: null,
      attachments: payload.attachments || []
    });
    logRequestTimeline(req.id, 'request_created', payload.requested_by || _reqActor(), { number: req.number, type: req.type, source: req.source });
    try { this.autoSync(req.id); } catch(e){}
    try {
      if(window.SC?.system?.addNotification){
        window.SC.system.addNotification({ title:'طلب جديد', message:`طلب جديد ${req.number} — ${req.title}`, type:'request', link:`request-detail.html?id=${req.id}` });
      }
    } catch(e){}
    return req;
  },

  /** تقييم اكتمال البريف تلقائياً */
  briefCompleteness(requestId){
    const req = typeof requestId === 'object' ? requestId : requests.get(requestId);
    if(!req) return { pct:0, status:'incomplete', missing:[], filled:0, total:0 };
    const brief = req.brief || {};
    const reqFields = BRIEF_FIELDS.filter(f => f.required);
    const missing = [];
    let filled = 0;
    reqFields.forEach(f => {
      const v = brief[f.key];
      const ok = f.isList ? (Array.isArray(v) ? v.length>0 : !!String(v||'').trim())
                          : (v !== undefined && v !== null && String(v).trim() !== '');
      if(ok) filled++; else missing.push(f.label);
    });
    const pct = reqFields.length ? Math.round(filled / reqFields.length * 100) : 100;
    const status = missing.length === 0 ? 'complete' : (filled === 0 ? 'incomplete' : 'needs_clarification');
    return { pct, status, missing, filled, total: reqFields.length };
  },

  /** تحديث البريف (مصدر واحد — يُعاد استخدامه في الحملة) */
  updateBrief(requestId, patch){
    const req = requests.get(requestId);
    if(!req) throw new Error('الطلب غير موجود');
    const brief = Object.assign({}, req.brief || {}, patch || {});
    requests.update(requestId, { brief });
    logRequestTimeline(requestId, 'brief_updated', _reqActor(), { fields: Object.keys(patch||{}) });
    try { this.autoSync(requestId); } catch(e){}
    return requests.get(requestId);
  },

  /** طلب استكمال النواقص من الجهة الخارجية */
  requestCompletion(requestId, note){
    const req = requests.get(requestId);
    if(!req) throw new Error('الطلب غير موجود');
    requests.update(requestId, { status:'awaiting_completion' });
    logRequestTimeline(requestId, 'completion_requested', _reqActor(), { note: note||'', missing: this.briefCompleteness(req).missing });
    try { if(window.SC?.system?.addNotification) window.SC.system.addNotification({ title:'طلب استكمال', message:`الطلب ${req.number} يحتاج استكمال البريف`, type:'request', link:`request-detail.html?id=${requestId}` }); } catch(e){}
    return requests.get(requestId);
  },

  setStatus(requestId, status, note){
    const req = requests.get(requestId);
    if(!req) throw new Error('الطلب غير موجود');
    if(REQUEST_STATUSES.indexOf(status) === -1) throw new Error('حالة غير صالحة');
    const patch = { status };
    if(status === 'stalled') patch.stalled_reason = note || 'غير محدّد';
    requests.update(requestId, patch);
    logRequestTimeline(requestId, 'status_changed', _reqActor(), { to: status, note: note||'' });
    try { this.autoSync(requestId); } catch(e){}
    return requests.get(requestId);
  },

  /* ── المراسلات (داخلية/خارجية) ── */
  addMessage(requestId, payload){
    payload = payload || {};
    const msg = request_messages.create({
      request_id: requestId,
      body: payload.body || '',
      visibility: payload.visibility === 'external' ? 'external' : 'internal',
      author: payload.author || _reqActor(),
      author_role: payload.author_role || (window.SC?.auth?.getSession?.()?.role) || '',
      attachments: payload.attachments || []
    });
    logRequestTimeline(requestId, payload.visibility === 'external' ? 'message_external' : 'message_internal', msg.author, { excerpt: String(payload.body||'').slice(0,80), visibility: msg.visibility });
    return msg;
  },
  messages(requestId, visibility){
    let list = request_messages.list().filter(m => m.request_id === requestId);
    if(visibility) list = list.filter(m => m.visibility === visibility);
    return list.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
  },

  timeline(requestId){
    return request_timeline.list().filter(t => t.request_id === requestId)
      .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  /* ── المرفقات (تُحفظ فعلياً داخل الطلب — base64) ── */
  addAttachment(requestId, file){
    const req = requests.get(requestId);
    if(!req) throw new Error('الطلب غير موجود');
    const list = Array.isArray(req.attachments) ? req.attachments.slice() : [];
    const att = {
      id: 'ATT-' + Math.random().toString(36).slice(2,9),
      name: file.name || 'ملف',
      type: file.type || '',
      size: file.size || 0,
      data: file.data || '',              // base64 data URL
      by: file.by || _reqActor(),
      at: new Date().toISOString()
    };
    list.push(att);
    requests.update(requestId, { attachments: list });
    logRequestTimeline(requestId, 'attachment_uploaded', att.by, { name: att.name, id: att.id });
    return att;
  },
  attachments(requestId){
    const req = requests.get(requestId);
    return req && Array.isArray(req.attachments) ? req.attachments : [];
  },
  removeAttachment(requestId, attId){
    const req = requests.get(requestId);
    if(!req) return false;
    const list = (req.attachments || []).filter(a => a.id !== attId);
    requests.update(requestId, { attachments: list });
    logRequestTimeline(requestId, 'attachment_removed', _reqActor(), { id: attId });
    return true;
  },

  /** حذف الطلب نهائياً + تنظيف مراسلاته وسجله ومهامه (لا يحذف الحملة المرتبطة) */
  deleteRequest(requestId){
    const req = requests.get(requestId);
    if(!req) return false;
    request_messages.list().filter(m => m.request_id === requestId).forEach(m => request_messages.remove(m.id));
    request_timeline.list().filter(t => t.request_id === requestId).forEach(t => request_timeline.remove(t.id));
    try { tasks.list().filter(t => t.related_type === 'request' && t.related_to === requestId).forEach(t => tasks.remove(t.id)); } catch(e){}
    requests.remove(requestId);
    return true;
  },

  /* ── المهام المؤتمتة للطلب (تُسند وتُغلق تلقائياً) ── */
  _expectedTasks(requestId){
    const req = requests.get(requestId);
    if(!req) return [];
    const bc = this.briefCompleteness(req);
    const out = [];
    const owner = req.owner || '';
    if(req.status === 'new')                      out.push({ key:'review',  title:'مراجعة الطلب الجديد', stage:'مراجعة', who:owner||'منسّق الطلبات', priority:'high' });
    if(bc.status !== 'complete' && req.status !== 'converted' && req.status !== 'cancelled')
      out.push({ key:'complete_brief', title:'استكمال نواقص البريف: '+bc.missing.slice(0,3).join(' · '), stage:'استكمال', who:owner||'منسّق الطلبات', priority:'high' });
    if(bc.status === 'complete' && ['new','under_review','awaiting_completion','ready_for_nomination'].includes(req.status))
      out.push({ key:'nominate', title:'بدء ترشيح المؤثرين', stage:'ترشيح', who:owner||'منسّق المؤثرين', priority:'medium' });
    if(req.status === 'awaiting_internal_approval') out.push({ key:'follow_internal', title:'متابعة الاعتماد الداخلي', stage:'اعتماد', who:'مدير العمليات', priority:'medium' });
    if(req.status === 'awaiting_client_approval')   out.push({ key:'follow_client', title:'متابعة اعتماد العميل', stage:'اعتماد', who:owner||'منسّق الطلبات', priority:'medium' });
    if(req.status === 'awaiting_collection')        out.push({ key:'follow_collection', title:'متابعة التحصيل', stage:'تحصيل', who:'المالية', priority:'high' });
    if(req.status === 'ready_for_campaign')         out.push({ key:'convert', title:'تحويل الطلب إلى حملة', stage:'تحويل', who:owner||'منسّق الطلبات', priority:'high' });
    return out.map(t => Object.assign(t, { key: 'req_'+requestId+'_'+t.key }));
  },
  autoTasksFor(requestId){
    return tasks.list().filter(t => t.auto && t.related_type === 'request' && t.related_to === requestId);
  },
  autoSync(requestId){
    if(!requestId) return;
    let expected; try { expected = this._expectedTasks(requestId); } catch(e){ return; }
    const req = requests.get(requestId) || {};
    const expectedByKey = {}; expected.forEach(e => expectedByKey[e.key] = e);
    const existing = this.autoTasksFor(requestId);
    const existingByKey = {}; existing.forEach(t => existingByKey[t.auto_key] = t);
    expected.forEach(e => {
      if(!existingByKey[e.key]){
        tasks.create({
          title: e.title, assigned_by:'النظام (تلقائي)', assigned_by_id:'system', assigned_to: e.who || '',
          related_type:'request', related_to: requestId, related_name: req.number || req.title || '',
          request_id: requestId, workflow_step: e.stage, priority: e.priority || 'medium',
          status:'pending', auto:true, auto_key: e.key
        });
      }
    });
    existing.forEach(t => {
      if(t.status !== 'done' && !expectedByKey[t.auto_key]){
        tasks.update(t.id, { status:'done', completed_at:new Date().toISOString(), completed_by:'النظام (تلقائي)', auto_closed:true });
      }
    });
    return this.autoTasksFor(requestId);
  },

  /** الخطوة التالية + المسؤول + النواقص (يقود المستخدم) */
  guidance(requestId){
    const req = requests.get(requestId);
    if(!req) return null;
    const bc = this.briefCompleteness(req);
    const MAP = {
      new:                       { next:'مراجعة الطلب',              who:'منسّق الطلبات',  action:'review' },
      under_review:              { next:'تقييم البريف واستكماله',    who:'منسّق الطلبات',  action:'review' },
      awaiting_completion:       { next:'استكمال نواقص البريف',      who:'الجهة الطالبة',  action:'complete' },
      ready_for_nomination:      { next:'بدء ترشيح المؤثرين',        who:'منسّق المؤثرين', action:'nominate' },
      awaiting_internal_approval:{ next:'الاعتماد الداخلي للترشيحات',who:'مدير العمليات',  action:'internal' },
      awaiting_client_approval:  { next:'اعتماد العميل للترشيحات',   who:'العميل',         action:'client' },
      awaiting_quotation:        { next:'إصدار عرض السعر',           who:'المالية',        action:'quotation' },
      awaiting_collection:       { next:'تحصيل العميل',              who:'المالية',        action:'collection' },
      ready_for_campaign:        { next:'تحويل الطلب إلى حملة',      who:'منسّق الطلبات',  action:'convert' },
      converted:                 { next:'تمّ التحويل إلى حملة',      who:'—',              action:null, done:true },
      completed:                 { next:'الطلب مكتمل',               who:'—',              action:null, done:true },
      cancelled:                 { next:'الطلب ملغى',                who:'—',              action:null, done:true },
      stalled:                   { next:'معالجة سبب التعثّر',        who:'منسّق الطلبات',  action:'review' }
    };
    const m = MAP[req.status] || MAP.new;
    const idx = REQUEST_STATUSES.indexOf(req.status);
    return {
      done: !!m.done,
      currentLabel: REQUEST_STATUS_LABELS[req.status] || req.status,
      nextLabel: m.next, responsible: m.who, action: m.action,
      stageIndex: idx >= 0 ? idx+1 : 1, totalStages: 11,
      briefStatus: bc.status, briefMissing: bc.missing, briefPct: bc.pct,
      stalled: req.status === 'stalled', stalledReason: req.stalled_reason || ''
    };
  },

  /** تحويل الطلب إلى حملة فعلية — مصدر واحد: ينقل العميل/البريف/الترشيحات ويربط الطرفين */
  convertToCampaign(requestId, opts){
    opts = opts || {};
    const req = requests.get(requestId);
    if(!req) throw new Error('الطلب غير موجود');
    if(req.campaign_id) return { campaign_id: req.campaign_id, already: true };
    const bc = this.briefCompleteness(req);
    if(bc.status !== 'complete' && !opts.force){
      throw new Error('البريف ناقص — التحويل يتطلّب صلاحية إدارية (force) أو استكمال النواقص');
    }
    // العميل: استخدم المرتبط أو أنشئه من البريف (دون تكرار)
    let customerId = req.customer_id;
    if(!customerId && req.customer_name){
      const existing = customers.list().find(c => (c.name||'').trim() === req.customer_name.trim());
      customerId = existing ? existing.id : customers.create({ name: req.customer_name, source:'request' }).id;
    }
    const brief = req.brief || {};
    const cust = customerId ? customers.get(customerId) : null;
    const campaign = campaigns.create({
      customer_id: customerId || null,
      customer_name: cust ? cust.name : (req.customer_name || ''),
      name: brief.project_name || req.title || 'حملة من طلب',
      campaign_name: brief.project_name || req.title || '',
      budget: Number(brief.budget) || null,
      with_vat: !!brief.with_vat,
      platforms: brief.platforms || [],
      cities: brief.cities || [],
      goal: brief.goal || '',
      description: brief.description || '',
      audience: brief.audience || '',
      period: brief.period || '',
      influencer_count: brief.influencer_count || null,
      content_type: brief.content_type || '',
      request_id: requestId,
      request_number: req.number,
      source: 'request',
      status: 'draft'
    });
    // انقل ترشيحات الطلب (إن وُجدت) إلى الحملة — مصدر واحد، بلا إعادة إدخال
    const reqNoms = campaign_nominations.list().filter(n => n.request_id === requestId && !n.campaign_id);
    reqNoms.forEach(n => {
      campaign_nominations.update(n.id, { campaign_id: campaign.id });
    });
    requests.update(requestId, { campaign_id: campaign.id, converted_at: new Date().toISOString(), status: 'converted' });
    logRequestTimeline(requestId, 'converted_to_campaign', _reqActor(), { campaign_id: campaign.id, campaign_name: campaign.name });
    try { logTimeline(campaign.id, 'campaign_created', _reqActor(), { from_request: req.number, request_id: requestId }); } catch(e){}
    try { if(window.SC?.system?.addNotification) window.SC.system.addNotification({ title:'تحويل إلى حملة', message:`الطلب ${req.number} أصبح حملة: ${campaign.name}`, type:'campaign', link:`campaign-detail.html?id=${campaign.id}` }); } catch(e){}
    try { this.autoSync(requestId); campaign_tasks_api.autoSync(campaign.id); } catch(e){}
    return { campaign_id: campaign.id, campaign, already: false };
  },

  /** إحصاءات لوحة الطلبات (كروت المؤشرات) — من بيانات حقيقية */
  stats(filters){
    const all = requests.list(filters);
    const by = s => all.filter(r => r.status === s).length;
    const internalSrc = ['internal_employee','project_management'];
    return {
      total: all.length,
      new: by('new'),
      internal: all.filter(r => internalSrc.includes(r.source)).length,
      external: all.filter(r => !internalSrc.includes(r.source)).length,
      under_review: by('under_review'),
      awaiting_completion: by('awaiting_completion'),
      ready_for_nomination: by('ready_for_nomination'),
      awaiting_approval: by('awaiting_internal_approval') + by('awaiting_client_approval'),
      awaiting_collection: by('awaiting_collection'),
      stalled: by('stalled'),
      converted: by('converted'),
      completed: by('completed'),
      ready_for_campaign: by('ready_for_campaign')
    };
  },

  /** طلبات تحتاج إجراءً (للوحة التحكم) */
  needingAction(){
    const actionable = ['new','under_review','awaiting_completion','ready_for_nomination','awaiting_collection','ready_for_campaign','stalled'];
    return requests.list().filter(r => actionable.includes(r.status))
      .sort((a,b) => new Date(b.updated_at||b.created_at) - new Date(a.updated_at||a.created_at));
  },

  /* ── تصنيف المصدر (داخلي / عميل خارجي / إدارة مشاريع) ── */
  sourceGroup(reqOrSource){
    const s = (typeof reqOrSource === 'object' && reqOrSource) ? reqOrSource.source : reqOrSource;
    if(s === 'external_client') return 'client';
    if(s === 'project_management') return 'pm';
    if(s === 'external_user' || s === 'secure_link') return 'external';
    return 'internal';
  },
  sourceGroupLabel(g){ return ({ internal:'طلب داخلي', client:'خارجي — عميل', pm:'خارجي — إدارة مشاريع', external:'خارجي — مستخدم' })[g] || g; },
  isExternal(req){ return this.sourceGroup(req) !== 'internal'; },

  lastExternalReply(reqId){
    const ext = request_messages.list().filter(m => m.request_id === reqId && m.visibility === 'external')
      .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    const tl  = request_timeline.list().filter(t => t.request_id === reqId && /external|attachment_uploaded|nomination/.test(t.action))
      .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    const cand = [];
    if(ext[0]) cand.push({ at:ext[0].created_at, by:ext[0].author, text:ext[0].body });
    if(tl[0])  cand.push({ at:tl[0].timestamp, by:tl[0].actor, text:(tl[0].payload&&tl[0].payload.excerpt)||'' });
    cand.sort((a,b)=>new Date(b.at)-new Date(a.at));
    return cand[0] || null;
  },
  lastInternalAction(reqId){
    const tl = request_timeline.list().filter(t => t.request_id === reqId && !/external/.test(t.action))
      .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    return tl[0] ? { at:tl[0].timestamp, by:tl[0].actor, action:tl[0].action } : null;
  },
  currentResponsible(reqId){ const g = this.guidance(reqId); return g ? g.responsible : '—'; },

  /* ── تصنيف اللوحة الداخلية ── */
  category(req){
    const s = req.status;
    if(['awaiting_completion','awaiting_client_approval'].includes(s)) return 'awaiting_external';
    if(s === 'awaiting_internal_approval') return 'awaiting_approval';
    if(s === 'ready_for_campaign') return 'ready_for_campaign';
    if(['new','under_review','ready_for_nomination','awaiting_quotation','awaiting_collection','stalled'].includes(s)) return 'awaiting_internal';
    return 'other';
  }
};

/* ── مستخدمو الطلبات (داخلي/عميل/منسّق خارجي/ضيف برابط) ── */
const REQUEST_USER_TYPES = {
  project_employee:'موظف إدارة مشاريع', client:'عميل', external_coordinator:'منسّق خارجي', guest:'مستخدم ضيف برابط آمن'
};
const REQUEST_USER_PERMISSIONS = [
  'create_request','edit_before_review','upload_attachments','add_notes','track_status',
  'approve_nominations','reject_nominations','hold_nominations','request_alternative',
  'add_shipping','approve_dates','view_final_files','view_linked_only'
];
const request_users_api = {
  TYPES: REQUEST_USER_TYPES, PERMISSIONS: REQUEST_USER_PERMISSIONS,
  list(f){ return request_users.list(f); },
  get(id){ return request_users.get(id); },
  getByToken(token){ return request_users.list().find(u => u.token === token) || null; },
  create(payload){
    payload = payload || {};
    const u = request_users.create({
      name: payload.name || '', org: payload.org || '', role: payload.role || '',
      email: payload.email || '', phone: payload.phone || '',
      user_type: payload.user_type || 'client',
      status: payload.status || 'active',
      customer_id: payload.customer_id || null,
      department: payload.department || '',
      permissions: payload.permissions || ['create_request','upload_attachments','add_notes','track_status','approve_nominations','reject_nominations','hold_nominations','request_alternative','view_linked_only'],
      token: payload.token || ('rqu_' + Math.random().toString(36).slice(2,10) + Date.now().toString(36)),
      last_login: null, requests_count: 0
    });
    return u;
  },
  update(id, patch){ return request_users.update(id, patch); },
  disable(id){ return request_users.update(id, { status:'disabled' }); },
  enable(id){ return request_users.update(id, { status:'active' }); },
  setPermissions(id, perms){ return request_users.update(id, { permissions: perms || [] }); },
  linkCustomer(id, customerId){ const c = customers.get(customerId); return request_users.update(id, { customer_id: customerId, customer_name: c?c.name:'' }); },
  requestsFor(userId){ return requests.list().filter(r => r.request_user_id === userId); },
  touchLogin(id){ return request_users.update(id, { last_login: new Date().toISOString() }); }
};


window.SC.api = {
  customers, influencers, campaigns, transfers,
  daily_ads, ugc_creators, content, team,
  campaign_ads, my_work, tasks,
  settings,
  ad_tasks,
  influencer_notifications,
  
  // === Influencer Portal (external) ===
  influencer_auth,
  influencer_portal,
  
  // === Requests Module — منصة الطلبات ===
  requests: requests_api,
  request_users: request_users_api,
  request_timeline,
  request_messages,
  REQUEST_TYPES, REQUEST_SOURCES, REQUEST_STATUSES, REQUEST_STATUS_LABELS,

  // === Campaign Operational Workflow ===
  campaign_nominations: campaign_nominations_api,
  campaign_workflow,
  calendar_events: calendar_events_api,
  campaign_tasks: campaign_tasks_api,
  client_approval: client_approval_api,
  influencer_booking: influencer_booking_api,
  campaign_finance: campaign_finance_api,
  campaign_documents: campaign_documents_api,
  campaign_content: campaign_content_api,
  campaign_timeline,
  approval_tokens,
  CAMPAIGN_STATES,
  CAMPAIGN_STATE_LABELS,
  
  // === Analytics — real data only ===
  analytics: analytics_api,

  // === Smart Assistant (محرّك تحليل فعلي) ===
  assistant: assistant_api,
  
  // === UGC Creator Network ===
  ugc_applications,
  ugc_submissions,
  ugc_transactions,
  ugc_packages,
  ugc_campaigns,
  ugc_auth,
  ugc_matching,
  ugc_wallet,
  ugc_apps: ugc_application_helpers,
  
  // === WhatsApp Business API entities ===
  whatsapp_numbers,
  whatsapp_templates,
  whatsapp_conversations,
  whatsapp_messages,
  whatsapp_broadcasts,
  whatsapp_automations,
  whatsapp_config,
  
  dashboardStats, recentActivity,
  getCampaignsForCustomer, getTransfersForCampaign, getInfluencerByPlatformSubs,
  
  // Ad ↔ Transfer linking
  linkTransferToAd, unlinkTransferFromAd, syncLinkedAds, 
  computeAdTransferStatus, getSuggestedAdsForTransfer,
  
  exportAll, importAll, storageStats,
  
  uuid: uuid,
  logActivity: logActivity
};

console.log('Smart Code API layer loaded');

})(window);
