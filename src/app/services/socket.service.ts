import { Injectable, signal, WritableSignal } from '@angular/core';
import { SignalService } from './signal.service';

export interface SocketMessage {
  event: string;
  sender_id: string;
  receiver_id: string;
  timestamp_ms: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: WebSocket | null = null;
  lastMessage: WritableSignal<SocketMessage | null> = signal(null);
  allMessages: WritableSignal<SocketMessage[]> = signal([]);

  constructor(private signalService: SignalService) {
    this.connect();
  }

  connect(): void {
    const userId = this.signalService.getId();
    const token = this.signalService.getToken();

    if (!userId || !token) {
      console.warn(
        'WebSocket-Verbindung nicht möglich: kein Token oder userId'
      );
      return;
    }

    const url = `ws://webp-ilv-backend.cs.technikum-wien.at:3000?user_id=${userId}&token=${token}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket verbunden');
    };

    this.socket.onmessage = (event) => {
      console.log('Socket service');
      try {
        const data = JSON.parse(event.data);
        console.log('New message' + data);
        if (data.event === 'message') {
          this.lastMessage.set(data);
          this.allMessages.update((prev) => [...prev, data]);
        }
      } catch (e) {
        console.error('Ungültige Nachricht erhalten:', e);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Fehler:', error);
    };

    this.socket.onclose = () => {
      console.warn('WebSocket Verbindung geschlossen');
    };
  }

  getLastMessage(): SocketMessage | null {
    return this.lastMessage();
  }

  getAllMessages(): SocketMessage[] {
    return this.allMessages();
  }

  resetMessages(): void {
    this.allMessages.set([]);
  }
}
