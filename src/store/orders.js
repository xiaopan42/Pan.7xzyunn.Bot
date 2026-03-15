import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
const dataFile = path.join(dataDir, 'orders.json');
const excelFile = path.join(dataDir, 'orders.xlsx');
const worksheetName = 'Orders';

const ORDER_COLUMNS = [
  { header: 'createdAt', key: 'createdAt', width: 26 },
  { header: 'updatedAt', key: 'updatedAt', width: 26 },
  { header: 'orderNo', key: 'orderNo', width: 18 },
  { header: 'status', key: 'status', width: 14 },
  { header: 'userId', key: 'userId', width: 22 },
  { header: 'username', key: 'username', width: 20 },
  { header: 'productName', key: 'productName', width: 24 },
  { header: 'amount', key: 'amount', width: 12 },
  { header: 'bankCode', key: 'bankCode', width: 12 },
  { header: 'bankAccount', key: 'bankAccount', width: 24 },
  { header: 'createdBy', key: 'createdBy', width: 22 },
  { header: 'completedBy', key: 'completedBy', width: 22 },
  { header: 'cancelledBy', key: 'cancelledBy', width: 22 },
  { header: 'completedAt', key: 'completedAt', width: 26 },
  { header: 'cancelledAt', key: 'cancelledAt', width: 26 },
  { header: 'cancelReason', key: 'cancelReason', width: 28 },
];

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

async function writeOrdersExcel(orders) {
  await fs.mkdir(dataDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(worksheetName);
  sheet.columns = ORDER_COLUMNS;

  for (const order of orders) {
    sheet.addRow({
      createdAt: order.createdAt ?? '',
      updatedAt: order.updatedAt ?? '',
      orderNo: order.orderNo ?? '',
      status: order.status ?? '',
      userId: order.userId ?? '',
      username: order.username ?? '',
      productName: order.productName ?? '',
      amount: order.amount ?? '',
      bankCode: order.bankCode ?? '',
      bankAccount: order.bankAccount ?? '',
      createdBy: order.createdBy ?? '',
      completedBy: order.completedBy ?? '',
      cancelledBy: order.cancelledBy ?? '',
      completedAt: order.completedAt ?? '',
      cancelledAt: order.cancelledAt ?? '',
      cancelReason: order.cancelReason ?? '',
    });
  }

  await workbook.xlsx.writeFile(excelFile);
}

async function saveOrders(orders) {
  await writeOrdersExcel(orders);
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
