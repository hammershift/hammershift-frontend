import { Document, Schema, model, models } from "mongoose";

export interface ScraperRun extends Document {
  status: 'success' | 'error' | 'partial';
  auctions_found: number;
  auctions_created: number;
  auctions_updated: number;
  auctions_failed: number;
  error_message?: string;
  error_stack?: string;
  duration_ms: number;
  created_at: Date;
}

const scraperRunSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['success', 'error', 'partial'],
      required: true,
      index: true,
    },
    auctions_found: {
      type: Number,
      default: 0,
    },
    auctions_created: {
      type: Number,
      default: 0,
    },
    auctions_updated: {
      type: Number,
      default: 0,
    },
    auctions_failed: {
      type: Number,
      default: 0,
    },
    error_message: {
      type: String,
    },
    error_stack: {
      type: String,
    },
    duration_ms: {
      type: Number,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      expires: 2592000, // 30 days in seconds (30 * 24 * 60 * 60)
      index: true,
    },
  },
  {
    collection: "scraper_runs",
    timestamps: false,
  }
);

// Index for querying recent runs and health checks
scraperRunSchema.index({ created_at: -1 });
scraperRunSchema.index({ status: 1, created_at: -1 });

const ScraperRun =
  models.ScraperRun || model<ScraperRun>("ScraperRun", scraperRunSchema);

export default ScraperRun;
