import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/pool";

export async function GET() {
  const pool = getPool();
  const result = await pool.query("select now() as server_time");
  return NextResponse.json({ ok: true, serverTime: result.rows[0]?.server_time });
}
