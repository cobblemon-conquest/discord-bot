import { Injectable } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient {
    
  constructor() {
    const adapter = new PrismaPg(
      { connectionString: process.env.DATABASE_URL },
      { schema: process.env.DATABASE_SCHEMA || 'public' }
    );
    super({ adapter });
  }
}