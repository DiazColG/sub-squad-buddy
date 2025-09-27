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
  BookOpen
  , Flame
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

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

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Ingresos", url: "/finance/income", icon: TrendingUp },
  { title: "Gastos", url: "/finance/expenses", icon: Calculator },
  // { title: "Suscripciones", url: "/subscriptions", icon: Package },
  // { title: "Servicios del Hogar", url: "/housing-services", icon: Home },
  { title: "Cuotas", url: "/installments", icon: Calculator },
  { title: "Tarjetas", url: "/cards", icon: CreditCard },
  { title: "Análisis", url: "/analytics", icon: BarChart3 },
  { title: "Notificaciones", url: "/notifications", icon: Bell },
];

// Personal Finance section
const financeNavItems = [
  { title: "Resumen Financiero", url: "/finance", icon: DollarSign },
  { title: "Metas de Ahorro", url: "/finance/goals", icon: Target },
  { title: "Presupuestos", url: "/finance/budgets", icon: PiggyBank },
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
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClassName = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90" 
      : "hover:bg-accent hover:text-accent-foreground";


  return (
    <Sidebar 
      className={`${isCollapsed ? "w-14" : "w-64"} border-r bg-background fixed left-0 top-0 h-full z-10`} 
      collapsible="icon"
    >
      <SidebarContent>
        {/* Brand */}
        <div className="p-4 border-b">
          {!isCollapsed ? (
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/dashboard')}
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
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
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
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
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
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}