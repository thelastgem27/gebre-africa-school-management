import { Router } from "express";
import { db, countries, regions, zones, woredas } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const FALLBACK_COUNTRIES = [
  { id: "eth", name: "Ethiopia", code: "ETH" },
  { id: "uga", name: "Uganda", code: "UGA" },
  { id: "ken", name: "Kenya", code: "KEN" },
];

const FALLBACK_REGIONS: Record<string, { id: string; name: string; countryId: string }[]> = {
  eth: [
    { id: "eth-tigray", name: "Tigray", countryId: "eth" },
    { id: "eth-afar", name: "Afar", countryId: "eth" },
    { id: "eth-amhara", name: "Amhara", countryId: "eth" },
    { id: "eth-oromia", name: "Oromia", countryId: "eth" },
    { id: "eth-somali", name: "Somali", countryId: "eth" },
    { id: "eth-bng", name: "Benishangul-Gumuz", countryId: "eth" },
    { id: "eth-snnpr", name: "South Ethiopia Peoples' Region (SNNPR)", countryId: "eth" },
    { id: "eth-sidama", name: "Sidama", countryId: "eth" },
    { id: "eth-gambella", name: "Gambella", countryId: "eth" },
    { id: "eth-harari", name: "Harari", countryId: "eth" },
    { id: "eth-addis", name: "Addis Ababa City Administration", countryId: "eth" },
    { id: "eth-dire", name: "Dire Dawa City Administration", countryId: "eth" },
    { id: "eth-central", name: "Central Ethiopia", countryId: "eth" },
    { id: "eth-south", name: "South Ethiopia", countryId: "eth" },
    { id: "eth-southwest", name: "Southwest Ethiopia", countryId: "eth" },
  ],
  uga: [
    { id: "uga-central", name: "Central Uganda", countryId: "uga" },
    { id: "uga-eastern", name: "Eastern Uganda", countryId: "uga" },
    { id: "uga-northern", name: "Northern Uganda", countryId: "uga" },
    { id: "uga-western", name: "Western Uganda", countryId: "uga" },
  ],
  ken: [
    { id: "ken-nairobi", name: "Nairobi County", countryId: "ken" },
    { id: "ken-mombasa", name: "Mombasa County", countryId: "ken" },
    { id: "ken-kisumu", name: "Kisumu County", countryId: "ken" },
    { id: "ken-nakuru", name: "Nakuru County", countryId: "ken" },
    { id: "ken-eldoret", name: "Uasin Gishu County", countryId: "ken" },
  ],
};

async function tryDb<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try { return await query(); } catch { return fallback; }
}

router.get("/geo/countries", async (_req, res) => {
  const data = await tryDb(() => db.select().from(countries), FALLBACK_COUNTRIES);
  res.json(data);
});

router.get("/geo/regions", async (req, res) => {
  const { countryId } = req.query;
  if (!countryId) { res.json([]); return; }
  const data = await tryDb(
    () => db.select().from(regions).where(eq(regions.countryId, countryId as string)),
    FALLBACK_REGIONS[countryId as string] ?? []
  );
  res.json(data);
});

router.get("/geo/zones", async (req, res) => {
  const { regionId } = req.query;
  if (!regionId) { res.json([]); return; }
  const data = await tryDb(
    () => db.select().from(zones).where(eq(zones.regionId, regionId as string)),
    []
  );
  res.json(data);
});

router.get("/geo/woredas", async (req, res) => {
  const { zoneId } = req.query;
  if (!zoneId) { res.json([]); return; }
  const data = await tryDb(
    () => db.select().from(woredas).where(eq(woredas.zoneId, zoneId as string)),
    []
  );
  res.json(data);
});

export default router;
