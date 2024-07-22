import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { json } from "body-parser";
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

    const unpublishedSection = await db.section.update({
      where: {
        id: sectionId,
        courseId,
      },
      data: {
        isPublished: false,
      },
    });

    const publishedSectionInCourse = await db.section.findMany({
      where: {
        courseId,
        isPublished: true,
      },
    });
    if (publishedSectionInCourse.length === 0) {
      await db.course.update({
        where: {
          id: courseId,
          instructorId: userId,
        },
        data: {
          isPublished: false,
        },
      });
    }
    return NextResponse.json(unpublishedSection, { status: 200 });
  } catch (err) {
    console.log("[sectionId_unpublish]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
