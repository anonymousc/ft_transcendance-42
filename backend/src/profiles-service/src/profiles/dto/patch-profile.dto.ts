import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class InterestsPayloadDto {
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  hobbies: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  activities: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  foods: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  topics: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  travelStyle: string[];
}

export class PatchProfileDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => InterestsPayloadDto)
  interests?: InterestsPayloadDto;
}
