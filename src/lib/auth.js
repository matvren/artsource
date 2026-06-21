function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return 'h' + Math.abs(h).toString(36);
}

function genToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let t = '';
  for (let i = 0; i < 32; i++) t += chars.charAt(Math.floor(Math.random() * chars.length));
  return t;
}

export function getAccounts() { return JSON.parse(localStorage.getItem('artsource-accounts') || '{}'); }
export function saveAccounts(a) { localStorage.setItem('artsource-accounts', JSON.stringify(a)); }
export function getSessions() { return JSON.parse(localStorage.getItem('artsource-sessions') || '{}'); }
export function saveSessions(s) { localStorage.setItem('artsource-sessions', JSON.stringify(s)); }
export function getFavs(user) { return JSON.parse(localStorage.getItem('artsource-favs-' + user) || '[]'); }

export function login(username, password) {
  const accounts = getAccounts();
  if (!accounts[username] || accounts[username] !== simpleHash(password)) {
    throw new Error('Invalid username or password');
  }
  const token = genToken();
  const sessions = getSessions();
  sessions[token] = username;
  saveSessions(sessions);
  localStorage.setItem('artsource-token', token);
  return { user: username, favs: getFavs(username) };
}

export function signup(username, password) {
  if (password.length < 8) throw new Error('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) throw new Error('Password needs an uppercase letter');
  const accounts = getAccounts();
  if (accounts[username]) throw new Error('Username already taken');
  accounts[username] = simpleHash(password);
  saveAccounts(accounts);
  const token = genToken();
  const sessions = getSessions();
  sessions[token] = username;
  saveSessions(sessions);
  localStorage.setItem('artsource-token', token);
  localStorage.setItem('artsource-favs-' + username, '[]');
  return { user: username, favs: [] };
}

export function resetPassword(username, oldPass, newPass) {
  const accounts = getAccounts();
  if (accounts[username] !== simpleHash(oldPass)) throw new Error('Current password is incorrect');
  accounts[username] = simpleHash(newPass);
  saveAccounts(accounts);
}