import { db } from "./db";
import { sql } from "drizzle-orm";

const testEmbedding = Array(1536).fill(0.01);

async function run() {
  const results = await db.execute(sql`
    SELECT text
    FROM document_embeddings
    LIMIT 5
  `);

  console.log(results);
}

run();
