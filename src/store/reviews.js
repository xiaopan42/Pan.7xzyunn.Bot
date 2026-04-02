import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
const dataFile = path.join(dataDir, 'reviews.json');

function normalizeData(raw) {
  if (!raw || typeof raw !== 'object') {
    return { reviews: [] };
  }

  if (!Array.isArray(raw.reviews)) {
    raw.reviews = [];
  }

  return raw;
}

async function loadData() {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    return normalizeData(JSON.parse(raw));
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { reviews: [] };
    }
    throw err;
  }
}

async function saveData(data) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

export async function createReview({
  rating,
  content,
  reviewerId,
  reviewerName,
  targets = [],
}) {
  const data = await loadData();

  const normalizedTargets = Array.isArray(targets)
    ? targets
        .filter(t => t && t.userId)
        .map(t => ({ userId: t.userId, username: t.username || '' }))
    : [];

  const review = {
    id: randomUUID(),
    rating,
    content: content?.trim() || '',
    reviewerId,
    reviewerName,
    targets: normalizedTargets,
    // Backward-compatible fields for older readers.
    targetUserId: normalizedTargets[0]?.userId ?? null,
    targetUsername: normalizedTargets[0]?.username ?? null,
    createdAt: new Date().toISOString(),
  };

  data.reviews.push(review);
  await saveData(data);
  return review;
}
