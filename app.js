/* ═══════════════════════════════════════════════════
   QuickRecharge - app.js
   ─────────────────────────────────────────────────
   SETUP INSTRUCTIONS:
   1. Replace RAZORPAY_KEY_ID with your Razorpay key
   2. Replace Firebase config with your own project
   3. When ready: replace PAYSPRINT placeholders
      in processRecharge() with real API calls
   ═══════════════════════════════════════════════════ */

// ── CONFIG ──────────────────────────────────────────
const CONFIG = {
  RAZORPAY_KEY: 'rzp_test_SmMht4tVU7dncS',
  APP_NAME: 'QuickRecharge',
  APP_LOGO: '',                                 // ← Optional: logo URL
  APP_COLOR: '#5f259f',

  // PaySprint API (add when ready)
  PAYSPRINT_TOKEN: 'YOUR_PAYSPRINT_TOKEN',      // ← Replace later
  PAYSPRINT_URL: 'https://paysprint.in/service-api/api/v1/service/recharge/recharge/dorecharge',
};

// ── FIREBASE CONFIG ─────────────────────────────────
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',              // ← Replace this
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
  projectId: 'YOUR_PROJECT',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

// ── PLANS DATA ───────────────────────────────────────
const PLANS = {
  popular: [
    {
      id: 'p1',
      price: 299,
      originalPrice: 599,
      validity: '84 days',
      data: '2 GB/day',
      voice: 'Unlimited',
      sms: '100/day',
      tag: 'True 5G Unlimited',
      badge: 'POPULAR',
      benefits: ['5g', 'hotstar', 'adobe', 'shield']
    },
    {
      id: 'p2',
      price: 179,
      originalPrice: 299,
      validity: '28 days',
      data: '1.5 GB/day',
      voice: 'Unlimited',
      sms: '100/day',
      tag: 'Monthly Plan',
      badge: 'BEST VALUE',
      benefits: ['5g', 'music']
    },
    {
      id: 'p3',
      price: 479,
      originalPrice: 799,
      validity: '90 days',
      data: '3 GB/day',
      voice: 'Unlimited',
      sms: '100/day',
      tag: 'True 5G Premium',
      badge: 'NEW',
      benefits: ['5g', 'hotstar', 'adobe', 'shield', 'apollo', 'music']
    }
  ],
  data: [
    {
      id: 'd1',
      price: 19,
      originalPrice: 35,
      validity: '1 day',
      data: '1 GB',
      voice: 'Unlimited',
      sms: '0',
      tag: 'Day Pack',
      badge: 'DATA'
    },
    {
      id: 'd2',
      price: 49,
      originalPrice: 89,
      validity: '7 days',
      data: '6 GB',
      voice: 'Unlimited',
      sms: '0',
      tag: 'Weekly Data',
      badge: 'DATA'
    },
    {
      id: 'd3',
      price: 151,
      originalPrice: 251,
      validity: '30 days',
      data: '50 GB',
      voice: 'NA',
      sms: '0',
      tag: 'Data Add-on',
      badge: 'DATA ONLY'
    }
  ],
  yearly: [
    {
      id: 'y1',
      price: 999,
      originalPrice: 1799,
      validity: '365 days',
      data: '24 GB/Year',
      voice: 'Unlimited',
      sms: '3600/Year',
      tag: 'Yearly Value',
      badge: 'YEARLY'
    },
    {
      id: 'y2',
      price: 2399,
      originalPrice: 3599,
      validity: '365 days',
      data: '2 GB/day',
      voice: 'Unlimited',
      sms: '100/day',
      tag: 'Annual Premium',
      badge: 'BEST ANNUAL'
    }
  ]
};

// ── APP STATE ────────────────────────────────────────
let state = {
  operator: 'Jio',
  phone: '',
  selectedPlan: null,
  currentTab: 'popular'
};

