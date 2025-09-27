export type UseCase = {
  id: string;
  title: string;
  jtbds: string[]; // Jobs to be done statements
  keyFlows: string[]; // critical steps the user takes
  routes: string[]; // main screens involved
  triggers: string[]; // when this matters for users
  successMetrics: string[]; // product success metrics
  recommendedSurface: Array<'modal' | 'coachmark' | 'empty-state' | 'banner' | 'tour' | 'task-list'>;
  quickActions?: { label: string; route?: string; actionId?: string }[];
};

export const useCases: UseCase[] = [
  {
    id: 'personal-finance-setup',
    title: 'Arrancar finanzas personales rápido',
    jtbds: [
      'Como usuario, quiero empezar en 2 minutos para ver valor al toque',
      'Quiero registrar mis ingresos y 3-5 gastos recurrentes clave',
    ],
    keyFlows: [
      'Agregar ingreso principal',
      'Agregar alquiler/expensas/servicios desde presets',
      'Confirmar recurrentes del mes',
    ],
    routes: ['/dashboard', '/gastos', '/ingresos'],
    triggers: ['Primer login', 'Volver tras inactividad >30 días'],
    successMetrics: ['Tiempo a primer valor < 120s', '>=3 gastos recurrentes creados', '1 ingreso creado'],
    recommendedSurface: ['empty-state', 'task-list'],
    quickActions: [
      { label: 'Agregar ingreso', route: '/ingresos' },
      { label: 'Preset: Alquiler', route: '/gastos' },
      { label: 'Confirmar mes', route: '/gastos' },
    ],
  },
  {
    id: 'recurrentes-al-dia',
    title: 'Estar al día con los recurrentes',
    jtbds: [
      'Quiero confirmar/editar mis gastos recurrentes del mes en 1 minuto',
      'Quiero posponer y que algunos se paguen solos',
    ],

  keyFlows: ['Confirmar recurrentes', 'Posponer 7 días'],
    routes: ['/gastos'],
    triggers: ['Inicio de mes', '7-3 días antes del vencimiento'],
  successMetrics: ['% de recurrentes confirmados antes del vencimiento'],

    recommendedSurface: ['banner', 'task-list'],
    quickActions: [
      { label: 'Confirmar todo', route: '/gastos' },
      { label: 'Ver por vencer', route: '/gastos' },
    ],
  },
  {
    id: 'optimizar-gastos',
    title: 'Optimización de gastos',
    jtbds: [
      'Quiero detectar dónde puedo bajar gastos fácil',
      'Quiero ver categorías con mayor potencial de ahorro',
    ],
    keyFlows: ['Ranking por categoría', 'Tag “optimizar”', 'Sugerencias automáticas'],
    routes: ['/analytics', '/gastos'],
    triggers: ['Fin de mes', 'Al superar presupuesto'],
    successMetrics: ['Ahorro estimado', 'Número de optimizaciones aplicadas'],
    recommendedSurface: ['coachmark', 'banner'],
  },
  {
    id: 'metas-ahorro',
    title: 'Metas de ahorro simples',
    jtbds: ['Quiero crear una meta clara y ver el avance'],
    keyFlows: ['Crear meta', 'Asignar aportes automáticos'],
    routes: ['/savings'],
    triggers: ['Al recibir ingreso', 'Inicio de mes'],
    successMetrics: ['% metas activas', 'Tasa de cumplimiento mensual'],
    recommendedSurface: ['empty-state', 'task-list'],
  },
  {
    id: 'tarjetas-y-vencimientos',
    title: 'Tarjetas y vencimientos',
    jtbds: ['Quiero evitar sorpresas con vencimientos de tarjetas/servicios'],
    keyFlows: ['Guardar tarjeta', 'Alertas antes de vencimiento'],
    routes: ['/cards', '/gastos'],
    triggers: ['10-5-3 días antes del vencimiento'],
    successMetrics: ['Incidencias de vencimiento', 'Config de alertas activas'],
    recommendedSurface: ['banner', 'modal'],
  },
  {
    id: 'feedback-loop',
    title: 'Loop de feedback del producto',
    jtbds: ['Quiero reportar ideas o problemas en segundos'],
    keyFlows: ['Enviar feedback', 'Ver estado'],
    routes: ['/settings', '/feedback'],
    triggers: ['Después de acción avanzada', 'Tras error'],
    successMetrics: ['Tasa de envío feedback', 'Tiempo de respuesta'],
    recommendedSurface: ['coachmark', 'modal'],
  },
];

// Sugerencia de onboarding: mostrar 3-5 tareas clave en un "Smart Start" según señales (primer login, mes nuevo, ingresos recientes).
export const onboardingTasks = [
  { id: 'task-add-income', label: 'Agregar tu ingreso principal', route: '/ingresos' },
  { id: 'task-add-rent', label: 'Configurar tu alquiler', route: '/gastos' },
  { id: 'task-confirm-recurrences', label: 'Confirmar recurrentes del mes', route: '/gastos' },
  { id: 'task-add-card', label: 'Guardar tu tarjeta para vencimientos', route: '/cards' },
];

export type OnboardingSurface = 'smart-start' | 'just-in-time';

export const onboardingDesign = {
  primarySurface: 'smart-start' as OnboardingSurface,
  secondarySurface: 'just-in-time' as OnboardingSurface,
  placement: {
    smartStart: '/dashboard',
    justInTime: '/gastos',
  },
};
