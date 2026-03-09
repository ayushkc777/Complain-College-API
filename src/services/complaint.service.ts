import { CreateComplaintDTO, UpdateComplaintDTO } from "../dtos/complaint.dto";
import { HttpError } from "../errors/http-error";
import { ComplaintRepository } from "../repositories/complaint.repository";
import { UserRepository } from "../repositories/user.repository";

const repo = new ComplaintRepository();
const userRepo = new UserRepository();

type Actor = {
  id: string;
  role: "admin" | "user";
};

export class ComplaintService {
  private async resolveReporter(userId?: string) {
    if (!userId) {
      return { reporterName: undefined, reporterEmail: undefined };
    }

    try {
      const user = await userRepo.getUserById(userId);
      if (!user) {
        return { reporterName: userId, reporterEmail: undefined };
      }

      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
      const reporterName = fullName || user.username || user.email || userId;
      return { reporterName, reporterEmail: user.email };
    } catch {
      return { reporterName: userId, reporterEmail: undefined };
    }
  }

  private async withReporter<T extends { userId?: string; toObject?: () => Record<string, unknown> }>(
    complaint: T
  ) {
    const data =
      typeof complaint?.toObject === "function"
        ? complaint.toObject()
        : (complaint as unknown as Record<string, unknown>);
    const reporter = await this.resolveReporter(
      typeof data.userId === "string" ? data.userId : undefined
    );
    return { ...data, ...reporter };
  }

  async create(data: CreateComplaintDTO) {
    const complaint = await repo.create(data);
    return this.withReporter(complaint as any);
  }

  async list(_actor: Actor) {
    const complaints = await repo.list();
    return Promise.all(complaints.map((item) => this.withReporter(item as any)));
  }

  async getById(id: string, _actor: Actor) {
    const complaint = await repo.getById(id);
    if (!complaint) {
      throw new HttpError(404, "Complaint not found");
    }
    return this.withReporter(complaint as any);
  }

  async update(id: string, data: UpdateComplaintDTO, actor: Actor) {
    const existing = await repo.getById(id);
    if (!existing) {
      throw new HttpError(404, "Complaint not found");
    }

    if (actor.role !== "admin" && existing.userId !== actor.id) {
      throw new HttpError(403, "Forbidden");
    }

    if (actor.role !== "admin" && data.status) {
      throw new HttpError(403, "Only admin can update complaint status");
    }

    const updated = await repo.update(id, data);
    if (!updated) {
      throw new HttpError(404, "Complaint not found");
    }
    return this.withReporter(updated as any);
  }

  async remove(id: string, actor: Actor) {
    const existing = await repo.getById(id);
    if (!existing) {
      throw new HttpError(404, "Complaint not found");
    }
    if (actor.role !== "admin" && existing.userId !== actor.id) {
      throw new HttpError(403, "Forbidden");
    }

    const success = await repo.remove(id);
    if (!success) {
      throw new HttpError(404, "Complaint not found");
    }
    return success;
  }
}
