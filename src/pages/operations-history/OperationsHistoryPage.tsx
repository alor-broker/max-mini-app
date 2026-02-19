import React, { useEffect, useMemo, useState } from 'react';
import { Button, CellList, CellSimple, Flex, Spinner, Typography } from '@maxhub/max-ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { storageManager } from '../../utils/storage-manager';
import { ModalPageLayout } from '../../components/ModalPageLayout';
import {
  ClientPortfolio,
  ClientService,
  HistoryItem,
  OperationsHistoryService
} from '../../api/services';

const PAGE_LIMIT = 20;

export const OperationsHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [portfolio, setPortfolio] = useState<ClientPortfolio | null>(null);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const agreementId = portfolio?.agreement ?? '';

  useEffect(() => {
    const state = location.state as { portfolio?: ClientPortfolio };
    if (state?.portfolio) {
      setPortfolio(state.portfolio);
      return;
    }

    if (!user?.clientId || !user?.login) {
      setLoading(false);
      return;
    }

    ClientService.getActivePortfolios(user.clientId, user.login)
      .then(async (data) => {
        if (!data.length) return;

        const savedId = await storageManager.getItem('MAX_APP_SELECTED_PORTFOLIO');
        const selected = savedId ? data.find((p) => p.portfolio === savedId) : undefined;
        setPortfolio(selected ?? data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [location.state, user]);

  const loadHistory = async (nextOffset: number, append: boolean) => {
    if (!agreementId) {
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    try {
      const response = await OperationsHistoryService.getHistory(agreementId, {
        endpoint: 'all',
        limit: PAGE_LIMIT,
        offset: nextOffset,
        searchType: 'moneymove'
      });

      const list = Array.isArray(response?.list) ? response.list : [];
      setItems((prev) => (append ? [...prev, ...list] : list));
      setOffset(nextOffset);
      setHasMore(list.length >= PAGE_LIMIT);
    } catch (error) {
      console.error('Failed to load operations history', error);
      if (!append) setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!agreementId) return;
    setLoading(true);
    loadHistory(0, false);
  }, [agreementId]);

  const onLoadMore = () => {
    setLoadingMore(true);
    loadHistory(offset + PAGE_LIMIT, true);
  };

  const formatter = useMemo(() => (
    new Intl.NumberFormat(i18n.language === 'ru' ? 'ru-RU' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  ), [i18n.language]);

  const getAmount = (item: HistoryItem): number | undefined => {
    if (typeof item.sum === 'number') return item.sum;
    if (typeof item.data?.amount === 'number') return item.data.amount;
    return undefined;
  };

  const getAmountColor = (amount?: number) => {
    if (typeof amount !== 'number') return 'var(--text-primary)';
    if (amount > 0) return '#16a34a';
    if (amount < 0) return '#dc2626';
    return 'var(--text-primary)';
  };

  return (
    <ModalPageLayout
      title={t('history.title', { defaultValue: 'Operations History' })}
    >
      {loading ? (
        <Flex justify="center" style={{ padding: '32px 0' }}>
          <Spinner />
        </Flex>
      ) : items.length === 0 ? (
        <Typography.Body style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
          {t('history.empty', { defaultValue: 'No deposits, withdrawals, or transfers found' })}
        </Typography.Body>
      ) : (
        <CellList mode="island" filled>
          {items.map((item) => {
            const amount = getAmount(item);
            const amountText = typeof amount === 'number'
              ? `${amount > 0 ? '+' : ''}${formatter.format(amount)} ${item.currency ?? item.data?.currency ?? ''}`.trim()
              : '-';

            return (
              <CellSimple
                key={item.id}
                title={item.title || item.subType || t('history.operation', { defaultValue: 'Operation' })}
                subtitle={new Date(item.date).toLocaleString(i18n.language === 'ru' ? 'ru-RU' : 'en-US')}
                after={(
                  <Flex direction="column" gap={2} style={{ alignItems: 'flex-end' }}>
                    <Typography.Body style={{ color: getAmountColor(amount), fontWeight: 700 }}>
                      {amountText}
                    </Typography.Body>
                    <Typography.Label style={{ color: 'var(--text-secondary)' }}>
                      {item.statusName || item.status}
                    </Typography.Label>
                  </Flex>
                )}
              />
            );
          })}
        </CellList>
      )}

      {hasMore && (
        <Button
          onClick={onLoadMore}
          disabled={loadingMore}
          style={{ width: '100%', border: 'none', fontWeight: 600 }}
        >
          {loadingMore ? t('history.loading_more', { defaultValue: 'Loading...' }) : t('common.load_more')}
        </Button>
      )}
    </ModalPageLayout>
  );
};
