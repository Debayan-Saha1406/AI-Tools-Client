import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MarkdownModule } from 'ngx-markdown';
import { ChatService } from '../service/chat-service';

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

export interface PdfLike {
  numPages?: number;
  getPage(page: number): Promise<any>;
}

@Component({
  selector: 'app-pdf-summarizer',
  imports: [CommonModule, FormsModule, MarkdownModule, PdfViewerModule],
  templateUrl: './pdf-summarizer.component.html',
  styleUrl: './pdf-summarizer.component.css',
})
export class PdfSummarizerComponent implements OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;
  public userInput = '';
  public loading = false;
  private readonly maxPagesToParse = 10; // limit pages parsed in-browser to avoid huge payloads
  // `ng2-pdf-viewer` accepts a URL string or `Uint8Array` for binary data
  public pdfSrc: string | Uint8Array | null = null;
  public selectedFileName?: string;

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this.chatService.messages = [];
  }

  // expose the shared messages array from the service for templates
  public get messages() {
    return this.chatService.messages;
  }
  // called by <pdf-viewer> after the document is loaded
  // called by <pdf-viewer> after the document is loaded
  public async onPdfLoad(pdf: PdfLike): Promise<void> {
    if (this.chatService.pendingBotIndex === null) return;

    const placeholderIndex = this.chatService.pendingBotIndex as number;
    try {
      const extracted = await this.extractTextFromPdf(pdf);
      const response = await this.chatService.summarizePdf(extracted);
      this.chatService.updateBotMessage(placeholderIndex, response?.result ?? '');
    } catch (err: unknown) {
      const msgErr = (err as Error)?.message ?? String(err ?? 'Unknown error');
      this.chatService.updateBotMessage(placeholderIndex, `❌ Error processing PDF: ${msgErr}`);
    } finally {
      this.loading = false;
      this.chatService.pendingBotIndex = null;
      this.revokePdfSrc();
      this.cdr.detectChanges();
      this.chatService.scrollToBottom(this.scrollContainer);
    }
  }

  private async extractTextFromPdf(pdf: PdfLike): Promise<string> {
    const numPages = Math.min(pdf.numPages ?? 0, this.maxPagesToParse);
    let extracted = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = (textContent.items || []).map((s: any) => s?.str ?? '').join(' ');
      extracted += `\n\n${pageText}`;
    }

    if ((pdf.numPages ?? 0) > this.maxPagesToParse) {
      extracted += `\n\n[Truncated: ${pdf.numPages! - this.maxPagesToParse} more pages]`;
    }

    return extracted.trim();
  }

  private revokePdfSrc(): void {
    try {
      if (typeof this.pdfSrc === 'string') {
        URL.revokeObjectURL(this.pdfSrc);
      }
    } catch (e) {
      // ignore
    } finally {
      this.pdfSrc = null;
    }
  }

  public async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileName = input.files[0].name;
    }

    const file = input?.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    this.chatService.addUserMessage(`Uploaded file: ${file.name}`);
    this.loading = true;

    const placeholderIndex = this.chatService.addBotPlaceholder();
    this.chatService.scrollToBottom(this.scrollContainer);

    try {
      // create object URL for pdf-viewer to load
      this.pdfSrc = URL.createObjectURL(file);
    } catch (err: unknown) {
      const msgErr = (err as Error)?.message ?? String(err ?? 'Unknown error');
      this.chatService.updateBotMessage(placeholderIndex, `❌ Error loading PDF: ${msgErr}`);
      this.loading = false;
      this.chatService.pendingBotIndex = null;
      try {
        if (input) input.value = '';
      } catch {}
      this.cdr.detectChanges();
      this.chatService.scrollToBottom(this.scrollContainer);
    }
  }
}
