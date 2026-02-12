import { Injectable, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // shared message state used by chat and pdf-summarizer components
  public messages: Array<{ id?: string; role: 'user' | 'bot'; text: string }> = [];
  public pendingBotIndex: number | null = null;
  public sessionId: string = '';
  
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  public addUserMessage(text: string): void {
    this.messages.push({ id: crypto.randomUUID(), role: 'user', text });
    this.scrollToBottom();
  }

  public addBotPlaceholder(): number {
    const index = this.messages.length;
    this.messages.push({ id: crypto.randomUUID(), role: 'bot', text: '' });
    this.pendingBotIndex = index;
    return index;
  }

  public updateBotMessage(index: number, text: string): void {
    if (this.messages[index]) this.messages[index].text = text;
  }

  public scrollToBottom(scrollContainer?: ElementRef<HTMLDivElement>, delay = 0): void {
    setTimeout(() => {
      const el = (scrollContainer as any)?.nativeElement ?? null;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, delay);
  }

  public sendMessageStream(text: string): Promise<Response> {
    return fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
  }

  public sendMessage(message: string): Promise<{ result: string }> {
    this.sessionId = this.getSessionId();
    return firstValueFrom(
      this.http.post<{ result: string }>('http://localhost:3000/api/chat', {
        message,
        sessionId: this.sessionId,
      }),
    );
  }

  private getSessionId(): string {
    let id = sessionStorage.getItem('chat-session-id');

    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('chat-session-id', id);
    }

    return id;
  }

  public summarizePdf(message: string): Promise<{ result: string }> {
    return firstValueFrom(
      this.http.post<{ result: string }>('http://localhost:3000/api/pdf/summarize', {
        message
      }),
    );
  }
}
