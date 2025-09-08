import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

interface EnhancedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  children: React.ReactNode;
  className?: string;
  confirmShortcut?: {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  };
}

/**
 * 增强的Dialog组件，支持ESC取消和Enter确认快捷键
 */
export const EnhancedDialog: React.FC<EnhancedDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  confirmDisabled = false,
  children,
  className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md mx-4 shadow-2xl z-50",
  confirmShortcut = { key: "Enter" },
}) => {
  // 对话框快捷键
  useKeyboardShortcuts([
    {
      key: "Escape",
      handler: () => {
        if (open) {
          onOpenChange(false);
        }
      },
      enabled: open,
    },
    {
      key: confirmShortcut.key,
      ctrlKey: confirmShortcut.ctrlKey,
      metaKey: confirmShortcut.metaKey,
      shiftKey: confirmShortcut.shiftKey,
      altKey: confirmShortcut.altKey,
      allowInInput: true,
      handler: (e) => {
        if (open && onConfirm && !confirmDisabled) {
          e.preventDefault();
          onConfirm();
        }
      },
      enabled: open && !!onConfirm && !confirmDisabled,
    },
  ]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className={className}>{children}</Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// 导出原始的Dialog组件以备需要
export { Dialog };

// 导出常用的Dialog子组件
export const DialogContent = Dialog.Content;
export const DialogHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "mb-6" }) => (
  <div className={className}>{children}</div>
);

export const DialogTitle = Dialog.Title;
