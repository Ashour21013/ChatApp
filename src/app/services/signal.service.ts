import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SignalService {
  token: WritableSignal<string> = signal<string>(
    localStorage.getItem('token') ?? ''
  );

  setToken(text: string) {
    this.token.set(text);
  }

  getToken(): string {
    return this.token();
  }

  id: WritableSignal<string> = signal<string>(
    localStorage.getItem('userid') ?? ''
  );

  setId(text: string) {
    this.id.set(text);
  }

  getId(): string {
    return this.id();
  }

  reciverId: WritableSignal<string> = signal<string>('');
  setReciverId(text: string) {
    this.reciverId.set(text);
  }

  getREciverId(): string {
    return this.reciverId();
  }

  isLoggedOn: WritableSignal<boolean> = signal<boolean>(false);
  setisLoggedOn(flag: boolean) {
    this.isLoggedOn.set(flag);
  }

  getisLoggedOn(): boolean {
    return this.isLoggedOn();
  }
}
