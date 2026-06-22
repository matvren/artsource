const OWNER = 'matvren';
const REPO = 'artsource';
const FILE_PATH = 'data/db.json';
const BRANCH = 'main';

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

export async function readDB() {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE_PATH}`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error('Failed to read database');
  return await res.json();
}

export async function writeDB(data) {
  const token = getToken();
  if (!token) throw new Error('GitHub token not configured');
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
    body: JSON.stringify({
      message: 'Update database',
      content,
      sha,
      branch: BRANCH,
    }),
  });
  if (!res.ok) throw new Error('Failed to write database');
}

export async function getAccounts() {
  const db = await readDB();
  return db.accounts || {};
}

export async function getFavorites(username) {
  const db = await readDB();
  return db.favorites[username] || [];
}

export async function setFavorites(username, favs) {
  const db = await readDB();
  db.favorites[username] = favs;
  await writeDB(db);
}

export async function getCustomVendors() {
  const db = await readDB();
  return db.customVendors || { wechat: [], whatsapp: [], freight: [], paid: [] };
}

export async function setCustomVendors(vendors) {
  const db = await readDB();
  db.customVendors = vendors;
  await writeDB(db);
}

export async function addAccount(username, hashedPassword) {
  const db = await readDB();
  db.accounts[username] = hashedPassword;
  await writeDB(db);
}

export async function deleteAccount(username) {
  const db = await readDB();
  delete db.accounts[username];
  delete db.favorites[username];
  await writeDB(db);
}

export async function updatePassword(username, hashedPassword) {
  const db = await readDB();
  db.accounts[username] = hashedPassword;
  await writeDB(db);
}
