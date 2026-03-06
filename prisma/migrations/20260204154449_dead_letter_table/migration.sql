-- CreateTable
CREATE TABLE "dead_letter" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dead_letter_pkey" PRIMARY KEY ("id")
);
