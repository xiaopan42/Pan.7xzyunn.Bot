import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
const dataFile = path.join(dataDir, 'bank.json');

function buildDefaultData() {
  return {
    accounts: {},
    transactions: [],
  };
}

async function loadBankData() {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return buildDefaultData();
    if (!data.accounts || typeof data.accounts !== 'object') data.accounts = {};
    if (!Array.isArray(data.transactions)) data.transactions = [];
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') return buildDefaultData();
    throw err;
  }
}

async function saveBankData(data) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

function ensureAccount(data, userId, username) {
  const now = new Date().toISOString();
  if (!data.accounts[userId]) {
    data.accounts[userId] = {
      userId,
      username,
      balance: 0,
      createdAt: now,
      updatedAt: now,
    };
  } else if (username && data.accounts[userId].username !== username) {
    data.accounts[userId].username = username;
    data.accounts[userId].updatedAt = now;
  }
  return data.accounts[userId];
}

export async function getBalance(userId) {
  const data = await loadBankData();
  return data.accounts[userId]?.balance ?? 0;
}

<<<<<<< HEAD
export async function getAllAccounts() {
  const data = await loadBankData();
  return Object.values(data.accounts || {});
=======
export async function getAllBalances() {
  const data = await loadBankData();
  return Object.values(data.accounts || {}).map(acc => ({
    userId: acc.userId,
    username: acc.username,
    balance: acc.balance,
  }));
>>>>>>> acb4ca9f7e9878d15f200280498fd2664d344bec
}

export async function adjustBalance({
  userId,
  username,
  delta,
  type,
  note = '',
  actorId,
}) {
  if (!Number.isInteger(delta)) {
    throw new Error('INVALID_DELTA');
  }

  const data = await loadBankData();
  const account = ensureAccount(data, userId, username);
  const balanceBefore = account.balance;
  const balanceAfter = balanceBefore + delta;

  if (balanceAfter < 0) {
    const err = new Error('INSUFFICIENT_BALANCE');
    err.code = 'INSUFFICIENT_BALANCE';
    err.meta = { balanceBefore, delta };
    throw err;
  }

  account.balance = balanceAfter;
  account.updatedAt = new Date().toISOString();

  const transaction = {
    id: randomUUID(),
    type,
    userId,
    username: account.username,
    amount: Math.abs(delta),
    delta,
    balanceBefore,
    balanceAfter,
    note,
    actorId,
    createdAt: new Date().toISOString(),
  };

  data.transactions.push(transaction);
  await saveBankData(data);

  return { account, transaction, balanceBefore, balanceAfter };
}
