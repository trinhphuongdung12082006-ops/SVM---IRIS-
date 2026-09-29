/**
 * Wikimedia Commons API Service for Iris Flowers
 * Provides authentic, high-resolution botanical flower photos with:
 * - Anti-repetition algorithm using per-species history in localStorage
 * - Local caching of 15-20 images per species to minimize network calls
 * - Filter to avoid diagrams, maps, icons, SVGs, or logos
 * - "Đổi ảnh" (cycle image) capability without re-running SVM
 * - Offline/network failure fallback support
 */

export interface WikimediaImage {
  pageid: number;
  title: string;
  cleanTitle: string;
  thumbUrl: string;
  url: string;
  descriptionUrl: string;
}

export type IrisNormalizedSpecies = 'setosa' | 'versicolor' | 'virginica';

const SPECIES_SEARCH_QUERIES: Record<IrisNormalizedSpecies, string> = {
  setosa: 'Iris setosa flower',
  versicolor: 'Iris versicolor flower',
  virginica: 'Iris virginica flower',
};

// Curated reliable Wikimedia Commons fallback images in case of network issues/rate limits
const CURATED_FALLBACKS: Record<IrisNormalizedSpecies, WikimediaImage[]> = {
  setosa: [
    {
      pageid: 24895732,
      title: 'File:Wild iris flower iris setosa.jpg',
      cleanTitle: 'Wild iris flower (Iris setosa)',
      thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Wild_iris_flower_iris_setosa.jpg/600px-Wild_iris_flower_iris_setosa.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Wild_iris_flower_iris_setosa.jpg',
      descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Wild_iris_flower_iris_setosa.jpg',
    },
    {
      pageid: 148281887,
      title: 'File:Wild Iris at Dyea.jpg',
      cleanTitle: 'Wild Iris setosa at Dyea, Alaska',
      thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Wild_Iris_at_Dyea_%285d3b13f3-1dd8-b71c-07af-b17e57f4158f%29.jpg/600px-Wild_Iris_at_Dyea_%285d3b13f3-1dd8-b71c-07af-b17e57f4158f%29.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Wild_Iris_at_Dyea_%285d3b13f3-1dd8-b71c-07af-b17e57f4158f%29.jpg',
      descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Wild_Iris_at_Dyea_(5d3b13f3-1dd8-b71c-07af-b17e57f4158f).jpg',
    },
    {
      pageid: 7618103,
      title: 'File:Wild purple Iris on the Kodiak Archipelago, Alaska.jpg',
      cleanTitle: 'Wild purple Iris setosa on Kodiak Archipelago',
      thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Wild_purple_Iris_on_the_Kodiak_Archipelago%2C_Alaska_2009_200.jpg/600px-Wild_purple_Iris_on_the_Kodiak_Archipelago%2C_Alaska_2009_200.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Wild_purple_Iris_on_the_Kodiak_Archipelago%2C_Alaska_2009_200.jpg',
      descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Wild_purple_Iris_on_the_Kodiak_Archipelago,_Alaska_2009_200.jpg',
    },
  ],
  versicolor: [
    {
      pageid: 2839218,
      title: 'File:Iris versicolor 3.jpg',
      cleanTitle: 'Iris versicolor (Blue Flag Iris)',
      thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Iris_versicolor_3.jpg/600px-Iris_versicolor_3.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Iris_versicolor_3.jpg',
      descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Iris_versicolor_3.jpg',
    },
    {
      pageid: 8812301,
      title: 'File:Iris versicolor FWS.jpg',
      cleanTitle: 'Iris versicolor (Northern Blue Flag)',
      thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Iris_versicolor_FWS.jpg/600px-Iris_versicolor_FWS.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Iris_versicolor_FWS.jpg',
      descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Iris_versicolor_FWS.jpg',
    },
    {
      pageid: 11987654,
      title: 'File:Verschiedenfarbige Schwertlilie (Iris versicolor).jpg',
      cleanTitle: 'Iris versicolor in full bloom',
      thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Verschiedenfarbige_Schwertlilie_%28Iris_versicolor%29.jpg/600px-Verschiedenfarbige_Schwertlilie_%28Iris_versicolor%29.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Verschiedenfarbige_Schwertlilie_%28Iris_versicolor%29.jpg',
      descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Verschiedenfarbige_Schwertlilie_(Iris_versicolor).jpg',
    },
  ],
  virginica: [
    {
      pageid: 3456789,
      title: 'File:Iris virginica.jpg',
      cleanTitle: 'Iris virginica (Virginia Iris)',
      thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Iris_virginica.jpg/600px-Iris_virginica.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Iris_virginica.jpg',
      descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Iris_virginica.jpg',
    },
    {
      pageid: 2981726,
      title: 'File:Iris virginica (Virginia iris) (Newark, Ohio).jpg',
      cleanTitle: 'Iris virginica blossom close-up',
      thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Iris_virginica_%28Virginia_iris%29_%28Newark%2C_Ohio%2C_USA%29_15.jpg/600px-Iris_virginica_%28Virginia_iris%29_%28Newark%2C_Ohio%2C_USA%29_15.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Iris_virginica_%28Virginia_iris%29_%28Newark%2C_Ohio%2C_USA%29_15.jpg',
      descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Iris_virginica_(Virginia_iris)_(Newark,_Ohio,_USA)_15.jpg',
    },
    {
      pageid: 2981727,
      title: 'File:Iris virginica shrevei (Southern Blue Flag).jpg',
      cleanTitle: 'Iris virginica var. shrevei in natural habitat',
      thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Iris_virginica_shrevei_1.jpg/600px-Iris_virginica_shrevei_1.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Iris_virginica_shrevei_1.jpg',
      descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Iris_virginica_shrevei_1.jpg',
    },
  ],
};

