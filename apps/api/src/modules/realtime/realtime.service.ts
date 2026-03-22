import { Injectable } from "@nestjs/common";
import type { RealtimeTaskEventDto } from "@tracker/types";
import { RealtimeGateway } from "./realtime.gateway";

@Injectable()
export class RealtimeService {
  constructor(private readonly realtimeGateway: RealtimeGateway) {}

  publishTaskEvent(event: RealtimeTaskEventDto) {
    this.realtimeGateway.emitTaskEvent(event);
  }
}
