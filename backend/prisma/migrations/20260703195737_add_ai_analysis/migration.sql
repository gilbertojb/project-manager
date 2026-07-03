-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "ai_analysis" JSONB,
ADD COLUMN     "ai_analyzed_at" TIMESTAMP(3);
