// נתונים לדוגמה (לצורך הדגמה בלבד - במערכת אמיתית נשתמש בשמירה ב-localStorage או בשרת)
const sampleData = {
    soldiers: [
        { id: 1, name: "יובל לוי", personalNumber: "8724391", rank: "סמ״ר", phone: "050-1234567" },
        { id: 2, name: "נועה כהן", personalNumber: "8675309", rank: "סמל", phone: "052-7654321" },
        { id: 3, name: "עומר גולן", personalNumber: "8314567", rank: "רב״ט", phone: "054-9876543" },
        { id: 4, name: "שירה אברהם", personalNumber: "8267809", rank: "טוראי", phone: "053-1472583" }
    ],
    shifts: [
        { id: 1, date: "2025-03-12", time: "08:00-14:00", soldierId: 1, position: "שער ראשי" },
        { id: 2, date: "2025-03-12", time: "14:00-20:00", soldierId: 2, position: "שער ראשי" },
        { id: 3, date: "2025-03-12", time: "20:00-08:00", soldierId: 3, position: "שער ראשי" },
        { id: 4, date: "2025-03-13", time: "08:00-14:00", soldierId: 4, position: "שער ראשי" },
        { id: 5, date: "2025-03-13", time: "14:00-20:00", soldierId: 1, position: "שער ראשי" }
    ],
    vacations: [
        { id: 1, soldierId: 2, startDate: "2025-03-15", endDate: "2025-03-18", type: "חופשה שנתית" },
        { id: 2, soldierId: 4, startDate: "2025-03-20", endDate: "2025-03-22", type: "מחלה" }
    ]
};

// מצב האפליקציה
const appState = {
    isCommanderMode: true,
    currentTab: 'schedule',
    data: { ...sampleData }
};

