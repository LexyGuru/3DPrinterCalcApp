// Verzióellenőrző utility
// Ellenőrzi a GitHub Releases-t, hogy van-e új verzió

export interface VersionInfo {
  current: string;
  latest: string | null;
  isUpdateAvailable: boolean;
  releaseUrl: string | null;
  isBeta: boolean;
}

const CURRENT_VERSION = "0.1.56"; // Frissítsd ezt, amikor új verziót adsz ki
const GITHUB_REPO = "LexyGuru/3DPrinterCalcApp"; // Frissítsd a saját repository nevedre

export async function checkForUpdates(beta: boolean = false): Promise<VersionInfo> {
  try {
    // GitHub Releases API
    const url = beta 
      ? `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10`
      : `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Failed to fetch releases:", response.statusText);
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

      return {
        current: CURRENT_VERSION,
        latest: latestVersion,
        isUpdateAvailable: isNewer,
        releaseUrl: release.html_url,
        isBeta: false,
      };
    }
  } catch (error) {
    console.error("Error checking for updates:", error);
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

