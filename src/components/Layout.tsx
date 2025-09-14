import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'ml-14' : 'ml-64'
        } p-6`}
        style={{ 
          width: `calc(100% - ${isCollapsed ? '3.5rem' : '16rem'})`,
          minWidth: 0
        }}
      >
        <div className="max-w-full">
          {children}
        </div>
      </main>
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