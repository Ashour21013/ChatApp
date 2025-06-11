// conversation.component.ts
import {
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SignalService } from '../../services/signal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service.service';
import { SocketService } from '../../services/socket.service';

export interface ChatMessage {
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp?: number;
}

@Component({
  selector: 'app-conversation',
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css'],
})
export class ConversationComponent implements OnInit {
  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;
  selectedUserId: string | null = '';
  userid: string | null = '';
  data: ChatMessage[] = [];
  messageInput: string = '';

  constructor(
    private apiService: ApiService,
    private signalService: SignalService,
    private authService: AuthServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private socketService: SocketService
  ) {
    effect(() => {
      const socketMessage = this.socketService.getLastMessage();
      console.log(socketMessage);
      console.log('getting live messages ' + socketMessage?.message);
      console.log(socketMessage?.sender_id + ' = ' + this.selectedUserId);
      console.log(socketMessage?.receiver_id + ' = ' + this.userid);

      const ownUserId = Number(this.userid); // dein User ID
      const chatPartnerId = Number(this.selectedUserId); // aktuell geöffneter Chat-Partner

      if (
        socketMessage &&
        // Nachricht ist von chatPartner an dich
        ((Number(socketMessage.sender_id) === chatPartnerId &&
          Number(socketMessage.receiver_id) === ownUserId) ||
          // Nachricht ist von dir an chatPartner (z.B. Echo, falls angezeigt)
          (Number(socketMessage.sender_id) === ownUserId &&
            Number(socketMessage.receiver_id) === chatPartnerId))
      ) {
        // Konvertiere SocketMessage zu ChatMessage
        console.log('pushing message');
        const chatMessage: ChatMessage = {
          sender_id: socketMessage.sender_id,
          receiver_id: socketMessage.receiver_id,
          message: socketMessage.message,
          timestamp: socketMessage.timestamp_ms,
        };
        console.log(chatMessage);
        this.data = [...this.data, chatMessage];
        this.scrollToBottom();
      }
    });
  }

  async loadMessages() {
    try {
      const messages = await this.apiService.getConversation(
        this.selectedUserId
      );

      if (Array.isArray(messages)) {
        this.data = messages;
        this.scrollToBottom();
      }
    } catch (err) {
      console.error('Fehler beim Laden der Nachrichten:', err);
    }
  }

  async handleSendMessage() {
    if (!this.selectedUserId || !this.messageInput) return;

    try {
      const response = await this.apiService.sendMessage(
        this.selectedUserId,
        this.messageInput
      );
      console.log(response);
      this.messageInput = '';
      this.loadMessages();
    } catch (err) {
      console.error('handleSendMessage Error:', err);
    }
  }

  scrollToBottom(): void {
    try {
      // Timeout gibt dem DOM Zeit zum Aktualisieren
      setTimeout(() => {
        // 1. Hole das Chat-Container-Element
        //    - this.chatMessagesRef ist die ViewChild-Referenz
        //    - nativeElement gibt das eigentliche HTML-Element
        const chatContainer = this.chatMessagesRef.nativeElement;

        // 2. Setze die Scroll-Position
        //    - scrollHeight: Gesamthöhe des Inhalts (inkl. nicht sichtbarer Teil)
        //    - scrollTop: Wie weit wir bereits gescrollt haben
        //    - Durch Zuweisung scrollen wir nach unten
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 0); //Set time out, damit der Dom schnell noch refresht
    } catch (err) {
      console.warn('Scrollfehler:', err);
    }
  }
  isOwnMessage(msg: ChatMessage): boolean {
    return msg.sender_id == this.userid;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.selectedUserId = params.get('receiverId') ?? '';
      this.loadMessages();
    });

    //dann wegmachen wenn mit parameter geht
    //this.selectedUserId = this.signalService.getREciverId();

    this.userid = this.signalService.getId();
    console.log(this.userid);

    if (!this.userid) this.router.navigate(['/login']);
    if (!this.selectedUserId) this.router.navigate(['/messages']);

    this.loadMessages();
  }
}
