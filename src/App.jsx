import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Toolbar from './components/Toolbar';
import StudentCard from './components/StudentCard';
import { Modal, DrawModal, TimerModal, ContactBookModal, HomeworkCheckModal, SettingsModal, AddStudentModal, BatchAvatarModal, SeatArrangementsModal, GroupsModal } from './components/Modals';

const STORAGE_KEY = 'classroom-manager-data';

function App() {
    // --- State ---
    // --- State ---
    const [data, setData] = useState(() => {
        const defaultData = {
            classes: [
                { id: 'c1', name: '五年12班' }
            ],
            currentClassId: 'c1',
            students: [
                // Demo Data matching image partially
                { id: 's1', classId: 'c1', name: '顏維均01', score: 2, avatar: '顏', note: '', recordTag: '', showRecord: false },
                { id: 's2', classId: 'c1', name: '顏維佑02', score: 0, avatar: '顏', note: '', recordTag: '', showRecord: false },
                { id: 's3', classId: 'c1', name: '林憲弘03', score: -1, avatar: '林', note: '2025/09/23 還未進入classroom', recordTag: 'homework', showRecord: true },
                { id: 's4', classId: 'c1', name: '黃仲儒04', score: -2, avatar: '黃', note: '', recordTag: '', showRecord: false },
                { id: 's5', classId: 'c1', name: '彭覺寬05', score: 0, avatar: '彭', note: '', recordTag: '', showRecord: false },
                { id: 's6', classId: 'c1', name: '楊以樂06', score: -3, avatar: '楊', note: '', recordTag: '', showRecord: false },
            ],
            contactBooks: {}, // { "YYYY-MM-DD": { important: [], homework: "" } }
            homeworkStatus: {}, // { "YYYY-MM-DD-homeworkId": { studentId: boolean } }
            settingsOptions: {
                behaviors: [
                    "好行為值得嘉獎", "主動協助同學", "積極發言", "忘記帳號密碼",
                    "作業缺交", "遲到", "打掃認真", "上課搗蛋"
                ],
                importantInfo: [
                    "明天帶美術用具", "下週一體育課請穿體育服", "繳交綜合活動學習單",
                    "校外教學活動通知單已發放", "班級旅遊費用請於本週內繳交",
                    "明天有數學小考", "參加語文競賽", "校園環境打掃活動"
                ],
                homeworkPresets: [
                    "國語第1課生字", "圈詞", "查生字", "國語習作第1課",
                    "數學習作P.10", "英文講義 Ch.1"
                ]
            },
            seatArrangements: [], // [{ id, name, studentOrder: [...studentIds] }]
            groups: [], // [{ id, name, memberIds: [...studentIds], tempScore: 0, tempTags: [] }]
            settings: {
                rowsPerPage: 6 // Actually columns per row
            }
        };

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge to ensure new fields act properly
                return {
                    ...defaultData,
                    ...parsed,
                    settingsOptions: parsed.settingsOptions || defaultData.settingsOptions,
                    contactBooks: parsed.contactBooks || defaultData.contactBooks,
                    homeworkStatus: parsed.homeworkStatus || defaultData.homeworkStatus,
                    seatArrangements: parsed.seatArrangements || defaultData.seatArrangements,
                    groups: parsed.groups || defaultData.groups
                };
            } catch (e) { console.error("Failed to parse saved data", e); }
        }
        return defaultData;
    });

    const [isSynced, setIsSynced] = useState(true);
    const [activeModal, setActiveModal] = useState(null); // 'draw' | 'timer' | 'contact' | 'check' | 'settings' | 'addStudent' | 'batchAvatar' | 'seats' | 'groups'
    const [draggedIndex, setDraggedIndex] = useState(null);

    // --- Effects ---
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        // Simple mock of a "sync" process
        if (!isSynced) {
            const timer = setTimeout(() => setIsSynced(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [data, isSynced]);

    // --- Derived State ---
    const currentClass = data.classes.find(c => c.id === data.currentClassId) || data.classes[0];
    const currentStudents = data.students.filter(s => s.classId === data.currentClassId);

    // Calculate stats
    const totalScore = currentStudents.reduce((acc, s) => acc + s.score, 0);
    const studentCount = currentStudents.length;

    // --- Helper ---
    const humanAvatars = ["👦", "👧", "🧑", "👱", "👨", "👩", "🧓", "👴", "👵", "👲", "👳", "🧕"];

    const getStudentStats = (studentId) => {
        let missing = 0;
        let correction = 0;
        Object.values(data.homeworkStatus).forEach(dayStatus => {
            const status = dayStatus[studentId];
            // Only count if status is explicitly set (not undefined)
            if (status !== undefined) {
                if (status === 0) missing++;
                if (status === 2) correction++;
            }
        });
        return { missing, correction };
    };

    // --- Handlers ---

    const handleClassChange = (newId) => {
        setData(prev => ({ ...prev, currentClassId: newId }));
    };

    const handleAddClass = () => {
        const name = prompt("請輸入新班級名稱:", "六年1班");
        if (!name) return;
        const newId = `c${Date.now()}`;
        setData(prev => ({
            ...prev,
            classes: [...prev.classes, { id: newId, name }],
            currentClassId: newId
        }));
    };

    const handleDeleteClass = () => {
        if (data.classes.length <= 1) {
            alert("至少保留一個班級！");
            return;
        }
        if (!confirm(`確定要刪除 ${currentClass.name} 及其所有學生資料嗎？`)) return;

        setData(prev => {
            const newClasses = prev.classes.filter(c => c.id !== prev.currentClassId);
            const newStudents = prev.students.filter(s => s.classId !== prev.currentClassId);
            return {
                ...prev,
                classes: newClasses,
                students: newStudents,
                currentClassId: newClasses[0].id
            };
        });
    };

    // Open Modal instead of prompt
    const handleAddStudent = () => {
        setActiveModal('addStudent');
    };

    const handleBatchAddStudents = (names) => {
        const newStudents = names.map((name, index) => {
            // Extract first Chinese character (surname) or first character if no Chinese
            const match = name.match(/[\u4e00-\u9fff]/);
            const avatarChar = match ? match[0] : name.charAt(0);

            return {
                id: `s${Date.now()}-${index}`,
                classId: data.currentClassId,
                name,
                score: 0,
                avatar: avatarChar,
                note: '',
                recordTag: '',
                showRecord: false
            };
        });

        setData(prev => ({
            ...prev,
            students: [...prev.students, ...newStudents]
        }));
        setIsSynced(false);
    };

    const handleDeleteStudent = (id) => {
        if (!confirm("確定刪除此學生?")) return;
        setData(prev => ({
            ...prev,
            students: prev.students.filter(s => s.id !== id)
        }));
    };

    const handleUpdateStudent = (id, updates) => {
        setIsSynced(false);
        setData(prev => ({
            ...prev,
            students: prev.students.map(s => s.id === id ? { ...s, ...updates } : s)
        }));
    };

    // DnD: Move student from fromIndex to toIndex
    const handleMoveStudent = (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;

        // We are moving within currentStudents. We need to reflect this in the main students array.
        // But main array contains students from OTHER classes too.
        // Strategy: Get currentStudents array, reorder it, then merge back.

        const reordered = [...currentStudents];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);

        // Now update the main data.students
        // We filter out current class students first, then append reordered?
        // Or finding indices? Safer to just replace the chunk properly.
        setData(prev => {
            const otherStudents = prev.students.filter(s => s.classId !== prev.currentClassId);
            return {
                ...prev,
                students: [...otherStudents, ...reordered]
            };
        });
        setIsSynced(false);
    };

    const handleBatchUpdateAvatars = (category) => {
        // Categories mapping to emojis or logic
        // We reuse logic from StudentCard if possible, or duplicate for simplicity.
        const emojis = {
            human: humanAvatars,
            animal: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦"],
            plant: ["🌵", "🌲", "🌳", "🌴", "🌱", "🌿", "🍀", "🍁", "🍂", "🍃", "🍄", "🌷", "🌸", "🌹", "🌻", "🌼"],
            robot: ["🤖", "👾", "👽", "👻", "💀", "☠️", "🎃"]
        };

        if (category === 'surname') {
            const updatedStudents = currentStudents.map(s => {
                // Find first chinese character (unicode range 4E00-9FFF)
                // Exclude numbers logic is handled by looking for Chinese
                const match = s.name.match(/[\u4e00-\u9fff]/);
                const char = match ? match[0] : s.name.charAt(0);
                return { ...s, avatar: char };
            });

            setData(prev => ({
                ...prev,
                students: [...prev.students.filter(s => s.classId !== prev.currentClassId), ...updatedStudents]
            }));
        } else {
            const list = emojis[category] || emojis.human;
            const updatedStudents = currentStudents.map(s => ({
                ...s,
                avatar: list[Math.floor(Math.random() * list.length)]
            }));

            setData(prev => {
                const otherStudents = prev.students.filter(s => s.classId !== prev.currentClassId);
                return {
                    ...prev,
                    students: [...otherStudents, ...updatedStudents]
                };
            });
        }
        setIsSynced(false);
    };

    const handleReset = () => {
        if (!confirm("確定要重置目前班級的所有分數和記錄嗎？")) return;
        setData(prev => ({
            ...prev,
            students: prev.students.map(s => s.classId === prev.currentClassId ? { ...s, score: 0, missing: 0, correction: 0, note: '', recordTag: '', showRecord: false } : s),
            homeworkStatus: {} // Reset checks too? Maybe keep history? Prompt implies scores/records. Let's keep history for now unless user asked. Actually user said "Reset scores/records". Usually implies wiping the slate.
        }));
    };

    const handleRowsChange = (val) => {
        setData(prev => ({ ...prev, settings: { ...prev.settings, rowsPerPage: Number(val) } }));
    };

    const handleUpdateContactBook = (date, info) => {
        setIsSynced(false);
        setData(prev => ({
            ...prev,
            contactBooks: {
                ...prev.contactBooks,
                [date]: info
            }
        }));
    };

    const handleUpdateHomeworkStatus = (date, studentId, status, homeworkItem) => {
        setIsSynced(false);
        setData(prev => {
            const key = `hw-${date}-${homeworkItem}`; // Include homework item in key
            const currentDayStatus = prev.homeworkStatus[key] || {};
            return {
                ...prev,
                homeworkStatus: {
                    ...prev.homeworkStatus,
                    [key]: {
                        ...currentDayStatus,
                        [studentId]: status
                    }
                }
            };
        });
    };

    const handleUpdateSettings = (newOptions) => {
        setData(prev => ({
            ...prev,
            settingsOptions: newOptions
        }));
    };

    const handleToggleRecords = () => {
        // Check if any is currently shown
        const anyShown = currentStudents.some(s => s.showRecord);
        const newState = !anyShown;

        setData(prev => ({
            ...prev,
            students: prev.students.map(s => s.classId === prev.currentClassId ? { ...s, showRecord: newState } : s)
        }));
    };

    const handleSortByName = () => {
        setData(prev => {
            // Get current class students and sort them by name
            const currentClassStudents = prev.students.filter(s => s.classId === prev.currentClassId);
            const sortedStudents = [...currentClassStudents].sort((a, b) =>
                a.name.localeCompare(b.name, 'zh-TW')
            );

            // Keep other class students unchanged
            const otherStudents = prev.students.filter(s => s.classId !== prev.currentClassId);

            return {
                ...prev,
                students: [...otherStudents, ...sortedStudents]
            };
        });
        setIsSynced(false);
    };

    // Seat Arrangements
    const handleSaveSeatArrangement = (name) => {
        const currentOrder = currentStudents.map(s => s.id);
        const newArrangement = {
            id: `seat-${Date.now()}`,
            name,
            studentOrder: currentOrder
        };
        setData(prev => ({
            ...prev,
            seatArrangements: [...prev.seatArrangements, newArrangement]
        }));
        setIsSynced(false);
    };

    const handleLoadSeatArrangement = (arrangementId) => {
        const arrangement = data.seatArrangements.find(a => a.id === arrangementId);
        if (!arrangement) return;

        const orderedStudents = [];
        arrangement.studentOrder.forEach(id => {
            const student = currentStudents.find(s => s.id === id);
            if (student) orderedStudents.push(student);
        });
        currentStudents.forEach(s => {
            if (!orderedStudents.find(os => os.id === s.id)) {
                orderedStudents.push(s);
            }
        });

        setData(prev => {
            const otherStudents = prev.students.filter(s => s.classId !== prev.currentClassId);
            return {
                ...prev,
                students: [...otherStudents, ...orderedStudents]
            };
        });
        setIsSynced(false);
    };

    const handleDeleteSeatArrangement = (arrangementId) => {
        setData(prev => ({
            ...prev,
            seatArrangements: prev.seatArrangements.filter(a => a.id !== arrangementId)
        }));
    };

    // Groups
    const handleSaveGroup = (groupName, memberIds) => {
        const newGroup = {
            id: `group-${Date.now()}`,
            name: groupName,
            memberIds,
            tempScore: 0,
            tempTags: []
        };
        setData(prev => ({
            ...prev,
            groups: [...prev.groups, newGroup]
        }));
    };

    const handleDeleteGroup = (groupId) => {
        setData(prev => ({
            ...prev,
            groups: prev.groups.filter(g => g.id !== groupId)
        }));
    };

    const handleUpdateGroupTempScore = (groupId, delta) => {
        setData(prev => ({
            ...prev,
            groups: prev.groups.map(g => g.id === groupId ? { ...g, tempScore: (g.tempScore || 0) + delta } : g)
        }));
    };

    const handleUpdateGroupTempTag = (groupId, tag) => {
        const today = new Date();
        const datePrefix = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}(分組)`;
        const formattedTag = `${datePrefix} ${tag}`;

        setData(prev => ({
            ...prev,
            groups: prev.groups.map(g => g.id === groupId ? { ...g, tempTags: [...(g.tempTags || []), formattedTag] } : g)
        }));
    };

    const handleRemoveGroupTempTag = (groupId, tagIndex) => {
        setData(prev => ({
            ...prev,
            groups: prev.groups.map(g => g.id === groupId ? {
                ...g,
                tempTags: (g.tempTags || []).filter((_, i) => i !== tagIndex)
            } : g)
        }));
    };

    const handleCommitGroupScores = () => {
        setData(prev => {
            const newStudents = [...prev.students];
            const newGroups = prev.groups.map(group => {
                const tScore = group.tempScore || 0;
                const tTags = group.tempTags || [];

                if (tScore !== 0 || tTags.length > 0) {
                    // Update all members
                    group.memberIds.forEach(mid => {
                        const sIdx = newStudents.findIndex(s => s.id === mid);
                        if (sIdx > -1) {
                            const formattedTags = tTags.join('\n');
                            const currentNote = newStudents[sIdx].note || '';
                            const newNote = currentNote + (currentNote && formattedTags ? '\n' : '') + formattedTags;

                            newStudents[sIdx] = {
                                ...newStudents[sIdx],
                                score: newStudents[sIdx].score + tScore,
                                note: newNote
                            };
                        }
                    });
                    // Reset group
                    return { ...group, tempScore: 0, tempTags: [] };
                }
                return group;
            });

            return {
                ...prev,
                students: newStudents,
                groups: newGroups
            };
        });
        setIsSynced(false);
        alert("已將分數及記錄加回學生，小組分數已歸零！");
    };


    const handleUpdateStudentScore = (id, scoreDelta) => {
        setIsSynced(false);

        // Find all students that should be updated
        // If the ID belongs to a group, all members of that group get the delta.
        const affectedMemberIds = new Set();

        if (Array.isArray(id)) {
            id.forEach(sid => affectedMemberIds.add(sid));
        } else {
            affectedMemberIds.add(id);
            // Check if this student is in any group
            data.groups.forEach(g => {
                if (g.memberIds.includes(id)) {
                    g.memberIds.forEach(mid => affectedMemberIds.add(mid));
                }
            });
        }

        setData(prev => ({
            ...prev,
            students: prev.students.map(s =>
                affectedMemberIds.has(s.id)
                    ? { ...s, score: s.score + scoreDelta }
                    : s
            )
        }));
    };

    // --- Import / Export ---
    const handleExportJSON = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        saveAs(blob, `classroom_backup_${new Date().toISOString().split('T')[0]}.json`);
    };

    const handleImportJSON = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (imported.classes && imported.students) {
                        setData(imported);
                        alert("匯入成功！");
                    } else {
                        alert("檔案格式錯誤");
                    }
                } catch (err) {
                    alert("讀取檔案失敗");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();

        // Export all classes sorted by name
        const sortedClasses = [...data.classes].sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));

        sortedClasses.forEach(cls => {
            const classStudents = data.students.filter(s => s.classId === cls.id);
            const ws = XLSX.utils.json_to_sheet(classStudents.map(s => {
                const stats = getStudentStats(s.id);
                return {
                    ID: s.id,
                    姓名: s.name,
                    分數: s.score,
                    未繳交次數: stats.missing,
                    待訂正次數: stats.correction,
                    表現: s.recordTag,
                    備註: s.note
                };
            }));
            XLSX.utils.book_append_sheet(wb, ws, cls.name);
        });

        const fileName = `classroom_data_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
            {/* Header Bar */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">班級小管家 <span className="text-gray-400 font-normal text-sm ml-1">(全自動雲端版)</span></h1>
                </div>

                <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                        總分: <span className={`font-bold ${totalScore < 0 ? 'text-red-500' : 'text-green-600'}`}>{totalScore}</span>
                    </div>
                    <div>學生數: {studentCount}</div>
                    <div>班級: {currentClass ? currentClass.name : '無'}</div>
                    <div className="text-gray-400">{new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">

                <Toolbar
                    classes={data.classes}
                    currentClassId={data.currentClassId}
                    onClassChange={handleClassChange}
                    onAddClass={handleAddClass}
                    onDeleteClass={handleDeleteClass}
                    onAddStudent={handleAddStudent}
                    onReset={handleReset}
                    rowsPerPage={data.settings.rowsPerPage}
                    onRowsChange={handleRowsChange}
                    isSynced={isSynced}
                    onExportJSON={handleExportJSON}
                    onImportJSON={handleImportJSON}
                    onExportExcel={handleExportExcel}
                    onDraw={() => setActiveModal('draw')}
                    onTimer={() => setActiveModal('timer')}
                    onContact={() => setActiveModal('contact')}
                    onCheck={() => setActiveModal('check')}
                    onSettings={() => setActiveModal('settings')}
                    onToggleRecords={handleToggleRecords}
                    onAvatarWizard={() => setActiveModal('batchAvatar')}
                    onSortByName={handleSortByName}
                    onSeats={() => setActiveModal('seats')}
                    onGroups={() => setActiveModal('groups')}
                />

                {/* Student Grid */}
                <div
                    className="grid gap-6 w-full"
                    style={{
                        gridTemplateColumns: `repeat(${data.settings.rowsPerPage}, minmax(0, 1fr))`
                    }}
                >
                    {currentStudents.map((student, index) => (
                        <StudentCard
                            key={student.id}
                            index={index}
                            student={student}
                            onUpdate={handleUpdateStudent}
                            onUpdateScore={handleUpdateStudentScore}
                            onDelete={handleDeleteStudent}
                            behaviorOptions={data.settingsOptions ? data.settingsOptions.behaviors : []}
                            stats={getStudentStats(student.id)}
                            draggable
                            onDragStart={(e) => {
                                setDraggedIndex(index);
                                e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                                e.preventDefault(); // allow drop
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                handleMoveStudent(draggedIndex, index);
                                setDraggedIndex(null);
                            }}
                        />
                    ))}
                </div>

                {currentStudents.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-xl mb-2">此班級尚無學生資料</p>
                        <button onClick={handleAddStudent} className="text-indigo-500 hover:underline">立即加入</button>
                    </div>
                )}

            </main>

            {/* Modals */}
            {activeModal === 'draw' && (
                <Modal title="幸運抽籤" onClose={() => setActiveModal(null)}>
                    <DrawModal students={currentStudents} onClose={() => setActiveModal(null)} />
                </Modal>
            )}
            {activeModal === 'timer' && (
                <Modal title="倒數計時器" onClose={() => setActiveModal(null)}>
                    <TimerModal onClose={() => setActiveModal(null)} />
                </Modal>
            )}
            {activeModal === 'contact' && (
                <Modal title="📝 聯絡簿" onClose={() => setActiveModal(null)}>
                    <ContactBookModal
                        data={data.contactBooks}
                        options={data.settingsOptions}
                        onSave={handleUpdateContactBook}
                        onClose={() => setActiveModal(null)}
                    />
                </Modal>
            )}
            {activeModal === 'check' && (
                <Modal title="作業檢查" onClose={() => setActiveModal(null)}>
                    <HomeworkCheckModal
                        students={currentStudents}
                        contactBooks={data.contactBooks}
                        homeworkStatus={data.homeworkStatus}
                        options={data.settingsOptions}
                        onUpdateStatus={handleUpdateHomeworkStatus}
                        onClose={() => setActiveModal(null)}
                    />
                </Modal>
            )}
            {activeModal === 'settings' && (
                <Modal title="系統設定" onClose={() => setActiveModal(null)}>
                    <SettingsModal
                        options={data.settingsOptions}
                        onSave={handleUpdateSettings}
                        onClose={() => setActiveModal(null)}
                    />
                </Modal>
            )}
            {activeModal === 'addStudent' && (
                <Modal title="加入學生" onClose={() => setActiveModal(null)}>
                    <AddStudentModal
                        onAdd={handleBatchAddStudents}
                        onClose={() => setActiveModal(null)}
                    />
                </Modal>
            )}
            {activeModal === 'batchAvatar' && (
                <Modal title="批量頭像設定" onClose={() => setActiveModal(null)}>
                    <BatchAvatarModal
                        onUpdate={handleBatchUpdateAvatars}
                        onClose={() => setActiveModal(null)}
                    />
                </Modal>
            )}
            {activeModal === 'seats' && (
                <Modal title="座位表管理" onClose={() => setActiveModal(null)}>
                    <SeatArrangementsModal
                        arrangements={data.seatArrangements}
                        onSave={handleSaveSeatArrangement}
                        onLoad={handleLoadSeatArrangement}
                        onDelete={handleDeleteSeatArrangement}
                        onClose={() => setActiveModal(null)}
                    />
                </Modal>
            )}
            {activeModal === 'groups' && (
                <Modal title="分組管理" onClose={() => setActiveModal(null)}>
                    <GroupsModal
                        students={currentStudents}
                        groups={data.groups}
                        options={data.settingsOptions}
                        onSave={handleSaveGroup}
                        onDelete={handleDeleteGroup}
                        onUpdateTempScore={handleUpdateGroupTempScore}
                        onUpdateTempTag={handleUpdateGroupTempTag}
                        onRemoveTempTag={handleRemoveGroupTempTag}
                        onCommit={handleCommitGroupScores}
                        onClose={() => setActiveModal(null)}
                    />
                </Modal>
            )}

        </div>
    );
}

export default App;
