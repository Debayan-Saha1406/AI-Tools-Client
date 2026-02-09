import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-translator',
  templateUrl: './translator.component.html',
  styleUrls: ['./translator.component.css'],
  imports: [FormsModule]
})
export class TranslatorComponent {
  inputText = '';
  translatedText = '';
  fromLang = 'en';
  toLang = 'fr';
  loading = false;

  languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' },
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  translate() {
     this.loading = true;
    if (!this.inputText || !this.fromLang || !this.toLang) {
      alert('Please fill everything!');
      return;
    }

    this.http.post<{ translatedText: string }>('http://localhost:3000/api/translate', {
      text: this.inputText,
      from: this.fromLang, 
      to: this.toLang
    })
    .subscribe({
      next: (res) => {
        this.translatedText = res.translatedText;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Translation failed 😢');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
