// src/ApiService.ts
//aimport axios from 'axios';
import axios from '../node_modules/axios/index';

export interface ApiResponse {
  success?: boolean;
  error?: string;
  id?: string;
  token?: string;
}

// Example user type
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

const BASE_URL = 'http://webp-ilv-backend.cs.technikum-wien.at/messenger';

export class ApiService {
  // We store the token here after login
  private static token: string | null = null;
  private static registeredUserId: string | '';

  // Provide a getter if you want to retrieve it elsewhere
  static getToken(): string | null {
    return this.token;
  }

  static getRegisteredUserId(): string | null {
    return this.registeredUserId;
  }

  // ---------------------------------------------
  // 1) Register a new user
  // ---------------------------------------------
  static async registerUser(
    name: string,
    email: string,
    password: string,
    groupId: string,
  ): Promise<ApiResponse> {
    const url = `${BASE_URL}/registrieren.php`;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('group_id', groupId);

    const resp = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const data: ApiResponse = await resp.json();

    //Api aufruf mit axios
    //const {data} = await axios.post(url,formData);

    // Wenn data id enthält, dann absepichern
    if (data.id) {
      this.registeredUserId = data.id;
      console.log('Registered user ID stored:', this.registeredUserId);
    }

    return data;
  }

  // ---------------------------------------------
  // 2) Login
  // ---------------------------------------------
  static async loginUser(
    usernameOrEmail: string,
    password: string,
  ): Promise<ApiResponse> {
    const url = `${BASE_URL}/login.php`;

    const formData = new FormData();
    formData.append('username_or_email', usernameOrEmail);
    formData.append('password', password);

    const resp = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const data: ApiResponse = await resp.json();
    console.log('Login/Registration response:', data);

    // If the backend returns a token
    if (data.token) {
      this.token = data.token;
      console.log('Token stored:', this.token);
    }
    if (data.id) {
      this.registeredUserId = data.id;
      console.log('Userid stored:', this.registeredUserId);
    }
    return data;
  }

  // ---------------------------------------------
  // 3) Get Users
  // ---------------------------------------------
  // Inside ApiService class

  static async getUsers(): Promise<User[] | { error?: string }> {
    // Build the query params conditionally
    const params: string[] = [];

    // If we have a token, add it
    if (this.token) {
      params.push(`token=${this.token}`);
    }

    // If we have the registered user ID
    if (this.registeredUserId) {
      params.push(`id=${this.registeredUserId}`);
    }

    // Construct the final query string
    // e.g. "?token=abc123&id=42" or "" if neither is set
    const queryString = params.length > 0 ? '?' + params.join('&') : '';

    const url = `${BASE_URL}/get_users.php${queryString}`;

    //api aufruf mit axios
    //const { data } = await axios.get(url);
    // return data;

    const resp = await fetch(url);
    console.log(resp);
    return resp.json();
  }

  // ---------------------------------------------
  // 4) Send Message
  // ---------------------------------------------
  static async sendMessage(
    receiverId: string,
    message: string,
  ): Promise<ApiResponse> {
    const url = `${BASE_URL}/send_message.php`;
    const formData = new FormData();
    formData.append('sender_id', this.registeredUserId); //this.senderid umtauschen irwann
    formData.append('receiver_id', receiverId);
    formData.append('message', message);

    if (this.token) {
      formData.append('token', this.token);
    }

    const resp = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return resp.json();
  }

  static async getConversation(
    userId: string,
  ): Promise<ChatMessage[] | ApiResponse> {
    const params: string[] = [];

    // If we have a token, add it
    if (this.token) {
      params.push(`token=${this.token}`);
    }

    // If we have the registered user ID
    if (this.registeredUserId) {
      params.push(`user1_id=${this.registeredUserId}`);
    }
    params.push(`user2_id=${userId}`);

    // Construct the final query string
    // e.g. "?token=abc123&id=42" or "" if neither is set
    const queryString = params.length > 0 ? '?' + params.join('&') : '';

    const url = `${BASE_URL}/get_conversation.php${queryString}`;

    //token, user1_id, user2_id (as query params)
    const resp = await fetch(url);
    return resp.json();
  }
}
