import { Injectable, inject, PLATFORM_ID, signal, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { auth } from '../config/firebase.config';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  
  // Store the authenticated User object or null
  currentUser = signal<User | null>(null);

  private initPromise!: Promise<void>;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initPromise = new Promise<void>((resolve) => {
        onAuthStateChanged(auth, (user) => {
          this.ngZone.run(() => {
            this.currentUser.set(user);
          });
          resolve();
        });
      });
    } else {
      this.initPromise = Promise.resolve();
    }
  }

  async ensureInitialized(): Promise<void> {
    await this.initPromise;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Firebase Auth Login Error:', err);
      // Map common Firebase errors to user-friendly messages
      let msg = 'Error al iniciar sesión. Por favor verifica tus credenciales.';
      if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/user-not-found'
      ) {
        msg = 'El correo electrónico o la contraseña son incorrectos.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'El formato del correo electrónico no es válido.';
      } else if (err.code === 'auth/user-disabled') {
        msg = 'Esta cuenta de usuario ha sido deshabilitada.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Demasiados intentos fallidos. Esta cuenta ha sido bloqueada temporalmente. Por favor intenta más tarde.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Error de conexión a internet. Por favor verifica tu red e inténtalo de nuevo.';
      }
      const customError = new Error(msg);
      (customError as any).code = err.code;
      throw customError;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase Auth Logout Error:', err);
      throw err;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
