import { useEffect, useRef, useState } from "react";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as FileSystem from "expo-file-system";

async function runWithConcurrency<T, R>(
  items: T[],
  worker: (it: T, idx: number) => Promise<R>,
  limit = 3
) {
  const results: R[] = new Array(items.length);
  let i = 0;
  const workers = new Array(Math.min(limit, items.length))
    .fill(0)
    .map(async () => {
      while (true) {
        const idx = i++;
        if (idx >= items.length) break;
        try {
          results[idx] = await worker(items[idx], idx);
        } catch (e) {
          // propagate undefined result for that index
          results[idx] = undefined as unknown as R;
        }
      }
    });
  await Promise.all(workers);
  return results;
}

export default function useVideoThumbnails(
  items: Array<{ type?: string; uri?: string }>,
  opts?: { concurrency?: number }
) {
  const concurrency = opts?.concurrency ?? 3;
  const [thumbnails, setThumbnails] = useState<
    Record<number, string | undefined>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  console.log("useVideoThumbnails called with items:", items);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const cacheDir = FileSystem.cacheDirectory
    ? FileSystem.cacheDirectory + "video-thumbs/"
    : null;

  // ensure cache dir exists (non-blocking)
  useEffect(() => {
    if (!cacheDir) return;
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(cacheDir);
        if (!info.exists) {
          await FileSystem.makeDirectoryAsync(cacheDir, {
            intermediates: true,
          });
        }
      } catch (e) {
        // ignore
        console.warn("Failed to prepare thumbnail cache dir", e);
      }
    })();
  }, [cacheDir]);

  const getCachePathForUri = (uri: string) => {
    // simple djb2 hash to keep filename short
    let hash = 5381;
    for (let i = 0; i < uri.length; i++) {
      // eslint-disable-next-line no-bitwise
      hash = (hash * 33) ^ uri.charCodeAt(i);
    }
    const hex = (hash >>> 0).toString(16);
    return cacheDir ? `${cacheDir}${hex}.jpg` : undefined;
  };

  useEffect(() => {
    let cancelled = false;
    const source = items || [];

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await runWithConcurrency(
          source,
          async (item) => {
            if (!item || item.type !== "video" || !item.uri) return undefined;
            try {
              // check cache first
              const cachePath = getCachePathForUri(item.uri!);
              if (cachePath) {
                try {
                  const info = await FileSystem.getInfoAsync(cachePath);
                  if (info.exists) return info.uri;
                } catch (e) {
                  // ignore cache read errors
                }
              }

              const { uri: tmpUri } = await VideoThumbnails.getThumbnailAsync(
                item.uri,
                { time: 1000 }
              );

              if (cachePath) {
                try {
                  // move generated thumbnail into cache (overwrite if exists)
                  await FileSystem.moveAsync({ from: tmpUri, to: cachePath });
                  return cachePath;
                } catch (e) {
                  try {
                    // fallback: copy then delete
                    await FileSystem.copyAsync({ from: tmpUri, to: cachePath });
                    await FileSystem.deleteAsync(tmpUri, { idempotent: true });
                    return cachePath;
                  } catch (err) {
                    console.warn("Failed to move/copy thumbnail to cache", err);
                    return tmpUri;
                  }
                }
              }

              return tmpUri;
            } catch (e) {
              console.warn("thumbnail generation failed for", item.uri, e);
              return undefined;
            }
          },
          concurrency
        );

        if (cancelled || !mounted.current) return;

        const map: Record<number, string | undefined> = {};
        results.forEach((uri, idx) => {
          if (uri) map[idx] = uri;
        });
        setThumbnails(map);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message ?? e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items, concurrency]);

  const refresh = async () => {
    setThumbnails({});
    setLoading(true);
    setError(null);
    try {
      const results = await runWithConcurrency(
        items || [],
        async (item) => {
          if (!item || item.type !== "video" || !item.uri) return undefined;
          try {
            const tmp = await VideoThumbnails.getThumbnailAsync(item.uri, {
              time: 1000,
            });
            const cachePath = getCachePathForUri(item.uri!);
            if (cachePath) {
              try {
                // overwrite cache
                await FileSystem.deleteAsync(cachePath, { idempotent: true });
                await FileSystem.moveAsync({ from: tmp.uri, to: cachePath });
                return cachePath;
              } catch (e) {
                try {
                  await FileSystem.copyAsync({ from: tmp.uri, to: cachePath });
                  await FileSystem.deleteAsync(tmp.uri, { idempotent: true });
                  return cachePath;
                } catch (err) {
                  console.warn("refresh: failed to write cache", err);
                  return tmp.uri;
                }
              }
            }
            return tmp.uri;
          } catch (e) {
            return undefined;
          }
        },
        concurrency
      );

      const map: Record<number, string | undefined> = {};
      results.forEach((uri, idx) => {
        if (uri) map[idx] = uri;
      });
      if (mounted.current) setThumbnails(map);
    } catch (e: any) {
      if (mounted.current) setError(String(e?.message ?? e));
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  return { thumbnails, loading, error, refresh };
}
