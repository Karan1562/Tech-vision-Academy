"use client";
import { Course, Section } from "@prisma/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import toast from "react-hot-toast";
import axios from "axios";
import SectionList from "./SectionList";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title is required and it must be 2 characters long",
  }),
});

const CreateSectionForm = ({
  course,
}: {
  course: Course & { sections: Section[] };
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await axios.post(
        `/api/courses/${course.id}/sections`,
        values
      );
      router.push(`/instructor/courses/${course.id}/sections/${res.data.id}`);
      toast.success("New Section Created");
    } catch (err) {
      console.log("Failed to create a new section", err);
      toast.error("Something Went Wrong");
    }
  };
  const routes = [
    {
      label: "Basic Information",
      path: `/instructor/courses/${course.id}/basic`,
    },
    { label: "Curriculum", path: `/instructor/courses/${course.id}/sections` },
  ];

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      await axios.put(`/api/courses/${course.id}/sections/reorder`, {
        list: updateData,
      });
      toast.success("Sections reordered successfully");
    } catch (err) {
      console.log("Failed to reorder sections", err);
      toast.error("Something Went Wrong!");
    }
  };

  const pathname = usePathname();
  return (
    <>
      <div className="px-10 py-6">
        <div className="flex gap-5">
          {routes.map((route) => (
            <Link key={route.path} href={route.path} className="">
              <Button variant={pathname === route.path ? "default" : "outline"}>
                {route.label}
              </Button>
            </Link>
          ))}
        </div>
        <SectionList
          items={course.sections || []}
          onReorder={onReorder}
          onEdit={(id) =>
            router.push(`/instructor/courses/${course.id}/sections/${id}`)
          }
        />
        <h1 className="mt-5 text-xl font-bold mb-5">Add New Section</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Introduction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-5">
              <Link href={`/instructor/courses/${course.id}/basic`}>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default CreateSectionForm;
