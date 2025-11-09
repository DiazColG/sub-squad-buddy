import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const isCollapsed = state === "collapsed";
  
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          // En mobile, el sidebar es overlay (no ocupa espacio)
          isMobile ? '' : (isCollapsed ? 'ml-14' : 'ml-64')
        } p-4 md:p-6`}
        style={isMobile ? {} : { 
          width: `calc(100% - ${isCollapsed ? '3.5rem' : '16rem'})`,
          minWidth: 0
        }}
      >
        <div className="max-w-full">
          {children}
        </div>
      </main>
      
      {/* Floating Action Button (solo mobile) */}
      <FloatingActionButton />
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}