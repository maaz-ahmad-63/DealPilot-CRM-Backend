import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Phone,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  BarChart3,
  Calendar,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ isDark, toggleDark }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Briefcase, label: 'Deals', path: '/deals' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Phone, label: 'Contacts', path: '/contacts' },
    { icon: Calendar, label: 'Meetings', path: '/meetings' },
    { icon: Share2, label: 'Social Media', path: '/social-media' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-xl z-40 overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-8 h-8" />
            CRM Pro
          </h1>
        </div>

        <nav className="px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                <motion.div
                  whileHover={{ x: 8 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700/50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
          <div className="mb-4 p-3 bg-blue-700/50 rounded-lg">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-blue-100">{user?.email}</p>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={toggleDark}
              className="flex-1 p-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span className="text-xs">{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
