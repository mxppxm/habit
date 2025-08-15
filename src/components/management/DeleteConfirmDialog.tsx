import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Trash2, Target } from "lucide-react";
import { EnhancedDialog } from "../ui/EnhancedDialog";

interface DeleteTarget {
  type: "category" | "habit";
  id: string;
  name: string;
  relatedCount?: number;
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteTarget: DeleteTarget | null;
  habitLogs?: any[];
  onConfirm: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onOpenChange,
  deleteTarget,
  onConfirm,
}) => {
  return (
    <EnhancedDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      confirmShortcut={{ key: "Enter", ctrlKey: false, metaKey: false }}
    >
      <div className="flex items-center justify-between mb-6">
        <Dialog.Title className="text-2xl font-semibold text-gray-800">
          确认删除
        </Dialog.Title>
        <Dialog.Close asChild>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </Dialog.Close>
      </div>

      {deleteTarget && (
        <div className="mb-6">
          {deleteTarget.type === "category" ? (
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    删除目标：{deleteTarget.name}
                  </h3>
                  <p className="text-red-700 mb-3">
                    此目标包含{" "}
                    <span className="font-semibold">
                      {deleteTarget.relatedCount || 0}
                    </span>{" "}
                    个习惯。
                  </p>
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                    <p className="text-red-800 font-medium mb-1">⚠️ 警告</p>
                    <p className="text-red-700 text-sm">
                      删除目标将同时删除其下所有习惯以及相关的打卡记录，此操作不可恢复。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">
                    删除习惯：{deleteTarget.name}
                  </h3>
                  <p className="text-orange-700 mb-3">
                    此习惯已有{" "}
                    <span className="font-semibold">
                      {deleteTarget.relatedCount || 0}
                    </span>{" "}
                    次打卡记录。
                  </p>
                  <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
                    <p className="text-orange-800 font-medium mb-1">⚠️ 注意</p>
                    <p className="text-orange-700 text-sm">
                      删除习惯将同时删除所有相关的打卡记录，此操作不可恢复。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => onOpenChange(false)}
          className="px-6 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
        >
          取消
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
        >
          确认删除
          <span className="text-xs text-red-200 ml-2 opacity-70">Enter</span>
        </button>
      </div>
    </EnhancedDialog>
  );
};
