import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const APP_VERSION = 'v0.5.0';

const getBrowserStorage = kind => {
  try { return kind === 'session' ? sessionStorage : localStorage; }
  catch { return null; }
};
const safeStorageRead = (kind, key, fallback = null) => {
  try { return getBrowserStorage(kind)?.getItem(key) ?? fallback; }
  catch { return fallback; }
};
const safeStorageWrite = (kind, key, value) => {
  try {
    const storage = getBrowserStorage(kind);
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch { return false; }
};
const safeStorageRemove = (kind, key) => {
  try {
    const storage = getBrowserStorage(kind);
    if (!storage) return false;
    storage.removeItem(key);
    return true;
  } catch { return false; }
};

const PLAN_PROFILES = {
  'business-basic': {
    label: 'Business Basic', shortName: 'Basic', family: 'business', price: 'NT$299／月',
    companyUsage: '1 / 1', employeeUsage: '4 / 5', companyLimit: 1,
    summary: '單店基礎人員、排班與打卡管理。',
    features: ['員工資料', '基礎排班', '出勤總覽'],
    allowedPages: ['admin-home', 'admin-schedule', 'people'],
    locked: ['請假審核', '公告互動', '薪資管理', '多分店'],
    hierarchy: '建立者 › 管理員 › 員工',
    upgradeNote: '不含多分店、完整薪資報表與自訂管理階層。',
    planned: [],
  },
  'business-pro': {
    label: 'Business Pro', shortName: 'Pro', family: 'business', price: 'NT$599／月',
    companyUsage: '2 / 3', employeeUsage: '4 / 10', companyLimit: 3,
    summary: '完整排班、請假審核、公告與薪資管理。',
    features: ['請假審核', '公告互動', '薪資管理'],
    allowedPages: ['admin-home', 'approvals', 'admin-schedule', 'admin-settings', 'publish', 'people', 'salary'],
    locked: ['跨店自訂角色', '進階分析'],
    hierarchy: '建立者 › 管理員 › 店長 › 主管 › 員工',
    upgradeNote: '最多 3 間店；跨店自訂角色與進階報表需 Premium。',
    planned: [],
  },
  'business-premium': {
    label: 'Business Premium', shortName: 'Premium', family: 'business', price: 'NT$999／月',
    companyUsage: '2 / 10', employeeUsage: '4 / 20', companyLimit: 10,
    summary: '多分店、完整薪資報表與進階角色權限。',
    features: ['Pro 全功能', '多分店資格', '20 人方案額度'],
    allowedPages: ['admin-home', 'approvals', 'admin-schedule', 'admin-settings', 'publish', 'people', 'salary'],
    locked: [],
    hierarchy: '建立者 › 管理員 › 區域主管 › 店長 › 主管 › 員工',
    upgradeNote: '完整企業方案資格。',
    planned: ['進階報表', '自訂角色', '安全稽核'],
  },
  'personal-solo': {
    label: 'Solo', shortName: 'Solo', family: 'personal', price: 'NT$69／月',
    companyUsage: '1 / 1', employeeUsage: '1 / 1', companyLimit: 1,
    summary: '一人使用的完整工時、排班與薪資管理。',
    features: ['排班打卡', '工時記錄', '薪資管理'],
    allowedPages: ['home', 'leave-schedule', 'clock', 'employee-salary', 'upload'],
    locked: ['目標 KPI', '績效評核'],
    planned: [],
  },
  'personal-performance': {
    label: 'Performance', shortName: 'Performance', family: 'personal', price: 'NT$149／月',
    companyUsage: '1 / 1', employeeUsage: '1 / 1', companyLimit: 1,
    summary: '在 Solo 基礎上增加目標、評核與績效分析。',
    features: ['Solo 全功能'],
    allowedPages: ['home', 'leave-schedule', 'clock', 'employee-salary', 'upload'],
    locked: [],
    planned: ['目標 KPI', '績效回饋', '績效分析'],
  },
  'free-personal-lite': {
    label: 'Personal Lite', shortName: 'Personal Lite', family: 'free', price: '免費',
    companyUsage: '1 / 1', employeeUsage: '1 / 1', companyLimit: 1,
    summary: '個人免費入口，提供基礎工時與手動打卡。',
    features: ['個人首頁', '基礎工時', '手動打卡'],
    allowedPages: ['home', 'leave-schedule', 'clock'],
    locked: ['薪資明細', '資料上傳', '績效功能'],
    planned: [],
  },
  'free-business-lite': {
    label: 'Business Lite', shortName: 'Business Lite', family: 'business', price: '免費',
    companyUsage: '1 / 1', employeeUsage: '4 / 5', companyLimit: 1,
    summary: '小團隊免費入口，提供單店人員與基礎排班。',
    features: ['小團隊人員', '基礎排班', '出勤總覽'],
    allowedPages: ['admin-home', 'admin-schedule', 'people'],
    locked: ['請假審核', '公告互動', '薪資管理', '進階設定', '多分店'],
    hierarchy: '建立者 › 管理員 › 員工',
    upgradeNote: '不含請假審核、薪資報表與多分店功能。',
    planned: [],
  },
};

const getPlanProfile = (account, role) => {
  const profile = PLAN_PROFILES[account?.planKey];
  if (profile && account?.role === role) return profile;
  return PLAN_PROFILES[role === 'admin' ? 'free-business-lite' : 'free-personal-lite'];
};

const BETA_TEMP_ACCOUNTS = {
  'login-business': [
    { account: 'ANG-BETA-BASIC', email: 'basic@ang-beta.test', password: 'AngBeta#2026', role: 'admin', planKey: 'business-basic', displayName: 'Basic 管理員' },
    { account: 'ANG-BETA-PRO', email: 'pro@ang-beta.test', password: 'AngBeta#2026', role: 'admin', planKey: 'business-pro', displayName: 'Pro 管理員' },
    { account: 'ANG-BETA-PREMIUM', email: 'premium@ang-beta.test', password: 'AngBeta#2026', role: 'admin', planKey: 'business-premium', displayName: 'Premium 管理員' },
  ],
  'login-personal': [
    { account: 'ANG-SOLO-01', employeeNo: 'ANG0601', email: 'solo@ang-beta.test', password: 'AngBeta#2026', role: 'employee', planKey: 'personal-solo', displayName: '陳小安' },
    { account: 'ANG-PERFORMANCE-01', employeeNo: 'ANG0602', email: 'performance@ang-beta.test', password: 'AngBeta#2026', role: 'employee', planKey: 'personal-performance', displayName: '林語晨' },
  ],
  'login-free': [
    { account: 'FREE-PERSONAL-LITE', email: 'personal-lite@ang-beta.test', code: '123456', role: 'employee', planKey: 'free-personal-lite', displayName: 'Personal Lite 用戶' },
    { account: 'FREE-BUSINESS-LITE', email: 'business-lite@ang-beta.test', code: '123456', role: 'admin', planKey: 'free-business-lite', displayName: 'Business Lite 管理員' },
  ],
};

const ALL_BETA_TEMP_ACCOUNTS = Object.values(BETA_TEMP_ACCOUNTS).flat();
const getCanonicalBetaAccount = candidate => {
  if (!candidate) return null;
  return ALL_BETA_TEMP_ACCOUNTS.find(account =>
    account.account === candidate.account &&
    account.email === candidate.email &&
    account.role === candidate.role &&
    account.planKey === candidate.planKey
  ) || null;
};
const readDemoSessionAccount = () => {
  try {
    const candidate = JSON.parse(safeStorageRead('session', 'ang-hr-demo-account', 'null'));
    const account = getCanonicalBetaAccount(candidate);
    return account?.role === safeStorageRead('session', 'ang-hr-demo-role') ? account : null;
  } catch {
    return null;
  }
};

const employeeNav = [
  ['leave-schedule', '▣', '排班'], ['clock', '↶', '打卡記錄'], ['home', '⌂', '員工主頁'],
  ['employee-salary', '▤', '薪資明細'], ['upload', '⇧', '資料上傳'],
];

const adminNav = [
  ['admin-home', '⌂', '總覽'], ['approvals', '✓', '審核'], ['admin-schedule', '▦', '排班'],
  ['admin-settings', '⚙', '設定'], ['people', '♙', '人員'], ['salary', '$', '薪資'],
];

const defaultEmployeeTheme = { colors: ['#f279d8', '#c39af2', '#7d83ef', '#50c9eb'], mode: 'forward', angle: 135 };
const defaultCompanyBrand = { logoText: 'ANG', companyName: 'ANG.lo Engine', subtitle: 'HR 系統' };
const defaultAdminSettings = {
  shifts: { mixedShift: false, fixedDayOff: '週一', earlyStart: '09:00', earlyEnd: '18:00', midStart: '11:00', midEnd: '20:00', lateStart: '13:00', lateEnd: '22:00', breakMinutes: 60 },
  clock: { beforeGraceMinutes: 15, afterGraceMinutes: 15, graceMinutes: 10, nfcPrimary: true, locationRequired: true, latitude: '25.033964', longitude: '121.564468', radius: 200, deviceRequired: true, qrFallback: true, manualRequest: true },
  leave: { selectionMode: 'weekly', weeklyStart: '週三', weeklyCutoff: '週五', weeklyPublish: '週六', monthlyStartDay: 20, monthlyCutoffDay: 25, monthlyPublishDay: 27, annualDays: 7, sickDays: 30, personalDays: 14, proofDays: 2 },
  approval: { multiLevel: true, leaveApprover: 'Manager', correctionApprover: 'Manager', uploadApprover: 'Manager', messageApprover: 'Manager', payrollApprover: 'Admin', levels: 2 },
  roles: { managerScope: '全公司與全部分店', supervisorScope: '所屬分店', employeeSelfService: true, managerLeave: true, managerCorrection: true, managerUpload: true, managerMessage: true, managerPayroll: false, adminLeave: false, adminCorrection: false, adminUpload: false, adminMessage: false, adminPayroll: true },
  payroll: { salaryType: '月薪', payday: 25, overtimeRate: 1.34, autoLabor: true, autoHealth: true, autoPension: true, exportEnabled: true },
};

const todayLabel = () => new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'long' }).format(new Date());
const shortTodayLabel = () => new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit' }).format(new Date());
const localDateKey = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; };

function normalizeData(saved = {}) {
  const legacyPublishedAt = saved.schedulePublishedAt || '';
  const schedulePublishedPeriods = {
    main: saved.schedulePublishedPeriods?.main || (legacyPublishedAt && saved.publishedSchedules?.main ? legacyPublishedAt : ''),
    current: saved.schedulePublishedPeriods?.current || (legacyPublishedAt && saved.publishedSchedules?.current ? legacyPublishedAt : ''),
  };
  const normalized = {
    ...initialState,
    ...saved,
    leaves: Array.isArray(saved.leaves) ? saved.leaves : initialState.leaves,
    messages: Array.isArray(saved.messages) ? saved.messages : initialState.messages,
    approvals: Array.isArray(saved.approvals) ? saved.approvals : initialState.approvals,
    employees: (Array.isArray(saved.employees) ? saved.employees : initialState.employees).map((person,index)=>({...person,employeeNo:/^ANG/i.test(person.employeeNo||'')?person.employeeNo:`ANG${String(601+index).padStart(4,'0')}`})),
    engagements: Array.isArray(saved.engagements) ? saved.engagements : initialState.engagements,
    uploads: Array.isArray(saved.uploads) ? saved.uploads : [],
    schedulePublishedPeriods,
    employeeTheme: { ...defaultEmployeeTheme, ...(saved.employeeTheme || {}) },
    companyBrand: { ...defaultCompanyBrand, ...(saved.companyBrand || {}) },
    adminSettings: {
      ...defaultAdminSettings,
      ...(saved.adminSettings || {}),
      shifts: { ...defaultAdminSettings.shifts, ...(saved.adminSettings?.shifts || {}) },
      clock: { ...defaultAdminSettings.clock, ...(saved.adminSettings?.clock || {}) },
      leave: { ...defaultAdminSettings.leave, ...(saved.adminSettings?.leave || {}) },
      approval: { ...defaultAdminSettings.approval, ...(saved.adminSettings?.approval || {}) },
      roles: { ...defaultAdminSettings.roles, ...(saved.adminSettings?.roles || {}) },
      payroll: { ...defaultAdminSettings.payroll, ...(saved.adminSettings?.payroll || {}) },
    },
  };
  if (normalized.attendanceDate !== localDateKey()) return { ...normalized, attendanceDate: localDateKey(), clockedIn: false, clockTime: '', clockOutTime: '' };
  return normalized;
}

function employeeGradient(theme = defaultEmployeeTheme) {
  const colors = theme.colors?.length === 4 ? theme.colors : defaultEmployeeTheme.colors;
  const order = theme.mode === 'cross' ? [colors[0], colors[2], colors[1], colors[3]] : theme.mode === 'reverse' ? [...colors].reverse() : colors;
  if (theme.mode === 'spread') return `radial-gradient(circle at 12% 18%, ${colors[0]} 0%, transparent 34%), radial-gradient(circle at 86% 18%, ${colors[1]} 0%, transparent 38%), linear-gradient(${theme.angle ?? 135}deg, ${colors[2]} 0%, ${colors[3]} 100%)`;
  return `linear-gradient(${theme.angle ?? 135}deg, ${order[0]} 0%, ${order[1]} 34%, ${order[2]} 68%, ${order[3]} 100%)`;
}

const initialState = {
  attendanceDate: localDateKey(),
  clockedIn: false,
  clockTime: '',
  clockOutTime: '',
  leaves: [],
  uploads: [],
  schedulePublishedPeriods: { main: '', current: '' },
  payrollSubmittedAt: '',
  messages: [
    { id: 1, author: '營運部', text: '本週五 16:00 進行月例會，請大家預留時間。', time: '今天 09:20' },
    { id: 2, author: '小安', text: '明天早班已確認，謝謝主管協助調整。', time: '昨天 18:42' },
  ],
  approvals: [
    { id: 1, name: '陳小安', type: '事假', date: '07/18', detail: '1 天', status: '待審核' },
    { id: 2, name: '林語晨', type: '補打卡', date: '07/14', detail: '下班 18:03', status: '待審核' },
    { id: 3, name: '王大文', type: '薪資確認', date: '07 月', detail: '$42,680', status: '待審核' },
  ],
  employees: [
    { id: 1, employeeNo: 'ANG0601', name: '陳小安', nickname: '小安', email: 'an@ang.local', phone: '0912-000-001', role: '正職人員', department: '營運部', branch: '台北總店', employmentType: '正職', shift: '早班', startDate: '2025-04-01', accessRole: '員工', status: '上班中' },
    { id: 2, employeeNo: 'ANG0602', name: '林語晨', nickname: '語晨', email: 'lin@ang.local', phone: '0912-000-002', role: '店長', department: '門市部', branch: '台北總店', employmentType: '正職', shift: '中班', startDate: '2024-08-15', accessRole: '店長', status: '休假' },
    { id: 3, employeeNo: 'ANG0603', name: '王大文', nickname: '大文', email: 'wang@ang.local', phone: '0912-000-003', role: '兼職人員', department: '門市部', branch: '信義分店', employmentType: '兼職', shift: '晚班', startDate: '2026-01-10', accessRole: '員工', status: '尚未打卡' },
    { id: 4, employeeNo: 'ANG0604', name: '李可晴', nickname: '可晴', email: 'lee@ang.local', phone: '0912-000-004', role: '正職人員', department: '營運部', branch: '信義分店', employmentType: '正職', shift: '早班', startDate: '2025-11-03', accessRole: '主管', status: '上班中' },
  ],
  engagements: [
    { id: 101, type: 'survey', title: '年終尾牙地點票選', target: '全體員工', content: '請選出你最希望舉辦尾牙的地點。', options: ['台北飯店宴會廳', '北投溫泉會館', '宜蘭包棟民宿'], deadline: '2026-07-25', createdAt: '今天 10:30', responses: [] },
  ],
  employeeTheme: defaultEmployeeTheme,
  companyBrand: defaultCompanyBrand,
  adminSettings: defaultAdminSettings,
};

function demoEmployeeProfile(data, activeAccount) {
  const employeeNo = activeAccount?.employeeNo || activeAccount?.account;
  const matched = data.employees.find(person => person.employeeNo === employeeNo);
  if (matched) return matched;
  const plan = getPlanProfile(activeAccount, 'employee');
  return {
    employeeNo: employeeNo || 'FREE-PERSONAL-LITE',
    name: activeAccount?.displayName || 'Personal Lite 用戶',
    nickname: plan.shortName,
    role: `${plan.shortName} 用戶`,
    branch: plan.family === 'business' ? 'Business Lite 工作區' : 'Personal 工作區',
    shift: '彈性班',
  };
}

