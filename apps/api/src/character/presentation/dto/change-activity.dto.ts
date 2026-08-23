import { IsDateString, IsIn, IsOptional } from 'class-validator';
import { Activity } from '../../domain/entities/activity';

const ACTIVITIES: Activity[] = ['idle', 'working'];

export class ChangeActivityDto {
  @IsIn(ACTIVITIES)
  activity!: Activity;

  @IsOptional()
  @IsDateString()
  activityEndsAt?: string;
}
