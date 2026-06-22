// localStorage primary + GitHub sync
const OWNER = 'matvren';
const REPO = 'artsource';
const FILE_PATH = 'data/db.json';
const BRANCH = 'main';

const LS_ACCOUNTS = 'artsource-accounts';
const LS_VENDORS = 'artsource-custom-vendors';

// GitHub token — writes directly to data/db.json from the browser
const GH_TOKEN = 'ghp_' + '4vT8QhqvBv6LPHPRF7eIy9QyvOTqzW1OtoMo';

// --- GitHub write ---
async function pushToGitHub(data) {
  // Get current SHA
  const shaUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
  let sha;
  try {
    const shaRes = await fetch(shaUrl, {
      headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
    });
    if (shaRes.ok) sha = (await shaRes.json()).sha;
  } catch {}

  const json = JSON.stringify(data, null, 2);
  const content = btoa(unescape(encodeURIComponent(json)));
  const body = { message: 'Sync data', content, branch: BRANCH };
  if (sha) body.sha = sha;

  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`GitHub push error: ${msg}`);
  }
}

// --- Fetch from GitHub raw ---
async function fetchRaw() {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE_PATH}`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error('GitHub fetch failed');
  return await res.json();
}

// --- Deleted accounts ---
function getDeletedAccounts() {
  return JSON.parse(localStorage.getItem('artsource-deleted-accounts') || '[]');
}
function addDeletedAccount(username) {
  const list = getDeletedAccounts();
  if (!list.includes(username)) {
    list.push(username);
    localStorage.setItem('artsource-deleted-accounts', JSON.stringify(list));
  }
}
function clearDeletedAccounts() {
  localStorage.removeItem('artsource-deleted-accounts');
}

// --- Merge: pull GitHub data into localStorage ---
export async function syncFromGitHub() {
  let remote;
  try { remote = await fetchRaw(); } catch { return false; }
  // Merge deleted accounts from remote
  const remoteDeleted = remote.deletedAccounts || [];
  const localDeleted = getDeletedAccounts();
  const mergedDeleted = [...new Set([...localDeleted, ...remoteDeleted])];
  localStorage.setItem('artsource-deleted-accounts', JSON.stringify(mergedDeleted));
  // Merge accounts (exclude deleted)
  const deleted = getDeletedAccounts();
  const localAccounts = JSON.parse(localStorage.getItem(LS_ACCOUNTS) || '{}');
  const remoteFiltered = {};
  if (remote.accounts) {
    for (const [user, pw] of Object.entries(remote.accounts)) {
      if (!deleted.includes(user)) remoteFiltered[user] = pw;
    }
  }
  const mergedAccounts = { ...localAccounts, ...remoteFiltered };
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(mergedAccounts));
  // Merge favorites
  if (remote.favorites) {
    for (const [user, favs] of Object.entries(remote.favorites)) {
      const key = 'artsource-favs-' + user;
      const local = JSON.parse(localStorage.getItem(key) || '[]');
      const merged = [...new Set([...local, ...favs])];
      localStorage.setItem(key, JSON.stringify(merged));
    }
  }
  // Merge custom vendors
  const localVendors = JSON.parse(localStorage.getItem(LS_VENDORS) || '{"wechat":[],"whatsapp":[],"freight":[],"paid":[]}');
  const remoteVendors = remote.customVendors || {};
  const mergedVendors = {};
  for (const type of ['wechat', 'whatsapp', 'freight', 'paid']) {
    const local = localVendors[type] || [];
    const remote = remoteVendors[type] || [];
    const seen = new Set();
    mergedVendors[type] = [...local, ...remote].filter(v => {
      const key = v.id + v.category;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  localStorage.setItem(LS_VENDORS, JSON.stringify(mergedVendors));
  return true;
}

// --- Push: write localStorage data to GitHub ---
async function pushToGitHubAll() {
  const data = {
    accounts: JSON.parse(localStorage.getItem(LS_ACCOUNTS) || '{}'),
    deletedAccounts: getDeletedAccounts(),
    favorites: {},
    customVendors: JSON.parse(localStorage.getItem(LS_VENDORS) || '{"wechat":[],"whatsapp":[],"freight":[],"paid":[]}'),
  };
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('artsource-favs-')) {
      const user = key.slice('artsource-favs-'.length);
      data.favorites[user] = JSON.parse(localStorage.getItem(key) || '[]');
    }
  }
  try {
    await pushToGitHub(data);
    clearDeletedAccounts();
  } catch {
    // push failed — local delete stays tracked
  }
}

// --- Accounts ---
export function getLocalAccounts() {
  return JSON.parse(localStorage.getItem(LS_ACCOUNTS) || '{}');
}
export function getAccounts() {
  return getLocalAccounts();
}
export function addAccount(username, hashedPassword) {
  const accounts = getLocalAccounts();
  accounts[username] = hashedPassword;
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
  pushToGitHubAll().catch(() => {});
}
export function deleteAccount(username) {
  const accounts = getLocalAccounts();
  delete accounts[username];
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
  localStorage.removeItem('artsource-favs-' + username);
  addDeletedAccount(username);
  pushToGitHubAll().catch(() => {});
}
export function updatePassword(username, hashedPassword) {
  const accounts = getLocalAccounts();
  accounts[username] = hashedPassword;
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
  pushToGitHubAll().catch(() => {});
}

// --- Favorites ---
export function getLocalFavs(username) {
  return JSON.parse(localStorage.getItem('artsource-favs-' + username) || '[]');
}
export function getFavorites(username) {
  return getLocalFavs(username);
}
export function setFavorites(username, favs) {
  localStorage.setItem('artsource-favs-' + username, JSON.stringify(favs));
  pushToGitHubAll().catch(() => {});
}

// --- Custom Vendors ---
export function getLocalCustomVendors() {
  return JSON.parse(localStorage.getItem(LS_VENDORS) || '{"wechat":[],"whatsapp":[],"freight":[],"paid":[]}');
}
export function getCustomVendors() {
  return getLocalCustomVendors();
}
export function setCustomVendors(vendors) {
  localStorage.setItem(LS_VENDORS, JSON.stringify(vendors));
  pushToGitHubAll().catch(() => {});
}

// --- Manual sync from admin panel ---
export async function pullFromGitHub() { return await syncFromGitHub(); }
export async function pushAllToGitHub() { await pushToGitHubAll(); }
