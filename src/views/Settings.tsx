import React, { useState } from 'react';
import { useHabitStore } from '../stores/useHabitStore';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

const Settings: React.FC = () => {
  const { clearAll } = useHabitStore();
  const [exportData, setExportData] = useState('');

  // 导出数据
  const handleExport = () => {
    const json = JSON.stringify({
      categories: useHabitStore.getState().categories,
      habits: useHabitStore.getState().habits,
      habitLogs: useHabitStore.getState().habitLogs,
    }, null, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habit-tracker-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入数据
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          setExportData(JSON.stringify(json, null, 2));
        } catch (err) {
          console.error('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  // 确认导入
  const confirmImport = async () => {
    try {
      const data = JSON.parse(exportData);
      const { addCategory, addHabit, checkinHabit } = useHabitStore.getState();
      
      // 清空现有数据
      await clearAll();
      
      // 导入分类
      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          await addCategory(category.name);
        }
      }
      
      // 导入习惯
      if (data.habits && Array.isArray(data.habits)) {
        for (const habit of data.habits) {
          await addHabit(habit.categoryId, habit.name, habit.reminderTime);
        }
      }
      
      // 导入打卡记录
      if (data.habitLogs && Array.isArray(data.habitLogs)) {
        for (const log of data.habitLogs) {
          await checkinHabit(log.habitId, log.note);
        }
      }
      
      setExportData('');
    } catch (err) {
      console.error('Failed to import data:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h2 className="text-xl font-medium mb-4">导出数据</h2>
        <button onClick={handleExport} className="button button-primary">导出为JSON</button>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-medium mb-4">导入数据</h2>
        <input type="file" onChange={handleImport} className="border border-gray-200 p-2 rounded-md focus:ring-2 focus:ring-[#FF5A5F]" />
        {exportData && (
          <AlertDialog.Root>
            <AlertDialog.Trigger className="button button-primary mt-4">确认导入</AlertDialog.Trigger>
            <AlertDialog.Overlay className="modal-overlay" />
            <AlertDialog.Content className="modal-content fixed top-1/2 left-1/2">
              <AlertDialog.Title className="font-medium text-lg">确认导入</AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm text-gray-600">
                确认导入数据将覆盖现有数据，是否继续？
              </AlertDialog.Description>
              <div className="flex justify-end space-x-4 mt-4">
                <AlertDialog.Cancel className="button">取消</AlertDialog.Cancel>
                <button onClick={confirmImport} className="button button-primary">确认</button>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Root>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-medium mb-4">清空数据</h2>
        <AlertDialog.Root>
          <AlertDialog.Trigger className="button button-accent">清空所有数据</AlertDialog.Trigger>
          <AlertDialog.Overlay className="modal-overlay" />
          <AlertDialog.Content className="modal-content fixed top-1/2 left-1/2">
            <AlertDialog.Title className="font-medium text-lg">确认清空</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-600">
              此操作将永久删除所有数据，是否继续？
            </AlertDialog.Description>
            <div className="flex justify-end space-x-4 mt-4">
              <AlertDialog.Cancel className="button">取消</AlertDialog.Cancel>
              <button onClick={clearAll} className="button button-accent">确认</button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>
    </div>
  );
};

export default Settings;

