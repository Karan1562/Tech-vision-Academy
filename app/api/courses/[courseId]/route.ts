require("dotenv").config();
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";
require("dotenv").config();

const { video } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorised", { status: 401 });
    const { courseId } = params;
    const values = await req.json();
    const course = await db.course.update({
      where: { id: courseId, instructorId: userId },
      data: { ...values },
    });
    return NextResponse.json(course, { status: 200 });
  } catch (err) {
    console.log(["courseId_PATCH", err]);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorised", { status: 401 });
    const { courseId } = params;

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        instructorId: userId,
      },
      include: {
        sections: {
          include: {
            muxData: true,
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Course Not Found", { status: 404 });
    }

    for (const section of course.sections) {
      if (section.muxData?.assetId) {
        await video.assets.delete(section.muxData.assetId);
      }
    }

    await db.course.delete({
      where: {
        id: courseId,
        instructorId: userId,
      },
    });

    return new NextResponse("Course Deleted", { status: 200 });
  } catch (err) {
    console.log("[courseId_DELETE]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
