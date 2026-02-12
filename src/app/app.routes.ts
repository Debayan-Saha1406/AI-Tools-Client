import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { ReviewSummarizerComponent } from './review-summarizer/review-summarizer.component';
import { TranslatorComponent } from './translator/translator.component';
import { PdfSummarizerComponent } from './pdf-summarizer/pdf-summarizer.component';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  {
    path: 'chat/:sessionId',
    component: ChatComponent,
  },
  { path: 'chat', component: ChatComponent },
  { path: 'review-summarizer', component: ReviewSummarizerComponent },
   { path: 'pdf-summarizer', component: PdfSummarizerComponent },
  { path: 'translator', component: TranslatorComponent },
  { path: '**', redirectTo: 'chat' },
];
