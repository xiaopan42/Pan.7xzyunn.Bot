const GOOGLE_INPUT_ENDPOINT = 'https://inputtools.google.com/request';

const zhuyinSyllablePattern = /[a-z]+[1-4]/gi;

function isLikelyZhuyinRomanization(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;

  // 只接受英文與數字，排除其他符號避免誤判
  if (!/^[a-zA-Z0-9\s]+$/.test(trimmed)) return false;

  const matches = trimmed.match(zhuyinSyllablePattern);
  if (!matches || matches.length === 0) return false;

  // 每個音節必須以 1-4 的聲調結尾，且整句都能被音節覆蓋
  const joinedMatchesLength = matches.reduce((sum, syllable) => sum + syllable.length, 0);
  const cleanedLength = trimmed.replace(/\s+/g, '').length;

  return joinedMatchesLength === cleanedLength;
}

async function requestZhuyinConversion(text) {
  const url = new URL(GOOGLE_INPUT_ENDPOINT);
  url.searchParams.set('text', text);
  url.searchParams.set('itc', 'zh-hant-t-i0-und');
  url.searchParams.set('num', '1');

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const body = await response.json();
  if (!Array.isArray(body) || body[0] !== 'SUCCESS') return null;

  const suggestions = body?.[1]?.[0]?.[1];
  if (!Array.isArray(suggestions) || suggestions.length === 0) return null;

  return suggestions[0];
}

export async function maybeTranslateZhuyinInput(text) {
  if (!isLikelyZhuyinRomanization(text)) {
    return { text, translated: false };
  }

  try {
    const suggestion = await requestZhuyinConversion(text);
    if (suggestion) {
      return { text: suggestion, translated: true };
    }
  } catch (err) {
    console.warn('[ZhuyinTranslator] 自動轉換失敗：', err.message || err);
  }

  return { text, translated: false };
}

export const __testUtils = {
  isLikelyZhuyinRomanization,
};