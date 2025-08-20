import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
}

interface ToastContextValue {
  show: (params: {
    title?: string;
    message: string;
    variant?: ToastVariant;
    durationMs?: number;
  }) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToastContext = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return ctx;
};

export const ToastContainer: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (params: {
      title?: string;
      message: string;
      variant?: ToastVariant;
      durationMs?: number;
    }): string => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item: ToastItem = {
        id,
        title: params.title,
        message: params.message,
        variant: params.variant ?? "success",
        durationMs: params.durationMs ?? 3200,
      };
      setToasts((prev) => [...prev, item]);
      window.setTimeout(() => dismiss(id), item.durationMs);
      return id;
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({ show, dismiss }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] space-y-3 px-2 w-full max-w-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              `flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg border animate-[fade-in_.2s_ease-out] ` +
              (t.variant === "success"
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
                : t.variant === "error"
                ? "bg-rose-50/95 border-rose-200 text-rose-800"
                : "bg-indigo-50/95 border-indigo-200 text-indigo-800")
            }
          >
            <div className="flex-1">
              {t.title && (
                <div className="text-sm font-semibold mb-0.5">{t.title}</div>
              )}
              <div className="text-sm leading-relaxed">{t.message}</div>
            </div>
            <button
              aria-label="关闭"
              className="text-xs text-gray-400 hover:text-gray-600"
              onClick={() => dismiss(t.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContainer;
