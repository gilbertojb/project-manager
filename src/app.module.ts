import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ProjectsModule } from "./projects/projects.module";
import { HttpExceptionFilter } from "./shared/filters/http-exception.filter";

@Module({
  imports: [ProjectsModule],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
