import { WebSocketGateway } from '@nestjs/websockets';
import { AppService } from './app.service';

@WebSocketGateway()
export class AppGateway {
  constructor(private readonly appService: AppService) {}
}
