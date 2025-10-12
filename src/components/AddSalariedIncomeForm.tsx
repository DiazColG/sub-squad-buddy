import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useIncomes, CreateIncome } from '@/hooks/useIncomes';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useIncomeReceipts } from '@/hooks/useIncomeReceipts';

type Props = { onSuccess?: () => void };

// Payday rule values for business day logic
const paydayRules = [
	{ value: 'first_bd', label: '1er día hábil' },
	{ value: 'second_bd', label: '2do día hábil' },
	{ value: 'third_bd', label: '3er día hábil' },
	{ value: 'fourth_bd', label: '4to día hábil' },
	{ value: 'fifth_bd', label: '5to día hábil' },
	{ value: 'last_bd', label: 'Último día hábil' },
	{ value: 'second_last_bd', label: 'Anteúltimo día hábil' },
	{ value: 'third_last_bd', label: 'Penúltimo día hábil' },
];

function getNthBusinessDayOfMonth(year: number, monthIndex0: number, n: number) {
	let count = 0;
	for (let d = 1; d <= 31; d++) {
		const date = new Date(year, monthIndex0, d);
		if (date.getMonth() !== monthIndex0) break;
		const day = date.getDay();
		if (day !== 0 && day !== 6) {
			count++;
			if (count === n) return date;
		}
	}
	return new Date(year, monthIndex0 + 1, 0); // fallback: last day of month
}

function getLastKthBusinessDayOfMonth(year: number, monthIndex0: number, k: number) {
	let count = 0;
	for (let d = 31; d >= 1; d--) {
		const date = new Date(year, monthIndex0, d);
		if (date.getMonth() !== monthIndex0) continue;
		const day = date.getDay();
		if (day !== 0 && day !== 6) {
			count++;
			if (count === k) return date;
		}
	}
	return new Date(year, monthIndex0 + 1, 0);
}

function computeBusinessDayDate(year: number, monthIndex0: number, rule: string) {
	switch (rule) {
		case 'first_bd': return getNthBusinessDayOfMonth(year, monthIndex0, 1);
		case 'second_bd': return getNthBusinessDayOfMonth(year, monthIndex0, 2);
		case 'third_bd': return getNthBusinessDayOfMonth(year, monthIndex0, 3);
		case 'fourth_bd': return getNthBusinessDayOfMonth(year, monthIndex0, 4);
		case 'fifth_bd': return getNthBusinessDayOfMonth(year, monthIndex0, 5);
		case 'last_bd': return getLastKthBusinessDayOfMonth(year, monthIndex0, 1);
		case 'second_last_bd': return getLastKthBusinessDayOfMonth(year, monthIndex0, 2);
		case 'third_last_bd': return getLastKthBusinessDayOfMonth(year, monthIndex0, 3);
		default: return getNthBusinessDayOfMonth(year, monthIndex0, 1);
	}
}

export default function AddSalariedIncomeForm({ onSuccess }: Props) {
	const { addIncome } = useIncomes();
	const { profile } = useUserProfile();
	const receiptsApi = useIncomeReceipts();
	const defaultCurrency = profile?.primary_display_currency || 'USD';

	const [form, setForm] = useState({
		employer: '',
		amount: '',
		start_date: new Date().toISOString().slice(0, 10),
		currency: defaultCurrency as string,
		payday_rule: 'last_bd',
		description: '',
	});
	const [submitting, setSubmitting] = useState(false);

	const onChange = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

	const createExpectedReceiptForMonth = async (incomeId: string, baseAmount: number, currency: string, year: number, monthIndex0: number) => {
		const dt = computeBusinessDayDate(year, monthIndex0, form.payday_rule);
		const y = dt.getFullYear();
		const m = String(dt.getMonth() + 1).padStart(2, '0');
		const period = `${y}-${m}`;
		await receiptsApi.upsertReceipt({ income_id: incomeId, amount: baseAmount, currency, received_at: dt.toISOString().slice(0, 10), notes: null, tags: ['expected'] });
		// SAC implicit in June/December: +50% tagged
		if (dt.getMonth() === 5 || dt.getMonth() === 11) {
			const sac = baseAmount * 0.5;
			await receiptsApi.upsertReceipt({ income_id: incomeId, amount: sac, currency, received_at: dt.toISOString().slice(0, 10), notes: null, tags: ['expected', 'SAC'] });
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.employer || !form.amount) {
			toast.error('Completá empleador y monto');
			return;
		}
		setSubmitting(true);
		try {
			const payload: Omit<CreateIncome, 'user_id'> = {
				name: form.employer,
				amount: Number(form.amount),
				frequency: 'monthly',
				start_date: form.start_date,
				description: form.description || null,
				is_active: true,
				payment_day: null, // managed by payday_rule
				end_date: null,
				notes: null,
				tags: [`currency:${form.currency}`, `payday_rule:${form.payday_rule}`, 'status:active'],
				updated_at: null,
				created_at: null,
			};
			const created = await addIncome(payload);
			if (created) {
				// Generate 3 expected receipts starting this month
				const start = new Date();
				const months = [0, 1, 2];
				for (const add of months) {
					const dt = new Date(start.getFullYear(), start.getMonth() + add, 1);
					await createExpectedReceiptForMonth(created.id, Number(form.amount), form.currency, dt.getFullYear(), dt.getMonth());
				}
				toast.success('Ingreso de relación de dependencia creado');
				onSuccess?.();
				setForm({ employer: '', amount: '', start_date: new Date().toISOString().slice(0, 10), currency: defaultCurrency, payday_rule: 'last_bd', description: '' });
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Ingreso en relación de dependencia</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-3">
					<div>
						<Label>Empleador</Label>
						<Input value={form.employer} onChange={e => onChange('employer', e.target.value)} />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<div>
							<Label>Monto</Label>
							<Input type="number" step="0.01" value={form.amount} onChange={e => onChange('amount', e.target.value)} />
						</div>
						<div>
							<Label>Moneda</Label>
							<Select value={form.currency} onValueChange={v => onChange('currency', v)}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent className="bg-background border shadow-lg">
									{['USD','EUR','ARS'].map(ccy => (<SelectItem key={ccy} value={ccy}>{ccy}</SelectItem>))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Inicio</Label>
							<Input type="date" value={form.start_date} onChange={e => onChange('start_date', e.target.value)} />
						</div>
					</div>
					<div>
						<Label>Regla de cobro</Label>
						<Select value={form.payday_rule} onValueChange={v => onChange('payday_rule', v)}>
							<SelectTrigger><SelectValue placeholder="Día hábil" /></SelectTrigger>
							<SelectContent className="bg-background border shadow-lg">
								{paydayRules.map(r => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label>Descripción</Label>
						<Input value={form.description} onChange={e => onChange('description', e.target.value)} />
					</div>
					<div className="flex justify-end">
						<Button type="submit" disabled={submitting}>Guardar</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
