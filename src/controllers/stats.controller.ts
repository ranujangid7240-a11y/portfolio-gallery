import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Thought } from '../schemas/thought.schema';
import { Media } from '../schemas/media.schema';
import { AuthGuard } from '../guards/auth.guard';

@Controller('api/stats')
export class StatsController {
  constructor(
    @InjectModel(Thought.name)
    private thoughtModel: Model<Thought>,
    @InjectModel(Media.name)
    private mediaModel: Model<Media>
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getStats() {
    const thoughts = await this.thoughtModel.countDocuments();
    const images = await this.mediaModel.countDocuments({ type: 'image' });
    const videos = await this.mediaModel.countDocuments({ type: 'video' });
    
    return { thoughts, images, videos };
  }
}
