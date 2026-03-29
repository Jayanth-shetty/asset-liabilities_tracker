import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Liability from "@/lib/models/Liability";
import { verifyToken } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    console.log("PUT /api/liabilities/[id] - Received body:", body);

    const { personName, amount, dateGiven, daysToReturn, description, status } =
      body;

    // Handle both direct params and Promise params (Next.js 16+)
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    console.log("PUT request params - id:", id, "userId:", decoded.userId);

    // Validate required fields
    if (
      !personName ||
      amount === undefined ||
      !dateGiven ||
      daysToReturn === undefined
    ) {
      return NextResponse.json(
        {
          message: "Missing required fields",
          received: { personName, amount, dateGiven, daysToReturn },
        },
        { status: 400 },
      );
    }

    const updateData = {
      personName,
      amount: typeof amount === "string" ? parseFloat(amount) : amount,
      dateGiven: new Date(dateGiven),
      daysToReturn:
        typeof daysToReturn === "string"
          ? parseInt(daysToReturn)
          : daysToReturn,
      description: description || "",
      status,
    };

    console.log("Updating with data:", updateData);

    const liability = await Liability.findOneAndUpdate(
      { _id: id, userId: decoded.userId },
      updateData,
      { new: true },
    );

    if (!liability) {
      console.log("Liability not found for id:", id, "userId:", decoded.userId);
      return NextResponse.json(
        { message: "Liability not found" },
        { status: 404 },
      );
    }

    console.log("Liability updated successfully:", liability);

    return NextResponse.json(
      { message: "Liability updated successfully", liability },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("PUT /api/liabilities/[id] error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        message: error.message || "Failed to update liability",
        error:
          process.env.NODE_ENV === "development"
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : undefined,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    console.log(
      "DELETE /api/liabilities/[id] - id:",
      id,
      "userId:",
      decoded.userId,
    );

    const liability = await Liability.findOneAndDelete({
      _id: id,
      userId: decoded.userId,
    });

    if (!liability) {
      console.log("Liability not found for deletion - id:", id);
      return NextResponse.json(
        { message: "Liability not found" },
        { status: 404 },
      );
    }

    console.log("Liability deleted successfully - id:", id);

    return NextResponse.json(
      { message: "Liability deleted successfully", liability },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("DELETE /api/liabilities/[id] error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        message: error.message || "Failed to delete liability",
        error:
          process.env.NODE_ENV === "development"
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : undefined,
      },
      { status: 500 },
    );
  }
}
