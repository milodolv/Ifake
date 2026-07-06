import { createClient } from "@supabase/supabase-js";
import { ConversationData, Template } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

export function createSupabaseClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase non configuré");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function saveTemplate(
  name: string,
  data: ConversationData,
  userId = "default"
): Promise<Template> {
  const supabase = createSupabaseClient();
  const { data: row, error } = await supabase
    .from("templates")
    .insert({ name, data, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return row as Template;
}

export async function fetchTemplates(userId = "default"): Promise<Template[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Template[];
}

export async function deleteTemplate(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadImage(file: File): Promise<string> {
  const supabase = createSupabaseClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("conversation-images")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from("conversation-images")
    .getPublicUrl(path);

  return data.publicUrl;
}
