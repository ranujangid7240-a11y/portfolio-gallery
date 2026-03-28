import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media } from '../schemas/media.schema';
import cloudinary from '../cloudinary.config';
import * as fs from 'fs';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name)
    private mediaModel: Model<Media>
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // Use lean() for read performance, but we must manually handle virtuals if needed 
    // or just return documents since we have JSON transforms in the schema.
    const [data, total] = await Promise.all([
      this.mediaModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.mediaModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async upload(file: Express.Multer.File, description: string, orientation: string, type: string) {
    if (!file) throw new BadRequestException('No valid file uploaded');

    try {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto',
      });

      const detectedOrientation = result.width > result.height ? 'horizontal' : 'vertical';

      const newMedia = new this.mediaModel({
        type: type || (file.mimetype.startsWith('video') ? 'video' : 'image'),
        orientation: orientation || detectedOrientation,
        url: result.secure_url,
        publicId: result.public_id,
        description: description || '',
        filename: file.filename,
      });

      // Local cleanup after successful cloud upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return await newMedia.save();
    } catch (error) {
      // Local cleanup on error
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  async update(id: string, updateDto: any) {
    return this.mediaModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async remove(id: string) {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) return { status: 'not found' };

    // Delete from Cloudinary if applicable
    if (media.publicId) {
       await cloudinary.uploader.destroy(media.publicId, {
         resource_type: media.type === 'video' ? 'video' : 'image'
       });
    }

    // Attempt local cleanup if URL points to uploads folder (legacy)
    if (media.url.startsWith('/uploads')) {
      try { fs.unlinkSync(`.${media.url}`); } catch(e){}
    }

    await this.mediaModel.findByIdAndDelete(id).exec();
    return { status: 'deleted' };
  }
}
