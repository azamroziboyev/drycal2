import React, { useState } from 'react';
import { CalibrationItemInfo, ChamberCalculation, ChamberPointData } from '../types';
import { formatMetrologyNumber } from '../utils/metrology';
import { UzNimLogo, QrCodeSvg } from './UzNimLogo';
import { downloadElementAsPdf } from '../utils/pdfGenerator';
import {
  Download,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface OfficialCertificateViewProps {
  info: CalibrationItemInfo;
  calculation: ChamberCalculation;
  pointsData: ChamberPointData[];
  onBackToEdit: () => void;
  onSaveCertificate: () => void;
  onUpdateInfo?: (updatedInfo: Partial<CalibrationItemInfo>) => void;
}

export const OfficialCertificateView: React.FC<OfficialCertificateViewProps> = ({
  info,
  calculation,
  onBackToEdit,
  onSaveCertificate,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ percent: number; status: string }>({
    percent: 0,
    status: '',
  });
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);
    setErrorMessage('');

    onSaveCertificate();

    try {
      const pageIds = ['cert-page-1', 'cert-page-2', 'cert-page-3', 'cert-page-4'];
      const cleanFileName = `Sertifikat_${(info.certificateNumber || 'Uz-112-1-2025').replace(/[\/\\]/g, '_')}_${info.serialNumber || '2333001557'}.pdf`;

      await downloadElementAsPdf(pageIds, cleanFileName, (percent, status) => {
        setPdfProgress({ percent, status });
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: any) {
      console.error('PDF generation error', err);
      setErrorMessage(
        'Sertifikatni yuklab olishda muammo yuz berdi. Iltimos qaytadan urinib ko‘ring.'
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const pointTemp = calculation.pointTemp || 30.0;
  const refValue = calculation.centerStdMean || 29.59;
  const indValue = calculation.overallIndMean > 0 ? calculation.overallIndMean : (calculation.centerIndMean || 29.97);
  const devValue = calculation.deviation !== undefined ? calculation.deviation : -0.37;
  const extUncertainty = calculation.U || 0.18;

  // Page 1 Header WITH Logo (Logo ONLY appears on page 1 as in official PDF)
  const renderPage1Header = () => (
    <div className="flex items-center justify-between pb-3">
      <div className="w-28 shrink-0 flex items-center justify-start">
        <UzNimLogo size={58} />
      </div>

      <div className="flex-1 text-center px-4">
        <div className="text-[12px] font-bold text-black leading-tight">
          Хорезмский филиал ГУ «Узбекский
        </div>
        <div className="text-[12px] font-bold text-black leading-tight">
          национальный институт метрологии»
        </div>
        <div className="text-[10.5px] italic text-black leading-tight mt-0.5">
          "Uzbek National Institute of Metrology" state institution
        </div>
        <div className="text-[10.5px] italic text-black leading-tight">
          Khorezm branch
        </div>
      </div>

      {/* Top Right 3-Row Box */}
      <div className="border border-black text-center text-[10.5px] w-32 shrink-0 font-bold leading-tight">
        <div className="border-b border-black py-1 px-1 font-mono">{info.certificateNumber || 'Uz-112/1-2025'}</div>
        <div className="border-b border-black py-1 px-1 font-mono">O'ZAK.KL.0013</div>
        <div className="py-1 px-1 font-mono">{info.issueDate || '2025-04-29'}</div>
      </div>
    </div>
  );

  // Subsequent Pages Header (Pages 2, 3, 4) - WITHOUT Logo, branch text on left
  const renderSubsequentHeader = () => (
    <div className="flex items-start justify-between pb-2">
      <div className="flex-1 text-left pr-4">
        <div className="text-[11px] font-bold text-black leading-tight">
          Хорезмский филиал ГУ «Узбекский национальный институт метрологии»
        </div>
        <div className="text-[10px] italic text-black leading-tight mt-0.5">
          "Uzbek National Institute of Metrology" state institution Khorezm branch
        </div>
      </div>

      {/* Top Right 3-Row Box */}
      <div className="border border-black text-center text-[10.5px] w-32 shrink-0 font-bold leading-tight">
        <div className="border-b border-black py-1 px-1 font-mono">{info.certificateNumber || 'Uz-112/1-2025'}</div>
        <div className="border-b border-black py-1 px-1 font-mono">O'ZAK.KL.0013</div>
        <div className="py-1 px-1 font-mono">{info.issueDate || '2025-04-29'}</div>
      </div>
    </div>
  );

  // Sub-Header for Pages 2, 3, 4 (Exact layout matching the PDF)
  const renderPageSubHeader = (pageNumber: number) => (
    <div className="flex justify-between items-start pt-3 pb-2 text-[11px] mb-2">
      <div className="flex items-baseline gap-2">
        <div>
          <span className="font-bold">Номер сертификата:</span>
          <div className="italic text-[10px] leading-none">Certificate number:</div>
        </div>
        <span className="font-bold font-mono border-b border-black border-dashed pb-0.5 px-3 min-w-[140px] text-center inline-block">
          {info.certificateNumber || 'Uz-112/1-2025'}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <div>
          <span className="font-bold">Страница:</span>
          <div className="italic text-[10px] leading-none">Page:</div>
        </div>
        <span className="font-bold font-mono border-b border-black pb-0.5 px-3 min-w-[36px] text-center inline-block">
          {pageNumber}
        </span>
      </div>
    </div>
  );

  // Standard Footer on all 4 pages
  const renderPageFooter = () => (
    <div className="pt-2 text-[9px] text-black flex justify-between items-end border-t border-transparent">
      <div className="leading-tight">
        <div className="font-bold">КЛ-ЖХ-19 приложение "В"</div>
        <div>(2022-06-01)</div>
      </div>
      <div className="text-right leading-tight">
        <div>Узбекистан, Хорезмская обл., г. Ургенч, ул. Ханкинская, 107Б, xorazm@nim.uz</div>
        <div>107B, Khonqa str., the city of Urgench, Khorezm r, Uzbekistan, xorazm@nim.uz</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Official Certificate PDF Toolbar */}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-colors">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToEdit}
              className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer text-white"
              title="Tahrirlashga qaytish"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="bg-white text-blue-700 p-1.5 rounded-lg font-black text-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-wide">
                    Sertifikat (PDF) • {info.certificateNumber || 'Uz-112/1-2025'}
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-medium">
                    Rasmiy Blank (4 sahifa)
                  </span>
                </div>
                <div className="text-[11px] text-white/80">
                  O‘zMMI Kalibrlash Sertifikati (KU-10-2025 / EURAMET Calibration Guide No. 20)
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-blue-800 hover:bg-blue-50 shadow-sm transition cursor-pointer disabled:opacity-60"
              title="Sertifikatni rasmiy PDF formatida yuklab olish"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
                  <span>{pdfProgress.percent}% (PDF)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-blue-700" />
                  <span>Sertifikatni PDF yuklab olish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 print:hidden">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Sertifikat PDF formati muvaffaqiyatli saqlandi va yuklab olindi!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2 print:hidden">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pages Container: Clean A4 sheets matching the PDF */}
      <div className="flex flex-col items-center gap-8 py-4 bg-slate-200 dark:bg-slate-950 p-4 rounded-2xl overflow-x-auto">
        
        {/* ==================== PAGE 1 ==================== */}
        <div
          id="cert-page-1"
          className="w-[210mm] min-h-[297mm] h-[297mm] p-[16mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm]"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div>
            {renderPage1Header()}

            {/* Title */}
            <div className="text-center my-6">
              <h2 className="text-[16px] font-bold text-black uppercase tracking-wide">
                Сертификат калибровки
              </h2>
              <h3 className="text-[12px] italic text-black mt-0.5">
                Calibration certificate
              </h3>
            </div>

            {/* General Metadata 3-Column Grid */}
            <div className="grid grid-cols-3 gap-6 my-4 text-center text-xs">
              <div>
                <div className="font-bold">Дата выдачи:</div>
                <div className="italic text-[10px]">Date of issue:</div>
                <div className="mt-1 font-mono font-medium">{info.issueDate || '2025-04-29'}</div>
              </div>
              <div>
                <div className="font-bold">Номер сертификата:</div>
                <div className="italic text-[10px]">Certificate number:</div>
                <div className="mt-1 font-mono font-bold">{info.certificateNumber || 'Uz-112/1-2025'}</div>
              </div>
              <div>
                <div className="font-bold">Количество страниц:</div>
                <div className="italic text-[10px]">Number of pages:</div>
                <div className="mt-1 font-mono font-medium">4</div>
              </div>
            </div>

            {/* Dotted separator line across the page */}
            <div className="border-b border-dotted border-black my-4" />

            {/* Items Details List */}
            <div className="space-y-4 my-6 text-[11.5px]">
              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-4">
                  <div className="font-bold">Объект калибровки:</div>
                  <div className="italic text-[10px]">Calibration item:</div>
                </div>
                <div className="col-span-8">
                  <div className="font-bold">{info.objectName || 'Сушильные шкаф (Quritish shkafi)'}</div>
                  <div className="italic text-[10.5px] text-slate-800">Temperature chamber (Drying oven)</div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-4">
                  <div className="font-bold">Производитель:</div>
                  <div className="italic text-[10px]">Manufacturer:</div>
                </div>
                <div className="col-span-8">{info.manufacturer || 'Китай (CN)'}</div>
              </div>

              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-4">
                  <div className="font-bold">Тип (модель, серия):</div>
                  <div className="italic text-[10px]">Type (model, series):</div>
                </div>
                <div className="col-span-8 font-mono">{info.objectType || 'RTOP-500Y'}</div>
              </div>

              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-4">
                  <div className="font-bold">Серийный номер:</div>
                  <div className="italic text-[10px]">Serial number:</div>
                </div>
                <div className="col-span-8 font-mono font-bold">{info.serialNumber || '2333001557'}</div>
              </div>

              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-4">
                  <div className="font-bold">Заказчик:</div>
                  <div className="italic text-[10px]">Customer:</div>
                </div>
                <div className="col-span-8">{info.customerName || '-'}</div>
              </div>
            </div>

            {/* Calibrated by & Bottom Notice Boxes */}
            <div className="mt-14 mb-2">
              {/* Calibration performed by line */}
              <div className="flex justify-end mb-6">
                <div className="w-[62%]">
                  <div className="flex items-end justify-between gap-3">
                    <div className="shrink-0">
                      <div className="font-bold text-[11px]">Калибровку выполнил:</div>
                      <div className="italic text-[10px]">Calibration performed by:</div>
                    </div>
                    <div className="font-bold text-[11.5px] border-b border-black pb-0.5 flex-1 text-center font-mono">
                      {info.calibratedByUz || "G'aibnazarov Boburjon"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Two Boxes */}
              <div className="grid grid-cols-12 gap-4 items-stretch">
                {/* Warning Red Box on Left */}
                <div className="col-span-5 border border-red-500 p-2.5 text-center text-[9px] leading-tight text-red-600 flex flex-col justify-center">
                  <p className="font-bold">
                    Сертификат калибровки рассматривается как недействительный без сгенерированного системой e-metrologiya.uz листа, содержащего ссылку на него
                  </p>
                  <p className="italic mt-1.5 text-red-500">
                    The calibration certificate is considered invalid without a sheet generated by the e-metrologiya.uz system containing a link to it
                  </p>
                </div>

                {/* Reproduction Black Box on Right */}
                <div className="col-span-7 border border-black p-2.5 text-center text-[10px] leading-snug flex flex-col justify-center">
                  <p className="font-bold text-black">
                    Сертификат калибровки не может быть воспроизведен, кроме как в полном объеме
                  </p>
                  <p className="italic text-black mt-0.5">
                    Calibration certificate shall not be reproduced except in full
                  </p>
                </div>
              </div>
            </div>
          </div>

          {renderPageFooter()}
        </div>

        {/* ==================== PAGE 2 ==================== */}
        <div
          id="cert-page-2"
          className="w-[210mm] min-h-[297mm] h-[297mm] p-[16mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm]"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div>
            {renderSubsequentHeader()}
            {renderPageSubHeader(2)}

            {/* Content items */}
            <div className="space-y-4 my-3 text-[11px]">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <div className="font-bold">Запрос на калибровку:</div>
                  <div className="italic text-[10px]">Calibration request:</div>
                </div>
                <div className="col-span-8 flex items-center gap-3">
                  <span className="italic text-[10.5px]">от from</span>
                  <span className="font-mono">{info.orderNumber || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <div className="font-bold">Период калибровки:</div>
                  <div className="italic text-[10px]">Calibration period:</div>
                </div>
                <div className="col-span-8 font-mono">
                  {info.calibrationPeriod || info.issueDate || '2025-04-29'}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <div className="font-bold">Наименование лаборатории:</div>
                  <div className="italic text-[10px]">Name of laboratory:</div>
                </div>
                <div className="col-span-8 leading-snug">
                  <div className="font-bold text-[10.5px]">
                    {info.laboratoryNameRu ||
                      'Лаборатория сравнения и калибровки физико-химических приборов, измерителей плотности, давления и температуры'}
                  </div>
                  <div className="italic text-[10px] mt-0.5">
                    {info.laboratoryNameEn ||
                      'Laboratory for comparison and calibration of physical and chemical instruments, density, pressure and temperature meters'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <div className="font-bold">Место осуществления измерений:</div>
                  <div className="italic text-[10px]">Location of performance of measurement:</div>
                </div>
                <div className="col-span-8 leading-snug">
                  <div className="font-bold text-[10.5px]">
                    Хорезмский филиал ГУ «Узбекский национальный институт метрологии»
                  </div>
                  <div className="font-bold text-[10.5px]">
                    Республика Узбекистан, Хорезмская область, город Ургенч, улица Ханкинская, 107Б, тел: +998 78 770-46-15, www.nim.uz
                  </div>
                  <div className="italic text-[10px] mt-0.5">
                    "Uzbek National Institute of Metrology" state institution Khorezm branch
                  </div>
                  <div className="italic text-[10px]">
                    107B, Khonqa street, the city of Urgench, Khorezm region, Republic of Uzbekistan, tel: +998 78 770-46-15, www.nim.uz
                  </div>
                </div>
              </div>

              {/* Environmental Conditions Table */}
              <div className="pt-3">
                <div className="mb-2">
                  <div className="font-bold text-[11px]">Условия калибровки:</div>
                  <div className="italic text-[10px]">Calibration conditions:</div>
                </div>

                <table className="w-full border-collapse border border-black text-[10.5px]">
                  <thead>
                    <tr className="text-center font-bold">
                      <th className="border border-black p-2 w-[45%]">
                        <div>Контролируемые показатели</div>
                        <div className="italic font-normal text-[9.5px]">Controlled indicators</div>
                      </th>
                      <th className="border border-black p-2 w-[14%]">
                        <div>от</div>
                        <div className="italic font-normal text-[9.5px]">from</div>
                      </th>
                      <th className="border border-black p-2 w-[14%]">
                        <div>до</div>
                        <div className="italic font-normal text-[9.5px]">to</div>
                      </th>
                      <th className="border border-black p-2 w-[27%]">
                        <div>Примечание</div>
                        <div className="italic font-normal text-[9.5px]">Remark</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-left">
                        <div className="font-bold">Температура окружающего воздуха, °С</div>
                        <div className="italic text-[9.5px]">Ambient temperature, °С</div>
                      </td>
                      <td className="border border-black p-2 text-center font-mono">
                        {info.ambientTempMin !== undefined ? String(info.ambientTempMin).replace('.', ',') : '24,0'}
                      </td>
                      <td className="border border-black p-2 text-center font-mono">
                        {info.ambientTempMax !== undefined ? String(info.ambientTempMax).replace('.', ',') : '24,5'}
                      </td>
                      <td className="border border-black p-2 text-center">
                        <div className="font-bold">в пределах 1,0 °С в 24 h</div>
                        <div className="italic text-[9.5px]">within 1,0 °С in 24 h</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-left">
                        <div className="font-bold">Относительная влажность окружающей среды, %</div>
                        <div className="italic text-[9.5px]">Ambient relative humidity, %</div>
                      </td>
                      <td className="border border-black p-2 text-center font-mono">
                        {info.relativeHumidityMin !== undefined ? String(info.relativeHumidityMin).replace('.', ',') : '37,7'}
                      </td>
                      <td className="border border-black p-2 text-center font-mono">
                        {info.relativeHumidityMax !== undefined ? String(info.relativeHumidityMax).replace('.', ',') : '38,5'}
                      </td>
                      <td className="border border-black p-2 text-center">
                        <div className="font-bold">в пределах 10 % в 24 h</div>
                        <div className="italic text-[9.5px]">within 10 % in 24 h</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-left">
                        <div className="font-bold">Атмосферное давление, hPa</div>
                        <div className="italic text-[9.5px]">Air pressure, hPa</div>
                      </td>
                      <td className="border border-black p-2 text-center font-mono">
                        {info.atmosphericPressureMin !== undefined ? String(info.atmosphericPressureMin).replace('.', ',') : '1012,2'}
                      </td>
                      <td className="border border-black p-2 text-center font-mono">
                        {info.atmosphericPressureMax !== undefined ? String(info.atmosphericPressureMax).replace('.', ',') : '1013,0'}
                      </td>
                      <td className="border border-black p-2 text-center">
                        <div className="font-bold">в пределах ± 8 hPa в 24 h</div>
                        <div className="italic text-[9.5px]">within to ±8 hPa in 24 h</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {renderPageFooter()}
        </div>

        {/* ==================== PAGE 3 ==================== */}
        <div
          id="cert-page-3"
          className="w-[210mm] min-h-[297mm] h-[297mm] p-[16mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm]"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div>
            {renderSubsequentHeader()}
            {renderPageSubHeader(3)}

            {/* Method and calibration procedure */}
            <div className="my-3">
              <div className="font-bold text-[11px]">Метод и калибровочная процедура:</div>
              <div className="italic text-[10px] mb-1">Method and calibration procedure:</div>
              <div className="italic text-[10.5px] leading-snug space-y-0.5">
                <div>KU-10-2025. Камера температуры (сушильные шкафы). Методика калибровки.</div>
                <div>
                  EURAMET Calibration Guide No. 20 Версия 5.0 Calibration of Temperature and/or Humidity Enclosures.
                </div>
              </div>
            </div>

            {/* Standards Table */}
            <div className="my-3">
              <div className="mb-1">
                <div className="font-bold text-[11px]">Калибровка выполнена с помощью:</div>
                <div className="italic text-[10px]">Calibration is performed by using:</div>
              </div>

              <table className="w-full border-collapse border border-black text-[10px] text-center">
                <thead>
                  <tr className="font-bold">
                    <th className="border border-black p-1.5 w-8">№</th>
                    <th className="border border-black p-1.5 w-[33%]">
                      <div>Опорный измерительный эталон</div>
                      <div className="italic font-normal text-[9px]">Reference measurement standart</div>
                    </th>
                    <th className="border border-black p-1.5 w-[20%]">
                      <div>Тип / Модель</div>
                      <div className="italic font-normal text-[9px]">Type / Model</div>
                    </th>
                    <th className="border border-black p-1.5 w-[19%]">
                      <div>Серийный номер</div>
                      <div className="italic font-normal text-[9px]">Serial Number</div>
                    </th>
                    <th className="border border-black p-1.5 w-[24%]">
                      <div>Метрологическая прослеживаемость</div>
                      <div className="italic font-normal text-[9px]">Metrological traceability</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-1.5 font-bold">1</td>
                    <td className="border border-black p-1.5 text-left">
                      <div className="font-bold">
                        {info.standardName || 'Термометр лабораторний электронный'}
                      </div>
                      <div className="italic text-[9px]">Electronic laboratory thermometer</div>
                    </td>
                    <td className="border border-black p-1.5 font-mono">
                      {info.standardType || 'LTA/Б-300МТ'}
                    </td>
                    <td className="border border-black p-1.5 font-mono">
                      {info.standardSerial || '871352'}
                    </td>
                    <td className="border border-black p-1.5 text-[9.5px]">
                      {info.standardTraceability || 'UZ-09T/2927-2024 от 07.11.2024 г.'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 font-bold">2</td>
                    <td className="border border-black p-1.5 text-left">
                      <div className="font-bold">
                        Термометр сопротивления с цифровой индикацией (Калибратор температуры)
                      </div>
                      <div className="italic text-[9px]">
                        Resistance thermometer with digital indication (Temperature Calibrator)
                      </div>
                    </td>
                    <td className="border border-black p-1.5 font-mono">STS-200 A 915 (RTC-156B)</td>
                    <td className="border border-black p-1.5 font-mono">613343-19 (617498-00393)</td>
                    <td className="border border-black p-1.5 text-[9.5px]">
                      Uz-09T/630-2025 от 14.04.2025 г.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calibration Results Table (Exact single row matching the user's PDF) */}
            <div className="my-3">
              <div className="mb-1">
                <div className="font-bold text-[11px]">Результаты калибровки, включая неопределенность</div>
                <div className="italic text-[10px]">Calibration results including uncertainty</div>
              </div>

              <table className="w-full border-collapse border border-black text-[10px] text-center">
                <thead>
                  <tr className="font-bold">
                    <th className="border border-black p-1.5 w-1/5">
                      <div>Номинальная температура, °C</div>
                      <div className="italic font-normal text-[9px]">Nominal temperature, °C</div>
                    </th>
                    <th className="border border-black p-1.5 w-1/5">
                      <div>Опорное значение, °С</div>
                      <div className="italic font-normal text-[9px]">Support meaning, °C</div>
                    </th>
                    <th className="border border-black p-1.5 w-1/5">
                      <div>Показание объекта калибровки, °С</div>
                      <div className="italic font-normal text-[9px]">
                        Indication of the calibration object, °C
                      </div>
                    </th>
                    <th className="border border-black p-1.5 w-1/5">
                      <div>Отклонение, °C</div>
                      <div className="italic font-normal text-[9px]">Deviation, °C</div>
                    </th>
                    <th className="border border-black p-1.5 w-1/5">
                      <div>Расширенная неопределенность, °C</div>
                      <div className="italic font-normal text-[9px]">
                        Expanded uncertainty, °C
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-mono font-medium">
                    <td className="border border-black p-1.5">
                      {formatMetrologyNumber(pointTemp, 1)}
                    </td>
                    <td className="border border-black p-1.5">
                      {formatMetrologyNumber(refValue, 2)}
                    </td>
                    <td className="border border-black p-1.5">
                      {formatMetrologyNumber(indValue, 2)}
                    </td>
                    <td className="border border-black p-1.5">
                      {formatMetrologyNumber(devValue, 2)}
                    </td>
                    <td className="border border-black p-1.5">
                      {formatMetrologyNumber(extUncertainty, 2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Information & Diagonal Hatched Pattern */}
            <div className="my-3">
              <div className="font-bold text-[11px]">Дополнительная информация</div>
              <div className="italic text-[10px] mb-1">Additional information</div>
              <div className="text-[10.5px] mb-2">{info.additionalInfo || '-------'}</div>

              {/* Diagonal dashed hatching matching the PDF */}
              <div className="relative h-32 border border-dashed border-slate-300 overflow-hidden bg-white">
                <svg width="100%" height="100%" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <pattern id="certDiagHatch" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="40" stroke="#000" strokeWidth="1.2" strokeDasharray="6,4" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#certDiagHatch)" />
                </svg>
              </div>
            </div>
          </div>

          {renderPageFooter()}
        </div>

        {/* ==================== PAGE 4 ==================== */}
        <div
          id="cert-page-4"
          className="w-[210mm] min-h-[297mm] h-[297mm] p-[16mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm]"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div>
            {renderSubsequentHeader()}
            {renderPageSubHeader(4)}

            {/* First Bordered Box: GUM & SI Traceability & Result Reference */}
            <div className="border border-black p-3.5 text-center space-y-2.5 my-3 text-[10.5px] leading-snug">
              <div>
                <p className="font-bold">
                  Указанная расширенная неопределенность измерений определяется как стандартная неопределенность измерений, умноженная на коэффициент охвата k = 2, что для нормального распределения соответствует вероятности охвата приблизительно 95 %. Стандартная неопределенность измерений определена в соответствии с GUM.
                </p>
                <p className="italic mt-0.5 text-[9.5px]">
                  The reported expanded uncertainty of measurement is stated as the standard uncertainty of measurement multiplied by the coverage factor k = 2, which for a normal distribution corresponds to a coverage probability of approximately 95 %. The standard uncertainty of measurement has been determined in accordance with GUM.
                </p>
              </div>

              <div>
                <p className="font-bold">
                  Все измерения имеют прослеживаемость к единицам Международной системы SI
                </p>
                <p className="italic text-[9.5px]">All measurements are traceable to the SI units</p>
              </div>

              <div>
                <p className="font-bold">
                  Результат калибровки относится только к объекту калибровки
                </p>
                <p className="italic text-[9.5px]">The calibration result refers only to the calibration item</p>
              </div>
            </div>

            {/* Second Bordered Box: CIPM, O'ZAKK, APAC & ILAC Agreements */}
            <div className="border border-black p-3.5 text-center space-y-2.5 my-3 text-[10px] leading-snug">
              <div>
                <p className="font-bold">
                  Узбекский национальный институт метрологии является подписантом Договорённости о взаимном признании (MRA) Международного комитета по весам и мерам (CIPM).
                </p>
                <p className="italic mt-0.5 text-[9.5px]">
                  Uzbek National institute of Metrology is a signatory of the International Committee for Weights and Measures (CIPM) Mutual Recognition Arrangement (MRA).
                </p>
              </div>

              <div>
                <p className="font-bold">
                  Хорезмский филиал ГУ «Узбекский национальный институт метрологии» аккредитован Узбекским центром аккредитации (O‘ZAKK) под регистрационным номером O‘ZAK.KL.0013 по O‘z DSt ISO/IEC 17025:2019 как калибровочная лаборатория.
                </p>
                <p className="italic mt-0.5 text-[9.5px]">
                  "Uzbek National Institute of Metrology" state institution Khorezm branch accredited by Uzbek Accreditation Center (O‘ZAKK) under registration number O‘ZAK.KL.0013 for O‘z DSt ISO/IEC 17025:2019 as Calibration Laboratory.
                </p>
              </div>

              <div>
                <p className="font-bold">
                  Узбекский центр аккредитации (O‘ZAKK) является подписантом Договорённости о взаимном признании (MRA) Азиатско-Тихоокеанского сотрудничества по аккредитации (APAC) и Договоренности о взаимном признании (MRA) Международного сотрудничества по аккредитации лабораторий (ILAC) для признания сертификатов калибровки.
                </p>
                <p className="italic mt-0.5 text-[9.5px]">
                  Uzbek Accreditation Center (O‘ZAKK) is a signatory to the Asia Pacific Accreditation Cooperation (APAC) Mutual Recognition Arrangement (MRA) and to the International Laboratory Accreditation Cooperation (ILAC) Mutual Recognition Arrangement (MRA) for the recognition of calibration certificates.
                </p>
              </div>
            </div>

            {/* Bottom Feedback Text & QR Code (Right aligned, NO Uzakk badge on left as in user PDF) */}
            <div className="my-6 flex justify-end items-center gap-4 pr-3">
              <div className="text-right text-[10px] leading-snug max-w-[210px]">
                <p className="font-bold text-black">
                  Калибровочная лаборатория УзНИМ стремится получать обратную связь от своих заказчиков
                </p>
                <p className="italic text-black text-[9px] mt-0.5">
                  UzNIM Calibration laboratory seeks feedback from its customers
                </p>
              </div>
              <div className="shrink-0">
                <QrCodeSvg size={100} />
              </div>
            </div>

            {/* End of Certificate marker */}
            <div className="text-center mt-6 mb-2">
              <div className="font-bold text-[13px] text-black uppercase tracking-wide">
                Конец сертификата калибровки
              </div>
              <div className="italic text-[11px] text-black mt-0.5">
                End of Calibration Certificate
              </div>
            </div>
          </div>

          {renderPageFooter()}
        </div>

      </div>
    </div>
  );
};
