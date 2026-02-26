import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeetCodeProblem from "@/models/LeetCodeProblem";
import { getDataFromToken } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    const userId = getDataFromToken(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { userCode, language } = await request.json();

    await connectDB();
    const problem = await LeetCodeProblem.findOneAndUpdate(
      { _id: id, userId },
      { userCode, language },
      { new: true },
    );

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: problem });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