const DEFAULT_THEME = { primary: '#5f259f', dark: '#3c1a7a', light: '#f3eafc', mid: '#8b3fd4' };
const OPERATOR_THEME = {
  Jio: { primary: '#1F18C0', dark: '#141269', light: '#e4e6ff', mid: '#6b72ff' },
  Airtel: { primary: '#C91D22', dark: '#8d1317', light: '#f8d2d5', mid: '#e4787e' },
  Vi: { primary: '#C91D22', dark: '#8d1317', light: '#f8d2d5', mid: '#e4787e' },
  BSNL: { primary: '#7CC6FF', dark: '#3a89c4', light: '#def0ff', mid: '#a3d4ff' }
};

function applyTheme(operator) {
  const theme = OPERATOR_THEME[operator] || DEFAULT_THEME;
  document.documentElement.style.setProperty('--primary', theme.primary);
  document.documentElement.style.setProperty('--primary-dark', theme.dark);
  document.documentElement.style.setProperty('--primary-light', theme.light);
  document.documentElement.style.setProperty('--primary-mid', theme.mid);
  document.documentElement.style.setProperty('--brand-icon-bg', theme.primary);
  document.documentElement.style.setProperty('--brand-color', theme.dark);
  document.documentElement.style.setProperty('--accent', theme.light);
  CONFIG.APP_COLOR = theme.primary;
}

function resetTheme() {
  document.documentElement.style.setProperty('--primary', DEFAULT_THEME.primary);
  document.documentElement.style.setProperty('--primary-dark', DEFAULT_THEME.dark);
  document.documentElement.style.setProperty('--primary-light', DEFAULT_THEME.light);
  document.documentElement.style.setProperty('--primary-mid', DEFAULT_THEME.mid);
  document.documentElement.style.setProperty('--brand-icon-bg', DEFAULT_THEME.primary);
  document.documentElement.style.setProperty('--brand-color', DEFAULT_THEME.dark);
  document.documentElement.style.setProperty('--accent', DEFAULT_THEME.light);
  CONFIG.APP_COLOR = DEFAULT_THEME.primary;
}

// ── DOM REFS ─────────────────────────────────────────
const $ = id => document.getElementById(id);
const screens = {
  home: $('screen-home'),
  plans: $('screen-plans'),
  success: $('screen-success')
};

// ── INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  initOperatorSelector();
  resetTheme();
  initNavigation();
  initTabs();
  renderPlans('popular');
  startCountdown();
});

// ── FIREBASE INIT ────────────────────────────────────
function initFirebase() {
  try {
    if (firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY') {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      console.log('Firebase connected');
    } else {
      console.log('Firebase not configured yet - running in demo mode');
    }
  } catch (e) {
    console.log('Firebase optional - skipping');
  }
}

// ── OPERATOR SELECTOR ────────────────────────────────
function initOperatorSelector() {
  document.querySelectorAll('.op-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.op-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      state.operator = item.dataset.op;
    });
  });
}

// ── NAVIGATION ───────────────────────────────────────
function initNavigation() {
  // Home → Plans
  $('btn-proceed').addEventListener('click', () => {
    const val = $('phone-input').value.trim();
    if (!/^\d{10}$/.test(val)) {
      $('phone-error').style.display = 'block';
      return;
    }
    $('phone-error').style.display = 'none';
    state.phone = val;
    showLoading('Fetching best plans for you...');

    setTimeout(() => {
      updateAccountStrip();
      applyTheme(state.operator);
      showScreen('plans');
      hideLoading();
    }, 1500);
  });

  // Plans → Home (back)
  $('btn-back-plans').addEventListener('click', () => {
    resetTheme();
    showScreen('home');
  });

  // Change number
  $('btn-change').addEventListener('click', () => {
    resetTheme();
    showScreen('home');
  });

  // Success → Home (recharge again)
  $('btn-done').addEventListener('click', () => {
    $('phone-input').value = '';
    resetTheme();
    showScreen('home');
  });
}

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo(0, 0);
}

