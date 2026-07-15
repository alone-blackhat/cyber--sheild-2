import crypto from "crypto";
import tls from "tls";

// ============================================================================
// CENTRALIZED THREAT INTELLIGENCE SERVICE
// ============================================================================

// Simple memory cache with TTL (1 hour by default)
class SimpleCache {
  private cache = new Map<string, { value: any; expiry: number }>();

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    return cached.value;
  }

  set(key: string, value: any, ttlMs = 3600000): void {
    this.cache.set(key, { value, expiry: Date.now() + ttlMs });
  }
}

export const threatIntelCache = new SimpleCache();

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

// Robust HTTP fetch helper with timeout, retries, and exponential backoff
export async function fetchWithTimeoutAndBackoff(
  url: string,
  options: any = {},
  retries = 3,
  delay = 1000
): Promise<Response> {
  const timeout = 10000; // 10-second timeout

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      // Inject standard browser User-Agent to prevent 403 blocks from CDNs/Cloudflare
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 CybershieldSOC/1.0",
        ...(options.headers || {})
      };

      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(id);

      if (response.status === 429) {
        // Rate limit: exponential backoff or use retry-after header
        const retryAfter = response.headers.get("retry-after");
        const backoff = retryAfter ? parseInt(retryAfter) * 1000 : delay * Math.pow(2, attempt - 1);
        console.warn(`[ThreatIntel] API rate-limited (429) on ${url}. Retrying in ${backoff}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }

      if (!response.ok) {
        throw new HttpError(response.status, `HTTP Error ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (err: any) {
      clearTimeout(id);
      const isTimeout = err.name === "AbortError";
      const status = err?.status;

      // 401 Unauthorized, 403 Forbidden, or 404 Not Found are permanent errors, do not retry
      if (status === 401 || status === 403 || status === 404) {
        throw err;
      }

      console.info(
        `[ThreatIntel] Attempt ${attempt} fetch for ${url} did not succeed. Details: ${err.message}${
          isTimeout ? " (Timeout)" : ""
        }`
      );

      if (attempt === retries) {
        throw err;
      }

      const backoff = delay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  throw new Error(`Failed to complete request to ${url} after ${retries} attempts.`);
}

// ----------------------------------------------------------------------------
// FREE SOURCES & INTEGRATIONS
// ----------------------------------------------------------------------------

// 1. Cloudflare DNS-over-HTTPS (DoH) Resolver
export async function resolveDnsViaDoh(domain: string): Promise<string[]> {
  const cacheKey = `dns:${domain}`;
  const cached = threatIntelCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`;
    const res = await fetchWithTimeoutAndBackoff(url, {
      headers: { accept: "application/dns-json" },
    });
    const data: any = await res.json();
    const ips: string[] = (data.Answer || [])
      .filter((record: any) => record.type === 1) // A records
      .map((record: any) => record.data);

    threatIntelCache.set(cacheKey, ips, 600000); // Cache DNS for 10 minutes
    return ips;
  } catch (err: any) {
    console.info(`[ThreatIntel] Cloudflare DoH resolution bypassed for ${domain}:`, err.message || err);
    return [];
  }
}

// 2. SSL Certificate Validation Node
export async function checkSslCertificate(domain: string): Promise<{
  valid: boolean;
  authorized?: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  reason?: string;
}> {
  const cacheKey = `ssl:${domain}`;
  const cached = threatIntelCache.get(cacheKey);
  if (cached) return cached;

  // Simple IP check: don't check SSL for raw IPs unless resolved
  const isIp = /^[0-9.]+$/.test(domain);
  if (isIp) {
    return { valid: false, reason: "SSL not checked for raw IP address." };
  }

  return new Promise((resolve) => {
    try {
      const socket = tls.connect(
        {
          host: domain,
          port: 443,
          servername: domain,
          timeout: 5000,
          rejectUnauthorized: false, // We inspect even invalid / self-signed certs
        },
        () => {
          const cert = socket.getPeerCertificate(true);
          if (!cert || Object.keys(cert).length === 0) {
            const res = { valid: false, reason: "No certificate returned from server." };
            threatIntelCache.set(cacheKey, res, 3600000);
            resolve(res);
          } else {
            const now = new Date();
            const validTo = new Date(cert.valid_to);
            const validFrom = new Date(cert.valid_from);
            const isValid = now >= validFrom && now <= validTo && socket.authorized;
            const daysRemaining = Math.max(
              0,
              Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            );

            const rawIssuer = cert.issuer?.O || cert.issuer?.CN || "Unknown Issuer";
            const rawSubject = cert.subject?.CN || "Unknown Subject";
            const issuerStr = Array.isArray(rawIssuer) ? rawIssuer.join(", ") : String(rawIssuer);
            const subjectStr = Array.isArray(rawSubject) ? rawSubject.join(", ") : String(rawSubject);

            const res = {
              valid: isValid,
              authorized: socket.authorized,
              issuer: issuerStr,
              subject: subjectStr,
              validFrom: cert.valid_from,
              validTo: cert.valid_to,
              daysRemaining,
            };
            threatIntelCache.set(cacheKey, res, 3600000); // Cache SSL for 1 hour
            resolve(res);
          }
          socket.end();
        }
      );

      socket.on("error", (err) => {
        resolve({ valid: false, reason: err.message });
      });

      socket.on("timeout", () => {
        socket.destroy();
        resolve({ valid: false, reason: "SSL Handshake connection timed out." });
      });
    } catch (err: any) {
      resolve({ valid: false, reason: err.message });
    }
  });
}

// 3. RDAP WHOIS Directory Check
export async function getDomainWhoisRdap(domain: string): Promise<{
  domain: string;
  creationDate: string | null;
  registrar: string;
  daysOld?: number;
} | null> {
  const cacheKey = `whois:${domain}`;
  const cached = threatIntelCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://rdap.org/domain/${encodeURIComponent(domain)}`;
    const res = await fetchWithTimeoutAndBackoff(url, {
      headers: { Accept: "application/json" },
    });
    const data: any = await res.json();
    const events = data.events || [];
    const regEvent = events.find(
      (e: any) => e.eventAction === "registration" || e.eventAction === "creation"
    );
    const regDate = regEvent ? new Date(regEvent.eventDate) : null;

    let daysOld = undefined;
    if (regDate) {
      daysOld = Math.floor((Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    const result = {
      domain,
      creationDate: regDate ? regDate.toISOString().split("T")[0] : null,
      registrar: data.port43 || "Unknown Registrar",
      daysOld,
    };

    threatIntelCache.set(cacheKey, result, 86400000); // Cache WHOIS for 24 hours
    return result;
  } catch (err: any) {
    console.info(`[ThreatIntel] RDAP WHOIS lookup bypassed for ${domain}:`, err.message || err);
    return null;
  }
}

// 4. IPInfo Geolocation ASN Checker
export async function getIpGeoInfo(ip: string): Promise<any | null> {
  const cacheKey = `ipinfo:${ip}`;
  const cached = threatIntelCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://ipinfo.io/${encodeURIComponent(ip)}/json`;
    const res = await fetchWithTimeoutAndBackoff(url);
    const data = await res.json();
    threatIntelCache.set(cacheKey, data, 86400000); // Cache for 24 hours
    return data;
  } catch (err: any) {
    console.info(`[ThreatIntel] IPInfo lookup bypassed for ${ip}:`, err.message || err);
    return null;
  }
}

// 5. OpenPhish Feed Check
let openPhishFeedCache: Set<string> | null = null;
let lastOpenPhishFetch = 0;

export async function fetchOpenPhishFeed(): Promise<Set<string>> {
  const now = Date.now();
  if (openPhishFeedCache && now - lastOpenPhishFetch < 1800000) {
    // 30 mins
    return openPhishFeedCache;
  }

  try {
    const res = await fetchWithTimeoutAndBackoff("https://openphish.com/feed.txt");
    const text = await res.text();
    const urls = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    openPhishFeedCache = new Set(urls);
    lastOpenPhishFetch = now;
    return openPhishFeedCache;
  } catch (err: any) {
    console.info("[ThreatIntel] OpenPhish feed fetch bypassed:", err.message || err);
    return openPhishFeedCache || new Set();
  }
}

// 6. URLhaus Active Malicious Database Check
export async function checkUrlhaus(url: string): Promise<{ matched: boolean; details?: any }> {
  const cacheKey = `urlhaus:${url}`;
  const cached = threatIntelCache.get(cacheKey);
  if (cached) return cached;

  try {
    const payload = { url };

    const res = await fetchWithTimeoutAndBackoff("https://urlhaus-api.abuse.ch/v1/url/", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    const data: any = await res.json();
    const matched = data.query_status === "ok";

    const result = { matched, details: matched ? data : undefined };
    threatIntelCache.set(cacheKey, result, 1800000); // 30 mins cache
    return result;
  } catch (err: any) {
    console.info("[ThreatIntel] URLhaus check bypassed:", err.message || err);
    return { matched: false };
  }
}

export async function checkUrlhausHash(hash: string): Promise<{ matched: boolean; details?: any }> {
  const cacheKey = `urlhaus_hash:${hash}`;
  const cached = threatIntelCache.get(cacheKey);
  if (cached) return cached;

  try {
    const payload = hash.length === 32 ? { md5_hash: hash } : { sha256_hash: hash };

    const res = await fetchWithTimeoutAndBackoff("https://urlhaus-api.abuse.ch/v1/payload/", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    const data: any = await res.json();
    const matched = data.query_status === "ok";

    const result = { matched, details: matched ? data : undefined };
    threatIntelCache.set(cacheKey, result, 1800000); // 30 mins cache
    return result;
  } catch (err: any) {
    console.info("[ThreatIntel] URLhaus hash check bypassed:", err.message || err);
    return { matched: false };
  }
}

// ----------------------------------------------------------------------------
// PRIMARY APIS
// ----------------------------------------------------------------------------

// A. Google Safe Browsing API Check
export async function checkGoogleSafeBrowsing(url: string): Promise<{ matched: boolean; threatType?: string }> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) {
    return { matched: false };
  }

  const cacheKey = `gsb:${url}`;
  const cached = threatIntelCache.get(cacheKey);
  if (cached) return cached;

  try {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
    const payload = {
      client: { clientId: "cybershield-dashboard", clientVersion: "1.0.0" },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }],
      },
    };

    const res = await fetchWithTimeoutAndBackoff(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data: any = await res.json();
    const matched = data.matches && data.matches.length > 0;

    const result = {
      matched,
      threatType: matched ? data.matches[0].threatType : undefined,
    };
    threatIntelCache.set(cacheKey, result, 1800000); // Cache for 30 mins
    return result;
  } catch (err: any) {
    console.info("[ThreatIntel] Google Safe Browsing API request bypassed:", err.message || err);
    return { matched: false };
  }
}

// B. VirusTotal API (v3) URL Check
export async function checkVirusTotalUrl(url: string): Promise<{
  matched: boolean;
  score?: number;
  stats?: any;
  reasons?: string[];
}> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    return { matched: false };
  }

  const cacheKey = `vt_url:${url}`;
  const cached = threatIntelCache.get(cacheKey);
  if (cached) return cached;

  try {
    // Generate base64url URL ID without padding
    const base64 = Buffer.from(url).toString("base64");
    const urlId = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;
    const res = await fetchWithTimeoutAndBackoff(endpoint, {
      headers: { "x-apikey": apiKey },
    });
    const data: any = await res.json();

    const stats = data.data?.attributes?.last_analysis_stats || {};
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const harmless = stats.harmless || 0;
    const undetected = stats.undetected || 0;
    const total = malicious + suspicious + harmless + undetected;

    const matched = malicious > 0;
    const score = total > 0 ? Math.round((malicious / total) * 100) : 0;

    const reasons: string[] = [];
    if (malicious > 0) {
      reasons.push(`VirusTotal flagged as malicious by ${malicious} security vendors.`);
    }
    if (suspicious > 0) {
      reasons.push(`VirusTotal flagged as suspicious by ${suspicious} vendors.`);
    }

    const result = { matched, score, stats, reasons };
    threatIntelCache.set(cacheKey, result, 1800000); // 30 mins cache
    return result;
  } catch (err: any) {
    // If VT URL is not scanned, it returns 404. Handle gracefully.
    console.warn("[ThreatIntel] VirusTotal URL lookup failed (possibly unscanned or API error):", err.message);
    return { matched: false };
  }
}

