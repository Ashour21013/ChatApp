import { Component, effect, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalService } from '../../services/signal.service';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';
import { combineLatest } from 'rxjs';

interface User {
  id: string;
  name: string;
  group_id: string;
}

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.css',
})
export class MessageListComponent implements OnInit {
  token: string = '';
  id: string = '';
  data: User[] = [];
  knownContacts: User[] = [];
  otherContacts: User[] = [];

  constructor(
    private authService: AuthServiceService,
    private signalService: SignalService,
    private apiService: ApiService,
    private router: Router
  ) {}

  async loadUsers() {
    try {
      const response = await this.apiService.getUsers();
      if (Array.isArray(response)) {
        this.data = response;
        this.splitContacts();
      }
    } catch (err) {
      console.error('handleGetUsers Error:', err);
    }
  }

  startChat(reciverid: string) {
    console.log('starting chat with ' + reciverid);
    this.signalService.setReciverId(reciverid);
    //localStorage.setItem('currentReciverId', reciverid);
    this.saveKnownContact(reciverid);
    this.router.navigate(['/chat', reciverid]);
  }

  saveKnownContact(id: string | null) {
    if (!id) return;

    const raw = localStorage.getItem('knownContacts');
    let knownContacts: string[] = raw ? JSON.parse(raw) : [];

    //wert entfernen, damit es wieder am anfang gefügt wird
    knownContacts = knownContacts.filter((contactId) => contactId !== id);

    if (!knownContacts.includes(id)) {
      //wert am anfang speichen
      knownContacts.unshift(id);
      localStorage.setItem('knownContacts', JSON.stringify(knownContacts));
    }
  }
  splitContacts() {
    const raw = localStorage.getItem('knownContacts');
    const knownIds: string[] = raw ? JSON.parse(raw) : [];
    console.log(knownIds);

    this.knownContacts = this.data.filter((user) => knownIds.includes(user.id));

    this.otherContacts = this.data.filter(
      (user) => !knownIds.includes(user.id)
    );
    console.log(this.knownContacts);
    this.data = [];
    this.data = [...this.knownContacts, ...this.otherContacts];
  }

  ngOnInit() {
    console.log(localStorage.getItem('token'));
    // combineLatest wartet auf beide Werte
    combineLatest([
      this.authService.token$,
      this.authService.userid$,
    ]).subscribe(([token, id]) => {
      if (token && id) {
        this.token = token;
        this.id = id;
        console.log('token in messagelist' + id);
        this.signalService.setToken(token);
        this.signalService.setId(id);
        this.signalService.setisLoggedOn(true);
        this.loadUsers();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
