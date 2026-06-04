// Sample FFL dataset.
// Real ATF data is published monthly at:
// https://www.atf.gov/firearms/listing-federal-firearms-licensees
// To use real data, replace this array with parsed entries from the
// monthly state files (or wire up an ingestion script).

export type FflLicense = {
  id: string; // full license number
  licenseName: string; // legal name
  businessName: string; // doing-business-as / trade name
  premiseStreet: string;
  premiseCity: string;
  premiseState: string;
  premiseZip: string;
  county: string;
  phone?: string;
  licenseType: string; // e.g. "01"
  licenseTypeName: string; // e.g. "Dealer in Firearms Other Than Destructive Devices"
  expirationDate: string; // ISO YYYY-MM-DD
  status: "active" | "expired";
};

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

// A representative sample. Realistic format, fictional businesses.
const RAW: Omit<FflLicense, "status" | "licenseTypeName">[] = [
  { id: "1-54-059-01-4K-07721", licenseName: "Heritage Arms & Trading LLC", businessName: "Heritage Arms & Trading", premiseStreet: "882 Central Ave, Bldg 4", premiseCity: "Cincinnati", premiseState: "OH", premiseZip: "45202", county: "Hamilton", phone: "513-555-0142", licenseType: "01", expirationDate: "2027-05-15" },
  { id: "5-84-005-07-4C-09110", licenseName: "Apex Precision Outfitters Inc", businessName: "Apex Precision Outfitters", premiseStreet: "1290 Industrial Blvd, Suite 400", premiseCity: "Centennial", premiseState: "CO", premiseZip: "80111", county: "Arapahoe", phone: "303-555-0188", licenseType: "07", expirationDate: "2026-03-01" },
  { id: "9-87-011-01-4K-03310", licenseName: "Sentinel Defense Group LLC", businessName: "Sentinel Defense Group", premiseStreet: "1200 Industrial Way, Suite B", premiseCity: "Austin", premiseState: "TX", premiseZip: "78744", county: "Travis", phone: "512-555-0177", licenseType: "01", expirationDate: "2026-08-01" },
  { id: "1-56-031-01-2A-09122", licenseName: "Precision Arms Group LLC", businessName: "Precision Arms Group", premiseStreet: "455 Commerce Dr", premiseCity: "Richmond", premiseState: "VA", premiseZip: "23219", county: "Richmond City", phone: "804-555-0123", licenseType: "01", expirationDate: "2025-11-30" },
  { id: "5-83-031-01-7H-04420", licenseName: "Summit Sporting Goods Inc", businessName: "Summit Sporting Goods", premiseStreet: "1450 Wynkoop St", premiseCity: "Denver", premiseState: "CO", premiseZip: "80202", county: "Denver", phone: "303-555-0211", licenseType: "01", expirationDate: "2026-07-22" },
  { id: "5-84-005-01-3D-09231", licenseName: "Frontier Tactical Supply LLC", businessName: "Frontier Tactical Supply", premiseStreet: "8800 E Arapahoe Rd", premiseCity: "Greenwood Village", premiseState: "CO", premiseZip: "80112", county: "Arapahoe", phone: "303-555-0299", licenseType: "01", expirationDate: "2027-02-14" },
  { id: "1-54-035-07-8B-06612", licenseName: "Buckeye Custom Firearms LLC", businessName: "Buckeye Custom Firearms", premiseStreet: "2200 Stelzer Rd", premiseCity: "Columbus", premiseState: "OH", premiseZip: "43219", county: "Franklin", phone: "614-555-0144", licenseType: "07", expirationDate: "2026-09-30" },
  { id: "1-74-201-01-5G-04488", licenseName: "Lone Star Defense LLC", businessName: "Lone Star Defense", premiseStreet: "5500 Westheimer Rd", premiseCity: "Houston", premiseState: "TX", premiseZip: "77056", county: "Harris", phone: "713-555-0166", licenseType: "01", expirationDate: "2027-04-10" },
  { id: "1-74-113-07-4F-02201", licenseName: "Blackwood Custom Ltd", businessName: "Blackwood Custom", premiseStreet: "442 North Loop E", premiseCity: "Houston", premiseState: "TX", premiseZip: "77022", county: "Harris", licenseType: "07", expirationDate: "2023-03-15" },
  { id: "1-74-085-01-3J-05519", licenseName: "Trinity Firearms LLC", businessName: "Trinity Firearms", premiseStreet: "8030 Park Ln", premiseCity: "Dallas", premiseState: "TX", premiseZip: "75231", county: "Dallas", phone: "214-555-0181", licenseType: "01", expirationDate: "2026-12-01" },
  { id: "9-87-453-03-6A-00121", licenseName: "Vintage Collector Co", businessName: "Vintage Collector Co", premiseStreet: "210 Main St", premiseCity: "San Antonio", premiseState: "TX", premiseZip: "78205", county: "Bexar", licenseType: "03", expirationDate: "2026-06-30" },
  { id: "6-94-037-01-7C-09812", licenseName: "Golden Gate Arms LLC", businessName: "Golden Gate Arms", premiseStreet: "1500 Mission St", premiseCity: "San Francisco", premiseState: "CA", premiseZip: "94103", county: "San Francisco", phone: "415-555-0133", licenseType: "01", expirationDate: "2026-10-05" },
  { id: "9-95-037-07-4H-08823", licenseName: "Pacific Manufacturing Inc", businessName: "Pacific Mfg", premiseStreet: "2100 Harbor Blvd", premiseCity: "Costa Mesa", premiseState: "CA", premiseZip: "92626", county: "Orange", phone: "714-555-0199", licenseType: "07", expirationDate: "2025-09-12" },
  { id: "8-86-013-01-5E-06677", licenseName: "Desert Sun Outfitters LLC", businessName: "Desert Sun Outfitters", premiseStreet: "4200 E Speedway Blvd", premiseCity: "Tucson", premiseState: "AZ", premiseZip: "85712", county: "Pima", phone: "520-555-0155", licenseType: "01", expirationDate: "2027-01-20" },
  { id: "8-86-013-01-7B-04412", licenseName: "Saguaro Defense LLC", businessName: "Saguaro Defense", premiseStreet: "1700 N Stone Ave", premiseCity: "Tucson", premiseState: "AZ", premiseZip: "85705", county: "Pima", licenseType: "01", expirationDate: "2026-05-18" },
  { id: "1-22-027-01-6D-03319", licenseName: "Granite State Firearms LLC", businessName: "Granite State Firearms", premiseStreet: "55 Main St", premiseCity: "Concord", premiseState: "NH", premiseZip: "03301", county: "Merrimack", licenseType: "01", expirationDate: "2026-04-08" },
  { id: "1-04-009-01-2F-08812", licenseName: "Bay State Sporting LLC", businessName: "Bay State Sporting", premiseStreet: "880 Commonwealth Ave", premiseCity: "Boston", premiseState: "MA", premiseZip: "02215", county: "Suffolk", phone: "617-555-0177", licenseType: "01", expirationDate: "2026-11-15" },
  { id: "1-13-067-01-4A-07712", licenseName: "Peach State Arms LLC", businessName: "Peach State Arms", premiseStreet: "3200 Cobb Pkwy", premiseCity: "Atlanta", premiseState: "GA", premiseZip: "30339", county: "Cobb", phone: "770-555-0122", licenseType: "01", expirationDate: "2027-03-22" },
  { id: "1-13-121-07-3C-04488", licenseName: "Southern Forge LLC", businessName: "Southern Forge", premiseStreet: "1500 Northside Dr", premiseCity: "Atlanta", premiseState: "GA", premiseZip: "30318", county: "Fulton", licenseType: "07", expirationDate: "2026-08-30" },
  { id: "1-12-099-01-9A-02201", licenseName: "Sunshine State Outfitters", businessName: "Sunshine State Outfitters", premiseStreet: "7800 SW 8th St", premiseCity: "Miami", premiseState: "FL", premiseZip: "33144", county: "Miami-Dade", phone: "305-555-0144", licenseType: "01", expirationDate: "2026-07-01" },
  { id: "1-12-095-01-3B-07719", licenseName: "Gulf Coast Firearms LLC", businessName: "Gulf Coast Firearms", premiseStreet: "2200 N Dale Mabry Hwy", premiseCity: "Tampa", premiseState: "FL", premiseZip: "33607", county: "Hillsborough", licenseType: "01", expirationDate: "2027-05-09" },
  { id: "1-12-103-01-4D-08823", licenseName: "Orlando Sporting Supply LLC", businessName: "Orlando Sporting Supply", premiseStreet: "5500 S Orange Blossom Tr", premiseCity: "Orlando", premiseState: "FL", premiseZip: "32839", county: "Orange", licenseType: "01", expirationDate: "2025-08-15" },
  { id: "1-36-061-01-5K-04412", licenseName: "Empire State Arms LLC", businessName: "Empire State Arms", premiseStreet: "150 W 34th St", premiseCity: "New York", premiseState: "NY", premiseZip: "10001", county: "New York", licenseType: "01", expirationDate: "2026-09-18" },
  { id: "1-36-029-07-6E-03317", licenseName: "Hudson Manufacturing Inc", businessName: "Hudson Mfg", premiseStreet: "2000 Niagara Falls Blvd", premiseCity: "Buffalo", premiseState: "NY", premiseZip: "14207", county: "Erie", licenseType: "07", expirationDate: "2026-06-25" },
  { id: "1-42-101-01-7F-09923", licenseName: "Keystone Tactical LLC", businessName: "Keystone Tactical", premiseStreet: "1000 Liberty Ave", premiseCity: "Pittsburgh", premiseState: "PA", premiseZip: "15222", county: "Allegheny", phone: "412-555-0166", licenseType: "01", expirationDate: "2027-02-28" },
  { id: "1-42-091-01-8G-05519", licenseName: "Philadelphia Sporting LLC", businessName: "Philadelphia Sporting", premiseStreet: "1234 Market St", premiseCity: "Philadelphia", premiseState: "PA", premiseZip: "19107", county: "Philadelphia", licenseType: "01", expirationDate: "2026-12-15" },
  { id: "5-83-005-01-2H-06612", licenseName: "Boulder Mountain Outfitters", businessName: "Boulder Mountain Outfitters", premiseStreet: "1900 28th St", premiseCity: "Boulder", premiseState: "CO", premiseZip: "80301", county: "Boulder", licenseType: "01", expirationDate: "2027-06-12" },
  { id: "1-53-033-01-3J-07728", licenseName: "Evergreen Arms LLC", businessName: "Evergreen Arms", premiseStreet: "4400 California Ave SW", premiseCity: "Seattle", premiseState: "WA", premiseZip: "98116", county: "King", phone: "206-555-0177", licenseType: "01", expirationDate: "2026-10-30" },
  { id: "1-53-061-07-4K-08819", licenseName: "Cascade Custom LLC", businessName: "Cascade Custom", premiseStreet: "1200 Lakeway Dr", premiseCity: "Bellingham", premiseState: "WA", premiseZip: "98229", county: "Whatcom", licenseType: "07", expirationDate: "2025-04-22" },
  { id: "1-41-051-01-5L-09931", licenseName: "Rose City Firearms LLC", businessName: "Rose City Firearms", premiseStreet: "2200 SE Hawthorne Blvd", premiseCity: "Portland", premiseState: "OR", premiseZip: "97214", county: "Multnomah", licenseType: "01", expirationDate: "2026-11-08" },
];

