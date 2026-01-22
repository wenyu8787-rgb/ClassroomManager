import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, Pause, RotateCcw, Save, Eye, CheckCircle, Copy, Settings, Trash2 } from 'lucide-react';

export const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scaleIn overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    {title}
                </h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                    <X size={24} />
                </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {children}
            </div>
        </div>
    </div>
);

// --- 1. Draw (Lottery) Modal ---
export const DrawModal = ({ students, onClose }) => {
    const [drawCount, setDrawCount] = useState(1);
    const [drawnHistory, setDrawnHistory] = useState([]);
    const [currentWinner, setCurrentWinner] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [tempName, setTempName] = useState("點擊「開始抽籤」");

    // Ticking sound while drawing
    useEffect(() => {
        let audio = null;
        if (isRunning) {
            // Use a short ticking/shuffling sound
            audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-quick-mechanical-keyboard-single-hit-1393.mp3');
            audio.loop = true;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
        return () => {
            if (audio) {
                audio.pause();
                audio = null;
            }
        };
    }, [isRunning]);

    // Filter out students who have already been drawn for this session
    // (Or maybe we want to allow repeats? The image implies specific tracking "Remaining Students: 28")
    // Let's assume we remove them from the pool until reset.
    const remainingStudents = useMemo(() => {
        return students.filter(s => !drawnHistory.some(h => h.id === s.id));
    }, [students, drawnHistory]);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                const random = remainingStudents[Math.floor(Math.random() * remainingStudents.length)];
                if (random) setTempName(random.name);
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isRunning, remainingStudents]);

    const handleDraw = () => {
        if (remainingStudents.length === 0) {
            alert("所有學生都已抽出！");
            setIsRunning(false);
            return;
        }

        if (isRunning) {
            // Stop
            setIsRunning(false);
            const count = Math.min(drawCount, remainingStudents.length);
            const newWinners = [];
            const tempRemaining = [...remainingStudents];

            for (let i = 0; i < count; i++) {
                const idx = Math.floor(Math.random() * tempRemaining.length);
                newWinners.push(tempRemaining[idx]);
                tempRemaining.splice(idx, 1);
            }

            const names = newWinners.map(w => w.name).join('、');
            setTempName(names);
            setDrawnHistory(prev => [...newWinners, ...prev]);
            setCurrentWinner(newWinners);

            // Play winning sound (Success fanfare)
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-level-up-fanfare-2729.mp3');
            audio.volume = 0.8;
            audio.play().catch(e => console.log("Winning audio failed:", e));
        } else {
            // Start
            setCurrentWinner(null);
            setIsRunning(true);
        }
    };

    const handleReset = () => {
        setDrawnHistory([]);
        setCurrentWinner(null);
        setTempName("點擊「開始抽籤」");
    };

    return (
        <div className="flex flex-col items-center">
            {/* Class Info */}
            <div className="text-center mb-6">
                <div className="text-xl font-bold text-indigo-600 mb-1">班級: {students.length > 0 ? '五年12班' : '未選擇'}</div>
                <div className="text-gray-500">剩餘學生: <span className="font-bold text-gray-800">{remainingStudents.length}</span> 人</div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 items-center mb-8">
                <div className="flex items-center gap-2">
                    <span>每次抽取人數:</span>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={drawCount}
                        onChange={e => setDrawCount(Number(e.target.value))}
                        className="border rounded px-2 py-1 w-16 text-center"
                    />
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={handleDraw}
                    disabled={remainingStudents.length === 0 && !isRunning}
                    className={`px-8 py-2 rounded-lg font-bold text-white shadow transition-all ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                >
                    {isRunning ? '停止' : '開始抽籤'}
                </button>
                <button
                    onClick={handleReset}
                    className="px-6 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium"
                >
                    重置
                </button>
            </div>

            <div className="w-full border-t border-dashed border-gray-300 my-4"></div>

            {/* Result Area */}
            <h4 className="text-lg font-bold text-gray-700 mb-4">本次抽中:</h4>
            <div className={`w-full py-8 mb-8 rounded-xl flex items-center justify-center text-3xl font-bold bg-indigo-50 text-indigo-800 border-2 border-indigo-100 ${currentWinner ? 'animate-bounce' : ''}`}>
                {tempName}
            </div>

            {/* History */}
            {drawnHistory.length > 0 && (
                <div className="w-full">
                    <h4 className="text-gray-500 font-medium mb-2 text-sm">已抽中學生列表:</h4>
                    <div className="flex flex-wrap gap-2">
                        {drawnHistory.map((s, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                {s.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 2. Timer Modal ---
export const TimerModal = ({ onClose }) => {
    const [timeLeft, setTimeLeft] = useState(300); // 5 mins default
    const [isActive, setIsActive] = useState(false);
    const [inputMins, setInputMins] = useState(5);
    const [inputSecs, setInputSecs] = useState(0);
    const [initialTime, setInitialTime] = useState(300);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-digital-clock-digital-alarm-buzzer-992.mp3');
            audio.volume = 1.0;
            audio.play().catch(e => console.log("Timer audio failed:", e));
            setTimeout(() => {
                alert('時間到！');
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const setTime = (mins) => {
        const secs = mins * 60;
        setInitialTime(secs);
        setTimeLeft(secs);
        setIsActive(false);
    }

    const setCustomTime = () => {
        const totalSecs = (inputMins * 60) + inputSecs;
        if (totalSecs <= 0) {
            alert('請設定大於 0 的時間！');
            return;
        }
        setInitialTime(totalSecs);
        setTimeLeft(totalSecs);
        setIsActive(false);
    }

    return (
        <div className="text-center">
            {/* Presets */}
            <div className="flex gap-2 justify-center mb-4">
                {[1, 3, 5, 10].map(m => (
                    <button key={m} onClick={() => setTime(m)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium">
                        {m}分鐘
                    </button>
                ))}
            </div>

            {/* Custom Time Input */}
            <div className="flex items-center justify-center gap-3 mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100">
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        min="0"
                        className="w-16 border rounded px-2 py-1 text-center font-bold"
                        value={inputMins}
                        onChange={(e) => setInputMins(parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm text-gray-600 font-bold">分</span>
                </div>
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        min="0"
                        max="59"
                        className="w-16 border rounded px-2 py-1 text-center font-bold"
                        value={inputSecs}
                        onChange={(e) => setInputSecs(parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm text-gray-600 font-bold">秒</span>
                </div>
                <button
                    onClick={setCustomTime}
                    className="ml-2 bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm font-bold hover:bg-indigo-700"
                >
                    設定
                </button>
            </div>
            <div className={`text-7xl font-mono font-bold mb-8 tracking-wider ${timeLeft < 10 && timeLeft > 0 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                {formatTime(timeLeft)}
            </div>

            <div className="flex gap-4 justify-center">
                <button
                    onClick={() => setIsActive(!isActive)}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg shadow transition-colors ${isActive ? 'bg-orange-500 text-white' : 'bg-green-600 text-white'}`}
                >
                    {isActive ? <><Pause /> 暫停</> : <><Play /> 開始</>}
                </button>
                <button
                    onClick={() => { setIsActive(false); setTimeLeft(initialTime); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                >
                    <RotateCcw />
                </button>
            </div>
        </div>
    );
};

// --- 3. Contact Book Modal ---
// --- 3. Contact Book Modal ---
// --- 3. Contact Book Modal ---
export const ContactBookModal = ({ data, options, onSave, onClose }) => {
    // Current date formatted YYYY-MM-DD for key
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isViewMode, setIsViewMode] = useState(false);

    const dateKey = currentDate.toISOString().split('T')[0];
    const displayDate = currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

    const [info, setInfo] = useState({ important: '', homework: '' });

    // Reset/Load info when dateKey changes
    useEffect(() => {
        setInfo(data[dateKey] || { important: '', homework: '' });
    }, [dateKey, data]);

    // Use options from settings or defaults
    const importantOptions = options?.importantInfo || [
        "明天帶美術用具",
        "下週一體育課請穿體育服"
    ];

    const homeworkPresets = options?.homeworkPresets || [
        "國語第1課",
        "數學習作"
    ];

    const handleSave = () => {
        onSave(dateKey, info);
        alert('儲存成功！');
    };

    const changeDate = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const addPreset = (field, value) => {
        if (!value) return;
        setInfo(prev => {
            const current = prev[field] || '';
            return {
                ...prev,
                [field]: current ? `${current}\n${value}` : value
            };
        });
    };

    if (isViewMode) {
        return (
            <div className="bg-slate-800 text-white min-h-[500px] flex flex-col p-8 rounded-lg relative transition-all">
                <button
                    onClick={() => setIsViewMode(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <Settings size={20} />
                </button>

                <div className="text-center mb-8 border-b border-dashed border-slate-600 pb-6">
                    <h2 className="text-4xl font-bold mb-3 tracking-widest text-white/90">今日聯絡簿</h2>
                    <div className="text-xl text-slate-400 font-mono">{displayDate}</div>
                </div>

                <div className="grid grid-cols-2 gap-12 flex-1">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-yellow-500 border-l-4 border-yellow-500 pl-4">重要資訊</h3>
                        <div className="text-xl leading-loose whitespace-pre-wrap text-slate-200">
                            {info.important || "無"}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-green-500 border-l-4 border-green-500 pl-4">回家作業</h3>
                        <div className="text-xl leading-loose whitespace-pre-wrap text-slate-200">
                            {info.homework || "無"}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-2">
            {/* Date Navigation */}
            <div className="flex justify-center mb-2">
                <div className="flex items-center gap-4 bg-blue-50/80 px-4 py-2 rounded-xl border border-blue-100 text-blue-600 font-bold text-xl shadow-sm">
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-1 hover:bg-white rounded-lg transition-colors text-blue-400 hover:text-blue-600"
                    >
                        <Play className="rotate-180 fill-current w-5 h-5" />
                    </button>
                    <span className="min-w-[240px] text-center tracking-wider">{displayDate}</span>
                    <button
                        onClick={() => changeDate(1)}
                        className="p-1 hover:bg-white rounded-lg transition-colors text-blue-400 hover:text-blue-600"
                    >
                        <Play className="fill-current w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Important Info Section */}
                <div className="space-y-2">
                    <h4 className="text-gray-600 font-bold text-lg border-b border-dashed border-gray-200 pb-2 mb-3">重要資訊</h4>

                    <div className="relative">
                        <select
                            className="w-full appearance-none border border-gray-300 text-gray-600 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 cursor-pointer shadow-sm transition-all text-base"
                            onChange={(e) => {
                                addPreset('important', e.target.value);
                                e.target.value = ''; // Reset
                            }}
                        >
                            <option value="">請選擇重要資訊</option>
                            {importantOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                            <span className="text-xs">▼</span>
                        </div>
                    </div>

                    <textarea
                        className="w-full h-32 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 resize-y text-gray-800 whitespace-pre-wrap text-base leading-relaxed bg-white shadow-inner"
                        placeholder={'例如：\n校外教學活動通知單已發放\n班級旅遊費用請於本週內繳交\n參加語文競賽'}
                        value={info.important}
                        onChange={(e) => setInfo({ ...info, important: e.target.value })}
                    ></textarea>
                </div>

                {/* Homework Section */}
                <div className="space-y-2">
                    <h4 className="text-gray-600 font-bold text-lg border-b border-dashed border-gray-200 pb-2 mb-3">回家作業</h4>

                    <div className="relative">
                        <select
                            className="w-full appearance-none border border-indigo-200 text-gray-600 rounded-lg px-4 py-3 bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 cursor-pointer shadow-sm transition-all text-base"
                            onChange={(e) => {
                                addPreset('homework', e.target.value);
                                e.target.value = ''; // Reset
                            }}
                        >
                            <option value="">請選擇回家作業</option>
                            {homeworkPresets.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                            <span className="text-xs">▼</span>
                        </div>
                    </div>

                    <textarea
                        className="w-full h-40 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 resize-y text-gray-800 whitespace-pre-wrap text-base leading-relaxed bg-white shadow-inner"
                        placeholder={'例如：\n國語第1課生字\n數學課本第1頁\n數學習作P3~P5'}
                        value={info.homework}
                        onChange={(e) => setInfo({ ...info, homework: e.target.value })}
                    ></textarea>
                </div>
            </div>

            <div className="border-t border-dashed border-gray-200 my-2"></div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg active:scale-95 transition-all text-base w-32"
                >
                    保存
                </button>
                <button
                    onClick={() => setIsViewMode(true)}
                    className="flex items-center justify-center gap-2 bg-white text-indigo-600 border border-indigo-300 px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-50 active:scale-95 transition-all text-base w-32"
                >
                    顯示
                </button>
            </div>
        </div>
    );
};

// --- 4. Homework Check Modal ---
export const HomeworkCheckModal = ({ students, contactBooks, homeworkStatus, options, onUpdateStatus, onClose }) => {
    // Logic: Default to YESTERDAY's homework
    const getYesterday = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    };

    const [targetDate, setTargetDate] = useState(getYesterday());

    const targetInfo = contactBooks[targetDate] || { homework: '' };
    const rawHomework = targetInfo.homework || "";
    const homeworkItems = rawHomework.split('\n').filter(line => line.trim());
    const displayItems = homeworkItems.length > 0 ? homeworkItems : ["(無記錄)"];

    const [selectedHomework, setSelectedHomework] = useState(displayItems[0]);

    useEffect(() => {
        setSelectedHomework(displayItems[0]);
    }, [rawHomework]);

    // Calculate key based on current selectedHomework state
    const hwKey = `hw-${targetDate}-${selectedHomework}`;
    const statusMap = homeworkStatus[hwKey] || {};

    const toggleStudent = (studentId) => {
        const current = statusMap[studentId] !== undefined ? statusMap[studentId] : 1;
        // 1 (Done) -> 0 (Not Done) -> 2 (Correction) -> 1
        let nextState = 1;
        if (current === 1) nextState = 0; // Done -> Not Done
        else if (current === 0) nextState = 2; // Not Done -> Correction
        else nextState = 1; // Correction -> Done

        onUpdateStatus(targetDate, studentId, nextState, selectedHomework);
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 1: return { text: '已繳交', class: 'bg-green-500 text-white border-green-600' };
            case 2: return { text: '待訂正', class: 'bg-yellow-400 text-white border-yellow-500' };
            default: return { text: '未繳交', class: 'bg-red-500 text-white border-red-600' };
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-1 text-gray-600 mb-2">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle className="text-green-500" />
                    作業檢查
                </h2>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                    檢查日期:
                    <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="border rounded px-2 py-0.5 bg-gray-50"
                    />
                    (預設為昨天)
                </div>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-800 whitespace-nowrap">作業項目：</span>
                <select
                    className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-gray-700 font-medium focus:outline-none focus:border-blue-500"
                    value={selectedHomework}
                    onChange={(e) => setSelectedHomework(e.target.value)}
                >
                    {displayItems.map((hw, i) => (
                        <option key={i} value={hw}>{hw}</option>
                    ))}
                </select>
            </div>

            {selectedHomework && selectedHomework !== "(無記錄)" ? (
                <div className="grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-2">
                    {students.map(student => {
                        const status = statusMap[student.id] !== undefined ? statusMap[student.id] : 1; // Default 1 (Done)
                        const config = getStatusConfig(status);

                        return (
                            <button
                                key={student.id}
                                onClick={() => toggleStudent(student.id)}
                                className={`p-3 rounded-lg text-sm font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-1 border-2 ${config.class}`}
                            >
                                <span>{student.name}</span>
                                <span className="text-xs opacity-90">{config.text}</span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-400">
                    <p>該日期尚無作業記錄</p>
                    <p className="text-sm mt-2">請確認聯絡簿是否已填寫</p>
                </div>
            )}

            <div className="flex justify-center pt-4 border-t border-gray-100">
                <button
                    onClick={onClose}
                    className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                >
                    完成
                </button>
            </div>
        </div>
    );
};

// --- 5. Settings Modal ---
export const SettingsModal = ({ options, onSave, onClose }) => {
    // Keep local state as STRINGS to allow smooth editing (newlines)
    const [localBehaviors, setLocalBehaviors] = useState(options.behaviors?.join('\n') || '');
    const [localImportant, setLocalImportant] = useState(options.importantInfo?.join('\n') || '');
    const [localHomework, setLocalHomework] = useState(options.homeworkPresets?.join('\n') || '');

    const handleSave = () => {
        onSave({
            behaviors: localBehaviors.split('\n').filter(l => l.trim()),
            importantInfo: localImportant.split('\n').filter(l => l.trim()),
            homeworkPresets: localHomework.split('\n').filter(l => l.trim()),
        });
        onClose();
    };

    return (
        <div className="flex flex-col gap-6 p-2">
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-2 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Settings className="text-gray-500" /> 系統設定
                </h2>
            </div>

            {/* Behavior Options */}
            <div className="space-y-2">
                <h3 className="font-bold text-gray-700 ml-1">特殊表現記錄預設選項</h3>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <textarea
                        className="w-full h-32 border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 bg-white leading-relaxed"
                        value={localBehaviors}
                        onChange={(e) => setLocalBehaviors(e.target.value)}
                        placeholder="每行輸入一個選項..."
                    />
                    <p className="text-xs text-gray-400 mt-2 text-right">按 Enter 換行可輸入多個選項</p>
                </div>
            </div>

            {/* Important Info Options */}
            <div className="space-y-2">
                <h3 className="font-bold text-gray-700 ml-1">聯絡簿重要資訊預設選項</h3>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <textarea
                        className="w-full h-32 border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 bg-white leading-relaxed"
                        value={localImportant}
                        onChange={(e) => setLocalImportant(e.target.value)}
                        placeholder="每行輸入一個選項..."
                    />
                    <p className="text-xs text-gray-400 mt-2 text-right">按 Enter 換行可輸入多個選項</p>
                </div>
            </div>

            {/* Homework Options */}
            <div className="space-y-2">
                <h3 className="font-bold text-gray-700 ml-1">聯絡簿回家作業預設選項</h3>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <textarea
                        className="w-full h-32 border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 bg-white leading-relaxed"
                        value={localHomework}
                        onChange={(e) => setLocalHomework(e.target.value)}
                        placeholder="每行輸入一個選項..."
                    />
                    <p className="text-xs text-gray-400 mt-2 text-right">按 Enter 換行可輸入多個選項</p>
                </div>
            </div>

            <div className="flex justify-center pt-4 border-t border-gray-100 mt-2">
                <button
                    onClick={handleSave}
                    className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-md active:scale-95 transition-all text-base min-w-[120px]"
                >
                    儲存設定
                </button>
            </div>
        </div>
    );
};

// --- 6. Add Student Modal ---
export const AddStudentModal = ({ onAdd, onClose }) => {
    const [text, setText] = useState('');

    const handleConfirm = () => {
        if (!text.trim()) {
            alert("請輸入學生姓名");
            return;
        }
        // Split by newline, comma, space
        const names = text.split(/[\n,，\s]+/).map(n => n.trim()).filter(n => n);
        if (names.length > 0) {
            onAdd(names);
            onClose();
        } else {
            alert("未檢測到有效姓名");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-gray-800">批量加入學生</h3>
            <p className="text-sm text-gray-500">請輸入學生姓名，每行一個，或用逗號分隔。</p>
            <textarea
                className="w-full h-64 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 text-base"
                placeholder={'例如：\n王小明\n陳大山\n林小美'}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-2">
                <button onClick={onClose} className="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-bold">取消</button>
                <button onClick={handleConfirm} className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md">
                    加入 {text.split(/[\n,，\s]+/).filter(n => n.trim()).length} 位學生
                </button>
            </div>
        </div>
    );
};

// --- 7. Batch Avatar Modal ---
export const BatchAvatarModal = ({ onUpdate, onClose }) => {
    const categories = [
        { id: 'human', name: '人像', icon: '👤' },
        { id: 'animal', name: '動物', icon: '🐱' },
        { id: 'plant', name: '植物', icon: '🌱' },
        { id: 'robot', name: '機器人', icon: '🤖' },
        { id: 'surname', name: '姓氏', icon: '文' },
    ];

    return (
        <div className="flex flex-col gap-6 items-center py-4">
            <h3 className="text-xl font-bold text-gray-800">全班頭像統一設定</h3>
            <p className="text-gray-500 text-center">點擊下方類別，將會把<span className="font-bold text-red-500">所有學生</span>的頭像隨機設為該類別。</p>

            <div className="grid grid-cols-2 gap-4 w-full px-8">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            if (confirm(`確定要將全班頭像都換成隨機「${cat.name}」嗎？`)) {
                                onUpdate(cat.id);
                                onClose();
                            }
                        }}
                        className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group shadow-sm"
                    >
                        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                        <span className="font-bold text-gray-700 group-hover:text-indigo-600">{cat.name}</span>
                    </button>
                ))}
            </div>

            <button onClick={onClose} className="mt-4 text-gray-400 hover:text-gray-600">取消</button>
        </div>
    );
};

// --- 8. Seat Arrangements Modal ---
export const SeatArrangementsModal = ({ arrangements, onSave, onLoad, onDelete, onClose }) => {
    const [newName, setNewName] = useState('');

    const handleSave = () => {
        if (!newName.trim()) {
            alert('請輸入座位表名稱！');
            return;
        }
        onSave(newName);
        setNewName('');
        alert('座位表已儲存！');
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3">儲存目前座位表</h4>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="輸入座位表名稱..."
                        className="flex-1 border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                    />
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        儲存
                    </button>
                </div>
            </div>

            <div>
                <h4 className="font-bold text-gray-700 mb-3">已儲存的座位表</h4>
                {arrangements.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">尚無儲存的座位表</p>
                ) : (
                    <div className="space-y-2">
                        {arrangements.map(arr => (
                            <div
                                key={arr.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-medium text-gray-700">{arr.name}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            onLoad(arr.id);
                                            alert('座位表已套用！');
                                        }}
                                        className="bg-green-500 text-white px-4 py-1 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                                    >
                                        套用
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`確定刪除「${arr.name}」嗎？`)) {
                                                onDelete(arr.id);
                                            }
                                        }}
                                        className="bg-red-500 text-white px-4 py-1 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                                    >
                                        刪除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-4 border-t">
                <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    關閉
                </button>
            </div>
        </div>
    );
};

// --- 9. Groups Modal ---
export const GroupsModal = ({ students, groups, options, onSave, onDelete, onUpdateTempScore, onUpdateTempTag, onRemoveTempTag, onCommit, onClose }) => {
    const [groupName, setGroupName] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);

    const toggleStudent = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSave = () => {
        if (!groupName.trim()) {
            alert('請輸入分組名稱！');
            return;
        }
        if (selectedStudents.length === 0) {
            alert('請至少選擇一位學生！');
            return;
        }
        onSave(groupName, selectedStudents);
        setGroupName('');
        setSelectedStudents([]);
        alert('分組已建立！');
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-3">建立新分組</h4>
                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="輸入分組名稱..."
                    className="w-full border border-purple-300 rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-purple-400"
                />

                <p className="text-sm text-gray-600 mb-2">選擇未分組的組員：</p>
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 bg-white rounded-lg border">
                    {students.filter(s => !groups.some(g => g.memberIds.includes(s.id))).map(student => (
                        <button
                            key={student.id}
                            onClick={() => toggleStudent(student.id)}
                            className={`p-2 rounded-lg text-sm font-medium transition-all border-2 ${selectedStudents.includes(student.id)
                                ? 'bg-purple-500 text-white border-purple-600'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300'
                                }`}
                        >
                            {student.name}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSave}
                    className="w-full mt-3 bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors"
                >
                    建立分組
                </button>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-700">目前分組</h4>
                    {groups.length > 0 && (
                        <button
                            onClick={onCommit}
                            className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-orange-600 shadow-sm transition-all flex items-center gap-1"
                        >
                            <Save size={16} /> 加分記錄並歸零
                        </button>
                    )}
                </div>

                {groups.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">尚無分組</p>
                ) : (
                    <div className="space-y-4">
                        {groups.map(group => {
                            const members = students.filter(s => group.memberIds.includes(s.id));
                            return (
                                <div
                                    key={group.id}
                                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                                                {group.name}
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {members.map(member => (
                                                    <span
                                                        key={member.id}
                                                        className="bg-white border text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium"
                                                    >
                                                        {member.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm(`確定刪除「${group.name}」分組嗎？`)) {
                                                    onDelete(group.id);
                                                }
                                            }}
                                            className="text-red-400 hover:text-red-600 text-xs font-medium"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="text-2xl font-black text-purple-700 w-8 text-center bg-white rounded border">
                                                    {group.tempScore || 0}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        onClick={() => onUpdateTempScore(group.id, 1)}
                                                        className="w-10 bg-green-500 text-white rounded text-xs py-0.5 hover:bg-green-600"
                                                    >
                                                        +1
                                                    </button>
                                                    <button
                                                        onClick={() => onUpdateTempScore(group.id, -1)}
                                                        className="w-10 bg-red-500 text-white rounded text-xs py-0.5 hover:bg-red-600"
                                                    >
                                                        -1
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <select
                                                    value=""
                                                    onChange={(e) => onUpdateTempTag(group.id, e.target.value)}
                                                    className="w-full text-xs p-2 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-purple-400"
                                                >
                                                    <option value="">+ 新增行為記錄...</option>
                                                    {options?.behaviors.map((b, i) => (
                                                        <option key={i} value={b}>{b}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Tag list */}
                                        {group.tempTags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 p-2 bg-white/50 rounded-lg border border-dashed">
                                                {group.tempTags.map((tag, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[11px] font-bold border border-purple-200 shadow-sm"
                                                    >
                                                        {tag}
                                                        <button
                                                            onClick={() => onRemoveTempTag(group.id, idx)}
                                                            className="hover:text-red-500 transition-colors"
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-4 border-t">
                <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-bold"
                >
                    關閉
                </button>
            </div>
        </div>
    );
};


