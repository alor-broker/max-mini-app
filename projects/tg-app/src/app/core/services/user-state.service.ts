import {
  Injectable,
  OnDestroy
} from '@angular/core';
import { User } from "../models/user.models";
import {
  BehaviorSubject,
  filter
} from "rxjs";
import { map } from "rxjs/operators";

export interface SsoToken {
  refreshToken: string;
  jwt?: string;
}

export interface UserState {
  ssoToken: SsoToken | null;
  user: User | null;
  isExited: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserStateService implements OnDestroy {
  private readonly userState$ = new BehaviorSubject<UserState | null>(null);
  readonly state$ = this.userState$.asObservable();

  readonly user$ = this.userState$.pipe(
    map(s => s?.user),
    filter((user): user is User => user != null)
  );

  ngOnDestroy(): void {
    this.userState$.complete();
  }

  updateState(state: UserState | null) {
    this.userState$.next(state);
  }
}
