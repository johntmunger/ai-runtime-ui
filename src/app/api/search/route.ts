import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function POST(req: Request) {
  await req.json();

  const results = await db.execute(sql`
    SELECT text
    FROM documents
    LIMIT 5
  `);

  return Response.json(results.rows);
}
