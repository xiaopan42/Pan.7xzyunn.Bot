import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
const dataFile = path.join(dataDir, 'orders.json');

async function loadOrders() {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function saveOrders(orders) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(orders, null, 2), 'utf8');
}

export async function createOrder(order) {
  const orders = await loadOrders();
  orders.push(order);
  await saveOrders(orders);
  return order;
}

export async function findPendingOrderByUser(userId, orderNo) {
  const orders = await loadOrders();
  const pending = orders.filter(o => o.userId === userId && o.status === 'pending');
  if (orderNo) return pending.find(o => o.orderNo === orderNo) || null;
  if (pending.length === 0) return null;
  pending.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return pending[0];
}

export async function updateOrderStatus(orderNo, status, meta = {}) {
  const orders = await loadOrders();
  const index = orders.findIndex(o => o.orderNo === orderNo);
  if (index === -1) return null;
  const updated = {
    ...orders[index],
    status,
    ...meta,
    updatedAt: new Date().toISOString(),
  };
  orders[index] = updated;
  await saveOrders(orders);
  return updated;
}
