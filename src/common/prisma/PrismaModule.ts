import { DynamicModule, Global, Module } from "@nestjs/common";
import { PrismaService } from "./PrismaService";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {
  static forRoot(): DynamicModule {
    
    const providers = [
      {
        provide: PrismaService,
        useClass: PrismaService,
      },
    ]

    return {
      module: PrismaModule,
      providers: providers,
      exports: providers,
    };
  }
}