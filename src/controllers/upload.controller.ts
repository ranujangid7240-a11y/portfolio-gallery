import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import cloudinary from '../cloudinary.config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
            },
        }),
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File not found');
        }

        try {
            const result = await cloudinary.uploader.upload(file.path, {
                resource_type: 'auto',
            });

            // Delete local file after upload
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            return {
                url: result.secure_url,
                width: result.width,
                height: result.height,
            };
        } catch (error) {
            // Cleanup on error
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw error;
        }
    }
}