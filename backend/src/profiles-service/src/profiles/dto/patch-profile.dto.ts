import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class InterestsPayloadDto {
  @IsArray()
  @IsString({ each: true })
  hobbies: string[];

  @IsArray()
  @IsString({ each: true })
  activities: string[];

  @IsArray()
  @IsString({ each: true })
  foods: string[];

  @IsArray()
  @IsString({ each: true })
  topics: string[];

  @IsArray()
  @IsString({ each: true })
  travelStyle: string[];
}

export class PatchProfileDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => InterestsPayloadDto)
  interests?: InterestsPayloadDto;
}