function usePersistentState() {
  const [data, setData] = useState(() => {
    try { return normalizeData(JSON.parse(safeStorageRead('local', 'ang-hr-data', '{}'))); }
    catch { return normalizeData(); }
  });
  useEffect(() => { safeStorageWrite('local', 'ang-hr-data', JSON.stringify(data)); }, [data]);
  return [data, setData];
}

function Icon({ children }) { return <span className="icon" aria-hidden="true">{children}</span>; }

function ThemeToggle({ dark, onToggle, compact = false }) {
  if (compact) return <button className={`theme-switch ${dark ? 'dark-active' : 'day-active'}`} onClick={onToggle} aria-label="切換日光與暗夜模式"><span>☀</span><span>☾</span></button>;
  return <button className="icon-button" onClick={onToggle} aria-label="切換日夜模式">{dark ? '☀' : '☾'}</button>;
}

function ThemeChangeDialog({ nextDark, onComplete, onPageOnly, onCancel }) {
  const modeName = nextDark ? '暗夜' : '日光';
  return <div className="theme-dialog-backdrop" role="presentation">
    <section className="theme-dialog" role="dialog" aria-modal="true" aria-labelledby="theme-dialog-title">
      <div className="theme-dialog-symbol">?</div>
      <h2 id="theme-dialog-title">完整更換嗎？</h2>
      <p>要切換成{modeName}模式<br/>是否同步更換 App icon 與開場影片？</p>
      <div className="theme-dialog-actions">
        <button className="complete" onClick={onComplete}>完整更換</button>
        <button className="page-only" onClick={onPageOnly}>只切頁面</button>
        <button className="cancel" onClick={onCancel}>取消</button>
      </div>
    </section>
  </div>;
}

function Brand({ compact = false, companyBrand }) {
  const brand = companyBrand || { logoText: 'A', companyName: 'ANG HR', subtitle: '讓工作更靠近生活' };
  return <div className="brand"><div className="brand-mark">{(brand.logoText || 'A').slice(0, 4)}</div>{!compact && <div><strong>{brand.companyName}</strong><small>{brand.subtitle}</small></div>}</div>;
}

function OpeningVideo({ dark, onDone }) {
  const [failed, setFailed] = useState(false);
  const source = `${import.meta.env.BASE_URL}${dark ? 'ang-opening-day-to-night.mp4' : 'ang-opening-night-to-day.mp4'}`;
  const poster = `${import.meta.env.BASE_URL}${dark ? 'ang-entry-bg-night.png' : 'ang-entry-bg-day.png'}`;
  useEffect(() => {
    const guard = window.setTimeout(onDone, 7600);
    return () => window.clearTimeout(guard);
  }, [onDone, source]);
  return <div className={`opening-video ${dark ? 'night' : 'day'}`} role="dialog" aria-label={`${dark ? '暗夜' : '日光'}開場影片`}>
    {failed ? <div className="opening-video-fallback" style={{ backgroundImage: `url(${poster})` }}/>
      : <video key={source} autoPlay muted playsInline preload="auto" poster={poster} onEnded={onDone} onError={() => setFailed(true)}><source src={source} type="video/mp4"/></video>}
    <button onClick={onDone}>略過</button>
  </div>;
}

const managerCards = [
  { key: 'login', kind: 'login-unified', eyebrow: 'SECURE LOGIN', title: '登入系統', english: 'ANG HR' },
  { key: 'intro', kind: 'intro', title: '左右滑動選擇' },
  { key: 'free', kind: 'free', eyebrow: 'FREE', title: 'Free' },
  { key: 'personal', kind: 'personal', eyebrow: 'PERSONAL', title: 'Personal' },
  { key: 'business', kind: 'business', eyebrow: '企業方案', title: 'Business', price: '三種方案', suffix: '', tags: ['Basic 299', 'Pro 599', 'Premium 999'], note: '從基礎出勤到多分店、薪資報表與完整權限。' },
];

const encouragementMessages = [
  '歡迎回來，今天也一起加油。', '把今天的小事做好，就是很大的進步。', '照自己的節奏，也能走得很遠。',
  '今天的努力，正在累積明天的底氣。', '先完成最重要的一件事吧。', '穩穩前進，比急著抵達更重要。',
  '辛苦了，記得也替自己留一點空間。', '每一次整理，都讓工作更簡單。', '新的今天，也有新的可能。',
  '一步一步來，你已經做得很好。', '把複雜交給系統，把時間留給自己。', '今天也為理想的生活前進一點。',
  '專注現在，答案會慢慢清楚。', '完成比完美更接近下一步。', '你的每一份投入，都值得被看見。',
  '先深呼吸，再開始今天的工作。', '讓紀錄替你保存每一份努力。', '工作有條理，心裡也會更有餘裕。',
  '今天想完成的事，就從第一步開始。', '慢一點沒關係，別停下來就好。', '好好工作，也要好好生活。',
  '把時間花在真正重要的地方。', '每個清楚的紀錄，都是安心的開始。', '你不需要一次做到全部。',
  '先把今天過好，明天自然會靠近。', '相信累積的力量，也相信自己。', '整理好節奏，工作就不再追著你跑。',
  '今天的你，也值得一句做得很好。', '小小的完成，也是一種前進。', '清楚看見進度，就更有力量繼續。',
  '讓每一天，都留下值得記得的成果。', '別忘了，你也可以為自己工作。', '專心做好眼前，成長會自己發生。',
  '現在開始，就是最好的時間。', '把目標拆小，今天就會更輕鬆。', '你的節奏，不需要和別人一樣。',
  '多一點從容，也能有很好的成果。', '願今天的工作順利，也保有好心情。', '每一段認真，都在替未來鋪路。',
  '準備好了，就從這裡開始吧。',
];

const featureSlides = [
  { key: 'personal-start', icon: '◎', accent: 'cyan', title: '一個人也能用', description: '自由工作者、個人接案或單人工作室，不用先成立公司也能開始。', props: ['個人使用', '快速開始', '隨時升級'] },
  { key: 'personal-focus', icon: '✦', accent: 'violet', title: '管理自己的節奏', description: '記錄工時、薪資與目標，把每天的工作整理成看得見的進度。', props: ['工時', '薪資', '目標'] },
  { key: 'attendance', icon: '◷', accent: 'cyan', title: '排班出勤', description: '彈性排班與即時打卡，讓日常出勤一目瞭然。', props: ['班表', '打卡', '工時'] },
  { key: 'leave', icon: '◇', accent: 'violet', title: '請假補卡', description: '申請、附件與簽核集中處理，每個進度都清楚可追蹤。', props: ['請假', '補卡', '簽核'] },
  { key: 'payroll', icon: '$', accent: 'pink', title: '薪資管理', description: '整合工時、津貼與薪資明細，減少重複核算。', props: ['薪資', '津貼', '報表'] },
  { key: 'company', icon: '▦', accent: 'orange', title: '多店管理', description: '公司、分店與角色權限分層管理，跨店營運更直覺。', props: ['分店', '角色', '權限'] },
];