function updateAccountStrip() {
  $('acct-number').textContent = state.phone.replace(/(\d{5})(\d{5})/, '$1 $2');
  $('acct-op').textContent = `${state.operator} Prepaid`;
  $('acct-avatar').textContent = state.operator.charAt(0);
}

// ── TABS ─────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.ptab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentTab = tab.dataset.tab;
      renderPlans(state.currentTab);
    });
  });
}

// ── BENEFITS DATA ────────────────────────────────────
const BENEFITS = {
  '5g':      { bg: '#e0f2fe', color: '#0369a1', icon: '5G',  title: 'Unlimited 4G + 5G Data',     desc: 'Unlimited data for all handsets without daily limits' },
  'applemusic': { bg: '#dbeafe', color: '#1d4ed8', icon: 'AM', title: 'Apple Music',               desc: '6 months free Apple Music subscription' },
  'freehellotunes': { bg: '#f3e8ff', color: '#7c3aed', icon: '♪', title: 'Free Hello Tunes',        desc: 'Keep your caller tune active without extra charge' },
  'hotstar': { bg: '#fce7f3', color: '#be185d', icon: 'JH',  title: 'JioHotstar Mobile 28 days',   desc: 'Watch Live Sports, Movies & Exclusive Specials' },
  'adobe':   { bg: '#dbeafe', color: '#1d4ed8', icon: 'A',   title: 'Adobe Express Premium',       desc: '12 Months free benefit worth ~₹4k' },
  'music':   { bg: '#f3e8ff', color: '#7c3aed', icon: '♪',   title: 'Free Hellotunes',             desc: 'Set any one tune every 30 days for free' },
  'shield':  { bg: '#fef9c3', color: '#b45309', icon: '🛡',   title: 'The Safe Network',            desc: 'Fraud link blocking & real-time SPAM alerts' },
  'apollo':  { bg: '#dcfce7', color: '#16a34a', icon: 'A+',  title: 'Apollo 24|7 Circle',          desc: '3 Months Extra at No Cost' },
};

