const OWNER = 'matvren';
const REPO = 'artsource';
const FILE_PATH = 'data/db.json';
const BRANCH = 'main';

const LS_ACCOUNTS = 'artsource-accounts';
const LS_FAVS_PREFIX = 'artsource-favs-';
const LS_VENDORS = 'artsource-custom-vendors';

export function getToken() {
  return localStorage.getItem('artsource-github-token') || '';
}

export function setToken(token) {
  localStorage.setItem('artsource-github-token', token);
}

export function hasToken() {
  return !!getToken();
}

async function getFileSha(token) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error('Failed to get file info');
  const data = await res.json();
  return data.sha;
}

async function readRaw() {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE_PATH}`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error('Failed to read from GitHub');
  return await res.json();
}

async function writeToGitHub(data) {
  const token = getToken();
  const sha = await getFileSha(token);
  const json = JSON.stringify(data, null, 2);
  const content = btoa(unescape(encodeURIComponent(json)));
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Update database', content, sha, branch: BRANCH }),
  });
  if (!res.ok) throw new Error('Failed to write to GitHub');
}

// --- Accounts ---

export function getLocalAccounts() {
  return JSON.parse(localStorage.getItem(LS_ACCOUNTS) || '{}');
}

function saveLocalAccounts(accounts) {
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
}

export async function getAccounts() {
  try {
    return (await readRaw()).accounts || {};
  } catch {
    return getLocalAccounts();
  }
}

export async function addAccount(username, hashedPassword) {
  if (hasToken()) {
    try {
      const db = await readRaw();
      db.accounts[username] = hashedPassword;
      await writeToGitHub(db);
      return;
    } catch {}
  }
  const accounts = getLocalAccounts();
  accounts[username] = hashedPassword;
  saveLocalAccounts(accounts);
}

export async function deleteAccount(username) {
  if (hasToken()) {
    try {
      const db = await readRaw();
      delete db.accounts[username];
      delete db.favorites[username];
      await writeToGitHub(db);
      return;
    } catch {}
  }
  const accounts = getLocalAccounts();
  delete accounts[username];
  saveLocalAccounts(accounts);
  localStorage.removeItem(LS_FAVS_PREFIX + username);
}

export async function updatePassword(username, hashedPassword) {
  if (hasToken()) {
    try {
      const db = await readRaw();
      db.accounts[username] = hashedPassword;
      await writeToGitHub(db);
      return;
    } catch {}
  }
  const accounts = getLocalAccounts();
  accounts[username] = hashedPassword;
  saveLocalAccounts(accounts);
}

// --- Favorites ---

function getLocalFavs(username) {
  return JSON.parse(localStorage.getItem(LS_FAVS_PREFIX + username) || '[]');
}

function saveLocalFavs(username, favs) {
  localStorage.setItem(LS_FAVS_PREFIX + username, JSON.stringify(favs));
}

export async function getFavorites(username) {
  try {
    const db = await readRaw();
    return db.favorites[username] || [];
  } catch {
    return getLocalFavs(username);
  }
}

export async function setFavorites(username, favs) {
  saveLocalFavs(username, favs);
  if (hasToken()) {
    try {
      const db = await readRaw();
      db.favorites[username] = favs;
      await writeToGitHub(db);
    } catch {}
  }
}

// --- Custom Vendors ---

export function getLocalCustomVendors() {
  return JSON.parse(localStorage.getItem(LS_VENDORS) || '{"wechat":[],"whatsapp":[],"freight":[],"paid":[]}');
}

function saveLocalCustomVendors(vendors) {
  localStorage.setItem(LS_VENDORS, JSON.stringify(vendors));
}

export async function getCustomVendors() {
  try {
    const db = await readRaw();
    return db.customVendors || { wechat: [], whatsapp: [], freight: [], paid: [] };
  } catch {
    return getLocalCustomVendors();
  }
}

export async function setCustomVendors(vendors) {
  saveLocalCustomVendors(vendors);
  if (hasToken()) {
    try {
      const db = await readRaw();
      db.customVendors = vendors;
      await writeToGitHub(db);
    } catch {}
  }
}
