import { 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  BarChart3,
  Bell,
  MessageSquare,
  Package,
  Home,
  Calculator,
  DollarSign,
  TrendingUp,
  Target,
  PiggyBank,
  BookOpen,
  Flame, 
  Lightbulb,
  Menu,
  X
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Ingresos", url: "/finance/income", icon: TrendingUp },
  { title: "Gastos", url: "/finance/expenses", icon: Calculator },
  { title: "Cuotas", url: "/installments", icon: Calculator },
  { title: "Suscripciones", url: "/subscriptions", icon: Package },
  // { title: "Servicios del Hogar", url: "/housing-services", icon: Home },
  { title: "Medios de Pago", url: "/cards", icon: CreditCard },
  { title: "Análisis", url: "/analytics", icon: BarChart3 },
  { title: "Notificaciones", url: "/notifications", icon: Bell },
];

// Personal Finance section
const financeNavItems = [
  { title: "Resumen Financiero", url: "/finance", icon: DollarSign },
  { title: "Metas de Ahorro", url: "/finance/goals", icon: Target },
  { title: "Presupuestos", url: "/finance/budgets", icon: PiggyBank },
  { title: "Toma de Decisiones", url: "/finance/decisions", icon: Lightbulb },
  { title: "FIRE", url: "/fire", icon: Flame },
];


const settingsNavItems = [
  { title: "Configuración", url: "/settings", icon: Settings },
  { title: "Feedback", url: "/feedback", icon: MessageSquare },
  { title: "Casos de Uso", url: "/use-cases", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const { signOut, user } = useAuth();

  const isActive = (path: string) => currentPath === path;
  const getNavClassName = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90" 
      : "hover:bg-accent hover:text-accent-foreground";

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Sidebar content component (reusable for mobile and desktop)
  const SidebarContentComponent = () => (
    <SidebarContent>
      {/* Brand */}
      <div className="p-4 border-b">
        {!isCollapsed || isMobile ? (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              navigate('/dashboard');
              handleNavClick();
            }}
          >
            <img src="/icon-graph.svg" alt="App icon" className="w-8 h-8" />
            <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
              Compounding
            </span>
          </div>
        ) : (
          <div 
            className="w-8 h-8 flex items-center justify-center mx-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/dashboard')}
          >
            <img src="/icon-graph.svg" alt="App icon" className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <SidebarGroup>
        <SidebarGroupLabel>Principal</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.url} 
                    className={getNavClassName(item.url)}
                    onClick={handleNavClick}
                  >
                    <item.icon className="h-4 w-4" />
                    {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Personal Finance Navigation */}
      <SidebarGroup>
        <SidebarGroupLabel>
          💰 Finanzas Personales
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {financeNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.url} 
                    className={getNavClassName(item.url)}
                    onClick={handleNavClick}
                  >
                    <item.icon className="h-4 w-4" />
                    {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Settings */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {settingsNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.url} 
                    className={getNavClassName(item.url)}
                    onClick={handleNavClick}
                  >
                    <item.icon className="h-4 w-4" />
                    {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Logout (sticky bottom) */}
      {user && (
        <div className="mt-auto border-t p-2">
          <button
            onClick={() => {
              signOut();
              handleNavClick();
            }}
            className={`w-full flex items-center gap-2 text-sm px-2 py-2 rounded-md transition-colors ${
              isCollapsed && !isMobile ? "justify-center" : "justify-start"
            } hover:bg-destructive/10 text-muted-foreground hover:text-destructive`}
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
            {(!isCollapsed || isMobile) && <span>Cerrar sesión</span>}
          </button>
        </div>
      )}
    </SidebarContent>
  );

  // Mobile: Sheet overlay
  if (isMobile) {
    return (
      <>
        {/* Hamburger Menu Button - Fixed top left */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-sm"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[280px]">
            <Sidebar className="border-0">
              <SidebarContentComponent />
            </Sidebar>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <Sidebar 
      className={`${isCollapsed ? "w-14" : "w-64"} border-r bg-background fixed left-0 top-0 h-full z-10`} 
      collapsible="icon"
    >
      <SidebarContentComponent />
    </Sidebar>
  );
}