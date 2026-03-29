import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Update from "@/lib/models/Update";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    // Verify token
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    const { title, content, status } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid update ID" },
        { status: 400 },
      );
    }

    const update = await Update.findByIdAndUpdate(
      id,
      { title, content, status },
      { new: true },
    );

    if (!update) {
      return NextResponse.json(
        { message: "Update not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Update edited successfully",
        update,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Edit update error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to edit update" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    // Verify token
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid update ID" },
        { status: 400 },
      );
    }

    const update = await Update.findByIdAndDelete(id);

    if (!update) {
      return NextResponse.json(
        { message: "Update not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Update deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Delete update error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete update" },
      { status: 500 },
    );
  }
}