function ManagerCarousel({ onEnter }) {
  const railRef = useRef(null);
  const gestureRef = useRef(null);
  const settleTimerRef = useRef(null);
  const suppressClickRef = useRef(false);
  const introIndex = managerCards.findIndex(card => card.key === 'intro');
  const [active, setActive] = useState(introIndex);
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [encouragementIndex, setEncouragementIndex] = useState(() => Math.floor(Math.random() * encouragementMessages.length));
  const [tier, setTier] = useState('basic');
  const [personalTier, setPersonalTier] = useState('solo');
  const [loginForm, setLoginForm] = useState({ identifier: '', secret: '' });
  const [loginError, setLoginError] = useState('');
  const updateLogin = (field, value) => {
    setLoginForm(current => ({ ...current, [field]: value }));
    setLoginError('');
  };
  const enterUnified = () => {
    const identifier = loginForm.identifier.trim().toLowerCase();
    const expected = ALL_BETA_TEMP_ACCOUNTS.find(item =>
      (item.account.toLowerCase() === identifier || item.email.toLowerCase() === identifier) &&
      (item.password || item.code) === loginForm.secret
    );
    if (!expected) {
      setLoginError('帳號或登入密碼不正確，請重新確認。');
      return;
    }
    onEnter(expected.role, expected);
  };
  const tiers = {
    basic: { name: 'Basic', price: 'NT$299', people: '含 5 人', detail: '員工資料、基礎排班與打卡管理。' },
    pro: { name: 'Pro', price: 'NT$599', people: '含 10 人', detail: '完整排班、請假補卡、審核、公告與薪資管理。' },
    premium: { name: 'Premium', price: 'NT$999', people: '含 20 人', detail: '多分店、完整薪資、報表與進階角色權限。' },
  };
  const personalFeatures = [
    { name: '排班與打卡', solo: true },
    { name: '完整工時記錄', solo: true },
    { name: '請假與補卡', solo: true },
    { name: '薪資管理', solo: true },
    { name: '目標與 KPI 追蹤', solo: false },
    { name: '績效週期管理', solo: false },
    { name: '自評與主管評核', solo: false },
    { name: '一對一回饋紀錄', solo: false },
    { name: '績效趨勢分析', solo: false },
    { name: '績效報表匯出', solo: false },
  ];
  const businessFeatures = [
    { name: '員工資料管理', level: 1 },
    { name: '基礎排班與打卡', level: 1 },
    { name: '請假與補卡審核', level: 2 },
    { name: '公告與通知', level: 2 },
    { name: '完整薪資管理', level: 2 },
    { name: '加班與津貼規則', level: 2 },
    { name: '角色權限管理', level: 2 },
    { name: '營運報表匯出', level: 2 },
    { name: '多公司／多分店', level: 3 },
    { name: '進階績效與分析', level: 3 },
    { name: '自訂簽核流程', level: 3 },
    { name: '進階安全與稽核', level: 3 },
  ];
  const getCardLeft = (rail, card) => Math.max(0, card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2);
  const restoreRailSnap = rail => {
    rail.style.scrollSnapType = '';
    rail.style.scrollBehavior = '';
  };
  const scrollToCard = (index, behavior = 'smooth', settle = false) => {
    const rail = railRef.current;
    const card = rail?.children[index];
    if (!rail || !card) return;
    const left = getCardLeft(rail, card);
    window.clearTimeout(settleTimerRef.current);
    if (!settle) {
      rail.scrollTo({ left, behavior });
      return;
    }
    rail.style.scrollSnapType = 'none';
    rail.style.scrollBehavior = behavior;
    rail.scrollTo({ left, behavior });
    settleTimerRef.current = window.setTimeout(() => {
      rail.scrollTo({ left, behavior: 'auto' });
      restoreRailSnap(rail);
      settleTimerRef.current = null;
    }, behavior === 'smooth' ? 380 : 0);
  };
  useEffect(() => {
    requestAnimationFrame(() => scrollToCard(introIndex, 'auto'));
  }, [introIndex]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setEncouragementIndex(current => {
        const candidate = Math.floor(Math.random() * (encouragementMessages.length - 1));
        return candidate >= current ? candidate + 1 : candidate;
      });
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (expandedCard !== 'intro') return undefined;
    const timer = window.setInterval(() => setSelectedFeature(current => (current + 1) % featureSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, [expandedCard]);
  const move = direction => {
    const next = Math.max(0, Math.min(managerCards.length - 1, active + direction));
    setActive(next);
    setExpandedCard(null);
    scrollToCard(next);
  };
  const syncActive = e => {
    if (gestureRef.current || settleTimerRef.current) return;
    const rail = e.currentTarget;
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let nearest = 0;
    let distance = Infinity;
    [...rail.children].forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const delta = Math.abs(center - cardCenter);
      if (delta < distance) { distance = delta; nearest = index; }
    });
    if (nearest !== active) {
      setActive(nearest);
      setExpandedCard(null);
    }
  };
  const startCardGesture = (event, key, index) => {
    if (expandedCard) return;
    const rail = railRef.current;
    if (!rail || !event.isPrimary || event.button > 0) return;
    gestureRef.current = {
      key,
      index,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startScrollLeft: rail.scrollLeft,
      axis: null,
      moved: false,
    };
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = null;
    rail.style.scrollSnapType = 'none';
    rail.style.scrollBehavior = 'auto';
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const moveCardGesture = event => {
    const gesture = gestureRef.current;
    const rail = railRef.current;
    if (!gesture || !rail || gesture.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) >= 9) {
      gesture.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
    }
    if (!gesture.axis) return;
    gesture.moved = true;
    event.preventDefault();
    if (gesture.axis === 'x') rail.scrollLeft = gesture.startScrollLeft - dx;
    else rail.scrollLeft = gesture.startScrollLeft;
  };
  const endCardGesture = (event, key, cancelled = false) => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (!gesture || gesture.key !== key || gesture.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (gesture.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
    if (cancelled) {
      scrollToCard(gesture.index, 'smooth', true);
      return;
    }
    if (gesture.axis === 'x') {
      const direction = Math.abs(dx) >= 34 ? (dx < 0 ? 1 : -1) : 0;
      const next = Math.max(0, Math.min(managerCards.length - 1, gesture.index + direction));
      setActive(next);
      setExpandedCard(null);
      scrollToCard(next, 'smooth', true);
      return;
    }
    scrollToCard(gesture.index, 'auto', true);
    if (gesture.axis === 'y' && Math.abs(dy) >= 42) setExpandedCard(dy < 0 ? key : null);
  };
  const goToCard = key => {
    const index = managerCards.findIndex(card => card.key === key);
    setExpandedCard(null);
    setActive(index);
    requestAnimationFrame(() => scrollToCard(index, 'smooth', true));
  };
  const featured = featureSlides[selectedFeature];
  const featurePanel = <section className="feature-modal feature-modal-inline" aria-label="ANG HR 功能介紹">
    <button className="feature-modal-close" aria-label="關閉功能介紹" onClick={() => setExpandedCard(null)}>×</button>
    <h2>今天想先了解什麼？</h2>
    <article className={`feature-showcase ${featured.accent}`} aria-live="polite">
      <div className="feature-illustration" aria-hidden="true"><i>{featured.icon}</i><span/><span/><b>{selectedFeature + 1}</b></div>
      <div className="feature-slide-copy"><small>FEATURE {String(selectedFeature + 1).padStart(2, '0')}</small><strong>{featured.title}</strong><p>{featured.description}</p><div>{featured.props.map(item => <span key={item}>{item}</span>)}</div></div>
    </article>
    <div className="feature-grid" aria-label="選擇功能介紹">
      {featureSlides.map((feature, index) => <button key={feature.key} className={`${feature.accent} ${selectedFeature === index ? 'active' : ''}`} aria-pressed={selectedFeature === index} onClick={() => setSelectedFeature(index)}><i aria-hidden="true">{feature.icon}</i><span><small>{String(index + 1).padStart(2, '0')}</small><strong>{feature.title}</strong></span></button>)}
    </div>
    <div className="feature-panel-actions"><button onClick={() => goToCard('login')}>登入系統</button><button onClick={() => goToCard('free')}>查看方案</button></div>
    <button className="feature-modal-collapse" aria-label="收起功能介紹" onClick={() => setExpandedCard(null)}>⌃ 收起</button>
  </section>;
  return <div className={`manager-carousel-wrap ${expandedCard ? 'has-expanded' : ''}`}>
    {!expandedCard && <div className={`manager-pull-cue ${managerCards[active].kind}`} aria-hidden="true"><i/><i/><i/><span>展開卡片 ↑</span></div>}
    <div className="manager-carousel" ref={railRef} onScroll={syncActive}>
      {managerCards.map((card, index) => <article key={card.key} data-manager-card={card.key} onClickCapture={event => { if (suppressClickRef.current) { event.preventDefault(); event.stopPropagation(); } }} onPointerDown={event => startCardGesture(event, card.key, index)} onPointerMove={moveCardGesture} onPointerUp={event => endCardGesture(event, card.key)} onPointerCancel={event => endCardGesture(event, card.key, true)} className={`manager-card ${card.kind} ${active === index ? 'active' : ''} ${expandedCard === card.key ? 'expanded' : 'collapsed'}`}>
        <button className="manager-card-toggle" aria-expanded={expandedCard === card.key} onClick={() => setExpandedCard(current => current === card.key ? null : card.key)}><span className="pull-bar"/><em>{expandedCard === card.key ? '收合卡片 ↓' : '展開卡片 ↑'}</em></button>
        {card.kind === 'intro' ? expandedCard === 'intro' ? featurePanel : <div className="intro-card-content">
          <div className="eyebrow encouragement-message" aria-live="polite">{encouragementMessages[encouragementIndex]}</div>
          <div className="gesture-directions"><span className="swipe-direction swipe-left"><b className="neon-swipe" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></b><em>左滑登入系統</em></span><span className="swipe-direction swipe-right"><b className="neon-swipe" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></b><em>右滑查看方案</em></span></div>
        </div> : card.kind === 'login-unified' ? <div className="manager-card-body login-card-body unified-login-body">
          <div className="login-card-title"><h2>{card.title}</h2><small>{card.english}</small></div><p className="login-description">輸入一組登入資料，系統會自動辨識身分、方案與工作區。</p>
          <label className="system-code access-code"><span>Email／帳號／公司代號</span><input autoCapitalize="none" autoCorrect="off" aria-label="Email、帳號或公司代號" value={loginForm.identifier} onChange={event=>updateLogin('identifier',event.target.value)} placeholder="輸入 Email、帳號或公司代號"/></label>
          <label className="login-email">密碼／驗證碼<input aria-label="密碼或驗證碼" type="password" value={loginForm.secret} onChange={event=>updateLogin('secret',event.target.value)} placeholder="輸入密碼或 6 位驗證碼"/></label>
          {loginError&&<small className="beta-auth-error">{loginError}</small>}<button className="card-main-action" disabled={!loginForm.identifier.trim()||!loginForm.secret} onClick={enterUnified}>登入 ANG HR</button>
        </div> : card.kind === 'free' ? <div className="manager-card-body free-card-body">
          <div className="plan-card-top"><span>{card.eyebrow}</span><b>NT$0</b></div><h2>{card.title}</h2>
          <p>先選擇適合自己的免費入口，之後需要更多功能再升級。</p>
          <div className="lite-options">
            <button className="lite-option personal-lite" onClick={() => goToCard('login')}><span>個人使用</span><strong>Personal Lite</strong><b>前往登入 →</b></button>
            <button className="lite-option business-lite" onClick={() => goToCard('login')}><span>小團隊使用</span><strong>Business Lite</strong><b>前往登入 →</b></button>
          </div>
        </div> : card.kind === 'personal' ? <div className={`manager-card-body personal-card-body ${personalTier}`}>
          <div className="plan-card-top"><span>{card.eyebrow}</span><b>個人方案</b></div><h2>{card.title}</h2>
          <p>依照需要的管理深度，選擇適合自己的個人方案。</p>
          <div className="personal-options">
            <button aria-pressed={personalTier === 'solo'} className={`personal-option solo-option ${personalTier === 'solo' ? 'selected' : ''}`} onClick={() => { setPersonalTier('solo'); setExpandedCard('personal'); }}><span>個人基礎</span><strong>Solo</strong><b>NT$69 <em>/ 月</em></b></button>
            <button aria-pressed={personalTier === 'performance'} className={`personal-option performance-option ${personalTier === 'performance' ? 'selected' : ''}`} onClick={() => { setPersonalTier('performance'); setExpandedCard('personal'); }}><span>個人進階</span><strong>Performance</strong><b>NT$149 <em>/ 月</em></b></button>
          </div>
          <div className="performance-feature-area">
            <div className="feature-area-heading"><strong>Performance 完整功能</strong><small>{personalTier === 'solo' ? '彩色為 Solo 已包含' : 'Performance 全功能已亮起'}</small></div>
            <div className="performance-features">{personalFeatures.map(feature => {
              const included = personalTier === 'performance' || feature.solo;
              return <div key={feature.name} className={`performance-feature ${included ? 'included' : 'dimmed'}`}><i>{included ? '✓' : '–'}</i><span>{feature.name}</span></div>;
            })}</div>
            <button className="card-main-action personal-select-action" onClick={() => goToCard('login')}>選擇 {personalTier === 'solo' ? 'Solo' : 'Performance'} 並前往登入</button>
          </div>
        </div> : card.kind === 'business' ? <div className={`manager-card-body business-card-body ${tier}`}>
          <div className="plan-card-top"><span>{card.eyebrow}</span><b>企業方案</b></div><h2>{card.title}</h2>
          <p>依團隊規模與管理深度，選擇適合的企業方案。</p>
          <div className="business-options">{Object.entries(tiers).map(([key, item]) => <button key={key} aria-pressed={tier === key} className={`business-option ${key}-option ${tier === key ? 'selected' : ''}`} onClick={() => { setTier(key); setExpandedCard('business'); }}><span>{item.people}</span><strong>{item.name}</strong><b>{item.price}<em>/ 月</em></b></button>)}</div>
          <div className="business-feature-area">
            <div className="feature-area-heading"><strong>Premium 完整功能</strong><small>{tier === 'premium' ? 'Premium 全功能已亮起' : `彩色為 ${tiers[tier].name} 已包含`}</small></div>
            <div className="business-features">{businessFeatures.map(feature => {
              const included = feature.level <= ({ basic: 1, pro: 2, premium: 3 })[tier];
              return <div key={feature.name} className={`business-feature ${included ? 'included' : 'dimmed'}`}><i>{included ? '✓' : '–'}</i><span>{feature.name}</span></div>;
            })}</div>
            <button className="card-main-action business-select-action" onClick={() => goToCard('login')}>選擇 {tiers[tier].name} 並前往登入</button>
          </div>
        </div> : <div className="manager-card-body">
          <div className="plan-card-top"><span>{card.eyebrow}</span><b>{card.kind === 'business' ? '企業方案' : 'Personal'}</b></div><h2>{card.title}</h2>
          <div className="manager-price">{card.price}<small>{card.suffix}</small></div><div className="manager-tags">{card.tags.map(tag => <span key={tag}>{tag}</span>)}</div><p>{card.note}</p>
          {card.kind === 'business' && <><div className="tier-selector">{Object.entries(tiers).map(([key, item]) => <button key={key} className={tier === key ? 'active' : ''} onClick={() => setTier(key)}><strong>{item.name}</strong><span>{item.price}</span></button>)}</div><div className="tier-detail"><strong>{tiers[tier].name}・{tiers[tier].people}</strong><p>{tiers[tier].detail}</p></div></>}
          {card.kind !== 'contact' && <button className="card-main-action" onClick={() => goToCard('login')}>選擇 {card.title} 並前往登入</button>}{card.kind === 'contact' && <button className="card-main-action">聯絡 ANG SYSTEM</button>}
        </div>}
      </article>)}
    </div>
  </div>;
}

function Landing({ dark, setDark, onEnter }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  return <main className={`landing ${dark ? 'night' : 'day'}`}>
    <div className="landing-shade" />
    <header className="landing-top"><Brand /><div className="landing-top-actions"><span className="beta-version">{APP_VERSION}</span><button className="feedback-link" onClick={() => { setFeedbackOpen(true); setFeedbackSent(false); }}>意見與聯絡</button><ThemeToggle dark={dark} onToggle={() => setDark(!dark)} /></div></header>
    <section className="landing-content manager-mode"><div className="manager-view"><ManagerCarousel onEnter={onEnter}/></div></section>
    {feedbackOpen && <div className="feedback-overlay" onClick={() => setFeedbackOpen(false)}><section className="feedback-panel" onClick={event => event.stopPropagation()}><button className="feedback-close" onClick={() => setFeedbackOpen(false)}>×</button><div className="eyebrow">聯絡 ANG</div><h2>意見與聯絡</h2>{feedbackSent ? <div className="feedback-thanks">已暫存於此裝置；目前尚未連接客服信箱。</div> : <><label>聯絡 Email<input type="email" placeholder="name@example.com"/></label><label>想告訴我們的事<textarea rows="5" placeholder="問題回報、功能建議或企業導入需求"/></label><button className="card-main-action" onClick={() => setFeedbackSent(true)}>儲存意見</button></>}</section></div>}
  </main>;
}

function Topbar({ role, dark, setDark, onExit, onHome, data, setData, activeAccount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joined, setJoined] = useState(false);
  const isBusiness = role === 'admin';
  const plan = getPlanProfile(activeAccount, role);
  const canEditBrand = isBusiness && plan.allowedPages.includes('admin-settings');
  const companyBrand = data?.companyBrand || defaultCompanyBrand;
  const updateCompanyBrand = (key, value) => {
    if (!canEditBrand) return;
    setData?.(current => ({ ...current, companyBrand: { ...(current.companyBrand || defaultCompanyBrand), [key]: value } }));
  };
  const topCompanyName = companyBrand.companyName === 'ANG.lo Engine' ? 'ANG.lo' : companyBrand.companyName;
  const accountId = activeAccount?.account || (isBusiness ? 'ANG-ADM001' : 'ANG0601');
  const accountName = activeAccount?.displayName || (isBusiness ? '管理員 A' : '陳小安');
  const systemWatermark = `${isBusiness ? 'HQ01 • ANG 總部' : 'TP01 • 台北總店'} | HR System | ${accountId} | ${APP_VERSION}`;
  const businessIdentities = [
    { name: 'ANG 餐飲集團', store: '全部店家', role: '建立者', level: 'L1' },
    { name: '台北總店', store: '主要店家', role: '店長', level: 'L2' },
    { name: '信義分店', store: '分店', role: '主管', level: 'L3' },
  ];
  const identities = isBusiness ? businessIdentities.slice(0, plan.companyLimit > 1 ? 3 : 2) : [
    { name: '我的 Personal', store: '個人工作空間', role: '擁有者', level: 'L1' },
    { name: '台北總店', store: '公司代碼加入', role: '正職員工', level: 'L4' },
  ];
  return <>
    <header className="topbar system-topbar"><button className="brand-menu-trigger compact-brand-trigger" aria-label="開啟帳號與公司選單" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}><Brand compact companyBrand={companyBrand}/><span>⌄</span></button><div className="topbar-system-info"><div><strong>{topCompanyName}<i>•</i>{plan.label}</strong><ThemeToggle compact dark={dark} onToggle={() => setDark(!dark)} /></div><small>{systemWatermark}</small></div>
      {menuOpen && <div className="account-menu">
        <div className="account-menu-user"><span>{accountName.slice(0,1)}</span><p><strong>{accountName}</strong><small>{accountId} · {plan.label}</small></p></div>
        <div className="account-menu-actions"><button onClick={() => { onHome(); setMenuOpen(false); }}><i>⌂</i><p><strong>首頁</strong><small>回到目前身分的首頁</small></p><b>›</b></button><button onClick={() => { onExit(); setMenuOpen(false); }}><i>⇄</i><p><strong>切換帳號</strong><small>返回入口選擇其他帳號</small></p><b>›</b></button></div>
        <div className="workspace-summary"><div><small>方案</small><strong>{plan.shortName}</strong></div><div><small>公司／工作區</small><strong>{plan.companyUsage}</strong></div><div><small>人員額度</small><strong>{plan.employeeUsage}</strong></div></div>
        {isBusiness && <div className="brand-text-settings"><div><strong>公司品牌顯示</strong><small>{canEditBrand ? '未上傳 Logo 時顯示自訂字詞' : `${plan.label} 僅供檢視；升級 Business Pro 可編輯品牌`}</small></div>{canEditBrand ? <><label>Logo 字詞<input value={companyBrand.logoText} maxLength="4" onChange={event => updateCompanyBrand('logoText', event.target.value)}/></label><label>公司名稱<input value={companyBrand.companyName} onChange={event => updateCompanyBrand('companyName', event.target.value)}/></label><label>公司副名稱<input value={companyBrand.subtitle} onChange={event => updateCompanyBrand('subtitle', event.target.value)}/></label></> : <><div className="brand-readonly-row"><span>Logo 字詞</span><strong>{companyBrand.logoText || '—'}</strong></div><div className="brand-readonly-row"><span>公司名稱</span><strong>{companyBrand.companyName || '—'}</strong></div><div className="brand-readonly-row"><span>公司副名稱</span><strong>{companyBrand.subtitle || '—'}</strong></div></>}</div>}
        <div className="identity-ranking"><div className="identity-ranking-head"><strong>身分與店家</strong><small>依管理資格排序</small></div>{identities.map((identity, index) => <button key={`${identity.name}-${identity.role}`}><b>{index + 1}</b><p><strong>{identity.name}</strong><small>{identity.store}</small></p><span><em>{identity.level}</em>{identity.role}</span></button>)}</div>
        {isBusiness && <div className="plan-hierarchy"><span>{plan.label} 方案資格</span><p>{plan.hierarchy}</p><small>{plan.upgradeNote}</small></div>}
        {!isBusiness && <p className="identity-note">目前方案：{plan.label}。資料僅儲存於此裝置。</p>}
        <button className="add-company-menu" onClick={() => { setAddCompanyOpen(true); setMenuOpen(false); }}>＋ 增加公司或工作身分</button>
        <button className="exit-menu" onClick={onExit}>返回登入入口</button>
      </div>}
    </header>
    {addCompanyOpen && <div className="company-overlay" onClick={() => setAddCompanyOpen(false)}><section className="company-panel" onClick={event => event.stopPropagation()}><button className="company-close" onClick={() => setAddCompanyOpen(false)}>×</button><div className="eyebrow">WORKSPACES</div><h2>增加公司</h2><p>你可以加入別人的公司，或建立自己的 Personal 工作空間。</p>
      <div className="company-choice join-company"><span>受邀加入</span><h3>輸入公司代碼</h3><p>目前只保存代碼於此裝置，尚未連接公司邀請服務。</p>{joined ? <strong className="join-success">代碼已保存（尚未送出申請）</strong> : <div className="company-code-row"><input value={joinCode} onChange={event => setJoinCode(event.target.value)} placeholder="例如 ANG-2026"/><button onClick={() => joinCode.trim() && setJoined(true)}>保存代碼</button></div>}</div>
      <div className="company-choice buy-personal"><span>自己建立</span><h3>購買 Personal 個人版</h3><p>Personal 預設包含 1 間公司與 1 個員工身分，可依需求加購功能模組。</p><button onClick={() => setAddCompanyOpen(false)}>查看 Personal 方案</button></div>
      {isBusiness && <div className="business-quota-note"><strong>Business 方案資格</strong><span>Basic：1 店・基本管理階層</span><span>Pro：最多 3 店・增加店長與主管</span><span>Premium：更多店家・自訂階層與跨店權限</span></div>}
    </section></div>}
  </>;
}

function BottomNav({ items, page, setPage, role }) {
  return <nav className={`bottom-nav ${role}`}>{items.map(([id, icon, label]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon>{icon}</Icon><span>{label}</span></button>)}</nav>;
}

function Card({ title, action, children, className = '' }) {
  return <section className={`card ${className}`}><div className="card-heading"><h3>{title}</h3>{action}</div>{children}</section>;
}

function PlanScopeCard({ activeAccount, role }) {
  const plan = getPlanProfile(activeAccount, role);
  return <section className={`plan-scope-card ${plan.family}`} aria-label={`${plan.label} 方案範圍`}>
    <div className="plan-scope-title"><div><small>目前方案</small><strong>{plan.label}</strong></div><b>{plan.price}</b></div>
    <p>{plan.summary}</p>
    <div className="plan-scope-features">{plan.features.map(feature => <span key={feature}>✓ {feature}</span>)}</div>
    {(plan.planned || []).length > 0 && <small className="plan-scope-planned">方案包含・尚未連接：{plan.planned.join('、')}</small>}
    {plan.locked.length > 0 && <small className="plan-scope-locked">此方案不含：{plan.locked.join('、')}</small>}
    <small className="plan-scope-quota">公司／工作區 {plan.companyUsage} · 人員 {plan.employeeUsage}</small>
  </section>;
}

function EmployeeThemeCard({ data, setData }) {
  const theme = data.employeeTheme || defaultEmployeeTheme;
  const update = patch => setData(current => ({ ...current, employeeTheme: { ...(current.employeeTheme || defaultEmployeeTheme), ...patch } }));
  const setColor = (index, color) => update({ colors: theme.colors.map((value, itemIndex) => itemIndex === index ? color : value) });
  const modes = [['forward', '順向'], ['cross', '交錯'], ['spread', '分散'], ['reverse', '反向']];
  return <Card className="theme-customizer" title="主題顏色" action={<span className="theme-custom-label">自訂四色・即時套用</span>}>
    <p className="theme-custom-help">下面四格都可自訂，整體漸層會直接使用這四種顏色。</p>
    <div className="theme-mode-grid">{modes.map(([key, label]) => <button key={key} className={theme.mode === key ? 'active' : ''} onClick={() => update({ mode: key })}><span style={{ background: employeeGradient({ ...theme, mode: key }) }} />{label}</button>)}</div>
    <div className="gradient-direction"><button aria-label="漸層方向逆時針" onClick={() => update({ angle: ((theme.angle ?? 135) - 45 + 360) % 360 })}>↶</button><div style={{ background: employeeGradient(theme) }}><strong>漸層方向</strong><small>{theme.angle ?? 135}°</small></div><button aria-label="漸層方向順時針" onClick={() => update({ angle: ((theme.angle ?? 135) + 45) % 360 })}>↷</button></div>
    <div className="theme-color-inputs">{theme.colors.map((color, index) => <label key={index}><span>色{index + 1}</span><input aria-label={`主題色 ${index + 1}`} type="color" value={color} onChange={event => setColor(index, event.target.value)}/></label>)}</div>
    <button className="theme-reset" onClick={() => update(defaultEmployeeTheme)}>套回預設四色</button>
  </Card>;
}

function HomeClockCard({ data, setData }) {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('zh-TW', { hour:'2-digit', minute:'2-digit' }));
  useEffect(() => { const id = setInterval(() => setTime(new Date().toLocaleTimeString('zh-TW', { hour:'2-digit', minute:'2-digit' })), 30000); return () => clearInterval(id); }, []);
  const completed = Boolean(data.clockOutTime);
  const clock = () => setData(current => current.clockedIn ? ({ ...current, attendanceDate: localDateKey(), clockedIn: false, clockOutTime: time }) : current.clockOutTime ? current : ({ ...current, attendanceDate: localDateKey(), clockedIn: true, clockTime: time, clockOutTime: '' }));
  return <div className="clock-hero home-full-clock"><div className="clock-ring"><small>現在時間</small><strong>{time}</strong><span>{todayLabel()}</span></div><p className="beta-clock-warning"><span className="pulse" />手動打卡模式 · 尚未驗證定位、NFC 或裝置</p><button onClick={clock} disabled={completed} className={data.clockedIn ? 'clock-out' : completed ? 'clock-complete' : ''}>{data.clockedIn ? '手動下班' : completed ? '今日完成' : '手動上班'}<small>{data.clockedIn ? `上班時間 ${data.clockTime}` : completed ? `下班時間 ${data.clockOutTime}` : '僅儲存於此裝置'}</small></button></div>;
}

