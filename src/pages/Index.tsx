import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  BarChart3, 
  Bell, 
  CreditCard, 
  Shield, 
  Users,
  Zap,
  Target,
  Calendar
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: CreditCard,
      title: "Gestión Centralizada",
      description: "Todas tus suscripciones en un solo lugar, fácil de gestionar y controlar"
    },
    {
      icon: BarChart3,
      title: "Análisis Inteligente",
      description: "Visualiza tus gastos mensuales y anuales con gráficos detallados"
    },
    {
      icon: Bell,
      title: "Alertas Personalizadas",
      description: "Recibe notificaciones antes de que se renueven tus suscripciones"
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Tus datos están protegidos con los más altos estándares de seguridad"
    },
    {
      icon: Users,
      title: "Gestión de Equipos",
      description: "Administra las suscripciones de tu empresa con roles y permisos"
    },
    {
      icon: Target,
      title: "Control de Costos",
      description: "Mantén el control total sobre tus gastos recurrentes"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                Suscrify
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Ingresar</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-primary">Empezar gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <Badge className="bg-primary-light text-primary">
            🚀 Gestiona tus suscripciones de forma inteligente
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Controla todos tus gastos recurrentes
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Suscrify te ayuda a rastrear, analizar y controlar todas tus suscripciones 
            en un solo lugar. Perfecto para usuarios individuales y equipos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-primary text-lg px-8">
                Comenzar gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver demo en vivo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16 bg-background-subtle">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Todo lo que necesitas para gestionar tus suscripciones
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Funciones diseñadas para simplificar el control de tus gastos recurrentes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-card border-card-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <Card className="bg-gradient-primary text-white border-0 shadow-elegant">
          <CardContent className="p-12 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">
                ¿Listo para tomar el control de tus suscripciones?
              </h2>
              <p className="text-white/90 text-lg">
                Únete a miles de usuarios que ya están ahorrando tiempo y dinero 
                con Suscrify. Comienza gratis, sin necesidad de tarjeta de crédito.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8">
                    <Zap className="mr-2 h-5 w-5" />
                    Empezar ahora
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background-subtle">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-semibold bg-gradient-primary bg-clip-text text-transparent">
                Suscrify
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Suscrify. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
