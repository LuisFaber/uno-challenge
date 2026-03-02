import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-mocha-bg">
      <nav className="h-16 bg-white border-b border-mocha-border flex items-center px-10">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <img
              src="/logo.png"
              alt="ONE CRM"
              className="h-14 w-auto object-contain"
            />
            <div className="flex gap-8">
              <NavLink
                to="/contacts"
                className={({ isActive }) =>
                  isActive
                    ? "text-green-forest font-medium border-b-2 border-green-forest pb-1 transition-colors"
                    : "text-mocha-medium hover:text-green-forest transition-colors"
                }
              >
                Contatos
              </NavLink>
              <NavLink
                to="/leads"
                className={({ isActive }) =>
                  isActive
                    ? "text-green-forest font-medium border-b-2 border-green-forest pb-1 transition-colors"
                    : "text-mocha-medium hover:text-green-forest transition-colors"
                }
              >
                Leads
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-8 py-12">
        <Outlet />
      </main>
    </div>
  );
}