function EmployeeHome({ data, setData, go, employee, activeAccount, plan }) {
  const [message, setMessage] = useState('');
  const [engagementAnswers,setEngagementAnswers]=useState({});
  const employeeNo = employee.employeeNo;
  const send = () => { if (!message.trim()) return; setData(d => ({ ...d, messages: [{ id: Date.now(), author: employee.name, text: message.trim(), time: '剛剛' }, ...d.messages] })); setMessage(''); };
  const answerEngagement=(item,answer)=>{if(!answer)return;setData(current=>({...current,engagements:(current.engagements||[]).map(entry=>entry.id===item.id?{...entry,responses:[...(entry.responses||[]).filter(response=>response.employeeId!==employeeNo),{employeeId:employeeNo,employeeName:employee.name,answer,answeredAt:'剛剛'}]}:entry)}));setEngagementAnswers(current=>({...current,[item.id]:answer}))};
  const attendanceStatus = data.clockedIn ? '上班中' : data.clockOutTime ? '已下班' : data.clockTime ? '已打上班卡' : '尚未打卡';
  return <>
    <PlanScopeCard activeAccount={activeAccount} role="employee"/>
    <section className="hero employee-gradient employee-profile-hero"><div className="employee-profile-main"><div className="employee-profile-avatar">{employee.name.slice(0,1)}</div><div className="employee-profile-copy"><span className="hero-kicker">EMPLOYEE PROFILE · {shortTodayLabel()}</span><h1>{employee.name}</h1><p><b>綽號：{employee.nickname}</b><span>{employeeNo} · {employee.role}</span></p></div></div><div className="hero-status"><small>今日狀態</small><strong>{attendanceStatus}</strong><span>{data.clockedIn ? `上班 ${data.clockTime}` : data.clockOutTime ? `下班 ${data.clockOutTime}` : '預計 09:00'}</span></div></section>
    <HomeClockCard data={data} setData={setData}/>
    <div className="stat-grid employee-home-stats"><button onClick={() => go('leave-schedule')}><small>明日班別</small><strong>早班</strong><span>09:00–18:00</span></button><button onClick={() => go('clock')}><small>今日狀態</small><strong>{attendanceStatus}</strong><span>{data.clockOutTime || data.clockTime || '預計 09:00'}</span></button></div>
    {plan.allowedPages.includes('employee-salary') ? <section className="earnings-overview" onClick={() => go('employee-salary')}><div className="earnings-heading"><div><span>本月薪資累計</span><strong>$42,680</strong><small>本月 25 日發薪・依管理者設定</small></div><b>本月</b></div><div className="earnings-week"><p><span>本週累計</span><strong>$10,670</strong><small>依目前已完成打卡統計</small></p><p><span>本週工時</span><strong>31.5h</strong><small>本月累計 127.5h</small></p></div></section> : <Card title="薪資功能" action={<span className="pill">方案未包含</span>}><p className="settings-beta-note">{plan.label} 不顯示薪資金額或薪資明細；升級 Solo 即可使用薪資管理。</p></Card>}
    <Card title="接下來的班表" action={<button className="text-button" onClick={() => go('leave-schedule')}>查看全部</button>}><div className="timeline"><div><b>16</b><span>週四</span><i className="pink" /><p><strong>早班</strong><small>09:00–18:00 · 台北總店</small></p></div><div><b>17</b><span>週五</span><i className="purple" /><p><strong>中班</strong><small>11:00–20:00 · 台北總店</small></p></div></div></Card>
    <Card title="提醒事項"><div className="notice-list"><button><span className="notice-icon amber">!</span><p><strong>補打卡待補件</strong><small>請於 07/17 前上傳相關證明</small></p><b>›</b></button>{plan.allowedPages.includes('employee-salary') && <button><span className="notice-icon blue">✦</span><p><strong>七月份薪資已開放確認</strong><small>確認截止日 07/20</small></p><b>›</b></button>}</div></Card>
    <Card title="公告與互動"><div className="employee-engagements">{(data.engagements||[]).map(item=>{const answered=(item.responses||[]).find(response=>response.employeeId===employeeNo);const answer=engagementAnswers[item.id]??answered?.answer??'';return <article key={item.id} className={`engagement-card ${item.type}`}><div className="engagement-meta"><span>{item.type==='survey'?'問卷票選':item.type==='form'?'回覆表單':item.type==='scheduled'?'定期公告':'一般公告'}</span><em>{item.target}</em></div><strong>{item.title}</strong><p>{item.content}</p>{item.type==='survey'&&<div className="survey-options">{item.options.map(option=><button key={option} className={answer===option?'selected':''} onClick={()=>setEngagementAnswers(current=>({...current,[item.id]:option}))}>{option}<i>{answer===option?'✓':''}</i></button>)}<button className="engagement-submit" disabled={!answer} onClick={()=>answerEngagement(item,answer)}>{answered?'更新票選':'送出票選'}</button></div>}{item.type==='form'&&<div className="employee-response-form"><textarea value={answer} onChange={event=>setEngagementAnswers(current=>({...current,[item.id]:event.target.value}))} placeholder={item.responsePrompt||'輸入你的回答'}/><button disabled={!answer.trim()} onClick={()=>answerEngagement(item,answer.trim())}>{answered?'更新回答':'送出回答'}</button></div>}{item.type==='scheduled'&&<small>{item.recurrence||'定期'} · {item.scheduleAt||'依排程發布'}</small>}{answered&&<small className="answered-note">已回答：{answered.answer}</small>}</article>})}</div></Card>
    <Card title="留言交流"><div className="composer"><input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="寫下想說的話…"/><button onClick={send}>送出</button></div><div className="messages">{data.messages.slice(0, 3).map(m => <article key={m.id}><span>{m.author.slice(0, 1)}</span><p><strong>{m.author}<small>{m.time}</small></strong>{m.text}</p></article>)}</div></Card>
    <EmployeeThemeCard data={data} setData={setData}/>
  </>;
}

function SchedulePage({data,employee}) {
  const [period,setPeriod]=useState('current');
  const weekdays=['一','二','三','四','五','六','日'];
  const fallback=['公','班','班','班','班','班','休'];
  const publishedAt=data.schedulePublishedPeriods?.[period] || (data.schedulePublishedAt && data.publishedSchedules?.[period] ? data.schedulePublishedAt : '');
  const publishedSchedule=publishedAt ? data.publishedSchedules?.[period]?.[employee?.id] : null;
  const schedule=(publishedSchedule||fallback).map(value=>value==='休'?'休':value==='公'?'公休':'班');
  const monday=(()=>{const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()-((date.getDay()+6)%7)+(period==='main'?7:0));return date})();
  const dates=weekdays.map((weekday,index)=>{const date=new Date(monday);date.setDate(monday.getDate()+index);return {weekday,day:date.getDate(),month:date.getMonth()+1,date,value:schedule[index]||'休'}});
  const workDays=dates.filter(item=>item.value==='班').length;
  const today=new Date();
  const shiftName=employee?.shift||'早班';
  const shiftTimes={早班:'09:00–18:00',中班:'11:00–20:00',晚班:'13:00–22:00','彈性班':'依當日通知'};
  const range=`${dates[0].month} 月 ${dates[0].day} 日 — ${dates[6].month} 月 ${dates[6].day} 日`;
  return <><div className="page-title"><div><span>MY SCHEDULE</span><h1>我的排班</h1></div><span className="employee-schedule-status">{publishedAt?'已發布':'尚未發布'}</span></div>
    <div className="employee-schedule-tabs"><button className={period==='current'?'active':''} onClick={()=>setPeriod('current')}><strong>本週班表</strong><small>{data.schedulePublishedPeriods?.current?'主管已更新':'目前預設班表'}</small></button><button className={period==='main'?'active':''} onClick={()=>setPeriod('main')}><strong>下週班表</strong><small>{data.schedulePublishedPeriods?.main?'主管已發布':'等待主管發布'}</small></button></div>
    <section className="employee-schedule-hero employee-gradient"><div><small>{employee?.employeeNo} · {employee?.branch}</small><h2>{period==='current'?'本週工作安排':'下週工作安排'}</h2><p>{range}</p></div><strong>{workDays}<small> 天班</small></strong></section>
    <Card className="calendar-card" title={range}><div className="week-grid employee-week-grid">{dates.map(item=>{const isToday=item.date.toDateString()===today.toDateString();return <div key={`${item.month}-${item.day}`} className={`${isToday?'today':''} ${item.value!=='班'?'off':''}`}><small>週{item.weekday}</small><b>{item.day}</b><span>{item.value}</span></div>})}</div></Card>
    <Card title="班表摘要"><div className="summary-row"><div><small>排班天數</small><strong>{workDays} 天</strong></div><div><small>預計工時</small><strong>{workDays*8} 小時</strong></div><div><small>休假／公休</small><strong>{7-workDays} 天</strong></div></div></Card>
    <Card title="每日班別"><div className="shift-list">{dates.map(item=><div key={`detail-${item.month}-${item.day}`} className={item.value!=='班'?'schedule-off-row':''}><span>{String(item.month).padStart(2,'0')}/{String(item.day).padStart(2,'0')}</span><i className={item.value==='班'?'pink':'schedule-off-dot'} /><p><strong>{item.value==='班'?shiftName:item.value}</strong><small>{item.value==='班'?`${shiftTimes[shiftName]||'依班表通知'} · ${employee?.branch}`:'本日不排班'}</small></p><b>{item.value==='班'?'8h':'—'}</b></div>)}</div></Card>
    <p className="employee-schedule-note">班表若有臨時調整，會同步更新在「本週班表」與上方月曆。</p></>;
}

function ClockPage({ data, setData }) {
  const now = new Date();
  const [time, setTime] = useState(now.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}));
  useEffect(()=>{ const id=setInterval(()=>setTime(new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})),30000); return()=>clearInterval(id);},[]);
  const completed = Boolean(data.clockOutTime);
  const clock = () => setData(current => current.clockedIn ? ({ ...current, attendanceDate: localDateKey(), clockedIn: false, clockOutTime: time }) : current.clockOutTime ? current : ({ ...current, attendanceDate: localDateKey(), clockedIn: true, clockTime: time, clockOutTime: '' }));
  return <>
    <div className="clock-hero">
      <div className="clock-ring"><small>現在時間</small><strong>{time}</strong><span>{todayLabel()}</span></div>
      <p className="beta-clock-warning"><span className="pulse" />手動打卡模式 · 尚未驗證定位、NFC 或裝置</p>
      <button onClick={clock} disabled={completed} className={data.clockedIn ? 'clock-out' : completed ? 'clock-complete' : ''}>{data.clockedIn ? '手動下班' : completed ? '今日完成' : '手動上班'}<small>{data.clockedIn ? `上班時間 ${data.clockTime}` : completed ? `下班時間 ${data.clockOutTime}` : '僅儲存於此裝置'}</small></button>
    </div>
    <Card title="今日紀錄"><div className="clock-record"><div><span className={`record-dot ${data.clockTime ? 'done' : ''}`}>{data.clockTime ? '✓' : '○'}</span><p><small>上班</small><strong>{data.clockTime || '--:--'}</strong></p><em>{data.clockTime ? '已完成' : '等待打卡'}</em></div><div><span className={`record-dot ${data.clockOutTime ? 'done' : ''}`}>{data.clockOutTime ? '✓' : '○'}</span><p><small>下班</small><strong>{data.clockOutTime || '--:--'}</strong></p><em>{data.clockOutTime ? '已完成' : '尚未打卡'}</em></div></div></Card>
    <Card title="本週工時"><div className="attendance-bars">{[8,8,7.5,8,0].map((h,i)=><div key={i}><span style={{height:`${Math.max(8,h*8)}px`}} /><b>{h || '—'}</b><small>{['一','二','三','四','五'][i]}</small></div>)}</div></Card>
  </>;
}

function LeavePage({ data, setData, employee }) {
  const [form, setForm] = useState({ type:'特休', date:localDateKey(), reason:'' });
  const [submitting,setSubmitting]=useState(false);
  const submitLock=useRef(false);
  const unlockTimer=useRef(null);
  useEffect(()=>()=>{if(unlockTimer.current)clearTimeout(unlockTimer.current)},[]);
  const employeeLeaves = data.leaves.filter(leave => !leave.employeeNo || leave.employeeNo === employee.employeeNo);
  const submit = e => {
    e.preventDefault();
    if(submitLock.current||!form.date.trim())return;
    submitLock.current=true;
    setSubmitting(true);
    const id=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const leave={id,employeeNo:employee.employeeNo,...form,date:form.date.trim(),status:'待審核'};
    const approval={id:`approval-${id}`,leaveId:id,employeeNo:employee.employeeNo,name:employee.name,type:form.type,date:form.date.trim(),detail:'1 天',status:'待審核'};
    setData(d=>({...d,leaves:[leave,...d.leaves],approvals:[approval,...d.approvals]}));
    setForm(current=>({...current,reason:''}));
    unlockTimer.current=setTimeout(()=>{submitLock.current=false;setSubmitting(false)},800);
  };
  return <><div className="page-title"><div><span>TIME OFF</span><h1>請假申請</h1></div></div><div className="leave-balance"><div><span>剩餘特休</span><strong>7.5<small> 天</small></strong></div><div><span>已使用</span><strong>4.5<small> 天</small></strong></div><div><span>待審核</span><strong>{employeeLeaves.filter(l=>l.status==='待審核').length}<small> 件</small></strong></div></div><Card title="新增申請"><form className="leave-form" onSubmit={submit}><label>假別<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>特休</option><option>事假</option><option>病假</option><option>生理假</option><option>家庭照顧假</option><option>婚假</option></select></label><label>請假日期<input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label className="full">原因<textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="簡單說明請假原因（選填）" /></label><button disabled={submitting||!form.date.trim()} className="primary employee-gradient full">{submitting?'送出中…':'送出申請'}</button></form></Card><Card title="申請紀錄"><div className="request-list">{employeeLeaves.length===0&&<div className="empty">尚無新的請假申請</div>}{employeeLeaves.map(l=><div key={l.id}><span className="request-icon">◇</span><p><strong>{l.type}</strong><small>{l.date} · 1 天</small></p><em>{l.status}</em></div>)}</div></Card></>;
}

