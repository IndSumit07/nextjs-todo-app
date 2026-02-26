import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trackr from "@/models/Trackr";
import { getDataFromToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const trackrs = await Trackr.find({ userId }).sort({
      order: 1,
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: trackrs,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { title, description, dueDate } = await request.json();

    const newTrackr = new Trackr({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      userId,
    });

    await newTrackr.save();

    return NextResponse.json({
      message: "Trackr created",
      success: true,
      data: newTrackr,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
