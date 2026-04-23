#!/usr/bin/env node
// Usage: node scripts/migrate-substack.js path/to/substack-export.csv
// Does NOT trigger Postmark welcome emails — bulk insert only.

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/migrate-substack.js <path-to-csv>");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseCsv(raw) {
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const emailIdx = headers.findIndex((h) => h.toLowerCase() === "email");

  if (emailIdx === -1) {
    throw new Error("No 'email' column found in CSV. Headers: " + headers.join(", "));
  }

  return lines.slice(1).flatMap((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
    const email = cols[emailIdx];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return [];
    return [{ email, source: "substack-migration" }];
  });
}

async function main() {
  const raw = fs.readFileSync(path.resolve(csvPath), "utf8");
  const rows = parseCsv(raw);

  console.log(`Found ${rows.length} valid emails. Starting batch insert…`);

  const BATCH_SIZE = 100;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("subscribers")
      .upsert(batch, { onConflict: "email", ignoreDuplicates: true });

    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error.message);
    } else {
      inserted += batch.length;
    }

    process.stdout.write(`\rProgress: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }

  console.log(`\nDone. Inserted/upserted: ${inserted}. Skipped duplicates: ${skipped}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
