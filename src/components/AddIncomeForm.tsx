import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useIncomes, CreateIncome } from '@/hooks/useIncomes';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';

type Props = {
	onSuccess?: () => void;
};

const frequencyOptions = [
	{ value: 'once', label: 'Una vez' },
	{ value: 'weekly', label: 'Semanal' },
	{ value: 'biweekly', label: 'Quincenal' },
	{ value: 'monthly', label: 'Mensual' },
	{ value: 'quarterly', label: 'Trimestral' },
	{ value: 'yearly', label: 'Anual' },
];

export default function AddIncomeForm({ onSuccess }: Props) {
	const { addIncome } = useIncomes();
	const { getIncomeCategories } = useFinancialCategories();
	const categories = getIncomeCategories();
  const { profile } = useUserProfile();
  const defaultCurrency = profile?.primary_display_currency || 'USD';

		const [form, setForm] = useState({
		name: '',
		amount: '',
		frequency: 'monthly',
		start_date: new Date().toISOString().slice(0, 10),
		category_id: 'none' as string,
			currency: defaultCurrency as string,
		description: '',
		is_active: true,
		payment_day: '' as string | number | null,
	});
	const [submitting, setSubmitting] = useState(false);

		const onChange = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name || !form.amount) {
			toast.error('Completa nombre y monto');
			return;
		}
		setSubmitting(true);
		try {
					const payload: Omit<CreateIncome, 'user_id'> = {
				name: form.name,
				amount: Number(form.amount),
				frequency: form.frequency as CreateIncome['frequency'],
				start_date: form.start_date,
						category_id: form.category_id === 'none' ? null : (form.category_id as string),
				description: form.description || null,
				is_active: form.is_active,
				payment_day: form.payment_day ? Number(form.payment_day) : null,
				end_date: null,
				notes: null,
				tags: [`currency:${form.currency}`],
				updated_at: null,
				created_at: null,
			};
			const created = await addIncome(payload);
			if (created) {
				toast.success('Ingreso creado');
				onSuccess?.();
				setForm({
					name: '', amount: '', frequency: 'monthly', start_date: new Date().toISOString().slice(0, 10),
					category_id: 'none', currency: defaultCurrency, description: '', is_active: true, payment_day: ''
				});
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Agregar ingreso</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Nombre</Label>
							<Input value={form.name} onChange={e => onChange('name', e.target.value)} placeholder="Salario, Freelance..." />
						</div>
						<div className="space-y-2">
							<Label>Monto</Label>
							<Input type="number" step="0.01" value={form.amount} onChange={e => onChange('amount', e.target.value)} placeholder="0.00" />
						</div>
						<div className="space-y-2">
							<Label>Frecuencia</Label>
							<Select value={form.frequency} onValueChange={v => onChange('frequency', v)}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent className="bg-background border shadow-lg">
									{frequencyOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Moneda</Label>
							<Select value={form.currency} onValueChange={v => onChange('currency', v)}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent className="bg-background border shadow-lg">
									{['USD','EUR','ARS','GBP','CAD','AUD','JPY','CHF','SEK','NOK','DKK','BRL','MXN'].map(c => (
										<SelectItem key={c} value={c}>{c}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Fecha de inicio</Label>
							<Input type="date" value={form.start_date} onChange={e => onChange('start_date', e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label>Categoría</Label>
							<Select value={form.category_id} onValueChange={v => onChange('category_id', v)}>
								<SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
								<SelectContent className="bg-background border shadow-lg">
									<SelectItem value="none">Sin categoría</SelectItem>
									{categories.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Día de pago (opcional)</Label>
							<Input type="number" min={1} max={31} value={form.payment_day as string} onChange={e => onChange('payment_day', e.target.value)} />
						</div>
						<div className="space-y-2 md:col-span-2">
							<Label>Descripción</Label>
							<Input value={form.description} onChange={e => onChange('description', e.target.value)} placeholder="Detalle opcional" />
						</div>
						<div className="flex items-center gap-2">
							<Checkbox id="is_active" checked={form.is_active} onCheckedChange={v => onChange('is_active', Boolean(v))} />
							<Label htmlFor="is_active">Activo</Label>
						</div>
					</div>
					<div className="flex gap-2 justify-end">
						<Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
