import { ComplaintModel, IComplaint } from "../models/complaint.model";

export class ComplaintRepository {
  async create(data: Partial<IComplaint>): Promise<IComplaint> {
    const complaint = new ComplaintModel(data);
    return complaint.save();
  }

  async list(): Promise<IComplaint[]> {
    return ComplaintModel.find().sort({ createdAt: -1 });
  }

  async getById(id: string): Promise<IComplaint | null> {
    return ComplaintModel.findById(id);
  }

  async update(id: string, data: Partial<IComplaint>): Promise<IComplaint | null> {
    return ComplaintModel.findByIdAndUpdate(id, data, { new: true });
  }

  async remove(id: string): Promise<boolean> {
    const result = await ComplaintModel.findByIdAndDelete(id);
    return !!result;
  }
}
