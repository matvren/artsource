// localStorage-backed storage with optional GitHub sync
const LS_ACCOUNTS = 'artsource-accounts';

export function getLocalAccounts() {
  return JSON.parse(localStorage.getItem(LS_ACCOUNTS) || '{}');
}

function saveLocalAccounts(accounts) {
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
}

export function getLocalFavs(username) {
  return JSON.parse(localStorage.getItem('artsource-favs-' + username) || '[]');
}

function saveLocalFavs(username, favs) {
  localStorage.setItem('artsource-favs-' + username, JSON.stringify(favs));
}

export function getLocalCustomVendors() {
  return JSON.parse(localStorage.getItem('artsource-custom-vendors') || '{"wechat":[],"whatsapp":[],"freight":[],"paid":[]}');
}

function saveLocalCustomVendors(vendors) {
  localStorage.setItem('artsource-custom-vendors', JSON.stringify(vendors));
}

// Accounts — localStorage only
export function getAccounts() {
  return getLocalAccounts();
}

export function addAccount(username, hashedPassword) {
  const accounts = getLocalAccounts();
  accounts[username] = hashedPassword;
  saveLocalAccounts(accounts);
}

export function deleteAccount(username) {
  const accounts = getLocalAccounts();
  delete accounts[username];
  saveLocalAccounts(accounts);
  localStorage.removeItem('artsource-favs-' + username);
}

export function updatePassword(username, hashedPassword) {
  const accounts = getLocalAccounts();
  accounts[username] = hashedPassword;
  saveLocalAccounts(accounts);
}

// Favorites — localStorage only
export function getFavorites(username) {
  return getLocalFavs(username);
}

export function setFavorites(username, favs) {
  saveLocalFavs(username, favs);
}

// Custom vendors — localStorage only
export function getCustomVendors() {
  return getLocalCustomVendors();
}

export function setCustomVendors(vendors) {
  saveLocalCustomVendors(vendors);
}
