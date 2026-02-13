import { CreateComplaintDTO, UpdateComplaintDTO } from "../dtos/complaint.dto";
import { HttpError } from "../errors/http-error";
import { ComplaintRepository } from "../repositories/complaint.repository";

const repo = new ComplaintRepository();

export class ComplaintService {
  async create(data: CreateComplaintDTO) {
    return repo.create(data);
  }

  async list() {
    return repo.list();
  }

  async getById(id: string) {
    const complaint = await repo.getById(id);
    if (!complaint) {
      throw new HttpError(404, "Complaint not found");
    }
    return complaint;
  }

  async update(id: string, data: UpdateComplaintDTO) {
    const updated = await repo.update(id, data);
    if (!updated) {
      throw new HttpError(404, "Complaint not found");
    }
    return updated;
  }

  async remove(id: string) {
    const success = await repo.remove(id);
    if (!success) {
      throw new HttpError(404, "Complaint not found");
    }
    return success;
  }
}
