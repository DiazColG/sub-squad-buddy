import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { onboardingTasks } from '@/onboarding/useCases';
import { useIncomes } from '@/hooks/useIncomes';
import { useExpenses, ExpenseRow } from '@/hooks/useExpenses';

export const SmartStart: React.FC = () => {
  const navigate = useNavigate();
  const { incomes } = useIncomes();
  const { expenses } = useExpenses();

  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('smartstart.completed') || '[]';
      return JSON.parse(raw);
    } catch { return []; }
  });

  const saveCompleted = (ids: string[]) => {
    setCompleted(ids);
    try { localStorage.setItem('smartstart.completed', JSON.stringify(ids)); } catch (e) { /* no-op */ }
  };

  const basicSetupDone = useMemo(() => {
    const recurringTemplates = (expenses as ExpenseRow[]).filter((e) => e.is_recurring).length;
    return (incomes?.length || 0) > 0 && recurringTemplates >= 3;
  }, [incomes, expenses]);

  const visibleTasks = useMemo(() => onboardingTasks.filter(t => !completed.includes(t.id)), [completed]);

  if (basicSetupDone || visibleTasks.length === 0) return null;

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle>Comenzá en 2 minutos</CardTitle>
        <CardDescription>Unas tareas rápidas para ver valor ya</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {visibleTasks.map(t => (
            <div key={t.id} className="flex gap-2">
              <Button variant="outline" className="justify-start h-12 flex-1" onClick={() => t.route && navigate(t.route)}>
                {t.label}
              </Button>
              <Button variant="ghost" onClick={() => saveCompleted([...completed, t.id])}>Listo</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartStart;
