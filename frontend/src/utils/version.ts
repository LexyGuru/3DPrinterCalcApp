// Verzióellenőrző utility
// Ellenőrzi a GitHub Releases-t, hogy van-e új verzió

export interface VersionInfo {
  current: string;
  latest: string | null;
  isUpdateAvailable: boolean;
  releaseUrl: string | null;
  isBeta: boolean;
}

const CURRENT_VERSION = "0.4.98"; // Frissítsd ezt, amikor új verziót adsz ki
const GITHUB_REPO = "LexyGuru/3DPrinterCalcApp"; // Frissítsd a saját repository nevedre
const RATE_LIMIT_BACKOFF_MS = 15 * 60 * 1000; // 15 perc

let rateLimitResetAt: number | null = null;
let lastRateLimitLogAt: number | null = null;

function isRateLimitActive() {
  return typeof rateLimitResetAt === "number" && Date.now() < rateLimitResetAt;
}

function setRateLimitReset(response: Response) {
  const resetHeader = response.headers.get("X-RateLimit-Reset");
  const resetEpoch = resetHeader ? Number(resetHeader) : NaN;
  if (!Number.isNaN(resetEpoch) && resetEpoch > 0) {
    rateLimitResetAt = resetEpoch * 1000;
  } else {
    rateLimitResetAt = Date.now() + RATE_LIMIT_BACKOFF_MS;
  }
}

export async function checkForUpdates(beta: boolean = false): Promise<VersionInfo> {
  try {
    if (isRateLimitActive()) {
      if (!lastRateLimitLogAt || Date.now() - lastRateLimitLogAt > 60_000) {
        console.warn("⏳ GitHub rate limit aktív, a frissítés ellenőrzés később újra próbálkozik.", {
          betaMode: beta,
          retryAt: rateLimitResetAt,
        });
        lastRateLimitLogAt = Date.now();
      }
      return {
        current: CURRENT_VERSION,
        latest: null,
        isUpdateAvailable: false,
        releaseUrl: null,
        isBeta: beta,
      };
    }

    console.log("🔍 Frissítés ellenőrzése...", { 
      currentVersion: CURRENT_VERSION, 
      betaMode: beta 
    });
    
    // GitHub Releases API
    const url = beta 
      ? `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10`
      : `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
    
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    
    if (!response.ok) {
      let details: any = null;
      try {
        details = await response.json();
      } catch {
        // ignore parse failure
      }

      const logPayload = {
        status: response.status,
        statusText: response.statusText,
        message: details?.message,
        documentationUrl: details?.documentation_url,
        rateLimitRemaining: response.headers.get("X-RateLimit-Remaining"),
        betaMode: beta,
      };

      if (response.status === 403) {
        setRateLimitReset(response);
        lastRateLimitLogAt = Date.now();
        console.warn("⚠️ GitHub API korlát miatt nem sikerült a frissítés ellenőrzése.", logPayload);
      } else {
        console.error("❌ Frissítés ellenőrzés hiba:", logPayload);
      }

      return {
        current: CURRENT_VERSION,
        latest: null,
        isUpdateAvailable: false,
        releaseUrl: null,
        isBeta: beta,
      };
    }

    if (beta) {
      // Beta esetén a legújabb pre-release verziót keresjük
      const releases: any[] = await response.json();
      // Elsőként a pre-release verziókat keressük, ha nincs akkor az első release-t
      const latestRelease = releases.find(r => r.prerelease === true) || releases[0];
      
      if (!latestRelease) {
        return {
          current: CURRENT_VERSION,
          latest: null,
          isUpdateAvailable: false,
          releaseUrl: null,
          isBeta: true,
        };
      }

      const latestVersion = latestRelease.tag_name.replace(/^v/, "");
      // Beta verzió esetén: ha pre-release és újabb mint a jelenlegi, akkor mutassuk
      // Ez lehetővé teszi, hogy main build-ről beta-ra frissítsen, ha van újabb beta verzió
      const isNewer = compareVersions(latestVersion, CURRENT_VERSION) > 0;

      console.log("📊 Beta frissítés ellenőrzés eredménye", { 
        currentVersion: CURRENT_VERSION, 
        latestVersion, 
        isNewer, 
        releaseUrl: latestRelease.html_url 
      });

      return {
        current: CURRENT_VERSION,
        latest: latestVersion,
        isUpdateAvailable: isNewer,
        releaseUrl: latestRelease.html_url,
        isBeta: true,
      };
    } else {
      // Stable release
      const release = await response.json();
      const latestVersion = release.tag_name.replace(/^v/, "");
      const isNewer = compareVersions(latestVersion, CURRENT_VERSION) > 0;

      console.log("📊 Stable frissítés ellenőrzés eredménye", { 
        currentVersion: CURRENT_VERSION, 
        latestVersion, 
        isNewer, 
        releaseUrl: release.html_url 
      });

      return {
        current: CURRENT_VERSION,
        latest: latestVersion,
        isUpdateAvailable: isNewer,
        releaseUrl: release.html_url,
        isBeta: false,
      };
    }
  } catch (error) {
    console.error("❌ Frissítés ellenőrzés hiba:", error, { betaMode: beta });
    return {
      current: CURRENT_VERSION,
      latest: null,
      isUpdateAvailable: false,
      releaseUrl: null,
      isBeta: beta,
    };
  }
}

// Verzió összehasonlítás (1.2.3 formátum)
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

export { CURRENT_VERSION };

