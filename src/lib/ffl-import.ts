// CSV import for ATF FFL list.
// Expected columns:
// LIC_REGN, LIC_DIST, LIC_CNTY, LIC_TYPE, LIC_XPRDTE, LIC_SEQN,
// LICENSE_NAME, BUSINESS_NAME, PREMISE_STREET, PREMISE_CITY,
// PREMISE_STATE, PREMISE_ZIP_CODE, MAIL_STREET, MAIL_CITY, MAIL_STATE,
// MAIL_ZIP_CODE, VOICE_PHONE

import Papa from "papaparse";
import {
  decodeExpiration,
  licenseTypeName,
  statusFor,
  type FflLicense,
} from "./ffl-data";

function clean(v: unknown): string {
  if (v == null) return "";
  return String(v).replace(/\s+/g, " ").trim();
}

function formatZip(v: unknown): string {
  const s = clean(v);
  if (!s) return "";
  // ZIPs sometimes come as 9-digit (e.g. 006760000) — show 5 + optional 4.
  const digits = s.replace(/[^\d]/g, "");
  if (digits.length === 9) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  if (digits.length > 5) return digits.slice(0, 5);
  return digits.padStart(5, "0");
}

function formatPhone(v: unknown): string {
  const s = clean(v).replace(/[^\d]/g, "");
  if (s.length === 10) return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6)}`;
  return clean(v);
}

function rowToFfl(row: Record<string, unknown>): FflLicense | null {
  const region = clean(row.LIC_REGN);
  const district = clean(row.LIC_DIST);
  const county = clean(row.LIC_CNTY);
  const type = clean(row.LIC_TYPE);
  const exp = clean(row.LIC_XPRDTE);
  const seq = clean(row.LIC_SEQN);
  if (!region || !district || !type || !seq) return null;

  const id = `${region}-${district.padStart(2, "0")}-${county.padStart(3, "0")}-${type.padStart(2, "0")}-${exp.toUpperCase()}-${seq.padStart(5, "0")}`;
  const expirationDate = decodeExpiration(exp);
  const businessName = clean(row.BUSINESS_NAME) || clean(row.LICENSE_NAME);

  return {
    id,
    licenseName: clean(row.LICENSE_NAME),
    businessName,
    premiseStreet: clean(row.PREMISE_STREET),
    premiseCity: clean(row.PREMISE_CITY),
    premiseState: clean(row.PREMISE_STATE).toUpperCase(),
    premiseZip: formatZip(row.PREMISE_ZIP_CODE),
    county: clean(row.LIC_CNTY), // numeric FIPS-like code in raw; we don't have a name lookup
    phone: formatPhone(row.VOICE_PHONE) || undefined,
    licenseType: type.padStart(2, "0"),
    licenseTypeName: licenseTypeName(type.padStart(2, "0")),
    expirationDate,
    status: statusFor(expirationDate),
  };
}

export type ParseResult = {
  rows: FflLicense[];
  skipped: number;
};

export function parseFflCsv(
  text: string,
  onProgress?: (rowsParsed: number) => void,
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const rows: FflLicense[] = [];
    let skipped = 0;
    let parsedCount = 0;
    let lastReport = 0;

    Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.replace(/^\uFEFF/, "").trim(),
      worker: false,
      step: (result) => {
        parsedCount += 1;
        const ffl = rowToFfl(result.data);
        if (ffl) rows.push(ffl);
        else skipped += 1;
        if (parsedCount - lastReport >= 2000) {
          lastReport = parsedCount;
          onProgress?.(parsedCount);
        }
      },
      complete: () => {
        onProgress?.(parsedCount);
        resolve({ rows, skipped });
      },
      error: (err: unknown) => reject(err),
    });
  });
}
