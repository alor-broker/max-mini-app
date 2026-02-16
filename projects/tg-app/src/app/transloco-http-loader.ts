import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Translation } from "@jsverse/transloco";

@Injectable({
  providedIn: 'root'
})
export class TranslocoHttpLoader {

  private http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }}
