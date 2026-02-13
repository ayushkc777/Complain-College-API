import z from "zod";
import { ComplaintSchema } from "../types/complaint.type";

export const CreateComplaintDTO = ComplaintSchema.pick({
  title: true,
  category: true,
  location: true,
  description: true,
  image: true,
  userId: true,
});
export type CreateComplaintDTO = z.infer<typeof CreateComplaintDTO>;

export const UpdateComplaintDTO = ComplaintSchema.pick({
  title: true,
  category: true,
  location: true,
  description: true,
  image: true,
  status: true,
}).partial();
export type UpdateComplaintDTO = z.infer<typeof UpdateComplaintDTO>;