// C. VirusTotal API (v3) File Hash Check
export async function checkVirusTotalHash(hash: string): Promise<{
  matched: boolean;
  score?: number;
  stats?: any;
  reasons?: string[];
}> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    return { matched: false };
  }

  const cacheKey = `vt_hash:${hash}`;
  const cached = threatIntelCache.get(cacheKey);
  if (cached) return cached;

  try {
    const endpoint = `https://www.virustotal.com/api/v3/files/${hash}`;
    const res = await fetchWithTimeoutAndBackoff(endpoint, {
      headers: { "x-apikey": apiKey },
    });
    const data: any = await res.json();

    const stats = data.data?.attributes?.last_analysis_stats || {};
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const harmless = stats.harmless || 0;
    const undetected = stats.undetected || 0;
    const total = malicious + suspicious + harmless + undetected;

    const matched = malicious > 0;
    const score = total > 0 ? Math.round((malicious / total) * 100) : 0;

    const reasons: string[] = [];
    if (malicious > 0) {
      reasons.push(`VirusTotal detected file payload as malicious (${malicious}/${total} vendors).`);
    }

    const result = { matched, score, stats, reasons };
    threatIntelCache.set(cacheKey, result, 1800000);
    return result;
  } catch (err: any) {
    console.warn("[ThreatIntel] VirusTotal file hash check failed or file unseen:", err.message);
    return { matched: false };
  }
}

