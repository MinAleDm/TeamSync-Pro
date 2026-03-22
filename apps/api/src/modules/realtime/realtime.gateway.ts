import { Logger, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import type { RealtimeTaskEventDto } from "@tracker/types";

@WebSocketGateway({
  namespace: "/tasks",
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token as string | undefined;

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET ?? "replace-me-access",
      });
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage("project:subscribe")
  subscribeProject(client: Socket, @MessageBody() projectId: string) {
    void client.join(`project:${projectId}`);
    return { subscribed: projectId };
  }

  emitTaskEvent(event: RealtimeTaskEventDto) {
    this.server.to(`project:${event.projectId}`).emit("task:changed", event);
  }
}
