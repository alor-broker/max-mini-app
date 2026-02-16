import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InstrumentIconSourceService {
  constructor() {
  }

  getIconUrl(symbol: string): string {
    return `https://storage.alorbroker.ru/icon/${symbol}.png`;
  }
}
