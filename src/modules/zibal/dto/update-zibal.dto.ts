import { PartialType } from '@nestjs/swagger';
import { CreateZibalDto } from './create-zibal.dto';

export class UpdateZibalDto extends PartialType(CreateZibalDto) {}
