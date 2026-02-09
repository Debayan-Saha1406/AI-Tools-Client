import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient) {}

  sendMessageStream(text: string) {
    return fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
  }
  sendMessage(message: string) {
    return firstValueFrom(
      this.http.post<{ result: string }>('http://localhost:3000/api/chat', { message }),
    );
  }
}
