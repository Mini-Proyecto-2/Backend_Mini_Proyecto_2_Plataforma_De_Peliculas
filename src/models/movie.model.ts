import { Schema, model, Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description?: string;
  videoUrl?: string;
  createdAt: Date;
}

const movieSchema = new Schema<IMovie>({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  createdAt: { type: Date, default: Date.now }
});

export default model<IMovie>('Movie', movieSchema);
