import { drizzle } from "drizzle-orm/node-postgres";
import { getPool } from "@/lib/db/pool";
import * as schema from "@/lib/db/schema";

export const db = drizzle(getPool(), { schema });
