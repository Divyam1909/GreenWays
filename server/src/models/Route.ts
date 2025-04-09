import mongoose, { Schema, Document } from 'mongoose';

export interface IRoute extends Document {
  userId: string;
  origin: string;
  destination: string;
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  mode: string;
  carbonEmission: number;
  date: Date;
}

const RouteSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  distance: {
    text: { type: String, required: true },
    value: { type: Number, required: true } // in meters
  },
  duration: {
    text: { type: String, required: true },
    value: { type: Number, required: true } // in seconds
  },
  mode: { type: String, required: true },
  carbonEmission: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model<IRoute>('Route', RouteSchema); 