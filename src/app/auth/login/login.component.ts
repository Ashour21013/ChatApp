import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SignalService } from '../../services/signal.service';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(
    private apiService: ApiService,
    private signalService: SignalService,
    private router: Router,
    private authService: AuthServiceService,
    private socketService: SocketService
  ) {}

  textToShow: string = '';
  inputFeld: string = '';
  password: string = '';
  saveLoginData: boolean = false;

  async changeTextToshow() {
    this.textToShow = 'Logging in...';

    try {
      const response = await this.apiService.loginUser(
        this.inputFeld,
        this.password
      );

      if (response.token && response.id) {
        this.textToShow = `Login successful! User ID: ${response.id}`;
        console.log('login success');

        this.signalService.setisLoggedOn(true);

        //token und id mit signal speichern
        this.signalService.setToken(response.token);
        this.signalService.setId(response.id);

        //save in localstorage
        if (this.saveLoginData) {
          this.authService.setToken(response.token);
          this.authService.setUserId(response.id);
        } else {
          this.authService.setToken(response.token, false);
          this.authService.setUserId(response.id, false);
        }

        this.router.navigate(['/messages']);
      } else {
        this.textToShow = `Login failed: ${response.error || 'Unknown error'}`;
      }
    } catch (error) {
      console.error('Error during login:', error);
      this.textToShow = 'An unexpected error occurred.';
    }
  }
  private loadLoginDataFromLocalStorage() {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id');
    console.log('from localstorage:');
    console.log(token);

    if (token && id) {
      this.signalService.setToken(token);
      this.signalService.setId(id);
      console.log('Token und ID aus localStorage geladen');
      this.router.navigate(['/messages']);
    }
  }

  ngOnInit(): void {
    this.loadLoginDataFromLocalStorage();
  }
}
