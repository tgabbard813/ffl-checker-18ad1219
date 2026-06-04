// FFL data model + search. Real data is loaded from the user-imported ATF
// CSV into IndexedDB (see ffl-db.ts). If no import has been done yet, we
// fall back to a small sample dataset so the app is usable out of the box.

import {
  searchBundled,
  getBundledById,
  hasBundledData,
} from "./ffl-bundled";

export type FflLicense = {
  id: string; // full license number, e.g. "1-54-059-01-4K-07721"
  licenseName: string;
  businessName: string;
  premiseStreet: string;
  premiseCity: string;
  premiseState: string;
  premiseZip: string;
  county: string;
  phone?: string;
  licenseType: string;
  licenseTypeName: string;
  expirationDate: string; // ISO YYYY-MM-DD
  status: "active" | "expired";
};

export type SearchMode = "name" | "license" | "nearby";

const LICENSE_TYPES: Record<string, string> = {
  "01": "Dealer in Firearms",
  "02": "Pawnbroker in Firearms",
  "03": "Collector of Curios & Relics",
  "06": "Manufacturer of Ammunition",
  "07": "Manufacturer of Firearms",
  "08": "Importer of Firearms",
  "09": "Dealer in Destructive Devices",
  "10": "Manufacturer of Destructive Devices",
  "11": "Importer of Destructive Devices",
};

export function licenseTypeName(code: string) {
  return LICENSE_TYPES[code] ?? `Type ${code}`;
}

// ATF expiration code: <year-digit><month-letter>
// year-digit: last digit of year (resolved to nearest year ≥ currentYear-5)
// month-letter: A=Jan ... H=Aug, J=Sep, K=Oct, L=Nov, M=Dec  (skips I)
const MONTH_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 9, K: 10, L: 11, M: 12,
};

export function decodeExpiration(code: string): string {
  const c = (code || "").toUpperCase().trim();
  if (c.length !== 2) return "";
  const digit = parseInt(c[0], 10);
  const month = MONTH_MAP[c[1]];
  if (Number.isNaN(digit) || !month) return "";
  const now = new Date();
  const decade = Math.floor(now.getFullYear() / 10) * 10;
  let year = decade + digit;
  if (year < now.getFullYear() - 5) year += 10;
  // Expire at end of the month: last day.
  const last = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}

export function statusFor(iso: string): "active" | "expired" {
  if (!iso) return "expired";
  return iso < new Date().toISOString().slice(0, 10) ? "expired" : "active";
}

// ---- Sample fallback (small, used when no import yet) ----

const SAMPLE_RAW: Omit<FflLicense, "status" | "licenseTypeName">[] = [
  { id: "1-54-059-01-4K-07721", licenseName: "Heritage Arms & Trading LLC", businessName: "Heritage Arms & Trading", premiseStreet: "882 Central Ave, Bldg 4", premiseCity: "Cincinnati", premiseState: "OH", premiseZip: "45202", county: "Hamilton", phone: "513-555-0142", licenseType: "01", expirationDate: "2027-05-31" },
  { id: "9-87-011-01-4K-03310", licenseName: "Sentinel Defense Group LLC", businessName: "Sentinel Defense Group", premiseStreet: "1200 Industrial Way, Suite B", premiseCity: "Austin", premiseState: "TX", premiseZip: "78744", county: "Travis", phone: "512-555-0177", licenseType: "01", expirationDate: "2026-08-31" },
  { id: "1-74-113-07-4F-02201", licenseName: "Blackwood Custom Ltd", businessName: "Blackwood Custom", premiseStreet: "442 North Loop E", premiseCity: "Houston", premiseState: "TX", premiseZip: "77022", county: "Harris", licenseType: "07", expirationDate: "2023-06-30" },
  { id: "5-83-031-01-7H-04420", licenseName: "Summit Sporting Goods Inc", businessName: "Summit Sporting Goods", premiseStreet: "1450 Wynkoop St", premiseCity: "Denver", premiseState: "CO", premiseZip: "80202", county: "Denver", phone: "303-555-0211", licenseType: "01", expirationDate: "2027-08-31" },
];

export const SAMPLE_DATA: FflLicense[] = SAMPLE_RAW.map((r) => ({
  ...r,
  licenseTypeName: licenseTypeName(r.licenseType),
  status: statusFor(r.expirationDate),
}));

function filterSample(query: string, mode: SearchMode): FflLicense[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (mode === "license") {
    const norm = q.replace(/[\s-]/g, "");
    return SAMPLE_DATA.filter((f) =>
      f.id.toLowerCase().replace(/[\s-]/g, "").includes(norm),
    );
  }
  if (mode === "nearby") {
    return SAMPLE_DATA.filter(
      (f) =>
        f.premiseZip.toLowerCase().includes(q) ||
        f.premiseCity.toLowerCase().includes(q) ||
        f.premiseState.toLowerCase() === q ||
        f.county.toLowerCase().includes(q),
    );
  }
  return SAMPLE_DATA.filter(
    (f) =>
      f.businessName.toLowerCase().includes(q) ||
      f.licenseName.toLowerCase().includes(q),
  );
}

// ---- Public API (async) ----

export async function searchFfls(
  query: string,
  mode: SearchMode,
): Promise<FflLicense[]> {
  const q = query.trim();
  if (!q) return [];
  if (await hasImportedData()) {
    return searchAll(q, mode);
  }
  return filterSample(q, mode);
}

export async function findFflById(id: string): Promise<FflLicense | undefined> {
  const norm = id.replace(/\s/g, "").toUpperCase();
  if (await hasImportedData()) {
    return getById(norm);
  }
  return SAMPLE_DATA.find((f) => f.id.toUpperCase() === norm);
}
