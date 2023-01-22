import { conf } from "@/setup/config";
import { ofetch } from "ofetch";

type P<T> = Parameters<typeof ofetch<T>>;
type R<T> = ReturnType<typeof ofetch<T>>;

const baseFetch = ofetch.create({
  retry: 0,
});

export function makeUrl(url: string, data: Record<string, string>) {
  let parsedUrl: string = url;
  Object.entries(data).forEach(([k, v]) => {
    parsedUrl = parsedUrl.replace(`{${k}}`, encodeURIComponent(v));
  });
  return parsedUrl;
}

export function mwFetch<T>(url: string, ops: P<T>[1] = {}): R<T> {
  return baseFetch<T>(url, ops);
}

export function proxiedFetch<T>(url: string, ops: P<T>[1] = {}): R<T> {
  let combinedUrl = ops?.baseURL ?? "";
  if (
    combinedUrl.length > 0 &&
    combinedUrl.endsWith("/") &&
    url.startsWith("/")
  )
    combinedUrl += url.slice(1);
  else if (
    combinedUrl.length > 0 &&
    !combinedUrl.endsWith("/") &&
    !url.startsWith("/")
  )
    combinedUrl += `/${url}`;
  else combinedUrl += url;

  const parsedUrl = new URL(combinedUrl);
  Object.entries(ops?.params ?? {}).forEach(([k, v]) => {
    parsedUrl.searchParams.set(k, v);
  });
  return baseFetch<T>(conf().BASE_PROXY_URL, {
    ...ops,
    baseURL: undefined,
    params: {
      destination: parsedUrl.toString(),
    },
  });
}
