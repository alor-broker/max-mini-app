import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrdersRefreshService {

  private readonly refresh = new BehaviorSubject(null);
  refresh$  = this.refresh.asObservable();

  constructor() { }

  refreshOrders() {
    this.refresh.next(null);
  }
}
