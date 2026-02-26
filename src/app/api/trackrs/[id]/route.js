import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trackr from "@/models/Trackr";
import { getDataFromToken } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, completed, dueDate, status } =
      await request.json();

    await connectDB();
    const trackr = await Trackr.findOne({ _id: id, userId });

    if (!trackr) {
      return NextResponse.json({ error: "Trackr not found" }, { status: 404 });
    }

    if (title !== undefined) trackr.title = title;
    if (description !== undefined) trackr.description = description;
    if (dueDate !== undefined) trackr.dueDate = dueDate;

    // Handle status and completion sync
    if (status !== undefined) {
      trackr.status = status;
      trackr.completed = status === "done";
    } else if (completed !== undefined) {
      trackr.completed = completed;
      trackr.status = completed ? "done" : "todo";
    }

    await trackr.save();

    return NextResponse.json({
      message: "Trackr updated",
      success: true,
      data: trackr,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const result = await Trackr.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Trackr not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Trackr deleted",
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
