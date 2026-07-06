import { NextRequest, NextResponse } from "next/server";
import {
  isSupabaseConfigured,
  saveTemplate,
  fetchTemplates,
} from "@/lib/supabase/client";
import { ConversationData } from "@/lib/types";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase non configuré" },
      { status: 503 }
    );
  }

  try {
    const templates = await fetchTemplates();
    return NextResponse.json(templates);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase non configuré" },
      { status: 503 }
    );
  }

  try {
    const { name, data } = (await request.json()) as {
      name: string;
      data: ConversationData;
    };
    const template = await saveTemplate(name, data);
    return NextResponse.json(template);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
