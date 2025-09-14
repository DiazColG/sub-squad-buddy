import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  Settings, 
  BarChart3,
  Bell,
  MessageSquare,
  Package,
  Rocket,
  Home,
  Calculator,
  DollarSign,
  TrendingUp,
  Target,
  PiggyBank
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useUserSettings } from "@/hooks/useUserSettings";

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
  { title: "Suscripciones", url: "/subscriptions", icon: Package },
  { title: "Servicios+Vivienda", url: "/housing-services", icon: Home },
  { title: "Cuotas", url: "/installments", icon: Calculator },
  { title: "Tarjetas", url: "/cards", icon: CreditCard },
  { title: "Análisis", url: "/analytics", icon: BarChart3 },
  { title: "Notificaciones", url: "/notifications", icon: Bell },
  { title: "Feedback", url: "/feedback", icon: MessageSquare },
  { title: "Próximamente", url: "/coming-soon", icon: Rocket },
];

// New Personal Finance section (beta)
const financeNavItems = [
  { title: "Resumen Financiero", url: "/finance", icon: DollarSign },
  { title: "Ingresos", url: "/finance/income", icon: TrendingUp },
  { title: "Gastos", url: "/finance/expenses", icon: Calculator },
  { title: "Metas de Ahorro", url: "/finance/goals", icon: Target },
  { title: "Presupuestos", url: "/finance/budgets", icon: PiggyBank },
];


const settingsNavItems = [
  { title: "Configuración", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { isFeatureEnabled } = useUserSettings();
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
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                Suscrify
              </span>
            </div>
          ) : (
            <div 
              className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/dashboard')}
            >
              <span className="text-white font-bold text-sm">S</span>
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

        {/* Personal Finance Navigation (Beta) - Only show if enabled */}
        {isFeatureEnabled('personal_finance') && (
          <SidebarGroup>
            <SidebarGroupLabel>
              💰 Finanzas Personales
              {!isCollapsed && <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">BETA</span>}
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
        )}


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