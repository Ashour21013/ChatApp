import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MessageListComponent } from './message/message-list/message-list.component';
import { ConversationComponent } from './message/conversation/conversation.component';

export const routes: Routes = [
  //{ path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'messages', component: MessageListComponent },
  { path: 'chat/:receiverId', component: ConversationComponent },
];
