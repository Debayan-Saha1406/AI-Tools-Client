import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { ReviewSummarizerComponent } from './review-summarizer/review-summarizer.component';
import { TranslatorComponent } from './translator/translator.component';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat', component: ChatComponent },
  { path: 'review-summarizer', component: ReviewSummarizerComponent },
  { path: 'translator', component: TranslatorComponent },
  { path: '**', redirectTo: 'chat' }
];
