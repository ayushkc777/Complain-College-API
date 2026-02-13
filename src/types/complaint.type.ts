import z from "zod";

export const ComplaintSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  location: z.string().optional(),
  description: z.string().min(5),
  image: z.string().optional(),
  status: z.enum(["open", "in_review", "resolved"]).default("open"),
  userId: z.string().optional(),
});

export type ComplaintType = z.infer<typeof ComplaintSchema>;