// ── RENDER PLANS ─────────────────────────────────────
function renderPlans(tab) {
  const container = $('plans-list');
  container.innerHTML = '';
  const plans = PLANS[tab] || [];

  plans.forEach(plan => {
    const saving = Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100);
    const card = document.createElement('div');
    card.className = 'plan-card';
    card.innerHTML = `
      <div class="plan-card-head">
        <span class="tag">${plan.tag}</span>
        <span class="plan-badge">${plan.badge}</span>
      </div>
      <div class="plan-card-body">
        <div class="price-row">
          <span class="price-main">₹${plan.price}</span>
          <span class="price-original">₹${plan.originalPrice}</span>
          <span class="price-save">Save ${saving}%</span>
        </div>
        <div class="feat-grid">
          <div class="feat-item">
            <div class="feat-label">Validity</div>
            <div class="feat-value">${plan.validity}</div>
          </div>
          <div class="feat-item">
            <div class="feat-label">Data</div>
            <div class="feat-value">${plan.data}</div>
          </div>
          <div class="feat-item">
            <div class="feat-label">Voice</div>
            <div class="feat-value">${plan.voice}</div>
          </div>
          <div class="feat-item">
            <div class="feat-label">SMS</div>
            <div class="feat-value">${plan.sms}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn-view-details" data-plan="${plan.id}" style="flex:1;background:var(--primary-light);color:var(--primary);border:1px solid #e0d0f5;border-radius:var(--radius-md);padding:11px;font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;">
            View Details
          </button>
          <button class="btn-recharge" data-plan="${plan.id}" style="flex:2;">
            Recharge — ₹${plan.price}
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // View Details → open modal
  container.querySelectorAll('.btn-view-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const allPlans = [...PLANS.popular, ...PLANS.data, ...PLANS.yearly];
      const plan = allPlans.find(p => p.id === btn.dataset.plan);
      if (plan) openPlanModal(plan);
    });
  });

  // Recharge directly
  container.querySelectorAll('.btn-recharge').forEach(btn => {
    btn.addEventListener('click', () => {
      const allPlans = [...PLANS.popular, ...PLANS.data, ...PLANS.yearly];
      const plan = allPlans.find(p => p.id === btn.dataset.plan);
      if (plan) initiatePayment(plan);
    });
  });
}

// ── PLAN MODAL ───────────────────────────────────────
function openPlanModal(plan) {
  state.selectedPlan = plan;

  $('modal-price').textContent = '₹' + plan.price;
  $('modal-operator').textContent = state.operator + ' Prepaid — ' + plan.tag;
  $('modal-voice').textContent = 'Unlimited Local & STD Calls';
  $('modal-sms').textContent = plan.sms + ' SMS Per Day';
  $('modal-validity').textContent = plan.validity + ' Validity';
  $('modal-data').textContent = plan.data + ' 5G Data';

  // Render benefits
  let benefitKeys = plan.benefits || ['5g', 'hotstar', 'adobe', 'shield'];
  if (state.operator === 'Airtel') {
    benefitKeys = benefitKeys.filter(k => k !== 'hotstar');
    if (!benefitKeys.includes('applemusic')) benefitKeys.unshift('applemusic');
    if (!benefitKeys.includes('music') && !benefitKeys.includes('freehellotunes')) benefitKeys.push('freehellotunes');
  }
  if (state.operator === 'Vi') {
    benefitKeys = benefitKeys.filter(k => k !== 'hotstar');
    if (!benefitKeys.includes('apollo')) benefitKeys.unshift('apollo');
  }
  $('modal-benefits-count').textContent = benefitKeys.length + ' MORE REWARDS';
  const list = $('modal-benefits-list');
  list.innerHTML = '';
  list.classList.remove('open');

  benefitKeys.forEach(key => {
    const b = BENEFITS[key];
    if (!b) return;
    const row = document.createElement('div');
    row.className = 'benefit-row';
    row.innerHTML = `
      <div class="benefit-icon-box" style="background:${b.bg};color:${b.color};">${b.icon}</div>
      <div class="benefit-info">
        <div class="benefit-title">${b.title}</div>
        <div class="benefit-desc">${b.desc}</div>
      </div>
    `;
    list.appendChild(row);
  });

  $('plan-modal').classList.add('active');
}

function closePlanModal() {
  $('plan-modal').classList.remove('active');
}

// Modal event listeners
document.addEventListener('DOMContentLoaded', () => {
  $('modal-close').addEventListener('click', closePlanModal);
  $('plan-modal').addEventListener('click', e => {
    if (e.target === $('plan-modal')) closePlanModal();
  });
  $('modal-recharge-btn').addEventListener('click', () => {
    closePlanModal();
    if (state.selectedPlan) initiatePayment(state.selectedPlan);
  });
  $('modal-benefits-toggle').addEventListener('click', () => {
    const list = $('modal-benefits-list');
    list.classList.toggle('open');
    $('benefits-chevron').style.transform = list.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
  });
});

// ── PAYMENT VIA RAZORPAY ─────────────────────────────
function initiatePayment(plan) {
  state.selectedPlan = plan;

  if (CONFIG.RAZORPAY_KEY === 'YOUR_RAZORPAY_KEY_ID') {
    // Demo mode - skip real payment
    alert('DEMO MODE: Razorpay key not set yet.\nIn production, payment of ₹' + plan.price + ' would be collected here.');
    showSuccessScreen(plan, 'DEMO_' + Date.now());
    return;
  }

  const options = {
    key: CONFIG.RAZORPAY_KEY,
    amount: plan.price * 100,      // Razorpay takes paise (1 INR = 100 paise)
    currency: 'INR',
    name: CONFIG.APP_NAME,
    description: `${state.operator} Recharge - ${plan.validity}`,
    image: CONFIG.APP_LOGO,
    prefill: {
      contact: state.phone
    },
    theme: {
      color: CONFIG.APP_COLOR
    },
    handler: function(response) {
      // Payment successful - now do the actual recharge
      const paymentId = response.razorpay_payment_id;
      processRecharge(plan, paymentId);
    },
    modal: {
      ondismiss: function() {
        console.log('Payment cancelled by user');
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', function(response) {
    alert('Payment failed: ' + response.error.description);
  });
  rzp.open();
}

// ── PROCESS RECHARGE VIA PAYSPRINT ──────────────────
async function processRecharge(plan, paymentId) {
  showPaymentOverlay();

  // ─── PAYSPRINT INTEGRATION ───────────────────────
  // When you get your PaySprint token, uncomment this block:
  /*
  try {
    const response = await fetch(CONFIG.PAYSPRINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': CONFIG.PAYSPRINT_TOKEN,
        'Authorisedkey': 'YOUR_PAYSPRINT_AUTH_KEY'
      },
      body: JSON.stringify({
        operator: getOperatorCode(state.operator),
        canumber: state.phone,
        amount: plan.price,
        referenceid: paymentId,
        latitude: '0',
        longitude: '0'
      })
    });
    const data = await response.json();
    if (data.status === true) {
      hidePaymentOverlay();
      saveOrderToFirebase(plan, paymentId, data.operatorref);
      showSuccessScreen(plan, paymentId);
    } else {
      hidePaymentOverlay();
      alert('Recharge failed: ' + data.message + '\nPlease contact support.');
    }
  } catch (err) {
    hidePaymentOverlay();
    alert('Network error. Please contact support with payment ID: ' + paymentId);
  }
  */

  // DEMO: Simulate recharge (remove when PaySprint is ready)
  setTimeout(() => {
    hidePaymentOverlay();
    saveOrderToFirebase(plan, paymentId, 'OPERATOR_' + Date.now());
    showSuccessScreen(plan, paymentId);
  }, 2000);
}

// ── OPERATOR CODE MAP (for PaySprint API) ────────────
function getOperatorCode(operator) {
  const map = {
    'Jio': 'JIO',
    'Airtel': 'AL',
    'Vi': 'VIL',
    'BSNL': 'BSNL'
  };
  return map[operator] || operator;
}

// ── SAVE ORDER TO FIREBASE ───────────────────────────
function saveOrderToFirebase(plan, paymentId, operatorRef) {
  try {
    if (firebase.apps.length) {
      const db = firebase.database();
      db.ref('orders/' + paymentId).set({
        phone: state.phone,
        operator: state.operator,
        plan: plan.tag,
        amount: plan.price,
        validity: plan.validity,
        paymentId: paymentId,
        operatorRef: operatorRef || '',
        timestamp: Date.now(),
        status: 'success'
      });
    }
  } catch (e) {
    console.log('Firebase save skipped - not configured');
  }
}

// ── SUCCESS SCREEN ───────────────────────────────────
function showSuccessScreen(plan, paymentId) {
  $('rec-op').textContent = state.operator;
  $('rec-phone').textContent = '+91 ' + state.phone;
  $('rec-amount').textContent = '₹' + plan.price;
  $('rec-validity').textContent = plan.validity;
  $('rec-txn').textContent = paymentId;
  showScreen('success');
}

// ── COUNTDOWN TIMER ──────────────────────────────────
function startCountdown() {
  let seconds = 14 * 60 + 59;
  const el = $('countdown');
  const interval = setInterval(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    seconds--;
    if (seconds < 0) {
      seconds = 14 * 60 + 59; // reset
    }
  }, 1000);
}

// ── LOADING HELPERS ──────────────────────────────────
function showLoading(msg) {
  $('loader-msg').textContent = msg || 'Loading...';
  $('loading-overlay').classList.add('active');
}
function hideLoading() {
  $('loading-overlay').classList.remove('active');
}
function showPaymentOverlay() {
  $('payment-overlay').classList.add('active');
}
function hidePaymentOverlay() {
  $('payment-overlay').classList.remove('active');
}
