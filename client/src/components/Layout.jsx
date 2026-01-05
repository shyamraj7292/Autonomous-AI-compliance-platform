import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShieldCheck, Activity, LayoutDashboard, FileText, AlertTriangle, Settings, Bell, Menu, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className={cn("bg-card border-r border-border transition-all duration-300 flex flex-col", sidebarOpen ? "w-64" : "w-20")}>
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <ShieldCheck className="h-8 w-8 text-primary mr-2" />
                    {sidebarOpen && <span className="text-xl font-bold tracking-tight">ComplianceOS</span>}
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
                    <NavItem to="/" icon={<LayoutDashboard />} label="Dashboard" expanded={sidebarOpen} />
                    <NavItem to="/regulations" icon={<FileText />} label="Regulations" expanded={sidebarOpen} />
                    <NavItem to="/risks" icon={<AlertTriangle />} label="Risk Analysis" expanded={sidebarOpen} />
                    <NavItem to="/activity" icon={<Activity />} label="Activity Log" expanded={sidebarOpen} />
                    <NavItem to="/reports" icon={<Download />} label="Reports" expanded={sidebarOpen} />
                    <NavItem to="/settings" icon={<Settings />} label="Settings" expanded={sidebarOpen} />
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-bold text-xs text-primary">JD</span>
                        </div>
                        {sidebarOpen && (
                            <div className="ml-3">
                                <p className="text-sm font-medium">John Doe</p>
                                <p className="text-xs text-muted-foreground">Compliance Officer</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" className="hidden md:flex">
                            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                            <span>3 Critical Gaps</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Bell className="h-5 w-5" />
                        </Button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function NavItem({ to, icon, label, expanded }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "flex items-center px-3 py-2.5 rounded-md transition-colors group",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
        >
            {React.cloneElement(icon, { className: "h-5 w-5 flex-shrink-0" })}
            {expanded && <span className="ml-3 font-medium text-sm whitespace-nowrap opacity-100 transition-opacity duration-200">{label}</span>}
            {!expanded && <span className="sr-only">{label}</span>}
        </NavLink>
    )
}
