import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../service/chat-service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  messages: { role: 'user' | 'bot'; text: string }[] = [];
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;
  userInput = '';
  loading = false;

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
  ) {}

  scrollToBottom() {
    setTimeout(() => {
      const el = this.scrollContainer?.nativeElement;
      if (el) {
       el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  async send() {
  if (!this.userInput.trim() || this.loading) return;

  const userText = this.userInput;

  // push user message
  this.messages.push({ role: 'user', text: userText });
  this.scrollToBottom();

  this.userInput = '';
  this.loading = true;

  // placeholder bot message
  const msg: { role: 'user' | 'bot'; text: string } = {
    role: 'bot',
    text: '',
  };

  this.messages.push(msg);
  this.scrollToBottom();

  try {
    const response = await this.chatService.sendMessage(userText);
    msg.text = response.result; // <-- backend sends { result: ... }

  } catch (err) {
    msg.text = '❌ Error getting response';
    console.error(err);
  } finally {
    this.loading = false;
    this.cdr.detectChanges();
    this.scrollToBottom();
  }
}

  // async send() {
  //   if (!this.userInput.trim() || this.loading) return;

  //   const userText = this.userInput;

  //   // push user message
  //   this.messages.push({ role: 'user', text: userText });
  //   this.scrollToBottom();
  //   this.userInput = '';
  //   this.loading = true;

  //   // placeholder bot message
  //   const msg: { role: 'user' | 'bot'; text: string } = {
  //     role: 'bot',
  //     text: '',
  //   };

  //   this.messages.push(msg);
  //   this.scrollToBottom();

  //   const response = await this.chatService.sendMessageStream(userText);
    
  //   // const reader = response.body!.getReader();
  //   // const decoder = new TextDecoder();

  //   // let buffer = '';

  //   // while (true) {
  //   //   const { value, done } = await reader.read();
  //   //   if (done) break;

  //   //   buffer += decoder.decode(value, { stream: true });

  //   //   const parts = buffer.split('\n');
  //   //   buffer = parts.pop()!; // keep partial JSON

  //   //   for (const line of parts) {
  //   //     if (!line.trim()) continue;

  //   //     const obj = JSON.parse(line);

  //   //     if (obj.thinking) {
  //   //       msg.text += obj.thinking;
  //   //     } else if (obj.response) {
  //   //       msg.text += obj.response;
  //   //     }

  //   //     if (obj.done) {
  //   //       this.loading = false;
  //   //     }

  //   //     this.cdr.detectChanges();
  //   //   }
  //   // }

  //   this.loading = false;
  //   this.cdr.detectChanges();
  // }
}
