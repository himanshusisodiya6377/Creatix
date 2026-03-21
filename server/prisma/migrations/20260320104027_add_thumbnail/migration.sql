-- CreateTable
CREATE TABLE "thumbnail" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "style" TEXT NOT NULL,
    "aspect_ratio" TEXT NOT NULL DEFAULT '16:9',
    "color_scheme" TEXT,
    "text_overlay" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT NOT NULL DEFAULT '',
    "prompt_used" TEXT,
    "user_prompt" TEXT,
    "isGenerating" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thumbnail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "thumbnail_userId_idx" ON "thumbnail"("userId");

-- AddForeignKey
ALTER TABLE "thumbnail" ADD CONSTRAINT "thumbnail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
