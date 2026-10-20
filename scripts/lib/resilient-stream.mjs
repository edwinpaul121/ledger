// A download stream that survives dropped connections: if the socket closes
// mid-transfer (common on multi-GB files), it reconnects with an HTTP Range
// request from the last byte received and keeps feeding the same stream.
import { Readable, PassThrough } from "node:stream";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export // Opens a dump as a stream that SURVIVES dropped connections: if the socket closes
// mid-download (common on multi-GB files), it reconnects with an HTTP Range request
// from the last byte received and carries on, feeding the same stream.
async function openResilient(url, headers = {}, name = "download", retryDelayMs = 2000) {
  const first = await fetch(url, { headers });
  if (!first.ok || !first.body) throw new Error(`Download of ${name} dump failed (${first.status})`);
  const finalUrl = first.url; // pin to the exact dated file for every resume
  const total = Number(first.headers.get("content-length") ?? 0);
  const out = new PassThrough();
  const state = { bytes: 0 };

  (async () => {
    let res = first;
    let failures = 0;
    while (!out.destroyed) {
      try {
        if (!res) {
          res = await fetch(finalUrl, {
            headers: { ...headers, Range: `bytes=${state.bytes}-` },
          });
          if (res.status !== 206) throw new Error(`server did not honour Range (${res.status})`);
        }
        const reader = Readable.fromWeb(res.body);
        for await (const chunk of reader) {
          if (out.destroyed) {
            reader.destroy();
            return;
          }
          state.bytes += chunk.length;
          failures = 0; // progress made - reset the retry budget
          if (!out.write(chunk)) {
            await new Promise((resolve) => {
              const done = () => {
                out.off("drain", done);
                out.off("close", done);
                resolve();
              };
              out.once("drain", done);
              out.once("close", done);
            });
          }
        }
        out.end();
        return;
      } catch (err) {
        if (out.destroyed) return;
        if (total && state.bytes >= total) {
          out.end(); // everything arrived; the error was just the close
          return;
        }
        failures++;
        const mb = (state.bytes / 1048576).toFixed(0);
        if (failures > 10) {
          out.destroy(new Error(`${name} download failed after repeated retries at ${mb} MB: ${err.cause?.code ?? err.message}`));
          return;
        }
        console.log(
          `[books]   ${name}: connection lost at ${mb} MB (${err.cause?.code ?? err.message}) - resuming (${failures}/10)`
        );
        res = null;
        await sleep(retryDelayMs * failures);
      }
    }
  })();

  return { stream: out, finalUrl, total, state };
}

