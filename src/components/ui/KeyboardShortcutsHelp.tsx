import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Keyboard, X } from "lucide-react";
import { formatShortcut, isMac } from "../../hooks/useKeyboardShortcuts";

interface ShortcutItem {
  key: string;
  description: string;
  shortcut: {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  };
}

/**
 * 键盘快捷键帮助组件
 */
export const KeyboardShortcutsHelp: React.FC = () => {
  const [open, setOpen] = useState(false);

  const shortcuts: ShortcutItem[] = [
    {
      key: "navigation-1",
      description: "前往首页",
      shortcut: { key: "1" },
    },
    {
      key: "navigation-2",
      description: "前往管理页面",
      shortcut: { key: "2" },
    },
    {
      key: "navigation-3",
      description: "前往统计页面",
      shortcut: { key: "3" },
    },
    {
      key: "navigation-4",
      description: "前往设置页面",
      shortcut: { key: "4" },
    },
    {
      key: "navigation-5",
      description: "前往关于页面",
      shortcut: { key: "5" },
    },
    {
      key: "checkin",
      description: "打卡确认 (在打卡对话框中)",
      shortcut: { key: "Enter", ctrlKey: true, metaKey: true },
    },
    {
      key: "save",
      description: "保存 (在编辑对话框中)",
      shortcut: { key: "Enter" },
    },

    {
      key: "cancel",
      description: "取消/关闭对话框",
      shortcut: { key: "Escape" },
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-200 z-40"
        title="查看键盘快捷键"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-2xl font-semibold text-gray-800">
                键盘快捷键
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                使用以下快捷键来快速操作应用：
              </p>

              <div className="space-y-3">
                {shortcuts.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700 font-medium">
                      {item.description}
                    </span>
                    <kbd className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm font-mono text-gray-800 shadow-sm">
                      {formatShortcut(item.shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>提示：</strong>
                  {isMac()
                    ? "在 Mac 上使用 ⌘ (Command) 键"
                    : "在 Windows/Linux 上使用 Ctrl 键"}
                  来触发保存、新建等功能快捷键。
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Dialog.Close asChild>
                <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium">
                  关闭
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
