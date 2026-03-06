-- CreateTable
CREATE TABLE "conquest_guild" (
    "id" TEXT NOT NULL,

    CONSTRAINT "conquest_guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" SERIAL NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordName" TEXT NOT NULL,
    "minecraftUuid" TEXT,
    "minecraftName" TEXT,
    "guildId" TEXT,
    "guildJoinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_discordId_key" ON "member"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "member_minecraftUuid_key" ON "member"("minecraftUuid");

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "conquest_guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;
