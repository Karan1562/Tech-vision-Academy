import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
require("dotenv").config();

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string; sectionId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("unauthorised", { status: 400 });
    const { courseId, sectionId } = params;
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        instructorId: userId,
      },
    });
    if (!course) {
      return new NextResponse("Course Not Found", { status: 404 });
    }

    const section = await db.section.findUnique({
      where: {
        id: sectionId,
        courseId,
      },
    });
    if (!section) {
      return new NextResponse("Section Not Found", { status: 404 });
    }

    const muxData = await db.muxData.findUnique({
      where: {
        sectionId,
      },
    });
    if (!muxData) {
      return new NextResponse("Mux Data Not Found", { status: 404 });
    }

    if (
      !section ||
      !muxData ||
      !section.title ||
      !section.description ||
      !section.videoUrl
    ) {
      return new NextResponse("Section is not ready to be published", {
        status: 400,
      });
    }

    const publishedSection = await db.section.update({
      where: {
        id: sectionId,
        courseId,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(publishedSection, { status: 200 });
  } catch (err) {
    console.log("[section_publish]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
