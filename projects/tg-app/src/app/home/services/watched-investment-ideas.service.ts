import { Injectable } from '@angular/core';
import { StorageService } from "@environment-services-lib";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { StorageKeys } from "../../core/utils/storage-keys";

@Injectable({
  providedIn: 'root'
})
export class WatchedInvestmentIdeasService {

  constructor(
    private readonly storageService: StorageService
  ) { }

  getWatchedIdeasIds(): Observable<number[]> {
    return this.storageService.getItem(StorageKeys.InvestmentIdeasWatchedIdeas)
      .pipe(
        map((ideas: string | null) => ideas == null ? [] : JSON.parse(ideas))
      );
  }

  setWatchedIdeasIds(ids: number[]): void {
    this.storageService.setItem(StorageKeys.InvestmentIdeasWatchedIdeas, JSON.stringify(ids))
      .subscribe();
  }
}
