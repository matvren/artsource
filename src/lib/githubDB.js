// localStorage primary + optional GitHub sync
const OWNER = 'matvren';
const REPO = 'artsource';
const FILE_PATH = 'data/db.json';
const BRANCH = 'main';

const LS_ACCOUNTS = 'artsource-accounts';
const LS_VENDORS = 'artsource-custom-vendors';

// --- Token ---
export function getToken() {
  return localStorage.getItem('artsource-github-token') || '';
}
export function setToken(t) { localStorage.setItem('artsource-github-token', t); }
export function hasToken() { return !!getToken(); }

// --- Fetch: try API first, fall back to GitHub raw ---
async function fetchRaw() {
  // Try Vercel API (reads from Vercel Blob)
  try {
    const res = await fetch('/api/sync');
    if (res.ok) return await res.json();
  } catch {}
  // Fall back to GitHub raw
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE_PATH}`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error('GitHub fetch failed');
  return await res.json();
}

async function getFileSha() {
  const token = getToken();
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${msg}`);
  }
  return (await res.json()).sha;
}

async function pushToGitHubRaw(data) {
  // Try Vercel API endpoint first (server-side token, no client token needed)
  try {
    const apiUrl = '/api/sync';
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return;
  } catch {
    // API unavailable (local dev), fall through
  }
  // Fallback: direct GitHub API with local token
  if (!hasToken()) return;
  const sha = await getFileSha();
  const json = JSON.stringify(data, null, 2);
  const content = btoa(unescape(encodeURIComponent(json)));
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Sync data', content, sha, branch: BRANCH }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${msg}`);
  }
}

// --- Deleted accounts (prevents re-import from GitHub when push fails) ---
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
  // Merge deleted accounts from remote (cross-device sync)
  const remoteDeleted = remote.deletedAccounts || [];
  const localDeleted = getDeletedAccounts();
  const mergedDeleted = [...new Set([...localDeleted, ...remoteDeleted])];
  localStorage.setItem('artsource-deleted-accounts', JSON.stringify(mergedDeleted));
  // Merge accounts (exclude accounts deleted locally or on another device)
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
    await pushToGitHubRaw(data);
    clearDeletedAccounts();
  } catch {
    // push failed — local delete stays tracked, won't re-import on this device
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
export async function pullFromGitHub() {
  return await syncFromGitHub();
}

export async function pushAllToGitHub() {
  await pushToGitHubAll();
}
