import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-warmbg">
      <nav className="bg-primary text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex gap-6">
          <NavLink
            to="/contacts"
            className={({ isActive }) =>
              isActive ? "font-semibold underline underline-offset-4" : "hover:opacity-90 transition-opacity"
            }
          >
            Contacts
          </NavLink>
          <NavLink
            to="/leads"
            className={({ isActive }) =>
              isActive ? "font-semibold underline underline-offset-4" : "hover:opacity-90 transition-opacity"
            }
          >
            Leads
          </NavLink>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
