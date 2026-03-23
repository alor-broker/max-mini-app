import React, { createContext, useContext, useState, useCallback } from 'react';
import { ClientPortfolio, PortfolioOrder, PortfolioTrade } from '../api/services';

// ── Modal type definitions ──────────────────────────────────────────────────

export type ModalType = 'createOrder' | 'orderDetail' | 'tradeDetail' | 'operationsHistory';

export interface CreateOrderModalData {
  symbol?: string;
  portfolio?: ClientPortfolio;
}

export interface OrderDetailModalData {
  order: PortfolioOrder;
}

export interface TradeDetailModalData {
  trade: PortfolioTrade;
}

export interface OperationsHistoryModalData {
  portfolio?: ClientPortfolio;
}

export type ModalDataMap = {
  createOrder: CreateOrderModalData;
  orderDetail: OrderDetailModalData;
  tradeDetail: TradeDetailModalData;
  operationsHistory: OperationsHistoryModalData;
};

interface ModalEntry<T extends ModalType = ModalType> {
  type: T;
  data: ModalDataMap[T];
}

// ── Context value ───────────────────────────────────────────────────────────

interface ModalContextValue {
  /** The full modal stack (bottom → top). Empty = no modal open. */
  modalStack: ModalEntry[];
  /** Push a new modal onto the stack. */
  openModal: <T extends ModalType>(type: T, data: ModalDataMap[T]) => void;
  /** Pop the top-most modal. */
  closeModal: () => void;
  /** Close the entire stack at once (e.g. after order submit). */
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────────────────────

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalStack, setModalStack] = useState<ModalEntry[]>([]);

  const openModal = useCallback(<T extends ModalType>(type: T, data: ModalDataMap[T]) => {
    setModalStack(prev => [...prev, { type, data } as ModalEntry]);
  }, []);

  const closeModal = useCallback(() => {
    setModalStack(prev => prev.slice(0, -1));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStack([]);
  }, []);

  return (
    <ModalContext.Provider value={{ modalStack, openModal, closeModal, closeAllModals }}>
      {children}
    </ModalContext.Provider>
  );
};

// ── Hook ────────────────────────────────────────────────────────────────────

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within <ModalProvider>');
  return ctx;
}
