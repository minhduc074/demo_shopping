import { NextRequest, NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const profile = await loginWithPassword({ email, password });
    return NextResponse.json({ success: true, profile: { id: profile.id, email: profile.email } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
