import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Sun, Moon, Archive, ChevronDown, ChevronUp, Shield } from 'lucide-react';

interface FloatingUserBubbleProps {
  username: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  savedCertCount?: number;
  onOpenArchive?: () => void;
}

export const FloatingUserBubble: React.FC<FloatingUserBubbleProps> = ({
  username,
  isDarkMode,
  onToggleTheme,
  onLogout,
  savedCertCount = 0,
  onOpenArchive,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div ref={containerRef} className="relative select-none print:hidden">
      {/* Navbar User Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Foydalanuvchi hisobi va sozlamalari"
        className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/90 border border-slate-200/80 dark:border-slate-700/80 active:scale-98 transition-all cursor-pointer shadow-2xs"
      >
        {/* Avatar circle with online badge */}
        <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-[11px] shadow-2xs shrink-0">
          {getInitials(username)}
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>

        {/* Username */}
        <div className="text-left hidden sm:block max-w-[130px]">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
            {username}
          </div>
        </div>

        {/* Indicator icon */}
        <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Dropdown Menu Popover Card */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
          {/* User profile card */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0">
              {getInitials(username)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {username}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>Mutaxassis</span>
              </div>
            </div>
          </div>

          {/* Action List */}
          <div className="mt-2 space-y-1">
            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span>Mavzu (Rejim)</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                {isDarkMode ? 'Tungi' : 'Kunduzgi'}
              </span>
            </button>

            {/* Archive link (if provided) */}
            {onOpenArchive && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenArchive();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 text-blue-500" />
                  <span>Saqlangan arxiv</span>
                </div>
                {savedCertCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {savedCertCount}
                  </span>
                )}
              </button>
            )}

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Tizimdan chiqish</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
