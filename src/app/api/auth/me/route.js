import { NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function GET(request) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ _id: userId }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User found",
      data: user,
    });
  } catch (error) {
    console.error("Me Auth Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
