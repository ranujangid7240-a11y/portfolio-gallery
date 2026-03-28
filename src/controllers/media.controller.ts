import { Controller, Post, Get, Delete, Patch, Param, Query, UseInterceptors, UploadedFile, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media } from '../schemas/media.schema';
import { AuthGuard } from '../guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import cloudinary from '../cloudinary.config';

import { MediaService } from '../services/media.service';

@Controller('api/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || 10);
    return this.mediaService.findAll(p, l);
  }

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
      if (!allowed.includes(file.mimetype)) return cb(null, false);
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string,
    @Body('orientation') orientation: string,
    @Body('type') type: string
  ) {
    return this.mediaService.upload(file, description, orientation, type);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.mediaService.update(id, updateDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