const USED_IMAGES_KEY = 'iris_used_images';

interface UsedImagesStorage {
  setosa: string[];
  versicolor: string[];
  virginica: string[];
}

/**
 * Normalizes input string (e.g. "Iris-setosa", "Iris Setosa", "setosa") to 'setosa' | 'versicolor' | 'virginica'
 */
export function normalizeSpecies(raw: string): IrisNormalizedSpecies {
  if (!raw) return 'setosa';
  const lower = raw.toLowerCase().trim();
  if (lower.includes('setosa')) return 'setosa';
  if (lower.includes('versicolor')) return 'versicolor';
  if (lower.includes('virginica')) return 'virginica';
  return 'setosa';
}

/**
 * Cleans the file name for clean display
 */
function cleanFileName(title: string): string {
  return title
    .replace(/^File:/i, '')
    .replace(/\.[a-zA-Z0-9]+$/, '')
    .replace(/_/g, ' ')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();
}

/**
 * Filter out non-photo files (SVGs, maps, logos, icons, diagrams)
 */
function isBotanicalPhoto(title: string, url: string): boolean {
  const combined = (title + ' ' + url).toLowerCase();
  const badKeywords = [
    '.svg',
    'map',
    'karte',
    'logo',
    'icon',
    'drawing',
    'distribution',
    'diagram',
    'avatar',
    'flag',
    'user:',
    'badge',
    'symbol',
    'specimen sheet',
    'herbarium',
  ];
  for (const bad of badKeywords) {
    if (combined.includes(bad)) return false;
  }
  return true;
}

/**
 * Retrieves recently used image IDs for each species from localStorage
 */
function getUsedImages(): UsedImagesStorage {
  try {
    const raw = localStorage.getItem(USED_IMAGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        setosa: Array.isArray(parsed.setosa) ? parsed.setosa : [],
        versicolor: Array.isArray(parsed.versicolor) ? parsed.versicolor : [],
        virginica: Array.isArray(parsed.virginica) ? parsed.virginica : [],
      };
    }
  } catch {
    // ignore
  }
  return { setosa: [], versicolor: [], virginica: [] };
}

/**
 * Saves used images history to localStorage
 */
function saveUsedImages(data: UsedImagesStorage) {
  try {
    localStorage.setItem(USED_IMAGES_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/**
 * Fetches 15-20 image items from Wikimedia Commons for a specific species with local caching
 */
export async function getSpeciesImagePool(
  species: IrisNormalizedSpecies,
  forceRefresh: boolean = false
): Promise<WikimediaImage[]> {
  const cacheKey = `iris_image_cache_${species}`;

  // 1. Try reading from cache if not forced
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Query Wikimedia Commons API
  const query = encodeURIComponent(SPECIES_SEARCH_QUERIES[species]);
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url%7Cthumburl&iiurlwidth=600&format=json&origin=*`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const resp = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!resp.ok) {
      throw new Error(`Wikimedia HTTP ${resp.status}`);
    }

    const data = await resp.json();
    const pages = data?.query?.pages;

    if (!pages || typeof pages !== 'object') {
      throw new Error('No pages found in Wikimedia response');
    }

    const images: WikimediaImage[] = [];

    for (const key of Object.keys(pages)) {
      const page = pages[key];
      const imageinfo = page.imageinfo?.[0];
      if (!imageinfo) continue;

      const title = page.title || '';
      const thumbUrl = imageinfo.thumburl || imageinfo.url;
      const url = imageinfo.url || thumbUrl;
      const descriptionUrl =
        imageinfo.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`;

      if (thumbUrl && isBotanicalPhoto(title, thumbUrl)) {
        images.push({
          pageid: page.pageid || parseInt(key, 10),
          title,
          cleanTitle: cleanFileName(title),
          thumbUrl,
          url,
          descriptionUrl,
        });
      }
    }

    // If API returned good images, cache and return them
    if (images.length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(images));
      } catch {
        // ignore quota
      }
      return images;
    }
  } catch (err) {
    console.warn(`[Wikimedia API] Could not fetch live images for ${species}:`, err);
  }

  // 3. Fallback to curated high-quality Wikimedia images for this species
  return CURATED_FALLBACKS[species];
}

/**
 * Gets a random, non-repeating image for the species.
 * - Checks recently used list for that species
 * - If all available images have been used, resets that species' used list and selects randomly
 * - Updates localStorage with the newly selected image
 */
export async function getNextSpeciesImage(
  speciesRaw: string,
  forceChange: boolean = false
): Promise<WikimediaImage> {
  const species = normalizeSpecies(speciesRaw);
  const pool = await getSpeciesImagePool(species, false);

  if (!pool || pool.length === 0) {
    return CURATED_FALLBACKS[species][0];
  }

  const usedData = getUsedImages();
  const usedForSpecies = usedData[species] || [];

  // Filter pool for images not recently used
  let available = pool.filter((img) => !usedForSpecies.includes(String(img.pageid)));

  // If all images in pool have been shown, reset used list for this species
  if (available.length === 0) {
    usedData[species] = [];
    available = [...pool];
  }

  // Pick random image from available list
  const randomIndex = Math.floor(Math.random() * available.length);
  const chosen = available[randomIndex];

  // Mark as used
  usedData[species].push(String(chosen.pageid));
  saveUsedImages(usedData);

  return chosen;
}
