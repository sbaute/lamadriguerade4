import { Component, inject, NgZone, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  // Form Fields
  email = '';
  password = '';
  errorMessage = '';
  isLoading = signal<boolean>(false);
  loginSubmitted = false;
  isAuthCredentialsError = false;

  isEmailInputInvalid(input: any): boolean {
    const isSubmittedOrTouched = this.loginSubmitted || input.dirty || input.touched;
    if (!isSubmittedOrTouched) return false;
    
    if (!this.email) {
      return this.loginSubmitted;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(this.email);
  }

  isPasswordInputInvalid(input: any): boolean {
    const isSubmittedOrTouched = this.loginSubmitted || input.dirty || input.touched;
    if (!isSubmittedOrTouched) return false;
    
    if (!this.password) {
      return this.loginSubmitted;
    }
    return this.password.length < 6;
  }

  onInputChange(): void {
    this.isAuthCredentialsError = false;
    this.errorMessage = '';
  }

  async onSubmit(): Promise<void> {
    this.loginSubmitted = true;
    this.errorMessage = '';
    this.isAuthCredentialsError = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = this.email && emailRegex.test(this.email);
    const isPasswordValid = this.password && this.password.length >= 6;

    if (!isEmailValid || !isPasswordValid) {
      this.errorMessage = 'Por favor corrige los errores del formulario.';
      return;
    }

    this.isLoading.set(true);

    try {
      await this.authService.login(this.email, this.password);
      this.ngZone.run(() => {
        this.router.navigate(['/admin']);
      });
    } catch (err: any) {
      this.ngZone.run(() => {
        if (
          err.code === 'auth/user-not-found' || 
          err.code === 'auth/wrong-password' || 
          err.code === 'auth/invalid-credential'
        ) {
          this.isAuthCredentialsError = true;
          this.errorMessage = 'El correo electrónico o la contraseña pueden ser incorrectos.';
        } else {
          this.errorMessage = err.message || 'Ocurrió un error al iniciar sesión.';
        }
      });
    } finally {
      this.ngZone.run(() => {
        this.isLoading.set(false);
      });
    }
  }
}
