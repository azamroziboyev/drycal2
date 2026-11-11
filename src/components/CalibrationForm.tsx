import React, { useState } from 'react';
import {
  CalibrationItemInfo,
  ChamberPointData,
  ChamberCalculation,
  ChamberPointId,
  ChamberMeasurementRow,
} from '../types';
import {
  SAMPLE_CHAMBER_POINTS,
  SAMPLE_CALIBRATION_INFO,
  createEmptyChamberPoints,
  formatMetrologyNumber,
  CHAMBER_POINTS_CONFIG,
} from '../utils/metrology';
import { ChamberCube3D } from './ChamberCube3D';
import { PointDataModal } from './PointDataModal';
import { UncertaintyBudgetTable } from './UncertaintyBudgetTable';
import {
  RotateCcw,
  Sliders,
  Box,
  Building2,
  Tag,
  CircleDot,
  FileCheck,
  FileBadge,
  FileSpreadsheet,
  Thermometer,
  Gauge,
  Calendar,
  Layers,
} from 'lucide-react';

interface CalibrationFormProps {
  info: CalibrationItemInfo;
  setInfo: React.Dispatch<React.SetStateAction<CalibrationItemInfo>>;
  pointsData: ChamberPointData[];
  setPointsData: React.Dispatch<React.SetStateAction<ChamberPointData[]>>;
  calculation: ChamberCalculation;
  onGenerateCertificate: () => void;
  onOpenProtocolExcel: () => void;
}

