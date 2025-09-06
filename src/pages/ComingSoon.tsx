import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  Sparkles, 
  Calendar, 
  Users,
  Smartphone,
  BarChart3,
  Bell,
  CreditCard,
  Globe,
  Zap,
  Target,
  Clock
} from "lucide-react";

const ComingSoon = () => {
  const upcomingFeatures = [
    {
      icon: Smartphone,
      title: "App Móvil",
      description: "Aplicación nativa para iOS y Android con notificaciones push en tiempo real",
      status: "En desarrollo",
      eta: "Q2 2024",
      priority: "high"
    },
    {
      icon: Users,
      title: "Gestión de Equipos Avanzada",
      description: "Roles personalizados, permisos granulares y gestión de presupuestos por departamento",
      status: "Planificado",
      eta: "Q3 2024",
      priority: "high"
    },
    {
      icon: BarChart3,
      title: "Reportes Avanzados",
      description: "Exportación de datos, reportes personalizados y análisis predictivo de gastos",
      status: "En desarrollo",
      eta: "Q2 2024",
      priority: "medium"
    },
    {
      icon: Bell,
      title: "Integraciones de Notificaciones",
      description: "Integración con Slack, Discord, Microsoft Teams y otras plataformas",
      status: "Investigación",
      eta: "Q4 2024",
      priority: "medium"
    },
    {
      icon: CreditCard,
      title: "Sincronización Bancaria",
      description: "Conexión automática con bancos para detectar y categorizar gastos de suscripciones",
      status: "Planificado",
      eta: "Q3 2024",
      priority: "high"
    },
    {
      icon: Globe,
      title: "Soporte Multi-idioma",
      description: "Interfaz disponible en inglés, português y otros idiomas",
      status: "En desarrollo",
      eta: "Q2 2024",
      priority: "low"
    },
    {
      icon: Zap,
      title: "Automatizaciones",
      description: "Reglas automáticas para categorización y acciones basadas en patrones de gasto",
      status: "Investigación",
      eta: "Q4 2024",
      priority: "medium"
    },
    {
      icon: Target,
      title: "Metas de Ahorro",
      description: "Establece objetivos de reducción de gastos y recibe sugerencias personalizadas",
      status: "Planificado",
      eta: "Q3 2024",
      priority: "medium"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-secondary text-secondary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En desarrollo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Planificado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Investigación': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Próximamente
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Estamos trabajando constantemente para mejorar Suscrify. 
          Aquí puedes ver las funciones que están en desarrollo y las que tenemos planificadas.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Desarrollo</CardTitle>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingFeatures.filter(f => f.status === 'En desarrollo').length}
            </div>
            <p className="text-xs text-muted-foreground">funciones activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planificadas</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingFeatures.filter(f => f.status === 'Planificado').length}
            </div>
            <p className="text-xs text-muted-foreground">próximas funciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingFeatures.length}</div>
            <p className="text-xs text-muted-foreground">en roadmap</p>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {upcomingFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(feature.status)}
                      >
                        {feature.status}
                      </Badge>
                      <Badge className={getPriorityColor(feature.priority)}>
                        {feature.priority === 'high' && 'Alta'}
                        {feature.priority === 'medium' && 'Media'}
                        {feature.priority === 'low' && 'Baja'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {feature.eta}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-primary text-white border-0">
        <CardContent className="p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold">
              ¿Tienes alguna sugerencia?
            </h2>
            <p className="text-white/90">
              Tu feedback es muy valioso para nosotros. Si tienes ideas para nuevas funciones 
              o mejoras, no dudes en compartirlas con nuestro equipo.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Enviar Sugerencia
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoon;