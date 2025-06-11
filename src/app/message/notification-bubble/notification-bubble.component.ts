import { Component, OnInit, OnDestroy, effect, inject } from '@angular/core';

import { Router } from '@angular/router';

import { SocketService } from '../../services/socket.service';
import { SignalService } from '../../services/signal.service';

@Component({
  selector: 'app-notification-bubble',
  templateUrl: './notification-bubble.component.html',
  styleUrls: ['./notification-bubble.component.css'],
})
export class NotificationBubbleComponent {
  hidden = true;
  newMessage: any = null;
  private signalService = inject(SignalService);
  private timeoutId: any;
  private autoHideTimeoutId: any = null;

  constructor(private socketService: SocketService, private router: Router) {
    effect(() => {
      this.newMessage = this.socketService.getLastMessage();
      console.log('notflication bubble');
      //Nur nachrichten die an mich geschickt werden anzeigen.
      if (
        this.newMessage?.receiver_id != this.signalService.getId() &&
        this.newMessage == null
      ) {
        console.log('returning');
        return;
      }

      // Nur anzeigen wenn eingeloggt
      if (!this.signalService.getisLoggedOn()) {
        console.log(this.signalService.getisLoggedOn());
        console.log('not logged in');
        this.hidden = true;
        return;
      }

      // Prüfe ob wir bereits im Chat mit dem Absender sind
      const currentRoute = this.router.url;
      const isInSameChat = currentRoute.includes(
        `/chat/${this.newMessage?.sender_id}`
      );

      console.log(isInSameChat);
      if (!isInSameChat) {
        this.hidden = false;

        // Clear existing timeout
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }
        // Auto-hide after 10 seconds
        this.autoHideTimeoutId = setTimeout(() => {
          this.hidden = true;
        }, 10000);
      }
    });
  }

  handleClick() {
    if (this.newMessage) {
      console.log('navigating to chat ' + this.newMessage.sender_id);
      this.signalService.setReciverId(this.newMessage.sender_id);

      if (this.autoHideTimeoutId) {
        clearTimeout(this.autoHideTimeoutId);
        this.autoHideTimeoutId = null;
      }
      this.hidden = false;
      this.router.navigate(['/chat', this.newMessage.sender_id]);
    }
  }
}