export const CalibrationForm: React.FC<CalibrationFormProps> = ({
  info,
  setInfo,
  pointsData,
  setPointsData,
  calculation,
  onGenerateCertificate,
  onOpenProtocolExcel,
}) => {
  const [selectedPointId, setSelectedPointId] = useState<ChamberPointId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open modal for a specific point
  const handleOpenPointModal = (id: ChamberPointId) => {
    setSelectedPointId(id);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Update rows for a specific point
  const handleUpdatePointRows = (pointId: ChamberPointId, newRows: ChamberMeasurementRow[]) => {
    setPointsData((prev) =>
      prev.map((p) => {
        if (p.id === pointId) {
          return { ...p, rows: newRows };
        }
        return p;
      })
    );
  };

  // Navigate between points in modal
  const handleNavigatePoint = (direction: 'prev' | 'next') => {
    if (!selectedPointId) return;
    const currentIdx = CHAMBER_POINTS_CONFIG.findIndex((p) => p.id === selectedPointId);
    if (direction === 'prev' && currentIdx > 0) {
      setSelectedPointId(CHAMBER_POINTS_CONFIG[currentIdx - 1].id);
    } else if (direction === 'next' && currentIdx < CHAMBER_POINTS_CONFIG.length - 1) {
      setSelectedPointId(CHAMBER_POINTS_CONFIG[currentIdx + 1].id);
    }
  };

  // Clear all points data
  const handleClearAll = () => {
    setPointsData(createEmptyChamberPoints());
  };

  // Load sample test data from bayonnoma
  const handleLoadSample = () => {
    setPointsData(SAMPLE_CHAMBER_POINTS);
    setInfo(SAMPLE_CALIBRATION_INFO);
  };

  const selectedPoint = pointsData.find((p) => p.id === selectedPointId) || null;

  const enteredCount = pointsData.filter((p) =>
    p.rows.some((r) => r.tStd !== '' && !isNaN(Number(r.tStd)))
  ).length;

  return (
    <div className="relative pl-7 sm:pl-11 lg:pl-12 space-y-8 pb-16">
      {/* Mind map roadmap vertical spine line */}
      <div 
        aria-hidden="true" 
        className="absolute left-3.5 sm:left-5.5 lg:left-6 top-8 bottom-16 w-0.5 bg-gradient-to-b from-blue-500 via-emerald-500 via-indigo-500 via-amber-500 to-blue-600 rounded-full dark:opacity-80 pointer-events-none" 
      />

      {/* BOSQICH 0: Obyekt Asosiy Parametrlari */}
      <div className="relative">
        {/* Mind map node */}
        <div aria-hidden="true" className="absolute -left-3.5 sm:-left-5.5 lg:-left-6 top-6 -translate-x-1/2 flex items-center pointer-events-none">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-800 dark:bg-slate-700 text-blue-400 flex items-center justify-center font-bold text-xs ring-4 ring-slate-50 dark:ring-slate-950 shadow-sm border border-slate-700/50">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div className="w-3.5 sm:w-5.5 lg:w-6 h-0.5 bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Top Banner Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>O‘zbekiston Milliy Metrologiya Instituti</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Quritish Shkaflari Kalibrlash va Noaniqlik Tizimi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                EURAMET cg-20, DIN EN 60068-3-5, KU-10-2025 uslubiyoti bo‘yicha bosqichma-bosqich hisob-kitob
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleLoadSample}
                title="Namuna protokol qiymatlarini to‘ldirish"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Namuna yuklash</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                title="Barcha kiritilgan qiymatlarni tozalash"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Asosiy 4 ta kiritish maydoni */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-500" />
                <span>Kalibrlash obyekti:</span>
              </label>
              <input
                type="text"
                value={info.objectName}
                onChange={(e) => setInfo((prev) => ({ ...prev, objectName: e.target.value }))}
                placeholder="Masalan: Quritish shkafi / Камера температуры"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-500" />
                <span>Turi / Rusumi (Model):</span>
              </label>
              <input
                type="text"
                value={info.objectType}
                onChange={(e) => setInfo((prev) => ({ ...prev, objectType: e.target.value }))}
                placeholder="Masalan: RTOP-500Y"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <span className="font-mono text-blue-500 font-bold">№</span>
                <span>Zavod raqami:</span>
              </label>
              <input
                type="text"
                value={info.serialNumber}
                onChange={(e) => setInfo((prev) => ({ ...prev, serialNumber: e.target.value }))}
                placeholder="Masalan: 2333001557"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                <span>Kalibrlash nuqtasi (°C):</span>
              </label>
              <input
                type="text"
                value={info.calibrationPoints.length > 0 ? info.calibrationPoints[0] : ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  const num = parseFloat(val);
                  setInfo((prev) => ({
                    ...prev,
                    calibrationPoints: isNaN(num) ? [] : [num],
                  }));
                }}
                placeholder="Masalan: 30"
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOSQICH 1: 3D Kub va 9 O‘lchash Nuqtalari */}
      <div className="relative">
        {/* Mind map node */}
        <div aria-hidden="true" className="absolute -left-3.5 sm:-left-5.5 lg:-left-6 top-6 -translate-x-1/2 flex items-center pointer-events-none">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-slate-50 dark:ring-slate-950 shadow-sm shadow-blue-500/30">
            1
          </div>
          <div className="w-3.5 sm:w-5.5 lg:w-6 h-0.5 bg-blue-500/80" />
        </div>

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              1
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-600" />
                <span>3D Kub va 9 O‘lchash Nuqtalari</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kamera hajmidagi harorat taqsimotini o‘lchash (N1 — N9 nuqtalar)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              {enteredCount} / 9 nuqta to‘ldirilgan
            </span>
          </div>
        </div>

        {/* Quick KPI summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Markaz etaloni (T_ref / N5)
            </span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {calculation.centerStdMean > 0
                ? `${formatMetrologyNumber(calculation.centerStdMean, 3)} °C`
                : '—'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Quritish shkafi (T_ind)
            </span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {calculation.centerIndMean > 0
                ? `${formatMetrologyNumber(calculation.centerIndMean, 2)} °C`
                : '—'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Harorat gradienti (ΔT)
            </span>
            <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {calculation.gradientDelta > 0
                ? `${formatMetrologyNumber(calculation.gradientDelta, 3)} °C`
                : '—'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Kengaytirilgan noaniqlik (U)
            </span>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {calculation.U > 0 ? `± ${formatMetrologyNumber(calculation.U, 2)} °C` : '—'}
            </span>
          </div>
        </div>

        {/* 3D Cube (Left) + 9 Point Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <ChamberCube3D
              pointsData={pointsData}
              selectedPointId={selectedPointId}
              onSelectPoint={handleOpenPointModal}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
              Shkafni sichqoncha bilan o‘ng va chapga aylantirishingiz hamda nuqtalar ustiga bosishingiz mumkin
            </p>
          </div>

          {/* 9 Points Status Cards List */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Kamera Nuqtalari (N1 — N9)
              </span>
              <span className="text-xs text-slate-400">
                Har bir nuqtaga bosib o‘lchov kiriting
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[440px] overflow-y-auto pr-1">
              {CHAMBER_POINTS_CONFIG.map((pt) => {
                const data = pointsData.find((p) => p.id === pt.id);
                const stat = calculation.pointStats[pt.id];
                const entered =
                  data && data.rows.some((r) => r.tStd !== '' && !isNaN(Number(r.tStd)));
                const isCenter = pt.isCenter;

                return (
                  <div
                    key={pt.id}
                    onClick={() => handleOpenPointModal(pt.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedPointId === pt.id
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500'
                        : entered
                        ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          isCenter
                            ? 'bg-amber-500 text-white'
                            : entered
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {pt.id}
                      </span>

                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {pt.nameUz}
                          </span>
                          {isCenter && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                              Markaz
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          {pt.positionDesc}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {entered && stat ? (
                        <>
                          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 block">
                            {formatMetrologyNumber(stat.meanStd, 2)} °C
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Δ = {stat.diffFromCenter.toFixed(2)} °C
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Kiritilmagan
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* BOSQICH 2: Noaniqlik byudjeti (10 ta komponent) */}
      <div className="relative">
        {/* Mind map node */}
        <div aria-hidden="true" className="absolute -left-3.5 sm:-left-5.5 lg:-left-6 top-6 -translate-x-1/2 flex items-center pointer-events-none">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-slate-50 dark:ring-slate-950 shadow-sm shadow-emerald-500/30">
            2
          </div>
          <div className="w-3.5 sm:w-5.5 lg:w-6 h-0.5 bg-emerald-500/80" />
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-emerald-600" />
                <span>Noaniqlik byudjeti (10 ta komponent)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quritish shkafi standart noaniqlik komponentlari, sezgirlik koeffitsientlari va yig‘indi dispersiya
              </p>
            </div>
          </div>

          <UncertaintyBudgetTable calculation={calculation} info={info} />
        </section>
      </div>

      {/* BOSQICH 3: Buyurtmachi va Obyekt rekvizitlari */}
      <div className="relative">
        {/* Mind map node */}
        <div aria-hidden="true" className="absolute -left-3.5 sm:-left-5.5 lg:-left-6 top-6 -translate-x-1/2 flex items-center pointer-events-none">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-slate-50 dark:ring-slate-950 shadow-sm shadow-indigo-500/30">
            3
          </div>
          <div className="w-3.5 sm:w-5.5 lg:w-6 h-0.5 bg-indigo-500/80" />
        </div>

        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              3
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Buyurtmachi va Obyekt rekvizitlari</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sertifikat va bayonnomada aks etuvchi rasmiy identifikatsiya ma‘lumotlari
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                Sertifikat raqami:
              </label>
              <input
                type="text"
                value={info.certificateNumber}
                onChange={(e) => setInfo({ ...info, certificateNumber: e.target.value })}
                placeholder="01/24-1123"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Berilgan sana:</span>
              </label>
              <input
                type="text"
                value={info.issueDate}
                onChange={(e) => setInfo({ ...info, issueDate: e.target.value })}
                placeholder="2025-04-29"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                Buyurtmachi tashkilot:
              </label>
              <input
                type="text"
                value={info.customerName}
                onChange={(e) => setInfo({ ...info, customerName: e.target.value })}
                placeholder="«O‘zbekiston Milliy Metrologiya Instituti» DK"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                Buyurtmachi manzili:
              </label>
              <input
                type="text"
                value={info.customerAddress}
                onChange={(e) => setInfo({ ...info, customerAddress: e.target.value })}
                placeholder="Toshkent sh., Chilonzor tumani, Farxod ko‘chasi, 333 A"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                Ishlab chiqaruvchi:
              </label>
              <input
                type="text"
                value={info.manufacturer}
                onChange={(e) => setInfo({ ...info, manufacturer: e.target.value })}
                placeholder="Xitoy, RTOP Instruments"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                Harorat diapazoni (°C):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={info.tempRangeMin !== 0 ? info.tempRangeMin : ''}
                  onChange={(e) => setInfo({ ...info, tempRangeMin: parseFloat(e.target.value) || 0 })}
                  className="w-1/2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  placeholder="Min (0.0)"
                />
                <span className="text-slate-400 font-bold">...</span>
                <input
                  type="text"
                  value={info.tempRangeMax !== 0 ? info.tempRangeMax : ''}
                  onChange={(e) => setInfo({ ...info, tempRangeMax: parseFloat(e.target.value) || 0 })}
                  className="w-1/2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  placeholder="Max (50.0)"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                Ajratish qobiliyati / Diskretligi (°C):
              </label>
              <input
                type="text"
                value={info.resolution ? info.resolution : ''}
                onChange={(e) => setInfo({ ...info, resolution: parseFloat(e.target.value) || 0 })}
                placeholder="0.1"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                Kalibrlovchi mutaxassis (F.I.O):
              </label>
              <input
                type="text"
                value={info.calibratedByUz}
                onChange={(e) => setInfo({ ...info, calibratedByUz: e.target.value, calibratedByRu: e.target.value })}
                placeholder="G'aibnazarov Boburjon"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                Tekshirdi (F.I.O):
              </label>
              <input
                type="text"
                value={info.checkedByUz}
                onChange={(e) => setInfo({ ...info, checkedByUz: e.target.value, checkedByRu: e.target.value })}
                placeholder="Abdullaev A."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                Kalibrlash davriyligi:
              </label>
              <input
                type="text"
                value={info.calibrationPeriod}
                onChange={(e) => setInfo({ ...info, calibrationPeriod: e.target.value })}
                placeholder="12 oy"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                Buyurtma (Zayavka) raqami:
              </label>
              <input
                type="text"
                value={info.orderNumber}
                onChange={(e) => setInfo({ ...info, orderNumber: e.target.value })}
                placeholder="№ 25-112-xxxxxx"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </section>
      </div>

      {/* BOSQICH 4: Etalonlar va Laboratoriya sharoitlari */}
      <div className="relative">
        {/* Mind map node */}
        <div aria-hidden="true" className="absolute -left-3.5 sm:-left-5.5 lg:-left-6 top-6 -translate-x-1/2 flex items-center pointer-events-none">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-slate-50 dark:ring-slate-950 shadow-sm shadow-amber-500/30">
            4
          </div>
          <div className="w-3.5 sm:w-5.5 lg:w-6 h-0.5 bg-amber-500/80" />
        </div>

        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            4
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>Etalonlar va Laboratoriya Sharoitlari</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Metrologik etalon parametrlari, nurlanish va atrof-muhit ko‘rsatkichlari
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              Etalon nomi:
            </label>
            <input
              type="text"
              value={info.standardName}
              onChange={(e) => setInfo({ ...info, standardName: e.target.value })}
              placeholder="Termometr laboratoriy elektron va Kalibrator"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              Etalon turi / rusumi:
            </label>
            <input
              type="text"
              value={info.standardType}
              onChange={(e) => setInfo({ ...info, standardType: e.target.value })}
              placeholder="LTA/B-300MT / STS-200 A 915"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              Etalon zavod raqamlari:
            </label>
            <input
              type="text"
              value={info.standardSerial}
              onChange={(e) => setInfo({ ...info, standardSerial: e.target.value })}
              placeholder="№ 871352 / № 613343-19"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              Metrologik kuzatiluvchanlik:
            </label>
            <input
              type="text"
              value={info.standardTraceability}
              onChange={(e) => setInfo({ ...info, standardTraceability: e.target.value })}
              placeholder="O‘zMMI Milliy etalonlar bazasi"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              Etalon noaniqligi U_cal.std (°C):
            </label>
            <input
              type="text"
              value={info.standardCertUncertainty ? info.standardCertUncertainty : ''}
              onChange={(e) =>
                setInfo({ ...info, standardCertUncertainty: parseFloat(e.target.value) || 0 })
              }
              placeholder="0.05"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              Etalon diskretligi rez_std (°C):
            </label>
            <input
              type="text"
              value={info.standardResolution ? info.standardResolution : ''}
              onChange={(e) =>
                setInfo({ ...info, standardResolution: parseFloat(e.target.value) || 0 })
              }
              placeholder="0.001"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              Devorlar nurlanishi farqi Δ_rad (°C):
            </label>
            <input
              type="text"
              value={info.deltaRadiation ? info.deltaRadiation : ''}
              onChange={(e) =>
                setInfo({ ...info, deltaRadiation: parseFloat(e.target.value) || 0.075 })
              }
              placeholder="0.075"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              Kamera yuklanishi farqi Δ_load (°C):
            </label>
            <input
              type="text"
              value={info.deltaLoad ? info.deltaLoad : ''}
              onChange={(e) =>
                setInfo({ ...info, deltaLoad: parseFloat(e.target.value) || 0.092 })
              }
              placeholder="0.092"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              Atrof-muhit harorati (°C):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={info.ambientTempMin !== 0 ? info.ambientTempMin : ''}
                onChange={(e) =>
                  setInfo({ ...info, ambientTempMin: parseFloat(e.target.value) || 0 })
                }
                className="w-1/2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                placeholder="Boshida (24.0)"
              />
              <span className="text-slate-400 font-bold">...</span>
              <input
                type="text"
                value={info.ambientTempMax !== 0 ? info.ambientTempMax : ''}
                onChange={(e) =>
                  setInfo({ ...info, ambientTempMax: parseFloat(e.target.value) || 0 })
                }
                className="w-1/2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                placeholder="Oxirida (24.5)"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              Nisbiy namlik (%):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={info.relativeHumidityMin !== 0 ? info.relativeHumidityMin : ''}
                onChange={(e) =>
                  setInfo({ ...info, relativeHumidityMin: parseFloat(e.target.value) || 0 })
                }
                className="w-1/2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                placeholder="Boshida (37.7)"
              />
              <span className="text-slate-400 font-bold">...</span>
              <input
                type="text"
                value={info.relativeHumidityMax !== 0 ? info.relativeHumidityMax : ''}
                onChange={(e) =>
                  setInfo({ ...info, relativeHumidityMax: parseFloat(e.target.value) || 0 })
                }
                className="w-1/2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                placeholder="Oxirida (38.5)"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span>Atmosfera bosimi (hPa):</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={info.atmosphericPressureMin && info.atmosphericPressureMin !== 0 ? info.atmosphericPressureMin : ''}
                onChange={(e) =>
                  setInfo({ ...info, atmosphericPressureMin: parseFloat(e.target.value) || 0 })
                }
                className="w-1/2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                placeholder="Boshida (1012.2)"
              />
              <span className="text-slate-400 font-bold">...</span>
              <input
                type="text"
                value={info.atmosphericPressureMax && info.atmosphericPressureMax !== 0 ? info.atmosphericPressureMax : ''}
                onChange={(e) =>
                  setInfo({ ...info, atmosphericPressureMax: parseFloat(e.target.value) || 0 })
                }
                className="w-1/2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                placeholder="Oxirida (1013.0)"
              />
            </div>
          </div>
        </div>
        </section>
      </div>

      {/* BOSQICH 5 (YAKUNIY): Sertifikat va Bayonnoma yaratish tugmalari */}
      <div className="relative">
        {/* Mind map node */}
        <div aria-hidden="true" className="absolute -left-3.5 sm:-left-5.5 lg:-left-6 top-8 -translate-x-1/2 flex items-center pointer-events-none">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-slate-50 dark:ring-slate-950 shadow-md shadow-blue-500/40">
            5
          </div>
          <div className="w-3.5 sm:w-5.5 lg:w-6 h-0.5 bg-blue-500/80" />
        </div>

        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 border border-blue-800/40 shadow-2xl relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <span>5-bosqich: Yakuniy Hujjatlarni Shakllantirish</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bayonnoma va Sertifikatni Yaratish
            </h2>

            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Barcha kiritilgan qiymatlar va noaniqlik byudjeti asosida rasmiy bayonnoma (Excel) hamda kalibrlash sertifikatini (PDF) shakllantiring.
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              {/* Bayonnoma (Excel) yaratish tugmasi */}
              <button
                type="button"
                onClick={onOpenProtocolExcel}
                className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-emerald-400/30 hover:border-emerald-400/60 active:scale-98 transition-all cursor-pointer text-left shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-600/30 flex items-center justify-center text-emerald-300 mb-3 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-base font-bold text-white text-center">
                  Bayonnoma (Excel)
                </span>
                <span className="text-xs text-slate-300 text-center mt-1">
                  Ko‘rish, tahrirlash va .xlsx yuklab olish
                </span>
              </button>

              {/* Sertifikat (PDF) yaratish tugmasi */}
              <button
                type="button"
                onClick={onGenerateCertificate}
                className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 transition-all cursor-pointer text-left shadow-xl shadow-blue-600/30"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                  <FileBadge className="w-6 h-6 text-white" />
                </div>
                <span className="text-base font-bold text-white text-center">
                  Sertifikat (PDF)
                </span>
                <span className="text-xs text-blue-100 text-center mt-1">
                  Rasmiy 4 sahifali PDF sertifikat yaratish
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Point Data Modal */}
      {isModalOpen && selectedPoint && (
        <PointDataModal
          pointData={selectedPoint}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdatePointRows={handleUpdatePointRows}
          onNavigatePoint={handleNavigatePoint}
        />
      )}
    </div>
  );
};
