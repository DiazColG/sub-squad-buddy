import { useMemo, useCallback } from 'react';
import { useExpenses, type ExpenseRow } from '@/hooks/useExpenses';
import { useCards } from '@/hooks/useCards';

export interface SubscriptionViewItem {
  id: string; // template id acts as group id
  serviceName: string;
  cycle: 'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Annually' | 'Weekly' | 'Unknown';
  currency: string;
  amountPerCycle: number; // nominal in original currency
  monthlyEquivalent: number; // normalized to monthly in original currency
  nextRenewalDate: string; // YYYY-MM-DD
  payment: { kind: string; cardLast4?: string; bank?: string } | null;
  status: 'active' | 'paused' | 'cancelled';
  username?: string;
  notes?: string;
  instances: Array<{ date: string; amount: number; currency: string }>;
}

const hasTag = (e: ExpenseRow, tag: string) => Array.isArray(e.tags) && e.tags.includes(tag);
const getTagValue = (e: ExpenseRow, prefix: string) => {
  if (!Array.isArray(e.tags)) return undefined;
  const found = e.tags.find(t => t.startsWith(prefix));
  return found ? found.substring(prefix.length) : undefined;
};

const normalizeMonthly = (amount: number, cycle: string) => {
  switch (cycle) {
    case 'Annually': return amount / 12;
    case 'Quarterly': return amount / 3;
    case 'Semi-Annually': return amount / 6;
    case 'Weekly': return (amount * 52) / 12;
    default: return amount;
  }
};

export function useSubscriptionsView() {
  const { expenses, updateExpense } = useExpenses();
  const { cards } = useCards();

  const templates = useMemo(() => (
    (expenses || []).filter(e => Boolean(e.is_recurring) && hasTag(e, 'type:subscription'))
  ), [expenses]);

  const subs = useMemo<SubscriptionViewItem[]>(() => {
    const today = new Date();
    const toYmd = (d: Date) => d.toISOString().slice(0,10);
    const items: SubscriptionViewItem[] = [];
    for (const t of templates) {
      const cycleTag = getTagValue(t, 'source-cycle:');
      const cycle = (cycleTag as SubscriptionViewItem['cycle']) || 'Monthly';
      // Instances derived by recurrence-of:templateId
      const instances = (expenses || []).filter(e =>
        Array.isArray(e.tags) && e.tags.includes('recurrence-instance') && e.tags.includes(`recurrence-of:${t.id}`)
      ).sort((a,b) => (a.transaction_date > b.transaction_date ? -1 : 1));

      // Next renewal from recurring_day
      const day = t.recurring_day && t.recurring_day >= 1 && t.recurring_day <= 31 ? t.recurring_day : 1;
      const next = new Date(today);
      if (today.getDate() > day) next.setMonth(next.getMonth() + 1);
      next.setDate(day);

      const currency = t.currency || 'USD';
      const baseAmount = (t.monthly_amount || t.amount || 0);
      const amountPerCycle = cycle === 'Monthly' ? baseAmount : (t.amount || baseAmount);
      const monthlyEq = t.monthly_amount || normalizeMonthly(amountPerCycle, cycle);

      const card = t.card_id ? cards.find(c => c.id === t.card_id) : undefined;
      const payment = card ? { kind: card.card_type, cardLast4: card.card_last_digits, bank: card.bank_name }
        : (t.payment_method ? { kind: t.payment_method } : null);

      const statusTag = getTagValue(t, 'subscription-status:');
      const status = (statusTag as SubscriptionViewItem['status']) || 'active';
      const username = getTagValue(t, 'subscription-username:');
      const notes = getTagValue(t, 'subscription-notes:');

      items.push({
        id: t.id,
        serviceName: t.name,
        cycle: cycle || 'Unknown',
        currency,
        amountPerCycle: Number(amountPerCycle || 0),
        monthlyEquivalent: Number(monthlyEq || 0),
        nextRenewalDate: toYmd(next),
        payment,
        status,
        username,
        notes,
        instances: instances.map(i => ({ date: i.transaction_date, amount: i.amount, currency: i.currency || currency }))
      });
    }
    // Sort by next renewal asc
    return items.sort((a,b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate));
  }, [templates, expenses, cards]);

  const setUsername = useCallback(async (templateId: string, username: string) => {
    const t = templates.find(x => x.id === templateId);
    if (!t) return undefined;
    const newTags = [
      ...(t.tags || []).filter(tag => !tag.startsWith('subscription-username:')),
      ...(username ? [`subscription-username:${username}`] : []),
    ];
    return updateExpense(templateId, { tags: newTags });
  }, [templates, updateExpense]);

  // KPIs
  const active = subs.filter(s => s.status === 'active');
  const totalMonthly = active.reduce((sum, s) => sum + (s.monthlyEquivalent || 0), 0);
  const upcoming7 = active.filter(s => {
    const due = new Date(s.nextRenewalDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime())/(1000*60*60*24));
    return diff >= 0 && diff <= 7;
  });

  return { subscriptions: subs, activeCount: active.length, totalMonthly, upcoming7, setUsername };
}
