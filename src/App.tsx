import { useState, useEffect, useMemo, useRef } from 'react';
import {
  CalibrationItemInfo,
  ChamberPointData,
  SavedCertificate,
} from './types';
import {
  EMPTY_CALIBRATION_INFO,
  createEmptyChamberPoints,
  calculateChamberKU10Uncertainty,
} from './utils/metrology';
import {
  getAuthSession,
  clearAuthSession,
  getSavedCertificates,
  saveCertificate,
  deleteCertificate,
  saveAllCertificates,
  recordAuditLog,
} from './utils/storage';
import { LoginScreen } from './components/LoginScreen';
import { CalibrationForm } from './components/CalibrationForm';
import { OfficialCertificateView } from './components/OfficialCertificateView';
import { ProtocolExcelEditor } from './components/ProtocolExcelEditor';
import { HistoryArchiveView } from './components/HistoryArchiveView';
import { FloatingUserBubble } from './components/FloatingUserBubble';
import { UzNimLogo } from './components/UzNimLogo';
import { Archive, ArrowLeft } from 'lucide-react';

export type AppView = 'workflow' | 'certificate' | 'protocol' | 'archive';

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return true;
      }
    }
    return getAuthSession().isAuthenticated;
  });

  const [username, setUsername] = useState<string>(() => {
    return getAuthSession().username || 'metrologiya';
  });

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('metrologiya_theme_mode');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('metrologiya_theme_mode', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('metrologiya_theme_mode', 'light');
    }
  }, [isDarkMode]);

  // Main active view: 'workflow' (vertical step-by-step form) | 'certificate' | 'protocol' | 'archive'
  const [currentView, setCurrentView] = useState<AppView>('workflow');

  // Form states
  const [info, setInfo] = useState<CalibrationItemInfo>(EMPTY_CALIBRATION_INFO);
  const [pointsData, setPointsData] = useState<ChamberPointData[]>(createEmptyChamberPoints);

  // Saved Certificates
  const [savedCerts, setSavedCerts] = useState<SavedCertificate[]>([]);

  useEffect(() => {
    setSavedCerts(getSavedCertificates());
  }, []);

  // Compute metrological uncertainty on the fly according to DIN EN 60068-3-5 / EURAMET cg-20
  const calculation = useMemo(() => {
    return calculateChamberKU10Uncertainty(pointsData, info);
  }, [pointsData, info]);

  // Initial load tracking to avoid immediate redundant save on mount
  const isInitialMount = useRef(true);

  // Automatic saving into database (localStorage) whenever pointsData or info change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const hasData =
      info.objectName.trim() !== '' ||
      info.objectType.trim() !== '' ||
      info.serialNumber.trim() !== '' ||
      pointsData.some((p) => p.rows.some((r) => r.tStd !== '' && r.tStd !== 0));
    if (!hasData) return;

    const timer = setTimeout(() => {
      saveCertificate(info, pointsData, calculation);
      setSavedCerts(getSavedCertificates());
    }, 600);

    return () => clearTimeout(timer);
  }, [info, pointsData, calculation]);

  // Auth handlers
  const handleLoginSuccess = (uname: string) => {
    setUsername(uname);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    recordAuditLog(username, 'Chiqish', 'Foydalanuvchi tizimdan chiqdi');
    clearAuthSession();
    setIsAuthenticated(false);
  };

  // Immediate save helper (e.g. before PDF download or export)
  const handleImmediateSave = () => {
    saveCertificate(info, pointsData, calculation);
    setSavedCerts(getSavedCertificates());
  };

  // Generate certificate view
  const handleGenerateCertificate = () => {
    handleImmediateSave();
    setCurrentView('certificate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Protocol Excel view
  const handleOpenProtocolExcel = () => {
    handleImmediateSave();
    setCurrentView('protocol');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load a certificate from archive back into editor
  const handleLoadCertificate = (cert: SavedCertificate) => {
    setInfo(cert.info);
    if (cert.pointsData && Array.isArray(cert.pointsData)) {
      setPointsData(cert.pointsData);
    }
    setCurrentView('workflow');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete certificate from archive
  const handleDeleteCertificate = (id: string) => {
    const updated = deleteCertificate(id);
    setSavedCerts(updated);
  };

  // Import backup certificates
  const handleImportBackup = (imported: SavedCertificate[]) => {
    saveAllCertificates(imported);
    setSavedCerts(imported);
  };

  // If not logged in, render the login security screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Sleek Top Navigation Bar (No sidebar) */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 print:hidden">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark & Logo */}
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xs border border-slate-100 dark:border-slate-700 inline-flex items-center justify-center">
              <UzNimLogo size={34} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                O‘zbekiston Milliy Metrologiya Instituti
              </div>
              <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 leading-tight">
                Kalibrlash va Noaniqlik Tizimi
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {currentView !== 'workflow' ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentView('workflow');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer mr-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Asosiy oynaga qaytish</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCurrentView('archive');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5 text-blue-500" />
                <span>Arxiv</span>
                {savedCerts.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {savedCerts.length}
                  </span>
                )}
              </button>
            )}

            {/* User Account, Theme & Logout button in Navbar */}
            <FloatingUserBubble
              username={username}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              onLogout={handleLogout}
              savedCertCount={savedCerts.length}
              onOpenArchive={() => {
                setCurrentView('archive');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: Step-by-Step Continuous Workflow (Cube -> 10 Budget Components -> Customer & Object -> Standards -> Action buttons) */}
        {currentView === 'workflow' && (
          <CalibrationForm
            info={info}
            setInfo={setInfo}
            pointsData={pointsData}
            setPointsData={setPointsData}
            calculation={calculation}
            onGenerateCertificate={handleGenerateCertificate}
            onOpenProtocolExcel={handleOpenProtocolExcel}
          />
        )}

        {/* VIEW 2: Bayonnoma (Excel) Interactive Editor & Exporter */}
        {currentView === 'protocol' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 print:hidden">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('workflow');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Hisob-kitobga qaytish</span>
              </button>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Bayonnoma (Excel) Tahrirlash va Yuklash
              </div>
            </div>

            <ProtocolExcelEditor
              info={info}
              pointsData={pointsData}
              calculation={calculation}
              onBackToEdit={() => {
                setCurrentView('workflow');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSaveCertificate={handleImmediateSave}
            />
          </div>
        )}

        {/* VIEW 3: Official Certificate (PDF) */}
        {currentView === 'certificate' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 print:hidden">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('workflow');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Hisob-kitobga qaytish</span>
              </button>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Kalibrlash Sertifikati (PDF)
              </div>
            </div>

            <OfficialCertificateView
              info={info}
              calculation={calculation}
              pointsData={pointsData}
              onBackToEdit={() => {
                setCurrentView('workflow');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSaveCertificate={handleImmediateSave}
              onUpdateInfo={(updated) => setInfo((prev) => ({ ...prev, ...updated }))}
            />
          </div>
        )}

        {/* VIEW 4: Saqlangan sertifikatlar arxivi */}
        {currentView === 'archive' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 print:hidden">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('workflow');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Hisob-kitobga qaytish</span>
              </button>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Saqlangan Sertifikatlar Arxivi
              </div>
            </div>

            <HistoryArchiveView
              certificates={savedCerts}
              onLoadCertificate={handleLoadCertificate}
              onDeleteCertificate={handleDeleteCertificate}
              onImportBackup={handleImportBackup}
            />
          </div>
        )}
      </main>

      {/* Minimal Clean Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400 print:hidden mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <span>O‘zbekiston Milliy Metrologiya Instituti (O‘zMMI) Davlat Kalibrlash Xizmati</span>
        </div>
      </footer>
    </div>
  );
}
