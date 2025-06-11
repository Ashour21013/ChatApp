import { Component, effect } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SignalService } from '../services/signal.service';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent {
  id: string = '';

  constructor(private signalService: SignalService) {
    effect(() => {
      this.id = signalService.getId();
    });
  }

  logout() {
    this.signalService.setId('');
    this.signalService.setToken('');
    this.signalService.setisLoggedOn(false);
    localStorage.clear();
  }
}