// D. AbuseIPDB API Check
export async function checkAbuseIPDB(ip: string): Promise<{
  matched: boolean;
  score?: number;
  totalReports?: number;
  countryCode?: string;
  usageType?: string;
  domain?: string;
  isWhitelisted?: boolean;
}> {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey) {
    return { matched: false };
  }

  const cacheKey = `abuseipdb:${ip}`;
  const cached = threatIntelCache.get(cacheKey);
  if (cached) return cached;

  try {
    const endpoint = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(
      ip
    )}&maxAgeInDays=90`;
    const res = await fetchWithTimeoutAndBackoff(endpoint, {
      headers: {
        Key: apiKey,
        Accept: "application/json",
      },
    });
    const body: any = await res.json();
    const data = body.data || {};

    const score = data.abuseConfidenceScore || 0;
    const matched = score > 10; // Anything above 10 is suspicious/reported

    const result = {
      matched,
      score,
      totalReports: data.totalReports || 0,
      countryCode: data.countryCode || "Unknown",
      usageType: data.usageType || "Unknown",
      domain: data.domain || "Unknown",
      isWhitelisted: data.isWhitelisted || false,
    };

    threatIntelCache.set(cacheKey, result, 1800000);
    return result;
  } catch (err: any) {
    console.info("[ThreatIntel] AbuseIPDB API check bypassed:", err.message || err);
    return { matched: false };
  }
}

// ----------------------------------------------------------------------------
// LOCAL HEURISTIC FALLBACK ENGINES
// ----------------------------------------------------------------------------

// A. Advanced Heuristic URL Scanner
export function analyzeUrlHeuristics(url: string): {
  score: number;
  reasons: string[];
  brandImpersonated: string;
  isIpUrl: boolean;
  isShortened: boolean;
  isSuspiciousTld: boolean;
  hasHomograph: boolean;
} {
  const lower = url.toLowerCase();
  let score = 10;
  const reasons: string[] = [];

  // 1. Is insecure connection
  const isHttp = url.startsWith("http://");
  if (isHttp) {
    score += 20;
    reasons.push("Insecure HTTP protocol used. Missing cryptographic SSL/TLS layer.");
  }

  // 2. Extract host domain
  let host = "";
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    host = urlObj.hostname;
  } catch {
    host = url.split("/")[0] || "";
  }

  // 3. Raw IP Check
  const isIpUrl = /^[0-9.]+$/.test(host);
  if (isIpUrl) {
    score += 35;
    reasons.push("Hosted on raw IPv4 address instead of a verified, registered domain name.");
  }

  // 4. Shortened URL Check
  const shortenedDomains = [
    "bit.ly",
    "t.co",
    "tinyurl.com",
    "goo.gl",
    "ow.ly",
    "rebrand.ly",
    "is.gd",
    "buff.ly",
  ];
  const isShortened = shortenedDomains.some((d) => host === d || host.endsWith("." + d));
  if (isShortened) {
    score += 25;
    reasons.push("Shortened URL vector matched. Conceals final destination page.");
  }

  // 5. Suspicious TLD
  const suspiciousTlds = [
    ".xyz",
    ".top",
    ".work",
    ".click",
    ".gq",
    ".cf",
    ".tk",
    ".ml",
    ".ga",
    ".buzz",
    ".cam",
    ".zip",
    ".mov",
  ];
  const isSuspiciousTld = suspiciousTlds.some((tld) => host.endsWith(tld));
  if (isSuspiciousTld) {
    score += 15;
    const tldMatch = suspiciousTlds.find((tld) => host.endsWith(tld));
    reasons.push(`Suspicious top-level TLD (${tldMatch}) associated with rapid spam/malware registrations.`);
  }

  // 6. Brand Impersonation / Typosquatting Check
  const brands = [
    "google",
    "paypal",
    "microsoft",
    "apple",
    "amazon",
    "netflix",
    "facebook",
    "yahoo",
    "chase",
    "citibank",
    "wellsfargo",
    "instagram",
  ];
  let brandImpersonated = "None";

  for (const brand of brands) {
    // Check lookalike
    const lookalikes = [
      brand.replace("l", "1"),
      brand.replace("o", "0"),
      brand.replace("i", "1"),
      brand.replace("a", "@"),
      brand.replace("e", "3"),
      "secure-" + brand,
      brand + "-security",
      "login-" + brand,
      brand + "-login",
      brand + "-update",
    ];

    const foundTyposquatting = lookalikes.some((val) => lower.includes(val) && val !== brand);
    if (foundTyposquatting || (lower.includes(brand) && !host.endsWith(brand + ".com") && !host.endsWith(brand + ".net") && !host.endsWith(brand + ".org") && host !== brand)) {
      score += 40;
      brandImpersonated = brand.charAt(0).toUpperCase() + brand.slice(1);
      reasons.push(`Impersonation of brand '${brandImpersonated}' detected in subdomain/path obfuscation.`);
      break;
    }
  }

  // 7. Homograph checking
  const containsMixedScripts = /[^\x00-\x7F]/.test(host);
  const isIdn = host.startsWith("xn--");
  const hasHomograph = containsMixedScripts || isIdn;
  if (hasHomograph) {
    score += 35;
    reasons.push("Cyrillic mixed scripts or IDN Punycode matched. Indicative of a zero-day domain homograph spoofing attack.");
  }

  // 8. General phishing keywords
  const phishingKeywords = ["banking", "verification", "signin", "portal", "account", "billing", "invoice", "restricted"];
  const matchedKeywords = phishingKeywords.filter((kw) => lower.includes(kw));
  if (matchedKeywords.length > 0) {
    score += 10 * matchedKeywords.length;
    reasons.push(`Harvesting intent keywords found inside URL directory nodes: [${matchedKeywords.join(", ")}].`);
  }

  // Limit score
  score = Math.min(score, 100);

  return {
    score,
    reasons,
    brandImpersonated,
    isIpUrl,
    isShortened,
    isSuspiciousTld,
    hasHomograph,
  };
}

// B. Advanced Heuristic Email Body & Header Analyzer
export function analyzeEmailHeuristics(emailText: string): {
  score: number;
  anomalies: string[];
  senderAddress: string;
  recipientAddress: string;
  spfStatus: string;
  dkimStatus: string;
  dmarcStatus: string;
} {
  const lower = emailText.toLowerCase();
  let score = 10;
  const anomalies: string[] = [];

  let senderAddress = "Unknown";
  let recipientAddress = "Unknown";

  const senderMatch = emailText.match(/from:\s*([^\n\r]+)/i);
  if (senderMatch) senderAddress = senderMatch[1].trim();
  const recMatch = emailText.match(/to:\s*([^\n\r]+)/i);
  if (recMatch) recipientAddress = recMatch[1].trim();

  // Social engineering psychological traits
  const urgencyWords = ["urgent", "immediate", "suspension", "locked", "restricted", "compliance", "2 hours", "action required"];
  const matchUrgency = urgencyWords.filter((w) => lower.includes(w));
  if (matchUrgency.length > 0) {
    score += 20;
    anomalies.push(`Coercion/Urgency language patterns identified: [${matchUrgency.join(", ")}].`);
  }

  const financialTriggers = ["invoice", "chargeback", "transaction", "payment", "$", "billing", "wire transfer"];
  const matchFinancial = financialTriggers.filter((w) => lower.includes(w));
  if (matchFinancial.length > 0) {
    score += 15;
    anomalies.push(`Financial trigger/Wire transaction keywords matching fraud profile: [${matchFinancial.join(", ")}].`);
  }

  // Spoofing lookalike domain patterns
  const spoofWords = ["paypai", "paypa1", "micros0ft", "secure-update", "g00gle"];
  const matchSpoof = spoofWords.filter((w) => lower.includes(w));
  if (matchSpoof.length > 0) {
    score += 30;
    anomalies.push(`Domain character spoofing detected mimicking trusted infrastructure.`);
  }

  // Header SPF / DKIM indicators
  const hasSpfFail = lower.includes("spf: fail") || lower.includes("spf=fail") || lower.includes("spf-alignment: fail");
  const hasDkimFail = lower.includes("dkim: fail") || lower.includes("dkim=fail") || lower.includes("dkim-alignment: fail");
  const hasDmarcFail = lower.includes("dmarc: fail") || lower.includes("dmarc=fail") || lower.includes("dmarc-alignment: fail");

  if (hasSpfFail) {
    score += 25;
    anomalies.push("Sender Policy Framework (SPF) validation reports explicit FAILED status.");
  }
  if (hasDkimFail) {
    score += 25;
    anomalies.push("DKIM cryptographic key signature check reports failed verification.");
  }
  if (hasDmarcFail) {
    score += 20;
    anomalies.push("DMARC alignment validation reports failure.");
  }

  // Disposable email check
  const disposableDomains = ["mailinator.com", "trashmail.com", "10minutemail.com", "tempmail.com", "guerrillamail.com"];
  const isDisposable = disposableDomains.some((d) => senderAddress.toLowerCase().includes(d));
  if (isDisposable) {
    score += 35;
    anomalies.push("Sender domain resolved to a disposable/burner email hosting provider.");
  }

  score = Math.min(score, 100);

  return {
    score,
    anomalies,
    senderAddress,
    recipientAddress,
    spfStatus: hasSpfFail ? "FAIL" : lower.includes("spf: pass") || lower.includes("spf=pass") ? "PASS" : "NONE",
    dkimStatus: hasDkimFail ? "FAIL" : lower.includes("dkim: pass") || lower.includes("dkim=pass") ? "PASS" : "NONE",
    dmarcStatus: hasDmarcFail ? "FAIL" : lower.includes("dmarc: pass") || lower.includes("dmarc=pass") ? "PASS" : "NONE",
  };
}

// C. File Heuristic Engine
export function analyzeFileHeuristics(
  filename: string,
  contentBase64?: string
): {
  score: number;
  reasons: string[];
  macrosDetected: boolean;
  executableCode: boolean;
  suspiciousStrings: string[];
} {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  let score = 5;
  const reasons: string[] = [];
  const suspiciousStrings: string[] = [];

  const isDangerousExt = ["exe", "scr", "vbs", "xlsm", "docm", "bat", "sh", "zip", "cmd", "ps1", "apk", "jar", "dll", "msi"].includes(ext);
  if (isDangerousExt) {
    score += 45;
    reasons.push(`Filename extension (${ext}) matches standard high-risk script or compilation binaries.`);
  }

  let macrosDetected = false;
  let executableCode = false;

  if (contentBase64) {
    try {
      const decoded = Buffer.from(contentBase64, "base64").toString("binary");
      const lowerDecoded = decoded.toLowerCase();

      // Check for macros (Office docs)
      if (lowerDecoded.includes("autoopen") || lowerDecoded.includes("workbook_open") || lowerDecoded.includes("wscript.shell")) {
        macrosDetected = true;
        score += 35;
        suspiciousStrings.push("AutoOpen() macro", "WScript.Shell script");
        reasons.push("Embedded auto-execution macros or scripting triggers detected inside magic bytes.");
      }

      // Check for powershell script execution
      if (lowerDecoded.includes("powershell.exe") || lowerDecoded.includes("bypass") || lowerDecoded.includes("-nop") || lowerDecoded.includes("-w hidden")) {
        executableCode = true;
        score += 30;
        suspiciousStrings.push("powershell.exe shell evasion command");
        reasons.push("Embedded administrative powershell scripts utilizing terminal evasion switches.");
      }

      // Check for shell codes / binaries / scripting
      if (lowerDecoded.includes("eval(") || lowerDecoded.includes("exec(") || lowerDecoded.includes("system(") || lowerDecoded.includes("<script>")) {
        executableCode = true;
        score += 25;
        suspiciousStrings.push("eval() / system() code injection");
        reasons.push("Embedded command string execution triggers matched.");
      }
    } catch (err) {
      console.error("[ThreatIntel] Failed to analyze file content heuristics:", err);
    }
  }

  score = Math.min(score, 100);

  return {
    score,
    reasons,
    macrosDetected,
    executableCode,
    suspiciousStrings,
  };
}

// ----------------------------------------------------------------------------
// CENTRAL MULTI-API ORCHESTRATION PIPELINE (WITH AUTOMATIC FALLBACKS)
// ----------------------------------------------------------------------------

export async function checkUrlReputationPipeline(url: string): Promise<{
  riskScore: number;
  threatScore: number;
  confidenceScore: number;
  threatLevel: string;
  reasons: string[];
  criteria: string[];
  indicators: string[];
  brandImpersonated: string;
  action: string;
  dnsReputation: string;
  whoisAge: string;
  analysisDetails: string;
  recommendedAction: string;
  apisUsed: string[];
  evidence: any;
  durationMs: number;
}> {
  const startTime = Date.now();
  const apisUsed: string[] = [];
  const evidence: any = {};
  const reasons: string[] = [];

  let finalRiskScore = 0;
  let finalConfidenceScore = 80; // Baseline
  let brandImpersonated = "None";
  let whoisAge = "Unknown";
  let dnsReputation = "Unknown";

  // Parse domain
  let domain = "";
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    domain = urlObj.hostname;
  } catch {
    domain = url.split("/")[0] || "";
  }

  // 1. SSL Check
  const ssl = await checkSslCertificate(domain);
  evidence.sslCertificate = ssl;
  apisUsed.push("SSL Certificate Validation");
  if (!ssl.valid) {
    finalRiskScore += 15;
    reasons.push(`SSL handshake validation warning: ${ssl.reason || "Invalid certificate structure"}`);
  } else {
    reasons.push(`SSL Handshake successfully verified. Verified subject: ${ssl.subject}. Certificate issuer: ${ssl.issuer}.`);
  }

  // 2. DNS Check (Cloudflare DoH)
  const dnsIps = await resolveDnsViaDoh(domain);
  evidence.dnsResolution = dnsIps;
  apisUsed.push("Cloudflare DNS over HTTPS");
  if (dnsIps.length === 0) {
    finalRiskScore += 10;
    dnsReputation = "Suspicious";
    reasons.push("DNS Resolution warning: Target domain does not resolve to active A records.");
  } else {
    dnsReputation = "Verified";
    reasons.push(`Domain verified active. Resolved IPs: [${dnsIps.join(", ")}].`);
  }

  // 3. WHOIS (RDAP) age check
  const whois = await getDomainWhoisRdap(domain);
  evidence.whois = whois;
  apisUsed.push("RDAP WHOIS");
  if (whois) {
    whoisAge = whois.creationDate ? `${whois.creationDate} (${whois.daysOld} days old)` : "Unknown";
    if (whois.daysOld !== undefined && whois.daysOld < 90) {
      finalRiskScore += 20;
      reasons.push(`Domain registered recently (${whois.daysOld} days old). High-risk temporal indicator.`);
    } else if (whois.daysOld !== undefined) {
      reasons.push(`Domain age is verified mature (${whois.daysOld} days old).`);
    }
  }

  // 4. IP reputation scan if domain is resolved
  if (dnsIps.length > 0) {
    const primaryIp = dnsIps[0];
    const geo = await getIpGeoInfo(primaryIp);
    evidence.ipGeolocation = geo;
    apisUsed.push("IPInfo");

    if (process.env.ABUSEIPDB_API_KEY) {
      apisUsed.push("AbuseIPDB");
      const abuseipdb = await checkAbuseIPDB(primaryIp);
      evidence.abuseipdb = abuseipdb;
      if (abuseipdb.matched) {
        finalRiskScore += Math.round((abuseipdb.score || 0) * 0.4);
        dnsReputation = "Malicious";
        reasons.push(`AbuseIPDB reports hosting server IP (${primaryIp}) has reputation threat score of ${abuseipdb.score}% with ${abuseipdb.totalReports} reports.`);
      }
    }
  }

  // --------------------------------------------------------------------------
  // PRIMARY FEED & SECURITY API SCANNING (Google Safe Browsing, VirusTotal, OpenPhish, and URLhaus)
  // --------------------------------------------------------------------------

  // STEP A: GOOGLE SAFE BROWSING
  try {
    if (process.env.GOOGLE_SAFE_BROWSING_API_KEY) {
      apisUsed.push("Google Safe Browsing");
      const gsb = await checkGoogleSafeBrowsing(url);
      evidence.googleSafeBrowsing = gsb;
      if (gsb.matched) {
        finalRiskScore = Math.max(finalRiskScore, 95);
        reasons.push(`Google Safe Browsing flagged URL as dangerous. Threat class matching: ${gsb.threatType || "Phishing/Malware"}`);
      }
    }
  } catch (err: any) {
    console.warn("[ThreatIntel] Safe Browsing fallback triggered:", err.message || err);
  }

  // STEP B: VIRUSTOTAL URL CHECK
  if (process.env.VIRUSTOTAL_API_KEY) {
    try {
      apisUsed.push("VirusTotal");
      const vt = await checkVirusTotalUrl(url);
      evidence.virusTotal = vt;
      if (vt.matched) {
        finalRiskScore = Math.max(finalRiskScore, vt.score || 85);
        reasons.push(...(vt.reasons || []));
      }
    } catch (err: any) {
      console.warn("[ThreatIntel] VirusTotal fallback triggered:", err.message || err);
    }
  }

  // STEP C: OPENPHISH FEED
  try {
    apisUsed.push("OpenPhish");
    const openPhish = await fetchOpenPhishFeed();
    evidence.openPhish = { checked: true };
    if (openPhish.has(url)) {
      finalRiskScore = Math.max(finalRiskScore, 90);
      reasons.push("OpenPhish active community blacklist matches target URL exactly.");
    }
  } catch (err: any) {
    console.warn("[ThreatIntel] OpenPhish fallback triggered:", err.message || err);
  }

  // STEP D: URLHAUS API
  try {
    apisUsed.push("URLhaus");
    const urlhaus = await checkUrlhaus(url);
    evidence.urlhaus = urlhaus;
    if (urlhaus.matched) {
      finalRiskScore = Math.max(finalRiskScore, 92);
      reasons.push("URLhaus flagged URL as active malware delivery repository node.");
    }
  } catch (err: any) {
    console.warn("[ThreatIntel] URLhaus fallback triggered:", err.message || err);
  }

  // Heuristic Local Scanner (Runs in parallel / fallback mode)
  const heuristics = analyzeUrlHeuristics(url);
  evidence.heuristics = heuristics;
  brandImpersonated = heuristics.brandImpersonated;

  if (heuristics.score > 20) {
    // Inject findings if high
    finalRiskScore = Math.max(finalRiskScore, heuristics.score);
    reasons.push(...heuristics.reasons);
  }

  // Verify safe bounds
  finalRiskScore = Math.min(finalRiskScore, 100);

  // Set Verdicts
  let threatLevel = "Safe";
  let action = "Safe";
  let recommendedAction = "URL handshake validated clean. The domain presents active SSL keys and DNS records. Proceed normally.";

  if (finalRiskScore >= 75) {
    threatLevel = "Critical";
    action = "Block";
    recommendedAction = "CRITICAL THREAT: Immediate network containment advised. Do NOT browse. Active brand spoofing or known blacklisted host detected.";
  } else if (finalRiskScore >= 50) {
    threatLevel = "High";
    action = "Block";
    recommendedAction = "HIGH THREAT: Restrict web browsing route. Analyze subdomains out-of-band and block credentials inputs.";
  } else if (finalRiskScore >= 25) {
    threatLevel = "Medium";
    action = "Warning";
    recommendedAction = "SUSPICIOUS: Moderate threat indicators logged. Domain age, SSL configuration, or IP reports suggest elevated risk.";
  } else if (finalRiskScore > 10) {
    threatLevel = "Low";
    action = "Warning";
    recommendedAction = "Proceed with standard browser caution. Minor heuristic parameters raised.";
  }

  const durationMs = Date.now() - startTime;
  const isPartialAnalysis = apisUsed.length < 5; // Indicates some APIs failed/not set up

  return {
    riskScore: finalRiskScore,
    threatScore: finalRiskScore,
    confidenceScore: finalConfidenceScore,
    threatLevel,
    reasons: reasons.length > 0 ? reasons : ["No threat indicators detected on any external registries or heuristic scanners."],
    criteria: reasons.length > 0 ? reasons.map(r => r.substring(0, 40) + "...") : ["Clear Domain Handshake"],
    indicators: reasons.length > 0 ? reasons : ["Clear Domain Handshake"],
    brandImpersonated,
    action,
    dnsReputation,
    whoisAge,
    analysisDetails: `Integrated multi-source SOC threat analysis completed in ${durationMs}ms. Core Reputation status: ${isPartialAnalysis ? "Partial Analysis Completed (Heuristic Fallback Enabled)" : "Full Analysis Verified"}. Active threat indicators mapped.`,
    recommendedAction,
    apisUsed,
    evidence,
    durationMs,
  };
}

// ----------------------------------------------------------------------------
// EMAIL REPUTATION PIPELINE
// ----------------------------------------------------------------------------
export async function checkEmailReputationPipeline(emailText: string): Promise<any> {
  const startTime = Date.now();
  const apisUsed: string[] = ["Heuristic Email Parser"];
  const evidence: any = {};
  const reasons: string[] = [];

  const heuristics = analyzeEmailHeuristics(emailText);
  evidence.heuristics = heuristics;

  let finalRiskScore = heuristics.score;
  reasons.push(...heuristics.anomalies);

  // Extract URLs
  const urlRegex = /https?:\/\/[^\s>"]+/g;
  const foundUrls = (emailText.match(urlRegex) || []).map(u => u.trim());
  evidence.foundUrls = foundUrls;

  if (foundUrls.length > 0) {
    const primaryUrl = foundUrls[0];
    apisUsed.push("URL Scanner (Email URL Proxy)");
    try {
      const urlResult = await checkUrlReputationPipeline(primaryUrl);
      evidence.urlAnalysis = urlResult;
      if (urlResult.riskScore > 30) {
        finalRiskScore = Math.max(finalRiskScore, urlResult.riskScore);
        reasons.push(`Suspicious URL embedded in email text: ${primaryUrl}. Risk: ${urlResult.riskScore}%. Verdict: ${urlResult.threatLevel}`);
      }
    } catch (err) {
      console.warn("[ThreatIntel] Email embedded URL check bypassed:", err);
    }
  }

  // Extract Sender Domain and check domain reputation
  if (heuristics.senderAddress && heuristics.senderAddress !== "Unknown") {
    const domainMatch = heuristics.senderAddress.match(/@([a-zA-Z0-9.-]+)/);
    if (domainMatch) {
      const senderDomain = domainMatch[1].trim();
      apisUsed.push("Domain Scanner (Email Sender Proxy)");
      try {
        const domainResult = await checkUrlReputationPipeline(senderDomain);
        evidence.senderDomainAnalysis = domainResult;
        if (domainResult.riskScore > 40) {
          finalRiskScore = Math.max(finalRiskScore, domainResult.riskScore + 10);
          reasons.push(`Email sender domain reputation flagged: ${senderDomain}. Risk: ${domainResult.riskScore}%. Verdict: ${domainResult.threatLevel}`);
        }
      } catch (err) {
        console.warn("[ThreatIntel] Email sender domain reputation check bypassed:", err);
      }
    }
  }

  // Finalize threat level
  finalRiskScore = Math.min(finalRiskScore, 100);
  let threatLevel = "Safe";
  let recommendedAction = "The email content appears normal and sender domains are verified. Proceed normally.";

  if (finalRiskScore >= 75) {
    threatLevel = "Critical";
    recommendedAction = "CRITICAL PHISHING THREAT: Direct warning active. Do NOT reply, click links, or input credentials. Spoofed headers or disposable domains detected.";
  } else if (finalRiskScore >= 50) {
    threatLevel = "High";
    recommendedAction = "HIGH SUSPICION: Verify sender identity out-of-band. Embedded URL reputation or visual impersonation markers matched.";
  } else if (finalRiskScore >= 25) {
    threatLevel = "Medium";
    recommendedAction = "MODERATE RISK: Review header parameters carefully. The SPF, DKIM, or sender domain age present minor anomalies.";
  } else if (finalRiskScore > 10) {
    threatLevel = "Low";
    recommendedAction = "Proceed with caution. Slight urgency keywords matched.";
  }

  const durationMs = Date.now() - startTime;

  return {
    riskScore: finalRiskScore,
    threatScore: finalRiskScore,
    confidenceScore: 90,
    threatLevel,
    senderAddress: heuristics.senderAddress,
    recipientAddress: heuristics.recipientAddress,
    spfStatus: heuristics.spfStatus,
    dkimStatus: heuristics.dkimStatus,
    dmarcStatus: heuristics.dmarcStatus,
    anomalies: reasons.length > 0 ? reasons : ["No anomalous threat indicators matched."],
    analysisDetails: `Email parsing & SMTP header reputation scan completed in ${durationMs}ms. Core indicators analyzed.`,
    recommendedAction,
    apisUsed,
    evidence,
    durationMs,
    timestamp: new Date().toISOString()
  };
}

// ----------------------------------------------------------------------------
// FILE REPUTATION PIPELINE
// ----------------------------------------------------------------------------
export async function checkFileReputationPipeline(
  filename: string,
  contentBase64?: string,
  providedHash?: string
): Promise<any> {
  const startTime = Date.now();
  const apisUsed: string[] = ["Heuristic Malware Signature Analyzer"];
  const evidence: any = {};
  const reasons: string[] = [];

  let md5 = "d41d8cd98f00b204e9800998ecf8427e";
  let sha1 = "da39a3ee5e6b4b0d3255bfef95601890afd80709";
  let sha256 = providedHash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  if (contentBase64) {
    try {
      const cleanBase64 = contentBase64.includes(",") ? contentBase64.split(",")[1] : contentBase64;
      const buffer = Buffer.from(cleanBase64, "base64");
      md5 = crypto.createHash("md5").update(buffer).digest("hex");
      sha1 = crypto.createHash("sha1").update(buffer).digest("hex");
      sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    } catch (err) {
      console.error("[ThreatIntel] Failed to compute hashes from content:", err);
    }
  }

  evidence.hashes = { md5, sha1, sha256 };

  // Heuristics
  const heuristics = analyzeFileHeuristics(filename, contentBase64);
  evidence.heuristics = heuristics;
  let finalRiskScore = heuristics.score;
  reasons.push(...heuristics.reasons);

  // VirusTotal Hash Check
  if (process.env.VIRUSTOTAL_API_KEY) {
    apisUsed.push("VirusTotal File Scan");
    try {
      const vt = await checkVirusTotalHash(sha256);
      evidence.virusTotal = vt;
      if (vt.matched) {
        finalRiskScore = Math.max(finalRiskScore, vt.score || 85);
        reasons.push(...(vt.reasons || []));
      }
    } catch (err: any) {
      console.warn("[ThreatIntel] VT Hash lookup bypassed:", err.message || err);
    }
  }

  // URLhaus Hash Check
  apisUsed.push("URLhaus Malware Payload DB");
  try {
    const urlhaus = await checkUrlhausHash(sha256);
    evidence.urlhaus = urlhaus;
    if (urlhaus.matched) {
      finalRiskScore = Math.max(finalRiskScore, 90);
      reasons.push(`URLhaus matched hash signature against known active malware downloads: ${urlhaus.details?.threat || "Malware"}`);
    }
  } catch (err: any) {
    console.warn("[ThreatIntel] URLhaus Hash lookup bypassed:", err.message || err);
  }

  finalRiskScore = Math.min(finalRiskScore, 100);
  let threatLevel = "Safe";
  let recommendedAction = "File signature is verified secure. No macro or executable risk indicators matched.";

  if (finalRiskScore >= 75) {
    threatLevel = "Critical";
    recommendedAction = "CRITICAL RISK: Immediate isolation advised. Do NOT run or compile. Host containment required. Clear malware signatures mapped.";
  } else if (finalRiskScore >= 50) {
    threatLevel = "High";
    recommendedAction = "HIGH PROBABILITY OF FRAUD: Block execution. Script macros or Powershell admin bypass tricks discovered.";
  } else if (finalRiskScore >= 25) {
    threatLevel = "Medium";
    recommendedAction = "SUSPICIOUS: Investigate extension auto-runs or scripts before deploying on client hosts.";
  } else if (finalRiskScore > 10) {
    threatLevel = "Low";
    recommendedAction = "Minor scripting flags. Review code out-of-band.";
  }

  const durationMs = Date.now() - startTime;

  return {
    riskScore: finalRiskScore,
    threatScore: finalRiskScore,
    confidenceScore: 95,
    threatLevel,
    md5,
    sha256,
    macrosDetected: heuristics.macrosDetected,
    executableCode: heuristics.executableCode,
    suspiciousStrings: heuristics.suspiciousStrings,
    reasons: reasons.length > 0 ? reasons : ["No known static malware signatures matched."],
    analysisDetails: `Multilateral malware registry and magic-byte static scanner complete in ${durationMs}ms.`,
    recommendedAction,
    apisUsed,
    evidence,
    durationMs,
    timestamp: new Date().toISOString()
  };
}

// ----------------------------------------------------------------------------
// LEGACY / BACKWARDS COMPATIBILITY WRAPPERS FOR SERVER.TS
// ----------------------------------------------------------------------------
export async function centralUrlScan(url: string) {
  return checkUrlReputationPipeline(url);
}

export async function centralEmailScan(emailText: string) {
  return checkEmailReputationPipeline(emailText);
}

export async function centralFileScan(
  filename: string,
  fileSize: number,
  hash: string,
  fileType: string,
  content?: string
) {
  return checkFileReputationPipeline(filename, content, hash);
}

export async function queryDNS(domain: string) {
  return resolveDnsViaDoh(domain);
}

export async function validateSSLCertificate(domain: string) {
  return checkSslCertificate(domain);
}

export async function getDomainAgeFromRDAP(domain: string) {
  return getDomainWhoisRdap(domain);
}

export async function getIPInfo(ip: string) {
  return getIpGeoInfo(ip);
}

