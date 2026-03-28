import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Media {
    @Prop()
    filename: string;

    @Prop()
    url: string;

    @Prop()
    publicId: string;

    @Prop()
    type: string; // image / video

    @Prop()
    orientation: string; // horizontal / vertical

    @Prop()
    description: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

// Optimization: Index createdAt for faster sorting
MediaSchema.index({ createdAt: -1 });

// Map virtual id to _id for frontend compatibility
MediaSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

MediaSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        // Optimization: Inject Cloudinary auto format and quality if applicable
        if (ret.url && ret.url.includes('cloudinary.com')) {
          ret.url = ret.url.replace('/upload/', '/upload/f_auto,q_auto/');
        }
        delete (ret as any)._id;
    },
});