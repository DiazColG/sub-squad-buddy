import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useCases } from '@/onboarding/useCases';
import { BookOpen, Search, ArrowRight } from 'lucide-react';

type Section = {
  id: string;
  title: string;
  description: string;
  items: Array<{
    id: string;
    title: string;
    summary: string;
    steps: string[];
    tips?: string[];
    related?: string[]; // use case ids
    quickStart?: { label: string; route: string }[];
  }>;
};

const educationalSections: Section[] = [
  {
    id: 'getting-started',
    title: 'Empezar en 2 minutos',
    description: 'Configurá lo esencial para ver valor de inmediato.',
    items: [
      {
        id: 'quick-setup',
        title: 'Configuración rápida',
        summary: 'Agregá tu ingreso principal y 3-5 gastos recurrentes con presets.',
        steps: [
          'Ir a Dashboard y usar Smart Start (tareas rápidas).',
          'Agregar ingreso principal.',
          'Agregar plantillas de gastos con presets (Alquiler, Internet, Luz…).',
          'Definir recordatorios para cada plantilla.',
          'Confirmar recurrentes del mes desde Gastos > Recurrentes de este mes.',
        ],
        tips: [
          'Usá recordatorios para anticiparte a los vencimientos.',
          'Definí “Recordatorio” a 3-5 días para evitar sorpresas.',
        ],
        quickStart: [
          { label: 'Agregar ingreso', route: '/finance/income' },
          { label: 'Agregar alquiler', route: '/finance/expenses' },
          { label: 'Confirmar recurrentes', route: '/finance/expenses' },
        ],
      },
    ],
  },
  {
    id: 'income-expenses',
    title: 'Ingresos y Gastos',
    description: 'Cómo registrar, organizar y confirmar tus movimientos.',
    items: [
      {
        id: 'incomes',
        title: 'Registrar ingresos',
        summary: 'Cargá tus ingresos con fecha, categoría y moneda.',
        steps: [
          'Ir a Ingresos y presionar “Nuevo Ingreso”.',
          'Completar monto, nombre, fecha y categoría.',
          'Elegir la moneda del ingreso (por fila).',
          'Guardar para verlos en el resumen mensual.',
        ],
      },
      {
        id: 'income-currency-toggle',
        title: 'Ver totales en tu moneda',
        summary: 'Convertí ingresos multi-moneda a la moneda de tu perfil.',
        steps: [
          'Ir a Ingresos.',
          'Activar “Ver en <tu moneda>” para convertir filas y totales.',
          'Editar un ingreso para cambiar su moneda si es necesario.',
        ],
        tips: [
          'La conversión usa tasas de cambio cacheadas para mejor rendimiento.',
        ],
      },
      {
        id: 'recurring-expenses',
        title: 'Gastos recurrentes (plantillas)',
  summary: 'Creá plantillas mensuales con día y recordatorios.',
        steps: [
          'Ir a Gastos y “Nuevo Gasto”.',
          'Elegir un preset (Alquiler, Internet…) o crear desde cero.',
          'Marcar “Recurrente” y definir “Día de cobro”.',
          'Opcional: activar “Recordatorio (días antes)”.',
          'Guardar la plantilla. Se sugerirá confirmar cada mes.',
        ],
        tips: [
          'Podés posponer un recurrente 7 días si lo necesitás.',
          'El monto sugerido usa el promedio de los últimos 3 meses.',
        ],
        quickStart: [
          { label: 'Nuevo gasto (presets)', route: '/finance/expenses' },
        ],
      },
      {
        id: 'confirm-month',
        title: 'Confirmar recurrentes del mes',
        summary: 'Usá el inbox “Recurrentes de este mes” para confirmar rápido.',
        steps: [
          'Ir a Gastos y ubicar “Recurrentes de este mes”.',
          'Revisar sugeridos: fecha y monto (editable).',
          'Confirmar individualmente o editar antes de confirmar.',
          'Usar “Posponer 7 días” si no querés confirmarlo aún.',
          'Para confirmar todos juntos, presionar “Confirmar todo” y revisar el resumen (cantidad y total).',
          'Ver el banner “Vencen pronto” para anticiparte a próximos vencimientos.',
          'Luego de confirmar, podés “Marcar pagado” para llevar control de pagos.',
        ],
        tips: [
          'Podés confirmar rápido desde la bandeja de recurrentes del mes.',
          'La bandeja muestra badges de “Pagado” y estadísticas del mes.',
        ],
      },
      {
        id: 'bridges-to-expenses',
        title: 'Unificar todo en Gastos',
        summary: 'Centralizá suscripciones y servicios como plantillas de gasto mensual.',
        steps: [
          'Ir a Gastos y crear plantillas para tus servicios/abonos.',
          'Definir día del mes y “Recordatorio (días antes)”.',
          'Usar tags para indicar el origen si lo necesitás (ej: servicio:spotify).',
          'Confirmar y marcar pagado desde Gastos como cualquier recurrente.',
        ],
        tips: [
          'La procedencia queda visible con tags, sin duplicar datos.',
          'Podés editar el gasto reflejado desde Gastos cuando cambie el monto.',
        ],
      },
    ],
  },
  {
    id: 'fire',
    title: 'FIRE y Libertad Financiera',
    description: 'Entendé tu Número FIRE y planificá con compounding.',
    items: [
      {
        id: 'fire-learn',
        title: 'Qué es FIRE',
        summary: 'Leé la guía en la sección FIRE para entender conceptos clave.',
        steps: [
          'Ir a FIRE en la barra lateral.',
          'Explorar el contenido educativo sobre tasa de retiro segura y compounding.',
        ],
        quickStart: [
          { label: 'Abrir FIRE', route: '/fire' },
        ],
      },
      {
        id: 'fire-calc',
        title: 'Calculadora FIRE',
        summary: 'Calculá tu Número FIRE y tiempo estimado con tus datos.',
        steps: [
          'Ir a FIRE y completar gastos mensuales, tasa de retiro, cartera actual, ahorro mensual y rendimiento real anual.',
          'Revisar Número FIRE, retiro anual y progreso actual.',
          'Ver tiempo estimado hasta FIRE con aportes y capitalización mensual.',
          'Guardar escenarios con nombre para compararlos y retomarlos luego.',
        ],
        tips: [
          'Los escenarios se guardan en tu cuenta; si estás offline, quedan en tu dispositivo y se sincronizan luego.',
        ],
        quickStart: [
          { label: 'Abrir calculadora', route: '/fire' },
        ],
      },
    ],
  },
  {
    id: 'planning',
    title: 'Planificación y Ahorro',
    description: 'Armá presupuestos y metas claras.',
    items: [
      {
        id: 'budgets',
        title: 'Presupuestos',
        summary: 'Definí montos por categoría y seguí tu gasto mensual.',
        steps: [
          'Ir a Presupuestos.',
          'Crear un presupuesto mensual y asignar categorías.',
          'Monitorear el % gastado y alertas por exceso.',
        ],
      },
      {
        id: 'savings-goals',
        title: 'Metas de ahorro',
        summary: 'Crea metas con objetivo, plazo y aporte periódico.',
        steps: [
          'Ir a Metas de Ahorro.',
          'Definir objetivo (monto) y plazo estimado.',
          'Configurar aportes mensuales para ver el avance.',
        ],
      },
    ],
  },
  {
    id: 'cards-notifications',
    title: 'Tarjetas y Notificaciones',
    description: 'Evitá sorpresas con vencimientos y pagos.',
    items: [
      {
        id: 'cards',
        title: 'Tarjetas',
        summary: 'Guardá tus tarjetas y configurá alertas de vencimiento.',
        steps: [
          'Ir a Tarjetas.',
          'Agregar una tarjeta con banco, tipo y vencimiento.',
          'Activar “Alertas de vencimiento” y días de aviso.',
        ],
      },
      {
        id: 'notifications',
        title: 'Notificaciones',
        summary: 'Recibí alertas antes de vencimientos o excesos de presupuesto.',
        steps: [
          'Ir a Notificaciones.',
          'Configurar canales y reglas según tu preferencia.',
          'En Gastos, podés “Marcar pagado” las instancias confirmadas del mes para llevar control de pagos.',
        ],
      },
    ],
  },
  {
    id: 'insights-feedback',
    title: 'Análisis e Ideas',
    description: 'Entendé tus hábitos y contanos cómo mejorar.',
    items: [
      {
        id: 'analytics',
        title: 'Análisis',
        summary: 'Explorá tendencias por categoría y detectá oportunidades de ahorro.',
        steps: [
          'Ir a Análisis.',
          'Filtrar por período y categoría.',
          'Usar sugerencias de optimización para bajar gastos.',
        ],
      },
      {
        id: 'feedback',
        title: 'Feedback',
        summary: 'Enviá ideas o reportes y seguí su estado.',
        steps: [
          'Ir a Feedback desde Configuración.',
          'Completar título, descripción y tipo.',
          'Enviar y hacer seguimiento de estado.',
        ],
      },
    ],
  },
];

const UseCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const flatItems = useMemo(
    () => educationalSections.flatMap(s => s.items.map(i => ({ section: s, item: i }))),
    []
  );

  const filtered = query.trim()
    ? flatItems.filter(({ section, item }) =>
        [section.title, section.description, item.title, item.summary, ...(item.steps || []), ...(item.tips || [])]
          .join(' ').toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Casos de Uso</h1>
        </div>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscá por tema</CardTitle>
          <CardDescription>Encontrá guías paso a paso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input className="pl-8" placeholder="Presupuestos, recurrentes..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          </div>
          {filtered.length > 0 && (
            <div className="mt-4 space-y-3">
              {filtered.slice(0, 8).map(({ section, item }) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">{section.title}</div>
                    <div className="font-medium">{item.title}</div>
                  </div>
                  {item.quickStart?.[0] && (
                    <Button size="sm" onClick={() => navigate(item.quickStart![0].route)}>
                      Ir <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de contenidos */}
      <Card>
        <CardHeader>
          <CardTitle>Tabla de contenidos</CardTitle>
          <CardDescription>Secciones y objetivos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {educationalSections.map(s => (
              <Badge key={s.id} variant="secondary">{s.title}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contenido educativo */}
      {educationalSections.map(section => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {section.items.map(item => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  {item.quickStart?.length ? (
                    <div className="flex gap-2">
                      {item.quickStart.map(a => (
                        <Button key={a.label} variant="outline" size="sm" onClick={() => navigate(a.route)}>
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
                <ol className="list-decimal pl-5 space-y-1">
                  {item.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                {item.tips && item.tips.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium mb-1">Tips</div>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm text-muted-foreground">
                      {item.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Catálogo de casos JTBD (referencia) */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Casos (JTBD)</CardTitle>
          <CardDescription>Referencia de escenarios, rutas y métricas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {useCases.map(c => (
            <div key={c.id} className="p-3 border rounded-lg">
              <div className="font-medium">{c.title}</div>
              <div className="text-sm text-muted-foreground">{c.jtbds.join(' • ')}</div>
              <div className="text-xs mt-1">Rutas: {c.routes.join(', ')}</div>
              <div className="text-xs">Triggers: {c.triggers.join(', ')}</div>
              <div className="text-xs">Métricas: {c.successMetrics.join(', ')}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UseCasesPage;
