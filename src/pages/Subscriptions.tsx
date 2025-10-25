// Removed Navigate redirect; this page now renders the Subscriptions view

import { useSubscriptionsView } from "@/hooks/useSubscriptionsView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'ARS',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

const Subscriptions = () => {
	const subsApi = useSubscriptionsView();

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">🧩 Suscripciones</h1>
					<p className="text-gray-600 mt-1">Controlá tus suscripciones: próxima renovación, medio de pago y usuario</p>
				</div>
				<div className="grid grid-cols-2 gap-6">
					<div className="text-right">
						<div className="text-sm text-gray-600">Activas</div>
						<div className="text-2xl font-bold">{subsApi.activeCount}</div>
					</div>
					<div className="text-right">
						<div className="text-sm text-gray-600">Compromiso mensual</div>
						<div className="text-2xl font-bold">{formatCurrency(subsApi.totalMonthly)}</div>
					</div>
				</div>
			</div>

			{/* Próximas renovaciones */}
			{subsApi.upcoming7.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Próximas renovaciones (7 días)</CardTitle>
						<CardDescription>Suscripciones que se renuevan pronto</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{subsApi.upcoming7.map(s => {
								const due = new Date(s.nextRenewalDate);
								const today = new Date();
								const diff = Math.ceil((due.getTime()-today.getTime())/(1000*60*60*24));
								return (
									<div key={`upcoming-${s.id}`} className="flex items-center justify-between p-3 border rounded-lg">
										<div className="flex items-center gap-3">
											<span className="text-xl">📦</span>
											<div>
												<div className="font-medium">{s.serviceName}</div>
												<div className="text-xs text-gray-500">{s.cycle}</div>
											</div>
										</div>
										<div className="text-right">
											<div className="font-semibold">{formatCurrency(s.amountPerCycle)} {s.currency}</div>
											<Badge variant={diff <= 2 ? 'destructive' : 'secondary'}>
												{diff === 0 ? 'Hoy' : diff === 1 ? 'Mañana' : `${diff} días`}
											</Badge>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Listado */}
			<Card>
				<CardHeader>
					<CardTitle>Suscripciones</CardTitle>
					<CardDescription>Tus servicios y su información de control</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{subsApi.subscriptions.map(s => (
							<Card key={s.id} className="border rounded-lg">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg flex items-center gap-2">
												<span>📦</span>
												{s.serviceName}
											</CardTitle>
											<CardDescription className="capitalize">{s.cycle}</CardDescription>
										</div>
										<Badge>{s.status}</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<div className="text-gray-600">Costo</div>
											<div className="font-semibold">{formatCurrency(s.amountPerCycle)} {s.currency}</div>
										</div>
										<div>
											<div className="text-gray-600">Próx. renovación</div>
											<div className="font-semibold">{new Date(s.nextRenewalDate).toLocaleDateString('es-AR')}</div>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<div className="text-gray-600">Medio de pago</div>
											<div className="font-semibold">
												{s.payment?.bank ? `${s.payment.bank} •••• ${s.payment.cardLast4}` : (s.payment?.kind || '—')}
											</div>
										</div>
										<div>
											<div className="text-gray-600">Mensual equivalente</div>
											<div className="font-semibold">{formatCurrency(s.monthlyEquivalent)} {s.currency}</div>
										</div>
									</div>
									<div className="space-y-1">
										<Label htmlFor={`user-${s.id}`}>Usuario (opcional)</Label>
										<Input id={`user-${s.id}`} defaultValue={s.username || ''} onBlur={(e) => subsApi.setUsername(s.id, e.target.value)} placeholder="tu usuario en el servicio" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default Subscriptions;
