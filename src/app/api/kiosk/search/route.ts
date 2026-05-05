import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { firstName, lastName } = await request.json();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const resident = await prisma.residentProfile.findFirst({
      where: {
        user: {
          firstName: { equals: firstName, mode: "insensitive" },
          lastName: { equals: lastName, mode: "insensitive" },
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!resident) {
      return NextResponse.json(
        { error: "Resident not found. Please check your details or register as a new resident." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: resident.id,
      name: `${resident.user.firstName} ${resident.user.lastName}`,
      address: resident.address,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
