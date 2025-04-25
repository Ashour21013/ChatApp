// src/ChatUI.ts

import { ApiService } from './ApiService.js';
import { StateManager } from './StateManager.js';
import type { User, ApiResponse } from './ApiService.js';

export class ChatUI {
  private selectedUserId: string = '';
  private messagePollingInterval: number | null = null;

  constructor() {
    this.initEventListeners();
  }

  private initEventListeners() {
    const regDv = document.getElementById('registerDiv');
    const logDiv = document.getElementById('logDiv');
    //Für jedes einzelne Task die eventListner erstellen
    // 1) Registration
    const regForm = document.getElementById('registerForm');
    if (regForm) {
      regForm.addEventListener('submit', (event) => this.handleRegister(event));

      regDv?.classList.add('d-none');

      const regClick = document.getElementById('registerClick');
      regClick?.addEventListener('click', () => {
        regDv?.classList.remove('d-none');
        logDiv?.classList.add('d-none');
      });
    }

    // 2) Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (event) => this.handleLogin(event));

      const logClick = document.getElementById('logClick');
      logClick?.addEventListener('click', () => {
        logDiv?.classList.remove('d-none');
        regDv?.classList.add('d-none');
      });
    }

    // 3) Get Users
    const loadUsersBtn = document.getElementById('loadUsersBtn');
    if (loadUsersBtn) {
      loadUsersBtn.addEventListener('click', () => this.handleGetUsers());
    }

