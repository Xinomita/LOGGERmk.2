import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-1">
              <NavLink
                to="/logging"
                className={({ isActive }) =>
                  `px-4 py-2 font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`
                }
              >
                LOGGING
              </NavLink>
              <NavLink
                to="/compounds"
                className={({ isActive }) =>
                  `px-4 py-2 font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`
                }
              >
                COMPOUNDS
              </NavLink>
              <NavLink
                to="/ai"
                className={({ isActive }) =>
                  `px-4 py-2 font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`
                }
              >
                AI
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `px-4 py-2 font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`
                }
              >
                PROFILE
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
