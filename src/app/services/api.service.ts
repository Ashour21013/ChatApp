import { Injectable, effect } from '@angular/core';
import { SignalService } from './signal.service';

interface ApiResponse {
  success?: boolean;
  error?: string;
  id?: string;
  token?: string;
}
export interface User {
  id: string;
  name: string;
  group_id: string;
}
export interface ChatMessage {
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp?: number; // optional, falls nicht immer dabei
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private BASE_URL = 'http://webp-ilv-backend.cs.technikum-wien.at/messenger';
  id: string = '';
  token: string = '';

  constructor(private signalService: SignalService) {
    effect(() => {
      this.id = this.signalService.getId();
      this.token = this.signalService.getToken();
    });
  }

  async loginUser(
    usernameOrEmail: string,
    password: string
  ): Promise<ApiResponse> {
    console.log('logging in');
    const url = `${this.BASE_URL}/login.php`;

    const formData = new FormData();
    formData.append('username_or_email', usernameOrEmail);
    formData.append('password', password);

    const resp = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const data: ApiResponse = await resp.json();
    // console.log('Login/Registration response:', data);

    // console.log(data);
    return data;
  }
  async getUsers(): Promise<User[] | { error?: string }> {
    // Build the query params conditionally
    const params: string[] = [];

    // If we have a token, add it
    if (this.token) {
      params.push(`token=${this.token}`);
    }
    // console.log('Api service getting users');
    // console.log(`Token: ${this.token}`);

    // If we have the registered user ID
    if (this.id) {
      params.push(`id=${this.id}`);
    }

    // Construct the final query string
    // e.g. "?token=abc123&id=42" or "" if neither is set
    const queryString = params.length > 0 ? '?' + params.join('&') : '';

    const url = `${this.BASE_URL}/get_users.php${queryString}`;

    //api aufruf mit axios
    //const { data } = await axios.get(url);
    // return data;

    const resp = await fetch(url);
    //console.log(resp);
    return resp.json();
  }

  async getConversation(
    userId: string | null
  ): Promise<ChatMessage[] | ApiResponse> {
    const params: string[] = [];

    // If we have a token, add it
    if (this.token) {
      params.push(`token=${this.token}`);
    }

    // If we have the registered user ID
    if (this.id) {
      params.push(`user1_id=${this.id}`);
    }
    params.push(`user2_id=${userId}`);

    // Construct the final query string
    // e.g. "?token=abc123&id=42" or "" if neither is set
    const queryString = params.length > 0 ? '?' + params.join('&') : '';
    console.log('Querystring ' + queryString);

    const url = `${this.BASE_URL}/get_conversation.php${queryString}`;

    //token, user1_id, user2_id (as query params)
    const resp = await fetch(url);
    //console.log(resp.json);
    return resp.json();
  }

  async sendMessage(receiverId: string, message: string): Promise<ApiResponse> {
    //const url = `${this.BASE_URL}/send_message.php`;
    const url = `http://webp-ilv-backend.cs.technikum-wien.at:3000/send-message`;

    // const formData = new FormData();
    // formData.append('sender_id', this.id); //this.senderid umtauschen irwann
    // formData.append('receiver_id', receiverId);
    // formData.append('message', message);

    // if (this.token) {
    //   formData.append('token', this.token);
    // }

    const payload = {
      sender_id: this.id,
      receiver_id: receiverId,
      message: message,
      token: this.token,
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // const resp = await fetch(url, {
    //   method: 'POST',
    //   body: formData,
    // });
    //console.log('printing server response' + resp);
    return resp.json();
  }
}
