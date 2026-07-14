/* ===========================================================
   SMART CODE — Shared UI (icons + base CSS)
   يحقن SVG sprite + base CSS في كل صفحة
   =========================================================== */

(function(window){
'use strict';

const SVG_SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>
<symbol id="i-dashboard" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></symbol>
<symbol id="i-users" viewBox="0 0 24 24"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></symbol>
<symbol id="i-inbox" viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></symbol>
<symbol id="i-megaphone" viewBox="0 0 24 24"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></symbol>
<symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></symbol>
<symbol id="i-chart" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></symbol>
<symbol id="i-wallet" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></symbol>
<symbol id="i-folder" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></symbol>
<symbol id="i-video" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></symbol>
<symbol id="i-msg" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></symbol>
<symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></symbol>
<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></symbol>
<symbol id="i-home" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></symbol>
<symbol id="i-chevron-left" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></symbol>
<symbol id="i-chevron-right" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></symbol>
<symbol id="i-chevron-down" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></symbol>
<symbol id="i-bell" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></symbol>
<symbol id="i-send" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></symbol>
<symbol id="i-eye" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></symbol>
<symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></symbol>
<symbol id="i-check-2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></symbol>
<symbol id="i-edit" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></symbol>
<symbol id="i-arrow-up" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></symbol>
<symbol id="i-arrow-down" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></symbol>
<symbol id="i-arrow-left" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></symbol>
<symbol id="i-trending-up" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></symbol>
<symbol id="i-sparkles" viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></symbol>
<symbol id="i-brain" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></symbol>
<symbol id="i-bar-chart" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></symbol>
<symbol id="i-bookmark" viewBox="0 0 24 24"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></symbol>
<symbol id="i-camera" viewBox="0 0 24 24"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></symbol>
<symbol id="i-music" viewBox="0 0 24 24"><circle cx="8" cy="18" r="4"/><path d="M12 18V2l7 4"/></symbol>
<symbol id="i-play-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></symbol>
<symbol id="i-file-check" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></symbol>
<symbol id="i-file-text" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></symbol>
<symbol id="i-receipt" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></symbol>
<symbol id="i-filter" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></symbol>
<symbol id="i-download" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></symbol>
<symbol id="i-upload" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></symbol>
<symbol id="i-more-h" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></symbol>
<symbol id="i-alert" viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></symbol>
<symbol id="i-user-plus" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></symbol>
<symbol id="i-map-pin" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></symbol>
<symbol id="i-building" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></symbol>
<symbol id="i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></symbol>
<symbol id="i-refresh" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></symbol>
<symbol id="i-cloud" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></symbol>
<symbol id="i-plug" viewBox="0 0 24 24"><path d="M9 2v6"/><path d="M15 2v6"/><path d="M12 17v5"/><path d="M5 8h14"/><path d="M6 8v3a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8"/></symbol>
<symbol id="i-key" viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></symbol>
<symbol id="i-log-out" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></symbol>
<symbol id="i-help-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></symbol>
<symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></symbol>
<symbol id="i-list" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></symbol>
<symbol id="i-pie-chart" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></symbol>
<symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></symbol>
<symbol id="i-history" viewBox="0 0 24 24"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><polyline points="12 7 12 12 14.5 13.5"/></symbol>
<symbol id="i-message" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></symbol>
<symbol id="i-user" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>
<symbol id="i-user-check" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></symbol>
<symbol id="i-alert-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></symbol>
<symbol id="i-check-circle" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></symbol>
<symbol id="i-x-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></symbol>
<symbol id="i-external-link" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></symbol>
<symbol id="i-tag" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></symbol>
<symbol id="i-file" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></symbol>
<symbol id="i-dollar" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></symbol>
<symbol id="i-credit-card" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></symbol>
<symbol id="i-link" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></symbol>
<symbol id="i-paperclip" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></symbol>
<symbol id="i-arrow-right" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></symbol>
<symbol id="i-server" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></symbol>
<symbol id="i-zap" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></symbol>
</defs>
</svg>`;

const BASE_CSS = `
:root{
  --brand-50:#ecfdf5; --brand-100:#d1fae5; --brand-200:#a7f3d0;
  --brand-300:#6ee7b7; --brand-400:#34d399; --brand-500:#10b981;
  --brand-600:#0d8a6f; --brand-700:#047857; --brand-800:#065f46;
  --gray-50:#f8fafc; --gray-100:#f1f5f9; --gray-200:#e2e8f0;
  --gray-300:#cbd5e1; --gray-400:#94a3b8; --gray-500:#64748b;
  --gray-600:#475569; --gray-700:#334155;
  --success:#10b981; --warning:#f59e0b; --warning-dark:#ea580c;
  --danger:#dc2626; --info:#3b82f6; --teal:#0891b2;
  --bg:#f6f8fa; --surface:#fff; --surface-2:#fafbfc;
  --border:#e5e9ee; --border-strong:#d6dce4;
  --text:#0f172a; --text-2:#475569; --text-3:#94a3b8;
  --font-body:'IBM Plex Sans Arabic',system-ui,sans-serif;
  --font-display:'Plus Jakarta Sans','IBM Plex Sans Arabic',sans-serif;
  --font-mono:'JetBrains Mono','IBM Plex Sans Arabic',monospace;
  --sh-sm:0 1px 2px rgba(15,23,42,.04);
  --sh-md:0 2px 6px rgba(15,23,42,.06),0 1px 2px rgba(15,23,42,.04);
  --sh-lg:0 8px 24px rgba(15,23,42,.08),0 2px 6px rgba(15,23,42,.04);
}

/* ========== DARK MODE - Professional palette ========== */
[data-theme="dark"]{
  /* Brand colors — optimized for dark mode readability + contrast */
  --brand-50:#04201e;      /* very dark teal — for subtle backgrounds */
  --brand-100:#063831;     /* dark teal — hover states */
  --brand-200:#0a544a;     /* medium dark — active states */
  --brand-300:#0d8a6f;     /* medium — borders, accents */
  --brand-400:#10a884;     /* brighter — links, primary accents */
  --brand-500:#14c39a;     /* bright primary — buttons, highlights */
  --brand-600:#34d4ab;     /* button hover */
  --brand-700:#5eead4;     /* highlighted text — readable on dark */
  --brand-800:#a7f3d0;     /* very light — large labels */
  
  /* Grays - neutral cool palette */
  --gray-50:#1c2128;
  --gray-100:#22272e;
  --gray-200:#2d333b;
  --gray-300:#444c56;
  --gray-400:#636e7b;
  --gray-500:#909dab;
  --gray-600:#adbac7;
  --gray-700:#cdd9e5;
  
  /* Semantic colors — readable on dark */
  --success:#3fb950;
  --warning:#f0c33f;
  --warning-dark:#f59e0b;
  --danger:#ff6b6b;
  --info:#58a6ff;
  --teal:#39c5cf;
  
  /* Background layers — proper depth */
  --bg:#0d1117;            /* deepest - page background */
  --surface:#161b22;       /* base - cards, modals */
  --surface-2:#21262d;     /* elevated - hover, secondary surfaces (more visible) */
  
  /* Borders — subtle but visible */
  --border:#30363d;
  --border-strong:#484f58;
  
  /* Text — proper contrast ratios */
  --text:#f0f6fc;          /* primary - very bright for readability */
  --text-2:#c9d1d9;        /* secondary - clear on dark */
  --text-3:#8b949e;        /* tertiary - still readable (passes AA on dark) */
  
  /* Shadows — darker for depth */
  --sh-sm:0 1px 2px rgba(0,0,0,0.4);
  --sh-md:0 2px 6px rgba(0,0,0,0.5),0 1px 2px rgba(0,0,0,0.4);
  --sh-lg:0 8px 24px rgba(0,0,0,0.6),0 2px 6px rgba(0,0,0,0.4);
}

/* === ENHANCED DARK MODE: surface contrast + readability === */

/* Hover states - subtle but visible */
[data-theme="dark"] .modal-backdrop{background:rgba(0,0,0,0.78)}
[data-theme="dark"] .progress-overlay{background:rgba(13,17,23,0.88)}
[data-theme="dark"] .toggle{background:#30363d}
[data-theme="dark"] .toggle.on{background:var(--brand-500)}
[data-theme="dark"] .toggle::before{background:#cdd9e5}
[data-theme="dark"] .toggle.on::before{background:#fff}
[data-theme="dark"] .btn-primary{color:#fff;box-shadow:0 2px 8px rgba(20,195,154,0.25)}
[data-theme="dark"] .btn-primary:hover{box-shadow:0 4px 14px rgba(20,195,154,0.35);background:var(--brand-400)}
[data-theme="dark"] .btn-ghost{background:var(--surface);border-color:var(--border)}
[data-theme="dark"] .btn-ghost:hover{background:var(--surface-2);border-color:var(--brand-400);color:var(--brand-700)}
[data-theme="dark"] .icon-btn{background:transparent;border-color:var(--border)}
[data-theme="dark"] .icon-btn:hover{background:var(--surface-2);border-color:var(--brand-400);color:var(--brand-700)}

/* Hero gradients — keep readable on dark */
[data-theme="dark"] .cust-hero,
[data-theme="dark"] .dash-hero,
[data-theme="dark"] .cmp-hero,
[data-theme="dark"] .fin-hero,
[data-theme="dark"] .an-hero,
[data-theme="dark"] .cnt-hero,
[data-theme="dark"] .wa-hero,
[data-theme="dark"] .ugc-hero,
[data-theme="dark"] .mr-hero,
[data-theme="dark"] .cal-hero,
[data-theme="dark"] .inf-hero{
  box-shadow:0 4px 14px rgba(0,0,0,0.35)
}

/* Highlight cards — better contrast */
[data-theme="dark"] .cust-hl,
[data-theme="dark"] .dash-hl,
[data-theme="dark"] .cmp-hl{
  background:var(--surface);
  border-color:var(--border)
}
[data-theme="dark"] .cust-hl:hover,
[data-theme="dark"] .dash-hl:hover,
[data-theme="dark"] .cmp-hl:hover{
  background:var(--surface-2);
  border-color:var(--brand-400)
}

/* Tables in dark mode — clear separation */
[data-theme="dark"] table.customers-tbl tbody tr:hover,
[data-theme="dark"] table.influencers-tbl tbody tr:hover,
[data-theme="dark"] table.tbl tbody tr:hover{
  background:rgba(94, 234, 212, 0.04)
}

/* Inputs - readable text */
[data-theme="dark"] input,
[data-theme="dark"] select,
[data-theme="dark"] textarea{
  background:var(--surface-2);
  color:var(--text);
  border-color:var(--border)
}
[data-theme="dark"] input:focus,
[data-theme="dark"] select:focus,
[data-theme="dark"] textarea:focus{
  border-color:var(--brand-400);
  background:var(--surface);
  box-shadow:0 0 0 3px rgba(20,195,154,0.15)
}
[data-theme="dark"] input::placeholder,
[data-theme="dark"] textarea::placeholder{
  color:#6e7681
}

/* Search card in dark */
[data-theme="dark"] .search-card{background:var(--surface);border-color:var(--border)}
[data-theme="dark"] .search-card .field input{color:var(--text)}

/* Chips in dark */
[data-theme="dark"] .cstm-chip,
[data-theme="dark"] .chip{
  background:var(--surface);
  border-color:var(--border);
  color:var(--text-2)
}
[data-theme="dark"] .cstm-chip:hover,
[data-theme="dark"] .chip:hover{
  background:var(--surface-2);
  color:var(--text)
}
[data-theme="dark"] .cstm-chip .n,
[data-theme="dark"] .chip .n{
  background:var(--surface-2);
  color:var(--text-2)
}

/* Modal in dark */
[data-theme="dark"] .modal{
  background:var(--surface);
  border:1px solid var(--border);
  box-shadow:0 20px 60px rgba(0,0,0,0.6)
}

/* Notification dropdown */
[data-theme="dark"] .notif-dd{
  background:var(--surface);
  border-color:var(--border);
  box-shadow:0 10px 40px rgba(0,0,0,0.6)
}

/* Sidebar active item */
[data-theme="dark"] .nav-item.active{
  background:rgba(94, 234, 212, 0.1);
  color:var(--brand-700)
}
[data-theme="dark"] .nav-item:hover:not(.active){
  background:var(--surface-2)
}

/* Status pills - better readability */
[data-theme="dark"] .status-pill.active{
  background:rgba(63, 185, 80, 0.15);
  color:#56d364
}
[data-theme="dark"] .status-pill.inactive{
  background:rgba(139, 148, 158, 0.15);
  color:#b1bac4
}

/* Avatar gradients stay vibrant */
[data-theme="dark"] .inf-cell .avatar.tier-a,
[data-theme="dark"] .mc-head .avatar.tier-a{
  background:linear-gradient(135deg,#fbbf24,#d97706);
  box-shadow:0 2px 8px rgba(217,119,6,0.25)
}
[data-theme="dark"] .inf-cell .avatar.tier-b,
[data-theme="dark"] .mc-head .avatar.tier-b{
  background:linear-gradient(135deg,#14c39a,#0d8a6f);
  box-shadow:0 2px 8px rgba(20,195,154,0.25)
}
[data-theme="dark"] .inf-cell .avatar.tier-c,
[data-theme="dark"] .mc-head .avatar.tier-c{
  background:linear-gradient(135deg,#8b949e,#636e7b);
  box-shadow:0 2px 8px rgba(0,0,0,0.3)
}

/* Pagination buttons */
[data-theme="dark"] .p{background:var(--surface);border-color:var(--border)}
[data-theme="dark"] .p:hover:not(.disabled):not(.active){background:var(--surface-2);border-color:var(--brand-400);color:var(--brand-700)}
[data-theme="dark"] .p.active{background:var(--brand-500);color:#000;border-color:var(--brand-500);font-weight:800}
[data-theme="dark"] .sidebar-search input,
[data-theme="dark"] .search-wrap input,
[data-theme="dark"] input[type="text"],
[data-theme="dark"] input[type="email"],
[data-theme="dark"] input[type="password"],
[data-theme="dark"] input[type="number"],
[data-theme="dark"] input[type="date"],
[data-theme="dark"] textarea,
[data-theme="dark"] select{background:var(--surface-2);border-color:var(--border);color:var(--text)}
[data-theme="dark"] input:focus,
[data-theme="dark"] textarea:focus,
[data-theme="dark"] select:focus{border-color:var(--brand-500);box-shadow:0 0 0 3px rgba(45,212,191,0.15);background:var(--surface)}

/* ════════ COMPREHENSIVE DARK MODE FIXES ════════ */
/* Fix all elements with hardcoded white backgrounds in dark mode */
[data-theme="dark"] .api-info,
[data-theme="dark"] .creators-section,
[data-theme="dark"] .totals-summary,
[data-theme="dark"] .progress-box,
[data-theme="dark"] .api-status,
[data-theme="dark"] .from-db-warning{
  background:var(--surface) !important;
  border-color:var(--border) !important;
  color:var(--text) !important
}

/* Stage badges/pills with light backgrounds */
[data-theme="dark"] .stage-badge.stage-1,
[data-theme="dark"] .stage-pill.stage-1,
[data-theme="dark"] .att-stage-tag.stage-1{
  background:rgba(245,158,11,0.15) !important;
  color:#fbbf24 !important;
  border-color:rgba(245,158,11,0.3) !important
}
[data-theme="dark"] .stage-badge.stage-2,
[data-theme="dark"] .stage-pill.stage-2,
[data-theme="dark"] .att-stage-tag.stage-2{
  background:rgba(59,130,246,0.15) !important;
  color:#60a5fa !important;
  border-color:rgba(59,130,246,0.3) !important
}
[data-theme="dark"] .stage-badge.stage-3,
[data-theme="dark"] .stage-pill.stage-3,
[data-theme="dark"] .att-stage-tag.stage-3{
  background:rgba(124,58,237,0.15) !important;
  color:#a78bfa !important;
  border-color:rgba(124,58,237,0.3) !important
}
[data-theme="dark"] .stage-badge.stage-complete,
[data-theme="dark"] .stage-pill.stage-complete,
[data-theme="dark"] .att-stage-tag.stage-complete{
  background:rgba(16,185,129,0.15) !important;
  color:#34d399 !important;
  border-color:rgba(16,185,129,0.3) !important
}

/* ════════════════════════════════════════════════════════════
   Hero stats — PURE TYPOGRAPHY (no card containers, no dividers)
   Removed all backgrounds, borders, shadows for clean look
   Numbers and labels float directly on the hero
   ════════════════════════════════════════════════════════════ */
[class*="hero-stat"]{
  background:transparent !important;
  border:none !important;
  -webkit-backdrop-filter:none !important;
  backdrop-filter:none !important;
  box-shadow:none !important;
  padding:6px 18px !important;
  transition:opacity .15s ease
}
[class*="hero-stat"]:hover{
  opacity:0.85
}
[class*="hero-stat"] .v,
[class*="hero-stat"] .n{
  color:#ffffff !important;
  text-shadow:0 1px 2px rgba(0,0,0,0.18);
  font-weight:800 !important
}
[class*="hero-stat"] .l{
  color:rgba(255,255,255,0.88) !important;
  text-shadow:0 1px 1px rgba(0,0,0,0.12);
  font-weight:600 !important;
  letter-spacing:0.3px
}

/* ════════════════════════════════════════════════════════════
   Hero tags/pills/badges — clean look without harsh borders
   For elements like cmp-hero-tag, live-pulse, period selector
   ════════════════════════════════════════════════════════════ */
.cmp-hero-tag,
.wa-hero-left .live-pulse,
.mr-hero-left .sub b{
  background:rgba(255,255,255,0.16) !important;
  border:none !important;
  box-shadow:none !important;
  color:#ffffff !important;
  text-shadow:0 1px 1px rgba(0,0,0,0.1)
}

/* Dark mode: ensure all active/brand-colored badges have proper contrast */
[data-theme="dark"] .badge,
[data-theme="dark"] [class$="badge"]{
  background:var(--surface-2);
  color:var(--text);
  border-color:var(--border)
}
[data-theme="dark"] .nav-item.active .badge{
  background:var(--brand-500) !important;
  color:#0d1117 !important
}

/* Platform pills — dark mode with high contrast (WCAG AA+) */
[data-theme="dark"] .platform-pill.snap,
[data-theme="dark"] .platform-pill.snapchat{
  background:#3f2e00 !important;
  color:#fde047 !important;
  border-color:rgba(250,204,21,0.4) !important
}
[data-theme="dark"] .platform-pill.tiktok{
  background:#3d0e2a !important;
  color:#f9a8d4 !important;
  border-color:rgba(236,72,153,0.4) !important
}
[data-theme="dark"] .platform-pill.instagram{
  background:#2d1238 !important;
  color:#d8b4fe !important;
  border-color:rgba(168,85,247,0.4) !important
}
[data-theme="dark"] .platform-pill.youtube{
  background:#3f0d0d !important;
  color:#fca5a5 !important;
  border-color:rgba(220,38,38,0.4) !important
}
[data-theme="dark"] .platform-pill.twitter,
[data-theme="dark"] .platform-pill.x{
  background:#0f1f3d !important;
  color:#93c5fd !important;
  border-color:rgba(59,130,246,0.4) !important
}

/* KPI cards with inline gradient backgrounds */
[data-theme="dark"] .kpi-card[style*="background:linear-gradient"]{
  background:var(--surface) !important
}

/* Inline-styled cards (like content.html cards) */
[data-theme="dark"] [style*="background:linear-gradient(to bottom right"]{
  background:var(--surface) !important
}
[data-theme="dark"] [style*="background: linear-gradient(to bottom right"]{
  background:var(--surface) !important
}

/* Form validation/warning boxes */
[data-theme="dark"] .from-db-warning,
[data-theme="dark"] .warning-box,
[data-theme="dark"] .info-box{
  background:rgba(251,191,36,0.08) !important;
  border-color:rgba(251,191,36,0.3) !important;
  color:var(--text) !important
}

/* Toggle background */
[data-theme="dark"] .toggle-knob,
[data-theme="dark"] .toggle::before{
  background:#cdd9e5 !important
}

/* Login page elements (login.html has many #fff) */
[data-theme="dark"] .login-card,
[data-theme="dark"] .login-form,
[data-theme="dark"] .login-input{
  background:var(--surface) !important;
  color:var(--text) !important;
  border-color:var(--border) !important
}

/* Tooltip & popover backgrounds */
[data-theme="dark"] .tooltip,
[data-theme="dark"] .popover,
[data-theme="dark"] .dropdown-menu{
  background:var(--surface) !important;
  color:var(--text) !important;
  border-color:var(--border) !important
}

/* Status indicator badges (campaigns, customers) */
[data-theme="dark"] .status-pill.active,
[data-theme="dark"] .badge.active{
  background:rgba(34,197,94,0.15) !important;
  color:#4ade80 !important;
  border-color:rgba(34,197,94,0.3) !important
}
[data-theme="dark"] .status-pill.pending,
[data-theme="dark"] .badge.pending{
  background:rgba(251,191,36,0.15) !important;
  color:#fbbf24 !important;
  border-color:rgba(251,191,36,0.3) !important
}
[data-theme="dark"] .status-pill.completed,
[data-theme="dark"] .badge.completed{
  background:rgba(34,197,94,0.15) !important;
  color:#4ade80 !important
}
[data-theme="dark"] .status-pill.cancelled,
[data-theme="dark"] .badge.cancelled{
  background:rgba(239,68,68,0.15) !important;
  color:#f87171 !important
}

/* CSV/Bulk import preview cards */
[data-theme="dark"] .preview-card,
[data-theme="dark"] .preview-row,
[data-theme="dark"] .import-summary{
  background:var(--surface) !important;
  color:var(--text) !important;
  border-color:var(--border) !important
}

/* Modal content - extra dark mode protection */
[data-theme="dark"] .modal-body,
[data-theme="dark"] .modal-header,
[data-theme="dark"] .modal-footer{
  background:var(--surface);
  color:var(--text)
}
[data-theme="dark"] .modal label,
[data-theme="dark"] .modal .form-label{
  color:var(--text-2) !important
}

/* Notification & alert boxes */
[data-theme="dark"] .alert-success,
[data-theme="dark"] .notification.success{
  background:rgba(34,197,94,0.12) !important;
  color:#4ade80 !important;
  border-color:rgba(34,197,94,0.3) !important
}
[data-theme="dark"] .alert-warning,
[data-theme="dark"] .notification.warning{
  background:rgba(251,191,36,0.12) !important;
  color:#fbbf24 !important;
  border-color:rgba(251,191,36,0.3) !important
}
[data-theme="dark"] .alert-info,
[data-theme="dark"] .notification.info{
  background:rgba(59,130,246,0.12) !important;
  color:#60a5fa !important;
  border-color:rgba(59,130,246,0.3) !important
}
[data-theme="dark"] .alert-danger,
[data-theme="dark"] .notification.danger{
  background:rgba(239,68,68,0.12) !important;
  color:#f87171 !important;
  border-color:rgba(239,68,68,0.3) !important
}

/* Date/Time/Number inputs */
input[type="time"],
input[type="datetime-local"],
input[type="month"],
input[type="week"],
input[type="number"]{
  direction:ltr !important;
  text-align:left !important;
  font-family:var(--font-mono);
}
/* Native date input - hidden text when upgraded (custom overlay shows DD/MM/YYYY) */
input[type="date"][data-sc-upgraded]{
  direction:ltr !important;
  text-align:left !important;
  font-family:var(--font-mono);
  color:transparent !important;
  caret-color:transparent;
}
input[type="date"][data-sc-upgraded]::-webkit-datetime-edit,
input[type="date"][data-sc-upgraded]::-webkit-datetime-edit-fields-wrapper,
input[type="date"][data-sc-upgraded]::-webkit-datetime-edit-text,
input[type="date"][data-sc-upgraded]::-webkit-datetime-edit-day-field,
input[type="date"][data-sc-upgraded]::-webkit-datetime-edit-month-field,
input[type="date"][data-sc-upgraded]::-webkit-datetime-edit-year-field{
  color:transparent !important;
  opacity:0;
}
/* Calendar picker indicator: better visibility */
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator{
  cursor:pointer;
  opacity:0.65;
  margin-inline-start:6px;
  margin-inline-end:0;
  position:relative;
  z-index:3;
}
input[type="date"]:hover::-webkit-calendar-picker-indicator,
input[type="time"]:hover::-webkit-calendar-picker-indicator{opacity:1}
[data-theme="dark"] input[type="date"]::-webkit-calendar-picker-indicator,
[data-theme="dark"] input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(0.85)}

/* Custom date wrapper */
.sc-date-field{
  position:relative;
  direction:ltr
}
.sc-date-display{
  pointer-events:none
}
[data-theme="dark"] .sidebar-search input,
[data-theme="dark"] .search-wrap input{background:var(--surface)}
[data-theme="dark"] .sidebar-search .kbd,
[data-theme="dark"] .search-wrap .search-kbd{background:var(--surface-2);border-color:var(--border);color:var(--text-3)}
[data-theme="dark"] .nav-item.active{background:var(--brand-50);color:var(--brand-500)}
[data-theme="dark"] .nav-item.active::before{background:var(--brand-500)}
/* Dark mode soft pill — translucent mint with proper contrast */
[data-theme="dark"] .nav-item .badge{
  background:rgba(34,197,94,0.12);
  color:#4ade80;
  border-color:rgba(34,197,94,0.3);
}
[data-theme="dark"] .nav-item.active .badge{
  background:var(--brand-500);
  color:#0d1117;
  border-color:var(--brand-500);
}
[data-theme="dark"] .user-card{background:var(--surface-2)}
[data-theme="dark"] .brand-logo{box-shadow:0 4px 12px rgba(45,212,191,.2)}
[data-theme="dark"] .ping{box-shadow:0 0 0 2px var(--surface)}

/* Alerts in dark mode — high contrast (WCAG AA+) */
[data-theme="dark"] .alert.info{background:#172554;border-color:#1e3a8a;color:#bfdbfe}
[data-theme="dark"] .alert.warn,
[data-theme="dark"] .alert.warning{background:#451a03;border-color:#92400e;color:#fde68a}
[data-theme="dark"] .alert.danger{background:#450a0a;border-color:#7f1d1d;color:#fecaca}
[data-theme="dark"] .alert.success{background:#052e16;border-color:#14532d;color:#bbf7d0}
[data-theme="dark"] .alert.info b,
[data-theme="dark"] .alert.info strong{color:#dbeafe}
[data-theme="dark"] .alert.warn b,
[data-theme="dark"] .alert.warn strong,
[data-theme="dark"] .alert.warning b,
[data-theme="dark"] .alert.warning strong{color:#fef3c7}
[data-theme="dark"] .alert.danger b,
[data-theme="dark"] .alert.danger strong{color:#fee2e2}
[data-theme="dark"] .alert.success b,
[data-theme="dark"] .alert.success strong{color:#d1fae5}

/* Status pills in dark mode */
[data-theme="dark"] .status-pill.completed{background:rgba(63,185,80,0.15);color:#56d364;border-color:rgba(63,185,80,0.3)}
[data-theme="dark"] .status-pill.pending{background:rgba(210,153,34,0.15);color:#f0b429;border-color:rgba(210,153,34,0.3)}
[data-theme="dark"] .status-pill.free{background:rgba(139,92,246,0.15);color:#a78bfa;border-color:rgba(139,92,246,0.3)}

/* Tables in dark mode */
[data-theme="dark"] table thead th,
[data-theme="dark"] .team-table thead th{background:var(--surface-2);color:var(--text-2);border-color:var(--border)}
[data-theme="dark"] table tbody td{border-color:var(--border)}
[data-theme="dark"] table tbody tr:hover,
[data-theme="dark"] .team-table tbody tr:hover{background:var(--surface-2)}

/* Cards & sections in dark mode */
[data-theme="dark"] .card,
[data-theme="dark"] .kpi,
[data-theme="dark"] .kpi-big,
[data-theme="dark"] .settings-section,
[data-theme="dark"] .settings-nav,
[data-theme="dark"] .data-stat,
[data-theme="dark"] .backup-card,
[data-theme="dark"] .chart-card{background:var(--surface);border-color:var(--border)}

[data-theme="dark"] .data-stat,
[data-theme="dark"] .backup-card,
[data-theme="dark"] .rank-item,
[data-theme="dark"] .quick-action,
[data-theme="dark"] .task-item,
[data-theme="dark"] .upload-zone{background:var(--surface-2);border-color:var(--border)}

/* Welcome banner gradient stays dark too */
[data-theme="dark"] .welcome-banner{background:linear-gradient(135deg,#0a4a44 0%,#052e2b 100%)}

/* Recipe of light backgrounds → darker variants */
[data-theme="dark"] .kpi-big{background:var(--surface)}
[data-theme="dark"] .kpi-big:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.4)}

/* Activity items */
[data-theme="dark"] .activity-row{border-color:var(--border)}
[data-theme="dark"] .act-icon{background:var(--surface-2)}

/* Backup icons in dark */
[data-theme="dark"] .backup-icon.manual{background:rgba(88,166,255,0.15);color:#79c0ff}
[data-theme="dark"] .backup-icon.auto{background:rgba(63,185,80,0.15);color:#56d364}
[data-theme="dark"] .backup-icon.pre_import,
[data-theme="dark"] .backup-icon.pre_restore{background:rgba(210,153,34,0.15);color:#f0b429}

/* Modal in dark */
[data-theme="dark"] .modal{background:var(--surface);border:1px solid var(--border)}
[data-theme="dark"] .modal-h{background:var(--surface);border-color:var(--border)}
[data-theme="dark"] .modal-footer{background:var(--surface-2);border-color:var(--border)}
[data-theme="dark"] #pages-list,
[data-theme="dark"] #permissions-list{background:var(--surface-2)}
[data-theme="dark"] #pages-list label{background:var(--surface);border-color:var(--border)}
[data-theme="dark"] #permissions-list > div{background:var(--surface);border-color:var(--border)}

/* Settings nav active in dark */
[data-theme="dark"] .settings-nav-item:hover{background:var(--surface-2)}
[data-theme="dark"] .settings-nav-item.active{background:var(--brand-50);color:var(--brand-500)}
[data-theme="dark"] .settings-nav-item .count{background:var(--surface-2);color:var(--text-3)}
[data-theme="dark"] .settings-nav-item.active .count{background:var(--brand-500);color:var(--bg)}

/* Form labels */
[data-theme="dark"] .fld label,
[data-theme="dark"] label{color:var(--text-2)}
[data-theme="dark"] .fld .hint{color:var(--text-3)}

/* Buttons */
[data-theme="dark"] .btn{background:var(--surface);border-color:var(--border);color:var(--text-2)}
[data-theme="dark"] .btn:hover{background:var(--surface-2);color:var(--text)}
[data-theme="dark"] .btn-danger{background:transparent;color:#ff7b72;border-color:rgba(248,81,73,0.3)}
[data-theme="dark"] .btn-danger:hover{background:rgba(248,81,73,0.1);color:#ff9999}
[data-theme="dark"] .btn-icon{color:var(--text-3)}
[data-theme="dark"] .btn-icon:hover{background:var(--surface-2);color:var(--text)}
[data-theme="dark"] .btn-icon.danger:hover{background:rgba(248,81,73,0.1);color:#ff7b72}

/* Login page dark mode */
[data-theme="dark"] .form-side{background:var(--bg)}
[data-theme="dark"] .demo-box{background:var(--surface-2);border-color:var(--border)}
[data-theme="dark"] .demo-box:hover{background:var(--surface);border-color:var(--brand-400)}
[data-theme="dark"] .demo-cred .value{background:var(--surface);border-color:var(--border);color:var(--text)}
[data-theme="dark"] .demo-role-btn{background:var(--surface);border-color:var(--border);color:var(--text-2)}
[data-theme="dark"] .demo-role-btn:hover{border-color:var(--brand-400);color:var(--brand-500)}
[data-theme="dark"] .demo-role-btn.active{background:var(--brand-50);border-color:var(--brand-500);color:var(--brand-500)}
[data-theme="dark"] .demo-section::before{background:var(--bg);color:var(--text-3)}

/* Scrollbars in dark mode */
[data-theme="dark"] ::-webkit-scrollbar{width:10px;height:10px}
[data-theme="dark"] ::-webkit-scrollbar-track{background:var(--bg)}
[data-theme="dark"] ::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:10px;border:2px solid var(--bg)}
[data-theme="dark"] ::-webkit-scrollbar-thumb:hover{background:var(--gray-400)}

/* Smooth theme transition */
:root,[data-theme="dark"]{
  transition: background-color .25s ease, color .25s ease;
}
body,.surface,.sidebar,.topbar,.modal,.card,.kpi-big,.settings-section,.settings-nav,
input,select,textarea,button:not(.icon-btn):not(.btn-primary):not(.btn-danger):not(.btn-success):not(.toggle){
  transition: background-color .2s ease, color .2s ease, border-color .2s ease;
}

*{box-sizing:border-box;margin:0;padding:0;font-variant-numeric:lining-nums tabular-nums;-webkit-tap-highlight-color:transparent}
html,body{height:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{font-family:var(--font-body);background:var(--bg);color:var(--text);font-size:14px;line-height:1.6;overflow:hidden;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;touch-action:manipulation}
button{font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
input,select,textarea{font-family:inherit}
/* Anchors inherit color by default (no browser blue) */
a{color:inherit;text-decoration:none;-webkit-tap-highlight-color:transparent}
a:hover{color:inherit}
a:visited{color:inherit}
button,input,select,textarea{font-family:inherit}
button{cursor:pointer}
.ic{display:inline-block;width:1em;height:1em;vertical-align:-.125em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}

/* App layout */
.app{display:grid;grid-template-columns:248px 1fr;height:100vh;height:100dvh}
/* Scoped to <main> element only — prevents collision with nested .main classes
   (e.g. <div class="main"> inside .activity-cell on customers page) */
main.main{display:flex;flex-direction:column;overflow:hidden;background:var(--bg)}

/* Sidebar */
.sidebar{background:var(--surface);border-inline-start:1px solid var(--border);display:flex;flex-direction:column;padding:18px 14px;overflow:hidden}
.brand{display:flex;align-items:center;gap:12px;padding:4px 6px 18px;margin-bottom:8px;border-bottom:1px solid var(--border)}
.brand-logo{width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,var(--brand-600),var(--brand-800));display:grid;place-items:center;color:#fff;font-family:var(--font-display);font-weight:800;font-size:20px;box-shadow:0 4px 12px rgba(13,138,111,.25);flex-shrink:0}
.brand-text{display:flex;flex-direction:column;line-height:1.1;min-width:0;flex:1}
.brand-text .n{font-family:var(--font-display);font-weight:800;font-size:19px;letter-spacing:-.5px;color:var(--text)}
.brand-text .n b{color:var(--brand-600);font-weight:800}
.brand-text .s{font-family:var(--font-mono);font-size:10px;letter-spacing:1.5px;color:var(--text-3);margin-top:4px;font-weight:600}

.sidebar-search{position:relative;margin-bottom:8px}
.sidebar-search input{width:100%;background:var(--gray-50);border:1px solid var(--border);border-radius:9px;padding:8px 32px 8px 38px;font-family:inherit;font-size:12.5px;color:var(--text);outline:none;transition:all .15s}
.sidebar-search input:focus{border-color:var(--brand-500);background:#fff;box-shadow:0 0 0 3px rgba(13,138,111,.08)}
.sidebar-search input::placeholder{color:var(--text-3)}
.sidebar-search > .ic{position:absolute;inset-inline-end:10px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:var(--text-3)}
.sidebar-search .kbd{position:absolute;inset-inline-start:8px;top:50%;transform:translateY(-50%);font-family:var(--font-mono);font-size:9.5px;color:var(--text-3);background:#fff;border:1px solid var(--border);padding:1px 5px;border-radius:4px;font-weight:600}

.nav-section{font-family:var(--font-mono);font-size:9.5px;letter-spacing:1.2px;color:var(--text-3);padding:14px 10px 5px;text-transform:uppercase;font-weight:600}
.nav{display:flex;flex-direction:column;gap:1px;overflow-y:auto;flex:1;padding-inline-end:2px;margin-bottom:8px}
.nav::-webkit-scrollbar{width:4px}
.nav::-webkit-scrollbar-thumb{background:var(--gray-300);border-radius:10px}
.nav-item{display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:9px;color:var(--text-2);cursor:pointer;font-weight:500;font-size:13.5px;transition:background .12s ease,color .12s ease;border:1px solid transparent;position:relative;text-decoration:none}
.nav-item:hover{background:var(--gray-50);color:var(--text)}
.nav-item.active{background:var(--brand-50);color:var(--brand-800);font-weight:700}
.nav-item.active .ic{color:var(--brand-600)}
.nav-item.active::before{content:"";position:absolute;inset-inline-start:-14px;top:6px;bottom:6px;width:3px;border-radius:0 3px 3px 0;background:var(--brand-600)}
.nav-item .ic{width:17px;height:17px;flex-shrink:0;color:var(--text-3);transition:color .12s}
.nav-item:hover .ic{color:var(--text-2)}
.nav-item > span.nav-label{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nav-sep{height:1px;background:var(--border);margin:9px 8px 8px;opacity:.7}
/* Soft pill style — matches "نشط" status pill aesthetic
   Light mint bg + dark green text + subtle green border + pill shape */
.nav-item .badge{
  flex:0 0 auto;              /* CRITICAL: don't grow, don't shrink — stays compact */
  margin-inline-start:auto;
  background:#f0fdf4;
  color:#14532d;
  border:1px solid #bbf7d0;
  font-size:10.5px;
  padding:2px 9px;
  border-radius:999px;
  font-family:var(--font-mono);
  font-weight:700;
  min-width:24px;
  width:auto;                  /* Explicit auto width */
  text-align:center;
  letter-spacing:0.2px;
  line-height:1.5;
  transition:all .15s ease;
}
/* Active state: solid brand color for contrast against light bg */
.nav-item.active .badge{
  background:var(--brand-600);
  color:#fff;
  border-color:var(--brand-600);
}

/* ===== زر الطي / التوسيع ===== */
.sidebar-collapse{display:flex;align-items:center;gap:11px;width:100%;padding:8px 11px;margin-bottom:8px;border:1px solid var(--border);background:var(--surface);border-radius:9px;color:var(--text-3);font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .12s,color .12s,border-color .12s}
.sidebar-collapse:hover{background:var(--gray-50);color:var(--text-2);border-color:var(--brand-300)}
.sidebar-collapse .ic{width:16px;height:16px;flex-shrink:0;transition:transform .2s}
.app.sidebar-collapsed .sidebar-collapse .ic{transform:rotate(180deg)}

/* ===== الحالة المطوية (سطح المكتب) ===== */
.app.sidebar-collapsed{grid-template-columns:76px 1fr}
.app.sidebar-collapsed .sidebar{padding:18px 12px}
.app.sidebar-collapsed .brand{justify-content:center;gap:0;padding:4px 0 16px}
.app.sidebar-collapsed .brand-text{display:none}
.app.sidebar-collapsed .nav-item{justify-content:center;padding:10px 0;gap:0}
.app.sidebar-collapsed .nav-label{display:none}
.app.sidebar-collapsed .nav-item .badge{display:none}
.app.sidebar-collapsed .nav-item.active::before{inset-inline-start:-12px}
.app.sidebar-collapsed .nav-sep{margin:9px 6px}
.app.sidebar-collapsed .sidebar-collapse{justify-content:center;padding:9px 0}
.app.sidebar-collapsed .user-card{justify-content:center;padding:10px 6px}
.app.sidebar-collapsed .user-card .info,.app.sidebar-collapsed .user-card .chevron{display:none}
[data-theme="dark"] .sidebar-collapse{background:var(--surface-2,var(--surface))}

.user-card{
  margin-top:auto;
  padding:10px 12px;
  background:var(--gray-50);
  border:1px solid var(--border);
  border-radius:12px;
  display:flex;
  align-items:center;
  gap:10px;
  transition:all .15s;
  -webkit-tap-highlight-color:transparent
}
.user-card[role="button"]:hover{border-color:var(--brand-300);background:var(--brand-50)}
.user-card[role="button"]:hover .chevron{color:var(--brand-700)}
.user-card[role="button"]:hover .avatar{transform:scale(1.05)}
[data-theme="dark"] .user-card[role="button"]:hover{background:var(--surface)}
.avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--brand-500),var(--brand-700));display:grid;place-items:center;font-weight:700;color:#fff;font-family:var(--font-display);font-size:13px;flex-shrink:0;transition:transform .15s}
.user-card .avatar{width:36px;height:36px;font-size:14px;position:relative}
.user-card .avatar::after{content:"";position:absolute;bottom:-1px;inset-inline-end:-1px;width:10px;height:10px;border-radius:50%;background:#10b981;border:2px solid var(--gray-50)}
[data-theme="dark"] .user-card .avatar::after{border-color:var(--surface-2)}
.user-card[role="button"]:hover .avatar::after{border-color:var(--brand-50)}
[data-theme="dark"] .user-card[role="button"]:hover .avatar::after{border-color:var(--surface)}
.user-card .info{flex:1;min-width:0}
.user-card .info .n{font-size:12.5px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-card .info .r{font-size:10.5px;color:var(--text-3);font-family:var(--font-mono);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-card .chevron{flex-shrink:0;transition:all .15s}

/* Topbar */
.topbar{display:flex;align-items:center;gap:12px;padding:12px 22px;background:var(--surface);border-bottom:1px solid var(--border);z-index:5}
.topbar-toggle{width:34px;height:34px;border-radius:8px;background:transparent;border:1px solid var(--border);display:none;place-items:center;cursor:pointer;color:var(--text-2)}
.topbar-toggle .ic{width:16px;height:16px}
.crumb{display:flex;align-items:center;gap:7px;color:var(--text-3);font-size:13px;white-space:nowrap;overflow:hidden;flex-wrap:nowrap}
.crumb b{color:var(--text);font-weight:600}
.crumb .sep{color:var(--text-3);font-weight:400}
.bc-link{color:var(--text-3);font-weight:600;text-decoration:none;transition:color .15s;padding:1px 2px;border-radius:4px}
.bc-link:hover{color:var(--brand-700);text-decoration:underline}
.bc-cur{color:var(--text);font-weight:700}
.bc-txt{color:var(--text-3);font-weight:600}
.bc-sep{color:var(--text-4,var(--text-3));font-weight:400;opacity:.55;margin:0 1px}
.page-head{padding:16px 24px 14px;background:var(--surface);border-bottom:1px solid var(--border)}
.page-head-bc{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--text-3);white-space:nowrap;overflow-x:auto;margin-bottom:8px;scrollbar-width:none}
.page-head-bc::-webkit-scrollbar{display:none}
.page-head-bc .bc-link{font-size:12px}.page-head-bc .bc-cur{font-size:12px}
.page-head-title{font-family:var(--font-display);font-size:21px;font-weight:800;color:var(--text);letter-spacing:-0.3px;line-height:1.2}
.page-head-desc{font-size:13px;color:var(--text-3);margin-top:3px;font-weight:500}
@media (max-width:768px){.page-head{padding:12px 14px 10px}.page-head-title{font-size:18px}.page-head-desc{font-size:12px}.page-head-bc{font-size:11px}}
.search-wrap{flex:1;max-width:560px;margin-inline:auto;position:relative}
.search-wrap input{width:100%;background:var(--gray-50);border:1px solid var(--border);color:var(--text);font-family:inherit;font-size:13px;padding:9px 38px 9px 42px;border-radius:9px;outline:none;transition:all .2s}
.search-wrap input:focus{border-color:var(--brand-500);background:#fff;box-shadow:0 0 0 3px rgba(13,138,111,.08)}
.search-wrap input::placeholder{color:var(--text-3)}
.search-wrap .s-icon{position:absolute;inset-inline-end:12px;top:50%;transform:translateY(-50%);color:var(--text-3)}
.search-wrap .s-icon .ic{width:15px;height:15px}
.search-wrap .search-kbd{position:absolute;inset-inline-start:10px;top:50%;transform:translateY(-50%);font-family:var(--font-mono);font-size:10px;color:var(--text-3);background:#fff;border:1px solid var(--border);padding:2px 6px;border-radius:4px;font-weight:600}
.topbar-actions{display:flex;align-items:center;gap:6px}
.icon-btn{width:36px;height:36px;border-radius:9px;background:var(--surface);border:1px solid var(--border);display:grid;place-items:center;color:var(--text-2);cursor:pointer;transition:all .12s;position:relative}
.icon-btn:hover{color:var(--brand-700);border-color:var(--brand-300);background:var(--brand-50)}
.icon-btn .ic{width:17px;height:17px}
.icon-btn .ping{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--warning);box-shadow:0 0 0 2px var(--surface)}
.topbar-cta{margin-inline-start:4px}

/* Content */
.content{flex:1;overflow-y:auto;padding:24px 24px 40px}
.content::-webkit-scrollbar{width:8px}
.content::-webkit-scrollbar-thumb{background:var(--gray-300);border-radius:10px}

/* Page head */
.page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px;gap:16px;flex-wrap:wrap}
.page-title{font-family:var(--font-display);font-size:26px;font-weight:800;letter-spacing:-.6px;display:flex;align-items:center;gap:10px}
.page-title .icon{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--brand-600),var(--brand-800));display:grid;place-items:center;color:#fff;box-shadow:0 4px 12px rgba(13,138,111,.2)}
.page-title .icon .ic{width:20px;height:20px}
.page-sub{color:var(--text-2);font-size:13.5px;margin-top:4px;line-height:1.5;max-width:580px}
.page-cta{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 14px;border-radius:9px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:all .12s;white-space:nowrap;text-decoration:none}
.btn .ic{width:15px;height:15px;stroke-width:2}
.btn-primary{background:var(--brand-600);color:#fff;box-shadow:0 2px 6px rgba(13,138,111,.25)}
.btn-primary:hover{background:var(--brand-700);transform:translateY(-1px);box-shadow:0 4px 10px rgba(13,138,111,.3)}
.btn-ghost{background:var(--surface);border-color:var(--border);color:var(--text-2)}
.btn-ghost:hover{background:var(--gray-50);color:var(--text);border-color:var(--border-strong)}
.btn-danger{background:var(--danger);color:#fff}
.btn-danger:hover{background:#b91c1c}
.btn-outline-danger{background:transparent;border-color:#fecaca;color:var(--danger)}
.btn-outline-danger:hover{background:#fef2f2}

/* Status chips */
.status-bar{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.chip{display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:var(--surface);color:var(--text-2);transition:all .12s;white-space:nowrap;font-family:inherit}
.chip:hover{border-color:var(--border-strong)}
.chip .dot{width:7px;height:7px;border-radius:50%;background:var(--c,var(--brand-600))}
.chip .n{font-family:var(--font-mono);font-size:10.5px;background:var(--gray-100);padding:1px 5px;border-radius:4px;color:var(--text-2)}
.chip.active{background:var(--c-bg,var(--brand-50));border-color:var(--c,var(--brand-600));color:var(--c-fg,var(--brand-800))}
.chip.active .n{background:var(--c,var(--brand-600));color:#fff}
.chip[data-s="all"]{--c:#047857;--c-bg:#ecfdf5;--c-fg:#064e3b}
.chip[data-s="active"]{--c:#16a34a;--c-bg:#f0fdf4;--c-fg:#14532d}
.chip[data-s="inactive"]{--c:#94a3b8;--c-bg:#f8fafc;--c-fg:#475569}
.chip[data-s="vip"]{--c:#ec4899;--c-bg:#fdf2f8;--c-fg:#9d174d}
.chip[data-s="new"]{--c:#10b981;--c-bg:#ecfdf5;--c-fg:#064e3b}
.chip[data-s="pending"]{--c:#f59e0b;--c-bg:#fffbeb;--c-fg:#78350f}
.chip[data-s="approved"]{--c:#0891b2;--c-bg:#ecfeff;--c-fg:#155e75}
.chip[data-s="completed"]{--c:#16a34a;--c-bg:#f0fdf4;--c-fg:#14532d}
.chip[data-s="rejected"]{--c:#dc2626;--c-bg:#fef2f2;--c-fg:#7f1d1d}
.chip[data-s="screening"]{--c:#f59e0b;--c-bg:#fffbeb;--c-fg:#78350f}
.chip[data-s="pending_client"]{--c:#ea580c;--c-bg:#fff7ed;--c-fg:#7c2d12}
.chip[data-s="executing"]{--c:#3b82f6;--c-bg:#eff6ff;--c-fg:#1e40af}
.chip[data-s="quote_sent"]{--c:#ea580c;--c-bg:#fff7ed;--c-fg:#7c2d12}
.chip[data-s="confirmed"]{--c:#0891b2;--c-bg:#ecfeff;--c-fg:#155e75}
.chip[data-s="receipt"]{--c:#3b82f6;--c-bg:#eff6ff;--c-fg:#1e40af}
.chip[data-s="tax_invoice"]{--c:#7c3aed;--c-bg:#f5f3ff;--c-fg:#4c1d95}

/* Filters */
.filters{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.field{display:flex;align-items:center;gap:6px;background:var(--gray-50);border:1px solid var(--border);border-radius:8px;padding:7px 10px;font-size:12.5px;min-width:140px}
.field .ic{width:14px;height:14px;color:var(--text-3)}
.field select,.field input{flex:1;background:transparent;border:none;outline:none;font-family:inherit;font-size:12.5px;color:var(--text);width:100%}
.field-search{flex:1;min-width:200px;max-width:320px}
.field-search input::placeholder{color:var(--text-3)}
.filters-right{margin-inline-start:auto;display:flex;align-items:center;gap:8px}
.results-count{font-size:11.5px;color:var(--text-3);font-family:var(--font-mono)}

/* Tables */
.table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden}
.table-scroll{overflow-x:auto}
table.tbl{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;min-width:900px}
table.tbl thead th{background:var(--surface-2);color:var(--text-2);font-weight:600;font-size:11.5px;text-align:start;padding:12px 14px;border-bottom:1px solid var(--border);white-space:nowrap;font-family:var(--font-mono);letter-spacing:0.3px;text-transform:uppercase;position:sticky;top:0;z-index:2}
table.tbl tbody td{padding:14px;border-bottom:1px solid var(--border);vertical-align:middle}
table.tbl tbody tr{transition:background .12s}
table.tbl tbody tr:hover{background:var(--gray-50)}
table.tbl tbody tr:last-child td{border-bottom:none}

.cell-id{font-family:var(--font-mono);font-size:11.5px;color:var(--text-2);font-weight:600}
.cell-entity{display:flex;align-items:center;gap:9px}
.cell-entity .ava{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--c1,#7c3aed),var(--c2,#3b82f6));display:grid;place-items:center;color:#fff;font-weight:700;font-size:13px;font-family:var(--font-display);flex-shrink:0}
.cell-entity .info{display:flex;flex-direction:column;line-height:1.2;min-width:0}
.cell-entity .info .n{font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}
.cell-entity .info .s{font-size:10.5px;color:var(--text-3);font-family:var(--font-mono);margin-top:2px}
.cell-status{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:6px;font-size:11.5px;font-weight:600;white-space:nowrap;border:1px solid}
.cell-status .dot{width:6px;height:6px;border-radius:50%}
.st-active{background:#f0fdf4;border-color:#bbf7d0;color:#14532d} .st-active .dot{background:#16a34a}
.st-inactive{background:#f8fafc;border-color:#e2e8f0;color:#475569} .st-inactive .dot{background:#94a3b8}
.st-pending{background:#fffbeb;border-color:#fde68a;color:#78350f} .st-pending .dot{background:#f59e0b}
.st-quote_sent{background:#fff7ed;border-color:#fed7aa;color:#7c2d12} .st-quote_sent .dot{background:#ea580c}
.st-confirmed{background:#ecfeff;border-color:#a5f3fc;color:#155e75} .st-confirmed .dot{background:#0891b2}
.st-receipt{background:#eff6ff;border-color:#bfdbfe;color:#1e40af} .st-receipt .dot{background:#3b82f6}
.st-tax_invoice{background:#f5f3ff;border-color:#ddd6fe;color:#4c1d95} .st-tax_invoice .dot{background:#7c3aed}
.st-completed{background:#f0fdf4;border-color:#bbf7d0;color:#14532d} .st-completed .dot{background:#16a34a}
.st-rejected{background:#fef2f2;border-color:#fecaca;color:#7f1d1d} .st-rejected .dot{background:#dc2626}
.st-new{background:#ecfdf5;border-color:#a7f3d0;color:#064e3b} .st-new .dot{background:#10b981}
.st-screening{background:#fffbeb;border-color:#fde68a;color:#78350f} .st-screening .dot{background:#f59e0b}
.st-pending_client{background:#fff7ed;border-color:#fed7aa;color:#7c2d12} .st-pending_client .dot{background:#ea580c}
.st-approved{background:#ecfeff;border-color:#a5f3fc;color:#155e75} .st-approved .dot{background:#0891b2}
.st-executing{background:#eff6ff;border-color:#bfdbfe;color:#1e40af} .st-executing .dot{background:#3b82f6}

.cell-amount{font-family:var(--font-display);font-weight:700;font-size:14px;color:var(--text)}
.cell-amount small{font-family:var(--font-body);font-weight:500;font-size:11px;color:var(--text-3);margin-inline-start:3px}
.cell-date{font-family:var(--font-mono);font-size:12px;color:var(--text-2)}

.cell-actions{display:flex;gap:4px}
.act-btn{width:30px;height:30px;border-radius:7px;background:transparent;border:1px solid var(--border);display:grid;place-items:center;color:var(--text-2);cursor:pointer;transition:all .12s}
.act-btn:hover{background:var(--gray-50);color:var(--text);border-color:var(--border-strong)}
.act-btn.primary{background:var(--brand-600);color:#fff;border-color:var(--brand-600)}
.act-btn.primary:hover{background:var(--brand-700)}
.act-btn.danger{color:var(--danger)}
.act-btn.danger:hover{background:#fef2f2;border-color:#fecaca}
.act-btn .ic{width:14px;height:14px}

/* Empty state */
.empty{padding:60px 20px;text-align:center;color:var(--text-3)}
.empty .ic{width:48px;height:48px;color:var(--gray-300);margin-bottom:14px}
.empty h4{font-family:var(--font-display);font-size:16px;color:var(--text-2);margin-bottom:6px}
.empty p{font-size:13px;color:var(--text-3)}

/* Table footer */
.tbl-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-top:1px solid var(--border);background:var(--surface-2);font-size:12px;color:var(--text-2);flex-wrap:wrap;gap:10px}
.pager{display:flex;align-items:center;gap:3px;font-family:var(--font-mono)}
.pager .p{min-width:30px;height:30px;display:grid;place-items:center;border:1px solid var(--border);border-radius:7px;background:var(--surface);font-size:12px;font-weight:600;cursor:pointer;color:var(--text-2);padding:0 8px}
.pager .p:hover{background:var(--gray-50);color:var(--text)}
.pager .p.active{background:var(--brand-600);color:#fff;border-color:var(--brand-600)}
.pager .p.disabled{opacity:.4;cursor:not-allowed}
.pager .p .ic{width:13px;height:13px}
.pager-info{font-family:var(--font-mono);color:var(--text-3)}

/* Forms */
.form-row{margin-bottom:14px}
.form-row label{display:block;font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:5px}
.form-row label.required::after{content:" *";color:var(--danger)}
.form-row input,.form-row select,.form-row textarea{width:100%;background:var(--gray-50);border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-family:inherit;font-size:13.5px;color:var(--text);outline:none;transition:all .15s}
.form-row input:focus,.form-row select:focus,.form-row textarea:focus{border-color:var(--brand-500);background:#fff;box-shadow:0 0 0 3px rgba(13,138,111,.08)}
.form-row textarea{resize:vertical;min-height:80px}
.form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.form-grid.cols-3{grid-template-columns:repeat(3,1fr)}
.form-grid.full{grid-column:1 / -1}

.modal-head{padding:18px 22px 14px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.modal-head h3{font-family:var(--font-display);font-size:18px;font-weight:700;letter-spacing:-.2px}
.modal-head .close{width:30px;height:30px;border-radius:8px;background:var(--gray-100);border:none;cursor:pointer;display:grid;place-items:center;color:var(--text-2);flex-shrink:0}
.modal-head .close:hover{background:var(--gray-200)}
.modal-head .close .ic{width:15px;height:15px}
.modal-body{padding:18px 22px}
.modal-footer{padding:14px 22px;border-top:1px solid var(--border);background:var(--surface-2);display:flex;gap:8px;justify-content:flex-end}

/* ============================================
   MOBILE-FIRST RESPONSIVE SYSTEM
   ============================================ */

/* Bottom Nav - hidden on desktop, shown on mobile */
.bottom-nav{display:none}

/* === LARGE TABLETS & SMALL LAPTOPS (≤ 1100px) === */
@media (max-width:1100px){
  .app{grid-template-columns:220px 1fr}
  .search-wrap{max-width:340px}
  .topbar{padding:10px 16px;gap:8px}
}

/* === TABLETS (≤ 900px) === */
@media (max-width:900px){
  .app{grid-template-columns:1fr;padding-bottom:0}
  .app.sidebar-collapsed{grid-template-columns:1fr}
  .sidebar-collapse{display:none}
  
  /* Sidebar drawer — CRITICAL: use PHYSICAL properties for cross-browser RTL safety
     (inset-inline-end behavior is inconsistent across browsers in RTL contexts) */
  .sidebar{
    position:fixed;
    top:0;
    bottom:0;
    right:0;                    /* RTL default: pin to right edge */
    left:auto;
    width:280px;
    max-width:85vw;
    z-index:200;
    transform:translateX(100%); /* off-screen to the right */
    transition:transform .28s cubic-bezier(0.4,0,0.2,1);
    box-shadow:-4px 0 24px rgba(0,0,0,0.15);
    display:flex;
    padding-top:14px;
    will-change:transform
  }
  /* LTR override: slide from left */
  [dir="ltr"] .sidebar{
    right:auto;
    left:0;
    transform:translateX(-100%)
  }
  /* Open state — same in both directions */
  .sidebar.open{transform:translateX(0)}
  
  .topbar-toggle{display:grid !important}
  .sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:150;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
  .sidebar-overlay.show{display:block}
  .search-wrap{max-width:none;flex:1}
  .search-wrap .search-kbd{display:none}
  .crumb{display:none}
}

/* === MOBILE (≤ 768px) - App-like layout === */
@media (max-width:768px){
  /* === Topbar simplification === */
  .topbar{
    padding:10px 14px;gap:8px;
    position:sticky;top:0;z-index:50;
    background:var(--surface);
    border-bottom:1px solid var(--border);
    flex-wrap:nowrap;
    min-height:54px
  }
  .topbar .search-wrap{display:none}
  .topbar .crumb{display:none}
  .topbar-actions{margin-inline-start:auto;gap:4px}
  .topbar-cta{display:none}
  .icon-btn{width:38px;height:38px;border:none;background:transparent}
  .icon-btn:hover{background:var(--surface-2)}
  
  /* === User button: compact === */
  .user-btn{padding:4px 6px;gap:5px;border:none;background:transparent}
  .user-btn .user-info{display:none}
  .user-btn .user-arrow{display:none}
  .user-btn .user-ava{width:34px;height:34px}
  
  /* === Content area with bottom nav padding === */
  .content{
    padding:14px 14px 90px;
    -webkit-overflow-scrolling:touch;
    overscroll-behavior:contain
  }
  
  /* === Page head === */
  .page-head{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:16px}
  .page-title{font-size:21px;font-weight:800}
  .page-title .icon{width:34px;height:34px}
  .page-title .icon .ic{width:17px;height:17px}
  .page-sub{font-size:13px}
  .page-cta{flex-wrap:wrap;gap:8px}
  .page-cta .btn{flex:1;justify-content:center;min-width:120px;padding:11px 14px}
  
  /* === Forms 1 column === */
  .form-grid,.fg{grid-template-columns:1fr !important;gap:12px}
  
  /* === KPIs: 2x2 grid === */
  .kpi-grid,.kpi-row{grid-template-columns:repeat(2,1fr) !important;gap:9px}
  .kpi-row.cols-4,.kpi-row.cols-3{grid-template-columns:repeat(2,1fr) !important}
  
  /* === Status bar with chips: horizontal scroll === */
  .status-bar{
    overflow-x:auto;
    overflow-y:hidden;
    flex-wrap:nowrap;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:none;
    padding:9px 11px;
    gap:7px
  }
  .status-bar::-webkit-scrollbar{display:none}
  .chip{flex-shrink:0;padding:7px 11px;font-size:11.5px}
  
  /* === Tables → Card view on mobile === */
  .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:10px}
  .table-wrap table{font-size:12.5px;min-width:auto}
  
  /* Make tables horizontally scrollable with momentum */
  table{font-size:12.5px}
  table thead th{padding:9px 8px;font-size:11px;white-space:nowrap}
  table tbody td{padding:9px 8px;font-size:12px}
  
  /* === Buttons & touch targets === */
  .btn{padding:11px 16px;font-size:13.5px;min-height:42px}
  .btn .ic{width:15px;height:15px}
  
  /* === Form inputs: bigger for touch === */
  input[type="text"],input[type="email"],input[type="password"],input[type="number"],
  input[type="date"],input[type="search"],input[type="tel"],input[type="url"],
  select,textarea{
    font-size:15px !important;  /* prevent iOS zoom */
    min-height:44px;
    padding:10px 13px
  }
  
  /* === Headings === */
  h1{font-size:22px !important}
  h2{font-size:18px !important}
  h3{font-size:16px !important}
  
  /* === Modals: fullscreen on mobile === */
  .modal-backdrop{padding:0;align-items:stretch}
  .modal{
    max-width:100% !important;
    max-height:100vh !important;
    border-radius:0 !important;
    height:100vh;
    display:flex;
    flex-direction:column
  }
  .modal-h{padding:14px 16px;flex-shrink:0;border-bottom:1px solid var(--border)}
  .modal-body{flex:1;overflow-y:auto;padding:14px 16px;-webkit-overflow-scrolling:touch}
  .modal-footer{padding:12px 14px;flex-shrink:0;border-top:1px solid var(--border);position:sticky;bottom:0;background:var(--surface)}
  
  /* === Bottom Navigation === */
  .bottom-nav{
    display:flex;
    position:fixed;
    bottom:0;left:0;right:0;
    height:64px;
    background:var(--surface);
    border-top:1px solid var(--border);
    z-index:100;
    padding-bottom:env(safe-area-inset-bottom);
    box-shadow:0 -2px 12px rgba(0,0,0,0.06)
  }
  [data-theme="dark"] .bottom-nav{box-shadow:0 -2px 12px rgba(0,0,0,0.3)}
  
  .bottom-nav-item{
    flex:1;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:3px;
    text-decoration:none;
    color:var(--text-3);
    font-size:10px;
    font-weight:600;
    font-family:inherit;
    border:none;
    background:transparent;
    cursor:pointer;
    transition:color .12s;
    padding:6px 4px;
    position:relative;
    min-width:0
  }
  .bottom-nav-item .ic{width:21px;height:21px;stroke-width:2}
  .bottom-nav-item span{
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    max-width:100%
  }
  .bottom-nav-item.active{color:var(--brand-600)}
  .bottom-nav-item.active::before{
    content:"";
    position:absolute;
    top:0;left:25%;right:25%;
    height:3px;
    background:var(--brand-600);
    border-radius:0 0 3px 3px
  }
  .bottom-nav-item:active{transform:scale(0.92)}
  
  /* === Cards & panels === */
  .card,.panel,.kpi,.kpi-big,.settings-section{padding:14px;border-radius:12px}
  .panel-h{margin-bottom:12px}
  
  /* === Avatar smaller === */
  .brand-text .s{display:none}
  .brand-logo{width:36px;height:36px}
  .brand-text .n{font-size:17px}
}

/* === SMALL MOBILE (≤ 480px) === */
@media (max-width:480px){
  .content{padding:12px 11px 88px}
  .page-title{font-size:19px}
  .kpi-grid,.kpi-row{grid-template-columns:1fr !important}
  .kpi-row.cols-4,.kpi-row.cols-3,.kpi-row.cols-2{grid-template-columns:1fr !important}
  
  /* Cards-on-mobile pattern: convert simple tables to stacked cards */
  .table-as-cards table thead{display:none}
  .table-as-cards table,
  .table-as-cards tbody,
  .table-as-cards tr{display:block;width:100%}
  .table-as-cards tr{
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:11px;
    padding:11px;
    margin-bottom:9px
  }
  .table-as-cards td{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:5px 0 !important;
    border:none !important;
    font-size:12.5px
  }
  .table-as-cards td::before{
    content:attr(data-label);
    font-weight:600;
    color:var(--text-3);
    font-size:11px;
    margin-inline-end:8px;
    flex-shrink:0
  }
  
  /* Bottom nav: very small adjustments */
  .bottom-nav-item{font-size:9.5px;gap:2px}
  .bottom-nav-item .ic{width:19px;height:19px}
  
  /* Topbar even more compact */
  .topbar{padding:9px 11px;gap:6px;min-height:50px}
  .icon-btn{width:36px;height:36px}
}

/* ========================================
   UNIVERSAL HERO/HIGHLIGHTS MOBILE FIXES
   Applied to all -hero and -highlights patterns
   ======================================== */
@media (max-width:768px){
  /* All hero variants: stack on mobile */
  .cust-hero,.dash-hero,.cmp-hero,.inf-hero,.fin-hero,.an-hero,
  .cnt-hero,.wa-hero,.ugc-hero,.mr-hero{
    padding:18px 18px !important;
    margin-bottom:14px !important
  }
  
  /* Hero grids: single column on mobile */
  .cust-hero-grid,.dash-hero-grid,.cmp-hero-grid,.inf-hero-grid,.fin-hero-grid,
  .an-hero-grid,.cnt-hero-grid,.wa-hero-grid,.ugc-hero-grid,.mr-hero-grid{
    grid-template-columns:1fr !important;
    gap:14px !important
  }
  
  /* Hero titles smaller on mobile */
  .cust-hero h1,.dash-hero h1,.cmp-hero h1,.inf-hero h1,.fin-hero h1,
  .an-hero h1,.cnt-hero h1,.wa-hero h1,.ugc-hero h1,.mr-hero h1{
    font-size:19px !important;
    line-height:1.2 !important
  }
  
  /* Hero subtitle */
  .cust-hero .sub,.dash-hero .sub,.cmp-hero .sub,.inf-hero .sub,.fin-hero .sub,
  .an-hero .sub,.cnt-hero .sub,.wa-hero .sub,.ugc-hero .sub,.mr-hero .sub{
    font-size:12.5px !important
  }
  
  /* Hero stats: 3 columns on mobile */
  .cust-hero-stats,.dash-hero-stats,.cmp-hero-stats,.inf-hero-stats,.fin-hero-stats,
  .an-hero-stats,.cnt-hero-stats,.wa-hero-stats,.ugc-hero-stats,.mr-hero-stats{
    display:grid !important;
    grid-template-columns:repeat(3,1fr) !important;
    gap:7px !important;
    width:100%
  }
  
  /* Hero stat cards */
  .cust-hero-stat,.dash-hero-stat,.cmp-hero-stat,.inf-hero-stat,.fin-hero-stat,
  .an-hero-stat,.cnt-hero-stat,.wa-hero-stat,.ugc-hero-stat,.mr-hero-stat{
    padding:9px 7px !important;
    min-width:auto !important;
    text-align:center
  }
  
  .cust-hero-stat .v,.dash-hero-stat .v,.cmp-hero-stat .v,.inf-hero-stat .v,
  .fin-hero-stat .v,.an-hero-stat .v,.cnt-hero-stat .v,.wa-hero-stat .v,
  .ugc-hero-stat .v,.mr-hero-stat .v{
    font-size:16px !important
  }
  
  .cust-hero-stat .v small,.dash-hero-stat .v small,.fin-hero-stat .v small,.mr-hero-stat .v small{
    font-size:9.5px !important
  }
  
  .cust-hero-stat .l,.dash-hero-stat .l,.cmp-hero-stat .l,.inf-hero-stat .l,
  .fin-hero-stat .l,.an-hero-stat .l,.cnt-hero-stat .l,.wa-hero-stat .l,
  .ugc-hero-stat .l,.mr-hero-stat .l{
    font-size:9.5px !important
  }
  
  /* HIGHLIGHTS: 2 columns on mobile */
  .cust-highlights,.dash-highlights,.cmp-highlights{
    grid-template-columns:repeat(2,1fr) !important;
    gap:8px !important
  }
  
  /* Highlight card compact */
  .cust-hl,.dash-hl,.cmp-hl{
    padding:11px 12px !important;
    gap:9px !important
  }
  
  .cust-hl .ic-wrap,.dash-hl .ic-wrap,.cmp-hl .ic-wrap{
    width:32px !important;
    height:32px !important
  }
  .cust-hl .ic-wrap .ic,.dash-hl .ic-wrap .ic,.cmp-hl .ic-wrap .ic{
    width:15px !important;
    height:15px !important
  }
  
  .cust-hl .val,.dash-hl .val,.cmp-hl .val{
    font-size:17px !important
  }
  .cust-hl .val small,.dash-hl .val small,.cmp-hl .val small{
    font-size:10px !important
  }
  .cust-hl .lbl,.dash-hl .lbl,.cmp-hl .lbl{
    font-size:10px !important
  }
  
  /* Hero tags wrap */
  .cmp-hero-tags{gap:5px !important}
  .cmp-hero-tag{padding:3px 8px !important;font-size:10.5px !important}
  
  /* Dashboard 2col layout: stack on mobile */
  .dash-grid-2col{grid-template-columns:1fr !important;gap:12px !important}
  
  /* Kanban grid: 2 columns */
  .kanban-grid{grid-template-columns:repeat(2,1fr) !important;gap:8px !important}
  .kanban-col{padding:11px !important}
  .kanban-col .v{font-size:20px !important}
  
  /* Bucket tabs: scrollable horizontally */
  .bucket-tab{padding:10px 14px !important}
  .bucket-btn{padding:6px 10px !important;font-size:11.5px !important}
  
  /* Task rows */
  .task-row{padding:11px 14px !important;gap:9px !important}
  .task-time{min-width:46px !important;padding-inline-end:9px !important}
  .task-time .t-d{font-size:12px !important}
  .task-time .t-m{font-size:10px !important}
  .task-name{font-size:13px !important}
  .task-meta{font-size:10.5px !important}
  .task-status{font-size:10px !important;padding:2px 7px !important}
  
  /* Campaign detail influencer rows */
  .inf-row{padding:11px 13px !important;gap:10px !important}
  .inf-avatar{width:36px !important;height:36px !important;font-size:13px !important}
  .inf-info .name{font-size:13px !important}
  .inf-info .meta{font-size:10.5px !important}
  .inf-stat-mini{padding:4px 8px !important;font-size:10.5px !important}
  
  /* Ad cards */
  .ad-card{margin:10px 13px !important}
  .ad-card-head{padding:10px 13px !important;gap:7px !important;flex-wrap:wrap}
  .ad-section{padding:11px 13px !important}
  .ad-fields{grid-template-columns:1fr !important;gap:9px !important}
  .ad-field .f-val{padding:8px 11px !important;font-size:13px !important}
  
  /* Journey steps: stack content */
  .j-step{flex-wrap:wrap !important;padding:11px 12px !important}
  .j-body{flex-basis:calc(100% - 36px) !important;min-width:0}
  .j-upload{width:100% !important;justify-content:center !important;margin-top:7px !important}
  
  /* Section headers */
  .dash-section-head,.section-head{padding:11px 14px !important}
  
  /* Actions row */
  .actions-row{gap:9px !important}
  .actions-row .right{width:100%;display:flex;gap:7px}
  .actions-row .right .btn{flex:1;justify-content:center;padding:10px 11px !important;font-size:12.5px !important}
  
  /* Chip rows: scrollable */
  .chip-row{
    overflow-x:auto;
    flex-wrap:nowrap !important;
    -webkit-overflow-scrolling:touch;
    padding-bottom:4px;
    scrollbar-width:none
  }
  .chip-row::-webkit-scrollbar{display:none}
  .cstm-chip{flex-shrink:0}
  
  /* Search card */
  .search-card{padding:11px 13px !important;flex-wrap:wrap;gap:9px !important}
  .search-card .field input{font-size:14px !important}
  .search-card .results-count{padding-inline-start:0 !important;border:none !important;font-size:11px}
  
  /* Customer/Entity cards on mobile */
  .cust-cell{gap:9px !important}
  .cust-cell .icon-box{width:32px !important;height:32px !important}
  .cust-cell .info .name{font-size:13px !important}
  .cust-cell .info .meta{font-size:10.5px !important}
  
  /* Table cells more compact */
  table.customers-tbl tbody td,table.tbl tbody td{padding:11px 10px !important;font-size:12.5px !important}
  table.customers-tbl thead th,table.tbl thead th{padding:10px 10px !important;font-size:11px !important}
  
  /* Two columns sections become one */
  .charts-grid,.dash-grid-2col,.kpis-grid{grid-template-columns:1fr !important;gap:12px !important}
  
  /* Mini calendar */
  .cal-wrap{padding:11px 13px !important}
  .cal-day{min-height:32px !important;padding:3px !important}
  .cal-day .d-n{font-size:10.5px !important}
  .cal-day .d-c{font-size:9px !important}
  .cal-name{font-size:9px !important;padding:4px 0 !important}
}

/* === EXTRA SMALL (≤ 380px) === */
@media (max-width:380px){
  .cust-highlights,.dash-highlights,.cmp-highlights{grid-template-columns:1fr !important}
  .cust-hero-stats,.dash-hero-stats,.cmp-hero-stats,.inf-hero-stats,.fin-hero-stats,
  .an-hero-stats,.cnt-hero-stats,.wa-hero-stats,.ugc-hero-stats,.mr-hero-stats{
    grid-template-columns:repeat(2,1fr) !important
  }
  .kanban-grid{grid-template-columns:1fr !important}
  
  /* Heading even smaller */
  .cust-hero h1,.dash-hero h1,.cmp-hero h1,.inf-hero h1,.fin-hero h1,
  .an-hero h1,.cnt-hero h1,.wa-hero h1,.ugc-hero h1,.mr-hero h1{
    font-size:17px !important
  }
}

/* === LANDSCAPE MOBILE === */
@media (max-width:900px) and (orientation:landscape) and (max-height:500px){
  .bottom-nav{height:52px}
  .bottom-nav-item{font-size:9.5px}
  .bottom-nav-item .ic{width:18px;height:18px}
  .content{padding-bottom:72px}
}

/* === HOVER-LESS DEVICES (touch) === */
@media (hover:none){
  /* Bigger touch targets everywhere */
  button:not(.bottom-nav-item):not(.toggle):not(.user-btn),
  .btn,.icon-btn,.chip{min-height:42px}
  input,select,textarea{min-height:44px;font-size:16px !important}
  .toggle{min-height:24px}
  
  /* Remove hover effects that linger on touch */
  .nav-item:hover,.btn:hover,.chip:hover,.task:hover,.work-card:hover,.kpi:hover,
  .top-item:hover,.backup-card:hover{transform:none}
  
  /* Active state for visual feedback */
  .nav-item:active,.btn:active,.chip:active,.task:active,.work-card:active,
  .top-item:active{opacity:0.7}
}

/* === PRINT === */
@media print{
  .sidebar,.topbar,.bottom-nav,.btn,.icon-btn,.toggle,.modal-backdrop{display:none !important}
  .app{grid-template-columns:1fr}
  .content{padding:0;overflow:visible}
  body{overflow:visible;background:#fff;font-size:11pt}
  table{font-size:9pt}
}

/* === Safe area for notched devices === */
@supports (padding:env(safe-area-inset-top)){
  body{
    padding-left:env(safe-area-inset-left);
    padding-right:env(safe-area-inset-right)
  }
  .topbar{padding-top:max(10px,env(safe-area-inset-top))}
}

/* === PWA-like fullscreen feel on mobile === */
@media (display-mode:standalone){
  .topbar{padding-top:max(16px,env(safe-area-inset-top))}
}

/* === Prevent text selection on UI chrome === */
.bottom-nav,.topbar,.sidebar,.nav-item,.btn,.icon-btn,.chip{
  -webkit-user-select:none;
  user-select:none;
  -webkit-tap-highlight-color:transparent
}

/* === Smooth scrolling everywhere === */
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{overscroll-behavior-y:contain}

/* ═══════════════════════════════════════════════════════════════════
   PREMIUM UX POLISH LAYER (v5.2)
   تحسينات احترافية — حفاظ كامل على الهوية + رفع جودة التجربة
   ═══════════════════════════════════════════════════════════════════ */

:root{
  /* Refined spacing scale */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  
  /* Premium shadows — layered for depth */
  --sh-xs: 0 1px 2px rgba(15,23,42,.04);
  --sh-sm: 0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04);
  --sh-md: 0 4px 12px rgba(15,23,42,.06), 0 2px 4px rgba(15,23,42,.04);
  --sh-lg: 0 12px 32px rgba(15,23,42,.08), 0 4px 8px rgba(15,23,42,.04);
  --sh-xl: 0 24px 48px rgba(15,23,42,.12), 0 8px 16px rgba(15,23,42,.06);
  --sh-brand: 0 4px 14px rgba(13,138,111,.20);
  --sh-brand-lg: 0 8px 24px rgba(13,138,111,.28);
  
  /* Smooth easing curves */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Focus ring — accessibility + branded */
  --focus-ring: 0 0 0 3px rgba(13,138,111,.18);
  --focus-ring-strong: 0 0 0 4px rgba(13,138,111,.24);
}

[data-theme="dark"]{
  --sh-xs: 0 1px 2px rgba(0,0,0,.4);
  --sh-sm: 0 1px 3px rgba(0,0,0,.4), 0 1px 2px rgba(0,0,0,.3);
  --sh-md: 0 4px 12px rgba(0,0,0,.45), 0 2px 4px rgba(0,0,0,.3);
  --sh-lg: 0 12px 32px rgba(0,0,0,.55), 0 4px 8px rgba(0,0,0,.35);
  --sh-xl: 0 24px 48px rgba(0,0,0,.65), 0 8px 16px rgba(0,0,0,.4);
  --sh-brand: 0 4px 14px rgba(20,195,154,.30);
  --sh-brand-lg: 0 8px 24px rgba(20,195,154,.40);
  --focus-ring: 0 0 0 3px rgba(20,195,154,.30);
  --focus-ring-strong: 0 0 0 4px rgba(20,195,154,.40);
}

/* ─────────── TYPOGRAPHY: refined scale + improved readability ─────────── */

body{
  font-size: 14.5px;
  line-height: 1.55;
  letter-spacing: -0.005em;
}

/* Headings — display font with tight tracking for premium feel */
h1, .h1{
  font-family: var(--font-display);
  font-size: 26px; font-weight: 800;
  letter-spacing: -0.025em; line-height: 1.2;
}
h2, .h2{
  font-family: var(--font-display);
  font-size: 20px; font-weight: 700;
  letter-spacing: -0.02em; line-height: 1.3;
}
h3, .h3{
  font-family: var(--font-display);
  font-size: 16px; font-weight: 700;
  letter-spacing: -0.015em; line-height: 1.35;
}

/* Tabular numerals for ALL numeric data — better alignment */
.tabular, table.tbl td, .kpi-val, .dash-hero-stat .v, .dash-hl .val,
.cell-id, .badge, .bn-badge, .nav-item .badge, .chip .n,
.task-time .t-d, .stat-num, [data-num]{
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: 'tnum' 1, 'lnum' 1;
}

/* ─────────── SIDEBAR: enhanced readability + tighter polish ─────────── */

.sidebar{
  padding: 20px 14px;
}
.brand{
  padding: 4px 6px 20px;
  margin-bottom: 10px;
}
.brand-text .n{
  font-size: 19.5px;
  letter-spacing: -0.6px;
}
.brand-text .s{
  font-size: 9.5px;
  letter-spacing: 1.8px;
  opacity: 0.92;
}

.nav-section{
  font-size: 10px;
  letter-spacing: 1.4px;
  padding: 16px 10px 7px;
  opacity: 0.78;
}
.nav-item{
  padding: 9px 11px;
  font-size: 13.5px;
  border-radius: 9px;
  transition: background-color .18s var(--ease-out), color .18s var(--ease-out), transform .15s var(--ease-out);
}
.nav-item:hover{
  transform: translateX(-2px);
}
[dir="ltr"] .nav-item:hover{ transform: translateX(2px); }
.nav-item .ic{
  width: 17px; height: 17px;
}
.nav-item .badge{
  font-size: 10.5px;
  padding: 2px 7px;
  min-width: 22px;
  font-weight: 700;
}
.nav-item.active{
  box-shadow: inset 0 0 0 1px rgba(13,138,111,.08);
}
.nav-item.active::before{
  width: 3px;
  inset-inline-start: -10px;
  background: linear-gradient(180deg, var(--brand-500), var(--brand-700));
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(13,138,111,.4);
}

/* ─────────── TOPBAR: cleaner spacing ─────────── */
.topbar{
  padding: 14px 24px;
  box-shadow: var(--sh-xs);
}
.crumb{ font-size: 13.5px; }
.crumb b{ font-weight: 700; }

/* ─────────── BUTTONS: premium feedback + tactile feel ─────────── */

.btn{
  padding: 10px 16px;
  font-size: 13.5px;
  border-radius: 10px;
  transition: background-color .15s var(--ease-out),
              color .15s var(--ease-out),
              border-color .15s var(--ease-out),
              transform .15s var(--ease-out),
              box-shadow .2s var(--ease-out);
}
.btn:active:not(:disabled){
  transform: translateY(0) scale(0.97);
  transition-duration: .08s;
}
.btn:focus-visible{
  outline: none;
  box-shadow: var(--focus-ring), var(--sh-sm);
}
.btn .ic{ width: 16px; height: 16px; }

.btn-primary{
  background: var(--brand-600);
  color: #fff;
  box-shadow: 0 1px 2px rgba(13,138,111,.2), 0 4px 12px rgba(13,138,111,.18);
  font-weight: 600;
}
.btn-primary:hover{
  background: var(--brand-700);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(13,138,111,.25), 0 8px 20px rgba(13,138,111,.25);
}
.btn-primary:active:not(:disabled){
  background: var(--brand-700);
  transform: translateY(0) scale(0.97);
  box-shadow: 0 1px 2px rgba(13,138,111,.2);
}

.btn-ghost{
  transition: all .15s var(--ease-out);
}
.btn-ghost:hover{
  transform: translateY(-1px);
  box-shadow: var(--sh-sm);
}

/* Icon buttons — better tap target */
.icon-btn, .btn-icon{
  transition: background-color .15s var(--ease-out),
              color .15s var(--ease-out),
              transform .15s var(--ease-out);
}
.icon-btn:hover, .btn-icon:hover{
  transform: scale(1.08);
}
.icon-btn:active, .btn-icon:active{
  transform: scale(0.92);
  transition-duration: .08s;
}

/* ─────────── CARDS: lift + depth on hover ─────────── */

.card{
  transition: transform .2s var(--ease-out), box-shadow .25s var(--ease-out), border-color .15s;
}

/* ─────────── KPI / STAT CARDS: BIG numbers, premium feel ─────────── */

.kpi-big, .stat-card{
  padding: 18px 20px;
  border-radius: 14px;
  transition: transform .25s var(--ease-out), box-shadow .3s var(--ease-out), border-color .2s;
  position: relative;
  overflow: hidden;
}
.kpi-big:hover, .stat-card:hover{
  transform: translateY(-3px);
  box-shadow: var(--sh-lg);
}
.kpi-big .kpi-val, .stat-card .kpi-val, .kpi-val{
  font-family: var(--font-display);
  font-size: 30px !important;
  font-weight: 800;
  letter-spacing: -1.2px;
  line-height: 1.1;
}
.kpi-big .kpi-label, .stat-card .kpi-label, .kpi-label{
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

/* Dashboard hero — larger stats for visual hierarchy */
.dash-hero{
  padding: 22px 26px;
  border-radius: 16px;
}
.dash-hero-left h1{
  font-size: 22px !important;
  letter-spacing: -0.6px;
}
.dash-hero-left .sub{
  font-size: 13.5px;
  opacity: 0.92;
}
.dash-hero-stat{
  padding: 11px 16px;
  min-width: 90px;
  border-radius: 12px;
  transition: transform .2s var(--ease-out), background-color .2s;
}
.dash-hero-stat:hover{
  transform: translateY(-2px);
  background: rgba(255,255,255,0.22);
}
.dash-hero-stat .v{
  font-size: 22px !important;
  letter-spacing: -0.5px;
  line-height: 1;
}
.dash-hero-stat .l{
  font-size: 10px;
  letter-spacing: 0.5px;
}

@media (max-width: 768px){
  .dash-hero-stat .v{ font-size: 18px !important; }
  .dash-hero-left h1{ font-size: 19px !important; }
}

/* Dashboard highlights — bigger numbers, smoother hover */
.dash-hl{
  padding: 14px 16px;
  border-radius: 13px;
  transition: transform .2s var(--ease-out), box-shadow .25s var(--ease-out), border-color .2s;
}
.dash-hl:hover{
  transform: translateY(-2px);
  box-shadow: var(--sh-md);
}
.dash-hl .ic-wrap{
  width: 38px; height: 38px;
  border-radius: 11px;
  transition: transform .2s var(--ease-out);
}
.dash-hl:hover .ic-wrap{
  transform: scale(1.06) rotate(-3deg);
}
.dash-hl .ic-wrap .ic{ width: 17px; height: 17px; }
.dash-hl .val{
  font-size: 22px !important;
  letter-spacing: -0.5px;
  font-weight: 800;
}
.dash-hl .val small{ font-size: 11px; opacity: 0.7; }
.dash-hl .lbl{
  font-size: 10.5px;
  letter-spacing: 0.4px;
}

/* Dashboard sections — better breathing room */
.dash-section{
  border-radius: 14px;
  box-shadow: var(--sh-xs);
}
.dash-section-head{
  padding: 14px 18px;
}
.dash-section-head .title{
  font-size: 14px;
}
.dash-section-head .title .ic-w{
  width: 32px; height: 32px;
  border-radius: 9px;
}
.dash-section-head .title .ic-w .ic{ width: 15px; height: 15px; }

/* ─────────── TABLES: refined readability ─────────── */

table.tbl{ font-size: 13.5px; }
table.tbl thead th{
  padding: 13px 16px;
  font-size: 11px;
  letter-spacing: 0.4px;
  font-weight: 700;
}
table.tbl tbody td{
  padding: 14px 16px;
  font-size: 13.5px;
}
table.tbl tbody tr{
  transition: background-color .15s var(--ease-out);
}
.cell-entity .info .n{
  font-size: 13.5px;
  font-weight: 600;
}
.cell-entity .info .s{ font-size: 11px; }
.cell-entity .ava{
  width: 34px; height: 34px;
  border-radius: 9px;
  font-size: 13.5px;
}

/* ─────────── STATUS CHIPS + PILLS: clearer ─────────── */

.chip{
  padding: 7px 12px;
  font-size: 12.5px;
  border-radius: 9px;
  transition: all .15s var(--ease-out);
}
.chip:hover{
  transform: translateY(-1px);
  box-shadow: var(--sh-xs);
}
.chip .n{ font-size: 11px; padding: 2px 6px; }

/* ─────────── MODALS: smooth entrance + better proportions ─────────── */

.modal-backdrop{
  animation: modalBackdropIn .25s var(--ease-out);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
.modal{
  animation: modalIn .35s var(--ease-spring);
  border-radius: 16px;
  box-shadow: var(--sh-xl);
}
.modal-head{
  padding: 20px 24px 16px;
}
.modal-head h3{
  font-size: 19px;
  letter-spacing: -0.3px;
}
.modal-body{ padding: 20px 24px; }
.modal-footer{ padding: 16px 24px; }

@keyframes modalBackdropIn{
  from{ opacity: 0 }
  to{ opacity: 1 }
}
@keyframes modalIn{
  from{ opacity: 0; transform: translateY(20px) scale(0.96) }
  to{ opacity: 1; transform: translateY(0) scale(1) }
}

/* ─────────── FILTERS / FIELDS: refined ─────────── */

.filters{
  padding: 14px 16px;
  border-radius: 14px;
}
.field{
  padding: 9px 12px;
  font-size: 13px;
  border-radius: 9px;
  transition: border-color .15s, background-color .15s, box-shadow .15s;
}
.field:focus-within{
  border-color: var(--brand-500);
  background: var(--surface);
  box-shadow: var(--focus-ring);
}
.field .ic{ width: 15px; height: 15px; }

/* Search inputs — premium focus state */
.sidebar-search input,
.search-wrap input{
  font-size: 13px;
  padding-top: 10px; padding-bottom: 10px;
  transition: all .2s var(--ease-out);
}
.sidebar-search input:focus,
.search-wrap input:focus{
  box-shadow: var(--focus-ring);
}

/* ─────────── INPUTS: consistent focus ─────────── */

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="number"],
input[type="date"],
input[type="password"],
input[type="search"],
input[type="url"],
select, textarea{
  transition: border-color .15s var(--ease-out), box-shadow .15s var(--ease-out);
}
input:focus-visible:not([type="checkbox"]):not([type="radio"]),
select:focus-visible,
textarea:focus-visible{
  outline: none !important;
  border-color: var(--brand-500) !important;
  box-shadow: var(--focus-ring) !important;
}

/* ─────────── BADGES: pill-style polish ─────────── */

.nav-item .badge{
  transition: background-color .2s var(--ease-out), color .2s var(--ease-out), transform .2s var(--ease-out);
}
.nav-item:hover .badge{
  transform: scale(1.06);
}

/* ─────────── TOASTS / NOTIFICATIONS: refined ─────────── */

.toast{
  border-radius: 12px !important;
  box-shadow: var(--sh-lg) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* ─────────── PAGE LOAD: staggered entrance ─────────── */

@keyframes scFadeIn{
  from{ opacity: 0; transform: translateY(8px) }
  to{ opacity: 1; transform: translateY(0) }
}
@keyframes scSlideIn{
  from{ opacity: 0; transform: translateY(12px) }
  to{ opacity: 1; transform: translateY(0) }
}

/* Apply staggered fade-in to main content blocks (scoped to <main> only) */
main.main > * > .dash-hero,
main.main > * > .dash-highlights,
main.main > * > .dash-section,
main.main > * > .page-head,
main.main > * > .kpi-grid,
main.main > * > .filters,
main.main > * > .table-wrap{
  animation: scSlideIn .28s var(--ease-out) backwards;
}
main.main > * > .dash-hero{ animation-delay: 0ms }
main.main > * > .dash-highlights{ animation-delay: 40ms }
main.main > * > .dash-grid-2col{ animation: scSlideIn .28s var(--ease-out) 80ms backwards }
main.main > * > .dash-section{ animation-delay: 120ms }
main.main > * > .page-head{ animation-delay: 0ms }
main.main > * > .kpi-grid{ animation-delay: 40ms }
main.main > * > .filters{ animation-delay: 80ms }
main.main > * > .table-wrap{ animation-delay: 120ms }

/* ─────────── LOADING SHIMMER ─────────── */

@keyframes shimmer{
  0%{ background-position: -1000px 0 }
  100%{ background-position: 1000px 0 }
}
.skeleton{
  background: linear-gradient(90deg,
    var(--gray-100) 0%,
    var(--gray-200) 50%,
    var(--gray-100) 100%);
  background-size: 1000px 100%;
  animation: shimmer 1.8s linear infinite;
  border-radius: 8px;
}

/* ─────────── SCROLLBARS: minimal premium ─────────── */

::-webkit-scrollbar{ width: 8px; height: 8px; }
::-webkit-scrollbar-track{ background: transparent }
::-webkit-scrollbar-thumb{
  background: var(--border-strong);
  border-radius: 8px;
  border: 2px solid var(--bg);
}
::-webkit-scrollbar-thumb:hover{ background: var(--gray-400); }

/* ─────────── ACCESSIBILITY: respect motion preferences ─────────── */

@media (prefers-reduced-motion: reduce){
  *, *::before, *::after{
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .nav-item:hover{ transform: none; }
}

/* ─────────── RESPONSIVE: refined mobile ─────────── */

@media (max-width: 768px){
  body{ font-size: 14px; }
  
  .kpi-big .kpi-val, .kpi-val{
    font-size: 24px !important;
    letter-spacing: -0.8px;
  }
  .dash-hl .val{ font-size: 19px !important; }
  
  .btn{ padding: 10px 14px; font-size: 13px; }
  .modal-head h3{ font-size: 17px; }
  
  table.tbl tbody td{ padding: 12px 13px; font-size: 13px; }
  
  /* Larger tap targets on mobile */
  .nav-item{ padding: 10px 12px; }
  .icon-btn, .btn-icon{ min-width: 38px; min-height: 38px; }
}

/* ─────────── PRINT: cleaner output ─────────── */

@media print{
  .sidebar, .topbar, .bottom-nav, .btn, .filters{ display: none !important; }
  body{ font-size: 12pt; line-height: 1.5; }
  .main{ padding: 0 !important; }
  .card, .kpi-big{ box-shadow: none !important; border: 1px solid #ddd !important; }
}

/* ─────────── DARK MODE: refined contrast ─────────── */

[data-theme="dark"] .nav-item.active::before{
  background: linear-gradient(180deg, var(--brand-400), var(--brand-500));
  box-shadow: 0 0 8px rgba(20,195,154,.5);
}
[data-theme="dark"] .btn-primary{
  background: var(--brand-500);
}
[data-theme="dark"] .btn-primary:hover{
  background: var(--brand-600);
}

/* ─────────── BOTTOM NAV (mobile): polish ─────────── */

.bottom-nav a{
  transition: color .15s var(--ease-out), transform .15s var(--ease-out);
}
.bottom-nav a:active{
  transform: scale(0.92);
  transition-duration: .08s;
}
/* ═══════════════════════════════════════════════════════════════════
   UNIFIED SOFT-PILL SYSTEM
   Same aesthetic as "نشط" status pill — distinctive, refined, premium
   Use across the system for ALL badges, statuses, tags, indicators
   ═══════════════════════════════════════════════════════════════════ */

/* Bottom nav badge — soft mint style (matches sidebar) */
.bottom-nav .bn-badge{
  position: absolute;
  top: 6px;
  inset-inline-end: 22%;
  background: #f0fdf4;
  color: #14532d;
  border: 1px solid #bbf7d0;
  font-size: 9.5px;
  font-weight: 700;
  font-family: var(--font-mono);
  padding: 1px 6px;
  border-radius: 999px;
  min-width: 18px;
  text-align: center;
  letter-spacing: 0.2px;
  line-height: 1.4;
}
[data-theme="dark"] .bottom-nav .bn-badge{
  background: rgba(34,197,94,0.12);
  color: #4ade80;
  border-color: rgba(34,197,94,0.3);
}

.sc-pill{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-body);
  border: 1px solid;
  white-space: nowrap;
  line-height: 1.4;
  transition: transform .15s var(--ease-out), box-shadow .15s var(--ease-out);
}

/* Optional dot indicator */
.sc-pill .dot{
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Number variant — for count badges (no dot, mono font) */
.sc-pill.count{
  padding: 2px 9px;
  font-size: 10.5px;
  font-family: var(--font-mono);
  font-weight: 700;
  letter-spacing: 0.2px;
  min-width: 24px;
  text-align: center;
  justify-content: center;
}

/* ═══ COLOR VARIANTS ═══ */
/* Each variant follows: light bg + dark text + soft border + medium dot */

/* SUCCESS / ACTIVE — mint green (default, like "نشط") */
.sc-pill.success, .sc-pill.active{
  background: #f0fdf4;
  color: #14532d;
  border-color: #bbf7d0;
}
.sc-pill.success .dot, .sc-pill.active .dot{ background: #16a34a; }

/* WARNING / PENDING — light amber */
.sc-pill.warning, .sc-pill.pending{
  background: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}
.sc-pill.warning .dot, .sc-pill.pending .dot{ background: #f59e0b; }

/* DANGER / OVERDUE / CANCELLED — light red */
.sc-pill.danger, .sc-pill.overdue, .sc-pill.cancelled{
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}
.sc-pill.danger .dot, .sc-pill.overdue .dot, .sc-pill.cancelled .dot{ background: #dc2626; }

/* INFO / IN-PROGRESS — light blue */
.sc-pill.info, .sc-pill.in_progress{
  background: #eff6ff;
  color: #1e3a8a;
  border-color: #bfdbfe;
}
.sc-pill.info .dot, .sc-pill.in_progress .dot{ background: #3b82f6; }

/* NEUTRAL / INACTIVE / DRAFT — soft gray */
.sc-pill.neutral, .sc-pill.inactive, .sc-pill.draft{
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}
.sc-pill.neutral .dot, .sc-pill.inactive .dot, .sc-pill.draft .dot{ background: #94a3b8; }

/* PURPLE / SPECIAL / VIP — soft purple */
.sc-pill.purple, .sc-pill.vip{
  background: #faf5ff;
  color: #6b21a8;
  border-color: #e9d5ff;
}
.sc-pill.purple .dot, .sc-pill.vip .dot{ background: #9333ea; }

/* TEAL / VERIFIED / CONFIRMED — light teal */
.sc-pill.teal, .sc-pill.verified, .sc-pill.confirmed{
  background: #f0fdfa;
  color: #115e59;
  border-color: #99f6e4;
}
.sc-pill.teal .dot, .sc-pill.verified .dot, .sc-pill.confirmed .dot{ background: #14b8a6; }

/* Hover state — subtle lift */
.sc-pill:hover{
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(15,23,42,.06);
}

/* ═══ DARK MODE — translucent backgrounds for proper contrast ═══ */
[data-theme="dark"] .sc-pill.success, [data-theme="dark"] .sc-pill.active{
  background: rgba(34,197,94,0.12);
  color: #4ade80;
  border-color: rgba(34,197,94,0.3);
}
[data-theme="dark"] .sc-pill.warning, [data-theme="dark"] .sc-pill.pending{
  background: rgba(251,191,36,0.12);
  color: #fbbf24;
  border-color: rgba(251,191,36,0.3);
}
[data-theme="dark"] .sc-pill.danger, [data-theme="dark"] .sc-pill.overdue, [data-theme="dark"] .sc-pill.cancelled{
  background: rgba(248,113,113,0.12);
  color: #f87171;
  border-color: rgba(248,113,113,0.3);
}
[data-theme="dark"] .sc-pill.info, [data-theme="dark"] .sc-pill.in_progress{
  background: rgba(96,165,250,0.12);
  color: #60a5fa;
  border-color: rgba(96,165,250,0.3);
}
[data-theme="dark"] .sc-pill.neutral, [data-theme="dark"] .sc-pill.inactive, [data-theme="dark"] .sc-pill.draft{
  background: var(--surface-2);
  color: var(--text-3);
  border-color: var(--border);
}
[data-theme="dark"] .sc-pill.purple, [data-theme="dark"] .sc-pill.vip{
  background: rgba(168,85,247,0.15);
  color: #c084fc;
  border-color: rgba(168,85,247,0.3);
}
[data-theme="dark"] .sc-pill.teal, [data-theme="dark"] .sc-pill.verified, [data-theme="dark"] .sc-pill.confirmed{
  background: rgba(20,184,166,0.15);
  color: #5eead4;
  border-color: rgba(20,184,166,0.3);
}

/* ═══ HARMONIZE EXISTING PILL CLASSES TO MATCH ═══ */
/* Bring all existing status indicators in line with the "نشط" aesthetic */

/* Status pills (.status-pill) — already similar, ensure border-radius is full pill */
.status-pill{
  border-radius: 999px;
  padding: 4px 11px;
  font-size: 12px;
  font-weight: 600;
  border-width: 1px;
}

/* Cell status (.cell-status) — used in tables, harmonize */
.cell-status{
  border-radius: 999px !important;
  padding: 4px 11px !important;
  font-size: 11.5px !important;
  border-width: 1px;
}

/* Task status (.task-status) — used in dashboard task lists */
.task-status{
  border-radius: 999px !important;
  padding: 3px 9px !important;
  font-size: 10px !important;
  border: 1px solid transparent;
}
.task-status.draft{ background:#f8fafc; color:#475569; border-color:#e2e8f0 }
.task-status.scheduled{ background:#eff6ff; color:#1e3a8a; border-color:#bfdbfe }
.task-status.in_progress{ background:#fffbeb; color:#92400e; border-color:#fde68a }
.task-status.completed{ background:#f0fdf4; color:#14532d; border-color:#bbf7d0 }
.task-status.overdue{ background:#fef2f2; color:#991b1b; border-color:#fecaca }

/* Chip filter — keep current but ensure consistent radius */
.chip{
  border-radius: 999px;
}

/* All count-style badges follow soft pill aesthetic */
.dash-section-head .badge,
.results-count{
  border-radius: 999px;
}
`;

const SIDEBAR_HTML = function(activePage, session){
  // ===== القائمة الجانبية المعتمدة — مرتبة حسب رحلة العمل الفعلية =====
  let mainItems = [
    { page:'dashboard',        icon:'i-dashboard', label:'لوحة التحكم' },
    { page:'requests',         icon:'i-inbox',     label:'الطلبات' },
    { page:'calendar',         icon:'i-calendar',  label:'التقويم' },
    { page:'customers',        icon:'i-users',     label:'العملاء' },
    { page:'influencers',      icon:'i-star',      label:'المؤثرون' },
    { page:'publishers',       icon:'i-globe',     label:'الناشرون' },
    { page:'orders-campaigns', icon:'i-megaphone', label:'الحملات' },
    { page:'ugc-admin',        icon:'i-video',     label:'UGC' },
    { page:'finance',          icon:'i-wallet',    label:'المالية' },
    { page:'content',          icon:'i-folder',    label:'المحتوى' },
    { page:'analytics',        icon:'i-chart',     label:'التحليلات' }
  ];
  let systemItems = [
    { page:'settings',         icon:'i-settings',  label:'الإعدادات' }
  ];

  // ===== الشارات (أعداد سياقية) =====
  const api = window.SC && window.SC.api;
  let badges = {};
  if(api){
    try{
      const stats = api.dashboardStats();
      const content = (api.content?.list?.() || []);
      const pendingContent = content.filter(c => c.status !== 'completed' && c.status !== 'archived').length;
      const ugcCreators = (api.ugc_creators?.list?.() || []);
      const pendingUgc = ugcCreators.filter(u => u.status === 'pending' || u.status === 'screening').length;
      const dailyAds = (api.daily_ads?.list?.() || []);
      const today = new Date(); today.setHours(0,0,0,0);
      const weekLater = new Date(today); weekLater.setDate(today.getDate() + 7);
      const upcomingAds = dailyAds.filter(a => {
        if(!a.publish_date || a.status === 'completed') return false;
        const d = new Date(a.publish_date);
        return d >= today && d <= weekLater;
      }).length;

      let reqBadge = null; try { reqBadge = (api.requests?.needingAction?.()||[]).length || null; } catch(e){}
      badges = {
        requests:           reqBadge,
        customers:          stats.customers_total || 0,
        influencers:        stats.influencers_total || 0,
        'orders-campaigns': stats.campaigns_total || 0,
        finance:            stats.transfers_pending || null,
        calendar:           upcomingAds || null,
        content:            pendingContent || null,
        'ugc-admin':        pendingUgc || null,
        analytics:          null
      };
    }catch(e){ console.warn('[ui] badges:', e); }
  }

  // ===== التصفية حسب الصلاحية =====
  const auth = window.SC && window.SC.auth;
  if(auth && session){
    const role = auth.ROLES[session.role];
    if(role && !role.pages.includes('*')){
      mainItems   = mainItems.filter(i => role.pages.includes(i.page));
      systemItems = systemItems.filter(i => role.pages.includes(i.page));
    }
  }

  const renderItem = (item) => {
    const isActive = item.page === activePage;
    const badge = item.badge || badges[item.page];
    return '<a href="'+item.page+'.html" class="nav-item'+(isActive ? ' active' : '')+'"'+(isActive?' aria-current="page"':'')+' title="'+item.label+'">' +
      '<svg class="ic"><use href="#'+item.icon+'"/></svg>' +
      '<span class="nav-label">'+item.label+'</span>' +
      (badge !== undefined && badge !== null && badge !== '' ? '<span class="badge">'+badge+'</span>' : '') +
    '</a>';
  };

  // ===== معلومات المستخدم =====
  const role = (auth && session) ? auth.ROLES[session.role] : null;
  const userName = session?.name || 'admin';
  const userRole = role?.label || 'مدير النظام';
  const userInitial = (userName || '?').trim().charAt(0).toUpperCase();
  const userColor = role?.color || '#7c3aed';

  return `
    <aside class="sidebar">
      <a href="dashboard.html" class="brand" style="text-decoration:none;color:inherit">
        <div class="brand-logo">S</div>
        <div class="brand-text">
          <div class="n">Smart<b>Code</b></div>
          <div class="s">INFLUENCER CRM V5</div>
        </div>
      </a>

      <nav class="nav">
        ${mainItems.map(renderItem).join('')}
        ${systemItems.length ? '<div class="nav-sep"></div>' + systemItems.map(renderItem).join('') : ''}
      </nav>

      <button class="sidebar-collapse" id="sidebar-collapse-btn" title="طيّ / توسيع القائمة" aria-label="طيّ القائمة" type="button">
        <svg class="ic"><use href="#i-chevron-right"/></svg>
        <span class="nav-label">طيّ القائمة</span>
      </button>

      <div class="user-card" id="sidebar-user-card" style="cursor:${session ? 'pointer' : 'default'}" ${session ? 'role="button" tabindex="0"' : ''}>
        <div class="avatar" style="background:${userColor}">${userInitial}</div>
        <div class="info">
          <div class="n">${userName}</div>
          <div class="r">${userRole}</div>
        </div>
        ${session ? '<svg class="ic chevron" style="width:13px;height:13px;color:var(--text-3)"><use href="#i-chevron-left"/></svg>' : ''}
      </div>
    </aside>
  `;
};

// ═══════════ BREADCRUMB NAVIGATION SYSTEM ═══════════
// Maps a breadcrumb label → destination page (for clickable navigation)
const SC_LABEL_HREF = {
  'لوحة التحكم':'dashboard.html','الطلبات':'requests.html','الرئيسية':'dashboard.html',
  'المهام':'tasks.html',
  'التقويم':'calendar.html',
  'العملاء':'customers.html',
  'المؤثرون':'influencers.html','المؤثرين':'influencers.html',
  'الناشرون':'publishers.html',
  'الحملات':'orders-campaigns.html','الحملات والإعلانات':'orders-campaigns.html','الطلبات والحملات':'orders-campaigns.html',
  'اعتماد الترشيحات':'orders-campaigns.html',
  'التحليلات':'analytics.html',
  'المالية':'finance.html',
  'المحتويات':'content.html','المحتوى':'content.html',
  'UGC':'ugc-admin.html','UGC TikTok':'ugc-admin.html','منصة UGC':'ugc-admin.html',
  'واتساب API':'whatsapp.html','واتساب':'whatsapp.html',
  'الإعدادات':'settings.html',
  'التقرير الشهري':'monthly-report.html','التقارير':'monthly-report.html'
};
// Per-page title + short description (location awareness)
const SC_PAGE_META = {
  'requests':{title:'الطلبات',desc:'مركز استقبال وتشغيل ومتابعة طلبات علاقات المؤثرين'},
  'request-detail':{title:'تفاصيل الطلب',desc:'مركز تشغيل الطلب الكامل'},
  'requests-users':{title:'مستخدمو الطلبات',desc:'إدارة مستخدمي منصة الطلبات وصلاحياتهم'},
  'dashboard':{title:'لوحة التحكم',desc:'نظرة عامة على أداء النظام والمؤشرات الرئيسية'},
  'tasks':{title:'المهام',desc:'مهامك التشغيلية المؤتمتة — تُنشأ وتُسند تلقائياً من سير العمليات'},
  'calendar':{title:'التقويم',desc:'جدولة الإعلانات والمواعيد والتذكيرات'},
  'customers':{title:'العملاء',desc:'إدارة العملاء وملفاتهم وحساباتهم'},
  'influencers':{title:'المؤثرون',desc:'قاعدة بيانات المؤثرين وتصنيفاتهم وأسعارهم'},
    'publishers':{title:'الناشرون',desc:'تحليل حسابات المؤثرين والناشرين وأداؤهم عبر المنصات'},
  'orders-campaigns':{title:'الحملات',desc:'إدارة الحملات ومتابعة تنفيذها مرحلةً بمرحلة'},
  'analytics':{title:'التحليلات',desc:'مركز الذكاء التشغيلي والتقارير التفصيلية'},
  'finance':{title:'المالية',desc:'التحصيلات والمدفوعات والحوالات والمستندات'},
  'content':{title:'المحتوى',desc:'أرشيف محتوى الحملات والإعلانات المنشورة'},
  'ugc-admin':{title:'UGC',desc:'إدارة صنّاع المحتوى والمشاريع والمدفوعات'},
  'whatsapp':{title:'واتساب API',desc:'تكامل واتساب والرسائل الآلية'},
  'settings':{title:'الإعدادات',desc:'إعدادات النظام والمستخدمين والصلاحيات'},
  'monthly-report':{title:'التقرير الشهري',desc:'تقرير شهري شامل لأداء القسم'}
};
function bcEsc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function buildBreadcrumb(crumb, activePage){
  const segs = String(crumb||'').split('/').map(function(s){return s.trim();}).filter(Boolean);
  let parts;
  if(activePage==='dashboard' || segs.length===0 || (segs.length===1 && (segs[0]==='الرئيسية'||segs[0]==='لوحة التحكم'))){
    parts = [{label:'لوحة التحكم'}];
  } else {
    parts = [{label:'لوحة التحكم', href:'dashboard.html'}];
    segs.forEach(function(s){ if(s==='الرئيسية'||s==='لوحة التحكم') return; parts.push({label:s, href:SC_LABEL_HREF[s]}); });
  }
  // last = current page (never a link)
  parts[parts.length-1] = { label: parts[parts.length-1].label };
  return parts.map(function(p,i){
    const sep = i>0 ? '<span class="bc-sep">/</span>' : '';
    const last = i===parts.length-1;
    if(last) return sep+'<span class="bc-cur" aria-current="page">'+bcEsc(p.label)+'</span>';
    if(p.href) return sep+'<a class="bc-link" href="'+p.href+'">'+bcEsc(p.label)+'</a>';
    return sep+'<span class="bc-txt">'+bcEsc(p.label)+'</span>';
  }).join('');
}

const TOPBAR_HTML = function(opts){
  opts = opts || {};
  const crumb = opts.crumb || 'لوحة التحكم';
  const session = opts.session;
  
  // Build user dropdown if session exists
  let userBlock = '';
  if(session && window.SC && window.SC.auth){
    const role = window.SC.auth.ROLES[session.role] || {};
    const initial = (session.name || '?').trim().charAt(0).toUpperCase();
    
    userBlock = `
      <div class="user-btn-wrap">
        <button class="user-btn" id="user-btn">
          <div class="user-ava" style="background:${role.color || '#0d8a6f'}">${initial}</div>
          <div class="user-info">
            <div class="user-name">${session.name || 'مستخدم'}</div>
            <div class="user-role">${role.label || session.role}</div>
          </div>
          <span class="user-arrow"><svg class="ic"><use href="#i-chevron-down"/></svg></span>
        </button>
        <div class="user-dd" id="user-dd">
          <div class="dd-header">
            <div class="top">
              <div class="ava-big" style="background:${role.color || '#0d8a6f'}">${initial}</div>
              <div class="info-big">
                <div class="name-big">${session.name || 'مستخدم'}</div>
                <div class="email-big">${session.username}</div>
              </div>
            </div>
            <span class="role-pill" style="background:${role.bgColor || '#f0fdf9'};color:${role.color || '#0d8a6f'}">${role.label || session.role}</span>
          </div>
          <div class="dd-items">
            <a href="settings.html" class="dd-item">
              <svg class="ic"><use href="#i-settings"/></svg>
              الإعدادات
            </a>
            <a href="dashboard.html" class="dd-item">
              <svg class="ic"><use href="#i-home"/></svg>
              الرئيسية
            </a>
            <div class="dd-divider"></div>
            <button class="dd-item danger" id="dd-logout">
              <svg class="ic"><use href="#i-x"/></svg>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="topbar">
      <button class="topbar-toggle" aria-label="القائمة"><svg class="ic"><use href="#i-list"/></svg></button>
      <div class="search-wrap">
        <input type="text" id="global-search" placeholder="ابحث في كل النظام...">
        <span class="s-icon"><svg class="ic"><use href="#i-search"/></svg></span>
        <span class="search-kbd">⌘K</span>
      </div>
      <div class="topbar-actions">
        <button class="icon-btn theme-toggle-btn" id="theme-toggle-btn" title="تبديل المظهر" aria-label="تبديل المظهر">
          <svg class="ic theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="ic theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="icon-btn" title="السجل" aria-label="السجل"><svg class="ic"><use href="#i-clock"/></svg></button>
        <div class="notif-wrap" id="notif-wrap">
          <button class="icon-btn" id="notif-btn" title="الإشعارات" aria-label="الإشعارات">
            <svg class="ic"><use href="#i-bell"/></svg>
            <span class="ping" id="notif-badge" style="display:none"></span>
            <span class="notif-count" id="notif-count" style="display:none"></span>
          </button>
          <div class="notif-dd" id="notif-dd">
            <div class="notif-dd-head">
              <h4>الإشعارات</h4>
              <button class="notif-mark-all" id="notif-mark-all">تعليم الكل مقروء</button>
            </div>
            <div class="notif-dd-list" id="notif-dd-list">
              <div style="padding:30px;text-align:center;color:var(--text-3);font-size:13px">لا توجد إشعارات</div>
            </div>
            <div class="notif-dd-foot">
              <a href="settings.html#notifications" id="notif-view-all">عرض كل الإشعارات ←</a>
            </div>
          </div>
        </div>
        ${opts.cta ? `<a href="${opts.cta.href}" class="btn btn-primary topbar-cta"><svg class="ic"><use href="#i-plus"/></svg>${opts.cta.label}</a>` : ''}
        ${userBlock}
      </div>
    </div>
    ${(function(){
      const meta = SC_PAGE_META[opts.activePage] || {};
      const title = opts.title || meta.title || '';
      const desc  = (opts.desc !== undefined ? opts.desc : meta.desc) || '';
      if(!title && !desc) return '';
      return `<div class="page-head">
        <nav class="page-head-bc" aria-label="مسار التنقل">${buildBreadcrumb(opts.crumb, opts.activePage)}</nav>
        <div class="page-head-title">${bcEsc(title)}</div>
        ${desc ? `<div class="page-head-desc">${bcEsc(desc)}</div>` : ''}
      </div>`;
    })()}
  `;
};

const ui = {
  injectSprite: function(){
    if(!document.getElementById('sc-svg-sprite')){
      const div = document.createElement('div');
      div.id = 'sc-svg-sprite';
      div.innerHTML = SVG_SPRITE;
      document.body.insertBefore(div.firstChild, document.body.firstChild);
    }
  },
  
  injectBaseCSS: function(){
    if(!document.getElementById('sc-base-css')){
      const style = document.createElement('style');
      style.id = 'sc-base-css';
      style.textContent = BASE_CSS;
      document.head.appendChild(style);
    }
  },
  
  sidebar: SIDEBAR_HTML,
  topbar: TOPBAR_HTML,
  
  // Auto-init: call when DOM ready
  init: function(activePage, options){
    // Support object-form: init({page, session, crumb, ...})
    if(activePage && typeof activePage === 'object'){ options = activePage; activePage = options.page || options.activePage; }
    options = options || {};
    this.injectBaseCSS();
    this.injectSprite();
    this.injectUserDropdownCSS();
    
    // === AUTH CHECK ===
    // Skip auth on login page itself
    const isLoginPage = window.location.pathname.includes('login.html');
    let session = null;
    
    if(!isLoginPage && window.SC && window.SC.auth){
      session = window.SC.auth.requireAuth(activePage);
      if(!session) return;  // Redirected to login
    }
    
    // If page has #sidebar-mount and #topbar-mount, fill them
    const sidebarMount = document.getElementById('sidebar-mount');
    if(sidebarMount) sidebarMount.outerHTML = this.sidebar(activePage, session);
    
    const topbarMount = document.getElementById('topbar-mount');
    if(topbarMount) topbarMount.outerHTML = this.topbar({ crumb: options.crumb, cta: options.cta, session: session, activePage: activePage, title: options.title, desc: options.desc });
    
    // Inject sidebar overlay for mobile (after sidebar render)
    if(!document.querySelector('.sidebar-overlay')){
      const overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
    
    // Inject mobile bottom navigation
    this.injectBottomNav(activePage, session);
    
    // Set page title
    if(options.title){
      document.title = 'Smart Code — ' + options.title;
    }
    
    // Apply saved theme
    this.applyTheme();
    
    // Bind user dropdown + sidebar toggle
    this.bindUserDropdown();
    this.bindSidebarToggle();
    this.bindSidebarCollapse();
    
    // === FIX DATE INPUTS: force English locale + LTR ===
    this.fixDateInputs();
    
    // === SETUP CROSS-TAB/DEVICE SYNC ===
    this.setupSyncListener(activePage);
    
    // === AUTO REFRESH SIDEBAR/BOTTOMNAV BADGES ===
    // When IDB cache loads OR data changes, recompute badge counts
    const self = this;
    let refreshTimer = null;
    const scheduleRefresh = (delay = 50) => {
      if(refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        self.refreshBadges(activePage, session);
      }, delay);
    };
    
    // When IDB-backed data finishes loading on page init
    window.addEventListener('sc:data:ready', () => scheduleRefresh(50));
    
    // When data changes anywhere (CRUD operations)
    window.addEventListener('sc:data:change', (e) => {
      const key = e.detail?.key;
      // Only refresh if the changed key affects badges
      if(['customers','influencers','campaigns','transfers','daily_ads','tasks'].includes(key)){
        scheduleRefresh(100);
        // Also try to re-render the page if it has a render() function
        if(typeof window.render === 'function'){
          setTimeout(() => {
            try { window.render(); } catch(e){}
          }, 150);
        }
      }
    });
    
    // If data ready promise already resolved (cached data), refresh immediately
    if(window.SC?.data?.ready){
      window.SC.data.ready.then(() => scheduleRefresh(50));
    }
  },
  
  // === Refresh sidebar + bottom nav badge counts ===
  // Called automatically when data changes or IDB loads
  refreshBadges: function(activePage, session){
    const api = window.SC && window.SC.api;
    if(!api) return;
    
    let badges = {};
    try {
      const stats = api.dashboardStats();
      
      // Same computation as initial render — single source of truth
      const _meName2 = ((window.SC?.auth?.getSession?.()) || {}).name;
      const tasks = (api.tasks?.list?.() || []);
      let pendingTasks = tasks.filter(t => t.assigned_to === _meName2 && t.status !== 'completed' && t.status !== 'cancelled' && t.status !== 'done').length;
      try {
        const _ct = (api.campaign_tasks?.list?.() || []);
        pendingTasks += _ct.filter(t => ((t.assignee_name || t.assignee) === _meName2) && t.status !== 'done' && t.status !== 'completed' && t.status !== 'cancelled').length;
      } catch(e){}
      
      const content = (api.content?.list?.() || []);
      const pendingContent = content.filter(c => c.status !== 'completed' && c.status !== 'archived').length;
      
      const ugcCreators = (api.ugc_creators?.list?.() || []);
      const pendingUgc = ugcCreators.filter(u => u.status === 'pending' || u.status === 'screening').length;
      
      const wa = (api.whatsapp_numbers?.list?.() || []);
      
      const dailyAds = (api.daily_ads?.list?.() || []);
      const today = new Date(); today.setHours(0,0,0,0);
      const weekLater = new Date(today); weekLater.setDate(today.getDate() + 7);
      const upcomingAds = dailyAds.filter(a => {
        if(!a.publish_date || a.status === 'completed') return false;
        const d = new Date(a.publish_date);
        return d >= today && d <= weekLater;
      }).length;
      
      badges = {
        customers:           stats.customers_total || 0,
        influencers:         stats.influencers_total || 0,
        'orders-campaigns':  stats.campaigns_total || 0,
        finance:             stats.transfers_pending || 0,
        tasks:               pendingTasks || null,
        calendar:            upcomingAds || null,
        content:             pendingContent || null,
        'ugc-admin':         pendingUgc || null,
        whatsapp:            wa.length || null,
        analytics:           null
      };
    } catch(e){ return; }
    
    // Update sidebar badges
    document.querySelectorAll('.sidebar .nav-item').forEach(link => {
      const href = link.getAttribute('href') || '';
      const page = href.replace(/\.html.*$/, '');
      if(badges[page] === undefined) return;
      
      let badge = link.querySelector('.badge');
      const value = badges[page];
      
      if(value === null || value === '' || value === 0){
        if(badge) badge.remove();
      } else {
        if(!badge){
          badge = document.createElement('span');
          badge.className = 'badge';
          link.appendChild(badge);
        }
        badge.textContent = value;
      }
    });
    
    // Update bottom nav badges (mobile)
    document.querySelectorAll('.bottom-nav a').forEach(link => {
      const href = link.getAttribute('href') || '';
      const page = href.replace(/\.html.*$/, '');
      if(badges[page] === undefined) return;
      
      let badge = link.querySelector('.bn-badge');
      const value = badges[page];
      
      if(value === null || value === '' || value === 0){
        if(badge) badge.remove();
      } else {
        if(!badge){
          badge = document.createElement('span');
          badge.className = 'bn-badge';
          link.appendChild(badge);
        }
        badge.textContent = value;
      }
    });
  },
  
  // === Upgrade native date inputs to custom DD/MM/YYYY format ===
  // Wraps every date input with a custom display that shows "DD/MM/YYYY" 
  // placeholder always in English, regardless of browser locale
  upgradeDateInputs: function(root){
    const scope = root || document.body;
    const dateInputs = scope.querySelectorAll('input[type="date"]:not([data-sc-upgraded])');
    
    dateInputs.forEach(inp => {
      inp.setAttribute('data-sc-upgraded', '1');
      
      // Create wrapper
      const wrap = document.createElement('div');
      wrap.className = 'sc-date-field';
      wrap.style.cssText = 'position:relative;display:block;direction:ltr';
      wrap.setAttribute('lang', 'en-US');
      wrap.setAttribute('dir', 'ltr');
      
      // Move classes/styles from original input to wrapper if needed
      const originalCss = inp.getAttribute('style') || '';
      
      // Native date input — keep functional but hide its text
      inp.style.cssText = `${originalCss};direction:ltr !important;text-align:left !important;color:transparent !important;caret-color:var(--text);position:relative;z-index:2;background:transparent !important`;
      inp.setAttribute('lang', 'en-US');
      inp.setAttribute('dir', 'ltr');
      
      // Insert wrapper before input
      inp.parentNode.insertBefore(wrap, inp);
      wrap.appendChild(inp);
      
      // Create custom display overlay
      const display = document.createElement('div');
      display.className = 'sc-date-display';
      display.setAttribute('aria-hidden', 'true');
      display.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;padding:0 11px;font-family:var(--font-mono);font-size:13px;color:var(--text);pointer-events:none;z-index:1;direction:ltr;letter-spacing:0.3px';
      wrap.appendChild(display);
      
      // Update display function
      const updateDisplay = () => {
        const val = inp.value; // YYYY-MM-DD
        if(val){
          const parts = val.split('-');
          if(parts.length === 3){
            display.textContent = `${parts[2]}/${parts[1]}/${parts[0]}`;
            display.style.color = 'var(--text)';
          } else {
            display.textContent = val;
          }
        } else {
          display.textContent = 'DD / MM / YYYY';
          display.style.color = 'var(--text-3)';
          display.style.opacity = '0.7';
        }
      };
      
      updateDisplay();
      inp.addEventListener('input', updateDisplay);
      inp.addEventListener('change', updateDisplay);
      inp.addEventListener('blur', updateDisplay);
      
      // On focus, hide the placeholder so the picker opens cleanly
      inp.addEventListener('focus', () => {
        if(!inp.value) display.style.opacity = '0.5';
      });
    });
    
    // Also fix time inputs (just LTR direction)
    scope.querySelectorAll('input[type="time"]:not([data-sc-upgraded])').forEach(inp => {
      inp.setAttribute('data-sc-upgraded', '1');
      inp.setAttribute('lang', 'en-US');
      inp.setAttribute('dir', 'ltr');
      inp.style.direction = 'ltr';
      inp.style.textAlign = 'left';
    });
  },
  
  // Legacy alias — runs upgrade
  fixDateInputs: function(){
    this.upgradeDateInputs(document.body);
    
    // Also watch for dynamically added inputs
    if(!this._dateInputObserver){
      this._dateInputObserver = new MutationObserver(() => {
        this.upgradeDateInputs(document.body);
      });
      this._dateInputObserver.observe(document.body, { childList:true, subtree:true });
    }
  },
  
  // === Setup listener for data changes from other tabs/devices ===
  setupSyncListener: function(activePage){
    if(!window.SC?.sync?.onSync) return;
    
    // Prevent multiple listeners
    if(this._syncSubscribed) return;
    this._syncSubscribed = true;
    
    const session = window.SC?.auth?.getSession();
    let rerenderTimeout = null;
    
    window.SC.sync.onSync((event) => {
      // Skip our own changes
      if(event.device_id === window.SC.sync.deviceId) return;
      
      console.log('[UI] Data change received from other tab/device:', event.type, event.payload);
      
      // Show a subtle notification
      if(window.SC?.h?.toast){
        const msg = this._getSyncMessage(event);
        if(msg) window.SC.h.toast(msg, 'info', 2500);
      }
      
      // For cross-tab/device changes, the data in OUR tab is stale.
      // We need to reload it. For IDB-backed keys, reload from IDB.
      // For localStorage keys, the storage event already happened so it's updated.
      const changedTable = event.payload?.table;
      if(changedTable && window.SC?.data?.getIdbBackedKeys){
        const idbKeys = window.SC.data.getIdbBackedKeys();
        if(idbKeys.has(changedTable) && window.SC?.storage?.data){
          // Reload from IDB for this table
          window.SC.storage.data.get(changedTable).then(value => {
            if(value !== null && value !== undefined && window.SC?.data){
              // Update in-memory cache (we need to do this manually since lsSet would write back)
              // Use a private method or just call set with skipWrite=true
              // Simplest: just refresh the UI; data will be re-read on next get()
              // But IDB cache needs updating — we'll call a hidden method
              const idbCache = window.SC.data._getIdbCache?.();
              if(idbCache) idbCache[changedTable] = value;
            }
          }).catch(e => console.warn('Failed to reload IDB key after cross-tab change:', e));
        }
      }
      
      // Debounce re-render (in case of many changes)
      if(rerenderTimeout) clearTimeout(rerenderTimeout);
      rerenderTimeout = setTimeout(() => {
        this.refreshBadges(activePage, session);
        this._triggerRerender(activePage, event);
      }, 300);
    });
  },
  
  _getSyncMessage: function(event){
    const tableLabels = {
      customers: 'العملاء',
      influencers: 'المؤثرين',
      campaigns: 'الحملات',
      daily_ads: 'الإعلانات',
      transfers: 'الحوالات',
      team: 'الفريق'
    };
    const actionLabels = {
      create: 'إضافة',
      update: 'تحديث',
      delete: 'حذف',
      bulk_remove: 'حذف جماعي'
    };
    
    if(event.type === 'data_change' && event.payload){
      const table = tableLabels[event.payload.table] || event.payload.table;
      const action = actionLabels[event.payload.action] || event.payload.action;
      return `${action} في ${table} (من جهاز آخر)`;
    }
    return null;
  },
  
  _triggerRerender: function(activePage, event){
    // Look for a global "render" function on the page
    if(typeof window.render === 'function'){
      try {
        window.render();
        return;
      } catch(e){
        console.warn('[UI] Re-render failed:', e);
      }
    }
    
    // Fallback: dispatch custom event so pages can listen
    window.dispatchEvent(new CustomEvent('sc-data-changed', { 
      detail: event 
    }));
  },
  
  // === MOBILE BOTTOM NAVIGATION ===
  injectBottomNav: function(activePage, session){
    if(!session) return;
    if(document.querySelector('.bottom-nav')) return;  // Already exists
    
    // Determine 5 most important pages for this role
    const role = session.role;
    let items = [];
    
    if(role === 'admin'){
      items = [
        { page:'dashboard',     icon:'i-dashboard',  label:'لوحة التحكم' },
        { page:'orders-campaigns', icon:'i-megaphone',   label:'الحملات' },
        { page:'customers',     icon:'i-users',      label:'العملاء' },
        { page:'finance',       icon:'i-wallet',     label:'المالية' }
      ];
    } else if(role === 'accountant'){
      items = [
        { page:'dashboard',     icon:'i-dashboard', label:'لوحة التحكم' },
        { page:'finance',       icon:'i-wallet',    label:'المالية' },
        { page:'monthly-report',icon:'i-chart',     label:'التقارير' },
        { page:'transfer-detail', icon:'i-file',    label:'الحوالات' }
      ];
    } else if(role === 'accounts_manager'){
      items = [
        { page:'dashboard',     icon:'i-dashboard',  label:'لوحة التحكم' },
        { page:'finance',       icon:'i-wallet',     label:'المالية' },
        { page:'monthly-report',icon:'i-chart',      label:'التقارير' },
        { page:'customers',     icon:'i-users',      label:'العملاء' }
      ];
    } else if(role === 'operations_manager'){
      items = [
        { page:'dashboard',     icon:'i-dashboard',     label:'لوحة التحكم' },
        { page:'orders-campaigns', icon:'i-megaphone',      label:'الحملات' },
        { page:'finance',       icon:'i-wallet',        label:'المالية' },
        { page:'influencers',   icon:'i-star',          label:'المؤثرون' }
      ];
    } else if(role === 'campaign_coordinator'){
      items = [
        { page:'dashboard',     icon:'i-dashboard',     label:'لوحة التحكم' },
        { page:'orders-campaigns', icon:'i-megaphone',      label:'الحملات' },
        { page:'customers',     icon:'i-users',         label:'العملاء' },
        { page:'content',       icon:'i-folder',          label:'المحتوى' }
      ];
    } else if(role === 'influencer_coordinator'){
      items = [
        { page:'dashboard',     icon:'i-dashboard',     label:'لوحة التحكم' },
        { page:'influencers',   icon:'i-star',          label:'المؤثرون' },
        { page:'orders-campaigns', icon:'i-megaphone',      label:'الحملات' },
        { page:'content',       icon:'i-folder',        label:'المحتوى' }
      ];
    } else if(role === 'marketing_manager'){
      items = [
        { page:'dashboard',     icon:'i-dashboard',     label:'لوحة التحكم' },
        { page:'analytics',     icon:'i-chart',           label:'التحليلات' },
        { page:'orders-campaigns', icon:'i-megaphone',      label:'الحملات' },
        { page:'monthly-report',icon:'i-chart',         label:'التقارير' }
      ];
    } else {
      items = [
        { page:'dashboard',     icon:'i-dashboard',     label:'لوحة التحكم' },
        { page:'customers',     icon:'i-users',         label:'العملاء' },
        { page:'influencers',   icon:'i-star',          label:'المؤثرون' },
        { page:'orders-campaigns', icon:'i-megaphone',      label:'الحملات' }
      ];
    }
    
    // Filter by access permissions
    items = items.filter(item => {
      if(!window.SC?.auth?.canAccessPage) return true;
      return window.SC.auth.canAccessPage(item.page);
    });
    
    // Limit to 4 items + always show "More" button (5 total)
    items = items.slice(0, 4);
    
    // Add "more" button for additional pages
    const moreBtn = `
      <button class="bottom-nav-item" id="bn-more" type="button" aria-label="المزيد">
        <svg class="ic"><use href="#i-list"/></svg>
        <span>المزيد</span>
      </button>
    `;
    
    const navHtml = `
      <nav class="bottom-nav" role="navigation" aria-label="التنقل الرئيسي">
        ${items.map(item => `
          <a href="${item.page}.html" class="bottom-nav-item ${item.page === activePage ? 'active' : ''}" aria-label="${item.label}">
            <svg class="ic"><use href="#${item.icon}"/></svg>
            <span>${item.label}</span>
          </a>
        `).join('')}
        ${moreBtn}
      </nav>
    `;
    
    document.body.insertAdjacentHTML('beforeend', navHtml);
    
    // "More" button opens sidebar
    const moreBtnEl = document.getElementById('bn-more');
    if(moreBtnEl){
      moreBtnEl.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.add('open');
        document.querySelector('.sidebar-overlay')?.classList.add('show');
      });
    }
  },
  
  // === THEME (Dark/Light) ===
  getTheme: function(){
    return localStorage.getItem('sc_theme') || 'light';
  },
  
  setTheme: function(theme){
    localStorage.setItem('sc_theme', theme);
    this.applyTheme();
    // Update theme toggle UI if exists
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.dataset.themeActive = theme;
    });
  },
  
  applyTheme: function(){
    const theme = this.getTheme();
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  },
  
  toggleTheme: function(){
    const current = this.getTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  },
  
  bindSidebarCollapse: function(){
    const app = document.querySelector('.app');
    const btn = document.getElementById('sidebar-collapse-btn');
    if(!app) return;
    // استعادة الحالة المحفوظة (سطح المكتب فقط)
    let collapsed = false;
    try{ collapsed = localStorage.getItem('sc_sidebar_collapsed') === '1'; }catch(e){}
    app.classList.toggle('sidebar-collapsed', collapsed);
    if(btn){
      btn.addEventListener('click', () => {
        const now = !app.classList.contains('sidebar-collapsed');
        app.classList.toggle('sidebar-collapsed', now);
        try{ localStorage.setItem('sc_sidebar_collapsed', now ? '1' : '0'); }catch(e){}
      });
    }
  },
  
  bindSidebarToggle: function(){
    const toggle = document.querySelector('.topbar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if(toggle && sidebar){
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if(overlay) overlay.classList.toggle('show');
      });
      
      // Close sidebar when clicking nav item on mobile
      sidebar.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
          if(window.innerWidth <= 980){
            sidebar.classList.remove('open');
            if(overlay) overlay.classList.remove('show');
          }
        });
      });
      
      // ESC to close sidebar
      document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && sidebar.classList.contains('open')){
          sidebar.classList.remove('open');
          if(overlay) overlay.classList.remove('show');
        }
      });
      
      // Swipe-to-close on mobile (RTL: swipe right closes)
      let touchStartX = 0;
      let touchEndX = 0;
      sidebar.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive:true });
      sidebar.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        // RTL: sidebar opens from right, close on swipe right (positive diff)
        if(diff > 80){
          sidebar.classList.remove('open');
          if(overlay) overlay.classList.remove('show');
        }
      }, { passive:true });
    }
    
    // === TOPBAR THEME TOGGLE BUTTON ===
    const topbarThemeBtn = document.getElementById('theme-toggle-btn');
    if(topbarThemeBtn){
      topbarThemeBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
    
    // Theme toggle in user dropdown (still works as backup)
    const themeBtn = document.getElementById('dd-theme-toggle');
    if(themeBtn){
      themeBtn.addEventListener('click', () => {
        this.toggleTheme();
        // Update label
        const isDark = this.getTheme() === 'dark';
        const label = themeBtn.querySelector('.theme-label');
        if(label) label.textContent = isDark ? 'الوضع الفاتح' : 'الوضع الداكن';
        const icon = themeBtn.querySelector('.theme-icon-light');
        const iconDark = themeBtn.querySelector('.theme-icon-dark');
        if(icon && iconDark){
          icon.style.display = isDark ? 'inline-block' : 'none';
          iconDark.style.display = isDark ? 'none' : 'inline-block';
        }
      });
    }
    
    // === SIDEBAR USER CARD → opens simple user info modal ===
    const userCard = document.getElementById('sidebar-user-card');
    if(userCard && userCard.style.cursor === 'pointer'){
      const openHandler = () => this.openUserInfoModal();
      userCard.addEventListener('click', openHandler);
      userCard.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          openHandler();
        }
      });
    }
  },
  
  // === SIMPLE USER INFO MODAL ===
  openUserInfoModal: function(){
    if(!window.SC?.auth) return;
    const session = window.SC.auth.getSession();
    if(!session) return;
    
    const role = window.SC.auth.ROLES[session.role] || {};
    const initial = (session.name || session.username || '?').trim().charAt(0).toUpperCase();
    const username = session.username || '—';
    const roleLabel = role.label || session.role;
    const roleColor = role.color || '#0d8a6f';
    const roleBg = role.bgColor || '#f0fdf9';
    
    // Format login time as: "24 مايو 2026 - 5:37 م"
    let lastLogin = '—';
    if(session.logged_in_at){
      try {
        const d = new Date(session.logged_in_at);
        const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'م' : 'ص';
        hours = hours % 12 || 12;
        lastLogin = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} - ${hours}:${minutes} ${ampm}`;
      } catch(e){}
    }
    
    const canSettings = window.SC.auth.canAccessPage('settings');
    
    const html = `
      <div style="padding:22px 24px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:11px">
          <span style="font-family:var(--font-mono);font-size:15px;font-weight:700;color:var(--text)">${this._esc(username)}</span>
          <div style="width:38px;height:38px;border-radius:10px;background:${roleColor};display:grid;place-items:center;color:#fff;font-family:var(--font-display);font-weight:800;font-size:16px;box-shadow:0 2px 6px rgba(0,0,0,0.08)">${initial}</div>
        </div>
        <button type="button" class="user-modal-close" aria-label="إغلاق" style="width:32px;height:32px;border-radius:50%;background:transparent;border:none;cursor:pointer;color:var(--text-3);display:grid;place-items:center;transition:all .15s">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      
      <div style="padding:6px 0">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid var(--border)">
          <span style="font-size:13.5px;color:var(--text-3);font-weight:500">المستخدم</span>
          <span style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text)">${this._esc(username)}</span>
        </div>
        
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid var(--border)">
          <span style="font-size:13.5px;color:var(--text-3);font-weight:500">الدور</span>
          <span style="padding:5px 12px;border-radius:7px;background:${roleBg};color:${roleColor};font-size:12.5px;font-weight:700;font-family:var(--font-display)">${this._esc(roleLabel)}</span>
        </div>
        
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid var(--border)">
          <span style="font-size:13.5px;color:var(--text-3);font-weight:500">آخر دخول</span>
          <span style="font-family:var(--font-mono);font-size:13px;color:var(--text);font-weight:500">${this._esc(lastLogin)}</span>
        </div>
      </div>
      
      <div style="padding:16px 24px;display:flex;align-items:center;gap:12px">
        <button type="button" class="user-modal-logout" style="padding:11px 22px;background:#ef4444;color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:7px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          تسجيل الخروج
        </button>
        ${canSettings ? `
          <a href="settings.html" class="user-modal-settings" style="padding:11px 22px;background:transparent;color:var(--text-2);text-decoration:none;border:none;border-radius:9px;font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:7px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            الإعدادات
          </a>
        ` : ''}
      </div>
    `;
    
    if(window.SC?.h?.modal){
      window.SC.h.modal(html, {
        width: '520px',
        onMount: (box, close) => {
          // Close button (X)
          box.querySelector('.user-modal-close')?.addEventListener('click', () => close(null));
          
          // Hover effect for close button
          const closeBtn = box.querySelector('.user-modal-close');
          if(closeBtn){
            closeBtn.addEventListener('mouseenter', () => {
              closeBtn.style.background = 'var(--surface-2)';
              closeBtn.style.color = 'var(--text)';
            });
            closeBtn.addEventListener('mouseleave', () => {
              closeBtn.style.background = 'transparent';
              closeBtn.style.color = 'var(--text-3)';
            });
          }
          
          // Logout button
          box.querySelector('.user-modal-logout')?.addEventListener('click', async () => {
            let confirmed = true;
            if(window.SC?.h?.confirm){
              confirmed = await window.SC.h.confirm('هل تريد تسجيل الخروج؟', { 
                okText: 'نعم، خروج',
                cancelText: 'إلغاء',
                danger: true 
              });
            }
            if(!confirmed) return;
            close(null);
            window.SC.auth.logout();
            window.location.href = 'login.html';
          });
          
          // Logout button hover
          const logoutBtn = box.querySelector('.user-modal-logout');
          if(logoutBtn){
            logoutBtn.addEventListener('mouseenter', () => {
              logoutBtn.style.background = '#dc2626';
              logoutBtn.style.transform = 'translateY(-1px)';
              logoutBtn.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
            });
            logoutBtn.addEventListener('mouseleave', () => {
              logoutBtn.style.background = '#ef4444';
              logoutBtn.style.transform = 'translateY(0)';
              logoutBtn.style.boxShadow = 'none';
            });
          }
          
          // Settings link hover
          const settingsLink = box.querySelector('.user-modal-settings');
          if(settingsLink){
            settingsLink.addEventListener('mouseenter', () => {
              settingsLink.style.background = 'var(--surface-2)';
              settingsLink.style.color = 'var(--text)';
            });
            settingsLink.addEventListener('mouseleave', () => {
              settingsLink.style.background = 'transparent';
              settingsLink.style.color = 'var(--text-2)';
            });
          }
        }
      });
    }
  },
  
  _esc: function(str){
    return String(str || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  },
  
  
  injectUserDropdownCSS: function(){
    if(document.getElementById('sc-user-dd-css')) return;
    const style = document.createElement('style');
    style.id = 'sc-user-dd-css';
    style.textContent = `
/* === THEME TOGGLE BUTTON === */
.theme-toggle-btn{position:relative;overflow:hidden}
.theme-toggle-btn:hover{color:var(--brand-600) !important;border-color:var(--brand-300) !important;background:var(--brand-50) !important}
.theme-toggle-btn .theme-icon-sun,
.theme-toggle-btn .theme-icon-moon{width:17px;height:17px;transition:all .25s ease}
.theme-toggle-btn:active .theme-icon-sun,
.theme-toggle-btn:active .theme-icon-moon{transform:rotate(45deg) scale(0.9)}
[data-theme="dark"] .theme-toggle-btn .theme-icon-sun{display:inline-block !important;color:#fbbf24}
[data-theme="dark"] .theme-toggle-btn .theme-icon-moon{display:none !important}
[data-theme="dark"] .theme-toggle-btn:hover{color:#fbbf24 !important;background:rgba(251,191,36,0.1) !important;border-color:rgba(251,191,36,0.3) !important}

/* === USER DROPDOWN === */
.user-btn{display:flex;align-items:center;gap:9px;padding:6px 12px;background:var(--surface);border:1px solid var(--border);border-radius:11px;cursor:pointer;transition:all .12s;font-family:inherit;color:var(--text)}
.user-btn:hover{background:var(--gray-50);border-color:var(--border-strong)}
.user-btn .user-ava{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;color:#fff;font-family:var(--font-display);font-weight:700;font-size:12px;flex-shrink:0}
.user-btn .user-info{display:flex;flex-direction:column;line-height:1.1;text-align:start}
.user-btn .user-name{font-size:12.5px;font-weight:700;color:var(--text);white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis}
.user-btn .user-role{font-size:10.5px;color:var(--text-3);font-family:var(--font-mono);margin-top:1px}
.user-btn .user-arrow{color:var(--text-3);transition:transform .15s}
.user-btn.open .user-arrow{transform:rotate(180deg)}
.user-btn .user-arrow .ic{width:12px;height:12px}

.user-dd{position:absolute;top:calc(100% + 6px);inset-inline-end:0;width:260px;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.1);z-index:100;overflow:hidden;display:none}
.user-dd.show{display:block;animation:ddIn 0.15s ease-out}
@keyframes ddIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.user-dd .dd-header{padding:16px;background:linear-gradient(to bottom right, var(--brand-50), var(--surface));border-bottom:1px solid var(--border)}
.user-dd .dd-header .top{display:flex;align-items:center;gap:11px}
.user-dd .dd-header .ava-big{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;color:#fff;font-family:var(--font-display);font-weight:700;font-size:16px;flex-shrink:0}
.user-dd .dd-header .info-big{flex:1;min-width:0}
.user-dd .dd-header .name-big{font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--text);margin-bottom:2px}
.user-dd .dd-header .email-big{font-size:11px;color:var(--text-3);font-family:var(--font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-dd .role-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:5px;font-size:10.5px;font-weight:700;font-family:var(--font-mono);margin-top:7px;letter-spacing:0.3px}
.user-dd .dd-items{padding:6px}
.user-dd .dd-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:7px;cursor:pointer;color:var(--text-2);font-size:13px;font-weight:500;transition:all .12s;text-decoration:none;border:none;background:transparent;width:100%;font-family:inherit}
.user-dd .dd-item:hover{background:var(--gray-50);color:var(--text)}
.user-dd .dd-item.danger:hover{background:#fef2f2;color:var(--danger)}
.user-dd .dd-item .ic{width:14px;height:14px;color:var(--text-3)}
.user-dd .dd-item:hover .ic{color:inherit}
.user-dd .dd-divider{height:1px;background:var(--border);margin:6px 0}

.user-btn-wrap{position:relative}

/* === NOTIFICATIONS === */
.notif-wrap{position:relative}
#notif-btn{position:relative}
#notif-btn .notif-count{position:absolute;top:-2px;inset-inline-start:-2px;min-width:16px;height:16px;background:var(--danger);color:#fff;font-size:9.5px;font-weight:700;font-family:var(--font-mono);border-radius:8px;display:grid;place-items:center;padding:0 4px;border:2px solid var(--surface)}

.notif-dd{position:absolute;top:calc(100% + 6px);inset-inline-end:0;width:360px;max-width:calc(100vw - 40px);background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,0.12);z-index:100;overflow:hidden;display:none}
.notif-dd.show{display:block;animation:ddIn 0.15s ease-out}
.notif-dd-head{padding:14px 16px;background:var(--surface-2);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.notif-dd-head h4{font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--text)}
.notif-mark-all{background:none;border:none;color:var(--brand-700);font-size:11.5px;font-weight:600;cursor:pointer;font-family:inherit;padding:0}
.notif-mark-all:hover{text-decoration:underline}
.notif-dd-list{max-height:380px;overflow-y:auto}
.notif-item{display:flex;gap:10px;padding:11px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .12s;text-decoration:none;color:inherit}
.notif-item:hover{background:var(--surface-2)}
.notif-item.unread{background:var(--brand-50)}
.notif-item.unread:hover{background:#e0f7f0}
.notif-item .notif-icon{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;color:#fff;font-family:var(--font-display);font-weight:700;font-size:12px;flex-shrink:0}
.notif-item .notif-icon.info{background:#3b82f6}
.notif-item .notif-icon.success{background:#10b981}
.notif-item .notif-icon.warning{background:#f59e0b}
.notif-item .notif-icon.danger{background:#dc2626}
.notif-item .notif-body{flex:1;min-width:0}
.notif-item .notif-title{font-size:12.5px;font-weight:700;color:var(--text);line-height:1.3;margin-bottom:2px}
.notif-item .notif-msg{font-size:11.5px;color:var(--text-2);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.notif-item .notif-time{font-size:10px;color:var(--text-3);font-family:var(--font-mono);margin-top:4px}
.notif-dd-foot{padding:10px 16px;border-top:1px solid var(--border);text-align:center;background:var(--surface-2)}
.notif-dd-foot a{color:var(--brand-700);font-size:12px;font-weight:600;text-decoration:none}
.notif-dd-foot a:hover{text-decoration:underline}
    `;
    document.head.appendChild(style);
  },
  
  updateNotificationBadge: function(){
    if(!window.SC?.system) return;
    const count = window.SC.system.getUnreadCount();
    const badge = document.getElementById('notif-count');
    if(badge){
      if(count > 0){
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'grid';
      } else {
        badge.style.display = 'none';
      }
    }
  },
  
  renderNotificationDropdown: function(){
    if(!window.SC?.system) return;
    const list = document.getElementById('notif-dd-list');
    if(!list) return;
    
    const notifs = window.SC.system.getNotifications({ limit: 10 });
    if(notifs.length === 0){
      list.innerHTML = `<div style="padding:30px;text-align:center;color:var(--text-3);font-size:13px"><div style="margin-bottom:8px"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>لا توجد إشعارات</div>`;
      return;
    }
    
    const h = window.SC.h;
    list.innerHTML = notifs.map(n => {
      const typeIcon = { success:'OK', danger:'!', warning:'!', info:'i' };
      const ago = relativeTime(n.timestamp);
      
      // Make tag — link if has link, div otherwise
      const tag = n.link ? 'a' : 'div';
      const attrs = n.link ? `href="${h.escape(n.link)}"` : '';
      
      return `<${tag} ${attrs} class="notif-item ${!n.read ? 'unread' : ''}" data-notif-id="${n.id}">
        <div class="notif-icon ${n.type || 'info'}">${typeIcon[n.type] || 'i'}</div>
        <div class="notif-body">
          <div class="notif-title">${h.escape(n.title || '')}</div>
          <div class="notif-msg">${h.escape(n.message || '')}</div>
          <div class="notif-time">${ago}</div>
        </div>
      </${tag}>`;
    }).join('');
    
    // Click handlers to mark as read
    list.querySelectorAll('[data-notif-id]').forEach(el => {
      el.addEventListener('click', () => {
        window.SC.system.markNotificationRead(el.dataset.notifId);
        el.classList.remove('unread');
      });
    });
    
    function relativeTime(iso){
      try {
        const diff = Date.now() - new Date(iso).getTime();
        const min = Math.floor(diff/60000);
        if(min < 1) return 'الآن';
        if(min < 60) return `قبل ${min} دقيقة`;
        const hr = Math.floor(min/60);
        if(hr < 24) return `قبل ${hr} ساعة`;
        const d = Math.floor(hr/24);
        if(d < 30) return `قبل ${d} يوم`;
        const dt = new Date(iso);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return dt.getDate() + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
      } catch(e){ return ''; }
    }
  },
  
  bindUserDropdown: function(){
    const btn = document.getElementById('user-btn');
    const dd = document.getElementById('user-dd');
    if(btn && dd){
      btn.addEventListener('click', e => {
        e.stopPropagation();
        btn.classList.toggle('open');
        dd.classList.toggle('show');
        // Close notif if open
        const ndd = document.getElementById('notif-dd');
        if(ndd) ndd.classList.remove('show');
      });
    }
    
    // Notification button
    const notifBtn = document.getElementById('notif-btn');
    const notifDd = document.getElementById('notif-dd');
    if(notifBtn && notifDd){
      notifBtn.addEventListener('click', e => {
        e.stopPropagation();
        const isOpening = !notifDd.classList.contains('show');
        notifDd.classList.toggle('show');
        if(dd) dd.classList.remove('show');
        if(btn) btn.classList.remove('open');
        // Render when opening
        if(isOpening) this.renderNotificationDropdown();
      });
    }
    
    // Click outside to close
    document.addEventListener('click', e => {
      if(btn && dd && !btn.contains(e.target) && !dd.contains(e.target)){
        btn.classList.remove('open');
        dd.classList.remove('show');
      }
      if(notifBtn && notifDd && !notifBtn.contains(e.target) && !notifDd.contains(e.target)){
        notifDd.classList.remove('show');
      }
    });
    
    // Mark all read button
    const markAllBtn = document.getElementById('notif-mark-all');
    if(markAllBtn){
      markAllBtn.addEventListener('click', () => {
        if(window.SC?.system){
          window.SC.system.markAllNotificationsRead();
          this.renderNotificationDropdown();
        }
      });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('dd-logout');
    if(logoutBtn){
      logoutBtn.addEventListener('click', () => {
        if(window.SC && window.SC.auth){
          window.SC.auth.logout();
        } else {
          localStorage.removeItem('sc_session');
          window.location.href = 'login.html';
        }
      });
    }
    
    // Update badge on load + every 30 sec
    this.updateNotificationBadge();
    setInterval(() => this.updateNotificationBadge(), 30000);
  }
};

window.SC = window.SC || {};
window.SC.ui = ui;

/* ════════════════════════════════════════════════════════════
   GLOBAL SEARCH — Cmd+K / Ctrl+K
   Searches across: customers, influencers, campaigns, transfers,
                    content, tasks, settings
   ════════════════════════════════════════════════════════════ */
const globalSearch = {
  isOpen: false,
  results: [],
  selectedIndex: 0,
  recentSearches: [],
  
  init(){
    this.injectStyles();
    this.bindKeyboard();
    this.bindTopbarSearch();
    this.loadRecent();
  },
  
  injectStyles(){
    if(document.getElementById('gs-styles')) return;
    const style = document.createElement('style');
    style.id = 'gs-styles';
    style.textContent = `
      .gs-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);z-index:10001;display:none;align-items:flex-start;justify-content:center;padding:80px 16px 16px;overflow-y:auto;animation:gs-fade .15s ease}
      .gs-overlay.open{display:flex}
      @keyframes gs-fade{from{opacity:0}to{opacity:1}}
      .gs-modal{background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:620px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);display:flex;flex-direction:column;max-height:calc(100vh - 160px);max-height:calc(100dvh - 160px);animation:gs-slide .18s ease}
      @keyframes gs-slide{from{transform:translateY(-12px);opacity:0}to{transform:translateY(0);opacity:1}}
      
      .gs-input-wrap{display:flex;align-items:center;gap:11px;padding:14px 18px;border-bottom:1px solid var(--border);background:var(--surface)}
      .gs-input-wrap .ic{width:18px;height:18px;color:var(--text-3);flex-shrink:0}
      .gs-input{flex:1;border:none;outline:none;font-family:inherit;font-size:15px;background:transparent;color:var(--text);min-width:0}
      .gs-input::placeholder{color:var(--text-3)}
      .gs-esc{padding:3px 7px;background:var(--surface-2);border:1px solid var(--border);border-radius:5px;font-family:var(--font-mono);font-size:10.5px;color:var(--text-2);flex-shrink:0;font-weight:600}
      
      .gs-body{flex:1;overflow-y:auto;padding:8px 0}
      .gs-empty{padding:60px 20px;text-align:center;color:var(--text-3)}
      .gs-empty .ic{width:32px;height:32px;margin-bottom:10px;opacity:0.6}
      .gs-empty p{font-size:13px}
      
      .gs-group-label{font-size:10.5px;font-weight:700;color:var(--text-3);padding:10px 18px 6px;text-transform:uppercase;letter-spacing:0.5px;font-family:var(--font-mono)}
      
      .gs-item{display:flex;align-items:center;gap:11px;padding:9px 18px;cursor:pointer;transition:background .1s;text-decoration:none;color:inherit}
      .gs-item:hover,.gs-item.active{background:var(--surface-2)}
      .gs-item .gs-icon{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;background:var(--surface-2);color:var(--text-3);flex-shrink:0;font-size:12px;font-weight:700}
      .gs-item.active .gs-icon{background:var(--brand-100);color:var(--brand-700)}
      .gs-item .gs-icon .ic{width:14px;height:14px}
      .gs-item .gs-content{flex:1;min-width:0}
      .gs-item .gs-title{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .gs-item .gs-subtitle{font-size:11px;color:var(--text-3);font-family:var(--font-mono);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .gs-item .gs-meta{font-size:10.5px;color:var(--text-3);font-family:var(--font-mono);background:var(--surface-2);padding:2px 7px;border-radius:5px;flex-shrink:0}
      .gs-item.active .gs-meta{background:var(--brand-50);color:var(--brand-700)}
      .gs-item mark{background:var(--brand-100);color:var(--brand-800);padding:0 2px;border-radius:2px;font-weight:700}
      [data-theme="dark"] .gs-item mark{background:rgba(20,195,154,0.25);color:var(--brand-500)}
      
      .gs-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 18px;border-top:1px solid var(--border);background:var(--surface-2);font-size:10.5px;color:var(--text-3);font-family:var(--font-mono);flex-wrap:wrap}
      .gs-footer .kbd{padding:2px 6px;background:var(--surface);border:1px solid var(--border);border-radius:4px;font-weight:600;color:var(--text-2);font-size:10px}
      .gs-footer .group{display:inline-flex;align-items:center;gap:5px}
      
      [data-theme="dark"] .gs-item.active .gs-icon{background:rgba(20,195,154,0.18);color:var(--brand-500)}
      
      @media (max-width:540px){
        .gs-overlay{padding:50px 8px 8px}
        .gs-modal{max-height:calc(100vh - 80px);max-height:calc(100dvh - 80px)}
        .gs-input{font-size:14px}
        .gs-footer{font-size:10px}
      }
    `;
    document.head.appendChild(style);
  },
  
  bindKeyboard(){
    document.addEventListener('keydown', (e) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key === 'k';
      const isEscape = e.key === 'Escape';
      const isSlash = e.key === '/' && !this.isOpen && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
      
      if(isCmdK){
        e.preventDefault();
        this.toggle();
      } else if(isEscape && this.isOpen){
        this.close();
      } else if(isSlash){
        e.preventDefault();
        this.open();
      }
    });
  },
  
  bindTopbarSearch(){
    // Make topbar search input open the modal instead
    setTimeout(() => {
      const topbarSearch = document.getElementById('global-search');
      if(topbarSearch){
        topbarSearch.readOnly = true;
        topbarSearch.style.cursor = 'pointer';
        topbarSearch.addEventListener('focus', (e) => {
          e.target.blur();
          this.open();
        });
        topbarSearch.addEventListener('click', () => this.open());
      }
    }, 200);
  },
  
  loadRecent(){
    try {
      this.recentSearches = JSON.parse(localStorage.getItem('sc_recent_searches') || '[]');
    } catch(e){ this.recentSearches = []; }
  },
  
  saveRecent(item){
    if(!item) return;
    this.recentSearches = this.recentSearches.filter(r => r.url !== item.url);
    this.recentSearches.unshift({
      title: item.title,
      subtitle: item.subtitle,
      url: item.url,
      type: item.type,
      icon: item.icon
    });
    this.recentSearches = this.recentSearches.slice(0, 5);
    try { localStorage.setItem('sc_recent_searches', JSON.stringify(this.recentSearches)); } catch(e){}
  },
  
  open(){
    if(this.isOpen) return;
    this.isOpen = true;
    this.selectedIndex = 0;
    
    const overlay = document.createElement('div');
    overlay.className = 'gs-overlay';
    overlay.id = 'gs-overlay';
    overlay.innerHTML = `
      <div class="gs-modal" role="dialog" aria-label="بحث">
        <div class="gs-input-wrap">
          <svg class="ic"><use href="#i-search"/></svg>
          <input type="text" class="gs-input" id="gs-input" placeholder="ابحث عن مؤثر، عميل، حملة، حوالة، مهمة..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
          <span class="gs-esc">ESC</span>
        </div>
        <div class="gs-body" id="gs-body"></div>
        <div class="gs-footer">
          <div class="group">
            <span class="kbd">↑↓</span>
            <span>تنقل</span>
          </div>
          <div class="group">
            <span class="kbd">⏎</span>
            <span>اختر</span>
          </div>
          <div class="group">
            <span class="kbd">ESC</span>
            <span>إغلاق</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    requestAnimationFrame(() => overlay.classList.add('open'));
    
    const input = document.getElementById('gs-input');
    const body = document.getElementById('gs-body');
    
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay) this.close();
    });
    
    input.addEventListener('input', (e) => {
      this.search(e.target.value.trim());
    });
    
    input.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        this.move(1);
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        this.move(-1);
      } else if(e.key === 'Enter'){
        e.preventDefault();
        this.activate();
      }
    });
    
    this.search('');
    setTimeout(() => input.focus(), 50);
  },
  
  close(){
    this.isOpen = false;
    const overlay = document.getElementById('gs-overlay');
    if(overlay){
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .12s';
      setTimeout(() => overlay.remove(), 120);
    }
  },
  
  toggle(){
    this.isOpen ? this.close() : this.open();
  },
  
  search(query){
    const body = document.getElementById('gs-body');
    if(!body) return;
    
    if(!query){
      this.showRecent();
      return;
    }
    
    const q = query.toLowerCase();
    const results = [];
    const api = window.SC?.api;
    if(!api){ body.innerHTML = ''; return; }
    
    const matches = (text) => text && String(text).toLowerCase().includes(q);
    const highlight = (text) => {
      if(!text || !q) return text || '';
      const escaped = String(text);
      const lower = escaped.toLowerCase();
      const idx = lower.indexOf(q);
      if(idx === -1) return escaped;
      return escaped.substring(0, idx) + '<mark>' + escaped.substring(idx, idx + q.length) + '</mark>' + escaped.substring(idx + q.length);
    };
    
    // Customers
    try {
      api.customers.list().filter(c => matches(c.name) || matches(c.id) || matches(c.phone) || matches(c.email)).slice(0, 5).forEach(c => {
        results.push({
          type: 'العميل',
          icon: 'i-users',
          title: highlight(c.name),
          subtitle: highlight(c.id) + ' · ' + (c.phone || c.email || '—'),
          url: `customer-detail.html?id=${c.id}`,
          group: 'العملاء'
        });
      });
    } catch(e){}
    
    // Influencers
    try {
      api.influencers.list().filter(i => matches(i.name) || matches(i.id) || matches(i.phone) || matches(i.username)).slice(0, 5).forEach(i => {
        results.push({
          type: 'المؤثر',
          icon: 'i-star',
          title: highlight(i.name),
          subtitle: highlight(i.id) + ' · ' + (i.category || '—'),
          url: `influencer-detail.html?id=${i.id}`,
          group: 'المؤثرين'
        });
      });
    } catch(e){}
    
    // Campaigns
    try {
      api.campaigns.list().filter(c => matches(c.name) || matches(c.id) || matches(c.customer_name)).slice(0, 5).forEach(c => {
        results.push({
          type: 'الحملة',
          icon: 'i-folder',
          title: highlight(c.name),
          subtitle: highlight(c.id) + ' · ' + (c.customer_name || '—'),
          url: `campaign-detail.html?id=${c.id}`,
          group: 'الحملات'
        });
      });
    } catch(e){}
    
    // Transfers
    try {
      api.transfers.list().filter(t => matches(t.id) || matches(t.customer_name) || matches(t.influencer_name) || matches(t.campaign_name)).slice(0, 5).forEach(t => {
        results.push({
          type: 'الحوالة',
          icon: 'i-wallet',
          title: highlight(t.id),
          subtitle: highlight(t.influencer_name || t.customer_name || '') + ' · ' + (Number(t.amount_total || 0).toLocaleString('en-US')) + ' ر.س',
          url: `transfer-detail.html?id=${t.id}`,
          group: 'المالية'
        });
      });
    } catch(e){}
    
    // Tasks
    try {
      if(api.tasks){
        api.tasks.list().filter(t => matches(t.title) || matches(t.description) || matches(t.id)).slice(0, 5).forEach(t => {
          results.push({
            type: 'المهمة',
            icon: 'i-check',
            title: highlight(t.title),
            subtitle: t.priority + ' · ' + t.status,
            url: `tasks.html?id=${t.id}`,
            group: 'المهام'
          });
        });
      }
    } catch(e){}
    
    // Quick actions
    const actions = [
      { title: 'لوحة التحكم', subtitle: 'الصفحة الرئيسية', url: 'dashboard.html', icon: 'i-dashboard', type: 'صفحة', group: 'تنقّل سريع', keywords: 'home dashboard لوحة' },
      { title: 'العملاء', subtitle: 'إدارة العملاء', url: 'customers.html', icon: 'i-users', type: 'صفحة', group: 'تنقّل سريع', keywords: 'customers عملاء' },
      { title: 'المؤثرين', subtitle: 'إدارة المؤثرين', url: 'influencers.html', icon: 'i-star', type: 'صفحة', group: 'تنقّل سريع', keywords: 'influencers مؤثرين' },
      { title: 'الحملات', subtitle: 'إدارة الحملات والإعلانات', url: 'orders-campaigns.html', icon: 'i-folder', type: 'صفحة', group: 'تنقّل سريع', keywords: 'campaigns حملات orders' },
      { title: 'المالية', subtitle: 'الحوالات والفواتير', url: 'finance.html', icon: 'i-wallet', type: 'صفحة', group: 'تنقّل سريع', keywords: 'finance مالية حوالات' },
      { title: 'المهام', subtitle: 'مهامي والتعيينات', url: 'tasks.html', icon: 'i-check', type: 'صفحة', group: 'تنقّل سريع', keywords: 'tasks مهام' },
      { title: 'التقويم', subtitle: 'الإعلانات والمواعيد', url: 'calendar.html', icon: 'i-calendar', type: 'صفحة', group: 'تنقّل سريع', keywords: 'calendar تقويم' },
      { title: 'الإعدادات', subtitle: 'إدارة المستخدمين والصلاحيات', url: 'settings.html', icon: 'i-gear', type: 'صفحة', group: 'تنقّل سريع', keywords: 'settings إعدادات' },
      { title: '+ رفع طلب حوالة', subtitle: 'طلب جديد', url: 'transfer-request.html', icon: 'i-plus', type: 'إجراء', group: 'إجراءات سريعة', keywords: 'transfer request حوالة جديد' },
      { title: '+ إضافة مؤثر', subtitle: 'مؤثر جديد', url: 'influencer-add.html', icon: 'i-plus', type: 'إجراء', group: 'إجراءات سريعة', keywords: 'add influencer إضافة مؤثر' },
      { title: '+ إضافة عميل', subtitle: 'عميل جديد', url: 'customer-add.html', icon: 'i-plus', type: 'إجراء', group: 'إجراءات سريعة', keywords: 'add customer إضافة عميل' }
    ];
    
    actions.filter(a => matches(a.title) || matches(a.subtitle) || matches(a.keywords)).forEach(a => {
      results.push({
        ...a,
        title: highlight(a.title),
        subtitle: highlight(a.subtitle)
      });
    });
    
    this.results = results;
    this.selectedIndex = 0;
    this.render();
  },
  
  showRecent(){
    const body = document.getElementById('gs-body');
    if(!body) return;
    
    if(this.recentSearches.length === 0){
      body.innerHTML = `
        <div class="gs-group-label">اقتراحات سريعة</div>
        <a class="gs-item" data-idx="0" href="dashboard.html"><div class="gs-icon"><svg class="ic"><use href="#i-dashboard"/></svg></div><div class="gs-content"><div class="gs-title">لوحة التحكم</div><div class="gs-subtitle">الصفحة الرئيسية</div></div></a>
        <a class="gs-item" data-idx="1" href="finance.html"><div class="gs-icon"><svg class="ic"><use href="#i-wallet"/></svg></div><div class="gs-content"><div class="gs-title">المالية</div><div class="gs-subtitle">الحوالات والفواتير</div></div></a>
        <a class="gs-item" data-idx="2" href="influencers.html"><div class="gs-icon"><svg class="ic"><use href="#i-star"/></svg></div><div class="gs-content"><div class="gs-title">المؤثرين</div><div class="gs-subtitle">إدارة المؤثرين</div></div></a>
        <a class="gs-item" data-idx="3" href="tasks.html"><div class="gs-icon"><svg class="ic"><use href="#i-check"/></svg></div><div class="gs-content"><div class="gs-title">المهام</div><div class="gs-subtitle">مهامي والتعيينات</div></div></a>
      `;
      this.results = [
        {url:'dashboard.html'}, {url:'finance.html'}, {url:'influencers.html'}, {url:'tasks.html'}
      ];
      this.selectedIndex = 0;
      this.applyActive();
      return;
    }
    
    let html = '<div class="gs-group-label">آخر البحث</div>';
    this.recentSearches.forEach((item, idx) => {
      html += `<a class="gs-item" data-idx="${idx}" href="${item.url}">
        <div class="gs-icon"><svg class="ic"><use href="#${item.icon || 'i-search'}"/></svg></div>
        <div class="gs-content">
          <div class="gs-title">${item.title}</div>
          <div class="gs-subtitle">${item.subtitle || ''}</div>
        </div>
        <span class="gs-meta">${item.type || ''}</span>
      </a>`;
    });
    body.innerHTML = html;
    this.results = this.recentSearches;
    this.selectedIndex = 0;
    this.applyActive();
  },
  
  render(){
    const body = document.getElementById('gs-body');
    if(!body) return;
    
    if(this.results.length === 0){
      body.innerHTML = `
        <div class="gs-empty">
          <svg class="ic"><use href="#i-search"/></svg>
          <p>لا توجد نتائج. جرّب كلمات أخرى.</p>
        </div>
      `;
      return;
    }
    
    // Group results
    const groups = {};
    this.results.forEach((r, idx) => {
      const g = r.group || 'نتائج';
      if(!groups[g]) groups[g] = [];
      groups[g].push({...r, idx});
    });
    
    let html = '';
    Object.entries(groups).forEach(([groupName, items]) => {
      html += `<div class="gs-group-label">${groupName}</div>`;
      items.forEach(r => {
        html += `<a class="gs-item" data-idx="${r.idx}" href="${r.url}">
          <div class="gs-icon"><svg class="ic"><use href="#${r.icon || 'i-search'}"/></svg></div>
          <div class="gs-content">
            <div class="gs-title">${r.title}</div>
            <div class="gs-subtitle">${r.subtitle || ''}</div>
          </div>
          <span class="gs-meta">${r.type}</span>
        </a>`;
      });
    });
    body.innerHTML = html;
    
    // Click to activate
    body.querySelectorAll('.gs-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(el.dataset.idx);
        this.selectedIndex = idx;
        this.activate();
      });
      el.addEventListener('mouseenter', () => {
        this.selectedIndex = parseInt(el.dataset.idx);
        this.applyActive();
      });
    });
    
    this.applyActive();
  },
  
  move(dir){
    if(this.results.length === 0) return;
    this.selectedIndex = (this.selectedIndex + dir + this.results.length) % this.results.length;
    this.applyActive();
    
    // Scroll into view
    const active = document.querySelector('.gs-item.active');
    if(active) active.scrollIntoView({block:'nearest'});
  },
  
  applyActive(){
    document.querySelectorAll('.gs-item').forEach((el, i) => {
      const idx = parseInt(el.dataset.idx);
      if(idx === this.selectedIndex) el.classList.add('active');
      else el.classList.remove('active');
    });
  },
  
  activate(){
    const item = this.results[this.selectedIndex];
    if(!item || !item.url) return;
    
    // Strip HTML tags from titles for saving
    const stripHtml = (s) => String(s||'').replace(/<[^>]+>/g, '');
    this.saveRecent({
      title: stripHtml(item.title),
      subtitle: stripHtml(item.subtitle),
      url: item.url,
      type: item.type,
      icon: item.icon
    });
    
    this.close();
    setTimeout(() => {
      window.location.href = item.url;
    }, 100);
  }
};

window.SC.globalSearch = globalSearch;

// Auto-init when DOM ready
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', () => globalSearch.init());
} else {
  globalSearch.init();
}

console.log('Smart Code UI layer loaded');

})(window);
