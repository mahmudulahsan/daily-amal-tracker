import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// POST /api/users — upsert a user name
export async function POST(req: NextRequest) {
  try {
    const { id, name } = await req.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: "id and name are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("users")
      .upsert({ id, name }, { onConflict: "id" });

    if (error) {
      console.error("Supabase upsert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API /users POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users — delete a user by id
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API /users DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
