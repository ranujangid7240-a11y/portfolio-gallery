import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Thought {
    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    category: string;
}

export const ThoughtSchema = SchemaFactory.createForClass(Thought);

// Optimization: Index createdAt for faster sorting
ThoughtSchema.index({ createdAt: -1 });

// Map virtual id to _id for frontend compatibility
ThoughtSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

ThoughtSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete (ret as any)._id;
    },
});