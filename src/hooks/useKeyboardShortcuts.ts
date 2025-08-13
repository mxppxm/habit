import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * 键盘快捷键Hook
 * 支持全局键盘快捷键注册和管理
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否在输入框、文本区域或内容可编辑元素中
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      shortcuts.forEach((shortcut) => {
        // 如果快捷键被禁用，跳过
        if (shortcut.enabled === false) return;

        // 检查按键是否匹配
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        // 检查修饰键匹配
        let modifierMatch = true;

        // 检查主修饰键 (Ctrl/Cmd) - 如果定义了任一个，则需要按下 Ctrl 或 Cmd
        if (shortcut.ctrlKey || shortcut.metaKey) {
          modifierMatch = modifierMatch && (event.ctrlKey || event.metaKey);
        }

        // 检查 Alt 键
        if (shortcut.altKey) {
          modifierMatch = modifierMatch && event.altKey;
        }

        // 检查 Shift 键
        if (shortcut.shiftKey) {
          modifierMatch = modifierMatch && event.shiftKey;
        }

        if (keyMatch && modifierMatch) {
          // 对于修饰键组合，即使在输入框中也应该触发
          const isModifierCombo =
            shortcut.ctrlKey || shortcut.metaKey || shortcut.altKey;

          if (!isInputElement || isModifierCombo) {
            if (shortcut.preventDefault !== false) {
              event.preventDefault();
            }
            shortcut.handler(event);
          }
        }
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);
};

/**
 * 检测用户操作系统
 */
export const isMac = () => {
  return (
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  );
};

/**
 * 获取修饰键显示文本
 */
export const getModifierText = () => {
  return isMac() ? "⌘" : "Ctrl";
};

/**
 * 格式化快捷键显示文本
 */
export const formatShortcut = (shortcut: Omit<KeyboardShortcut, "handler">) => {
  const parts: string[] = [];

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(getModifierText());
  }
  if (shortcut.altKey) {
    parts.push(isMac() ? "⌥" : "Alt");
  }
  if (shortcut.shiftKey) {
    parts.push(isMac() ? "⇧" : "Shift");
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac() ? "" : "+");
};
