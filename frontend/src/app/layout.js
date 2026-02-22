import { LayoutDashboard, Wrench, Package, Calendar } from "lucide-react";
import "./globals.css";

export const metadata = {
  title: "FieldOps AI — Autonomous Field Service ERP",
  description: "Zero-UI, voice-driven autonomous ERP for field service workers. Speak your job report, let AI handle the rest.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <nav className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col fixed h-full">
            <div className="mb-8">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                FieldOps AI
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Autonomous Field ERP</p>
            </div>

            <div className="space-y-1 flex-1">
              <NavLink href="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <NavLink href="/jobs" icon={<Wrench size={20} />} label="Jobs" />
              <NavLink href="/inventory" icon={<Package size={20} />} label="Inventory" />
              <NavLink href="/followups" icon={<Calendar size={20} />} label="Follow-ups" />
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse"></div>
                <span className="text-xs text-[var(--color-text-muted)]">System Online</span>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, icon, label }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all duration-200"
    >
      <span className="flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
        {icon}
      </span>
      {label}
    </a>
  );
}