function SettingsPage({ dark, setDark, employee }) {
  return <><div className="profile-card employee-gradient"><div className="avatar">{employee.name.slice(0,1)}</div><div><h2>{employee.name}</h2><p>{employee.role} · {employee.branch}</p></div><button disabled title="個人資料編輯尚未連接">尚未連接</button></div><Card title="個人設定"><div className="settings-list"><button disabled><span>♙</span><p><strong>個人資料</strong><small>編輯與儲存尚未連接</small></p><b>—</b></button><button onClick={()=>setDark(!dark)}><span>{dark?'☀':'☾'}</span><p><strong>顯示模式</strong><small>目前為{dark?'暗夜':'日光'}模式</small></p><em className={`switch ${dark?'on':''}`} /></button><button disabled><span>▣</span><p><strong>裝置綁定</strong><small>尚未驗證任何裝置</small></p><b>—</b></button><button disabled><span>⌁</span><p><strong>iOS 快捷指令</strong><small>尚未連接 NFC／QR 流程</small></p><b>—</b></button></div></Card><Card title="主題色彩"><div className="theme-swatches"><button className="selected" style={{background:'linear-gradient(135deg,#ff87e0,#59ddff)'}}/><button style={{background:'linear-gradient(135deg,#ffb36b,#ff7a8a)'}}/><button style={{background:'linear-gradient(135deg,#6ee7b7,#60a5fa)'}}/><button style={{background:'linear-gradient(135deg,#a78bfa,#f472b6)'}}/></div></Card></>;
}

function LeaveSchedulePage({ data, setData, employee }) {
  const [tab, setTab] = useState('schedule');
  return <><div className="combined-page-tabs"><button className={tab === 'schedule' ? 'active' : ''} onClick={() => setTab('schedule')}>我的排班</button><button className={tab === 'leave' ? 'active' : ''} onClick={() => setTab('leave')}>請假申請</button></div>{tab === 'schedule' ? <SchedulePage data={data} employee={employee}/> : <LeavePage data={data} setData={setData} employee={employee}/>}</>;
}

function EmployeeSalaryPage() {
  return <><div className="page-title"><div><span>MY PAYROLL</span><h1>薪資明細</h1></div><button className="pill">2026 / 07⌄</button></div><section className="employee-salary-summary employee-gradient"><small>本月預計薪資</small><strong>$42,680</strong><p>每月 25 日發薪・本月累計 127.5 小時</p><div><span>本週 $10,670</span><span>本週 31.5h</span></div></section><Card title="本月計算明細"><div className="salary-detail-list"><div><span>本薪</span><strong>$36,000</strong></div><div><span>加班與津貼</span><strong>+$8,200</strong></div><div><span>保險與代扣</span><strong>-$1,520</strong></div><div className="total"><span>預計實領</span><strong>$42,680</strong></div></div></Card><Card title="每週累計紀錄"><div className="weekly-pay-list"><div><span>07/01–07/07</span><strong>$10,450</strong><small>31h</small></div><div><span>07/08–07/14</span><strong>$10,670</strong><small>31.5h</small></div><div><span>本週進行中</span><strong>$0</strong><small>0h</small></div></div></Card></>;
}

