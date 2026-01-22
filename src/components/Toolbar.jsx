import React from 'react';
import {
    Users, Plus, Trash2, UserPlus, RotateCcw, Settings,
    Dices, Timer, BookOpen, CheckSquare, Eye, FileJson,
    FileSpreadsheet, Cloud, CloudOff, Wand2, ArrowUpDown,
    Armchair, Users2
} from 'lucide-react';

const Toolbar = ({
    classes,
    currentClassId,
    onClassChange,
    onAddClass,
    onDeleteClass,
    onAddStudent,
    onAvatarWizard,
    onReset,
    onExportJSON,
    onImportJSON,
    onExportExcel,
    rowsPerPage,
    onRowsChange,
    isSynced,
    onDraw,
    onTimer,
    onContact,
    onCheck,
    onSettings,
    onToggleRecords,
    onSortByName,
    onSeats,
    onGroups
}) => {
    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-8 w-full max-w-7xl mx-auto border border-white/20">
            {/* Top Row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Class Dropdown */}
                <div className="relative min-w-[150px]">
                    <select
                        value={currentClassId}
                        onChange={(e) => onClassChange(e.target.value)}
                        className="w-full appearance-none bg-blue-50 border border-blue-200 text-blue-700 py-2.5 px-4 pr-8 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                    >
                        {[...classes].sort((a, b) => a.name.localeCompare(b.name, 'zh-TW')).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-blue-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                {/* Primary Actions */}
                <button onClick={onAddClass} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2.5 rounded-xl font-medium transition-colors">
                    <Plus size={18} /> 新增班級
                </button>
                <button onClick={onDeleteClass} className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2.5 rounded-xl font-medium transition-colors">
                    <Trash2 size={18} /> 刪除班級
                </button>
                <button onClick={onAddStudent} className="flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2.5 rounded-xl font-medium shadow-md transition-all hover:scale-105 active:scale-95">
                    <UserPlus size={18} /> 加入學生
                </button>
                <button onClick={onAvatarWizard} className="flex items-center gap-1.5 bg-purple-500 text-white hover:bg-purple-600 px-4 py-2.5 rounded-xl font-medium shadow-md transition-all hover:scale-105 active:scale-95">
                    <Wand2 size={18} /> 批量頭像
                </button>
                <button onClick={onReset} className="flex items-center gap-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2.5 rounded-xl font-medium transition-colors">
                    <RotateCcw size={18} /> 重置分數/記錄
                </button>
                <button onClick={onSettings} className="flex items-center gap-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 px-4 py-2.5 rounded-xl font-medium transition-colors">
                    <Settings size={18} /> 下拉選單
                </button>
                <button onClick={onGroups} className="flex items-center gap-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 px-4 py-2.5 rounded-xl font-medium transition-colors">
                    <Users2 size={18} /> 分組
                </button>

                <div className="ml-auto flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                        <span className="text-gray-500 text-sm font-medium">列數:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => onRowsChange(e.target.value)}
                            className="bg-transparent text-gray-700 font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Secondary Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <ActionButton icon={Dices} label="抽籤" onClick={onDraw} />
                <ActionButton icon={Timer} label="倒數計時" onClick={onTimer} />
                <ActionButton icon={BookOpen} label="連絡簿" onClick={onContact} />
                <ActionButton icon={CheckSquare} label="作業檢查" onClick={onCheck} />
                <ActionButton icon={Eye} label="顯示/隱藏特殊記錄" onClick={onToggleRecords} />
                <ActionButton icon={Armchair} label="座位" onClick={onSeats} />
                <ActionButton icon={ArrowUpDown} label="按姓名排序" onClick={onSortByName} />
                <div className="bg-gray-200 w-px h-6 mx-2"></div>
                <ActionButton icon={FileJson} label="匯出JSON" onClick={onExportJSON} />
                <ActionButton icon={FileJson} label="匯入JSON" onClick={onImportJSON} />
                <ActionButton icon={FileSpreadsheet} label="匯出Excel" onClick={onExportExcel} />
            </div>
        </div>
    );
};

const ActionButton = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
    >
        <Icon size={16} />
        {label}
    </button>
);

export default Toolbar;