    // 4) Send Message
    const sendForm = document.getElementById('chatForm');
    if (sendForm) {
      sendForm.addEventListener('submit', (event) =>
        this.handleSendMessage(event),
      );
      const chatDiv = document.getElementById('chatDiv');
      chatDiv?.classList.add('d-none');
    }
  }

  // --------------------------------------------------------------------------
  // Task 1: Handle Register
  // --------------------------------------------------------------------------
  private async handleRegister(event: Event) {
    event.preventDefault(); //Verhindert das die seite neugeladen wird, wenn der Formular abgesendet wird
    const regResultDiv = document.getElementById('registerResult');

    //Input felder holen und unnötige leerzeichen entfernen
    const name = (
      document.getElementById('regName') as HTMLInputElement
    ).value.trim();
    const email = (
      document.getElementById('regEmail') as HTMLInputElement
    ).value.trim();
    const pass = (
      document.getElementById('regPass') as HTMLInputElement
    ).value.trim();
    const group = (
      document.getElementById('regGroup') as HTMLInputElement
    ).value.trim();

    try {
      if (regResultDiv) regResultDiv.textContent = 'Registering ...';
      const response = await ApiService.registerUser(name, email, pass, group);

      if (response.success) {
        if (regResultDiv) {
          regResultDiv.textContent = `Registration successful! New user ID: ${response.id}`;
        }
      } else {
        if (regResultDiv) {
          regResultDiv.textContent = `Registration failed: ${
            response.error || 'Unknown error'
          }`;
        }
      }
    } catch (err) {
      console.error('handleRegister Error:', err);
      if (regResultDiv) regResultDiv.textContent = 'Network or server error.';
    }
  }

  // --------------------------------------------------------------------------
  // Task 2: Handle Login
  // --------------------------------------------------------------------------
  private async handleLogin(event: Event) {
    event.preventDefault();
    const loginResultDiv = document.getElementById('loginResult');

    const usernameOrEmail = (
      document.getElementById('loginUser') as HTMLInputElement
    ).value.trim();
    const password = (
      document.getElementById('loginPass') as HTMLInputElement
    ).value.trim();

    try {
      if (loginResultDiv) loginResultDiv.textContent = 'Logging in ...';

      const response = await ApiService.loginUser(usernameOrEmail, password);
      if (response.token) {
        // Save the token in StateManager
        StateManager.setToken(response.token);

        //hide login and showchat section
        const chatDiv = document.getElementById('chatDiv');
        chatDiv?.classList.remove('d-none');

        const logDiv = document.getElementById('logDiv');
        logDiv?.classList.add('d-none');

        if (loginResultDiv) {
          loginResultDiv.textContent = `Login successful! Token: ${response.token}`;
        }
        (event.target as HTMLFormElement).reset();
      } else {
        if (loginResultDiv) {
          loginResultDiv.textContent = `Login failed: ${
            response.error || 'Unknown error'
          }`;
        }
      }
    } catch (err) {
      console.error('handleLogin Error:', err);
      if (loginResultDiv)
        loginResultDiv.textContent = 'Network or server error.';
    }
  }

  // --------------------------------------------------------------------------
  // Task 3: Get Users
  // --------------------------------------------------------------------------
  private async handleGetUsers() {
    const usersList = document.getElementById(
      'userListContainer',
    ) as HTMLElement;
    if (usersList) usersList.innerHTML = '';

    try {
      const data = await ApiService.getUsers();

      if (Array.isArray(data)) {
        if (usersList) {
          usersList.innerHTML = '';
          data.forEach((user: User) => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-action';
            li.textContent = `${user.name} (ID: ${user.id}) • Group ${user.group_id}`;
            li.style.cursor = 'pointer';
            usersList.appendChild(li);
            li.addEventListener('click', () => this.selectUser(user.id));
          });
        }
      } else {
        if (usersList) {
          usersList.innerHTML = `<div class="text-danger">Error: ${data.error}</div>`;
        }
      }
    } catch (err) {
      console.error('handleGetUsers Error:', err);
      if (usersList)
        usersList.innerHTML =
          '<div class="text-danger">Network or server error while loading users.</div>';
    }
  }

  // --------------------------------------------------------------------------
  // Task 4: Send Message
  // --------------------------------------------------------------------------
  private async handleSendMessage(event: Event) {
    event.preventDefault();
    const sendResultDiv = document.getElementById('sendResult');

    if (!this.selectedUserId) {
      if (sendResultDiv) {
        sendResultDiv.textContent = 'No user selected!';
      }
      return;
    }
    const message = (
      document.getElementById('messageText') as HTMLInputElement
    ).value.trim();

    try {
      if (sendResultDiv) sendResultDiv.textContent = 'Sending message ...';
      const response = await ApiService.sendMessage(
        this.selectedUserId,
        message,
      );
      if (response.success) {
        if (sendResultDiv) {
          this.loadMessages();
          sendResultDiv.textContent = 'Message successfully sent!';
        }
        (event.target as HTMLFormElement).reset();
      } else {
        if (sendResultDiv) {
          sendResultDiv.textContent = `Error: ${
            response.error || 'Unknown error'
          }`;
        }
      }
    } catch (err) {
      console.error('handleSendMessage Error:', err);
      if (sendResultDiv)
        sendResultDiv.textContent =
          'Network or server error while sending message.';
    }
  }

  //Show users chat
  private async selectUser(userId: string) {
    this.selectedUserId = userId;
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval);
    }

    // Direkt Nachrichten anzeigen
    await this.loadMessages();

    // Polling alle 3 Sekunden
    this.messagePollingInterval = window.setInterval(() => {
      this.loadMessages();
    }, 3000);
  }
  private async loadMessages() {
    const chatWindow = document.getElementById('chatMessages');
    if (!this.selectedUserId || !chatWindow) return;

    if (chatWindow) chatWindow.innerHTML = 'Loading messages...';

    const messages = await ApiService.getConversation(this.selectedUserId);
    console.log('logging message');
    console.log(messages);
    try {
      const messages = await ApiService.getConversation(this.selectedUserId);
      console.log(messages);
      if (Array.isArray(messages)) {
        if (chatWindow) {
          chatWindow.innerHTML = '';
          messages.forEach((msg) => {
            const p = document.createElement('p');
            p.textContent = `${
              msg.sender_id === this.selectedUserId ? 'Them' : 'You'
            }: ${msg.message}`;
            chatWindow.appendChild(p);
          });
          chatWindow.scrollTop = chatWindow.scrollHeight;
        }
      } else {
        if (chatWindow) chatWindow.innerHTML = `Error: ${messages.error}`;
      }
    } catch (err) {
      console.error('selectUser Error:', err);
      if (chatWindow) chatWindow.innerHTML = 'Error loading conversation.';
    }
  }
}
