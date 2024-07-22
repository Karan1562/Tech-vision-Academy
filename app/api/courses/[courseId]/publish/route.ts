require("dotenv").config();
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
require("dotenv").config();
export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    const { courseId } = params;
    if (!userId) return new NextResponse("Unauthorised", { status: 401 });
    const course = await db.course.findUnique({
      where: { id: courseId, instructorId: userId },
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

    const isPublishedSections = course.sections.some(
      (section) => section.isPublished
    );

    if (
      !course.title ||
      !course.description ||
      !course.categoryId ||
      !course.subCategoryId ||
      !course.imageUrl ||
      !course.levelId ||
      !course.price ||
      !isPublishedSections
    ) {
      return new NextResponse("Missing Fields Required", { status: 400 });
    }

    const publishedCourse = await db.course.update({
      where: {
        id: courseId,
        instructorId: userId,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(publishedCourse, { status: 200 });
  } catch (err) {
    console.log(["courseId_PUBLISH_POST", err]);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