// יצירת אלמנטים דינמיים
function renderSchedule() {
    const scheduleList = document.querySelector('.schedule-list');
    scheduleList.innerHTML = '';
    
    // לקבל את הנתונים הרלוונטיים
    const shifts = appState.data.shifts;
    
    // מיון לפי תאריך ושעה
    const sortedShifts = [...shifts].sort((a, b) => {
        if (a.date !== b.date) {
            return new Date(a.date) - new Date(b.date);
        }
        return a.time.localeCompare(b.time);
    });
    
    // קיבוץ לפי תאריך
    const shiftsByDate = {};
    sortedShifts.forEach(shift => {
        if (!shiftsByDate[shift.date]) {
            shiftsByDate[shift.date] = [];
        }
        shiftsByDate[shift.date].push(shift);
    });
    
    // יצירת רשימת השמירות
    Object.entries(shiftsByDate).forEach(([date, shifts]) => {
        // המרת התאריך לפורמט קריא יותר
        const formattedDate = new Date(date).toLocaleDateString('he-IL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // כותרת תאריך
        const dateHeader = document.createElement('h3');
        dateHeader.classList.add('date-header');
        dateHeader.textContent = formattedDate;
        scheduleList.appendChild(dateHeader);
        
        // שמירות של היום
        shifts.forEach(shift => {
            const soldier = appState.data.soldiers.find(s => s.id === shift.soldierId);
            
            const shiftItem = document.createElement('div');
            shiftItem.classList.add('list-item', 'shift-item');
            
            const shiftHeader = document.createElement('div');
            shiftHeader.classList.add('shift-header');
            
            const timeSpan = document.createElement('span');
            timeSpan.classList.add('shift-time');
            timeSpan.textContent = shift.time;
            
            const positionSpan = document.createElement('span');
            positionSpan.classList.add('shift-position');
            positionSpan.textContent = shift.position;
            
            shiftHeader.appendChild(timeSpan);
            shiftHeader.appendChild(positionSpan);
            
            const soldierInfo = document.createElement('div');
            soldierInfo.classList.add('shift-soldier');
            soldierInfo.textContent = soldier ? `${soldier.rank} ${soldier.name}` : 'לא משובץ';
            
            shiftItem.appendChild(shiftHeader);
            shiftItem.appendChild(soldierInfo);
            
            // הוספת כפתורים לעריכה ומחיקה במצב מפקד
            if (appState.isCommanderMode) {
                const actionButtons = document.createElement('div');
                actionButtons.classList.add('item-actions', 'commander-only');
                
                const editButton = document.createElement('button');
                editButton.classList.add('action-icon');
                editButton.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>';
                editButton.addEventListener('click', () => editShift(shift.id));
                
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('action-icon');
                deleteButton.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
                deleteButton.addEventListener('click', () => deleteShift(shift.id));
                
                actionButtons.appendChild(editButton);
                actionButtons.appendChild(deleteButton);
                shiftItem.appendChild(actionButtons);
            }
            
            scheduleList.appendChild(shiftItem);
        });
    });
}

function renderVacations() {
    const vacationList = document.querySelector('.vacation-list');
    vacationList.innerHTML = '';
    
    // לקבל את הנתונים הרלוונטיים
    const vacations = appState.data.vacations;
    
    // מיון לפי תאריך התחלה
    const sortedVacations = [...vacations].sort((a, b) => {
        return new Date(a.startDate) - new Date(b.startDate);
    });
    
    // יצירת רשימת החופשות
    sortedVacations.forEach(vacation => {
        const soldier = appState.data.soldiers.find(s => s.id === vacation.soldierId);
        
        const vacationItem = document.createElement('div');
        vacationItem.classList.add('list-item', 'vacation-item');
        
        const vacationHeader = document.createElement('div');
        vacationHeader.classList.add('vacation-header');
        
        // המרת התאריכים לפורמט קריא יותר
        const startDate = new Date(vacation.startDate).toLocaleDateString('he-IL');
        const endDate = new Date(vacation.endDate).toLocaleDateString('he-IL');
        
        const dateRangeSpan = document.createElement('span');
        dateRangeSpan.classList.add('vacation-dates');
        dateRangeSpan.textContent = `${startDate} - ${endDate}`;
        
        const typeSpan = document.createElement('span');
        typeSpan.classList.add('vacation-type');
        typeSpan.textContent = vacation.type;
        
        vacationHeader.appendChild(dateRangeSpan);
        vacationHeader.appendChild(typeSpan);
        
        const soldierInfo = document.createElement('div');
        soldierInfo.classList.add('vacation-soldier');
        soldierInfo.textContent = soldier ? `${soldier.rank} ${soldier.name}` : 'לא ידוע';
        
        vacationItem.appendChild(vacationHeader);
        vacationItem.appendChild(soldierInfo);
        
        // הוספת כפתורים לעריכה ומחיקה במצב מפקד
        if (appState.isCommanderMode) {
            const actionButtons = document.createElement('div');
            actionButtons.classList.add('item-actions', 'commander-only');
            
            const editButton = document.createElement('button');
            editButton.classList.add('action-icon');
            editButton.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>';
            editButton.addEventListener('click', () => editVacation(vacation.id));
            
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('action-icon');
            deleteButton.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
            deleteButton.addEventListener('click', () => deleteVacation(vacation.id));
            
            actionButtons.appendChild(editButton);
            actionButtons.appendChild(deleteButton);
            vacationItem.appendChild(actionButtons);
        }
        
        vacationList.appendChild(vacationItem);
    });
}

function renderSoldiers() {
    const soldiersList = document.querySelector('.soldiers-list');
    soldiersList.innerHTML = '';
    
    // לקבל את הנתונים הרלוונטיים
    const soldiers = appState.data.soldiers;
    
    // מיון לפי שם
    const sortedSoldiers = [...soldiers].sort((a, b) => a.name.localeCompare(b.name));
    
    // יצירת רשימת החיילים
    sortedSoldiers.forEach(soldier => {
        const soldierItem = document.createElement('div');
        soldierItem.classList.add('list-item', 'soldier-item');
        
        const soldierHeader = document.createElement('div');
        soldierHeader.classList.add('soldier-header');
        
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('soldier-name');
        nameSpan.textContent = `${soldier.rank} ${soldier.name}`;
        
        const personalNumberSpan = document.createElement('span');
        personalNumberSpan.classList.add('soldier-personal-number');
        personalNumberSpan.textContent = soldier.personalNumber;
        
        soldierHeader.appendChild(nameSpan);
        soldierHeader.appendChild(personalNumberSpan);
        
        const phoneInfo = document.createElement('div');
        phoneInfo.classList.add('soldier-phone');
        phoneInfo.textContent = soldier.phone;
        
        soldierItem.appendChild(soldierHeader);
        soldierItem.appendChild(phoneInfo);
        
        // הוספת כפתורים לעריכה ומחיקה במצב מפקד
        if (appState.isCommanderMode) {
            const actionButtons = document.createElement('div');
            actionButtons.classList.add('item-actions', 'commander-only');
            
            const editButton = document.createElement('button');
            editButton.classList.add('action-icon');
            editButton.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>';
            editButton.addEventListener('click', () => editSoldier(soldier.id));
            
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('action-icon');
            deleteButton.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6