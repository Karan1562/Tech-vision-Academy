"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Course } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RichEditor from "../custom/RichEditor";
import { Combobox } from "../custom/ComboBox";
import FileUpload from "../custom/FileUpload";
import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import Delete from "../custom/Delete";
import PublishButton from "../custom/PublishButton";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title is required and must be atleast 2 characters long",
  }),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, {
    message: "Category is required",
  }),
  subCategoryId: z.string().min(1, {
    message: "Subcategory is required",
  }),
  levelId: z.string().optional(),
  imageUrl: z.string().optional(),
  price: z.coerce.number().optional(),
});

interface EditCourseFormProps {
  course: Course;
  categories: {
    label: string;
    value: string;
    subCategories: { label: string; value: string }[];
  }[];
  levels: { label: string; value: string }[];
  isCompleted: boolean;
}

const EditCourseForm = ({
  course,
  categories,
  levels,
  isCompleted,
}: EditCourseFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course.title,
      subtitle: course.subtitle || "",
      description: course.description || "",
      categoryId: course.categoryId,
      subCategoryId: course.subCategoryId,
      levelId: course.levelId || "",
      imageUrl: course.imageUrl || "",
      price: course.price || undefined,
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${course.id}`, values);
      toast.success("Course Updated");
      router.refresh();
    } catch (err) {
      console.log("Failed to update the course", err);
      toast.error("Something Went Wrong!");
    }
  };
  const pathname = usePathname();

  const routes = [
    {
      label: "Basic Information",
      path: `/instructor/courses/${course.id}/basic`,
    },
    { label: "Curriculum", path: `/instructor/courses/${course.id}/sections` },
  ];
  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between mb-7">
        <div className="flex gap-5">
          {routes.map((route) => (
            <Link key={route.path} href={route.path} className="">
              <Button variant={pathname === route.path ? "default" : "outline"}>
                {route.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex gap-4 items-start">
          <PublishButton
            courseId={course.id}
            disabled={!isCompleted}
            isPublished={course.isPublished}
            page="Course"
          />
          <Delete item="course" courseId={course.id} />
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex : Web Development for Beginners"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex : Master the art of web devlopment with just one course. HTML,CSS,Javascript,NodeJs,MongoDB and much more"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RichEditor
                    placeholder="What is this course about ?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-wrap gap-10">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Category<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox options={categories} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subCategoryId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Sub category<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={
                        categories.find(
                          (category) =>
                            category.value === form.watch("categoryId")
                        )?.subCategories || []
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="levelId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Level<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox options={levels} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Course Banner<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <FileUpload
                    value={field.value || ""}
                    onChange={(url) => field.onChange(url)}
                    endpoint="courseBanner"
                    page="Edit Course"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Price<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="$29.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-5">
            <Link href="/instructor/courses">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default EditCourseForm;
