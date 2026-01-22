import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const StudentCard = ({ student, onUpdate, onUpdateScore, onDelete, behaviorOptions = [], stats = { missing: 0, correction: 0 }, ...props }) => {
    const [isEditing, setIsEditing] = useState(false);

    // Helper to update specific field
    const updateField = (field, value) => {
        onUpdate(student.id, { ...student, [field]: value });
    };

    // Score colors based on value
    const getScoreColor = (score) => {
        if (score > 0) return 'text-green-600';
        if (score < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    // Avatar background - random-ish based on name/id
    const getAvatarColor = () => {
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'];
        const index = parseInt(student.id.replace(/\D/g, '') || '0') % colors.length;
        return colors[index];
    };

    // Avatar randomization
    const AVATAR_Categories = {
        human: ['👶', '👧', '🧒', '👦', '👩', '👨', '🧑', '👱', '🧔', '👵', '🧓', '👴'],
        animal: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷'],
        plant: ['🌵', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🍃', '🍄', '🌻', '🌹'],
        robot: ['🤖', '👾', '👽', '👻', '👹', '👺', '💀', '🤡']
    };

    const setRandomAvatar = (category) => {
        const pool = category ? AVATAR_Categories[category] : Object.values(AVATAR_Categories).flat();
        const random = pool[Math.floor(Math.random() * pool.length)];
        updateField('avatar', random);
    };

    return (
        <div {...props} className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center transition-all hover:shadow-xl hover:-translate-y-1 relative cursor-grab active:cursor-grabbing"
            style={{ minHeight: '400px' }}>

            {/* Delete Button */}
            <div className="absolute top-2 right-2">
                <button
                    onClick={() => onDelete(student.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Avatar Section */}
            <div className="relative group">
                <div
                    className={`w-20 h-20 ${getAvatarColor()} rounded-full flex items-center justify-center text-white text-4xl shadow-md cursor-pointer transition-transform hover:scale-105 select-none`}
                    title="點擊切換隨機頭像"
                    onClick={() => setRandomAvatar()}
                >
                    {student.avatar || student.name.charAt(0)}
                </div>

                {/* Avatar Settings Popover (Visible on hover of group) */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 w-48 hidden group-hover:block">
                    <div className="text-xs text-gray-400 text-center mb-2">點擊更換頭像類別</div>
                    <div className="grid grid-cols-4 gap-1 mb-1">
                        <button onClick={() => setRandomAvatar('human')} className="p-1 hover:bg-gray-100 rounded text-xl" title="人物">🧑</button>
                        <button onClick={() => setRandomAvatar('animal')} className="p-1 hover:bg-gray-100 rounded text-xl" title="動物">🐶</button>
                        <button onClick={() => setRandomAvatar('plant')} className="p-1 hover:bg-gray-100 rounded text-xl" title="植物">🌱</button>
                        <button onClick={() => setRandomAvatar('robot')} className="p-1 hover:bg-gray-100 rounded text-xl" title="機器人">🤖</button>
                    </div>
                    <button
                        onClick={() => {
                            const match = student.name.match(/[\u4e00-\u9fff]/);
                            const char = match ? match[0] : student.name.charAt(0);
                            updateField('avatar', char);
                        }}
                        className="w-full p-1 hover:bg-gray-100 rounded text-sm font-bold text-gray-700"
                        title="姓氏"
                    >
                        姓氏
                    </button>
                </div>
            </div>

            {/* Name */}
            <div className="flex items-center gap-2 mb-2 mt-3">
                {isEditing ? (
                    <input
                        type="text"
                        value={student.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                        className="border rounded px-2 py-1 text-center font-bold text-lg w-32"
                    />
                ) : (
                    <h3 className="font-bold text-lg text-gray-800">{student.name}</h3>
                )}
                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-500">
                    <Pencil size={14} />
                </button>
            </div>

            {/* Score */}
            <div className={`text-5xl font-bold my-4 ${getScoreColor(student.score)}`}>
                {student.score}
            </div>

            {/* Homework Stats (Reserved Space) */}
            <div className="flex justify-center gap-2 mb-4 w-full px-2 h-7 min-h-[1.75rem]">
                {stats.missing > 0 ? (
                    <div className="bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        未繳交: {stats.missing}
                    </div>
                ) : (
                    // Invisible placeholder to keep center alignment logic similar if mixed? 
                    // No, just empty space is enough for height, but let's ensure it doesn't collapse.
                    null
                )}
                {stats.correction > 0 && (
                    <div className="bg-orange-100 text-orange-600 border border-orange-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        待訂正: {stats.correction}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex gap-2 w-full justify-center mb-4">
                <button
                    onClick={() => {
                        if (onUpdateScore) onUpdateScore(student.id, 1);
                        else updateField('score', student.score + 1);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-4 rounded-lg shadow transition-colors"
                >
                    +1
                </button>
                <button
                    onClick={() => {
                        if (onUpdateScore) onUpdateScore(student.id, -1);
                        else updateField('score', student.score - 1);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded-lg shadow transition-colors"
                >
                    -1
                </button>
                <button
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg shadow transition-colors text-sm"
                >
                    請假
                </button>
            </div>

            {/* Special Record Toggle */}
            <div className="w-full flex items-center justify-between text-xs text-gray-500 mb-2 px-1">
                <span>特殊表現記錄</span>
                <label className="flex items-center cursor-pointer gap-1">
                    <input
                        type="checkbox"
                        checked={!!student.showRecord}
                        onChange={(e) => updateField('showRecord', e.target.checked)}
                        className="rounded text-indigo-500 focus:ring-indigo-500"
                    />
                    顯示
                </label>
            </div>

            {/* Special Record Area (Conditional) */}
            {student.showRecord && (
                <div className="w-full animate-fadeIn flex flex-col gap-2">
                    {/* User Request #3: Input Behavior with Date Prefix & Multiline support */}
                    <div className="relative flex items-center">
                        <input
                            list={`behaviors-${student.id}`}
                            className="w-full border rounded-lg pl-2 pr-8 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            placeholder="輸入或選擇..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = e.target.value.trim();
                                    if (val) {
                                        // Format: YYYY/MM/DD
                                        const now = new Date();
                                        const dateStr = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
                                        const newRecord = `${dateStr} ${val}`;
                                        updateField('note', student.note ? `${student.note}\n${newRecord}` : newRecord);
                                        e.target.value = ''; // Clear input
                                    }
                                }
                            }}
                            onChange={(e) => {
                                const input = e.target;
                                const val = input.value;
                                // Auto-add if it matches one of the options (Click selection)
                                // Only if explicit match to avoid partial typing triggers
                                if (behaviorOptions.includes(val)) {
                                    // Format: YYYY/MM/DD
                                    const now = new Date();
                                    const dateStr = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
                                    const newRecord = `${dateStr} ${val}`;
                                    updateField('note', student.note ? `${student.note}\n${newRecord}` : newRecord);
                                    input.value = ''; // Clear input
                                    input.blur(); // Remove focus to avoid re-triggering? Or keep focus?
                                    // Better to keep focus for rapid entry?
                                    // Actually, if we clear value, onChange won't re-trigger.
                                }
                            }}
                        />
                        <button
                            className="absolute right-1 p-1 text-indigo-500 hover:bg-indigo-100 rounded-md"
                            onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling;
                                const val = input.value.trim();
                                if (val) {
                                    // Format: YYYY/MM/DD
                                    const now = new Date();
                                    const dateStr = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
                                    const newRecord = `${dateStr} ${val}`;
                                    updateField('note', student.note ? `${student.note}\n${newRecord}` : newRecord);
                                    input.value = '';
                                }
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                    </div>

                    <datalist id={`behaviors-${student.id}`}>
                        {behaviorOptions.map(opt => (
                            <option key={opt} value={opt} />
                        ))}
                    </datalist>

                    <textarea
                        className="w-full border rounded-lg px-2 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none h-24 whitespace-pre-wrap"
                        placeholder="詳細記錄將顯示於此..."
                        value={student.note || ''}
                        onChange={(e) => updateField('note', e.target.value)}
                    ></textarea>
                </div>
            )}
        </div>
    );
};

export default StudentCard;