function EmployeeUploadPage({ data, setData }) {
  const [files, setFiles] = useState([]);
  const [uploaded, setUploaded] = useState(false);
  const uploadCategories = [
    { key:'attendance', icon:'◷', title:'補卡／出勤佐證', badge:'視情況', desc:'漏刷、機器異常或主管要求補登時使用。' },
    { key:'leave', icon:'✚', title:'請假／醫療證明', badge:'依規定', desc:'僅於假別、天數或公司規章要求時上傳。' },
    { key:'expense', icon:'$', title:'代墊收據／費用請款', badge:'有請款才需要', desc:'交通、採購與工作支出，需保留可辨識單據。' },
    { key:'advance', icon:'↗', title:'公費預支申請', badge:'事前申請', desc:'支出前填寫用途與預估金額，非事後收據。' },
    { key:'work', icon:'▣', title:'作業／現場紀錄', badge:'選填', desc:'任務要求回報照片或執行情況時使用。' },
    { key:'profile', icon:'♙', title:'個人資料／契約附件', badge:'HR 通知才上傳', desc:'僅依人資通知補件，不需主動上傳敏感證件。' },
  ];
  const [category, setCategory] = useState(uploadCategories[0].key);
  const selectedCategory = uploadCategories.find(item => item.key === category);
  const addFiles = event => { setUploaded(false); setFiles(current => [...current, ...[...event.target.files].map(file => ({ name: file.name, size: `${Math.max(.1, file.size / 1024 / 1024).toFixed(1)} MB`, category: selectedCategory.title }))]); event.target.value = ''; };
  const confirmUpload = () => { if (!files.length) return; const records = files.map(file => ({ ...file, id: `${Date.now()}-${file.name}`, uploadedAt: '剛剛', status: '已記錄於此裝置' })); setData(current => ({ ...current, uploads: [...records, ...(current.uploads || [])] })); setFiles([]); setUploaded(true); };
  return <><div className="page-title"><div><span>文件</span><h1>資料上傳</h1></div></div><section className="upload-category-section"><div className="upload-category-head"><div><strong>資料上傳中心</strong><small>先選用途，再加入對應資料</small></div><span>必要時才上傳</span></div><div className="upload-category-list">{uploadCategories.map(item => <button key={item.key} className={category === item.key ? 'active' : ''} onClick={() => { setCategory(item.key); setUploaded(false); }}><i>{item.icon}</i><p><strong>{item.title}</strong><small>{item.desc}</small></p><em>{item.badge}</em></button>)}</div><p className="upload-privacy-note">目前只記錄檔名、大小與分類，不會上傳實體檔案；請勿選擇真實個資或敏感文件。</p></section><label className="upload-dropzone"><input type="file" multiple onChange={addFiles}/><span>⇧</span><strong>記錄：{selectedCategory.title}</strong><small>{selectedCategory.desc}</small></label>{uploaded&&<div className="action-success">資料紀錄已保存於此裝置（未上傳實體檔案）✓</div>}<Card title={`待記錄資料・${files.length}`}><div className="upload-list">{files.length === 0 ? <div className="empty">尚未選擇檔案</div> : files.map((file, index) => <div key={`${file.name}-${index}`}><span>▤</span><p><strong>{file.name}</strong><small>{file.category} · {file.size}</small></p><button onClick={() => setFiles(current => current.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}</div></Card><button className="primary employee-gradient" disabled={!files.length} onClick={confirmUpload}>{files.length ? `儲存 ${files.length} 份紀錄` : '儲存紀錄'}</button>{(data.uploads||[]).length>0&&<Card title="最近紀錄"><div className="upload-history">{data.uploads.slice(0,4).map(item=><div key={item.id}><span>✓</span><p><strong>{item.name}</strong><small>{item.category} · {item.uploadedAt}</small></p><em>{item.status}</em></div>)}</div></Card>}</>;
}

const calendarPageMeta = {
  home: ['綜合行事曆', '班表、出勤、公告與發薪日'],
  'leave-schedule': ['排班與請假', '班次、休假及申請期限'],
  clock: ['出勤行事曆', '打卡、異常與紀錄確認'],
  'employee-salary': ['薪資行事曆', '結算、預覽與發薪日'],
  upload: ['文件行事曆', '補件與資料繳交期限'],
  settings: ['設定行事曆', '偏好設定與生效日期'],
  'admin-home': ['營運綜合月曆', '出勤、審核、公告與薪資'],
  approvals: ['審核行事曆', '請假、補卡與薪資核准期限'],
  'admin-schedule': ['排班行事曆', '員工提報、主要班表與臨時調整'],
  'admin-settings': ['規則行事曆', '企業規則與設定生效日'],
  publish: ['發布行事曆', '公告、問卷與表單截止日'],
  people: ['人員行事曆', '到職、休假與合約提醒'],
  salary: ['薪資作業月曆', '結算、核准與發薪日'],
};

function calendarEventsFor(page, year, month, data) {
  const last = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  const currentDay = year === now.getFullYear() && month === now.getMonth() ? now.getDate() : Math.min(15, last);
  const day = value => Math.min(value, last);
  const sets = {
    home: [{ day: currentDay, label: data.clockTime ? `今日出勤 ${data.clockTime}` : '今日班表・早班', type: 'work' }, { day: day(20), label: '下週班表確認', type: 'notice' }, { day: day(25), label: '本月發薪日', type: 'pay' }],
    'leave-schedule': [{ day: currentDay, label: '今日班別・早班', type: 'work' }, { day: day(18), label: '休假申請截止', type: 'leave' }, { day: day(21), label: '下週班表公布', type: 'notice' }],
    clock: [{ day: currentDay, label: data.clockTime ? `上班 ${data.clockTime}` : '預計上班 09:00', type: 'work' }, { day: currentDay, label: data.clockOutTime ? `下班 ${data.clockOutTime}` : '下班尚未打卡', type: data.clockOutTime ? 'work' : 'alert' }, { day: day(22), label: '出勤紀錄確認', type: 'notice' }],
    'employee-salary': [{ day: day(10), label: '薪資明細預覽', type: 'pay' }, { day: day(25), label: '本月發薪日', type: 'pay' }, { day: last, label: '本月工時結算', type: 'notice' }],
    upload: [{ day: currentDay, label: '待補文件檢查', type: 'notice' }, { day: day(22), label: '醫療證明繳交期限', type: 'alert' }, { day: last, label: '本月資料封存', type: 'work' }],
    settings: [{ day: 1, label: '本月偏好設定生效', type: 'work' }, { day: day(26), label: '下月主題確認', type: 'notice' }, { day: last, label: '設定備份', type: 'pay' }],
    'admin-home': [{ day: currentDay, label: `今日出勤 ${data.employees?.filter(item => item.status === '上班中').length || 0} 人`, type: 'work' }, { day: day(20), label: `待審核 ${data.approvals?.filter(item => item.status === '待審核').length || 0} 件`, type: 'alert' }, { day: day(25), label: '全公司發薪日', type: 'pay' }],
    approvals: [{ day: currentDay, label: '今日待辦審核', type: 'alert' }, { day: day(18), label: '請假申請截止', type: 'leave' }, { day: day(24), label: '薪資核准截止', type: 'pay' }],
    'admin-schedule': [{ day: currentDay, label: data.schedulePublishedPeriods?.current?'本週班表已更新':'當週班表進行中', type: 'work' }, { day: day(18), label: '員工選休截止', type: 'leave' }, { day: day(20), label: data.schedulePublishedPeriods?.main?'下週班表已發布':'下週班表待發布', type: data.schedulePublishedPeriods?.main?'work':'alert' }],
    'admin-settings': [{ day: 1, label: '企業規則生效', type: 'work' }, { day: day(20), label: '班別規則檢查', type: 'notice' }, { day: last, label: '下月設定確認', type: 'alert' }],
    publish: [{ day: day(18), label: '班表公告排程', type: 'notice' }, { day: day(22), label: '員工問卷截止', type: 'leave' }, { day: day(29), label: '月末公告發布', type: 'work' }],
    people: [{ day: day(17), label: '新人到職', type: 'work' }, { day: day(19), label: '員工排休', type: 'leave' }, { day: day(26), label: '合約到期提醒', type: 'alert' }],
    salary: [{ day: day(20), label: '全公司工時結算', type: 'notice' }, { day: day(24), label: '薪資核准截止', type: 'alert' }, { day: day(25), label: '薪資發放', type: 'pay' }],
  };
  return sets[page] || [];
}

function PageCalendar({ page, role, data }) {
  const now = new Date();
  const [cursor, setCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const days = [...Array(firstWeekday).fill(null), ...Array.from({ length: totalDays }, (_, index) => index + 1)];
  while (days.length % 7) days.push(null);
  const events = calendarEventsFor(page, year, month, data);
  const eventsByDay = events.reduce((result, event) => ({ ...result, [event.day]: [...(result[event.day] || []), event] }), {});
  const selectedEvents = eventsByDay[selectedDay] || [];
  const [title, description] = calendarPageMeta[page] || ['月曆', '本月重要資訊'];
  const changeMonth = direction => {
    const next = new Date(year, month + direction, 1);
    setCursor(next);
    setSelectedDay(1);
  };
  const isToday = day => day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  return <section className={`page-calendar ${role}`} aria-label={`${title} ${year} 年 ${month + 1} 月`}>
    <div className="page-calendar-head"><div><span>CALENDAR</span><h2>{title}</h2><small>{description}</small></div><div className="calendar-month-switch"><button aria-label="上個月" onClick={() => changeMonth(-1)}>‹</button><strong>{year} 年 {month + 1} 月</strong><button aria-label="下個月" onClick={() => changeMonth(1)}>›</button></div></div>
    <div className="calendar-weekdays">{['日','一','二','三','四','五','六'].map(item => <span key={item}>{item}</span>)}</div>
    <div className="calendar-grid">{days.map((item, index) => item ? <button key={`${item}-${index}`} className={`${selectedDay === item ? 'selected' : ''} ${isToday(item) ? 'today' : ''}`} onClick={() => setSelectedDay(item)}><b>{item}</b>{eventsByDay[item] && <i>{eventsByDay[item].slice(0, 3).map(event => <em key={`${event.label}-${event.type}`} className={event.type}/>)}</i>}</button> : <span key={`empty-${index}`}/>)}</div>
    <div className="calendar-day-info"><div><small>{month + 1} 月 {selectedDay} 日</small><strong>{selectedEvents.length ? `${selectedEvents.length} 項安排` : '尚無排定事項'}</strong></div><div>{selectedEvents.length ? selectedEvents.map(event => <span key={`${event.day}-${event.label}`} className={event.type}>{event.label}</span>) : <span className="empty-event">可在此日期新增或整合相關資訊</span>}</div></div>
  </section>;
}

function EmployeeApp({ data, setData, dark, setDark, onExit, activeAccount }) {
  const [page, setPage] = useState('home');
  const employee = demoEmployeeProfile(data, activeAccount);
  const plan = getPlanProfile(activeAccount, 'employee');
  const availableNav = employeeNav.filter(([id]) => plan.allowedPages.includes(id));
  const safePage = plan.allowedPages.includes(page) ? page : 'home';
  useEffect(()=>{if(page!==safePage)setPage(safePage)},[page,safePage]);
  const content = { home:<EmployeeHome data={data} setData={setData} go={setPage} employee={employee} activeAccount={activeAccount} plan={plan}/>, 'leave-schedule':<LeaveSchedulePage data={data} setData={setData} employee={employee}/>, clock:<ClockPage data={data} setData={setData}/>, 'employee-salary':<EmployeeSalaryPage/>, upload:<EmployeeUploadPage data={data} setData={setData}/>, settings:<SettingsPage dark={dark} setDark={setDark} employee={employee}/> }[safePage];
  const theme = data.employeeTheme || defaultEmployeeTheme;
  const themeStyle = { '--emp-1': theme.colors[0], '--emp-2': theme.colors[1], '--emp-3': theme.colors[2], '--emp-4': theme.colors[3], '--emp-gradient': employeeGradient(theme) };
  return <AppShell role="employee" dark={dark} style={themeStyle}><Topbar role="employee" dark={dark} setDark={setDark} onExit={onExit} onHome={() => setPage('home')} data={data} setData={setData} activeAccount={activeAccount}/><div className="safe page-enter"><PageCalendar page={safePage} role="employee" data={data}/>{content}</div><BottomNav items={availableNav} page={safePage} setPage={setPage} role="employee"/></AppShell>;
}

function AdminHome({ data, setData, go, activeAccount }) {
  const pending=data.approvals.filter(a=>a.status==='待審核').length;
  const plan=getPlanProfile(activeAccount,'admin');
  const avatarInput = useRef(null);
  const uploadAvatar = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240; canvas.height = 240;
        const context = canvas.getContext('2d');
        const size = Math.min(image.width, image.height);
        context.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 240, 240);
        setData(current => ({ ...current, adminAvatar: canvas.toDataURL('image/jpeg', .84) }));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
  return <><PlanScopeCard activeAccount={activeAccount} role="admin"/><section className="hero admin-gradient admin-profile-hero admin-business-card"><div className="admin-hero-main"><button className="admin-avatar-slot" onClick={() => avatarInput.current?.click()} aria-label="上傳管理者頭像">{data.adminAvatar ? <img src={data.adminAvatar} alt="管理者頭像"/> : <strong>管</strong>}<span>＋</span></button><input ref={avatarInput} className="avatar-file-input" type="file" accept="image/*" onChange={uploadAvatar}/><div className="admin-hero-copy"><span className="hero-kicker">BUSINESS PROFILE · {plan.shortName}</span><h1>管理者</h1><p>ANG.lo Engine · 系統建立者</p><div className="business-card-tags">{plan.features.slice(0,2).map(feature=><span key={feature}>{feature}</span>)}</div></div></div><div className="business-card-footer"><p><small>主要工作區</small><strong>HQ01 · ANG 總部</strong></p><p><small>管理識別</small><strong>{activeAccount?.account||'ADM-DEMO'}</strong></p><b>{plan.shortName}</b></div></section><div className="admin-stats"><button onClick={()=>go('people')}><span className="stat-icon orange">♙</span><p><small>在職人數</small><strong>{data.employees.length}</strong></p><em>查看</em></button><button onClick={()=>go('people')}><span className="stat-icon green">✓</span><p><small>今日出勤</small><strong>{data.employees.filter(person=>person.status==='上班中').length} / {data.employees.filter(person=>person.status!=='已離職').length}</strong></p><em>查看</em></button>{plan.allowedPages.includes('approvals')&&<button onClick={()=>go('approvals')}><span className="stat-icon red">!</span><p><small>待審核</small><strong>{pending}</strong></p><em>需處理</em></button>}{plan.allowedPages.includes('salary')&&<button onClick={()=>go('salary')}><span className="stat-icon blue">$</span><p><small>本月薪資</small><strong>{data.employees.filter(person=>person.status!=='已離職').length} 筆</strong></p><em>{data.payrollSubmittedAt?'已送審':'草稿'}</em></button>}</div><Card title="快速操作"><div className="quick-grid">{plan.allowedPages.includes('publish')&&<button onClick={()=>go('publish')}><span>✦</span>發布公告</button>}<button onClick={()=>go('people')}><span>＋</span>新增人員</button>{plan.allowedPages.includes('admin-settings')&&<button onClick={()=>go('admin-settings')}><span>▦</span>班別設定</button>}{plan.allowedPages.includes('salary')&&<button onClick={()=>go('salary')}><span>$</span>薪資結算</button>}</div></Card>{plan.allowedPages.includes('approvals')&&<Card title="待辦審核" action={<button className="text-button admin-text" onClick={()=>go('approvals')}>全部查看</button>}><ApprovalRows approvals={data.approvals.filter(a=>a.status==='待審核').slice(0,3)} compact/></Card>}<Card title="分店即時狀態"><div className="branch-list"><div><span className="branch-dot active"/><p><strong>台北總店</strong><small>3 人上班中 · 1 人休假</small></p><em>營業中</em></div>{plan.companyLimit>1&&<div><span className="branch-dot"/><p><strong>信義分店</strong><small>1 人上班中 · 1 人尚未打卡</small></p><em>營業中</em></div>}</div></Card></>;
}

function ApprovalRows({approvals, compact=false, onAction}) { return <div className="approval-list">{approvals.map(a=><div key={a.id}><span className="approval-avatar">{a.name[0]}</span><p><strong>{a.name}<small>{a.type}</small></strong><span>{a.date} · {a.detail}</span></p>{compact?<b>›</b>:<div className="approval-actions">{a.status==='待審核'?<><button onClick={()=>onAction(a.id,'已退回')}>退回</button><button onClick={()=>onAction(a.id,'已核准')}>核准</button></>:<em className={a.status==='已核准'?'approved':''}>{a.status}</em>}</div>}</div>)}</div>; }

function ApprovalsPage({ data, setData }) {
  const [filter,setFilter]=useState('全部'); const list=data.approvals.filter(a=>filter==='全部'||a.status===filter);
  const action=(id,status)=>setData(d=>{const target=d.approvals.find(a=>a.id===id);return {...d,approvals:d.approvals.map(a=>a.id===id?{...a,status}:a),leaves:target?.leaveId?d.leaves.map(leave=>leave.id===target.leaveId?{...leave,status}:leave):d.leaves}});
  return <><div className="page-title"><div><span>APPROVAL CENTER</span><h1>審核中心</h1></div><b className="count-badge">{data.approvals.filter(a=>a.status==='待審核').length}</b></div><div className="filter-tabs">{['全部','待審核','已核准','已退回'].map(f=><button className={filter===f?'active':''} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div><Card title={`${filter}申請`}><ApprovalRows approvals={list} onAction={action}/>{list.length===0&&<div className="empty">目前沒有資料</div>}</Card></>;
}

function LegacyPeoplePage({data,setData}) {
  const emptyPerson={employeeNo:'',name:'',nickname:'',email:'',phone:'',branch:'台北總店',department:'門市部',role:'正職人員',employmentType:'正職',shift:'早班',startDate:new Date().toISOString().slice(0,10),accessRole:'員工',status:'尚未打卡'};
  const [search,setSearch]=useState(''); const [show,setShow]=useState(false); const [editingId,setEditingId]=useState(null); const [form,setForm]=useState(emptyPerson); const [branchFilter,setBranchFilter]=useState('全部'); const [actionId,setActionId]=useState(null); const [detailId,setDetailId]=useState(null);
  const branches=['全部',...new Set(data.employees.map(person=>person.branch).filter(Boolean))];
  const people=data.employees.filter(e=>(branchFilter==='全部'||e.branch===branchFilter)&&[e.name,e.nickname,e.employeeNo,e.role,e.branch,e.department].some(value=>(value||'').includes(search)));
  const openNew=()=>{setEditingId(null);setForm({...emptyPerson,employeeNo:`ANG${String(601+data.employees.length).padStart(4,'0')}`});setShow(true)};
  const openEdit=person=>{setEditingId(person.id);setForm({...emptyPerson,...person});setShow(true);setActionId(null);setTimeout(()=>document.querySelector('.staff-form')?.scrollIntoView({behavior:'smooth',block:'start'}),0)};
  const save=event=>{event.preventDefault();if(!form.name.trim()||!form.employeeNo.trim())return;setData(current=>({...current,employees:editingId?current.employees.map(person=>person.id===editingId?{...person,...form}:person):[...current.employees,{...form,id:Date.now()}]}));setShow(false);setEditingId(null);setForm(emptyPerson)};
  const field=(key,value)=>setForm(current=>({...current,[key]:value}));
  const updatePerson=(id,changes)=>setData(current=>({...current,employees:current.employees.map(person=>person.id===id?{...person,...changes}:person)}));
  return <><div className="page-title"><div><span>PEOPLE</span><h1>人員管理</h1></div><button className="add-button" onClick={openNew}>＋ 新增</button></div>{show&&<Card title={editingId?'編輯人員資料':'新增人員'}><form className="staff-form" onSubmit={save}><div className="staff-form-section"><strong>基本資料</strong><div className="staff-form-grid"><label>員工編號<input required value={form.employeeNo} onChange={e=>field('employeeNo',e.target.value)} placeholder="EMP-005"/></label><label>姓名<input required value={form.name} onChange={e=>field('name',e.target.value)} placeholder="員工姓名"/></label><label>慣用名稱／暱稱<input value={form.nickname} onChange={e=>field('nickname',e.target.value)} placeholder="顯示名稱"/></label><label>手機<input value={form.phone} onChange={e=>field('phone',e.target.value)} inputMode="tel" placeholder="09xx-xxx-xxx"/></label><label className="full">Email<input value={form.email} onChange={e=>field('email',e.target.value)} type="email" placeholder="name@company.com"/></label></div></div><div className="staff-form-section"><strong>任職資料</strong><div className="staff-form-grid"><label>所屬分店<select value={form.branch} onChange={e=>field('branch',e.target.value)}><option>台北總店</option><option>信義分店</option><option>全部店家</option></select></label><label>部門<select value={form.department} onChange={e=>field('department',e.target.value)}><option>門市部</option><option>營運部</option><option>人資部</option><option>財務部</option></select></label><label>職位<input value={form.role} onChange={e=>field('role',e.target.value)} placeholder="例如：店長"/></label><label>雇用類型<select value={form.employmentType} onChange={e=>field('employmentType',e.target.value)}><option>正職</option><option>兼職</option><option>約聘</option><option>實習</option></select></label><label>預設班別<select value={form.shift} onChange={e=>field('shift',e.target.value)}><option>早班</option><option>中班</option><option>晚班</option><option>彈性班</option></select></label><label>到職日<input type="date" value={form.startDate} onChange={e=>field('startDate',e.target.value)}/></label></div></div><div className="staff-form-section"><strong>系統身分</strong><div className="staff-form-grid"><label>權限角色<select value={form.accessRole} onChange={e=>field('accessRole',e.target.value)}><option>員工</option><option>主管</option><option>店長</option><option>管理員</option></select></label><label>人員狀態<select value={form.status} onChange={e=>field('status',e.target.value)}><option>尚未打卡</option><option>上班中</option><option>休假</option><option>留職停薪</option><option>已離職</option></select></label></div></div><div className="staff-form-actions"><button type="button" onClick={()=>setShow(false)}>取消</button><button type="submit">{editingId?'儲存變更':'建立人員'}</button></div></form></Card>}<div className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋姓名、編號、職務或分店"/></div><Card title={`全部人員 · ${people.length}`}><div className="people-list">{people.map((person,index)=><div key={person.id}><span className={`people-avatar a${index%4}`}>{person.name[0]}</span><p><strong>{person.name}{person.nickname&&<em> · {person.nickname}</em>}</strong><small>{person.employeeNo||'尚未編號'} · {person.role||'未設定職位'} · {person.branch||'未設定分店'}</small><small>{person.employmentType||'未設定'} · {person.shift||'未設定班別'} · {person.accessRole||'員工'}</small></p><em className={person.status==='上班中'?'online':''}>{person.status}</em><button className="person-edit" onClick={()=>openEdit(person)} aria-label={`編輯 ${person.name}`}>⋮</button></div>)}</div></Card></>;
}

function PeoplePage({data,setData}) {
  const blank={employeeNo:'',name:'',nickname:'',email:'',phone:'',branch:'台北總店',department:'門市部',role:'正職人員',employmentType:'正職',shift:'早班',startDate:new Date().toISOString().slice(0,10),accessRole:'員工',status:'尚未打卡'};
  const [search,setSearch]=useState(''); const [branch,setBranch]=useState('全部'); const [actionId,setActionId]=useState(null); const [detailId,setDetailId]=useState(null); const [editing,setEditing]=useState(null); const [form,setForm]=useState(blank);
  const branches=['全部',...new Set(data.employees.map(person=>person.branch).filter(Boolean))];
  const people=data.employees.filter(person=>(branch==='全部'||person.branch===branch)&&[person.name,person.nickname,person.employeeNo,person.role,person.branch].some(value=>(value||'').includes(search)));
  const updatePerson=(id,changes)=>setData(current=>({...current,employees:current.employees.map(person=>person.id===id?{...person,...changes}:person)}));
  const openNew=()=>{setEditing('new');setForm({...blank,employeeNo:`ANG${String(601+data.employees.length).padStart(4,'0')}`})};
  const openEdit=person=>{setEditing(person.id);setForm({...blank,...person});setActionId(null)};
  const save=event=>{event.preventDefault();if(!form.name.trim()||!form.employeeNo.trim())return;setData(current=>({...current,employees:editing==='new'?[...current.employees,{...form,id:Date.now()}]:current.employees.map(person=>person.id===editing?{...person,...form}:person)}));setEditing(null)};
  const field=(key,value)=>setForm(current=>({...current,[key]:value}));
  return <><div className="page-title"><div><span>PEOPLE</span><h1>人員管理</h1></div><button className="add-button" onClick={openNew}>＋ 新增</button></div>{editing&&<Card title={editing==='new'?'新增人員':'編輯人員資料'}><form className="staff-form" onSubmit={save}><div className="staff-form-grid"><label>員工編號<input required value={form.employeeNo} onChange={e=>field('employeeNo',e.target.value)}/></label><label>姓名<input required value={form.name} onChange={e=>field('name',e.target.value)}/></label><label>暱稱<input value={form.nickname} onChange={e=>field('nickname',e.target.value)}/></label><label>手機<input value={form.phone} onChange={e=>field('phone',e.target.value)}/></label><label className="full">Email<input type="email" value={form.email} onChange={e=>field('email',e.target.value)}/></label><label>分店<select value={form.branch} onChange={e=>field('branch',e.target.value)}><option>台北總店</option><option>信義分店</option><option>全部店家</option></select></label><label>部門<select value={form.department} onChange={e=>field('department',e.target.value)}><option>門市部</option><option>營運部</option><option>人資部</option><option>財務部</option></select></label><label>職位<input value={form.role} onChange={e=>field('role',e.target.value)}/></label><label>雇用類型<select value={form.employmentType} onChange={e=>field('employmentType',e.target.value)}><option>正職</option><option>兼職</option><option>約聘</option><option>實習</option></select></label><label>班別<select value={form.shift} onChange={e=>field('shift',e.target.value)}><option>早班</option><option>中班</option><option>晚班</option><option>彈性班</option></select></label><label>到職日<input type="date" value={form.startDate} onChange={e=>field('startDate',e.target.value)}/></label><label>權限角色<select value={form.accessRole} onChange={e=>field('accessRole',e.target.value)}><option>員工</option><option>主管</option><option>店長</option><option>管理員</option></select></label><label>狀態<select value={form.status} onChange={e=>field('status',e.target.value)}><option>上班中</option><option>休假</option><option>尚未打卡</option><option>異常</option><option>已離職</option></select></label></div><div className="staff-form-actions"><button type="button" onClick={()=>setEditing(null)}>取消</button><button type="submit">儲存人員資料</button></div></form></Card>}<div className="branch-filter"><span>依分店查看</span><div>{branches.map(name=><button key={name} className={branch===name?'active':''} onClick={()=>setBranch(name)}>{name}<small>{name==='全部'?data.employees.length:data.employees.filter(person=>person.branch===name).length}</small></button>)}</div></div><div className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋姓名、編號、職務或分店"/></div><Card title={`${branch==='全部'?'全部人員':branch} · ${people.length}`}><div className="people-list">{people.map((person,index)=><React.Fragment key={person.id}><div className="person-row"><span className={`people-avatar a${index%4}`}>{person.name[0]}</span><p><strong>{person.name}{person.nickname&&<em> · {person.nickname}</em>}</strong><small>{person.employeeNo||'尚未編號'} · {person.role||'未設定職位'} · {person.branch||'未設定分店'}</small><small>{person.employmentType||'未設定'} · {person.shift||'未設定班別'} · {person.accessRole||'員工'}</small></p><em className={`person-status ${person.status==='上班中'?'online':person.status==='休假'?'leave':person.status==='異常'?'abnormal':'pending'}`}>{person.status}</em><button className="person-manage" onClick={()=>setActionId(actionId===person.id?null:person.id)}>管理⌄</button></div>{actionId===person.id&&<div className="person-action-panel"><div className="person-action-head"><strong>{person.name}的人員管理</strong><button onClick={()=>setActionId(null)}>×</button></div><div className="person-quick-actions"><button onClick={()=>setDetailId(detailId===person.id?null:person.id)}>查看完整資料</button><button onClick={()=>openEdit(person)}>編輯資料</button></div>{detailId===person.id&&<div className="person-detail-grid"><p><small>電話</small><strong>{person.phone||'未填寫'}</strong></p><p><small>Email</small><strong>{person.email||'未填寫'}</strong></p><p><small>部門／職位</small><strong>{person.department||'未設定'} · {person.role||'未設定'}</strong></p><p><small>到職日</small><strong>{person.startDate||'未設定'}</strong></p></div>}<label>調整所屬分店<select value={person.branch||'台北總店'} onChange={event=>updatePerson(person.id,{branch:event.target.value})}><option>台北總店</option><option>信義分店</option><option>全部店家</option></select></label><div className="status-actions"><span>更新今日狀態</span>{['上班中','休假','尚未打卡','異常'].map(status=><button key={status} className={status==='異常'?'danger':''} onClick={()=>updatePerson(person.id,{status})}>{status}</button>)}</div><button className="deactivate-person" onClick={()=>updatePerson(person.id,{status:'已離職'})}>停用／設為已離職</button></div>}</React.Fragment>)}</div></Card></>;
}

function AdminSchedulePage({data,setData}) {
  const days=['一','二','三','四','五','六','日'];
  const activeEmployees=data.employees.filter(person=>person.status!=='已離職');
  const fixedDay=data.adminSettings?.shifts?.fixedDayOff||'週一';
  const lockedIndex=['週一','週二','週三','週四','週五','週六','週日'].indexOf(fixedDay);
  const normalizePeriodGrid=grid=>Object.fromEntries(activeEmployees.map((person,index)=>{
    const defaults=days.map((_,dayIndex)=>dayIndex===lockedIndex?'公':dayIndex===6&&index%2?'休':'班');
    const values=Array.isArray(grid?.[person.id])?grid[person.id]:defaults;
    return [person.id,days.map((_,dayIndex)=>dayIndex===lockedIndex?'公':values[dayIndex]==='班'?'班':'休')];
  }));
  const [period,setPeriod]=useState('main');
  const [branch,setBranch]=useState('全部');
  const [grids,setGrids]=useState(()=>({main:normalizePeriodGrid(data.draftSchedules?.main||data.adminSchedules?.main),current:normalizePeriodGrid(data.draftSchedules?.current||data.adminSchedules?.current)}));
  const [notice,setNotice]=useState('');
  const branches=['全部',...new Set(activeEmployees.map(person=>person.branch).filter(Boolean))];
  const visible=activeEmployees.filter(person=>branch==='全部'||person.branch===branch);
  const weekStart=offset=>{const now=new Date();const monday=new Date(now);monday.setDate(now.getDate()-((now.getDay()+6)%7)+offset*7);return monday.toLocaleDateString('zh-TW',{month:'numeric',day:'numeric'});};
  const toggle=(employeeId,dayIndex)=>{if(dayIndex===lockedIndex)return;setNotice('');setGrids(current=>({...current,[period]:{...current[period],[employeeId]:(current[period][employeeId]||days.map(()=>'休')).map((value,index)=>index===dayIndex?(value==='班'?'休':'班'):value)}}))};
  const persist=published=>{
    const periodGrid=normalizePeriodGrid(grids[period]);
    const publishedAt=new Date().toISOString();
    setGrids(current=>({...current,[period]:periodGrid}));
    setData(current=>({
      ...current,
      draftSchedules:{...(current.draftSchedules||{}),[period]:periodGrid},
      ...(published?{
        publishedSchedules:{...(current.publishedSchedules||{}),[period]:periodGrid},
        schedulePublishedPeriods:{...(current.schedulePublishedPeriods||{}),[period]:publishedAt},
        schedulePublishedAt:publishedAt,
      }:{}),
    }));
    setNotice(published?'班表已發布到員工月曆 ✓':'班表草稿已儲存 ✓');
  };
  return <><div className="page-title"><div><span>SCHEDULING</span><h1>排班中心</h1></div><span className="rule-owner admin">Manager</span></div>
    <div className="schedule-period-tabs"><button className={period==='main'?'active':''} onClick={()=>{setPeriod('main');setNotice('')}}><strong>下週主要班表</strong><small>週一 {weekStart(1)}</small></button><button className={period==='current'?'active':''} onClick={()=>{setPeriod('current');setNotice('')}}><strong>本週臨時調整</strong><small>週一 {weekStart(0)}</small></button></div>
    <div className="schedule-branch-filter">{branches.map(name=><button key={name} className={branch===name?'active':''} onClick={()=>setBranch(name)}>{name}</button>)}</div>
    {notice&&<div className="action-success">{notice}</div>}
    <Card title={period==='main'?'下週（主要）':'當週（臨時）'} action={<span className="schedule-legend"><i/>班 <i/>休</span>}>
      <p className="settings-help">點選每位人員的日期切換「班／休」；{lockedIndex>=0?`${fixedDay}為固定公休，不可更動。`:'目前沒有固定公休日。'}</p>
      <div className="schedule-day-head">{days.map(day=><span key={day}>週{day}</span>)}</div>
      <div className="schedule-roster">{visible.map(person=><article key={person.id}><div><strong>{person.name}</strong><small>{person.employeeNo} · {person.branch}</small><em>{person.shift}</em></div><div>{days.map((day,index)=>{const value=(grids[period][person.id]||[])[index]||'休';const locked=index===lockedIndex;return <button key={day} className={`${value==='班'?'work':'off'} ${locked?'locked':''}`} disabled={locked} onClick={()=>toggle(person.id,index)}><small>週{day}</small><strong>{locked?'公':value}</strong></button>})}</div></article>)}</div>
      {visible.length===0&&<div className="empty">這個分店目前沒有人員</div>}
    </Card>
    <div className="schedule-actions"><button onClick={()=>persist(false)}>儲存草稿</button><button className="admin-gradient" onClick={()=>persist(true)}>{period==='main'?'發布到員工月曆':'更新當週月曆'}</button></div>
  </>;
}

function SalaryPage({data,setData}) {
  const rows=data.employees.filter(employee=>employee.status!=='已離職').map((employee,index)=>({...employee,base:[36000,48000,22000,38000][index]||36000,bonus:[4200,6800,1200,3100][index]||0,deduct:[1520,2100,880,1620][index]||0}));
  const total=rows.reduce((sum,row)=>sum+row.base+row.bonus-row.deduct,0);
  const exportPayroll=()=>{const header=['員工編號','姓名','職位','底薪','加項','扣項','預計實領'];const lines=rows.map(row=>[row.employeeNo,row.name,row.role,row.base,row.bonus,row.deduct,row.base+row.bonus-row.deduct]);const csv='\ufeff'+[header,...lines].map(line=>line.join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='ANG-HR-2026-07-payroll.csv';link.click();URL.revokeObjectURL(url)};
  const submitPayroll=()=>setData(current=>{if(current.payrollSubmittedAt)return current;return {...current,payrollSubmittedAt:'剛剛',approvals:[{id:Date.now(),name:'2026 年 7 月薪資',type:'薪資送審',date:'07 月',detail:`${rows.length} 人 · $${total.toLocaleString()}`,status:'待審核'},...current.approvals]}});
  return <><div className="page-title"><div><span>薪資</span><h1>薪資管理</h1></div><button className="pill" aria-label="目前薪資月份">2026 / 07</button></div><p className="settings-beta-note">目前金額為範例值，尚未依打卡、班表、津貼或法定項目正式計算。</p><section className="salary-hero admin-gradient"><small>本月預估總額</small><strong>${total.toLocaleString()}</strong><div><span>{rows.length} 位員工</span><span>預計發放日 07/25</span></div></section>{data.payrollSubmittedAt&&<div className="action-success">已建立本機薪資審核 · {data.payrollSubmittedAt} ✓</div>}<Card title="薪資明細" action={<button className="text-button admin-text" onClick={exportPayroll}>匯出 CSV</button>}><div className="payroll-list">{rows.map(row=><div key={row.id}><span>{row.name[0]}</span><p><strong>{row.name}<small>{row.role}</small></strong><em>底薪 ${row.base.toLocaleString()} · 加項 ${row.bonus.toLocaleString()} · 扣項 ${row.deduct.toLocaleString()}</em></p><b>${(row.base+row.bonus-row.deduct).toLocaleString()}</b></div>)}</div></Card><button className="primary admin-gradient" disabled={Boolean(data.payrollSubmittedAt)} onClick={submitPayroll}>{data.payrollSubmittedAt?'已建立薪資審核 ✓':'建立薪資審核'}</button></>;
}

function AdminSettingsLegacy({data,setData}) {
  const [draft,setDraft]=useState(()=>({...defaultAdminSettings,...data.adminSettings,brand:{...defaultCompanyBrand,...data.companyBrand}})); const [saved,setSaved]=useState(false);
  const update=(section,key,value)=>{setSaved(false);setDraft(current=>({...current,[section]:{...current[section],[key]:value}}))};
  const save=event=>{event.preventDefault();const {brand,...adminSettings}=draft;setData(current=>({...current,companyBrand:brand,adminSettings}));setSaved(true)};
  return <form className="all-settings-form" onSubmit={save}><div className="page-title"><div><span>WORKSPACE</span><h1>企業設定</h1></div></div><Card title="班別設定"><p className="settings-help">設定公司可選擇的基本班別與休息時間。</p><div className="settings-grid"><label>早班開始<input type="time" value={draft.shifts.earlyStart} onChange={e=>update('shifts','earlyStart',e.target.value)}/></label><label>早班結束<input type="time" value={draft.shifts.earlyEnd} onChange={e=>update('shifts','earlyEnd',e.target.value)}/></label><label>晚班開始<input type="time" value={draft.shifts.lateStart} onChange={e=>update('shifts','lateStart',e.target.value)}/></label><label>晚班結束<input type="time" value={draft.shifts.lateEnd} onChange={e=>update('shifts','lateEnd',e.target.value)}/></label><label className="full">休息時間（分鐘）<input type="number" min="0" value={draft.shifts.breakMinutes} onChange={e=>update('shifts','breakMinutes',Number(e.target.value))}/></label></div></Card><Card title="打卡規則"><div className="settings-grid"><label className="full">遲到寬限（分鐘）<input type="number" min="0" value={draft.clock.graceMinutes} onChange={e=>update('clock','graceMinutes',Number(e.target.value))}/></label></div><div className="setting-checks"><label><input type="checkbox" checked={draft.clock.locationRequired} onChange={e=>update('clock','locationRequired',e.target.checked)}/>打卡必須驗證定位</label><label><input type="checkbox" checked={draft.clock.deviceRequired} onChange={e=>update('clock','deviceRequired',e.target.checked)}/>限制已登記裝置</label><label><input type="checkbox" checked={draft.clock.qrFallback} onChange={e=>update('clock','qrFallback',e.target.checked)}/>允許 QR Code 備援</label></div></Card><Card title="選休與假別"><div className="settings-grid"><label>特休天數<input type="number" min="0" value={draft.leave.annualDays} onChange={e=>update('leave','annualDays',Number(e.target.value))}/></label><label>病假天數<input type="number" min="0" value={draft.leave.sickDays} onChange={e=>update('leave','sickDays',Number(e.target.value))}/></label><label>事假天數<input type="number" min="0" value={draft.leave.personalDays} onChange={e=>update('leave','personalDays',Number(e.target.value))}/></label><label>需證明的病假天數<input type="number" min="1" value={draft.leave.proofDays} onChange={e=>update('leave','proofDays',Number(e.target.value))}/></label></div></Card><Card title="審核流程"><div className="settings-grid"><label>請假核准人<select value={draft.approval.leaveApprover} onChange={e=>update('approval','leaveApprover',e.target.value)}><option>直屬主管</option><option>店長</option><option>建立者</option></select></label><label>薪資核准人<select value={draft.approval.payrollApprover} onChange={e=>update('approval','payrollApprover',e.target.value)}><option>管理員</option><option>建立者</option></select></label><label className="full">最高審核層級<input type="number" min="1" max="4" value={draft.approval.levels} onChange={e=>update('approval','levels',Number(e.target.value))}/></label></div></Card><Card title="Logo 與公司名稱"><div className="settings-grid"><label>Logo 文字<input maxLength="4" value={draft.brand.logoText} onChange={e=>update('brand','logoText',e.target.value)}/></label><label>公司名稱<input value={draft.brand.companyName} onChange={e=>update('brand','companyName',e.target.value)}/></label><label className="full">公司副名稱<input value={draft.brand.subtitle} onChange={e=>update('brand','subtitle',e.target.value)}/></label></div></Card><Card title="角色權限"><div className="settings-grid"><label>管理員可管理<select value={draft.roles.managerScope} onChange={e=>update('roles','managerScope',e.target.value)}><option>全公司與全部分店</option><option>指定分店</option></select></label><label>主管可管理<select value={draft.roles.supervisorScope} onChange={e=>update('roles','supervisorScope',e.target.value)}><option>所屬分店</option><option>指定部門</option><option>僅直屬員工</option></select></label></div><div className="setting-checks"><label><input type="checkbox" checked={draft.roles.employeeSelfService} onChange={e=>update('roles','employeeSelfService',e.target.checked)}/>員工可自行修改聯絡資料</label></div></Card><button className="primary admin-gradient settings-save-all" type="submit">{saved?'全部設定已儲存 ✓':'儲存全部設定'}</button></form>;
}

function AdminSettings({data,setData}) {
  const roleName=(value,fallback)=>({直屬主管:'Manager',店長:'Manager',管理員:'Admin',建立者:'Creator'}[value]||(['Manager','Admin','Creator'].includes(value)?value:fallback));
  const storedApproval={...defaultAdminSettings.approval,...data.adminSettings?.approval};
  const [draft,setDraft]=useState(()=>({
    ...defaultAdminSettings,
    ...data.adminSettings,
    shifts:{...defaultAdminSettings.shifts,...data.adminSettings?.shifts},
    clock:{...defaultAdminSettings.clock,...data.adminSettings?.clock},
    leave:{...defaultAdminSettings.leave,...data.adminSettings?.leave},
    approval:{...storedApproval,leaveApprover:roleName(storedApproval.leaveApprover,'Manager'),correctionApprover:roleName(storedApproval.correctionApprover,'Manager'),uploadApprover:roleName(storedApproval.uploadApprover,'Manager'),messageApprover:roleName(storedApproval.messageApprover,'Manager'),payrollApprover:storedApproval.payrollApprover==='建立者'?'Admin':roleName(storedApproval.payrollApprover,'Admin')},
    roles:{...defaultAdminSettings.roles,...data.adminSettings?.roles},
    payroll:{...defaultAdminSettings.payroll,...data.adminSettings?.payroll},
    brand:{...defaultCompanyBrand,...data.companyBrand},
  }));
  const [saved,setSaved]=useState(false);
  const update=(section,key,value)=>{setSaved(false);setDraft(current=>({...current,[section]:{...current[section],[key]:value}}))};
  const save=event=>{event.preventDefault();const {brand,...adminSettings}=draft;setData(current=>({...current,companyBrand:brand,adminSettings}));setSaved(true)};
  const roleRows=[['請假與選休','Leave'],['補卡審核','Correction'],['資料審核','Upload'],['通知與留言','Message'],['薪資審核','Payroll']];
  const approverOptions=['Manager','Admin','Creator'];
  return <form className="all-settings-form settings-rules-page" onSubmit={save}>
    <div className="page-title"><div><span>RULES & PERMISSIONS</span><h1>設定項目規則</h1></div></div>
    <p className="settings-beta-note">設定僅保存於目前瀏覽器；多數規則尚未接入真實定位、裝置、薪資與伺服器權限引擎。</p>
    <div className="settings-rule-summary"><strong>三層管理邏輯</strong><div><span><b>Creator</b>系統、角色與最終權限</span><span><b>Admin</b>薪資、歸檔與進階設定</span><span><b>Manager</b>排班、請假、資料與留言</span></div></div>

    <Card title="班別與排班規則" action={<span className="rule-owner creator">Creator</span>}>
      <p className="settings-help">員工先提報可休日，Manager 編排下週主要班表；當週臨時調整另存，確認後才發布到月曆。</p>
      <div className="setting-checks"><label><input type="checkbox" checked={draft.shifts.mixedShift} onChange={e=>update('shifts','mixedShift',e.target.checked)}/>啟用混合班（不固定班別）</label></div>
      <div className="shift-rule-list">
        {[['早班','early'],['中班','mid'],['晚班','late']].map(([name,key])=><div key={key}><strong>{name}</strong><label>開始<input type="time" value={draft.shifts[`${key}Start`]} onChange={e=>update('shifts',`${key}Start`,e.target.value)}/></label><label>結束<input type="time" value={draft.shifts[`${key}End`]} onChange={e=>update('shifts',`${key}End`,e.target.value)}/></label></div>)}
      </div>
      <div className="settings-grid"><label>固定公休日<select value={draft.shifts.fixedDayOff} onChange={e=>update('shifts','fixedDayOff',e.target.value)}>{['不固定','週一','週二','週三','週四','週五','週六','週日'].map(day=><option key={day}>{day}</option>)}</select></label><label>休息時間（分鐘）<input type="number" min="0" value={draft.shifts.breakMinutes} onChange={e=>update('shifts','breakMinutes',Number(e.target.value))}/></label></div>
      <div className="rule-flow"><span>員工提報</span><i>→</i><span>Manager 排班</span><i>→</i><span>發布月曆</span></div>
    </Card>

    <Card title="打卡與位置規則" action={<span className="rule-owner creator">Creator</span>}>
      <p className="settings-help">NFC 為主要打卡，QR Code 為備援；手動打卡僅在異常時申請並留下審核記錄。</p>
      <div className="settings-grid"><label>上班前可打卡（分鐘）<input type="number" min="0" value={draft.clock.beforeGraceMinutes} onChange={e=>update('clock','beforeGraceMinutes',Number(e.target.value))}/></label><label>下班後可打卡（分鐘）<input type="number" min="0" value={draft.clock.afterGraceMinutes} onChange={e=>update('clock','afterGraceMinutes',Number(e.target.value))}/></label><label>遲到寬限（分鐘）<input type="number" min="0" value={draft.clock.graceMinutes} onChange={e=>update('clock','graceMinutes',Number(e.target.value))}/></label><label>允許距離（公尺）<input type="number" min="10" value={draft.clock.radius} onChange={e=>update('clock','radius',Number(e.target.value))}/></label><label>公司緯度<input value={draft.clock.latitude} onChange={e=>update('clock','latitude',e.target.value)}/></label><label>公司經度<input value={draft.clock.longitude} onChange={e=>update('clock','longitude',e.target.value)}/></label></div>
      <div className="setting-checks"><label><input type="checkbox" checked={draft.clock.nfcPrimary} onChange={e=>update('clock','nfcPrimary',e.target.checked)}/>NFC 為主要打卡方式</label><label><input type="checkbox" checked={draft.clock.locationRequired} onChange={e=>update('clock','locationRequired',e.target.checked)}/>打卡必須驗證定位</label><label><input type="checkbox" checked={draft.clock.deviceRequired} onChange={e=>update('clock','deviceRequired',e.target.checked)}/>限制已登記裝置</label><label><input type="checkbox" checked={draft.clock.qrFallback} onChange={e=>update('clock','qrFallback',e.target.checked)}/>允許 QR Code 備援</label><label><input type="checkbox" checked={draft.clock.manualRequest} onChange={e=>update('clock','manualRequest',e.target.checked)}/>異常時可申請手動補打卡</label></div>
    </Card>

    <Card title="選休週期與假別" action={<span className="rule-owner creator">Creator</span>}>
      <p className="settings-help">設定一次後永久套用到後續週期，仍可隨時修改。</p>
      <div className="rule-segment"><button type="button" className={draft.leave.selectionMode==='weekly'?'active':''} onClick={()=>update('leave','selectionMode','weekly')}>週選休</button><button type="button" className={draft.leave.selectionMode==='monthly'?'active':''} onClick={()=>update('leave','selectionMode','monthly')}>月選休</button></div>
      {draft.leave.selectionMode==='weekly'?<div className="settings-grid"><label>開放提報<select value={draft.leave.weeklyStart} onChange={e=>update('leave','weeklyStart',e.target.value)}>{['週一','週二','週三','週四','週五','週六','週日'].map(day=><option key={day}>{day}</option>)}</select></label><label>提報截止<select value={draft.leave.weeklyCutoff} onChange={e=>update('leave','weeklyCutoff',e.target.value)}>{['週一','週二','週三','週四','週五','週六','週日'].map(day=><option key={day}>{day}</option>)}</select></label><label className="full">班表發布<select value={draft.leave.weeklyPublish} onChange={e=>update('leave','weeklyPublish',e.target.value)}>{['週一','週二','週三','週四','週五','週六','週日'].map(day=><option key={day}>{day}</option>)}</select></label></div>:<div className="settings-grid"><label>每月開放日<input type="number" min="1" max="28" value={draft.leave.monthlyStartDay} onChange={e=>update('leave','monthlyStartDay',Number(e.target.value))}/></label><label>每月截止日<input type="number" min="1" max="28" value={draft.leave.monthlyCutoffDay} onChange={e=>update('leave','monthlyCutoffDay',Number(e.target.value))}/></label><label className="full">每月發布日<input type="number" min="1" max="28" value={draft.leave.monthlyPublishDay} onChange={e=>update('leave','monthlyPublishDay',Number(e.target.value))}/></label></div>}
      <div className="settings-grid leave-quota-grid"><label>特休天數<input type="number" min="0" value={draft.leave.annualDays} onChange={e=>update('leave','annualDays',Number(e.target.value))}/></label><label>病假天數<input type="number" min="0" value={draft.leave.sickDays} onChange={e=>update('leave','sickDays',Number(e.target.value))}/></label><label>事假天數<input type="number" min="0" value={draft.leave.personalDays} onChange={e=>update('leave','personalDays',Number(e.target.value))}/></label><label>病假幾天起需證明<input type="number" min="1" value={draft.leave.proofDays} onChange={e=>update('leave','proofDays',Number(e.target.value))}/></label></div>
    </Card>

    <Card title="審核流程與權限" action={<span className="rule-owner creator">Creator</span>}>
      <div className="setting-checks"><label><input type="checkbox" checked={draft.approval.multiLevel} onChange={e=>update('approval','multiLevel',e.target.checked)}/>啟用多層審核</label></div>
      <div className="approval-route-grid">{[['請假','leaveApprover'],['補卡','correctionApprover'],['上傳資料','uploadApprover'],['留言','messageApprover'],['薪資','payrollApprover']].map(([name,key])=><label key={key}>{name}第一審<select value={draft.approval[key]} onChange={e=>update('approval',key,e.target.value)}>{approverOptions.map(role=><option key={role}>{role}</option>)}</select></label>)}</div>
      {draft.approval.multiLevel&&<label className="rule-level">最高審核層級 <input type="number" min="1" max="3" value={draft.approval.levels} onChange={e=>update('approval','levels',Number(e.target.value))}/><small>逐層上送，Creator 可改寫任何層級。</small></label>}
      <div className="permission-matrix"><div className="permission-head"><strong>功能</strong><b>Manager</b><b>Admin</b><b>Creator</b></div>{roleRows.map(([label,key])=><div key={key}><strong>{label}</strong><input aria-label={`Manager ${label}`} type="checkbox" checked={draft.roles[`manager${key}`]} onChange={e=>update('roles',`manager${key}`,e.target.checked)}/><input aria-label={`Admin ${label}`} type="checkbox" checked={draft.roles[`admin${key}`]} onChange={e=>update('roles',`admin${key}`,e.target.checked)}/><span title="Creator 永久擁有">✓</span></div>)}</div>
      <div className="settings-grid"><label>Manager 管理範圍<select value={draft.roles.managerScope} onChange={e=>update('roles','managerScope',e.target.value)}><option>全公司與全部分店</option><option>指定分店</option></select></label><label>主管管理範圍<select value={draft.roles.supervisorScope} onChange={e=>update('roles','supervisorScope',e.target.value)}><option>所屬分店</option><option>指定部門</option><option>僅直屬員工</option></select></label></div>
    </Card>

    <Card title="薪資規則" action={<span className="rule-owner admin">Admin</span>}>
      <p className="settings-help">勞保、健保、勞退為法定項目，系統自動帶入；獎金、津貼、加班費、餐費、扣款、行政費與稅金可調整。</p>
      <div className="settings-grid"><label>預設薪資類型<select value={draft.payroll.salaryType} onChange={e=>update('payroll','salaryType',e.target.value)}><option>月薪</option><option>時薪</option><option>日薪</option></select></label><label>每月發薪日<input type="number" min="1" max="28" value={draft.payroll.payday} onChange={e=>update('payroll','payday',Number(e.target.value))}/></label><label>平日加班倍率<input type="number" min="1" step="0.01" value={draft.payroll.overtimeRate} onChange={e=>update('payroll','overtimeRate',Number(e.target.value))}/></label><label>匯出薪資表<select value={draft.payroll.exportEnabled?'enabled':'disabled'} onChange={e=>update('payroll','exportEnabled',e.target.value==='enabled')}><option value="enabled">允許</option><option value="disabled">不允許</option></select></label></div>
      <div className="setting-checks"><label><input type="checkbox" checked={draft.payroll.autoLabor} onChange={e=>update('payroll','autoLabor',e.target.checked)}/>自動帶入勞保</label><label><input type="checkbox" checked={draft.payroll.autoHealth} onChange={e=>update('payroll','autoHealth',e.target.checked)}/>自動帶入健保</label><label><input type="checkbox" checked={draft.payroll.autoPension} onChange={e=>update('payroll','autoPension',e.target.checked)}/>自動帶入勞退提撥</label></div>
    </Card>

    <Card title="Logo 與公司名稱" action={<span className="rule-owner admin">Admin</span>}><div className="settings-grid"><label>Logo 文字<input maxLength="4" value={draft.brand.logoText} onChange={e=>update('brand','logoText',e.target.value)}/></label><label>公司名稱<input value={draft.brand.companyName} onChange={e=>update('brand','companyName',e.target.value)}/></label><label className="full">公司副名稱<input value={draft.brand.subtitle} onChange={e=>update('brand','subtitle',e.target.value)}/></label></div><div className="brand-rule-preview"><b>{(draft.brand.logoText||'A').slice(0,4)}</b><span><strong>{draft.brand.companyName||'公司名稱'}</strong><small>{draft.brand.subtitle||'公司副名稱'}</small></span></div></Card>
    <button className="primary admin-gradient settings-save-all" type="submit">{saved?'全部規則已儲存 ✓':'儲存全部設定規則'}</button>
  </form>;
}

function PublishPage({data,setData}) {
  const blank={type:'announcement',title:'',target:'全體員工',content:'',scheduleAt:'',recurrence:'每週',deadline:'',responsePrompt:'',responseType:'長文字',options:['','','']}; const [form,setForm]=useState(blank); const [sent,setSent]=useState(false); const update=(key,value)=>{setSent(false);setForm(current=>({...current,[key]:value}))};
  const publish=event=>{event.preventDefault();if(!form.title.trim()||!form.content.trim())return;const entry={...form,id:Date.now(),title:form.title.trim(),content:form.content.trim(),options:form.options.filter(option=>option.trim()).map(option=>option.trim()),createdAt:'剛剛',responses:[]};setData(current=>({...current,engagements:[entry,...(current.engagements||[])]}));setSent(true);setForm({...blank,type:form.type})};
  const typeLabel={announcement:'一般公告',scheduled:'定期公告',survey:'問卷票選',form:'回覆表單'};
  return <><div className="page-title"><div><span>發布</span><h1>發布中心</h1></div></div><p className="settings-beta-note">內容只保存於目前瀏覽器；發布對象篩選、定期排程與推播尚未由後端執行。</p><Card title="新增發布"><form className="publish-form advanced-publish-form" onSubmit={publish}><div className="publish-type-tabs">{Object.entries(typeLabel).map(([key,label])=><button type="button" key={key} className={form.type===key?'active':''} onClick={()=>update('type',key)}>{label}</button>)}</div><label>標題<input required value={form.title} onChange={event=>update('title',event.target.value)} placeholder={form.type==='survey'?'例如：年終尾牙地點票選':'例如：八月份排班通知'}/></label><label>發布對象<select value={form.target} onChange={event=>update('target',event.target.value)}><option>全體員工</option><option>台北總店</option><option>信義分店</option><option>管理人員</option><option>指定部門</option></select></label><label>{form.type==='survey'?'問卷說明':form.type==='form'?'表單說明':'公告內容'}<textarea required value={form.content} onChange={event=>update('content',event.target.value)} placeholder="輸入要通知或詢問員工的內容…"/></label>{form.type==='scheduled'&&<div className="publish-conditional settings-grid"><label>首次發布時間<input type="datetime-local" value={form.scheduleAt} onChange={event=>update('scheduleAt',event.target.value)}/></label><label>重複頻率<select value={form.recurrence} onChange={event=>update('recurrence',event.target.value)}><option>每日</option><option>每週</option><option>每月</option><option>僅排程一次</option></select></label></div>}{form.type==='survey'&&<div className="publish-conditional"><strong>票選選項</strong><div className="survey-option-editor">{form.options.map((option,index)=><label key={index}>選項 {index+1}<input required={index<2} value={option} onChange={event=>update('options',form.options.map((value,i)=>i===index?event.target.value:value))} placeholder={`輸入第 ${index+1} 個選項`}/></label>)}</div><button type="button" className="add-option" onClick={()=>update('options',[...form.options,''])}>＋ 增加選項</button><label>截止日期<input type="date" value={form.deadline} onChange={event=>update('deadline',event.target.value)}/></label></div>}{form.type==='form'&&<div className="publish-conditional settings-grid"><label className="full">員工回答提示<input value={form.responsePrompt} onChange={event=>update('responsePrompt',event.target.value)} placeholder="例如：請填寫飲食需求或其他建議"/></label><label>回答格式<select value={form.responseType} onChange={event=>update('responseType',event.target.value)}><option>短文字</option><option>長文字</option><option>單選</option></select></label><label>截止日期<input type="date" value={form.deadline} onChange={event=>update('deadline',event.target.value)}/></label></div>}<button className="primary admin-gradient" type="submit">{sent?'已儲存本機紀錄 ✓':'儲存發布紀錄'}</button></form></Card><Card title="發布紀錄"><div className="publish-records">{(data.engagements||[]).map(item=><div className="announcement admin-announcement" key={item.id}><span>{typeLabel[item.type]||'一般公告'} · {item.target}</span><strong>{item.title}</strong><p>{item.content}</p><small>{item.createdAt} · {item.type==='survey'||item.type==='form'?`已回覆 ${(item.responses||[]).length} 人`:'本機紀錄'}</small></div>)}</div></Card></>;
}

function AdminApp({data,setData,dark,setDark,onExit,activeAccount}) { const [page,setPage]=useState('admin-home'); const plan=getPlanProfile(activeAccount,'admin'); const availableNav=adminNav.filter(([id])=>plan.allowedPages.includes(id)); const safePage=plan.allowedPages.includes(page)?page:'admin-home'; useEffect(()=>{if(page!==safePage)setPage(safePage)},[page,safePage]); const content={ 'admin-home':<AdminHome data={data} setData={setData} go={setPage} activeAccount={activeAccount}/>,approvals:<ApprovalsPage data={data} setData={setData}/>, 'admin-schedule':<AdminSchedulePage data={data} setData={setData}/>, 'admin-settings':<AdminSettings data={data} setData={setData}/>,publish:<PublishPage data={data} setData={setData}/>,people:<PeoplePage data={data} setData={setData}/>,salary:<SalaryPage data={data} setData={setData}/>}[safePage]; return <AppShell role="admin" dark={dark}><Topbar role="admin" dark={dark} setDark={setDark} onExit={onExit} onHome={() => setPage('admin-home')} data={data} setData={setData} activeAccount={activeAccount}/><div className="safe page-enter"><PageCalendar page={safePage} role="admin" data={data}/>{content}</div><BottomNav items={availableNav} page={safePage} setPage={setPage} role="admin"/></AppShell> }

function AppShell({children,role,dark,style}) { return <main className={`app-shell ${role} ${dark?'dark':''}`} style={style}>{children}</main> }

function App() {
  const [role,setRole]=useState(()=>readDemoSessionAccount()?.role || null); const [data,setData]=usePersistentState();
  const [activeAccount,setActiveAccount]=useState(()=>readDemoSessionAccount());
  const [dark,setDark]=useState(()=>safeStorageRead('local', 'ang-hr-theme')==='dark');
  const [openingDark,setOpeningDark]=useState(()=>safeStorageRead('local', 'ang-hr-theme')==='dark');
  const [showOpening,setShowOpening]=useState(()=>!(window.ANGNative || window.ANGHRApp || window.Android));
  const [themePrompt,setThemePrompt]=useState(null);
  useEffect(()=>{safeStorageWrite('local', 'ang-hr-theme', dark?'dark':'light');document.documentElement.style.colorScheme=dark?'dark':'light'},[dark]);
  const requestThemeChange = nextDark => { if (nextDark !== dark) setThemePrompt(nextDark); };
  const changeRole = (nextRole, account = null) => {
    const canonicalAccount = getCanonicalBetaAccount(account);
    const validAccount = canonicalAccount?.role === nextRole ? canonicalAccount : null;
    setRole(validAccount?.role || null);
    setActiveAccount(validAccount);
    if (validAccount) {
      safeStorageWrite('session', 'ang-hr-demo-role', validAccount.role);
      safeStorageWrite('session', 'ang-hr-demo-account', JSON.stringify(validAccount));
    } else {
      safeStorageRemove('session', 'ang-hr-demo-role');
      safeStorageRemove('session', 'ang-hr-demo-account');
    }
  };
  const applyThemeChange = complete => {
    const nextDark = themePrompt;
    setDark(nextDark);
    if (complete) {
      safeStorageWrite('local', 'ang-hr-full-theme', nextDark ? 'dark' : 'light');
      setOpeningDark(nextDark);
      if (!(window.ANGNative || window.ANGHRApp || window.Android)) setShowOpening(true);
    }
    setThemePrompt(null);
  };
  const page = !role
    ? <Landing dark={dark} setDark={requestThemeChange} onEnter={changeRole}/>
    : role==='employee'
      ? <EmployeeApp data={data} setData={setData} dark={dark} setDark={requestThemeChange} onExit={()=>changeRole(null)} activeAccount={activeAccount}/>
      : <AdminApp data={data} setData={setData} dark={dark} setDark={requestThemeChange} onExit={()=>changeRole(null)} activeAccount={activeAccount}/>;
  return <>{page}{showOpening && <OpeningVideo dark={openingDark} onDone={() => setShowOpening(false)}/>} {themePrompt !== null && <ThemeChangeDialog nextDark={themePrompt} onComplete={()=>applyThemeChange(true)} onPageOnly={()=>applyThemeChange(false)} onCancel={()=>setThemePrompt(null)}/>}</>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
