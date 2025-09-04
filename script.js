const GET_URL = 'https://script.google.com/macros/s/AKfycbzG9OdzO0kJQ1k8Duh5y6lGH1xyVUr1Jcln8Nbg0XThlyniroL2l5R-56Ks1uJDVLdo3Q/exec';  // replace with your Apps Script GET endpoint

let lastEmail = '';

async function fetchUser(email) {
  try {
    const res = await fetch(`${GET_URL}?email=${email}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: 'Failed to fetch data' };
  }
}

async function searchUser() {
  const email = document.getElementById('email').value.trim();
  if (!email) return alert('Please enter an email!');
  
  lastEmail = email;

  setButtonLoading('searchBtn', true);
  const data = await fetchUser(email);
  displayUser(data);
  setButtonLoading('searchBtn', false);
}

async function refreshUser() {
  if (!lastEmail) return alert('No user to refresh. Search first!');
  setButtonLoading('refreshBtn', true);
  const data = await fetchUser(lastEmail);
  displayUser(data);
  setButtonLoading('refreshBtn', false);
}

function displayUser(data) {
  const card = document.getElementById('userCard');
  if (data.error) {
    card.style.display = 'block';
    card.innerHTML = `<p style="color:red;">${data.error}</p>`;
    return;
  }
  
  const email = data.Customer_email || data.Email || '';
  const name = `${data.First_name || ''} ${data.Last_name || ''}`.trim() || 'Customer';
  const clv = (data.CLV || data.Customer_Lifetime_Value || '').toString().toLowerCase();
  const churn = data.Prop_churn != null ? Number(data.Prop_churn) : null;
  const discount = data.Discount != null ? Number(data.Discount) : null;
  const daysSince = data.days_since_last_purchase;
  const totalPurchases = data.total_purchases != null ? Number(data.total_purchases) : null;
  const phone = data.current_phone || '';
  const signup = data.signup_date ? new Date(data.signup_date) : null;

  const clvClass = clv.includes('high') ? 'good' : clv.includes('low') ? 'bad' : 'neutral';
  const churnClass = churn == null ? 'bad' : churn > 0.5 ? 'bad' : churn < 0.25 ? 'good' : 'neutral';

  const signupStr = signup ? signup.toLocaleDateString() : '—';
  const churnPct = churn == null ? '—' : `${Math.round(churn * 100)}%`;
  const discountStr = discount == null ? '—' : `${discount}%`;
  const daysStr = daysSince == null || daysSince === '' ? '—' : daysSince;
  const purchasesStr = totalPurchases == null ? '—' : `${totalPurchases}`;

  const html = `
    <div class="user-header">
      <div class="avatar"></div>
      <div class="name-email">
        <div class="name">${name}</div>
        <div class="email">${email}</div>
      </div>
    </div>
    <div class="grid">
      <div class="stat">
        <div class="label">Customer Lifetime Value</div>
        <div class="value ${clvClass}">${(data.CLV || '—')}</div>
      </div>
            <div class="stat">
        <div class="label">Current Phone</div>
        <div class="value">${phone || '—'}</div>
      </div>
      <div class="stat">
        <div class="label">Discount</div>
        <div class="value">${discountStr}</div>
      </div>
      <div class="stat">
        <div class="label">Total Purchases</div>
        <div class="value">${purchasesStr}</div>
      </div>
            <div class="stat">
        <div class="label">Current Plan Name</div>
        <div class="value">${daysStr}</div>
      </div>
      <div class="stat">
        <div class="label">Churn Probability</div>
        <div class="value ${churnClass}">${churnPct}</div>
      </div>
      <div class="section">
        <h3>Profile</h3>
        <ul class="list">
          <li><strong>Signup Date:</strong> ${signupStr}</li>
          <li><strong>Email:</strong> ${email || '—'}</li>
        </ul>
      </div>
    </div>
  `;
  card.style.display = 'block';
  card.innerHTML = html;
}

function setButtonLoading(buttonId, isLoading) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.classList.add('btn-loading');
  } else {
    btn.disabled = false;
    btn.classList.remove('btn-loading');
  }
}
