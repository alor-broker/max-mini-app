import { Injectable } from '@angular/core';
import { PortfolioPositionsService } from "./portfolio-positions.service";
import { PortfolioTradesService } from "./portfolio-trades.service";
import { PortfolioOrdersService } from "./portfolio-orders.service";
import { PortfolioSummaryService } from "./portfolio-summary.service";

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  constructor(
    private readonly positionsService: PortfolioPositionsService,
    private readonly tradesService: PortfolioTradesService,
    private readonly ordersService: PortfolioOrdersService,
    private readonly summaryService: PortfolioSummaryService
  ) {
  }

  get positions(): PortfolioPositionsService {
    return this.positionsService;
  }

  get trades(): PortfolioTradesService {
    return this.tradesService;
  }

  get orders(): PortfolioOrdersService {
    return this.ordersService;
  }

  get summary():PortfolioSummaryService {
    return this.summaryService;
  }
}
