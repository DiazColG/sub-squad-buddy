import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddVariableExpenseForm from '@/components/AddVariableExpenseForm';
import AddRecurringExpenseForm from '@/components/AddRecurringExpenseForm';
import AddInstallmentExpenseForm from '@/components/AddInstallmentExpenseForm';
import AddSubscriptionForm from '@/components/AddSubscriptionForm';

export default function AddExpenseTabs({ onClose }: { onClose?: () => void }) {
  return (
    <div className="bg-background border rounded-lg p-4">
      <Tabs defaultValue="variable" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="variable">Variable</TabsTrigger>
          <TabsTrigger value="recurrente">Recurrente</TabsTrigger>
          <TabsTrigger value="cuotas">Cuotas</TabsTrigger>
          <TabsTrigger value="suscripcion">Suscripción</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="variable">
            <AddVariableExpenseForm onSuccess={onClose} />
          </TabsContent>
          <TabsContent value="recurrente">
            <AddRecurringExpenseForm onSuccess={onClose} />
          </TabsContent>
          <TabsContent value="cuotas">
            <AddInstallmentExpenseForm onSuccess={onClose} />
          </TabsContent>
          <TabsContent value="suscripcion">
            <AddSubscriptionForm onSubmit={async () => { /* El propio formulario ya refleja en gastos si está activado */ }} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
