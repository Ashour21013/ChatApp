import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('token') || null
  );
  private idSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('userid') || null
  );

  token$ = this.tokenSubject.asObservable();
  userid$ = this.idSubject.asObservable();

  setToken(token: string, persist: boolean = true) {
    if (persist) localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }
  setUserId(userId: string, persist: boolean = true) {
    if (persist) localStorage.setItem('userid', userId);
    this.idSubject.next(userId);
  }
}
