import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../service/chat-service';
import { Location } from '@angular/common';

export interface Message {
  role: 'user' | 'bot';
  text: string;
}

export interface PdfLike {
  numPages?: number;
  getPage(page: number): Promise<any>;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule, PdfViewerModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})

export class ChatComponent implements OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;
  public userInput: string = '';
  public loading: boolean = false;

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private location: Location,
  ) {}

  ngOnDestroy(): void {
   this.chatService.messages = [];
  }

  // expose the shared messages array from the service for templates
  public get messages() {
    return this.chatService.messages;
  }

  public async send(): Promise<void> {
    const text = this.userInput?.trim();
    if (!text || this.loading) return;

    this.chatService.addUserMessage(text);
    this.userInput = '';

    this.loading = true;
    const placeholderIndex = this.chatService.addBotPlaceholder();

    try {
      const response = await this.chatService.sendMessage(text);
      this.chatService.updateBotMessage(placeholderIndex, response?.result ?? '');
     this.location.replaceState(`/chat/${this.chatService.sessionId}`);
    } catch (err) {
      this.chatService.updateBotMessage(placeholderIndex, '❌ Error getting response');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
      this.chatService.scrollToBottom(this.scrollContainer);
    }
  }
}
  
