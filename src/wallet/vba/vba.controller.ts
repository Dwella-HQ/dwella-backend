import { Controller } from '@nestjs/common';
import { VbaService } from './vba.service';

@Controller('vba')
export class VbaController {
  constructor(private readonly vbaService: VbaService) {}
}
