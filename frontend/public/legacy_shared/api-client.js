/* ===========================================================
   SMART CODE — Backend API Client
   Connects frontend to Laravel backend (Phase 2)
   
   Usage:
   - Set SC.apiClient.baseUrl in localStorage 'sc_api_url' to enable
   - Falls back to localStorage if backend unavailable
   - All API calls return Promises
   =========================================================== */

(function(window){
'use strict';

const apiClient = {
  
  /* Configuration */
  baseUrl: null,
  token: null,
  enabled: false,
  
  /* Init: check if backend mode is enabled */
  init(){
    this.baseUrl = localStorage.getItem('sc_api_url') || '';
    this.token = localStorage.getItem('sc_api_token') || '';
    this.enabled = !!this.baseUrl;
    
    if(this.enabled){
      console.log('[API] Backend mode enabled:', this.baseUrl);
    } else {
      console.log('[API] localStorage mode (no backend configured)');
    }
  },
  
  /* Enable backend mode */
  configure(baseUrl, token){
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token || '';
    this.enabled = true;
    localStorage.setItem('sc_api_url', this.baseUrl);
    if(token) localStorage.setItem('sc_api_token', token);
  },
  
  disable(){
    this.enabled = false;
    localStorage.removeItem('sc_api_url');
    localStorage.removeItem('sc_api_token');
  },
  
  /* Core request method */
  async request(method, path, body = null, opts = {}){
    if(!this.enabled){
      throw new Error('Backend not configured');
    }
    
    const url = this.baseUrl + '/api/v1' + (path.startsWith('/') ? path : '/' + path);
    
    const headers = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(opts.headers || {})
    };
    
    if(this.token){
      headers['Authorization'] = 'Bearer ' + this.token;
    }
    
    const config = { method, headers };
    
    if(body){
      if(body instanceof FormData){
        config.body = body;
      } else {
        headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(body);
      }
    }
    
    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));
      
      if(!response.ok){
        const err = new Error(data.error || data.message || 'API Error');
        err.status = response.status;
        err.data = data;
        throw err;
      }
      
      return data;
    } catch(err){
      if(err.status === 401){
        // Token expired - clear and redirect
        this.token = '';
        localStorage.removeItem('sc_api_token');
        if(window.location.pathname !== '/login.html'){
          window.location.href = 'login.html';
        }
      }
      throw err;
    }
  },
  
  /* Convenience methods */
  get(path, opts){ return this.request('GET', path, null, opts); },
  post(path, body, opts){ return this.request('POST', path, body, opts); },
  patch(path, body, opts){ return this.request('PATCH', path, body, opts); },
  put(path, body, opts){ return this.request('PUT', path, body, opts); },
  delete(path, opts){ return this.request('DELETE', path, null, opts); },
  
  /* ============== AUTHENTICATION ============== */
  
  auth: {
    async login(username, password){
      const res = await apiClient.request('POST', '/auth/login', { username, password });
      if(res.access_token){
        apiClient.token = res.access_token;
        localStorage.setItem('sc_api_token', res.access_token);
        localStorage.setItem('sc_user', JSON.stringify(res.user));
      }
      return res;
    },
    
    async me(){
      return apiClient.get('/auth/me');
    },
    
    async logout(){
      try { await apiClient.post('/auth/logout'); } catch(e){}
      apiClient.token = '';
      localStorage.removeItem('sc_api_token');
      localStorage.removeItem('sc_user');
    },
    
    async refresh(){
      const res = await apiClient.post('/auth/refresh');
      if(res.access_token){
        apiClient.token = res.access_token;
        localStorage.setItem('sc_api_token', res.access_token);
      }
      return res;
    },
    
    async changePassword(current, newPass){
      return apiClient.post('/auth/change-password', {
        current_password: current,
        new_password: newPass,
        new_password_confirmation: newPass,
      });
    },
  },
  
  /* ============== RESOURCES ============== */
  
  customers: {
    list(params = {}){ return apiClient.get('/customers?' + new URLSearchParams(params)); },
    get(id){ return apiClient.get('/customers/' + id); },
    create(data){ return apiClient.post('/customers', data); },
    update(id, data){ return apiClient.patch('/customers/' + id, data); },
    delete(id){ return apiClient.delete('/customers/' + id); },
    bulkDelete(ids){ return apiClient.post('/customers/bulk-delete', { ids }); },
  },
  
  influencers: {
    list(params = {}){ return apiClient.get('/influencers?' + new URLSearchParams(params)); },
    get(id){ return apiClient.get('/influencers/' + id); },
    create(data){ return apiClient.post('/influencers', data); },
    update(id, data){ return apiClient.patch('/influencers/' + id, data); },
    delete(id){ return apiClient.delete('/influencers/' + id); },
    bulkDelete(ids){ return apiClient.post('/influencers/bulk-delete', { ids }); },
  },
  
  campaigns: {
    list(params = {}){ return apiClient.get('/campaigns?' + new URLSearchParams(params)); },
    get(id){ return apiClient.get('/campaigns/' + id); },
    create(data){ return apiClient.post('/campaigns', data); },
    update(id, data){ return apiClient.patch('/campaigns/' + id, data); },
    delete(id){ return apiClient.delete('/campaigns/' + id); },
  },
  
  transfers: {
    list(params = {}){ return apiClient.get('/transfers?' + new URLSearchParams(params)); },
    get(id){ return apiClient.get('/transfers/' + id); },
    create(data){ return apiClient.post('/transfers', data); },
    update(id, data){ return apiClient.patch('/transfers/' + id, data); },
    delete(id){ return apiClient.delete('/transfers/' + id); },
    
    async upload(id, type, file, recipientId = null){
      const form = new FormData();
      form.append('type', type);
      form.append('file', file);
      if(recipientId) form.append('recipient_id', recipientId);
      return apiClient.post('/transfers/' + id + '/upload', form);
    },
    
    sendReceipt(id, opts){ return apiClient.post('/transfers/' + id + '/send-receipt', opts); },
    sendInvoice(id, opts){ return apiClient.post('/transfers/' + id + '/send-invoice', opts); },
  },
  
  tasks: {
    list(params = {}){ return apiClient.get('/tasks?' + new URLSearchParams(params)); },
    get(id){ return apiClient.get('/tasks/' + id); },
    create(data){ return apiClient.post('/tasks', data); },
    update(id, data){ return apiClient.patch('/tasks/' + id, data); },
    delete(id){ return apiClient.delete('/tasks/' + id); },
    addComment(id, content){ return apiClient.post('/tasks/' + id + '/comments', { content }); },
    updateProgress(id, progress){ return apiClient.post('/tasks/' + id + '/progress', { progress }); },
  },
  
  contents: {
    list(params = {}){ return apiClient.get('/contents?' + new URLSearchParams(params)); },
    get(id){ return apiClient.get('/contents/' + id); },
    create(data){ return apiClient.post('/contents', data); },
    update(id, data){ return apiClient.patch('/contents/' + id, data); },
    delete(id){ return apiClient.delete('/contents/' + id); },
    analyze(id){ return apiClient.post('/contents/' + id + '/analyze'); },
  },
  
  notifications: {
    list(params = {}){ return apiClient.get('/notifications?' + new URLSearchParams(params)); },
    markRead(id){ return apiClient.patch('/notifications/' + id + '/read'); },
    markAllRead(){ return apiClient.post('/notifications/mark-all-read'); },
  },
  
  search(query){
    return apiClient.get('/search?q=' + encodeURIComponent(query));
  },
  
  dashboard: {
    stats(){ return apiClient.get('/dashboard/stats'); },
  },
  
  analytics: {
    overview(params = {}){ return apiClient.get('/analytics/overview?' + new URLSearchParams(params)); },
    financial(params = {}){ return apiClient.get('/analytics/financial?' + new URLSearchParams(params)); },
  },
  
  users: {
    list(params = {}){ return apiClient.get('/users?' + new URLSearchParams(params)); },
    get(id){ return apiClient.get('/users/' + id); },
    create(data){ return apiClient.post('/users', data); },
    update(id, data){ return apiClient.patch('/users/' + id, data); },
    delete(id){ return apiClient.delete('/users/' + id); },
  },
  
  // === WhatsApp Business API client ===
  whatsapp: {
    // Configuration
    getConfig(){ return apiClient.get('/whatsapp/config'); },
    updateConfig(data){ return apiClient.put('/whatsapp/config', data); },
    testConnection(){ return apiClient.post('/whatsapp/config/test', {}); },
    generateVerifyToken(){ return apiClient.post('/whatsapp/config/generate-token', {}); },
    
    // Conversations
    listConversations(params = {}){ return apiClient.get('/whatsapp/conversations?' + new URLSearchParams(params)); },
    getMessages(convId){ return apiClient.get(`/whatsapp/conversations/${convId}/messages`); },
    updateConversation(id, data){ return apiClient.patch(`/whatsapp/conversations/${id}`, data); },
    
    // Sending
    sendText(to, body, meta){ return apiClient.post('/whatsapp/messages/send', { to, type: 'text', body, ...meta }); },
    sendTemplate(to, templateName, language, components, meta){
      return apiClient.post('/whatsapp/messages/send', {
        to, type: 'template', template_name: templateName, language, components, ...meta
      });
    },
    sendMedia(to, type, url, caption, filename){
      return apiClient.post('/whatsapp/messages/send', { to, type, media_url: url, caption, filename });
    },
    
    // Templates
    listTemplates(){ return apiClient.get('/whatsapp/templates'); },
    createTemplate(data){ return apiClient.post('/whatsapp/templates', data); },
    syncTemplates(){ return apiClient.post('/whatsapp/templates/sync', {}); },
    deleteTemplate(name){ return apiClient.delete(`/whatsapp/templates/${name}`); },
    
    // Broadcasts
    listBroadcasts(){ return apiClient.get('/whatsapp/broadcasts'); },
    createBroadcast(data){ return apiClient.post('/whatsapp/broadcasts', data); },
    executeBroadcast(id){ return apiClient.post(`/whatsapp/broadcasts/${id}/execute`, {}); },
    
    // Stats
    getStats(){ return apiClient.get('/whatsapp/stats'); },
  },
};

window.SC = window.SC || {};
window.SC.apiClient = apiClient;

apiClient.init();

console.log('Smart Code API Client loaded');

})(window);
