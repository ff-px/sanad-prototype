/* سند · نموذج أولي تفاعلي
   تطبيق صفحة واحدة بدون مكتبات خارجية — يعمل كموقع ثابت على GitHub Pages.
   كل الأرقام توضيحية. بيانات الحساب والخطة تبقى في المتصفح، وتُرسل فقط إحصاءات استخدام مجهولة إلى PostHog (analytics.js). */
(() => {
  'use strict';

  /* ================= أدوات عامة ================= */
  const app = document.getElementById('app');
  const phone = document.querySelector('.phone');
  const sheetRoot = document.getElementById('sheet-root');
  const toastEl = document.getElementById('toast');
  const navRoot = document.createElement('div');
  phone.appendChild(navRoot);

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toLatin = (s) => String(s).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const digits = (s) => toLatin(s).replace(/\D/g, '');
  const fmt = (n, d = 0) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const RIYAL = '<svg class="sar" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.6 3.5v13.8l3 2.1"/><path d="M13.2 5.6v9.8"/><path d="M3.6 11.3 20.4 7.7"/><path d="M3.6 15.7 20.4 12.1"/><path d="M13.6 20.4l6.8-1.5"/></svg>';
  const money = (n, d = 2) => `<span class="money" aria-label="${fmt(n, d)} ريال">${RIYAL}<span>${fmt(n, d)}</span></span>`;
  const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const fmtDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const fmtMonth = (d) => `${MONTHS[d.getMonth()]}`;
  const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addMonths = (d, n) => { const r = new Date(d); const day = r.getDate(); r.setDate(1); r.setMonth(r.getMonth() + n); r.setDate(Math.min(day, dim(r.getFullYear(), r.getMonth()))); return r; };
  const dim = (y, m) => new Date(y, m + 1, 0).getDate();
  const daysBetween = (a, b) => Math.round((dayStart(b) - dayStart(a)) / 86400000);

  /* ================= الأيقونات ================= */
  const P = {
    arrowR: ['M5 12h14', 'M12 5l7 7-7 7'],
    x: ['M18 6 6 18', 'M6 6l12 12'],
    chevL: ['m15 18-6-6 6-6'],
    chevD: ['m6 9 6 6 6-6'],
    chevU: ['m18 15-6-6-6 6'],
    plus: ['M5 12h14', 'M12 5v14'],
    check: ['M20 6 9 17l-5-5'],
    home: ['M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8', cls: 'nofill' }],
    grid: [{ rect: [3, 3, 7, 7, 1.5] }, { rect: [14, 3, 7, 7, 1.5] }, { rect: [3, 14, 7, 7, 1.5] }, { rect: [14, 14, 7, 7, 1.5] }],
    gear: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', { circle: [12, 12, 3], cls: 'nofill' }],
    wallet: ['M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1', 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4'],
    scale: ['m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z', 'm2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z', 'M7 21h10', 'M12 3v18', 'M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2'],
    coins: [{ circle: [8, 8, 6] }, 'M18.09 10.37A6 6 0 1 1 10.34 18', 'M7 6h1v4', 'm16.71 13.88.7.71-2.82 2.82'],
    palm: ['M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4', 'M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3', 'M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35', 'M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14'],
    trend: ['M22 7 13.5 15.5 8.5 10.5 2 17', 'M16 7h6v6'],
    chart: ['M3 3v16a2 2 0 0 0 2 2h16', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
    rocket: ['M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z', 'm12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z', 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0', 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'],
    gem: ['M6 3h12l4 6-10 13L2 9Z', 'M11 3 8 9l4 13 4-13-3-6', 'M2 9h20'],
    calc: [{ rect: [4, 2, 16, 20, 2] }, 'M8 6h8', 'M16 14v4', 'M16 10h.01', 'M12 10h.01', 'M8 10h.01', 'M12 14h.01', 'M8 14h.01', 'M12 18h.01', 'M8 18h.01'],
    hand: ['m11 17 2 2a1 1 0 1 0 3-3', 'm14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4', 'm21 3 1 11h-2', 'M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3', 'M3 4h8'],
    userPen: ['M11.5 15H7a4 4 0 0 0-4 4v2', 'M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z', { circle: [10, 7, 4] }],
    landmark: ['M10 18v-7', 'M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z', 'M14 18v-7', 'M18 18v-7', 'M3 22h18', 'M6 18v-7'],
    building: ['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z', 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2', 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', 'M10 6h4', 'M10 10h4', 'M10 14h4', 'M10 18h4'],
    del: ['M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z', 'm12 9 6 6', 'm18 9-6 6'],
    pencil: ['M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z', 'm15 5 4 4'],
    copy: [{ rect: [8, 8, 14, 14, 2] }, 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'],
    share: ['M12 2v13', 'm16 6-4-4-4 4', 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8'],
    info: [{ circle: [12, 12, 10] }, 'M12 16v-4', 'M12 8h.01'],
    card: [{ rect: [2, 5, 20, 14, 2] }, 'M2 10h20', 'M15 15h3'],
    repeat: ['m2 9 3-3 3 3', 'M13 18H7a2 2 0 0 1-2-2V6', 'm22 15-3 3-3-3', 'M11 6h6a2 2 0 0 1 2 2v10'],
    target: [{ circle: [12, 12, 10] }, { circle: [12, 12, 6] }, { circle: [12, 12, 2] }],
    calendar: [{ rect: [3, 4, 18, 18, 2] }, 'M16 2v4', 'M8 2v4', 'M3 10h18'],
    clock: [{ circle: [12, 12, 10] }, 'M12 6v6l4 2'],
    shield: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4'],
    user: [{ circle: [12, 8, 5] }, 'M20 21a8 8 0 0 0-16 0'],
    logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
    sprout: ['M7 20h10', 'M10 20c5.5-2.5.8-6.4 3-10', 'M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z', 'M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z'],
    sun: [{ circle: [12, 12, 4] }, 'M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'],
    moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
    alert: ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
    pause: [{ rect: [14, 4, 4, 16, 1] }, { rect: [6, 4, 4, 16, 1] }],
    gift: [{ rect: [3, 8, 18, 4, 1] }, 'M12 8v13', 'M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7', 'M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5'],
    bank: ['M3 22h18', 'M6 18v-7', 'M10 18v-7', 'M14 18v-7', 'M18 18v-7', 'M12 2 20 7H4z'],
    refresh: ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
    play: ['M6 3l14 9-14 9z'],
    lock: null,
  };
  function ic(name, extra = '') {
    if (name === 'lock') return `<svg class="ic ${extra}" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10.5" width="16" height="11" rx="3" fill="currentColor"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/><circle cx="12" cy="16" r="1.5" fill="#fff" stroke="none"/></svg>`;
    const parts = (P[name] || []).map((p) => {
      if (typeof p === 'string') return `<path d="${p}"/>`;
      const c = p.cls ? ` class="${p.cls}"` : '';
      if (p.d) return `<path d="${p.d}"${c}/>`;
      if (p.circle) return `<circle cx="${p.circle[0]}" cy="${p.circle[1]}" r="${p.circle[2]}"${c}/>`;
      if (p.rect) return `<rect x="${p.rect[0]}" y="${p.rect[1]}" width="${p.rect[2]}" height="${p.rect[3]}" rx="${p.rect[4]}"${c}/>`;
      return '';
    }).join('');
    return `<svg class="ic ${extra}" viewBox="0 0 24 24" aria-hidden="true">${parts}</svg>`;
  }
  const LOGO = '<svg viewBox="0 0 64 64" width="78" height="78" aria-hidden="true"><circle cx="32" cy="19" r="9" fill="#fff"/><path d="M9 31c4 15 13 23 23 23s19-8 23-23" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/></svg>';

  /* ================= بيانات المنتجات ================= */
  const BASKETS = {
    liq: { name: 'السيولة', sub: 'صناديق المرابحة', use: 'للطوارئ والمصاريف القريبة', y: 0.05, tr: 0.05, hex: '#9FB3FB', tk: 'MURABAHA', src: 'أرباح صناديق المرابحة', range: [20, 30] },
    fix: { name: 'الدخل الثابت', sub: 'صكوك وودائع طويلة الأجل', use: 'مصدر الدخل الشهري المستقر', y: 0.06, tr: 0.06, hex: '#3A47E6', tk: 'SUKUK', src: 'عوائد الصكوك والودائع', range: [40, 50] },
    gro: { name: 'النمو', sub: 'أسهم توزيعات وصناديق ريت', use: 'تحمي مدخراتك من التضخم', y: 0.055, tr: 0.09, hex: '#13A57A', tk: 'DIV · REIT', src: 'توزيعات الأسهم والريت', range: [20, 30] },
  };
  const KEYS = ['liq', 'fix', 'gro'];
  const RISK = {
    low: { name: 'محافظ', meta: 'الأولوية لحماية رأس المال', alloc: { liq: 30, fix: 50, gro: 20 }, icon: 'shield', types: ['saving', 'corp-sukuk', 'div-safe'] },
    mid: { name: 'متوازن', meta: 'دخل ثابت مع نمو معتدل', alloc: { liq: 25, fix: 50, gro: 25 }, icon: 'scale', types: ['saving', 'corp-sukuk', 'div-safe', 'dividends', 'reit', 'div-bal'] },
    high: { name: 'نمو أعلى', meta: 'قد يتطلب توقيع إقرار المخاطر', alloc: { liq: 25, fix: 45, gro: 30 }, icon: 'trend', types: ['saving', 'corp-sukuk', 'div-safe', 'dividends', 'reit', 'div-bal', 'div-growth', 'div-high', 'saudi'] },
  };
  const RISK_CAP = 10; // الحد الأعلى لمخاطر رأس المال: أقصى انخفاض متوقع خلال 12 شهر (%)
  const PAY_DAY = 27;  // يوم الدفعة الشهرية ثابت لكل الخطط
  const ACK_LIMIT = 25;           // سلة النمو فوق هذه النسبة تتطلب إقرار مخاطر
  const FEE = { base: 0.006, growthHigh: 0.009 }; // رسوم إدارة سنوية توضيحية

  const PORTS = {
    saving: { name: 'الادخار', short: 'صناديق أسواق النقد', dy: 5.85, hex: '#9FB3FB', tk: 'MMF', icon: 'wallet', style: 'solid', desc: 'عوائد يومية تصل إلى <span class="pos">+5.85%</span> سنويًا', rate: 5.85, risk: 'منخفضة جدًا', vol: 0.0006,
      hero: 'ادّخر بذكاء وخلّ فلوسك تشتغل كل يوم!', text: 'عوائد يومية من صناديق أسواق النقد المتوافقة مع الشريعة', holdings: [['صناديق أسواق النقد', 'MMF', 100]] },
    'div-safe': { name: 'المتنوعة (آمنة)', short: 'تنويع منخفض المخاطر', dy: 4.0, hex: '#7C8CF0', tk: 'MULTI', icon: 'scale', rate: 4.44, risk: 'منخفضة', vol: 0.003, parent: 'diversified',
      holdings: [['صكوك', 'SUKUK', 50], ['صناديق أسواق النقد', 'MMF', 25], ['أسهم عالمية', 'GLOBAL', 15], ['عقارات', 'REIT', 10]] },
    'div-bal': { name: 'المتنوعة (متوازنة)', short: 'تنويع متوازن', dy: 3.5, hex: '#5B6BE6', tk: 'MULTI', icon: 'scale', rate: 6.5, risk: 'متوسطة', vol: 0.006, parent: 'diversified',
      holdings: [['أسهم أمريكية', 'US-EQ', 35], ['الأسهم السعودية', 'TASI', 20], ['الصكوك', 'SUKUK', 30], ['عقارات', 'REIT', 15]] },
    'div-growth': { name: 'المتنوعة (نمو)', short: 'تنويع بنمو أعلى', dy: 2.5, hex: '#3442C2', tk: 'MULTI', icon: 'scale', rate: 8.5, risk: 'مرتفعة', vol: 0.009, parent: 'diversified',
      holdings: [['أسهم أمريكية', 'US-EQ', 50], ['الأسهم السعودية', 'TASI', 25], ['الصكوك', 'SUKUK', 15], ['عقارات', 'REIT', 10]] },
    'div-high': { name: 'المتنوعة (نمو عالي)', short: 'تنويع بنمو عالي', dy: 1.5, hex: '#232C93', tk: 'MULTI', icon: 'scale', rate: 10.5, risk: 'مرتفعة جدًا', vol: 0.012, parent: 'diversified',
      holdings: [['أسهم أمريكية', 'US-EQ', 60], ['الأسهم السعودية', 'TASI', 30], ['عقارات', 'REIT', 10]] },
    dividends: { name: 'التوزيعات', short: 'أسهم وريت وصكوك موزّعة', dy: 6.5, hex: '#13A57A', tk: 'DIV', icon: 'coins', isNew: true, desc: 'لزيادة دخلك بتوزيعات شهرية', tags: ['أسهم', 'عقارات', 'صناديق أسواق النقد', 'صكوك'], rate: 7.0, risk: 'متوسطة', vol: 0.005,
      hero: 'دخل شهري من توزيعات أرباح مختارة', holdings: [['أسهم توزيعات', 'DIV', 40], ['صناديق الريت', 'REIT', 25], ['صكوك', 'SUKUK', 20], ['صناديق أسواق النقد', 'MMF', 15]] },
    'corp-sukuk': { name: 'صكوك الشركات', short: 'صكوك شركات شرعية', dy: 6.9, hex: '#2F7BDB', tk: 'SUKUK', icon: 'landmark', isNew: true, desc: 'استثمر فقط في صكوك الشركات المتوافقة مع الشريعة', tags: ['صكوك شركات شرعية', 'عوائد ثابتة', 'توزيعات دورية'], rate: 6.9, risk: 'منخفضة', vol: 0.0015,
      hero: 'صكوك شركات شرعية بعوائد ثابتة', text: 'فرص استثمارية محدودة المدة في صكوك شركات سعودية معتمدة من اللجنة الشرعية، بعوائد ثابتة وتوزيعات دورية (شهرية، ربعية، نصف سنوية)', holdings: [] },
    reit: { name: 'الأسهم العقارية', short: 'صناديق ريت وأسهم عقارية', dy: 6.0, hex: '#F29E4C', tk: 'REIT', icon: 'building', isNew: true, desc: 'للاستثمار في صناديق الريت وأسهم شركات العقار', tags: ['صناديق ريت', 'أسهم عقارية', 'توزيعات نقدية'], rate: 7.8, risk: 'متوسطة', vol: 0.008,
      hero: 'استثمر في العقار بدون ما تشتري عقار', text: 'صناديق ريت وأسهم شركات عقارية توزّع أرباحًا نقدية', holdings: [['صناديق الريت السعودية', 'REIT', 65], ['أسهم التطوير العقاري', 'RE-EQ', 35]] },
    saudi: { name: 'السوق السعودي', short: 'أسهم سعودية بإدارة نشطة', dy: 2.5, hex: '#E86A5E', tk: 'TASI', icon: 'palm', desc: 'لعوائد عالية في أسهم مختارة بإدارة نشطة', tags: ['أسهم سعودية (نشطة)'], rate: 9.5, risk: 'مرتفعة', vol: 0.011,
      hero: 'اقتنص فرص السوق السعودي', holdings: [['أسهم سعودية مختارة', 'TASI', 100]] },
    trading: { name: 'التداول', icon: 'chart', style: 'dark', desc: 'تداول الأسهم بنفسك بتجربة سهلة', brand: 'مدعومة من أبيان تداول', rate: null, risk: 'حسب اختيارك' },
    future: { name: 'المستقبل', short: 'بيتكوين وشركات تقنية', dy: 0, hex: '#8B5CF6', tk: 'IBIT', icon: 'rocket', desc: 'للاستثمار في صندوق البيتكوين والشركات التقنية', tags: ['صندوق البيتكوين', 'شركات التقنية'], rate: 18, risk: 'عالية جدًا', vol: 0.03,
      hero: 'انت على بعد خطوة من بناء مستقبلك !', text: 'كن جزء من مستقبل العالم باستثمارك في محفظة', holdings: [['صندوق البيتكوين', 'IBIT', 60], ['أسهم تقنية عالمية', 'SPTE', 40]] },
  };
  const CREATE_ORDER = ['saving', 'diversified', 'dividends', 'corp-sukuk', 'reit', 'saudi', 'trading', 'future'];
  const CALC_ORDER = ['div-safe', 'div-bal', 'div-growth', 'saving', 'saudi', 'div-high', 'dividends', 'corp-sukuk', 'reit', 'future'];
  const DIV_SUBS = ['div-safe', 'div-bal', 'div-growth', 'div-high'];
  const MIX_ORDER = ['saving', 'corp-sukuk', 'dividends', 'reit', 'div-safe', 'div-bal', 'div-growth', 'div-high', 'saudi', 'future'];
  const HIGH_RISK = ['div-growth', 'div-high', 'saudi', 'future'];
  // فرص صكوك الشركات (أسماء الجهات المصدرة والأرقام توضيحية)
  const SUKUK = [
    { id: 's1', name: 'صكوك شركة تطوير عقاري', sector: 'العقار', type: 'مرابحة', rate: 7.2, term: 12, freq: 'شهري', n: 12, min: 1000, funded: 68, days: 9 },
    { id: 's2', name: 'صكوك شركة خدمات لوجستية', sector: 'النقل والخدمات اللوجستية', type: 'إجارة', rate: 6.8, term: 18, freq: 'ربعي', n: 4, min: 1000, funded: 45, days: 14 },
    { id: 's3', name: 'صكوك شركة رعاية صحية', sector: 'الرعاية الصحية', type: 'مرابحة', rate: 6.5, term: 24, freq: 'نصف سنوي', n: 2, min: 5000, funded: 82, days: 5 },
    { id: 's4', name: 'صكوك شركة طاقة متجددة', sector: 'الطاقة', type: 'وكالة', rate: 7.0, term: 12, freq: 'ربعي', n: 4, min: 1000, funded: 30, days: 21 },
  ];

  /* ===== المستشار الآلي =====
     لكل نوع: أقصى انخفاض متوقع لرأس المال خلال 12 شهر (loss) وحدود الوزن (min/max). كلها أرقام توضيحية.
     مخاطر المحفظة = المتوسط المرجّح للانخفاض (تقدير متحفظ بدون أثر التنويع).
     الدخل الشهري = الرصيد × العائد المتوقع الكلي (توزيعات + نمو) ÷ 12. */
  const ADV = {
    saving: { loss: 0.5, min: 10, max: 40 },
    'corp-sukuk': { loss: 4, min: 0, max: 40 },
    'div-safe': { loss: 6, min: 0, max: 40 },
    dividends: { loss: 14, min: 0, max: 30 },
    reit: { loss: 16, min: 0, max: 25 },
    'div-bal': { loss: 12, min: 0, max: 30 },
    'div-growth': { loss: 18, min: 0, max: 20 },
    'div-high': { loss: 24, min: 0, max: 15 },
    saudi: { loss: 25, min: 0, max: 15 },
    future: { loss: 55, min: 0, max: 5 },
  };
  const ADV_ALL = ['saving', 'corp-sukuk', 'div-safe', 'dividends', 'reit', 'div-bal', 'div-growth', 'div-high', 'saudi'];
  const mixRate = (w) => Object.keys(w).reduce((s, id) => s + (w[id] || 0) * (PORTS[id] ? PORTS[id].rate : 0) / 100, 0); // %
  const mixLoss = (w) => Object.keys(w).reduce((s, id) => s + (w[id] || 0) * (ADV[id] ? ADV[id].loss : 0) / 100, 0); // %
  // توزيع جشع حسب (العائد − λ × المخاطر) مع احترام حدود كل نوع؛ λ كبيرة = أقل مخاطرة، λ = 0 = أعلى عائد
  function greedy(ids, lam) {
    const w = {}; let left = 100;
    ids.forEach((id) => { w[id] = ADV[id].min; left -= ADV[id].min; });
    const score = (id) => PORTS[id].rate - lam * ADV[id].loss;
    for (const id of ids.slice().sort((a, b) => score(b) - score(a))) { const add = Math.min(left, ADV[id].max - w[id]); w[id] += add; left -= add; if (left <= 0) break; }
    return w;
  }
  const lerpMix = (A, B, t) => Object.keys(A).reduce((w, id) => (w[id] = A[id] + (B[id] - A[id]) * t, w), {});
  function roundMix(w, step = 5) { // تقريب لأقرب 5% مع مجموع 100%
    const ids = Object.keys(w), fl = {}; let s = 0;
    ids.forEach((id) => { fl[id] = Math.floor(w[id] / step + 1e-9) * step; s += fl[id]; });
    ids.slice().sort((a, b) => (w[b] - fl[b]) - (w[a] - fl[a])).slice(0, Math.round((100 - s) / step)).forEach((id) => (fl[id] += step));
    return fl;
  }
  // أفضل توزيع على حدود الشرط ok (شرط رتيب في λ). best = 60 لأقل مخاطرة، 0 لأعلى عائد
  function edge(ids, ok, best) {
    const worst = best ? 0 : 60;
    if (ok(greedy(ids, best))) return greedy(ids, best);
    if (!ok(greedy(ids, worst))) return null;
    let s = worst, u = best;
    for (let k = 0; k < 40; k++) { const m = (s + u) / 2; if (ok(greedy(ids, m))) s = m; else u = m; }
    const A = greedy(ids, s), B = greedy(ids, u);
    let a = 0, b = 1;
    for (let k = 0; k < 30; k++) { const m = (a + b) / 2; if (ok(lerpMix(A, B, m))) a = m; else b = m; }
    const w = roundMix(lerpMix(A, B, a));
    for (let k = 0; k < 40 && !ok(w); k++) { const dn = ids.find((id) => w[id] > A[id]), up = ids.find((id) => w[id] < A[id]); if (!dn || !up) return A; w[dn] -= 5; w[up] += 5; }
    return w;
  }
  const cleanMix = (w) => MIX_ORDER.reduce((r, id) => { if (w[id] > 0) r[id] = w[id]; return r; }, {});
  const reqRate = (savings, target) => target * 12 / Math.max(savings, 1) * 100;
  // أقل مخاطرة توصل للدخل المستهدف ضمن الحد
  function hitTarget(ids, ty, cap) { const w = edge(ids, (m) => mixRate(m) >= ty - 1e-9, 60); return w && mixLoss(w) <= cap + 1e-9 ? w : null; }
  const reachable = (savings, target) => !!hitTarget(ADV_ALL, reqRate(savings, target), RISK_CAP);
  /* يحاول دائمًا يوصل للمبلغ المستهدف بالكامل. why: profile = أنواع وصف المخاطر لا تكفي، cap = حد 10% يمنع، max = حتى بدون حد ما يكفي */
  function advise(savings, target, riskKey, over) {
    const ty = reqRate(savings, target), ids = (RISK[riskKey] || RISK.mid).types;
    const w = over ? (hitTarget(ADV_ALL, ty, RISK_CAP) || hitTarget(ADV_ALL, ty, 100)) : hitTarget(ids, ty, RISK_CAP);
    if (w) return { mix: cleanMix(w), ok: true, why: null };
    const pool = over ? ADV_ALL : ids, cap = over ? 100 : RISK_CAP;
    const best = edge(pool, (m) => mixLoss(m) <= cap + 1e-9, 0) || greedy(pool, 60);
    return { mix: cleanMix(best), ok: false, why: over ? 'max' : hitTarget(ADV_ALL, ty, RISK_CAP) ? 'profile' : 'cap' };
  }

  /* ================= الحالة ================= */
  const KEY = 'sanad_proto_v1';
  const defaultState = () => ({ v: 1, user: null, passcode: null, plan: null, portfolios: [], history: [], sukuk: [], mixDraft: null, simOffset: 0, auto: null, events: {}, draft: null, reg: null, calc: { pf: 'div-safe', init: 20000, monthly: 1500, year: 15, saveYear: 1, period: 'all' } });
  let S = load();
  if (S.plan) S.plan.payDay = PAY_DAY;
  let unlocked = false;
  let REINV = false; // عرض أثر إعادة استثمار التوزيعات في الرسوم الخطية
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return Object.assign(defaultState(), JSON.parse(raw)); } catch (e) { /* التخزين غير متاح */ }
    return defaultState();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* تجاهل */ } }
  function track(ev) { S.events[ev] = (S.events[ev] || 0) + 1; save(); try { window.sanadTrack && window.sanadTrack(ev); } catch (e) {} }

  const vToday = () => addMonths(new Date(), S.simOffset || 0);
  function nextPayDate(day, from = vToday()) {
    const t = dayStart(from);
    let y = t.getFullYear(), m = t.getMonth();
    let d = new Date(y, m, Math.min(day, dim(y, m)));
    if (d <= t) { m += 1; d = new Date(y, m, 1); d.setDate(Math.min(day, dim(d.getFullYear(), d.getMonth()))); }
    return d;
  }
  /* مكوّنات الخطة: السلال الثلاث (نسخة قديمة)، أو مزيج محافظ من المستشار الآلي (auto) أو من تصميم المستخدم (custom) */
  function comps(p, o = {}) {
    const mode = o.mode || p.mode || 'preset';
    if (mode !== 'preset') {
      const mix = o.mix || p.mix || {};
      return MIX_ORDER.filter((id) => mix[id] > 0).map((id) => { const q = PORTS[id]; return { k: id, name: q.name, sub: q.short, w: mix[id], y: q.rate / 100, tr: q.rate / 100, hex: q.hex, tk: q.tk, src: 'عوائد محفظة ' + q.name, high: HIGH_RISK.includes(id) }; });
    }
    const alloc = o.alloc || p.alloc;
    return KEYS.map((k) => ({ k, name: BASKETS[k].name, sub: BASKETS[k].sub, w: alloc[k], y: BASKETS[k].y, tr: BASKETS[k].tr, hex: BASKETS[k].hex, tk: BASKETS[k].tk, src: BASKETS[k].src, high: k === 'gro' && alloc[k] > ACK_LIMIT }));
  }
  const split = (p, o = {}, bal = p.balance) => comps(p, o).reduce((r, c) => (r[c.k] = bal * c.w / 100 * c.y / 12, r), {});
  const income = (p, o = {}, bal = p.balance) => Object.values(split(p, o, bal)).reduce((a, b) => a + b, 0);
  const blendY = (alloc) => KEYS.reduce((s, k) => s + alloc[k] / 100 * BASKETS[k].y, 0);
  const planY = (p, o = {}) => comps(p, o).reduce((s, c) => s + c.w / 100 * c.y, 0);
  const planTR = (p, o = {}) => comps(p, o).reduce((s, c) => s + c.w / 100 * c.tr, 0);
  const highShare = (p, o = {}) => comps(p, o).filter((c) => c.high).reduce((s, c) => s + c.w, 0);
  const annualFee = (p, o = {}, bal = p.balance) => comps(p, o).reduce((s, c) => s + bal * c.w / 100 * (c.high ? FEE.growthHigh : FEE.base), 0);
  function riskLabel(p, o = {}) {
    const mode = o.mode || p.mode || 'preset';
    if (mode === 'preset') { const a = o.alloc || p.alloc; return a.gro > ACK_LIMIT ? 'أعلى (بإقرار)' : a.gro >= 25 ? 'متوسطة' : 'منخفضة'; }
    const L = mixLoss(o.mix || p.mix || {});
    return `${L <= 5 ? 'منخفضة' : L <= RISK_CAP ? 'متوسطة' : 'مرتفعة'} · ${fmt(L, 1)}%`;
  }
  const presetToMix = (a) => { const d = Math.ceil(a.gro / 2 / 5) * 5; return { saving: a.liq, 'corp-sukuk': a.fix, dividends: d, reit: a.gro - d }; };
  const planMix = (p) => ((p.mode || 'preset') === 'preset' ? presetToMix(p.alloc) : p.mix || {});
  const needsAck = (mix) => highShare({ mode: 'custom', mix }) > 0 || mixLoss(mix) > RISK_CAP + 1e-9;
  const modeBadge = (p) => { const m = p.mode || 'preset'; return m === 'custom' ? 'من تصميمك' : m === 'auto' ? 'المستشار الآلي' : 'خطة مقترحة'; };
  const fmtShort = (n) => (Math.abs(n) >= 1e6 ? fmt(n / 1e6, Math.abs(n) >= 1e7 ? 0 : 1) + ' مليون' : Math.abs(n) >= 1e3 ? fmt(n / 1e3, 0) + ' ألف' : fmt(n, 0));

  /* ===== رسم خطي عام: الزمن من اليسار لليمين، والقيم على المحور الرأسي ===== */
  function lineChart(series, xt, o = {}) {
    const W = 360, H = o.h || 210, L = 58, R = 24, T = 14, B = 28;
    const all = series.flatMap((s) => s.pts);
    let mn = o.min != null ? o.min : Math.min(...all), mx = Math.max(...all);
    if (o.min == null) { const pad = (mx - mn) * 0.08 || 1; mn -= pad; mx += pad; } else mx = mx <= mn ? mn + 1 : mx + (mx - mn) * 0.05;
    const n = series[0].pts.length, yf = o.yFmt || fmtShort;
    const X = (i) => L + i / (n - 1) * (W - L - R), Y = (v) => T + (1 - (v - mn) / (mx - mn)) * (H - T - B);
    const grid = [0, 1, 2, 3].map((k) => { const v = mn + (mx - mn) * k / 3, y = Y(v).toFixed(1); return `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="#DCE3EE"/><text x="${L / 2}" y="${(+y + 4).toFixed(1)}" text-anchor="middle" font-size="11" fill="#6B7383">${yf(v)}</text>`; }).join('');
    const xl = xt.map(([i, l]) => `<text x="${X(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#6B7383">${l}</text>`).join('');
    const axes = `<line x1="${L}" x2="${L}" y1="${T}" y2="${H - B}" stroke="#B8C2D3"/><line x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}" stroke="#B8C2D3"/>`;
    const lines = series.map((s) => {
      const d = s.pts.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(''), li = s.pts.length - 1;
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.dash ? 2.5 : 3.5}"${s.dash ? ' stroke-dasharray="6 5"' : ''} stroke-linecap="round" stroke-linejoin="round"/><circle cx="${X(li).toFixed(1)}" cy="${Y(s.pts[li]).toFixed(1)}" r="4.5" fill="#fff" stroke="${s.color}" stroke-width="2.5"/>`;
    }).join('');
    const legend = series.slice().reverse().map((s) => `<span><i class="${s.dash ? 'dash' : ''}" style="${s.dash ? `border-color:${s.color}` : `background:${s.color}`}"></i>${s.label}</span>`).join('');
    return `<svg class="lc" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.label || 'رسم بياني خطي'}">${grid}${axes}${xl}${lines}</svg><div class="lc-legend">${legend}</div>`;
  }
  const weightsHTML = (mix) => `<div class="weights"><span class="wl">الأوزان:</span>${MIX_ORDER.filter((id) => mix[id] > 0).map((id) => `<span><i style="background:${PORTS[id].hex}"></i>${PORTS[id].name} <b>${mix[id]}%</b></span>`).join('')}</div>`;
  // توقع 15 سنة: الدخل يُصرف شهريًا (القيمة ثابتة + الاستقطاع) مقابل إعادة استثمار الدخل بالكامل
  function project(P, Y, monthly, years = 15) {
    const r = Y / 12, out = { val: [P], inc: [0], tot: [P], re: [P] };
    let v = P, inc = 0, re = P;
    for (let m = 1; m <= years * 12; m++) {
      inc += v * r; v += monthly; re = re * (1 + r) + monthly;
      if (m % 12 === 0) { out.val.push(v); out.inc.push(inc); out.tot.push(v + inc); out.re.push(re); }
    }
    return out;
  }
  const reinvToggle = (id) => `<div class="reinv"><span>إعادة استثمار التوزيعات</span><label class="toggle"><input type="checkbox" id="${id}" ${REINV ? 'checked' : ''} aria-label="إعادة استثمار التوزيعات"/><span></span></label></div>`;
  function projHTML(P, mix, monthly) {
    const pr = project(P, mixRate(mix) / 100, monthly), e = 15;
    const xt = [[0, 'الآن'], [5, '5 سنوات'], [10, '10 سنوات'], [15, '15 سنة']];
    const chart = REINV
      ? lineChart([{ pts: pr.tot, color: '#9AA3B2', dash: true, label: 'بدون إعادة استثمار (القيمة + الدخل المستلم)' }, { pts: pr.re, color: '#3A47E6', label: 'مع إعادة استثمار التوزيعات' }], xt, { min: 0, label: 'أثر إعادة استثمار التوزيعات خلال 15 سنة' })
      : lineChart([{ pts: pr.inc, color: '#13A57A', label: 'الدخل المستلم التراكمي' }, { pts: pr.val, color: '#3A47E6', label: 'قيمة محفظتك' }], xt, { min: 0, label: 'قيمة الاستثمار خلال 15 سنة' });
    const note = REINV
      ? `بعد 15 سنة: ${money(pr.re[e], 0)} مع إعادة الاستثمار، مقابل ${money(pr.tot[e], 0)} بدونها (فرق ${money(pr.re[e] - pr.tot[e], 0)}). مع إعادة الاستثمار ما تستلم دخل شهري خلال الفترة.`
      : `خلال 15 سنة تستلم دخل إجمالي ${money(pr.inc[e], 0)} تقريبًا، وتبقى قيمة محفظتك ${money(pr.val[e], 0)}${monthly ? ' مع الاستقطاع الشهري' : ''}.`;
    return `${chart}<div class="lc-axes"><span>المحور الأفقي: السنوات</span><span>المحور الرأسي: القيمة بالريال</span></div>${weightsHTML(mix)}<p class="small mt8" style="line-height:1.8">${note}</p>`;
  }
  const portBalance = (id) => (S.portfolios.find((x) => x.id === id) || {}).balance || 0;
  const totalBalance = () => (S.plan && S.plan.funded ? S.plan.balance : 0) + S.portfolios.reduce((s, x) => s + x.balance, 0);

  function seedDemo() {
    const st = defaultState();
    st.events = S.events || {};
    st.user = { name: 'أبو فيصل', nid: '1012345678', phone: '501230789', demo: true };
    st.passcode = '111111';
    const now = new Date(), A = advise(500000, 2500, 'mid', false);
    st.plan = { mode: 'auto', mix: A.mix, pension: 9000, savings: 500000, target: 2500, risk: 'mid', payDay: PAY_DAY, dest: 'bank', paused: false, ack: needsAck(A.mix), ackDate: addMonths(now, -4).toISOString(), balance: 500000, funded: true, createdAt: addMonths(now, -4).toISOString() };
    const amt = income(st.plan);
    for (let i = 3; i >= 1; i--) {
      const base = addMonths(now, -i);
      const d = new Date(base.getFullYear(), base.getMonth(), 1);
      st.history.push({ date: d.toISOString(), amount: amt, split: split(st.plan), dest: 'bank' });
    }
    st.portfolios = [{ id: 'saving', balance: 20000, createdAt: addMonths(now, -2).toISOString() }];
    S = st; save();
  }

  /* ================= التوجيه ================= */
  const R = [];
  function route(path, def) {
    const keys = [];
    const re = new RegExp('^' + path.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '$');
    R.push({ re, keys, def });
  }
  let navDepth = 0, backAnim = false, timers = [], keyHandler = null, cleanup = [];
  function go(path, opt = {}) {
    if (opt.back) backAnim = true;
    const target = '#' + path;
    if (opt.replace) { history.replaceState(null, '', target); render(); return; }
    if (location.hash === target) { render(); return; }
    navDepth += 1;
    location.hash = path;
  }
  function back(fallback = '/home') {
    backAnim = true;
    if (navDepth > 0) { navDepth -= 1; history.back(); } else { history.replaceState(null, '', '#' + fallback); render(); }
  }
  window.addEventListener('hashchange', render);

  function render() {
    timers.forEach(clearTimeout); timers = [];
    cleanup.forEach((f) => f()); cleanup = [];
    keyHandler = null;
    closeSheet(true);
    const raw = location.hash.replace(/^#/, '') || '/splash';
    const [path, qs] = raw.split('?');
    const query = new URLSearchParams(qs || '');
    let hit = null, params = {};
    for (const r of R) { const m = path.match(r.re); if (m) { hit = r; r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1]))); break; } }
    if (!hit) { go('/splash', { replace: true }); return; }
    const def = hit.def;
    if (def.auth && !S.user) { go('/welcome', { replace: true }); return; }
    if (def.auth && !unlocked && !S.passcode) unlocked = true; // تخطى إنشاء رمز المرور أو زائر
    if (def.auth && !unlocked) { go('/lock', { replace: true }); return; }
    const html = def.view(params, query);
    if (html === null) return; // تم التحويل داخل الشاشة
    app.innerHTML = `<section class="screen ${def.cls || ''} ${def.nav ? 'with-nav' : ''} ${backAnim ? 'back-anim' : ''}">${html}</section>`;
    navRoot.innerHTML = def.nav ? bottomNav(def.nav) : '';
    phone.classList.toggle('on-blue', !!def.blue);
    backAnim = false;
    app.scrollTop = 0;
    if (def.mount) def.mount(app.firstElementChild, params, query);
    track('view:' + path.split('/')[1]);
  }
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  /* ================= مكونات مشتركة ================= */
  const topbar = (title = '', end = '', fallback = '/home') => `<header class="topbar"><button class="icon-btn" data-back="${fallback}" aria-label="رجوع">${ic('arrowR')}</button><h1>${title}</h1><div class="end">${end}</div></header>`;
  function bottomNav(active) {
    const items = [['home', '/home', 'الرئيسية', 'home'], ['services', '/services', 'الخدمات', 'grid'], ['settings', '/settings', 'الإعدادات', 'gear']];
    return `<nav class="bottom-nav">${items.map(([k, p, l, i]) => `<button class="${k === active ? 'active' : ''}" data-go="${p}" data-replace="1">${ic(i)}<span>${l}</span></button>`).join('')}</nav>`;
  }
  function iconCircle(p, size = '') {
    const cls = p.style === 'solid' ? 'solid' : p.style === 'dark' ? 'dark' : '';
    return `<div class="icon-circle ${cls} ${size}">${ic(p.icon)}</div>`;
  }
  function ring(pct, color = 'var(--primary)') {
    const c = 2 * Math.PI * 15;
    return `<svg class="ring" viewBox="0 0 38 38" aria-hidden="true"><circle cx="19" cy="19" r="15" fill="none" stroke="#D6DDE9" stroke-width="7"/><circle cx="19" cy="19" r="15" fill="none" stroke="${color}" stroke-width="7" stroke-dasharray="${c * pct / 100} ${c}" transform="rotate(-90 19 19)"/></svg>`;
  }
  function donut(alloc, size = 200) {
    const r = 78, c = 2 * Math.PI * r; let off = 0;
    const segs = KEYS.map((k) => { const len = c * alloc[k] / 100; const s = `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${BASKETS[k].hex}" stroke-width="28" stroke-dasharray="${Math.max(0, len - 3)} ${c}" stroke-dashoffset="${-off}" transform="rotate(-90 100 100)"/>`; off += len; return s; }).join('');
    return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true">${segs}</svg>`;
  }
  function keypad() {
    const k = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-key="${n}">${n}</button>`).join('');
    return `<div class="keypad">${k}<button class="blank" tabindex="-1" aria-hidden="true"></button><button data-key="0">0</button><button class="del" data-key="del" aria-label="حذف">${ic('del')}</button></div>`;
  }
  function mountKeypad(root, onKey) {
    root.querySelectorAll('[data-key]').forEach((b) => b.addEventListener('click', () => onKey(b.dataset.key)));
    keyHandler = (e) => { if (/^[0-9]$/.test(e.key)) onKey(e.key); else if (e.key === 'Backspace') onKey('del'); };
  }
  document.addEventListener('keydown', (e) => { if (keyHandler && !(e.target instanceof HTMLInputElement)) keyHandler(e); });
  const dots = (n, total = 6) => `<div class="dots">${Array.from({ length: total }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`;

  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  function openSheet({ title = '', html = '', mount = null, close = true }) {
    sheetRoot.innerHTML = `<div class="overlay" data-action="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${title || close ? `<div class="sh-head">${close ? `<button class="icon-btn filled" data-action="closeSheet" aria-label="إغلاق">${ic('x')}</button>` : '<span></span>'}<h3>${title}</h3><span></span></div>` : ''}<div class="sh-body">${html}</div></div>`;
    requestAnimationFrame(() => { sheetRoot.querySelector('.overlay').classList.add('show'); sheetRoot.querySelector('.sheet').classList.add('show'); });
    if (mount) mount(sheetRoot.querySelector('.sheet'));
  }
  function closeSheet(instant) {
    const sh = sheetRoot.querySelector('.sheet'); if (!sh) return;
    if (instant) { sheetRoot.innerHTML = ''; return; }
    sh.classList.remove('show'); sheetRoot.querySelector('.overlay').classList.remove('show');
    setTimeout(() => { sheetRoot.innerHTML = ''; }, 280);
  }

  /* ================= أحداث عامة ================= */
  const ACTIONS = {};
  function onClick(e) {
    const el = e.target.closest('[data-go],[data-back],[data-action]');
    if (!el) return;
    if (el.dataset.go) { e.preventDefault(); go(el.dataset.go, { replace: !!el.dataset.replace }); return; }
    if (el.dataset.back) { e.preventDefault(); back(el.dataset.back); return; }
    const fn = ACTIONS[el.dataset.action]; if (fn) { e.preventDefault(); fn(el, e); }
  }
  app.addEventListener('click', onClick);
  sheetRoot.addEventListener('click', onClick);
  navRoot.addEventListener('click', onClick);
  ACTIONS.closeSheet = () => closeSheet();
  ACTIONS.demo = () => { seedDemo(); unlocked = true; track('demo_start'); go('/home', { replace: true }); toast('أهلًا أبو فيصل — هذا حساب تجريبي'); };
  // تصفّح التطبيق بدون تسجيل
  ACTIONS.guest = () => {
    if (!(S.user && S.user.guest)) { const ev = S.events; S = defaultState(); S.events = ev; }
    S.user = { guest: true }; S.passcode = null; S.reg = null; unlocked = true; track('guest_start'); save();
    closeSheet(true); go('/home', { replace: true }); toast('تقدر تتصفح التطبيق وتسجّل متى ما حبيت');
  };
  const skipBtn = (attr) => `<button class="skip" ${attr}>تخطي</button>`;

  /* ================= 1) البداية ================= */
  route('/splash', {
    blue: true, cls: 'splash',
    view: () => `<div class="splash-logo">${LOGO}<div class="wm"><b>سند</b><span>Sanad</span></div></div><div class="splash-note">مفهوم مقترح لأبيان المالية · نموذج أولي</div>`,
    mount: () => later(() => {
      if (!S.user) go('/welcome', { replace: true });
      else if (!unlocked && S.passcode) go('/lock', { replace: true });
      else go('/home', { replace: true });
    }, 1300),
  });

  route('/welcome', {
    view: () => `
      <svg class="hero-illus" viewBox="0 0 300 190" aria-hidden="true">
        <rect x="18" y="160" width="264" height="6" rx="3" fill="#DCE3EE"/>
        <rect x="200" y="78" width="70" height="80" rx="16" fill="#9FB3FB"/><text x="235" y="124" text-anchor="middle" font-size="15" font-weight="700" fill="#1E2580">٢٥٪</text>
        <rect x="115" y="30" width="70" height="128" rx="16" fill="#3A47E6"/><text x="150" y="100" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">٤٥٪</text>
        <rect x="30" y="66" width="70" height="92" rx="16" fill="#13A57A"/><text x="65" y="118" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">٣٠٪</text>
        <circle cx="150" cy="16" r="12" fill="#F2B544"/><text x="150" y="21" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">⁂</text>
        <text x="235" y="182" text-anchor="middle" font-size="12" fill="#6B7383">السيولة</text><text x="150" y="182" text-anchor="middle" font-size="12" fill="#6B7383">الدخل الثابت</text><text x="65" y="182" text-anchor="middle" font-size="12" fill="#6B7383">النمو</text>
      </svg>
      <h2 class="h2" style="font-size:28px">سند… دخلك الشهري بعد التقاعد</h2>
      <p class="sub">نحوّل مكافأة نهاية الخدمة ومدخراتك إلى دفعة شهرية ثابتة، بخطة متوافقة مع الشريعة.</p>
      <ul class="checks">
        <li>${ic('check')}خطة السلال الثلاث: سيولة، دخل ثابت، نمو</li>
        <li>${ic('check')}دفعة شهرية ثابتة يوم ${PAY_DAY} من كل شهر</li>
        <li>${ic('check')}مستشار آلي يوصلك لهدفك بحد مخاطر ${RISK_CAP}%</li>
      </ul>
      <div class="cta-bottom">
        <button class="btn" data-go="/register">إنشاء حساب</button>
        <button class="btn soft mt12" data-action="demo">تجربة سريعة بحساب أبو فيصل</button>
        ${S.user && S.passcode ? '<button class="btn soft mt12" data-go="/lock">تسجيل الدخول</button>' : ''}
        <button class="link center mt12" style="display:block;width:100%;padding:8px" data-action="guest">تصفّح التطبيق بدون تسجيل</button>
      </div>`,
  });

  /* ================= 2) التسجيل ================= */
  route('/register', {
    view: () => {
      const r = S.reg || {};
      return `${topbar(skipBtn('data-action="regSkip"'), '', '/welcome')}
      <h2 class="h2">إنشاء حساب</h2>
      <p class="sub mb16">أدخل بياناتك وبنرسل لك رمز تحقق على جوالك.</p>
      <label class="field"><span>رقم الهوية الوطنية / الإقامة</span><div class="input" id="f-nid"><input id="nid" type="tel" inputmode="numeric" placeholder="1XXXXXXXXX" maxlength="10" dir="ltr" style="text-align:right" value="${esc(r.nid || '')}" aria-label="رقم الهوية"/></div></label>
      <label class="field"><span>رقم الجوال</span><div class="input" id="f-phone"><input id="phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="5XXXXXXXX" maxlength="10" dir="ltr" style="text-align:right" value="${esc(r.phone || '')}"/><span class="prefix">+966</span></div></label>
      <label class="check mt8"><input type="checkbox" id="terms" ${r.terms ? 'checked' : ''}/><span>أوافق على الشروط والأحكام وسياسة الخصوصية، وأعرف أن هذا نموذج أولي لا يحفظ بياناتي خارج جهازي، ويجمع فقط إحصاءات استخدام مجهولة لتحسينه.</span></label>
      <div class="err-msg" id="err"></div>
      <div class="cta-bottom"><button class="btn" data-action="register">متابعة</button><button class="link center mt12" style="display:block;width:100%;padding:8px" data-action="guest">تصفّح التطبيق بدون تسجيل</button></div>`;
    },
    mount: (root) => { const n = root.querySelector('#nid'); if (!n.value) n.focus(); },
  });
  ACTIONS.register = () => {
    const nid = digits(document.getElementById('nid').value);
    let ph = digits(document.getElementById('phone').value);
    if (ph.startsWith('966')) ph = ph.slice(3);
    if (ph.startsWith('0')) ph = ph.slice(1);
    const terms = document.getElementById('terms').checked;
    const err = document.getElementById('err');
    document.getElementById('f-nid').classList.toggle('err', !/^[12]\d{9}$/.test(nid));
    document.getElementById('f-phone').classList.toggle('err', !/^5\d{8}$/.test(ph));
    if (!/^[12]\d{9}$/.test(nid)) { err.textContent = 'رقم الهوية لازم يتكون من 10 أرقام ويبدأ بـ 1 أو 2'; return; }
    if (!/^5\d{8}$/.test(ph)) { err.textContent = 'رقم الجوال لازم يبدأ بـ 5 ويتكون من 9 أرقام'; return; }
    if (!terms) { err.textContent = 'وافق على الشروط للمتابعة'; return; }
    S.reg = { nid, phone: ph, terms, code: String(1000 + Math.floor(Math.random() * 9000)) }; save();
    go('/otp');
  };
  // تخطي التسجيل: بدون جوال ما فيه رمز تحقق، فننتقل مباشرة لرمز المرور
  ACTIONS.regSkip = () => { S.reg = { nid: '', phone: '', terms: true, code: '', skipped: true }; track('step_skipped'); save(); go('/passcode'); };
  function finishReg(pc) {
    const keep = S.user && S.user.guest;
    S.user = { nid: (S.reg && S.reg.nid) || '', phone: (S.reg && S.reg.phone) || '' }; S.passcode = pc; S.reg = null;
    if (!keep) { S.plan = null; S.portfolios = []; S.history = []; S.simOffset = 0; }
    unlocked = true; track(pc ? 'register_done' : 'register_skipped'); save();
    go(S.plan ? '/home' : '/income', { replace: true }); toast('تم إنشاء حسابك');
  }

  route('/otp', {
    view: () => {
      if (!S.reg) { go('/register', { replace: true }); return null; }
      if (!S.reg.phone) { go('/passcode', { replace: true }); return null; }
      return `${topbar(skipBtn('data-go="/passcode" data-replace="1"'), '', '/register')}
      <div class="notif" id="notif" role="button" aria-label="تعبئة الرمز"><div class="av">${ic('user')}</div><div style="flex:1"><div class="t">سند <small>الآن</small></div><div class="m">من فضلك استخدم رمز التفعيل التجريبي ${S.reg.code} لتسجيل الدخول</div></div></div>
      <h2 class="q-title" style="margin-top:20px">ادخل رمز التحقق</h2>
      <p class="q-sub" style="margin-bottom:0">تم إرسال الرمز إلى <span dir="ltr">+966xxx${S.reg.phone.slice(-4)}</span></p>
      <div class="otp" id="otp"><b class="cur"></b><b></b><b></b><b></b><input id="otp-in" type="tel" inputmode="numeric" autocomplete="one-time-code" maxlength="4" aria-label="رمز التحقق"/></div>
      <p class="small center">اضغط على الإشعار لتعبئة الرمز تلقائيًا</p>
      <div class="cta-bottom"><button class="btn" id="resend" disabled>60</button></div>`;
    },
    mount: (root) => {
      const inp = root.querySelector('#otp-in'), boxes = root.querySelectorAll('.otp b');
      const paint = () => { const v = inp.value; boxes.forEach((b, i) => { b.textContent = v[i] || ''; b.classList.toggle('cur', i === Math.min(v.length, 3)); }); };
      const check = () => {
        if (inp.value.length < 4) return;
        if (inp.value === S.reg.code) { track('otp_ok'); go('/passcode', { replace: true }); }
        else { const o = root.querySelector('#otp'); o.classList.add('shake'); toast('الرمز غير صحيح'); later(() => { o.classList.remove('shake'); inp.value = ''; paint(); }, 450); }
      };
      inp.addEventListener('input', () => { inp.value = digits(inp.value).slice(0, 4); paint(); check(); });
      root.querySelector('#otp').addEventListener('click', () => inp.focus());
      const notif = root.querySelector('#notif');
      later(() => notif.classList.add('show'), 800);
      notif.addEventListener('click', () => { inp.value = S.reg.code; paint(); notif.classList.remove('show'); later(check, 350); });
      let s = 60; const btn = root.querySelector('#resend');
      const tick = () => { s -= 1; if (s <= 0) { btn.disabled = false; btn.className = 'btn soft'; btn.textContent = 'إعادة إرسال الرمز'; btn.onclick = () => { S.reg.code = String(1000 + Math.floor(Math.random() * 9000)); save(); render(); }; } else { btn.textContent = s; later(tick, 1000); } };
      later(tick, 1000);
      inp.focus();
    },
  });

  route('/passcode', {
    view: () => {
      if (!S.reg) { go('/register', { replace: true }); return null; }
      return `${topbar(skipBtn('data-action="pcSkip"'), '', '/register')}<div class="lock-head">${ic('lock')}</div><h2 class="q-title" id="pc-t">أنشئ رمز المرور</h2><p class="q-sub" id="pc-s" style="margin:0">6 أرقام تستخدمها لفتح التطبيق</p><div id="pc-d">${dots(0)}</div>${keypad()}`;
    },
    mount: (root) => {
      let first = '', cur = '';
      const paint = () => { root.querySelector('#pc-d').innerHTML = dots(cur.length); };
      mountKeypad(root, (k) => {
        if (k === 'del') cur = cur.slice(0, -1); else if (cur.length < 6) cur += k;
        paint();
        if (cur.length === 6) later(() => {
          if (!first) { first = cur; cur = ''; root.querySelector('#pc-t').textContent = 'أكّد رمز المرور'; root.querySelector('#pc-s').textContent = 'أعد إدخال الرمز نفسه'; paint(); return; }
          if (cur === first) finishReg(cur);
          else {
            const d = root.querySelector('.dots'); d.classList.add('shake'); toast('الرمزان غير متطابقين، حاول مرة ثانية');
            first = ''; cur = ''; later(() => { root.querySelector('#pc-t').textContent = 'أنشئ رمز المرور'; root.querySelector('#pc-s').textContent = '6 أرقام تستخدمها لفتح التطبيق'; paint(); }, 450);
          }
        }, 150);
      });
    },
  });

  ACTIONS.pcSkip = () => { if (!S.reg) S.reg = { skipped: true }; track('step_skipped'); finishReg(null); };

  route('/lock', {
    view: () => {
      if (!S.user) { go('/welcome', { replace: true }); return null; }
      if (!S.passcode) { unlocked = true; go(S.plan ? '/home' : '/income', { replace: true }); return null; }
      return `<header class="topbar"><span></span><h1></h1><span></span></header>
      <div class="lock-head">${ic('lock')}</div><h2 class="q-title">أدخل رمز المرور</h2>
      <div id="lk-d">${dots(0)}</div>
      ${S.user.demo ? '<p class="hint">رمز حساب التجربة: 111111</p>' : ''}
      ${keypad()}
      <div class="cta-bottom center" style="background:none"><button class="link" data-action="lockHelp" style="font-size:17px">لا تستطيع تسجيل الدخول؟</button></div>`;
    },
    mount: (root) => {
      let cur = '';
      const paint = () => { root.querySelector('#lk-d').innerHTML = dots(cur.length); };
      mountKeypad(root, (k) => {
        if (k === 'del') cur = cur.slice(0, -1); else if (cur.length < 6) cur += k;
        paint();
        if (cur.length === 6) later(() => {
          if (cur === S.passcode) { unlocked = true; track('unlock'); go(S.plan ? '/home' : '/income', { replace: true }); }
          else { root.querySelector('.dots').classList.add('shake'); cur = ''; later(paint, 420); }
        }, 120);
      });
    },
  });
  ACTIONS.lockHelp = () => openSheet({
    title: 'المساعدة في الدخول',
    html: `<p class="sub mb16">هذا نموذج أولي. تقدر تبدأ من جديد أو تدخل بحساب التجربة.</p>
      <button class="btn soft" data-action="demo">الدخول بحساب أبو فيصل التجريبي</button>
      <button class="btn tint mt12" data-action="resetAll">إعادة ضبط التجربة</button>`,
  });
  ACTIONS.resetAll = () => { const ev = S.events; S = defaultState(); S.events = ev; save(); unlocked = false; closeSheet(true); go('/welcome', { replace: true }); toast('تمت إعادة الضبط'); };

  /* ================= 3) إعداد الدخل ================= */
  const QS = [
    { k: 'hasIncome', type: 'yn', title: 'هل لديك دخل منتظم؟', sub: 'مثال: معاش تقاعدي شهري' },
    { k: 'pension', type: 'amount', title: 'كم معاشك الشهري؟', sub: 'نستخدمه عشان نحسب دخلك الكلي بعد الخطة', min: 1000, max: 40000, step: 500, chips: [5000, 9000, 15000], skip: (d) => !d.hasIncome },
    { k: 'savings', type: 'amount', title: 'كم المبلغ اللي تبي تستثمره؟', sub: 'مكافأة نهاية الخدمة أو مدخراتك', min: 10000, max: 3000000, step: 10000, chips: [250000, 500000, 1000000] },
    { k: 'target', type: 'amount', title: 'كم تحتاج دخل إضافي كل شهر؟', sub: 'فوق معاشك التقاعدي', min: 500, max: 20000, step: 100, chips: [1500, 2500, 4000] },
    { k: 'auto', type: 'auto', title: 'تبي استقطاع شهري؟', sub: `اختياري: نودع مبلغ ثابت من حسابك يوم ${PAY_DAY} من كل شهر عشان تكبر خطتك`, amtKey: 'autoAmt', min: 100, max: 20000, step: 100, chips: [500, 1000, 2000] },
    { k: 'risk', type: 'risk', title: 'كيف تصف تقبّلك للمخاطر؟', sub: `نختار لك من أنواع الاستثمار المناسبة لوصفك، بحد أقصى ${RISK_CAP}% مخاطر على رأس المال خلال 12 شهر` },
  ];
  const draft = () => {
    const d = S.draft || (S.draft = { hasIncome: null, pension: 9000, savings: 500000, target: 2500, auto: null, autoAmt: 1000, risk: null, over: false });
    if (d.autoAmt == null) d.autoAmt = 1000;
    return d;
  };

  route('/income', {
    auth: true,
    view: () => `<header class="topbar"><button class="icon-btn filled" data-back="/home" aria-label="إغلاق">${ic('x')}</button><h1>${skipBtn('data-go="/home" data-replace="1"')}</h1><span></span></header>
      <div class="steps-band" aria-hidden="true"><div class="glow"></div><div class="line" style="left:120px;right:50%"></div><div class="line" style="left:50%;right:120px;background:#D9E6F8"></div><div class="tri"></div><div class="p c">${ic('target')}</div><div class="p b">01</div><div class="p a">02</div></div>
      <h2 class="q-title" style="font-size:32px">إعداد الدخل</h2>
      <p class="sub center" style="font-size:18px;line-height:1.9">سواء عندك هدف محدد أو لا، بنساعدك تبني خطة دخل شهري تناسبك، متوافقة مع الشريعة.</p>
      <div class="info-box mt24" style="margin-inline:16px"><div class="icon-circle" style="width:44px;height:44px;background:#CFE1FF"><b style="font-size:20px">!</b></div><span>لخطة تناسب وضعك المالي، أجب على الأسئلة التالية بدقة</span></div>
      <div class="cta-bottom"><button class="btn" data-action="incomeStart">ابدأ</button></div>`,
  });
  ACTIONS.incomeStart = () => { draft(); save(); track('income_start'); go('/income/q/1'); };

  function seg(i) { return `<div class="seg">${QS.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>`; }
  function nextQ(i) {
    const d = draft(); let n = i + 1;
    while (n < QS.length && QS[n].skip && QS[n].skip(d)) n += 1;
    if (n >= QS.length) d.over = false;
    save();
    go(n >= QS.length ? '/income/result' : `/income/q/${n + 1}`);
  }
  route('/income/q/:n', {
    auth: true,
    view: ({ n }) => {
      const i = clamp(parseInt(n, 10) - 1, 0, QS.length - 1), q = QS[i], d = draft();
      // ترتيب الأزرار: السهم يمين و X يسار كما في التطبيق
      const top = `<header class="topbar"><button class="icon-btn" data-back="/income" aria-label="رجوع">${ic('arrowR')}</button><h1>${skipBtn(`data-action="skipQ" data-i="${i}"`)}</h1><button class="icon-btn filled end" data-go="/home" data-replace="1" aria-label="إغلاق">${ic('x')}</button></header>`;
      const slider = (key) => { const v = d[key]; return `<div class="amount-big" id="amt">${money(v, 0)}</div>
          <input type="range" id="rng" min="${q.min}" max="${q.max}" step="${q.step}" value="${v}" aria-label="${q.title}"/>
          <div class="chips">${q.chips.map((c) => `<button class="chip ${c === v ? 'on' : ''}" data-chip="${c}">${fmt(c)}</button>`).join('')}<button class="chip" data-action="typeAmount" data-i="${i}">${ic('pencil')}</button></div>`; };
      let body = '';
      if (q.type === 'yn') {
        body = [['نعم', true], ['لا', false]].map(([l, v]) => `<button class="opt center ${d.hasIncome === v ? 'selected' : ''}" data-action="ans" data-i="${i}" data-v="${v}">${l}</button>`).join('');
      } else if (q.type === 'amount') {
        body = `${slider(q.k)}
          ${q.k === 'target' ? `<p class="target-alert" id="tg-hint" hidden></p>` : ''}
          <div class="cta-bottom"><button class="btn" data-action="ansAmt" data-i="${i}">التالي</button></div>`;
      } else if (q.type === 'auto') {
        body = `<button class="opt ${d.auto === true ? 'selected' : ''}" data-action="autoPick" data-v="1">${ic('repeat')}<span class="grow">نعم، أبي استقطاع شهري</span></button>
          <button class="opt ${d.auto === false ? 'selected' : ''}" data-action="autoPick" data-v="0">${ic('x')}<span class="grow">لا، بدون استقطاع</span></button>
          ${d.auto ? `<p class="h3 center mt24">المبلغ الشهري المستقطع</p>${slider(q.amtKey)}` : ''}
          <div class="cta-bottom"><button class="btn" data-action="ansAmt" data-i="${i}" ${d.auto == null ? 'disabled' : ''}>التالي</button></div>`;
      } else if (q.type === 'risk') {
        body = Object.entries(RISK).map(([k, r]) => `<button class="opt ${d.risk === k ? 'selected' : ''}" data-action="ans" data-i="${i}" data-v="${k}">${ic(r.icon)}<span class="grow">${r.name}<div class="meta">${r.meta}</div><div class="opt-tags">${r.types.map((id) => `<span class="tag">${PORTS[id].name}</span>`).join('')}</div></span></button>`).join('');
      }
      return `${top}${seg(i)}<h2 class="q-title">${q.title}</h2><p class="q-sub">${q.sub}</p>${body}`;
    },
    mount: (root, { n }) => {
      const i = parseInt(n, 10) - 1, q = QS[i], rng = root.querySelector('#rng'); if (!q || !rng) return;
      const d = draft(), key = q.amtKey || q.k, amt = root.querySelector('#amt'), hint = root.querySelector('#tg-hint');
      const upd = (v) => {
        d[key] = v; amt.innerHTML = money(v, 0);
        root.querySelectorAll('[data-chip]').forEach((c) => c.classList.toggle('on', +c.dataset.chip === v));
        // الرسالة تظهر فقط إذا ما فيه أي توزيع بحد مخاطر 10% يوصل للمبلغ خلال 12 شهر
        if (hint) { const ok = reachable(d.savings, v); hint.hidden = ok; hint.textContent = ok ? '' : 'لكي تصل للمبلغ المستهدف يجب زيادة المبلغ أو زيادة المخاطر بعد الموافقة'; }
        save();
      };
      rng.addEventListener('input', () => upd(+rng.value));
      root.querySelectorAll('[data-chip]').forEach((c) => c.addEventListener('click', () => { rng.value = c.dataset.chip; upd(+c.dataset.chip); }));
      upd(+rng.value);
    },
  });
  ACTIONS.ans = (el) => {
    const i = +el.dataset.i, q = QS[i], d = draft();
    let v = el.dataset.v; if (q.type === 'yn') v = v === 'true';
    d[q.k] = v; if (q.k === 'hasIncome' && !v) d.pension = 0; if (q.k === 'hasIncome' && v && !d.pension) d.pension = 9000;
    el.parentElement.querySelectorAll('.opt').forEach((o) => o.classList.remove('selected')); el.classList.add('selected');
    later(() => nextQ(i), 220);
  };
  ACTIONS.ansAmt = (el) => nextQ(+el.dataset.i);
  ACTIONS.autoPick = (el) => { draft().auto = el.dataset.v === '1'; save(); render(); };
  // تخطي أي سؤال: نستخدم القيمة الافتراضية
  ACTIONS.skipQ = (el) => {
    const i = +el.dataset.i, q = QS[i], d = draft();
    if (q.type === 'yn' && d.hasIncome == null) d.hasIncome = true;
    if (q.type === 'auto' && d.auto == null) d.auto = false;
    if (q.type === 'risk' && !d.risk) d.risk = 'mid';
    track('step_skipped'); nextQ(i);
  };
  ACTIONS.typeAmount = (el) => {
    const i = +el.dataset.i, q = QS[i], d = draft(), key = q.amtKey || q.k;
    openSheet({
      title: q.type === 'auto' ? 'المبلغ الشهري المستقطع' : q.title,
      html: `<div class="input mt8"><input id="ta" type="tel" inputmode="numeric" value="${d[key]}" dir="ltr" style="text-align:right"/>${RIYAL}</div><p class="small mt8">من ${fmt(q.min)} إلى ${fmt(q.max)}</p><button class="btn mt16" id="ta-ok">تم</button>`,
      mount: (sh) => { const inp = sh.querySelector('#ta'); inp.focus(); inp.select(); sh.querySelector('#ta-ok').onclick = () => { d[key] = clamp(+digits(inp.value) || q.min, q.min, q.max); save(); closeSheet(true); render(); }; },
    });
  };

  route('/income/result', {
    auth: true,
    view: () => {
      if (!S.draft) { go('/income', { replace: true }); return null; }
      const d = draft(); if (!d.risk) d.risk = 'mid';
      const A = advise(d.savings, d.target, d.risk, d.over), mix = A.mix;
      d.advMix = mix; save();
      const p = { mode: 'auto', mix, balance: d.savings }, monthly = d.auto ? d.autoAmt : 0;
      const inc = income(p), cover = d.target ? inc / d.target * 100 : 100, full = inc >= d.target - 0.5, total = (d.pension || 0) + inc, L = mixLoss(mix);
      const need = d.target * 12 / Math.max(mixRate(mix) / 100, 1e-6);
      let alert = '';
      if (!A.ok && A.why === 'max') {
        alert = `<div class="big-warn">${ic('alert')}<div><p>حتى مع تقبّل مخاطر أعلى، أقصى دخل نقدر نوصله ${money(inc, 0)} شهريًا.</p><p class="sm">لتحقيق هدفك (${money(d.target, 0)}) زِد مبلغ الاستثمار إلى ${money(need, 0)} تقريبًا.</p><div class="btns"><button class="btn soft" data-action="backToCap">ارجع لحد المخاطر ${RISK_CAP}%</button></div></div></div>`;
      } else if (!A.ok) {
        const why = A.why === 'profile' ? `أنواع الاستثمار المناسبة لوصفك (${RISK[d.risk].name}) ما توصل للدخل المستهدف ضمن حد المخاطر ${RISK_CAP}%.` : `بسبب حد المخاطر ${RISK_CAP}% لم نستطع الوصول للدخل المستهدف.`;
        alert = `<div class="big-warn">${ic('alert')}<div><p>${why} يجب تقبّل مخاطر أعلى، أو تقبّل أقرب دخل للمطلوب: ${money(inc, 0)} شهريًا.</p><div class="btns"><button class="btn" data-action="acceptOver">تقبّل مخاطر أعلى</button><button class="btn soft" data-action="approvePlan">تقبّل الدخل الأقرب</button></div></div></div>`;
      } else if (d.over) {
        alert = `<div class="warn">${ic('alert')}<span>هذي الخطة فيها أنواع استثمار مخاطرها أعلى من وصفك، ومخاطر رأس المال ${fmt(L, 1)}% خلال 12 شهر${L > RISK_CAP ? ` (فوق حد ${RISK_CAP}%)` : ''}${needsAck(mix) ? '، وبنطلب منك توقيع إقرار المخاطر' : ''}. <button class="link" data-action="backToCap">ارجع للخطة ضمن حدودك</button></span></div>`;
      }
      return `${topbar('خطتك جاهزة', '', '/income')}
        <div class="res-head"><small>دخلك الشهري المتوقع</small><b>${money(inc)}</b><small>${A.ok ? 'يغطي هدفك بالكامل' : `من هدف ${money(d.target, 0)}`}</small></div>
        ${alert}
        <div class="card mt16"><div class="chart-head"><b>قيمة استثمارك خلال 15 سنة</b>${reinvToggle('reinv')}</div><div id="proj" class="mt12">${projHTML(d.savings, mix, monthly)}</div></div>
        <div class="card">
          <div class="row between"><b>تغطية هدفك (${money(d.target, 0)})</b><b class="${full ? 'pos' : ''}">${full ? fmt(Math.min(cover, 999)) : fmt(Math.min(cover, 99.9), 1)}%</b></div>
          <div class="bar mt12 ${full ? 'green' : ''}"><i style="width:${Math.min(cover, 100)}%"></i></div>
          <p class="small mt12">${full ? 'خطتك تغطي هدفك الشهري بالكامل.' : `لتغطية هدفك بالكامل بنفس التوزيع تحتاج تستثمر تقريبًا ${money(need, 0)}.`}</p>
        </div>
        <div class="card"><div class="row between"><span>دخلك الكلي مع المعاش</span><b>${money(total, 0)}</b></div>
          <div class="row between mt8"><span class="small">المبلغ المستثمر</span><span class="small">${money(d.savings, 0)}</span></div>
          <div class="row between mt8"><span class="small">موعد الدفعة</span><span class="small">يوم ${PAY_DAY} من كل شهر</span></div>
          <div class="row between mt8"><span class="small">الاستقطاع الشهري</span><span class="small">${monthly ? money(monthly, 0) : 'بدون'}</span></div>
          <div class="row between mt8"><span class="small">مخاطر رأس المال خلال 12 شهر</span><span class="small ${L > RISK_CAP ? 'neg' : ''}">${fmt(L, 1)}% (الحد ${RISK_CAP}%)</span></div></div>
        <p class="small mt12">الأرقام تقديرية بعائد متوقع توضيحي ${fmt(mixRate(mix), 2)}% سنويًا (توزيعات + نمو) قبل رسوم الإدارة، وليست ضمانًا للعائد.</p>
        <div class="cta-bottom">
          <button class="btn" data-action="approvePlan">اعتماد الخطة</button>
          <button class="btn soft mt12" data-action="designOwn">${ic('pencil')}صمّم خطتك بنفسك</button>
          <button class="link center mt12" style="display:block;width:100%;padding:8px" data-go="/income/q/1">تعديل الإجابات</button>
        </div>`;
    },
    mount: (root) => bindReinv(root, '#reinv', () => { const d = draft(); root.querySelector('#proj').innerHTML = projHTML(d.savings, d.advMix, d.auto ? d.autoAmt : 0); }),
  });
  function bindReinv(root, sel, repaint) {
    const t = root.querySelector(sel); if (!t) return;
    t.addEventListener('change', () => { REINV = t.checked; track('reinvest_toggle'); repaint(); });
  }
  ACTIONS.acceptOver = () => { draft().over = true; track('accept_over'); save(); render(); };
  ACTIONS.backToCap = () => { draft().over = false; save(); render(); };
  function createPlan(extra, ack) {
    const d = draft();
    S.plan = Object.assign({ pension: d.pension || 0, savings: d.savings, target: d.target, risk: d.risk, payDay: PAY_DAY, dest: 'bank', paused: false, ack: !!ack, ackDate: ack ? new Date().toISOString() : null, balance: d.savings, funded: false, payLater: false, createdAt: new Date().toISOString() }, extra);
    S.auto = S.auto || {};
    if (d.auto) S.auto.sanad = { amount: d.autoAmt, day: PAY_DAY }; else delete S.auto.sanad;
    S.history = []; S.simOffset = 0; track('plan_approved'); save();
    closeSheet(true); go('/deposit/sanad?first=1');
  }
  ACTIONS.approvePlan = () => {
    const d = draft(), mix = { ...(d.advMix || advise(d.savings, d.target, d.risk || 'mid', d.over).mix) }, L = mixLoss(mix);
    const done = () => createPlan({ mode: 'auto', mix }, needsAck(mix));
    if (needsAck(mix)) ackSheet(done, L > RISK_CAP ? 'over' : 'custom', L > RISK_CAP ? L : highShare({ mode: 'custom', mix })); else done();
  };
  ACTIONS.designOwn = () => { const d = draft(); S.mixDraft = { ...(d.advMix || advise(d.savings, d.target, d.risk || 'mid', d.over).mix) }; save(); track('custom_start'); go('/income/custom'); };

  function ackSheet(onOk, kind = 'growth', share = 0) {
    const custom = kind !== 'growth';
    const over = kind === 'over' || (custom && share > 30);
    openSheet({
      title: 'إقرار المخاطر',
      html: `<div class="success-ic" style="background:#FFF4E5;color:#B7791F">${ic('alert')}</div>
        <p class="sub mb16 center">${kind === 'over' ? `أقصى انخفاض متوقع لخطتك خلال 12 شهر ${fmt(share, 1)}%، وهذا أعلى من الحد ${RISK_CAP}%.` : custom ? `خطتك فيها محافظ مخاطرها أعلى بنسبة ${share}%.` : `سلة النمو فوق ${ACK_LIMIT}% تعني مخاطر أعلى.`} قبل المتابعة، اقرأ النقاط التالية:</p>
        <ul class="checks" style="margin:0 0 16px">
          <li style="align-items:flex-start">${ic('check')}<span>${custom ? 'محافظ الأسهم والمتنوعة (نمو) والمستقبل قيمتها قد تنخفض بشكل كبير' : 'قيمة الأسهم وصناديق الريت قد تنخفض'}، والدفعة الشهرية قد تتغير.</span></li>
          <li style="align-items:flex-start">${ic('check')}<span>${custom ? 'نوصي المتقاعد ألا تتجاوز المحافظ عالية المخاطر 30% من خطته.' : 'الحد الأعلى لسلة النمو 30% من الخطة لحمايتك.'}</span></li>
          <li style="align-items:flex-start">${ic('check')}<span>رسوم إدارة الجزء عالي المخاطر أعلى (${fmt(FEE.growthHigh * 100, 1)}% سنويًا بدل ${fmt(FEE.base * 100, 1)}%).</span></li>
        </ul>
        <div class="card mb16"><div class="row between"><span class="small">تقييم الملاءمة</span><b class="${over ? '' : 'pos'}" style="${over ? 'color:#B7791F' : ''}">${over ? 'أعلى من الموصى به' : 'مناسب'}</b></div><p class="small mt8">${kind === 'over' ? `تجاوزت حد المخاطر ${RISK_CAP}% للوصول لدخلك المستهدف، ورأس مالك معرّض لانخفاض أكبر.` : over ? 'نسبة المحافظ عالية المخاطر أعلى من 30%، فكّر في تخفيضها لحماية دخلك.' : 'مدة استثمار طويلة، ومعاش منتظم يغطي المصاريف الأساسية.'}</p></div>
        <label class="check"><input type="checkbox" id="ack"/><span>أقر بأنني اطلعت على المخاطر والرسوم، وأرغب في المتابعة.</span></label>
        <button class="btn mt16" id="ack-ok" disabled>توقيع الإقرار والمتابعة</button>`,
      mount: (sh) => { const c = sh.querySelector('#ack'), b = sh.querySelector('#ack-ok'); c.addEventListener('change', () => (b.disabled = !c.checked)); b.addEventListener('click', () => { track('ack_signed'); onOk(); }); },
    });
  }

  /* ===== صمّم خطتك بنفسك: يختار أنواع المحافظ ووزن كل نوع ===== */
  const mixBar = (mix) => `<div class="mix-bar">${MIX_ORDER.filter((id) => mix[id] > 0).map((id) => `<i style="width:${mix[id]}%;background:${PORTS[id].hex}" title="${PORTS[id].name}"></i>`).join('')}</div>`;
  route('/income/custom', {
    auth: true,
    view: (_, q) => {
      const fromEdit = q.get('from') === 'edit';
      if (fromEdit && !S.plan) { go('/income', { replace: true }); return null; }
      if (!fromEdit && (!S.draft || !S.draft.risk)) { go('/income/q/1', { replace: true }); return null; }
      if (!S.mixDraft) S.mixDraft = { ...(fromEdit ? planMix(S.plan) : (S.draft.advMix || advise(S.draft.savings, S.draft.target, S.draft.risk, false).mix)) };
      return `${topbar('صمّم خطتك بنفسك', '', fromEdit ? '/plan/edit' : '/income/result')}
        <p class="sub">اختر أنواع المحافظ اللي تبيها في محفظة تقاعدك، وحدد وزن كل نوع. لازم يكون المجموع 100%.</p>
        <div class="card mt16"><div class="row between"><b>توزيع محفظتك</b><b id="mx-sum"></b></div><div id="mx-bar" class="mt12"></div>
          <div class="chips" style="justify-content:flex-start;margin-top:14px"><button class="chip" data-mx="equal">وزّع بالتساوي</button><button class="chip" data-mx="reset">ارجع للخطة المقترحة</button><button class="chip" data-mx="clear">ابدأ من الصفر</button></div></div>
        <div class="card mt16"><div class="chart-head"><b>قيمة استثمارك خلال 15 سنة</b>${reinvToggle('mx-reinv')}</div><div id="mx-proj" class="mt12"></div></div>
        <div class="mix-list mt16">${MIX_ORDER.map((id) => { const p = PORTS[id]; return `<div class="mix-row" data-id="${id}">${iconCircle(p)}<div class="grow"><b>${p.name}${HIGH_RISK.includes(id) ? ' <span class="badge-warn">مخاطر أعلى</span>' : ''}</b><small>عائد متوقع ${fmt(p.rate, 1)}% · انخفاض محتمل ${fmt(ADV[id].loss, 1)}%</small></div><div class="stepper"><button data-step="5" aria-label="زيادة">${ic('plus')}</button><span class="w"></span><button data-step="-5" aria-label="تقليل"><svg class="ic" viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button></div></div>`; }).join('')}</div>
        <div class="preview">
          <div class="row between"><span>دخلك الشهري المتوقع</span><b id="mx-inc"></b></div>
          <div class="row between mt8 small"><span>درجة المخاطر</span><span id="mx-risk"></span></div>
          <div class="warn mt8" id="mx-warn" hidden>${ic('alert')}<span id="mx-warn-t"></span></div>
          <button class="btn mt12" id="mx-ok" disabled>اعتماد خطتي</button>
        </div>`;
    },
    mount: (root, _, q) => {
      const fromEdit = q.get('from') === 'edit', B = S.mixDraft, $ = (s) => root.querySelector(s);
      const bal = fromEdit ? S.plan.balance : S.draft.savings;
      const monthly = fromEdit ? ((S.auto && S.auto.sanad && S.auto.sanad.amount) || 0) : (S.draft.auto ? S.draft.autoAmt : 0);
      const sum = () => MIX_ORDER.reduce((s, id) => s + (B[id] || 0), 0);
      const pseudo = () => ({ mode: 'custom', mix: B, balance: bal });
      const paintProj = () => { $('#mx-proj').innerHTML = sum() === 100 ? projHTML(bal, cleanMix(B), monthly) : '<p class="small center" style="padding:24px 0">أكمل التوزيع إلى 100% عشان يظهر الرسم</p>'; };
      bindReinv(root, '#mx-reinv', paintProj);
      const paint = () => {
        const t = sum(), pp = pseudo();
        root.querySelectorAll('.mix-row').forEach((r) => { const w = B[r.dataset.id] || 0; r.querySelector('.w').textContent = w + '%'; r.classList.toggle('on', w > 0); });
        $('#mx-bar').innerHTML = mixBar(B);
        $('#mx-sum').textContent = `المجموع ${t}%`; $('#mx-sum').className = t === 100 ? 'pos' : 'neg';
        $('#mx-inc').innerHTML = money(income(pp, {}, bal));
        $('#mx-risk').textContent = t ? riskLabel(pp) : '—';
        paintProj();
        const h = highShare(pp), L = mixLoss(B);
        const msg = t !== 100 ? (t > 100 ? 'المجموع أكثر من 100%، قلّل بعض الأوزان.' : `باقي ${100 - t}% توزعه على المحافظ.`) : L > RISK_CAP ? `مخاطر رأس المال ${fmt(L, 1)}% خلال 12 شهر، أعلى من الحد ${RISK_CAP}%، وبنطلب منك توقيع إقرار.` : h > 30 ? `المحافظ عالية المخاطر ${h}% من خطتك، والموصى به للمتقاعد ألا تتجاوز 30%.` : h > 0 ? 'خطتك فيها محافظ عالية المخاطر، وبنطلب منك توقيع إقرار.' : '';
        $('#mx-warn').hidden = !msg; $('#mx-warn-t').textContent = msg;
        $('#mx-ok').disabled = t !== 100;
        save();
      };
      root.querySelectorAll('.mix-row [data-step]').forEach((b) => b.addEventListener('click', () => {
        const id = b.closest('.mix-row').dataset.id, step = +b.dataset.step, cur = B[id] || 0;
        if (step > 0 && sum() >= 100) { toast('المجموع وصل 100%، قلّل نوع ثاني أول'); return; }
        B[id] = clamp(cur + step, 0, 100); paint();
      }));
      root.querySelectorAll('[data-mx]').forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.mx;
        if (k === 'clear') MIX_ORDER.forEach((id) => (B[id] = 0));
        if (k === 'reset') { const m = fromEdit ? planMix(S.plan) : (S.draft.advMix || {}); MIX_ORDER.forEach((id) => (B[id] = m[id] || 0)); }
        if (k === 'equal') {
          let ids = MIX_ORDER.filter((id) => B[id] > 0); if (!ids.length) ids = ['saving', 'corp-sukuk', 'dividends', 'reit'];
          const base = Math.floor(100 / ids.length / 5) * 5; let rest = 100 - base * ids.length;
          MIX_ORDER.forEach((id) => (B[id] = 0)); ids.forEach((id) => { B[id] = base + (rest > 0 ? 5 : 0); rest -= 5; });
        }
        paint();
      }));
      $('#mx-ok').addEventListener('click', () => {
        const mix = {}; MIX_ORDER.forEach((id) => { if (B[id] > 0) mix[id] = B[id]; });
        const h = highShare({ mode: 'custom', mix }), L = mixLoss(mix), need = needsAck(mix);
        const done = () => {
          if (fromEdit) {
            Object.assign(S.plan, { mode: 'custom', mix }); if (need) { S.plan.ack = true; S.plan.ackDate = new Date().toISOString(); }
            S.mixDraft = null; track('plan_edit_saved'); save(); closeSheet(true); go(S.plan.funded ? '/payments' : '/home', { replace: true }); toast('تم تحديث محفظة تقاعدك');
          } else { S.mixDraft = null; createPlan({ mode: 'custom', mix, risk: 'custom' }, need); }
        };
        const covered = fromEdit && S.plan.ack && (S.plan.mode || 'preset') !== 'preset' && highShare(S.plan) >= h && mixLoss(S.plan.mix || {}) >= L;
        if (need && !covered) ackSheet(done, L > RISK_CAP ? 'over' : 'custom', L > RISK_CAP ? L : h); else done();
      });
      paint();
    },
  });

  /* ================= 4) الرئيسية ================= */
  const SANAD_FAQ = [
    ['كيف تُحسب دفعتي الشهرية؟', 'نجمع العوائد المتوقعة من السلال الثلاث: أرباح المرابحة، وعوائد الصكوك، وتوزيعات الأسهم والريت، ثم نقسمها على 12 شهرًا.'],
    ['وش يصير لو انخفض السوق؟', 'سلة السيولة تغطي احتياجك القريب، والصكوك نحتفظ فيها حتى الاستحقاق، ونعيد التوازن دوريًا. الدفعة قد تتغير لكن رأس مالك موزع لتقليل الأثر.'],
    ['أقدر أوقف الدفعات أو أغيّر يومها؟', 'نعم، من تعديل الخطة تقدر توقف الدفعات مؤقتًا، أو تغيّر يومها، أو تخليها يُعاد استثمارها.'],
    ['ليش أوقع إقرار لسلة النمو؟', 'لأن سلة النمو فيها أسهم وصناديق ريت قيمتها تتذبذب، فنتأكد إنك مطّلع على المخاطر قبل رفعها فوق 25%.'],
    ['هل خطة سند متوافقة مع الشريعة؟', 'كل الأدوات في السلال الثلاث تُعرض على اللجنة الشرعية قبل اعتمادها.'],
  ];
  function faqBlock(items) {
    return `<div class="faq"><h3>الأسئلة الشائعة</h3>${items.map(([q, a]) => `<details><summary><span>${q}</span>${ic('chevD')}</summary><p>${a}</p></details>`).join('')}</div>`;
  }
  const shariaCard = () => `<h3 class="h3 mt16" style="font-size:19px">اللجنة الشرعية</h3><div class="sharia"><div class="icon-circle">${ic('shield')}</div><div><b>معتمدة من اللجنة الشرعية</b><p class="small" style="margin:4px 0 0">تُراجع جميع المحافظ والسلال قبل طرحها، وتُحدَّث بشكل دوري.</p></div></div>`;
  function moreSection(faq) {
    return `<div class="more-toggle"><button data-action="toggleMore"><span>عرض المزيد</span>${ic('chevD')}</button></div><div id="more" hidden>${shariaCard()}${faqBlock(faq)}</div>`;
  }
  ACTIONS.toggleMore = (el) => {
    const m = document.getElementById('more'); m.hidden = !m.hidden;
    el.innerHTML = `<span>${m.hidden ? 'عرض المزيد' : 'إخفاء المزيد'}</span>${ic(m.hidden ? 'chevD' : 'chevU')}`;
    if (!m.hidden) m.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function otherPortfolios() {
    if (!S.portfolios.length) return '';
    return `<h3 class="h3 mt24">محافظك الأخرى</h3>${S.portfolios.map((x) => { const p = PORTS[x.id]; return `<button class="mini-pf" data-go="/portfolio/${x.id}">${iconCircle(p)}<div class="grow"><b>محفظة ${p.name}</b><small>${money(x.balance)}</small></div>${ic('chevL')}</button>`; }).join('')}`;
  }

  /* ===== اقتراحات لتحسين المحفظة ===== */
  let BEST_MIX = null;
  function suggestions(p) {
    const out = [], mix = planMix(p), bal = p.funded ? p.balance : p.savings, pp = { ...p, balance: bal };
    const inc = income(pp), L = mixLoss(mix), Y = mixRate(mix) / 100, auto = S.auto && S.auto.sanad;
    if (p.target && inc < p.target - 0.5) {
      const need = Math.max(0, p.target * 12 / Math.max(Y, 1e-6) - bal);
      out.push({ ic: 'target', t: 'دخلك المتوقع أقل من هدفك', d: `ينقصك ${money(p.target - inc, 0)} شهريًا. أضف ${money(need, 0)} تقريبًا لخطتك، أو تقبّل مخاطر أعلى.`, l: 'إضافة مبلغ', a: 'data-go="/deposit/sanad"' });
    }
    if (L > RISK_CAP) out.push({ ic: 'alert', t: 'مخاطر محفظتك أعلى من الحد', d: `أقصى انخفاض متوقع ${fmt(L, 1)}% خلال 12 شهر، والحد الموصى ${RISK_CAP}%. خفّف أوزان المحافظ عالية المخاطر.`, l: 'تعديل الأوزان', a: 'data-action="editMix"' });
    BEST_MIX = edge(ADV_ALL, (m) => mixLoss(m) <= Math.max(L, 0.5) + 1e-9, 0);
    if (BEST_MIX && mixRate(BEST_MIX) - mixRate(mix) > 0.1) {
      out.push({ ic: 'trend', t: 'دخل أعلى بنفس المخاطر', d: `بتوزيع مختلف تقدر ترفع دخلك إلى ${money(bal * mixRate(BEST_MIX) / 100 / 12, 0)} شهريًا بدون ما تزيد مخاطرك (${fmt(L, 1)}%).`, l: 'شوف التوزيع المقترح', a: 'data-action="tryBest"' });
    }
    if ((mix.saving || 0) < 10) out.push({ ic: 'wallet', t: 'ارفع السيولة للطوارئ', d: 'نوصي إن 10% على الأقل من خطتك تكون في الادخار عشان تغطي أي مصروف مفاجئ بدون ما تبيع وقت النزول.', l: 'تعديل الأوزان', a: 'data-action="editMix"' });
    if (!auto) {
      const pr = project(bal, Y, 1000);
      out.push({ ic: 'repeat', t: 'فعّل الاستقطاع الشهري', d: `استقطاع ${money(1000, 0)} شهريًا يرفع قيمة محفظتك بعد 15 سنة إلى ${money(pr.val[15], 0)} تقريبًا، ويكبر دخلك مع الوقت.`, l: 'تفعيل الاستقطاع', a: 'data-action="autoDep" data-id="sanad"' });
    }
    if (p.funded && p.dest === 'bank' && p.target && inc > p.target * 1.05) out.push({ ic: 'refresh', t: 'دخلك أعلى من هدفك', d: `عندك فائض ${money(inc - p.target, 0)} شهريًا. تقدر تعيد استثماره عشان تكبر خطتك.`, l: 'تعديل الخطة', a: 'data-go="/plan/edit"' });
    out.push({ ic: 'landmark', t: 'فرصة صكوك شركات', d: `صكوك بعائد ثابت يصل إلى ${fmt(Math.max(...SUKUK.map((o) => o.rate)), 1)}% وتوزيعات دورية، مخاطرها منخفضة وتناسب دخل التقاعد.`, l: 'استعرض الفرص', a: 'data-go="/portfolio/corp-sukuk"' });
    return out.slice(0, 3);
  }
  ACTIONS.tryBest = () => { if (!BEST_MIX || !S.plan) return; S.mixDraft = cleanMix(BEST_MIX); save(); track('suggestion_best'); go('/income/custom?from=edit'); };

  /* ===== مقارنة مع المشابهين: العمر والمبلغ ونوع المخاطر (أداء توضيحي لآخر 12 شهر) ===== */
  function benchmarkCard(p) {
    const mix = planMix(p), bal = p.funded ? p.balance : p.savings, L = mixLoss(mix);
    const band = RISK[p.risk] ? p.risk : L <= 5 ? 'low' : L <= RISK_CAP ? 'mid' : 'high';
    const peer = { low: [5.4, 0.0012], mid: [6.3, 0.0022], high: [7.2, 0.0045] }[band];
    const amt = bal < 250000 ? 'أقل من 250 ألف' : bal < 1000000 ? 'من 250 ألف إلى مليون' : 'أكثر من مليون';
    const key = MIX_ORDER.filter((id) => mix[id]).map((id) => id + mix[id]).join('');
    const norm = (v) => { const s = v.slice(-253); return s.filter((_, i) => i % 21 === 0).map((x) => x / s[0] * 100); };
    const me = norm(series('me-' + key, mixRate(mix), 0.001 + L / 100 * 0.025)), pe = norm(series('peer-' + band, peer[0], peer[1]));
    const r1 = me[me.length - 1] - 100, r2 = pe[pe.length - 1] - 100, diff = r1 - r2;
    const pct = (v) => `<span dir="ltr">${v >= 0 ? '+' : ''}${fmt(v, 1)}%</span>`;
    return `<h3 class="h3 mt24">مقارنتك مع المشابهين لك</h3>
      <div class="card"><div class="peer-tags"><span class="tag">العمر 60–65</span><span class="tag">المبلغ ${amt}</span><span class="tag">مخاطر ${RISK[band].name}</span></div>
        <div class="mt12">${lineChart([{ pts: pe, color: '#9AA3B2', dash: true, label: 'متوسط المشابهين لك (البنش مارك)' }, { pts: me, color: '#3A47E6', label: 'محفظتك' }], [[0, 'قبل سنة'], [6, 'قبل 6 أشهر'], [12, 'الآن']], { yFmt: (v) => `${v >= 100 ? '+' : ''}${fmt(v - 100, 1)}%`, label: 'أداء محفظتك مقابل المشابهين', h: 190 })}</div>
        <div class="row between mt12"><span class="small">محفظتك</span><b class="${r1 >= 0 ? 'pos' : 'neg'}">${pct(r1)}</b></div>
        <div class="row between mt8"><span class="small">متوسط المشابهين</span><b>${pct(r2)}</b></div>
        <p class="small mt8">${diff >= 0 ? `محفظتك أفضل من متوسط المشابهين لك بـ ${fmt(diff, 1)}% خلال آخر 12 شهر.` : `محفظتك أقل من متوسط المشابهين لك بـ ${fmt(Math.abs(diff), 1)}% خلال آخر 12 شهر. شوف الاقتراحات فوق.`} أرقام توضيحية.</p></div>`;
  }

  route('/home', {
    auth: true, nav: 'home',
    view: () => {
      const p = S.plan, u = S.user;
      const hi = u.name ? 'مرحبًا،' : 'مرحبًا بك في', nm = u.name ? esc(u.name) : 'سند';
      const head = `<div class="greet"><div><div class="hi">${hi}</div><div class="nm">${nm}</div></div><button class="pill-btn" data-go="/manage">${ic('pencil')}إدارة</button></div>`;
      const guest = u.guest ? `<div class="info-box mb16">${ic('user')}<span>أنت تتصفح كزائر. <button class="link" data-go="/register">أنشئ حسابك</button> عشان تحفظ خطتك.</span></div>` : '';
      if (!p) {
        return `${head}${guest}<div class="card empty-plan"><div class="icon-circle lg" style="margin:0 auto 14px">${ic('target')}</div><h3 class="h2">ابدأ خطة دخلك الشهري</h3><p class="sub">أجب على أسئلة بسيطة (تقدر تتخطاها)، والمستشار الآلي يبني لك خطة توصلك لهدفك.</p><button class="btn mt16" data-go="/income">إعداد الدخل</button></div>
          ${otherPortfolios()}<button class="btn tint mt16" data-go="/create">${ic('plus')}إنشاء محفظة</button>`;
      }
      const bal = p.funded ? p.balance : p.savings, inc = p.paused ? 0 : income({ ...p, balance: bal }), nd = nextPayDate(PAY_DAY);
      const top = p.funded
        ? `<div class="pf-hero">${p.paused ? 'دفعاتك متوقفة مؤقتًا' : 'دفعتك القادمة في الطريق!'}</div>
          <p class="pf-text">${p.paused ? 'تقدر تعيد تشغيل الدفعات من تعديل الخطة.' : `تستلم ${money(inc)} يوم ${fmtDate(nd)} ${p.dest === 'bank' ? 'في حسابك البنكي' : 'ويُعاد استثمارها في خطتك'}.`}</p>
          <button class="btn" data-go="/payments">${ic('calendar')}عرض الدفعات</button>`
        : `<div class="pf-hero">خطتك بانتظار السداد</div>
          <p class="pf-text">${p.payLater ? 'اخترت السداد لاحقًا. ' : ''}موّل خطتك عشان تبدأ تستلم ${money(inc)} يوم ${PAY_DAY} من كل شهر.</p>
          <button class="btn" data-go="/deposit/sanad?first=1">${ic('plus')}إيداع وتفعيل الخطة</button><button class="btn soft mt12" data-go="/plan/edit">${ic('pencil')}تعديل الخطة</button>`;
      return `${head}${guest}
        <div class="pf-head"><div class="icon-circle lg solid" style="border-radius:50%">${ic('shield')}</div><div><div class="name">محفظة التقاعد <span class="badge-soft">${modeBadge(p)}</span></div>${p.funded ? `<a class="link" data-go="/stats/sanad">احصائيات الخطة ${ic('chevL')}</a>` : '<span class="small">بانتظار السداد</span>'}</div></div>
        ${top}
        <h3 class="h3 mt24">اقتراحات لتحسين محفظتك</h3>
        ${suggestions(p).map((s) => `<div class="sugg"><div class="icon-circle">${ic(s.ic)}</div><div class="grow"><b>${s.t}</b><p>${s.d}</p><button class="link" ${s.a}>${s.l} ${ic('chevL')}</button></div></div>`).join('')}
        ${benchmarkCard(p)}
        ${otherPortfolios()}
        <button class="btn soft mt16" data-go="/create">${ic('plus')}إنشاء محفظة</button>
        ${moreSection(SANAD_FAQ)}`;
    },
  });

  /* ================= 5) عرض الدفعات ================= */
  route('/payments', {
    auth: true,
    view: () => {
      const p = S.plan;
      if (!p || !p.funded) { go('/home', { replace: true }); return null; }
      const sp = split(p), cs = comps(p), inc = p.paused ? 0 : income(p), nd = nextPayDate(p.payDay), days = daysBetween(vToday(), nd);
      const received = S.history.reduce((s, h) => s + h.amount, 0);
      // الأشهر الـ 12 القادمة بشكل متتالٍ
      const months = []; let cursor = nd;
      for (let i = 0; i < 12; i++) { months.push(cursor); cursor = nextPayDate(p.payDay, cursor); }
      const mx = inc || 1;
      return `${topbar('عرض الدفعات')}
        <div class="hero-blue">
          <div class="lbl">${p.paused ? 'الدفعات متوقفة مؤقتًا' : 'الدفعة القادمة'}</div>
          <div class="amt">${money(inc)}</div>
          <div class="meta"><span>${ic('calendar')}${fmtDate(nd)}</span>${p.paused ? '' : `<span>${ic('clock')}بعد ${days} يوم</span>`}<span>${ic(p.dest === 'bank' ? 'bank' : 'refresh')}${p.dest === 'bank' ? 'تُودع في حسابك البنكي' : 'يُعاد استثمارها'}</span></div>
        </div>
        <div class="card mt16"><h3 class="h3">مصادر دفعتك</h3>
          ${cs.map((c) => `<div class="src"><i class="sw" style="width:12px;height:12px;border-radius:4px;background:${c.hex}"></i><div class="grow"><b>${c.name} <span class="small">${c.w}%</span></b><small>${c.src}</small></div><b>${money(p.paused ? 0 : sp[c.k])}</b></div>`).join('')}
        </div>
        <div class="card"><div class="row between"><span>إجمالي ما استلمته</span><b>${money(received)}</b></div><div class="row between mt8"><span class="small">عدد الدفعات</span><span class="small">${S.history.length}</span></div><div class="row between mt8"><span class="small">دخلك الكلي مع المعاش</span><span class="small">${money((p.pension || 0) + inc, 0)}</span></div></div>
        <div class="card"><div class="row between mb16"><h3 class="h3" style="margin:0">الدفعات خلال 12 شهر</h3><b>${money(inc * 12, 0)}</b></div>
          <div class="mini-bars">${months.map((d, i) => `<div><i class="${i === 0 ? 'on' : ''}" style="height:${p.paused ? 4 : Math.max(8, inc / mx * 92)}px"></i><span>${fmtMonth(d).slice(0, 3)}</span></div>`).join('')}</div></div>
        <h3 class="h3 mt24">جدول الدفعات</h3>
        <div class="sched">${months.slice(0, 6).map((d, i) => `<div class="it"><div class="d"><b>${fmtDate(d)}</b><small>${p.dest === 'bank' ? 'إلى حسابك البنكي' : 'إعادة استثمار'}</small></div><b>${money(inc)}</b><span class="status ${p.paused ? 'pause' : i === 0 ? 'next' : 'up'}">${p.paused ? 'متوقفة' : i === 0 ? 'القادمة' : 'مجدولة'}</span></div>`).join('')}</div>
        <h3 class="h3 mt24">سجل الدفعات</h3>
        ${S.history.length ? `<div class="sched">${S.history.slice().reverse().map((h) => `<div class="it"><div class="d"><b>${fmtDate(new Date(h.date))}</b><small>${h.dest === 'bank' ? 'أُودعت في حسابك البنكي' : 'أُعيد استثمارها'}</small></div><b>${money(h.amount)}</b><span class="status paid">تمت</span></div>`).join('')}</div>` : '<div class="card small center">ما فيه دفعات مستلمة للحين. أول دفعة بتوصلك في موعدها.</div>'}
        <button class="btn tint mt24" data-go="/plan/edit">${ic('pencil')}تعديل الخطة</button>
        <button class="btn soft mt12" data-action="simPay">${ic('play')}عرض تجريبي: محاكاة استلام الدفعة</button>`;
    },
  });
  ACTIONS.simPay = () => {
    const p = S.plan; if (!p) return;
    if (p.paused) { toast('الدفعات متوقفة — شغّلها من تعديل الخطة'); return; }
    const d = nextPayDate(p.payDay), amt = income(p);
    S.history.push({ date: d.toISOString(), amount: amt, split: split(p), dest: p.dest });
    if (p.dest === 'reinvest') p.balance += amt;
    S.simOffset = (S.simOffset || 0) + 1; track('payment_simulated'); save();
    render(); toast(`تم إيداع ${fmt(amt, 2)} ريال (محاكاة)`);
  };

  /* ================= 6) تعديل الخطة ================= */
  let E = null;
  route('/plan/edit', {
    auth: true,
    view: () => {
      const p = S.plan;
      if (!p) { go('/income', { replace: true }); return null; }
      const preset = (p.mode || 'preset') === 'preset';
      E = { target: p.target, alloc: preset ? { ...p.alloc } : null, payDay: PAY_DAY, dest: p.dest, paused: p.paused };
      const au = S.auto && S.auto.sanad;
      const customCard = `<div class="card"><div class="row between"><h3 class="h3" style="margin:0">توزيع محفظتك</h3><span class="badge-soft">${modeBadge(p)}</span></div><div class="mt12">${mixBar(p.mix || {})}</div>
          <div class="row between mt12 small"><span>مخاطر رأس المال خلال 12 شهر</span><span class="${mixLoss(p.mix || {}) > RISK_CAP ? 'neg' : ''}">${fmt(mixLoss(p.mix || {}), 1)}% (الحد ${RISK_CAP}%)</span></div>
          <div class="legend mt16">${comps(p).map((c) => `<div class="li"><i class="sw" style="background:${c.hex}"></i><span class="grow">${c.name}</span><span class="v">${c.w}%</span></div>`).join('')}</div>
          <button class="btn tint mt16" data-action="editMix">${ic('pencil')}تعديل الأنواع والأوزان</button></div>`;
      return `${topbar('تعديل الخطة', '', '/home')}
        <div class="card"><div class="row between"><b>هدفك الشهري</b><div class="range-val" id="tg-v">${money(E.target, 0)}</div></div>
          <input class="mt12" type="range" id="tg" min="500" max="20000" step="100" value="${E.target}" aria-label="هدفك الشهري"/>
          <div class="row between mt8"><span class="small">تغطية الهدف</span><b id="cov"></b></div><div class="bar mt8" id="cov-bar"><i></i></div></div>
        ${preset ? `<div class="card"><div class="row between"><h3 class="h3" style="margin:0">توزيع السلال</h3><span class="small">المجموع 100%</span></div>
          ${['liq', 'gro'].map((k) => `<div class="alloc-row"><div class="head"><i class="sw" style="width:12px;height:12px;border-radius:4px;background:${BASKETS[k].hex}"></i><span class="grow"><b style="font-size:16px">${BASKETS[k].name}</b> <small>· ${BASKETS[k].sub}</small></span><b id="v-${k}">${E.alloc[k]}%</b></div><input type="range" id="r-${k}" min="${BASKETS[k].range[0]}" max="${BASKETS[k].range[1]}" step="1" value="${E.alloc[k]}" aria-label="${BASKETS[k].name}"/><small>من ${BASKETS[k].range[0]}% إلى ${BASKETS[k].range[1]}%</small></div>`).join('')}
          <div class="alloc-row"><div class="head"><i class="sw" style="width:12px;height:12px;border-radius:4px;background:${BASKETS.fix.hex}"></i><span class="grow"><b style="font-size:16px">${BASKETS.fix.name}</b> <small>· يتعدّل تلقائيًا</small></span><b id="v-fix">${E.alloc.fix}%</b></div><div class="bar"><i id="b-fix" style="background:${BASKETS.fix.hex}"></i></div><small>من 40% إلى 50%</small></div>
          <div class="warn mt8" id="ack-warn" hidden>${ic('alert')}<span>رفع سلة النمو فوق ${ACK_LIMIT}% يتطلب توقيع إقرار المخاطر، ورسوم إدارتها أعلى.</span></div>
          <button class="btn soft mt12" data-action="editMix">${ic('pencil')}صمّم خطتك بنفسك</button>
        </div>` : customCard}
        <div class="card row between"><div><b>يوم استلام الدفعة</b><div class="small">ثابت لكل الخطط</div></div><b>يوم ${PAY_DAY} من كل شهر</b></div>
        <button class="pick-row mt16" data-action="autoDep" data-id="sanad">${ic('repeat')}<span class="grow">الاستقطاع الشهري<div class="small">${au ? `${money(au.amount, 0)} يوم ${PAY_DAY} من كل شهر` : 'غير مفعّل'}</div></span>${ic('chevL')}</button>
        <div class="card"><h3 class="h3">وجهة الدفعة</h3>
          <button class="pick-row ${E.dest === 'bank' ? 'selected' : ''}" data-dest="bank" style="background:#fff">${ic('bank')}<span class="grow">حسابي البنكي<div class="small">تُحوّل لحسابك كل شهر</div></span></button>
          <button class="pick-row ${E.dest === 'reinvest' ? 'selected' : ''}" data-dest="reinvest" style="background:#fff">${ic('refresh')}<span class="grow">إعادة الاستثمار<div class="small">تُضاف لرصيد خطتك وتكبر دفعاتك</div></span></button></div>
        <div class="card row between"><div><b>إيقاف الدفعات مؤقتًا</b><div class="small">تقدر تشغّلها في أي وقت</div></div><label class="toggle"><input type="checkbox" id="pause" ${E.paused ? 'checked' : ''} aria-label="إيقاف الدفعات"/><span></span></label></div>
        <button class="btn soft mt16" data-go="/deposit/sanad">${ic('plus')}إضافة مبلغ لخطتك</button>
        <div class="preview"><div class="row between"><span>دخلك الشهري بعد التعديل</span><b id="pv-inc"></b></div><div class="row between mt8 small"><span>الرسوم السنوية التقديرية</span><span id="pv-fee"></span></div><button class="btn mt12" id="save-plan" disabled>حفظ التعديلات</button></div>`;
    },
    mount: (root) => {
      const p = S.plan, $ = (s) => root.querySelector(s), preset = !!E.alloc;
      const sync = (changed) => {
        const a = E.alloc;
        let fix = 100 - a.liq - a.gro;
        if (fix > 50) { const ex = fix - 50; const other = changed === 'liq' ? 'gro' : 'liq'; a[other] = clamp(a[other] + ex, 20, 30); fix = 100 - a.liq - a.gro; if (fix > 50) { a[changed] += fix - 50; fix = 50; } }
        if (fix < 40) { const ex = 40 - fix; const other = changed === 'liq' ? 'gro' : 'liq'; a[other] = clamp(a[other] - ex, 20, 30); fix = 100 - a.liq - a.gro; if (fix < 40) { a[changed] -= 40 - fix; fix = 40; } }
        a.fix = fix;
      };
      const paint = () => {
        const a = E.alloc, o = preset ? { mode: 'preset', alloc: a } : {};
        if (preset) {
          ['liq', 'gro'].forEach((k) => { $('#r-' + k).value = a[k]; $('#v-' + k).textContent = a[k] + '%'; });
          $('#v-fix').textContent = a.fix + '%'; $('#b-fix').style.width = (a.fix - 30) / 30 * 100 + '%';
          $('#ack-warn').hidden = !(a.gro > ACK_LIMIT && !p.ack);
        }
        const inc = income(p, o), cov = inc / E.target * 100;
        $('#tg-v').innerHTML = money(E.target, 0);
        $('#cov').textContent = fmt(Math.min(cov, 999)) + '%'; $('#cov').className = cov >= 100 ? 'pos' : '';
        $('#cov-bar').className = 'bar mt8' + (cov >= 100 ? ' green' : ''); $('#cov-bar i').style.width = Math.min(cov, 100) + '%';
        $('#pv-inc').innerHTML = E.paused ? '<span class="neg">متوقفة</span>' : money(inc);
        $('#pv-fee').innerHTML = money(annualFee(p, o), 0);
        const changed = E.target !== p.target || E.payDay !== p.payDay || E.dest !== p.dest || E.paused !== p.paused || (preset && KEYS.some((k) => E.alloc[k] !== p.alloc[k]));
        $('#save-plan').disabled = !changed;
      };
      $('#tg').addEventListener('input', (e) => { E.target = +e.target.value; paint(); });
      if (preset) ['liq', 'gro'].forEach((k) => $('#r-' + k).addEventListener('input', (e) => { E.alloc[k] = +e.target.value; sync(k); paint(); }));
      root.querySelectorAll('[data-dest]').forEach((b) => b.addEventListener('click', () => { E.dest = b.dataset.dest; root.querySelectorAll('[data-dest]').forEach((x) => x.classList.toggle('selected', x === b)); paint(); }));
      $('#pause').addEventListener('change', (e) => { E.paused = e.target.checked; paint(); });
      $('#save-plan').addEventListener('click', () => {
        const apply = () => {
          Object.assign(p, { target: E.target, payDay: PAY_DAY, dest: E.dest, paused: E.paused });
          if (preset) { p.alloc = { ...E.alloc }; if (E.alloc.gro > ACK_LIMIT) p.ack = true; }
          track('plan_edit_saved'); save(); closeSheet(true); go(p.funded ? '/payments' : '/home', { replace: true }); toast('تم تحديث خطتك');
        };
        if (preset && E.alloc.gro > ACK_LIMIT && !p.ack) ackSheet(() => { p.ackDate = new Date().toISOString(); apply(); }); else apply();
      });
      paint();
    },
  });

  ACTIONS.editMix = () => { const p = S.plan; if (!p) return; S.mixDraft = { ...planMix(p) }; save(); go('/income/custom?from=edit'); };

  /* ================= الخدمات ================= */
  route('/services', {
    auth: true, nav: 'services',
    view: () => {
      const t = [['gem', 'فئات أبيان', '/create'], ['chart', 'حاسبة العوائد', '/calculator'], ['calc', 'حاسبة الزكاة', '/zakat'], ['userPen', 'إدارة المحافظ', '/manage'], ['hand', 'دعوة صديق', '/invite'], ['shield', 'محفظة التقاعد', S.plan ? '/home' : '/income']];
      return `<h1 class="page-title">الخدمات</h1><div class="svc-grid">${t.map(([i, l, p]) => `<button class="svc" data-go="${p}"><span class="icon-sq">${ic(i)}</span>${l}</button>`).join('')}</div>`;
    },
  });

  /* ================= فئات المحافظ / إنشاء محفظة ================= */
  route('/create', {
    auth: true,
    view: () => `${topbar('إنشاء محفظة', '', '/services')}<div class="list-rows">
      ${CREATE_ORDER.map((id) => {
        const p = id === 'diversified' ? { name: 'المتنوعة', icon: 'scale', desc: 'لتنويع الأصول والمخاطر', tags: ['أسهم أمريكية', 'الأسهم السعودية', 'عقارات', 'الصكوك'] } : PORTS[id];
        return `<button class="list-row" ${id === 'diversified' ? 'data-action="pickDiv"' : `data-go="/portfolio/${id}"`}>${iconCircle(p)}<div class="body"><div class="title">${p.name}${p.isNew ? ' <span class="badge-new">جديد</span>' : ''}</div><div class="desc">${p.desc}</div>${p.tags ? `<div class="tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>` : ''}${p.brand ? `<div class="tags"><span class="tag brand"><span class="icon-circle dark" style="width:20px;height:20px;border-radius:6px"></span>${p.brand}</span></div>` : ''}</div>${ic('chevL', 'chev')}</button>`;
      }).join('')}</div>`,
  });
  ACTIONS.pickDiv = () => openSheet({
    title: 'المتنوعة',
    html: `<p class="sub mb16">اختر مستوى المخاطر المناسب لك</p>${DIV_SUBS.map((id) => `<button class="pick-row" data-go="/portfolio/${id}"><div class="icon-circle">${ic('scale')}</div><span class="grow">${PORTS[id].name}<div class="small">متوسط سنوي ${PORTS[id].rate}% · مخاطر ${PORTS[id].risk}</div></span>${ic('chevL')}</button>`).join('')}`,
  });

  /* ================= تفاصيل المحفظة ================= */
  const pfFaq = (n) => [
    ['هل يمكنني السحب والإيداع في أي وقت؟', 'نعم، تقدر تودع أو تسحب في أي وقت، ويوصل المبلغ لحسابك خلال أيام عمل في النسخة الفعلية.'],
    [`ماهي رسوم محفظة ${n}؟`, `رسوم إدارة سنوية توضيحية تبدأ من ${fmt(FEE.base * 100, 1)}% من قيمة المحفظة، وتظهر بالتفصيل قبل الإيداع.`],
    ['هل العوائد مضمونة وماهي مخاطر الاستثمار؟', 'العوائد غير مضمونة، والأداء السابق لا يضمن الأداء المستقبلي. قيمة الاستثمار قد ترتفع أو تنخفض.'],
    [`هل يمكنني تعديل الأصول لمحفظة ${n}؟`, 'توزيع الأصول يديره فريق إدارة الأصول ويُعاد توازنه دوريًا للحفاظ على مستوى المخاطر.'],
    [`هل محفظة ${n} شرعية؟`, 'جميع المحافظ تُعرض على اللجنة الشرعية قبل طرحها.'],
    [`هل يوجد زكاة لمحفظة ${n}؟`, 'تقدر تحسب الزكاة التقديرية من حاسبة الزكاة في الخدمات.'],
  ];
  route('/portfolio/:id', {
    auth: true,
    view: ({ id }) => {
      if (id === 'sanad') { go('/home', { replace: true }); return null; }
      const p = PORTS[id]; if (!p) { go('/create', { replace: true }); return null; }
      const bal = portBalance(id);
      const end = `<button class="pill-btn" data-go="/manage">${ic('pencil')}إدارة</button>`;
      if (id === 'trading') {
        return `${topbar('', end, '/create')}<div class="pf-head">${iconCircle(p, 'lg')}<div><div class="name">التداول</div><span class="small">${p.brand}</span></div></div><div class="pf-hero">تداول الأسهم بنفسك بتجربة سهلة</div><p class="pf-text">هذه الخدمة خارج نطاق النموذج الأولي، والتركيز هنا على خطة سند والمحافظ المُدارة.</p><button class="btn soft" data-go="/create">استعرض المحافظ المُدارة</button>`;
      }
      const hero = p.hero || 'تنويع ذكي يناسب مستوى مخاطرك';
      const text = p.text || 'محفظة متنوعة بين الأسهم والصكوك والعقار';
      return `${topbar('', end, '/create')}
        <div class="pf-head">${iconCircle(p, 'lg')}<div><div class="name">محفظة ${p.name}</div><a class="link" data-go="/stats/${id}">احصائيات المحفظة ${ic('chevL')}</a></div></div>
        ${bal ? `<div class="kv" style="margin:0 0 16px"><span>رصيدك</span><b>${money(bal)}</b></div>` : ''}
        <div class="pf-hero">${hero}</div>
        <p class="pf-text">${text}${id === 'saving' ? '، تصل إلى <span class="pos">+5.85%</span> سنويًا' : id === 'corp-sukuk' ? `، بمتوسط عائد سنوي <span class="pos">▲${fmt(p.rate, 2)}%</span>` : ` حققت متوسط سنوي <span class="pos">▲${fmt(p.rate, 2)}%</span>`}</p>
        ${id === 'corp-sukuk' ? sukukSection() : `<button class="btn" data-go="/deposit/${id}">${ic('plus')}إيداع</button>
        <div class="hold-card">${p.holdings.map(([n, t, v]) => `<div class="hold"><span class="pct">${v}%</span><span class="nm">${n}</span><span class="tk">${t}</span>${ring(v)}</div>`).join('')}</div>`}
        <div class="kv"><span>درجة المخاطر</span><b>${p.risk}</b></div>
        <div class="plan-cta"><p style="margin:4px 0 14px;font-size:17px">محتار في مبلغ الإيداع؟</p><button class="btn tint" data-go="/income">${ic('target')}ابدأ بخطة مالية</button><p style="margin:14px 0 2px">واحصل على مكافآت 🎁</p></div>
        ${moreSection(pfFaq(p.name))}`;
    },
  });

  /* ===== صكوك الشركات: فرص محدودة المدة بعوائد ثابتة وتوزيعات دورية ===== */
  function nextDist(inv) {
    const o = SUKUK.find((x) => x.id === inv.opp), every = 12 / o.n, start = new Date(inv.date), today = vToday();
    let d = addMonths(start, every), i = 1;
    while (d <= today && i < 60) { i += 1; d = addMonths(start, every * i); }
    return { date: d, amount: inv.amount * o.rate / 100 / o.n, o };
  }
  function sukukSection() {
    const mine = S.sukuk || [];
    return `${mine.length ? `<h3 class="h3 mt8">استثماراتك في الصكوك</h3><div class="sched mb16">${mine.map((inv) => { const n = nextDist(inv); return `<div class="it"><div class="d"><b>${n.o.name}</b><small>التوزيع القادم ${fmtDate(n.date)} · ${n.o.freq}</small></div><div style="text-align:left"><b>${money(inv.amount, 0)}</b><small class="pos" dir="ltr" style="display:block;font-size:13px">+${fmt(n.amount, 2)}</small></div></div>`; }).join('')}</div>` : ''}
      <div class="row between mt8"><h3 class="h3" style="margin:0">الفرص المتاحة</h3><span class="small">${SUKUK.length} فرص</span></div>
      ${SUKUK.map((o) => `<button class="opp" data-action="opp" data-id="${o.id}">
        <div class="row between"><div class="row" style="gap:10px"><div class="icon-circle" style="width:40px;height:40px">${ic('landmark')}</div><div style="text-align:right"><b>${o.name}</b><div class="small">${o.sector} · صكوك ${o.type}</div></div></div>${ic('chevL')}</div>
        <div class="opp-grid"><div><small>العائد السنوي</small><b class="pos">${fmt(o.rate, 1)}%</b></div><div><small>المدة</small><b>${o.term} شهر</b></div><div><small>التوزيع</small><b>${o.freq}</b></div></div>
        <div class="bar"><i style="width:${o.funded}%"></i></div><div class="row between small mt8"><span>تم تمويل ${o.funded}%</span><span>يُغلق الطرح بعد ${o.days} يوم</span></div>
      </button>`).join('')}
      <p class="small">أسماء الجهات المُصدرة والأرقام توضيحية. كل الإصدارات صكوك شركات معتمدة من اللجنة الشرعية.</p>`;
  }
  ACTIONS.opp = (el) => {
    const o = SUKUK.find((x) => x.id === el.dataset.id); if (!o) return;
    const ex = 10000, per = ex * o.rate / 100 / o.n, mat = addMonths(new Date(), o.term);
    openSheet({
      title: 'تفاصيل الإصدار',
      html: `<div class="row" style="gap:12px;margin-bottom:14px"><div class="icon-circle">${ic('landmark')}</div><div><b style="font-size:18px">${o.name}</b><div class="small">${o.sector}</div></div></div>
        <div class="card" style="background:var(--card)">
          ${[['نوع الصكوك', o.type], ['العائد السنوي الثابت', `<span class="pos">${fmt(o.rate, 1)}%</span>`], ['المدة', `${o.term} شهر`], ['توزيع الأرباح', o.freq], ['الاستحقاق المتوقع', fmtDate(mat)], ['الحد الأدنى', money(o.min, 0)], ['الحالة الشرعية', 'معتمدة من اللجنة الشرعية']].map(([k, v]) => `<div class="row between" style="padding:7px 0"><span class="small">${k}</span><b style="font-size:15px">${v}</b></div>`).join('')}
        </div>
        <div class="info-box mt16">${ic('coins')}<span>مثال: استثمار ${money(ex, 0)} يعطيك ${money(per)} كل توزيع ${o.freq}، ويرجع لك رأس المال عند الاستحقاق.</span></div>
        <div class="bar mt16"><i style="width:${o.funded}%"></i></div><div class="row between small mt8"><span>تم تمويل ${o.funded}%</span><span>يُغلق بعد ${o.days} يوم</span></div>
        <button class="btn mt16" data-go="/deposit/corp-sukuk?opp=${o.id}">استثمر في هذه الفرصة</button>`,
    });
  };

  /* ================= الإحصائيات + الرسوم البيانية ================= */
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const hash = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
  const seriesCache = {};
  function series(id, rate, vol) {
    if (seriesCache[id]) return seriesCache[id];
    const r = rng(hash(id)), N = 1260, out = [0];
    for (let i = 1; i <= N; i++) { const z = Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r()); out.push(out[i - 1] + vol * z); }
    const target = 5 * Math.log(1 + rate / 100), drift = (target - out[N]) / N;
    const v = out.map((x, i) => 100 * Math.exp(x + drift * i));
    return (seriesCache[id] = v);
  }
  const maxDD = (v) => { let pk = v[0], dd = 0; v.forEach((x) => { pk = Math.max(pk, x); dd = Math.min(dd, x / pk - 1); }); return dd * 100; };
  function sparkSVG(v) {
    const step = Math.max(1, Math.floor(v.length / 140)), pts = v.filter((_, i) => i % step === 0 || i === v.length - 1);
    const W = 360, H = 170, mn = Math.min(...pts), mx = Math.max(...pts), rgY = mx - mn || 1;
    const xy = pts.map((y, i) => [i / (pts.length - 1) * W, H - 10 - (y - mn) / rgY * (H - 30)]);
    const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
    const [lx, ly] = xy[xy.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3A47E6" stop-opacity=".16"/><stop offset="1" stop-color="#3A47E6" stop-opacity="0"/></linearGradient></defs><path d="${d}L${W} ${H}L0 ${H}Z" fill="url(#sg)"/><path d="${d}" fill="none" stroke="#3A47E6" stroke-width="2.6" stroke-linejoin="round"/><circle cx="${lx}" cy="${ly}" r="6" fill="#fff" stroke="#3A47E6" stroke-width="3"/></svg>`;
  }
  const PERIODS = [['month', 'شهر', 21], ['6m', '6 اشهر', 126], ['year', 'سنة', 252], ['all', 'الكل', 1260]];
  function histCard(id, name, rate, vol) {
    const v = series(id, rate, vol), per = PERIODS.find((x) => x[0] === S.calc.period) || PERIODS[3];
    const seg = v.slice(v.length - 1 - per[2]), ret = (seg[seg.length - 1] / seg[0] - 1) * 100, since = (v[v.length - 1] / v[0] - 1) * 100;
    return `<div class="hist" id="hist"><div class="small">الأداء التاريخي</div><div class="row" style="justify-content:flex-start;gap:14px;margin:6px 0 2px"><b style="font-size:20px">${name}</b><b class="${since >= 0 ? 'pos' : 'neg'}" dir="ltr">${since >= 0 ? '▲' : '▼'} ${fmt(Math.abs(since), 2)}%</b></div><div class="small">منذ البداية</div>
      <div class="chart-box" style="margin:10px 0 0">${sparkSVG(seg)}</div>
      <div class="tabs">${PERIODS.map(([k, l]) => `<button class="${k === per[0] ? 'on' : ''}" data-period="${k}">${l}</button>`).join('')}</div>
      <p class="small center" style="margin:8px 0 0">عائد الفترة: <b class="${ret >= 0 ? 'pos' : 'neg'}" dir="ltr">${ret >= 0 ? '+' : ''}${fmt(ret, 2)}%</b></p></div>
      <div class="stats3"><div class="hd">${ic('clock')}إحصائيات آخر 5 سنوات</div><div class="grid"><div><b class="pos">+${fmt(rate, 2)}%</b><span>العائد السنوي</span></div><div><b class="pos">+${fmt(since, 0)}%</b><span>عائد الفترة</span></div><div><b>${fmt(maxDD(v), 0)}%</b><span>أقصى انخفاض</span></div></div><div class="ft">${ic('info')} أرقام توضيحية تحاكي الأداء، وتُحدَّث سنويًا</div></div>`;
  }
  function bindPeriods(root, rerender) {
    root.querySelectorAll('[data-period]').forEach((b) => b.addEventListener('click', () => { S.calc.period = b.dataset.period; save(); rerender(); }));
  }

  route('/stats/:id', {
    auth: true,
    view: ({ id }) => {
      if (id === 'sanad') {
        const p = S.plan; if (!p || !p.funded) { go('/home', { replace: true }); return null; }
        const received = S.history.reduce((s, h) => s + h.amount, 0);
        return `${topbar('احصائيات الخطة')}
          <div class="card"><div class="row between"><span>رصيد الخطة</span><b>${money(p.balance)}</b></div><div class="row between mt8"><span class="small">إجمالي الدفعات المستلمة</span><span class="small">${money(received)}</span></div><div class="row between mt8"><span class="small">العائد التوزيعي السنوي</span><span class="small pos">${fmt(planY(p) * 100, 2)}%</span></div><div class="row between mt8"><span class="small">بداية الخطة</span><span class="small">${fmtDate(new Date(p.createdAt))}</span></div></div>
          <div class="card"><h3 class="h3">قيمة كل ${(p.mode || 'preset') !== 'preset' ? 'محفظة' : 'سلة'}</h3>${comps(p).map((c) => `<div class="mt12"><div class="row between"><span>${c.name}</span><b>${money(p.balance * c.w / 100, 0)}</b></div><div class="bar mt8"><i style="width:${c.w}%;background:${c.hex}"></i></div></div>`).join('')}</div>
          <div id="hist-wrap">${histCard('sanad-' + comps(p).map((c) => c.k + c.w).join(''), 'محفظة التقاعد', planTR(p) * 100, 0.002 + highShare(p) / 100 * 0.02)}</div>`;
      }
      const p = PORTS[id]; if (!p || p.rate == null) { go('/create', { replace: true }); return null; }
      const bal = portBalance(id);
      return `${topbar('احصائيات المحفظة', '', `/portfolio/${id}`)}${bal ? `<div class="kv" style="margin-top:0"><span>رصيدك</span><b>${money(bal)}</b></div>` : ''}<div id="hist-wrap">${histCard(id, p.name, p.rate, p.vol)}</div>`;
    },
    mount: (root) => bindPeriods(root, render),
  });

  /* ================= حاسبة العوائد ================= */
  function fv(init, monthly, rate, months) { const r = rate / 100 / 12; let v = init; for (let i = 0; i < months; i++) v = v * (1 + r) + monthly; return v; }
  route('/calculator', {
    auth: true,
    view: () => {
      const C = S.calc; if (!PORTS[C.pf] || PORTS[C.pf].rate == null) C.pf = 'div-safe';
      const p = PORTS[C.pf];
      const sel = `<button class="sel-card" data-action="pickCalc">${iconCircle(p)}<div class="grow"><small>نوع المحفظة</small><b>${p.name}</b></div>${ic('chevD')}</button>`;
      const sliders = `<div class="range-row"><div class="head"><b>الدفعة الأولى</b><div class="range-val" id="v-init">${money(C.init, 0)}</div></div><input type="range" id="r-init" min="0" max="100000" step="1000" value="${C.init}" aria-label="الدفعة الأولى"/></div>
        <div class="range-row"><div class="head"><b>الدفعات الشهرية</b><div class="range-val" id="v-mon">${money(C.monthly, 0)}</div></div><input type="range" id="r-mon" min="0" max="10000" step="100" value="${C.monthly}" aria-label="الدفعات الشهرية"/></div>`;
      if (C.pf === 'saving') {
        return `${topbar('حاسبة العوائد', '', '/services')}${sel}
          <div class="save-box mt16"><div class="top"><span id="sv-tot"></span><span class="plus" id="sv-gain"></span></div><div class="bot" id="sv-base"></div></div>
          <div class="bars" id="bars"></div>
          <button class="pick-row mt24" data-action="saveTip" style="background:var(--card-2)"><span class="icon-circle" style="width:40px;height:40px;background:none;color:var(--primary)">${ic('wallet')}</span><span class="grow">ماهي افضل طريقة للادخار؟</span>${ic('chevL')}</button>
          ${sliders}`;
      }
      return `${topbar('حاسبة العوائد', '', '/services')}${sel}
        <div class="big-val mt24" id="c-val"></div><div class="gain" id="c-gain"></div>
        <div class="chart-box" id="c-chart"><div id="c-svg"></div><div class="tip" id="c-tip"><span class="yr" id="t-yr"></span><span class="a"><span>مع الاستثمار</span><b id="t-a"></b></span><span class="b"><span>بدون استثمار</span><b id="t-b"></b></span></div></div>
        <div class="axis">${['سنة', '5 سنين', '10 سنة', '15 سنة', '20 سنة'].map((x) => `<span>${x}</span>`).join('')}</div>
        <div class="lc-legend" id="c-legend"></div>
        ${sliders}
        <div class="card row between mt16"><div><b>إعادة استثمار التوزيعات</b><div class="small">عائد توزيعي ${fmt(p.dy, 1)}% سنويًا من أصل ${fmt(p.rate, 1)}%</div></div><label class="toggle"><input type="checkbox" id="c-reinv" ${REINV ? 'checked' : ''} aria-label="إعادة استثمار التوزيعات"/><span></span></label></div>
        <p class="small mt8" id="c-note" style="line-height:1.8"></p>
        <div class="info-box mt24">${ic('trend')}<span>التوقعات قد لا تعكس بدقة الأداء المستقبلي، كونها تعتمد على تحليل الأداء التاريخي للمحفظة الموضّح أدناه</span></div>
        <div id="hist-wrap">${histCard(C.pf, p.name, p.rate, p.vol)}</div>`;
    },
    mount: (root) => {
      const C = S.calc, p = PORTS[C.pf], $ = (s) => root.querySelector(s);
      track('calc_used');
      const paintSliders = () => { $('#v-init').innerHTML = money(C.init, 0); $('#v-mon').innerHTML = money(C.monthly, 0); };
      let paint;
      if (C.pf === 'saving') {
        paint = () => {
          const vals = [1, 2, 3, 4, 5, 6].map((y) => fv(C.init, C.monthly, p.rate, y * 12)), mx = Math.max(...vals, 1);
          const y = C.saveYear, tot = vals[y - 1], base = C.init + C.monthly * 12 * y;
          $('#sv-tot').innerHTML = money(tot, 0); $('#sv-gain').innerHTML = `<span dir="ltr">+ ${money(tot - base, 0)}</span>`; $('#sv-base').innerHTML = `من إدخار ${money(base, 0)}`;
          $('#bars').innerHTML = vals.map((v, i) => `<button class="${i + 1 === y ? 'on' : ''}" data-y="${i + 1}"><i style="height:${Math.max(6, v / mx * 180)}px"></i><span>${i + 1} سنة</span></button>`).join('');
          root.querySelectorAll('[data-y]').forEach((b) => b.addEventListener('click', () => { C.saveYear = +b.dataset.y; save(); paint(); }));
        };
      } else {
        const W = 400, H = 240;
        // بدون إعادة الاستثمار: القيمة تنمو بعائد النمو فقط (العائد الكلي − التوزيعات) والتوزيعات تُصرف لك
        const gNo = Math.max(0, p.rate - p.dy);
        const paid = (months) => { const r = gNo / 100 / 12; let v = C.init, s = 0; for (let i = 0; i < months; i++) { s += v * p.dy / 100 / 12; v = v * (1 + r) + C.monthly; } return s; };
        $('#c-reinv').addEventListener('change', (e) => { REINV = e.target.checked; track('reinvest_toggle'); paint(); });
        paint = () => {
          const pts = [], base = [], alt = [], rMain = REINV ? p.rate : gNo;
          for (let m = 0; m <= 240; m += 3) { pts.push(fv(C.init, C.monthly, rMain, m)); base.push(C.init + C.monthly * m); alt.push(fv(C.init, C.monthly, gNo, m)); }
          const mx = Math.max(...pts, 1);
          const X = (i) => i / (pts.length - 1) * W, Y = (v) => H - 6 - v / mx * (H - 36);
          const line = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
          const yr = C.year, xm = yr * 12 / 240 * W;
          $('#c-svg').innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-label="منحنى نمو الاستثمار"><defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3A47E6" stop-opacity=".2"/><stop offset="1" stop-color="#3A47E6" stop-opacity=".02"/></linearGradient></defs><path d="${line(pts)}L${W} ${H}L0 ${H}Z" fill="url(#cg)"/><line x1="${xm}" x2="${xm}" y1="0" y2="${H}" stroke="#9FB0F5" stroke-width="2"/><path d="${line(base)}" fill="none" stroke="#1B1E24" stroke-width="3.5" stroke-linecap="round"/>${REINV ? `<path d="${line(alt)}" fill="none" stroke="#13A57A" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>` : ''}<path d="${line(pts)}" fill="none" stroke="#3A47E6" stroke-width="4.5" stroke-linecap="round"/></svg>`;
          $('#c-legend').innerHTML = `<span><i style="background:#3A47E6"></i>${REINV ? 'مع إعادة استثمار التوزيعات' : 'بدون إعادة استثمار التوزيعات'}</span>${REINV ? '<span><i class="dash" style="border-color:#13A57A"></i>بدون إعادة الاستثمار</span>' : ''}<span><i style="background:#1B1E24"></i>المبلغ المدفوع فقط</span>`;
          const a = fv(C.init, C.monthly, rMain, yr * 12), b = C.init + C.monthly * yr * 12, g = a - b, aNo = fv(C.init, C.monthly, gNo, yr * 12);
          $('#c-note').innerHTML = REINV ? `إعادة استثمار التوزيعات تضيف ${money(a - aNo, 0)} لقيمة استثمارك بعد ${yr} ${yr <= 10 ? 'سنوات' : 'سنة'}.` : `بدون إعادة الاستثمار تُصرف لك توزيعات إجمالها ${money(paid(yr * 12), 0)} تقريبًا خلال ${yr} ${yr <= 10 ? 'سنوات' : 'سنة'}. فعّل الخيار عشان تشوف أثر إعادة استثمارها.`;
          $('#c-val').innerHTML = money(a); $('#c-gain').innerHTML = `<span>▲ (${fmt(b ? g / b * 100 : 0, 1)}%)</span>${money(g)}`;
          $('#t-yr').textContent = yr === 1 ? 'بعد سنة' : `بعد ${yr} ${yr <= 10 ? 'سنوات' : 'سنة'}`;
          $('#t-a').innerHTML = money(a); $('#t-b').innerHTML = money(b, 0);
          const tip = $('#c-tip'), box = $('#c-chart'), px = xm / W * box.clientWidth;
          tip.style.top = '6px'; tip.style.left = px + 'px'; tip.style.transform = px < 150 ? 'translateX(8px)' : 'translateX(calc(-100% - 8px))'; tip.style.alignItems = px < 150 ? 'flex-start' : 'flex-end';
        };
        const box = $('#c-chart');
        const setYear = (e) => { const r = box.getBoundingClientRect(); const x = clamp((e.clientX - r.left) / r.width, 0, 1); const y = clamp(Math.round(x * 20), 1, 20); if (y !== C.year) { C.year = y; paint(); } };
        let drag = false;
        box.addEventListener('pointerdown', (e) => { drag = true; setYear(e); });
        box.addEventListener('pointermove', (e) => { if (drag || e.pointerType === 'mouse') setYear(e); });
        const up = () => { if (drag) { drag = false; save(); } };
        window.addEventListener('pointerup', up); cleanup.push(() => window.removeEventListener('pointerup', up));
        const onResize = () => paint(); window.addEventListener('resize', onResize); cleanup.push(() => window.removeEventListener('resize', onResize));
        bindPeriods(root, () => { $('#hist-wrap').innerHTML = histCard(C.pf, p.name, p.rate, p.vol); bindPeriods(root, () => render()); });
      }
      $('#r-init').addEventListener('input', (e) => { C.init = +e.target.value; paintSliders(); paint(); });
      $('#r-mon').addEventListener('input', (e) => { C.monthly = +e.target.value; paintSliders(); paint(); });
      ['#r-init', '#r-mon'].forEach((s) => $(s).addEventListener('change', save));
      paint();
    },
  });
  ACTIONS.pickCalc = () => {
    const mine = S.portfolios.map((x) => x.id).filter((id) => PORTS[id].rate != null);
    const rest = CALC_ORDER.filter((id) => !mine.includes(id));
    const row = (id) => `<button class="pick-row ${S.calc.pf === id ? 'selected' : ''}" data-pf="${id}">${iconCircle(PORTS[id])}<span class="grow">${PORTS[id].name}</span>${PORTS[id].isNew ? '<span class="badge-new">جديد</span>' : ''}</button>`;
    openSheet({
      title: 'إختر نوع المحفظة',
      html: `${mine.length ? `<div class="section-label">المحافظ التي تم إنشاؤها</div>${mine.map(row).join('')}` : ''}<div class="section-label">محافظ أبيان المتبقية</div>${rest.map(row).join('')}`,
      mount: (sh) => sh.querySelectorAll('[data-pf]').forEach((b) => b.addEventListener('click', () => { S.calc.pf = b.dataset.pf; save(); closeSheet(true); render(); })),
    });
  };
  ACTIONS.saveTip = () => openSheet({ title: 'ماهي افضل طريقة للادخار؟', html: `<ul class="checks" style="margin:0"><li style="align-items:flex-start">${ic('check')}<span>ابدأ بمبلغ بسيط وفعّل الاستقطاع الشهري عشان يصير الادخار تلقائي.</span></li><li style="align-items:flex-start">${ic('check')}<span>خلّ عندك مبلغ طوارئ يغطي 3 إلى 6 أشهر من مصاريفك.</span></li><li style="align-items:flex-start">${ic('check')}<span>للمتقاعدين: خطة سند توزع مدخراتك وتعطيك دخل شهري.</span></li></ul><button class="btn mt24" data-go="/deposit/saving">ابدأ الادخار</button>` });

  /* ================= حاسبة الزكاة ================= */
  route('/zakat', {
    auth: true,
    view: () => {
      const v = Math.round(totalBalance()) || 100000;
      return `${topbar('حاسبة الزكاة', '', '/services')}
        <div class="card"><b>قيمة استثماراتك</b><div class="input mt12" style="background:#fff"><input id="zk" type="tel" inputmode="numeric" value="${v}" dir="ltr" style="text-align:right" aria-label="قيمة الاستثمارات"/>${RIYAL}</div>
          ${totalBalance() ? `<p class="small mt8">عبّأنا إجمالي أرصدتك تلقائيًا: ${money(totalBalance(), 0)}</p>` : ''}</div>
        <div class="hero-blue mt16"><div class="lbl">الزكاة التقديرية (2.5%)</div><div class="amt" id="zk-v"></div></div>
        <div class="info-box mt16">${ic('info')}<span>حساب تقديري للاسترشاد فقط. زكاة الأسهم والصناديق قد تختلف حسب نية الاستثمار وأصول الشركات، ويُرجع فيها للجنة الشرعية.</span></div>`;
    },
    mount: (root) => { const i = root.querySelector('#zk'), o = root.querySelector('#zk-v'); const p = () => { o.innerHTML = money((+digits(i.value) || 0) * 0.025); }; i.addEventListener('input', p); p(); },
  });

  /* ================= إدارة المحافظ ================= */
  route('/manage', {
    auth: true,
    view: () => `${topbar('إدارة المحافظ', '', '/services')}<div class="section-label" style="font-size:17px;color:var(--text);font-weight:600;margin-top:24px">المحافظ</div>
      ${S.plan ? `<button class="pick-row" data-go="/home"><div class="icon-circle solid" style="border-radius:50%">${ic('shield')}</div><span class="grow">محفظة التقاعد <span class="badge-soft">${modeBadge(S.plan)}</span><div class="small">${S.plan.funded ? money(S.plan.balance) : 'بانتظار السداد'}</div></span>${ic('chevL')}</button>` : ''}
      ${S.portfolios.map((x) => `<button class="pick-row" data-go="/portfolio/${x.id}">${iconCircle(PORTS[x.id])}<span class="grow">محفظة ${PORTS[x.id].name}<div class="small">${money(x.balance)}</div></span>${ic('chevL')}</button>`).join('')}
      ${!S.plan && !S.portfolios.length ? '<p class="sub center mt16">ما عندك محافظ للحين</p>' : ''}
      <button class="btn tint mt16" data-go="/create">${ic('plus')}إنشاء محفظة</button>`,
  });

  /* ================= دعوة صديق ================= */
  route('/invite', {
    auth: true,
    view: () => {
      const code = 'SND-' + (S.user.phone || '0000').slice(-4);
      return `${topbar('', '', '/services')}<div class="emoji-big" aria-hidden="true">🤝</div>
        <p class="center" style="font-size:18px;font-weight:700;margin:0">خصم 20% على الرسوم الإدارية لك ولكل عميل جديد يسجل!</p>
        <p class="center sub mt8">كل خصم مدته 4 أشهر</p>
        <div class="code-box"><button class="icon-btn" data-action="copyCode" data-code="${code}" aria-label="نسخ">${ic('copy')}</button><b>${code}</b><button class="icon-btn" data-action="shareCode" data-code="${code}" aria-label="مشاركة">${ic('share')}</button></div>
        <div class="card"><p class="center" style="margin:0 0 4px;font-size:18px;font-weight:600">نسبة الخصم من الدعوات</p>
          <div class="track">${[0, 1, 2, 3, 4, 5].map((i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
          <div class="track-lbl">${['0%', '20%', '40%', '60%', '80%', '100%'].map((x) => `<span dir="ltr">${x}</span>`).join('')}</div>
          <div class="divider"></div><div class="row between"><b style="font-size:18px">لقد دعوت</b><b style="font-size:18px">0 شخص</b></div></div>
        <div class="cta-bottom"><button class="btn soft" data-action="enterCode">ادخل كود</button></div>`;
    },
  });
  ACTIONS.copyCode = async (el) => { try { await navigator.clipboard.writeText(el.dataset.code); toast('تم نسخ الكود'); } catch (e) { toast('الكود: ' + el.dataset.code); } };
  ACTIONS.shareCode = async (el) => { const text = `سجّل في سند بالكود ${el.dataset.code} واحصل على خصم 20% على الرسوم (نموذج أولي)`; try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast('تم نسخ رسالة الدعوة'); } } catch (e) { /* أُلغيت المشاركة */ } };
  ACTIONS.enterCode = () => openSheet({ title: 'ادخل كود الدعوة', html: `<div class="input"><input id="ic-in" placeholder="مثال: SND-1234" dir="ltr" style="text-align:right"/></div><button class="btn mt16" id="ic-ok">تفعيل</button>`, mount: (sh) => { sh.querySelector('#ic-in').focus(); sh.querySelector('#ic-ok').onclick = () => { closeSheet(); toast('تم تفعيل الكود (تجريبي)'); }; } });

  /* ================= الإيداع ================= */
  route('/deposit/:id', {
    auth: true,
    view: ({ id }, q) => {
      const isSanad = id === 'sanad'; const p = isSanad ? null : PORTS[id];
      if (!isSanad && (!p || p.rate == null)) { go('/create', { replace: true }); return null; }
      if (isSanad && !S.plan) { go('/income', { replace: true }); return null; }
      const first = isSanad && q.get('first') === '1' && !S.plan.funded;
      const opp = id === 'corp-sukuk' ? SUKUK.find((x) => x.id === q.get('opp')) : null;
      const pre = first ? S.plan.savings : opp ? opp.min : '';
      return `${topbar('اختر وسيلة الإيداع', '', isSanad ? '/home' : `/portfolio/${id}`)}
        <div class="banner">${ic('chart')}<span>الحد الأدنى ${opp ? 'لهذه الفرصة' : 'لبدء الاستثمار'} ${money(opp ? opp.min : 50, 0)}</span></div>
        <div class="pay-opts"><button class="pay-opt on" data-method="card">${ic('card')}عبر البطاقة</button><button class="pay-opt" data-method="bank"><span class="badge-new">أسرع</span>${ic('landmark')}تحويل بنكي</button><button class="pay-opt wide" data-method="later">${ic('clock')}السداد لاحقًا</button></div>
        <div class="input"><input id="dep" type="tel" inputmode="decimal" placeholder="قيمة الإيداع" value="${pre}" aria-label="قيمة الإيداع"/>${RIYAL}</div>
        <p class="small mt8">${first ? 'المبلغ المقترح حسب خطتك، تقدر تغيّره' : opp ? `في ${opp.name} · عائد ${fmt(opp.rate, 1)}% · توزيع ${opp.freq}` : `إلى ${isSanad ? 'محفظة التقاعد' : 'محفظة ' + p.name}`}</p>
        <div class="divider" style="margin:20px 0"></div>
        <div id="method-box"></div>
        <div class="cta-bottom"><button class="btn" id="dep-go" disabled>أودع</button></div>`;
    },
    mount: (root, { id }, q) => {
      const $ = (s) => root.querySelector(s); let method = 'card';
      const box = () => {
        $('#method-box').innerHTML = method === 'card' ? `<b style="font-size:18px">طرق الدفع المدعومة</b><div class="methods"><span>Apple Pay</span><span>مدى mada</span><span>VISA</span><span>Mastercard</span></div>`
          : method === 'bank' ? `<div class="info-box">${ic('info')}<span>في النسخة الفعلية يظهر هنا رقم الآيبان الخاص بحسابك الاستثماري لإتمام التحويل.</span></div>`
          : `<div class="info-box">${ic('clock')}<span>بنحفظ ${id === 'sanad' ? 'خطتك' : 'طلبك'}، وتقدر تكمل السداد في أي وقت من ${id === 'sanad' ? 'الرئيسية' : 'صفحة المحفظة'}. ${id === 'sanad' ? 'دفعاتك الشهرية تبدأ بعد السداد.' : ''}</span></div>`;
        btn.textContent = method === 'later' ? 'متابعة والسداد لاحقًا' : 'أودع'; chk();
      };
      root.querySelectorAll('[data-method]').forEach((b) => b.addEventListener('click', () => { method = b.dataset.method; root.querySelectorAll('[data-method]').forEach((x) => x.classList.toggle('on', x === b)); box(); }));
      const inp = $('#dep'), btn = $('#dep-go');
      const val = () => +toLatin(inp.value).replace(/[^\d.]/g, '') || 0;
      const opp = id === 'corp-sukuk' ? SUKUK.find((x) => x.id === q.get('opp')) : null, min = opp ? opp.min : 50;
      const chk = () => { btn.disabled = method !== 'later' && val() < min; };
      inp.addEventListener('input', chk); box(); chk();
      btn.addEventListener('click', () => (method === 'later' ? payLater(id) : confirmDeposit(id, val(), method, q.get('first') === '1', opp)));
    },
  });
  function payLater(id) {
    track('pay_later');
    if (id === 'sanad' && S.plan) { S.plan.payLater = true; save(); go('/home', { replace: true }); toast('تم حفظ خطتك، وتقدر تسدد لاحقًا من الرئيسية'); return; }
    go(`/portfolio/${id}`, { replace: true }); toast('تم حفظ طلبك، وتقدر تسدد لاحقًا');
  }
  function confirmDeposit(id, amt, method, first, opp) {
    const name = id === 'sanad' ? 'محفظة التقاعد' : opp ? opp.name : 'محفظة ' + PORTS[id].name;
    openSheet({
      title: 'تأكيد الإيداع',
      html: `<div class="card" style="background:var(--card)"><div class="row between"><span class="small">المبلغ</span><b style="font-size:22px">${money(amt)}</b></div><div class="row between mt8"><span class="small">إلى</span><span>${name}</span></div><div class="row between mt8"><span class="small">الوسيلة</span><span>${method === 'card' ? 'بطاقة' : 'تحويل بنكي'}</span></div></div>
        <div class="warn mt16">${ic('info')}<span>هذا نموذج أولي: لن يُخصم أي مبلغ ولن تُطلب بيانات بطاقة.</span></div>
        <button class="btn mt16" id="cf">تأكيد الإيداع</button>`,
      mount: (sh) => sh.querySelector('#cf').addEventListener('click', () => {
        if (id === 'sanad') { const p = S.plan; if (!p.funded) { p.balance = amt; p.funded = true; p.payLater = false; track('deposit_first'); } else p.balance += amt; }
        else { const x = S.portfolios.find((y) => y.id === id); if (x) x.balance += amt; else S.portfolios.push({ id, balance: amt, createdAt: new Date().toISOString() }); }
        if (opp) { S.sukuk = S.sukuk || []; S.sukuk.push({ opp: opp.id, amount: amt, date: vToday().toISOString() }); }
        track('deposit'); save();
        sheetRoot.querySelector('.sh-body').innerHTML = `<div class="success-ic">${ic('check')}</div><h3 class="h2 center">تم الإيداع</h3><p class="sub center">${money(amt)} إلى ${name}</p>${first ? '<p class="sub center mt8">تم تفعيل خطتك، وأول دفعة بتوصلك في موعدها.</p>' : ''}<button class="btn mt24" id="dn">تم</button>`;
        sheetRoot.querySelector('#dn').addEventListener('click', () => { closeSheet(true); go(id === 'sanad' ? '/home' : `/portfolio/${id}`, { replace: true }); });
      }),
    });
  }
  ACTIONS.autoDep = (el) => {
    const id = (el && el.dataset.id) || (location.hash.match(/deposit\/([^?]+)/) || [])[1]; if (!id) return;
    const cur = (S.auto && S.auto[id]) || { amount: 1000, day: PAY_DAY };
    openSheet({
      title: 'الاستقطاع الشهري',
      html: `<p class="sub mb16">اختياري: نودع المبلغ تلقائيًا يوم ${PAY_DAY} من كل شهر</p><div class="input"><input id="au" type="tel" inputmode="numeric" value="${cur.amount}" dir="ltr" style="text-align:right" aria-label="المبلغ الشهري"/>${RIYAL}</div>
        <div class="chips" style="justify-content:flex-start">${[500, 1000, 2000].map((v) => `<button class="chip" data-av="${v}">${fmt(v)}</button>`).join('')}</div>
        <button class="btn mt24" id="au-ok">حفظ</button>${S.auto && S.auto[id] ? '<button class="btn soft mt12" id="au-off">إيقاف الاستقطاع</button>' : ''}`,
      mount: (sh) => {
        const day = PAY_DAY;
        sh.querySelectorAll('[data-av]').forEach((b) => b.addEventListener('click', () => { sh.querySelector('#au').value = b.dataset.av; }));
        sh.querySelector('#au-ok').onclick = () => { S.auto = S.auto || {}; S.auto[id] = { amount: Math.max(50, +digits(sh.querySelector('#au').value) || 50), day }; track('auto_dep_set'); save(); closeSheet(true); render(); toast('تم تفعيل الاستقطاع الشهري'); };
        const off = sh.querySelector('#au-off'); if (off) off.onclick = () => { delete S.auto[id]; save(); closeSheet(true); render(); };
      },
    });
  };

  /* ================= الإعدادات ================= */
  route('/settings', {
    auth: true, nav: 'settings',
    view: () => {
      const u = S.user, ph = u.phone || '', nid = u.nid || '';
      const rowB = (icon, label, attr, extra = '') => `<button class="pick-row" ${attr}>${ic(icon)}<span class="grow">${label}</span>${extra || ic('chevL')}</button>`;
      const title = u.name ? esc(u.name) : u.guest ? 'زائر' : 'حسابي';
      return `<h1 class="page-title">الإعدادات</h1>
        <div class="card row"><div class="icon-circle lg">${ic('user')}</div><div><b style="font-size:20px">${title}</b>${nid ? `<div class="small">الهوية <span dir="ltr">${'•'.repeat(6)}${nid.slice(-4)}</span></div>` : ''}${ph ? `<div class="small" dir="ltr" style="text-align:right">+966 ${ph.slice(0, 1)}•• ••• ${ph.slice(-3)}</div>` : ''}${u.demo ? '<span class="badge-soft">حساب تجريبي</span>' : u.guest ? '<span class="badge-soft">بدون تسجيل</span>' : ''}</div></div>
        ${u.guest ? rowB('user', '<b>إنشاء حساب</b>', 'data-go="/register"') : ''}
        <div class="section-label">الخطة</div>
        ${rowB('shield', 'خطتي', 'data-go="/home"')}
        ${rowB('target', 'إعداد الدخل من جديد', 'data-go="/income"')}
        ${S.plan ? rowB('pencil', 'تعديل الخطة', 'data-go="/plan/edit"') : ''}
        <div class="section-label">النموذج الأولي</div>
        ${rowB('info', 'عن النموذج الأولي', 'data-go="/about"')}
        ${S.passcode ? rowB('lock', 'قفل التطبيق', 'data-action="lockNow"') : ''}
        ${rowB('refresh', '<span class="neg">إعادة ضبط التجربة</span>', 'data-action="confirmReset"', '')}`;
    },
  });
  ACTIONS.lockNow = () => { unlocked = false; go('/lock', { replace: true }); };
  ACTIONS.confirmReset = () => openSheet({ title: 'إعادة ضبط التجربة', html: '<p class="sub mb16 center">بنحذف الحساب والخطة والمحافظ المحفوظة على هذا الجهاز.</p><button class="btn" data-action="resetAll">نعم، أعد الضبط</button><button class="btn soft mt12" data-action="closeSheet">إلغاء</button>' });

  route('/about', {
    auth: true,
    view: () => `${topbar('عن النموذج الأولي', '', '/settings')}
      <div class="card"><h3 class="h3">سند</h3><p class="sub">مفهوم مقترح لأبيان المالية ضمن تحدي صُنّاع الحلول: خطة دخل شهري للمتقاعدين، يبنيها مستشار آلي يحاول يوصلك لدخلك المستهدف بحد أقصى ${RISK_CAP}% مخاطر على رأس المال خلال 12 شهر.</p></div>
      <div class="card"><h3 class="h3">الرحلة الأساسية</h3><ul class="checks" style="margin:6px 0 0">
        <li>${ic('check')}<a class="link" data-go="/register">التسجيل</a></li>
        <li>${ic('check')}<a class="link" data-go="/income">إعداد الدخل</a></li>
        <li>${ic('check')}<a class="link" data-go="/payments">عرض الدفعات</a></li>
        <li>${ic('check')}<a class="link" data-go="/plan/edit">تعديل الخطة</a></li></ul></div>
      <div class="warn mt16">${ic('info')}<span>كل الأرقام والعوائد في هذا النموذج توضيحية وليست توصية استثمارية. لا يتم تنفيذ أي عملية مالية، وبياناتك تُحفظ على جهازك فقط. نجمع إحصاءات استخدام مجهولة (الشاشات والنقرات) لتحسين النموذج، وما تكتبه في الحقول يبقى مخفيًا.</span></div>`,
  });

  /* ================= تشغيل ================= */
  if (!location.hash) history.replaceState(null, '', '#/splash');
  render();
})();
