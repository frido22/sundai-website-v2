-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateTable
CREATE TABLE "ProjectVote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "hackerId" TEXT NOT NULL,
    "voteType" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectVote_pkey" PRIMARY KEY ("id")
);

-- Migrate existing likes to upvotes
INSERT INTO "ProjectVote" ("id", "projectId", "hackerId", "voteType", "createdAt", "updatedAt")
SELECT "id", "projectId", "hackerId", 'UPVOTE', "createdAt", CURRENT_TIMESTAMP
FROM "ProjectLike";

-- DropTable
DROP TABLE "ProjectLike";

-- Update notification preferences column name
ALTER TABLE "PushSubscription" RENAME COLUMN "notifyLikes" TO "notifyVotes";

-- Update notification type enum
ALTER TYPE "NotificationType" RENAME VALUE 'NEW_LIKE' TO 'NEW_VOTE';

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVote_projectId_hackerId_key" ON "ProjectVote"("projectId", "hackerId");

-- CreateIndex
CREATE INDEX "ProjectVote_projectId_idx" ON "ProjectVote"("projectId");

-- CreateIndex
CREATE INDEX "ProjectVote_hackerId_idx" ON "ProjectVote"("hackerId");

-- AddForeignKey
ALTER TABLE "ProjectVote" ADD CONSTRAINT "ProjectVote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVote" ADD CONSTRAINT "ProjectVote_hackerId_fkey" FOREIGN KEY ("hackerId") REFERENCES "Hacker"("id") ON DELETE CASCADE;