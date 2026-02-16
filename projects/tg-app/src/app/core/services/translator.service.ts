import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HashMap, TranslocoService } from "@jsverse/transloco";
import { map } from "rxjs/operators";
import { getTranslationPath } from "../utils/tranlation-helper";

export type TranslatorFn = (key: string[], params?: HashMap) => string;

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {

  constructor(
    private readonly translocoService: TranslocoService
  ) { }

  getTranslator(scope: string): Observable<TranslatorFn> {
    const scopePath = scope.length > 0 ? scope + '/' : '';

    return this.translocoService.selectTranslate(
      '',
      {},
      scope.length > 0 ? { scope } : undefined
    ).pipe(
      map(() =>
        (key: string[], params?: HashMap) =>
          this.translocoService.translate(
            getTranslationPath(
              scopePath ? [ scopePath ] : [],
              key
            ),
            params
          )
      )
    );
  }
}
