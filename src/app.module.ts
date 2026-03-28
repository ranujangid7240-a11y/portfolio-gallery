import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

import { AuthController } from './controllers/auth.controller';
import { MediaController } from './controllers/media.controller';
import { ThoughtsController } from './controllers/thoughts.controller';
import { StatsController } from './controllers/stats.controller';
import { UploadController } from './controllers/upload.controller';

import { Media, MediaSchema } from './schemas/media.schema';
import { Thought, ThoughtSchema } from './schemas/thought.schema';

import { MediaService } from './services/media.service';
import { ThoughtsService } from './services/thoughts.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Media.name, schema: MediaSchema },
      { name: Thought.name, schema: ThoughtSchema },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AuthController, MediaController, ThoughtsController, StatsController, UploadController],
  providers: [MediaService, ThoughtsService],
})
export class AppModule { }
