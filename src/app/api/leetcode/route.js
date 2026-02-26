import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LeetCodeProblem from "@/models/LeetCodeProblem";
import { getDataFromToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const userId = getDataFromToken(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const problems = await LeetCodeProblem.find({ userId }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ success: true, data: problems });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = getDataFromToken(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const data = await request.json();

    const problem = await LeetCodeProblem.create({
      ...data,
      userId,
    });

    return NextResponse.json({ success: true, data: problem });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
