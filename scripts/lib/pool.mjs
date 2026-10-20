// Runs `fn` over `items` with at most `limit` in flight at once.
export async function mapLimit(items, limit, fn) {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      await fn(items[i], i);
    }
  });
  await Promise.all(workers);
}

// fetch JSON with retries: honours 429 Retry-After, retries 5xx/network errors.
export async function fetchJsonRetry(url, label, attempts = 5) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      if (res.status === 429) {
        const wait = Number(res.headers.get("retry-after") ?? 2) * 1000;
        await new Promise((r) => setTimeout(r, wait + 250));
        lastErr = new Error(`${label} rate limited (429)`);
        continue;
      }
      lastErr = new Error(`${label} failed (${res.status})`);
      if (res.status < 500) break; // 4xx (e.g. 404) won't fix itself
    } catch (err) {
      lastErr = err;
    }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  throw lastErr;
}
