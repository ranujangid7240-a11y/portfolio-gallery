import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Thought } from '../schemas/thought.schema';

@Injectable()
export class ThoughtsService {
  constructor(
    @InjectModel(Thought.name)
    private thoughtModel: Model<Thought>
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.thoughtModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.thoughtModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(createDto: any) {
    const newThought = new this.thoughtModel(createDto);
    return newThought.save();
  }

  async update(id: string, updateDto: any) {
    return this.thoughtModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async remove(id: string) {
    await this.thoughtModel.findByIdAndDelete(id).exec();
    return { status: 'deleted' };
  }
}