const today = new Date().toISOString().slice(0, 10);

export const FFL_DATA: FflLicense[] = RAW.map((r) => ({
  ...r,
  licenseTypeName: licenseTypeName(r.licenseType),
  status: r.expirationDate < today ? "expired" : "active",
}));

export function findFflById(id: string): FflLicense | undefined {
  const norm = id.replace(/\s/g, "").toUpperCase();
  return FFL_DATA.find((f) => f.id.toUpperCase() === norm);
}

export type SearchMode = "name" | "license" | "nearby";

export function searchFfls(query: string, mode: SearchMode): FflLicense[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  if (mode === "license") {
    const norm = q.replace(/[\s-]/g, "");
    return FFL_DATA.filter((f) =>
      f.id.toLowerCase().replace(/[\s-]/g, "").includes(norm),
    );
  }

  if (mode === "nearby") {
    // Match by ZIP, city, or state.
    return FFL_DATA.filter(
      (f) =>
        f.premiseZip.toLowerCase().includes(q) ||
        f.premiseCity.toLowerCase().includes(q) ||
        f.premiseState.toLowerCase() === q ||
        f.county.toLowerCase().includes(q),
    );
  }

  // name
  return FFL_DATA.filter(
    (f) =>
      f.businessName.toLowerCase().includes(q) ||
      f.licenseName.toLowerCase().includes(q),
  );
}
