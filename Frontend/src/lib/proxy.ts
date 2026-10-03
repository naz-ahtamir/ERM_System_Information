/**
 * Proxy Configuration for Next.js Latest
 * Simple proxy helper for API requests
 */

/**
 * Proxy configuration type
 */
export interface ProxyConfig {
  /** Target backend URL */
  target: string;
  /** Path prefix to match */
  pathPrefix: string;
  /** Optional path rewriting */
  pathRewrite?: (path: string) => string;
  /** Additional headers */
  headers?: Record<string, string>;
}

/**
 * Environment-based API URL
 */
export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.API_URL || 
  "http://localhost:3000";

/**
 * Upload/Static files URL
 */
export const UPLOAD_BASE_URL = 
  process.env.NEXT_PUBLIC_UPLOAD_URL || 
  process.env.UPLOAD_URL || 
  API_BASE_URL;

/**
 * Proxy configurations
 * Gunakan ini untuk fetch requests di client/server components
 */
export const proxyConfig = {
  api: {
    target: API_BASE_URL,
    pathPrefix: "/api",
  },
  uploads: {
    target: UPLOAD_BASE_URL,
    pathPrefix: "/uploads",
    pathRewrite: (path: string) => path.replace(/^\/uploads/, "/public/uploads"),
  },
} as const;

/**
 * Build full URL for proxy requests
 * 
 * @example
 * ```ts
 * const url = buildProxyUrl("/api/users", proxyConfig.api);
 * // Returns: "http://localhost:3000/api/users"
 * ```
 */
export function buildProxyUrl(path: string, config?: { target: string; pathRewrite?: (path: string) => string }): string {
  if (!config) {
    return path;
  }

  const rewrittenPath = config.pathRewrite ? config.pathRewrite(path) : path;
  const target = config.target.endsWith("/") ? config.target.slice(0, -1) : config.target;
  
  return `${target}${rewrittenPath}`;
}

/**
 * Fetch helper with proxy support
 * 
 * @example
 * ```ts
 * const data = await proxyFetch("/api/users");
 * ```
 */
export async function proxyFetch(
  path: string,
  options?: RequestInit & { proxy?: "api" | "uploads" }
): Promise<Response> {
  const proxyType = options?.proxy || "api";
  const config = proxyConfig[proxyType];
  
  // Build URL - if path already starts with http, use it directly
  const url = path.startsWith("http") ? path : buildProxyUrl(path, config);
  
  // Prepare headers
  const headers = new Headers(options?.headers);
  if (config && "headers" in config && config.headers) {
    Object.entries(config.headers).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Get base URL for specific proxy type
 */
export function getProxyBaseUrl(type: "api" | "uploads" = "api"): string {
  return proxyConfig[type].target;
}

export default proxyConfig;
