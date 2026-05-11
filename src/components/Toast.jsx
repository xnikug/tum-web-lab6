import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const ICONS = {
  success: <CheckCircle  className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
  error:   <XCircle      className="w-4 h-4 text-red-500 flex-shrink-0" />,
  info:    <Info         className="w-4 h-4 text-blue-500 flex-shrink-0" />,
};

const STYLES = {
  success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20',
  warning: 'border-amber-200  dark:border-amber-800  bg-amber-50  dark:bg-amber-900/20',
  error:   'border-red-200    dark:border-red-800    bg-red-50    dark:bg-red-900/20',
  info:    'border-blue-200   dark:border-blue-800   bg-blue-50   dark:bg-blue-900/20',
};

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const id = setTimeout(() => onDismiss(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(id);
  }, [toast, onDismiss]);

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm w-full
      text-gray-800 dark:text-gray-200 ${STYLES[toast.type] ?? STYLES.info}
      animate-in slide-in-from-right-4 duration-200`}>
      {ICONS[toast.type] ?? ICONS.info}
      <p className="text-sm flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0 mt-0.5 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}
