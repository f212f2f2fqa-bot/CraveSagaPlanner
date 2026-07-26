const mockWeapons = [
    { id: 'w1', name: 'Flame Blade', element: 'fire', weaponType: 'sword', color: '#E57373' },
    { id: 'w2', name: 'Frost Spear', element: 'water', weaponType: 'spear', color: '#64B5F6' },
    { id: 'w3', name: 'Gaia Bow', element: 'wind', weaponType: 'bow', color: '#81C784' },
    { id: 'w4', name: 'Solar Dagger', element: 'light', weaponType: 'special blade', color: '#FFB74D' },
    { id: 'w5', name: 'Shadow Staff', element: 'dark', weaponType: 'staff', color: '#BA68C8' }
];

// Ensure mockSacreds has a safe fallback array if sacreds.js is missing/empty
if (typeof window.mockSacreds === 'undefined') {
    window.mockSacreds = [];
}
const mockSacreds = window.mockSacreds;

const version1 = document.getElementById('version1');
const version2 = document.getElementById('version2');
const uiToggle = document.getElementById('uiToggle');

let activeTargetSlot = null;
let currentActionSlot = null;
let currentSelectionType = 'soulmate';
let activeVersionNum = 2;

const characterLoadouts = { 1: {}, 2: {} };
const selectedSacreds = { 1: {}, 2: {} };

// Ensure mockSoulmates has a safe fallback array if soulmates.js is missing/empty
if (typeof window.mockSoulmates === 'undefined') {
    window.mockSoulmates = [];
}

function getElementColor(el) {
    if (el && el.startsWith('#')) return el;
    switch (el) {
        case 'fire': return '#D32F2F';
        case 'water': return '#1976D2';
        case 'wind': return '#388E3C';
        case 'earth': return '#8D6E63';
        case 'light': return '#FBC02D';
        case 'dark': return '#7B1FA2';
        default: return '#555555';
    }
}

function getAssignedIds(versionNum, type) {
    const assigned = [];
    const activeVerContainer = document.getElementById(versionNum === 2 ? 'version2' : 'version1');
    if (type === 'soulmate') {
        const roster = activeVerContainer.querySelectorAll('.sm-card .portrait');
        roster.forEach(slot => {
            if (slot.dataset.selectedId) assigned.push(slot.dataset.selectedId);
        });
    } else if (type === 'sacred') {
        const sacreds = activeVerContainer.querySelectorAll('.sac-card .sac-portrait');
        sacreds.forEach(slot => {
            if (slot.dataset.selectedId) assigned.push(slot.dataset.selectedId);
        });
    }
    return assigned;
}

function populateMockDatabase(versionNum) {
    const grid = document.getElementById('dbGrid' + versionNum);
    if (!grid) return;

    const assignedIds = getAssignedIds(versionNum, currentSelectionType);
    const searchInput = document.getElementById('searchInput' + versionNum);
    const searchText = searchInput ? searchInput.value.toLowerCase() : '';

    const elementRow = document.getElementById('elementFilterRow' + versionNum);
    const weaponRow = document.getElementById('weaponFilterRow' + versionNum);

    if (currentSelectionType === 'weapon') {
        if (elementRow) elementRow.style.display = 'flex';
        if (weaponRow) weaponRow.style.display = 'flex';
    } else if (currentSelectionType === 'soulmate') {
        if (elementRow) elementRow.style.display = 'flex';
        if (weaponRow) weaponRow.style.display = 'flex';
    } else {
        if (elementRow) elementRow.style.display = 'flex';
        if (weaponRow) weaponRow.style.display = 'none';
    }

    const selectedElements = Array.from(document.querySelectorAll(`#selectionPanel${versionNum} #elementFilterRow${versionNum} input:checked`)).map(cb => cb.value);
    const selectedWeapons = Array.from(document.querySelectorAll(`#selectionPanel${versionNum} #weaponFilterRow${versionNum} input:checked`)).map(cb => cb.value);

    let html = '';

    if (currentSelectionType === 'soulmate') {
        mockSoulmates.forEach(char => {
            const matchesSearch = char.name.toLowerCase().includes(searchText);
            const matchesElement = selectedElements.length === 0 || selectedElements.includes(char.element);
            const matchesWeapon = selectedWeapons.length === 0 || char.preferredWeapons.some(w => selectedWeapons.includes(w));

            if (matchesSearch && matchesElement && matchesWeapon) {
                const isDisabled = assignedIds.includes(char.id);
                const elColor = getElementColor(char.element);
                const iconPath = char.iconFile && char.iconFile !== 'N/A' ? `Icons/Soulmates/${char.iconFile}` : '';
                const dragData = JSON.stringify({
                    id: char.id,
                    name: char.name,
                    color: elColor,
                    element: char.element,
                    preferredWeapons: char.preferredWeapons,
                    iconFile: char.iconFile || '',
                    selectionType: 'soulmate'
                }).replace(/"/g, '&quot;');

                html += `
                <div class="db-item ${isDisabled ? 'disabled' : ''}" 
                     draggable="true" 
                     ondragstart="event.dataTransfer.setData('text/plain', '${dragData}'); event.dataTransfer.effectAllowed = 'copy';"
                     onclick="selectMockSoulmate('${char.id}', '${char.name}', '${elColor}', '${char.element}', ${JSON.stringify(char.preferredWeapons).replace(/"/g, '&quot;')}, '${char.iconFile || ''}')">
                    <div class="db-icon">
                        ${iconPath 
                            ? `<img src="${iconPath}" alt="${char.name}" onerror="handleImageError(this, '${char.name.replace(/'/g, "\\'")}', '${char.element}', 'Soulmates')" style="width:100%; height:100%; object-fit:cover; border-radius:2px;">`
                            : `<div class="token-icon" style="background-color: ${elColor};">${char.name.substring(0, 2).toUpperCase()}</div>`
                        }
                    </div>
                    <div class="db-name">${char.name}</div>
                </div>
            `;
            }
        });
    } else if (currentSelectionType === 'sacred') {
        mockSacreds.forEach(sac => {
            const matchesSearch = sac.name.toLowerCase().includes(searchText);
            const matchesElement = selectedElements.length === 0 || selectedElements.includes(sac.element);

            if (matchesSearch && matchesElement) {
                const isDisabled = assignedIds.includes(sac.id);
                const elColor = getElementColor(sac.element);
                const iconPath = sac.iconFile && sac.iconFile !== 'N/A' ? `Icons/Sacreds/${sac.iconFile}` : '';
                const dragData = JSON.stringify({
                    id: sac.id,
                    name: sac.name,
                    color: elColor,
                    element: sac.element,
                    iconFile: sac.iconFile || '',
                    selectionType: 'sacred'
                }).replace(/"/g, '&quot;');

                html += `
                <div class="db-item ${isDisabled ? 'disabled' : ''}" 
                     draggable="true" 
                     ondragstart="event.dataTransfer.setData('text/plain', '${dragData}'); event.dataTransfer.effectAllowed = 'copy';"
                     onclick="selectMockSacred('${sac.id}', '${sac.name}', '${elColor}', '${sac.element}', '${sac.iconFile || ''}')">
                    <div class="db-icon">
                        ${iconPath 
                            ? `<img src="${iconPath}" alt="${sac.name}" onerror="handleImageError(this, '${sac.name.replace(/'/g, "\\'")}', '${sac.element}', 'Sacreds')" style="width:100%; height:100%; object-fit:cover; border-radius:2px;">`
                            : `<div class="token-icon" style="background-color: ${elColor};">${sac.name.substring(0, 2).toUpperCase()}</div>`
                        }
                    </div>
                    <div class="db-name">${sac.name}</div>
                </div>
            `;
            }
        });
    } else if (currentSelectionType === 'weapon') {
        mockWeapons.forEach(wep => {
            const matchesSearch = wep.name.toLowerCase().includes(searchText);
            const matchesElement = selectedElements.length === 0 || selectedElements.includes(wep.element);
            const matchesWeapon = selectedWeapons.length === 0 || selectedWeapons.includes(wep.weaponType);

            if (matchesSearch && matchesElement && matchesWeapon) {
                const dragData = JSON.stringify({
                    id: wep.id,
                    name: wep.name,
                    color: wep.color,
                    selectionType: 'weapon'
                }).replace(/"/g, '&quot;');

                html += `
                <div class="db-item" 
                     draggable="true" 
                     ondragstart="event.dataTransfer.setData('text/plain', '${dragData}'); event.dataTransfer.effectAllowed = 'copy';"
                     onclick="selectMockWeapon('${wep.id}', '${wep.name}', '${wep.color}')">
                    <div class="db-icon"><div class="token-icon" style="background-color: ${wep.color};">${wep.name.substring(0, 2).toUpperCase()}</div></div>
                    <div class="db-name">${wep.name}</div>
                </div>
            `;
            }
        });
    }
    grid.innerHTML = html;
}

function filterDatabase(versionNum) {
    populateMockDatabase(versionNum);
}

function switchUI() {
    if (uiToggle.checked) {
        version1.classList.add('active');
        version2.classList.remove('active');
        activeVersionNum = 1;
    } else {
        version2.classList.add('active');
        version1.classList.remove('active');
        activeVersionNum = 2;
    }
    closeActionMenu();
}

function openSelectionPanel(type, versionNum, slotElement) {
    document.querySelectorAll('.slot.active-slot').forEach(el => el.classList.remove('active-slot'));
    activeTargetSlot = slotElement;
    if (activeTargetSlot) {
        activeTargetSlot.classList.add('active-slot');
    }
    currentSelectionType = type;
    activeVersionNum = versionNum;

    const timeline = document.getElementById('timelinePanel' + versionNum);
    const selection = document.getElementById('selectionPanel' + versionNum);
    const title = document.getElementById('selectionTitle' + versionNum);

    if (type === 'soulmate') title.innerText = "Select Soulmate";
    else if (type === 'sacred') title.innerText = "Select Sacred";
    else if (type === 'weapon') title.innerText = "Select Weapon";

    const searchInput = document.getElementById('searchInput' + versionNum);
    if (searchInput) searchInput.value = '';

    populateMockDatabase(versionNum);

    timeline.style.display = 'none';
    selection.style.display = 'flex';
    closeActionMenu();
}

function closeSelectionPanel(versionNum) {
    document.querySelectorAll('.slot.active-slot').forEach(el => el.classList.remove('active-slot'));
    const timeline = document.getElementById('timelinePanel' + versionNum);
    const selection = document.getElementById('selectionPanel' + versionNum);

    selection.style.display = 'none';
    timeline.style.display = 'flex';
    activeTargetSlot = null;
}

function selectMockSoulmate(id, name, color, element, preferredWeapons, iconFile) {
    if (activeTargetSlot) {
        activeTargetSlot.dataset.selectedId = id;
        const iconPath = iconFile && iconFile !== 'N/A' ? `Icons/Soulmates/${iconFile}` : '';
        activeTargetSlot.innerHTML = `
            ${iconPath 
                ? `<img src="${iconPath}" alt="${name}" onerror="handleImageError(this, '${name.replace(/'/g, "\\'")}', '${element}', 'Soulmates')" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">`
                : `<div class="token-icon" style="background-color: ${color};">${name.substring(0, 2).toUpperCase()}</div>`
            }
            <button class="btn-clear-slot" onclick="clearSlot(event, this)">✕</button>
        `;

        const smCard = activeTargetSlot.closest('.sm-card');
        if (smCard) {
            const smIndex = parseInt(smCard.getAttribute('data-index'));
            const hasExistingLoadout = characterLoadouts[activeVersionNum][smIndex] && characterLoadouts[activeVersionNum][smIndex].id;

            const wepSlots = smCard.querySelectorAll('.wep-slot');
            let weaponsToSave;

            if (hasExistingLoadout) {
                // Keep currently equipped weapons
                weaponsToSave = characterLoadouts[activeVersionNum][smIndex].weapons;
            } else {
                // Keep them blank
                weaponsToSave = [
                    { name: '', color: '' }, 
                    { name: '', color: '' }, 
                    { name: '', color: '' }
                ];
                // Ensure visual display of weapon slots stays blank (W1, W2, W3)
                wepSlots.forEach((slot, idx) => {
                    delete slot.dataset.selectedId;
                    slot.innerHTML = `W${idx + 1}`;
                });
            }

            characterLoadouts[activeVersionNum][smIndex] = {
                id: id,
                name: name,
                color: color,
                element: element,
                preferredWeapons: preferredWeapons,
                iconFile: iconFile,
                weapons: weaponsToSave,
                personal: '#B71C1C',
                ultimate: '#FFD700'
            };

            updateTimelineHeader(activeVersionNum, smIndex, color, name, iconFile);
        }
        populateMockDatabase(activeVersionNum);
    }
}

function selectMockSacred(id, name, color, element, iconFile) {
    if (activeTargetSlot) {
        activeTargetSlot.dataset.selectedId = id;
        const iconPath = iconFile && iconFile !== 'N/A' ? `Icons/Sacreds/${iconFile}` : '';
        activeTargetSlot.innerHTML = `
            ${iconPath 
                ? `<img src="${iconPath}" alt="${name}" onerror="handleImageError(this, '${name.replace(/'/g, "\\'")}', '${element}', 'Sacreds')" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">`
                : `<div class="token-icon" style="background-color: ${color};">${name.substring(0, 2).toUpperCase()}</div>`
            }
            <button class="btn-clear-slot" onclick="clearSlot(event, this)">✕</button>
        `;

        const sacCard = activeTargetSlot.closest('.sac-card');
        if (sacCard) {
            const sacIndex = Array.from(sacCard.parentNode.children).indexOf(sacCard);
            selectedSacreds[activeVersionNum][sacIndex] = { id, name, color, element, iconFile };
        }
        populateMockDatabase(activeVersionNum);
    }
}

function selectMockWeapon(id, name, color) {
    if (activeTargetSlot) {
        activeTargetSlot.dataset.selectedId = id;
        activeTargetSlot.innerHTML = `
            <div class="token-icon" style="background-color: ${color};">${name.substring(0, 2).toUpperCase()}</div>
            <button class="btn-clear-slot" onclick="clearSlot(event, this)">✕</button>
        `;

        const smCard = activeTargetSlot.closest('.sm-card');
        if (smCard) {
            const smIndex = parseInt(smCard.getAttribute('data-index'));
            const wepSlots = Array.from(smCard.querySelectorAll('.wep-slot'));
            const slotIndex = wepSlots.indexOf(activeTargetSlot);

            if (slotIndex !== -1 && characterLoadouts[activeVersionNum][smIndex]) {
                characterLoadouts[activeVersionNum][smIndex].weapons[slotIndex] = { name: name, color: color };
            }
        }
        populateMockDatabase(activeVersionNum);
    }
}

function clearSlot(event, btn) {
    event.stopPropagation();
    const slot = btn.parentNode;
    if (!slot) return;

    delete slot.dataset.selectedId;

    let versionNum = 2;
    if (slot.closest('#version1')) versionNum = 1;

    if (slot.classList.contains('portrait')) {
        slot.innerHTML = 'SM';

        const smCard = slot.closest('.sm-card');
        if (smCard) {
            const smIndex = parseInt(smCard.getAttribute('data-index'));
            delete characterLoadouts[versionNum][smIndex];

            const wepSlots = smCard.querySelectorAll('.wep-slot');
            wepSlots.forEach((wepSlot, idx) => {
                delete wepSlot.dataset.selectedId;
                wepSlot.innerHTML = `W${idx + 1}`;
            });

            updateTimelineHeader(versionNum, smIndex, '#252525', `SM${smIndex + 1}`, '');
        }
    } else if (slot.classList.contains('wep-slot')) {
        const smCard = slot.closest('.sm-card');
        if (smCard) {
            const smIndex = parseInt(smCard.getAttribute('data-index'));
            const wepSlots = Array.from(smCard.querySelectorAll('.wep-slot'));
            const slotIndex = wepSlots.indexOf(slot);

            slot.innerHTML = `W${slotIndex + 1}`;

            if (characterLoadouts[versionNum][smIndex]) {
                characterLoadouts[versionNum][smIndex].weapons[slotIndex] = { name: '', color: '' };
            }
        } else {
            slot.innerHTML = 'W';
        }
    } else if (slot.classList.contains('sac-portrait')) {
        const sacCard = slot.closest('.sac-card');
        let sacIndex = 0;
        if (sacCard) {
            sacIndex = Array.from(sacCard.parentNode.children).indexOf(sacCard);
            delete selectedSacreds[versionNum][sacIndex];
        }
        slot.innerHTML = 'Sac';
    }

    populateMockDatabase(versionNum);
}

function handleImageError(img, name, element, folder) {
    const cleanName = name.replace(/\(.*?\)/g, '').trim().replace(/[\s-]/g, '_');
    const cleanNameLower = cleanName.toLowerCase();
    
    if (!img.dataset.tryCount) {
        img.dataset.originalSrc = img.src;
        img.dataset.tryCount = 1;
        // Try 1: Capitalized name casing + .png
        img.src = `Icons/${folder}/${cleanName}.png`;
    } else if (img.dataset.tryCount == 1) {
        img.dataset.tryCount = 2;
        // Try 2: Element prefix + capitalized + .png
        img.src = `Icons/${folder}/${element}_${cleanName}.png`;
    } else if (img.dataset.tryCount == 2) {
        img.dataset.tryCount = 3;
        // Try 3: Lowercase + .png
        img.src = `Icons/${folder}/${cleanNameLower}.png`;
    } else if (img.dataset.tryCount == 3) {
        img.dataset.tryCount = 4;
        // Try 4: Element prefix + lowercase + .png
        img.src = `Icons/${folder}/${element}_${cleanNameLower}.png`;
    } else if (img.dataset.tryCount == 4) {
        img.dataset.tryCount = 5;
        // Try 5: Original mapped file with uppercase .PNG
        const origFile = img.src.substring(img.src.lastIndexOf('/') + 1);
        if (origFile.toLowerCase().endsWith('.png')) {
            img.src = `Icons/${folder}/${origFile.substring(0, origFile.length - 4)}.PNG`;
        } else {
            img.src = `Icons/${folder}/${cleanName}.PNG`;
        }
    } else if (img.dataset.tryCount == 5) {
        img.dataset.tryCount = 6;
        // Try 6: Capitalized + .PNG
        img.src = `Icons/${folder}/${cleanName}.PNG`;
    } else if (img.dataset.tryCount == 6) {
        img.dataset.tryCount = 7;
        // Try 7: Element prefix + capitalized + .PNG
        img.src = `Icons/${folder}/${element}_${cleanName}.PNG`;
    } else if (img.dataset.tryCount == 7) {
        img.dataset.tryCount = 8;
        // Try 8: Lowercase + .PNG
        img.src = `Icons/${folder}/${cleanNameLower}.PNG`;
    } else if (img.dataset.tryCount == 8) {
        img.dataset.tryCount = 9;
        // Try 9: Element prefix + lowercase + .PNG
        img.src = `Icons/${folder}/${element}_${cleanNameLower}.PNG`;
    } else {
        // Log the final failure for diagnostics
        const originalFailedUrl = img.dataset.originalSrc || img.src;
        if (typeof window.failedImages === 'undefined') {
            window.failedImages = new Set();
        }
        if (!window.failedImages.has(originalFailedUrl)) {
            window.failedImages.add(originalFailedUrl);
            const logContainer = document.getElementById('imageDebugLog2');
            const listContainer = document.getElementById('failedImageList2');
            if (logContainer && listContainer) {
                logContainer.style.display = 'block';
                const filePart = originalFailedUrl.substring(originalFailedUrl.lastIndexOf('/') + 1);
                listContainer.innerHTML += `<li style="color: #ff8a80; list-style-type: disc; margin-bottom: 2px;">Missing file: <span style="font-family: monospace; color:#fff;">${filePart}</span> (tried path: <span style="color:#aaa;">Icons/${folder}/...</span>)</li>`;
            }
        }

        // All failed - replace with text token
        const parent = img.parentNode;
        if (parent) {
            const color = getElementColor(element);
            const isSlot = parent.classList.contains('slot') || parent.parentNode.classList.contains('slot') || parent.classList.contains('action-slot');
            parent.innerHTML = `<div class="token-icon" style="background-color: ${color};">${name.substring(0, 2).toUpperCase()}</div>`;
            if (isSlot && !parent.classList.contains('action-slot')) {
                parent.innerHTML += `<button class="btn-clear-slot" onclick="clearSlot(event, this)">✕</button>`;
            }
        }
    }
}

function updateTimelineHeader(versionNum, smIndex, color, name, iconFile) {
    const timelineContainerId = versionNum === 2 ? 'timelineContainer2' : 'timelineContainer1';
    const headerIcon = document.querySelector(`#${timelineContainerId} [data-sm-col="${smIndex}"]`);
    if (headerIcon) {
        const iconPath = iconFile && iconFile !== 'N/A' ? `Icons/Soulmates/${iconFile}` : '';
        headerIcon.innerHTML = iconPath 
            ? `<img src="${iconPath}" alt="${name}" onerror="handleImageError(this, '${name.replace(/'/g, "\\'")}', '${color}', 'Soulmates')" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">`
            : `<div class="token-icon" style="background-color: ${color};">${name.substring(0, 2).toUpperCase()}</div>`;
    }
}

const actionPopup = document.getElementById('actionPopup');

function openActionMenu(slotElement, colIndex, versionNum) {
    currentActionSlot = slotElement;
    activeVersionNum = versionNum;

    let optionsHTML = '';

    if (colIndex === 'sacred') {
        optionsHTML = '';
        const sacredsMap = selectedSacreds[versionNum];
        Object.keys(sacredsMap).forEach(key => {
            const sac = sacredsMap[key];
            if (sac) {
                optionsHTML += `
                <div class="action-popup-item" onclick="applyActionChoice('${sac.color}', '${sac.name.replace(/'/g, "\\'")}', '${sac.iconFile || ''}', '${sac.element}', 'Sacreds')" title="${sac.name}">
                    <div class="token-icon" style="background-color: ${sac.color};">${sac.name.substring(0, 2).toUpperCase()}</div>
                </div>
            `;
            }
        });
        if (!optionsHTML) {
            optionsHTML = `<div style="padding: 6px 10px; font-size:11px; color:#aaa;">No Sacreds Equipped</div>`;
        }
    } else {
        const loadout = characterLoadouts[versionNum][colIndex];

        if (loadout) {
            optionsHTML = `
            <div class="action-popup-item" onclick="applyActionChoice('#333333', 'B')" title="Basic Attack"><div class="token-icon" style="background-color: #333333;">B</div></div>
            <div class="action-popup-item" onclick="applyActionChoice('${loadout.weapons[0].color}', '${loadout.weapons[0].name.substring(0, 2).toUpperCase()}')" title="${loadout.weapons[0].name}"><div class="token-icon" style="background-color: ${loadout.weapons[0].color};">${loadout.weapons[0].name.substring(0, 2).toUpperCase()}</div></div>
            <div class="action-popup-item" onclick="applyActionChoice('${loadout.weapons[1].color}', '${loadout.weapons[1].name.substring(0, 2).toUpperCase()}')" title="${loadout.weapons[1].name}"><div class="token-icon" style="background-color: ${loadout.weapons[1].color};">${loadout.weapons[1].name.substring(0, 2).toUpperCase()}</div></div>
            <div class="action-popup-item" onclick="applyActionChoice('${loadout.weapons[2].color}', '${loadout.weapons[2].name.substring(0, 2).toUpperCase()}')" title="${loadout.weapons[2].name}"><div class="token-icon" style="background-color: ${loadout.weapons[2].color};">${loadout.weapons[2].name.substring(0, 2).toUpperCase()}</div></div>
            <div class="action-popup-item" onclick="applyActionChoice('${loadout.personal}', 'P')" title="Personal Weapon"><div class="token-icon" style="background-color: ${loadout.personal};">P</div></div>
            <div class="action-popup-item" onclick="applyActionChoice('${loadout.ultimate}', 'U')" title="Ultimate"><div class="token-icon" style="background-color: ${loadout.ultimate};">U</div></div>
        `;
        } else {
            optionsHTML = `<div style="padding: 6px 10px; font-size:11px; color:#aaa;">Assign character first</div>`;
        }
    }

    actionPopup.innerHTML = optionsHTML;

    const rect = slotElement.getBoundingClientRect();
    actionPopup.style.top = `${rect.bottom + window.scrollY + 2}px`;
    actionPopup.style.left = `${rect.left + window.scrollX}px`;
    actionPopup.style.display = 'flex';

    event.stopPropagation();
}

function applyActionChoice(color, label, iconFile, element, folder) {
    if (currentActionSlot) {
        const iconPath = iconFile && iconFile !== 'N/A' ? `Icons/${folder}/${iconFile}` : '';
        currentActionSlot.innerHTML = iconPath 
            ? `<img src="${iconPath}" alt="${label}" onerror="handleImageError(this, '${label.replace(/'/g, "\\'")}', '${element || color}', '${folder}')" style="width:100%; height:100%; object-fit:cover; border-radius:2px;" title="${label}">`
            : `<div class="token-icon" style="background-color: ${color};" title="${label}">${label.substring(0, 2).toUpperCase()}</div>`;
    }
    closeActionMenu();
}

function closeActionMenu() {
    actionPopup.style.display = 'none';
    currentActionSlot = null;
}

window.addEventListener('click', () => {
    closeActionMenu();
});

function addTurnActive() {
    addTurn(activeVersionNum);
}

function addTurn(versionNum) {
    if (versionNum === 1) {
        const grid = document.getElementById('t1GridContainer');
        const turnNum = grid.querySelectorAll('.turn-num').length + 1;

        grid.insertAdjacentHTML('beforeend', `
        <div class="t-cell turn-num">${turnNum}</div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 'sacred', 1)"></div></div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 0, 1)"></div></div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 1, 1)"></div></div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 2, 1)"></div></div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 3, 1)"></div></div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 4, 1)"></div></div>
        <div class="t-cell"><div class="drop-zone"></div></div>
        <div class="t-cell"><div class="drop-zone"></div></div>
        <div class="t-cell"><button class="btn-delete-row" onclick="deleteRow(this)">✕</button></div>
    `);
    } else {
        const grid = document.getElementById('t2GridContainer');
        const turnNum = grid.querySelectorAll('.turn-num').length + 1;

        grid.insertAdjacentHTML('beforeend', `
        <div class="t-cell turn-num">${turnNum}</div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 'sacred', 2)"></div></div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 0, 2)"></div></div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 1, 2)"></div></div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 2, 2)"></div></div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 3, 2)"></div></div>
        <div class="t-cell"><div class="action-slot" onclick="openActionMenu(this, 4, 2)"></div></div>
        <div class="t-cell"><button class="btn-delete-row" onclick="deleteRow(this)">✕</button></div>
    `);
    }
}

function deleteRow(btn) {
    const grid = btn.closest('.t1-grid, .t2-grid');
    const isVersion1 = grid.id === 't1GridContainer';
    const cols = isVersion1 ? 10 : 8;

    const cells = Array.from(grid.children);
    const headerCount = cols;
    const clickedCell = btn.closest('.t-cell');
    const clickedIndex = cells.indexOf(clickedCell);

    if (clickedIndex >= headerCount) {
        const rowIndex = Math.floor((clickedIndex - headerCount) / cols);
        const startIndex = headerCount + (rowIndex * cols);

        for (let i = 0; i < cols; i++) {
            if (grid.children[startIndex]) {
                grid.children[startIndex].remove();
            }
        }
        reindexTurns(grid, cols, headerCount);
    }
}

function reindexTurns(grid, cols, headerCount) {
    const children = grid.children;
    let turnCounter = 1;
    for (let i = headerCount; i < children.length; i += cols) {
        children[i].innerText = turnCounter;
        turnCounter++;
    }
}

function openSaveModal() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const defaultName = `fightplan-${year}-${month}-${day}-${hours}${minutes}`;

    document.getElementById('filenameInput').value = defaultName;
    document.getElementById('saveModal').style.display = 'flex';
    document.getElementById('filenameInput').focus();
}

function closeSaveModal() {
    document.getElementById('saveModal').style.display = 'none';
}

function confirmSavePlan() {
    let filename = document.getElementById('filenameInput').value.trim();
    if (!filename) filename = "fightplan";
    if (!filename.endsWith('.json')) filename += '.json';

    const gridId = activeVersionNum === 2 ? 't2GridContainer' : 't1GridContainer';
    const grid = document.getElementById(gridId);
    const rosterId = activeVersionNum === 2 ? 'rosterCol2' : 'rosterCol1';
    const rosterCol = document.getElementById(rosterId);
    const sacId = activeVersionNum === 2 ? 'sacCol2' : null;
    const sacCol = sacId ? document.getElementById(sacId) : null;

    const planData = {
        version: activeVersionNum,
        timelineHTML: grid.innerHTML,
        rosterHTML: rosterCol.innerHTML,
        sacredHTML: sacCol ? sacCol.innerHTML : null,
        loadouts: characterLoadouts[activeVersionNum],
        sacreds: selectedSacreds[activeVersionNum]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(planData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    closeSaveModal();
}

function loadPlanJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const planData = JSON.parse(e.target.result);

            if (planData.version === 2 && uiToggle.checked) {
                uiToggle.checked = false;
                switchUI();
            } else if (planData.version === 1 && !uiToggle.checked) {
                uiToggle.checked = true;
                switchUI();
            }

            const gridId = planData.version === 2 ? 't2GridContainer' : 't1GridContainer';
            const rosterId = planData.version === 2 ? 'rosterCol2' : 'rosterCol1';
            const sacId = planData.version === 2 ? 'sacCol2' : null;

            document.getElementById(gridId).innerHTML = planData.timelineHTML;
            document.getElementById(rosterId).innerHTML = planData.rosterHTML;
            if (sacId && planData.sacredHTML) {
                document.getElementById(sacId).innerHTML = planData.sacredHTML;
            }

            characterLoadouts[planData.version] = planData.loadouts || {};
            selectedSacreds[planData.version] = planData.sacreds || {};

            alert("Battle plan loaded successfully from file!");
        } catch (err) {
            alert("Invalid JSON battle plan file!");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Handle dragging from teamsheet slots to fight timeline
document.body.addEventListener('dragstart', (e) => {
    const slot = e.target.closest('.slot');
    if (slot && slot.classList.contains('sac-portrait') && slot.dataset.selectedId) {
        let versionNum = 2;
        if (slot.closest('#version1')) versionNum = 1;
        
        const sacCard = slot.closest('.sac-card');
        if (sacCard) {
            const sacIndex = Array.from(sacCard.parentNode.children).indexOf(sacCard);
            const sac = selectedSacreds[versionNum][sacIndex];
            if (sac) {
                const dragData = JSON.stringify({
                    id: sac.id,
                    name: sac.name,
                    color: sac.color,
                    element: sac.element,
                    iconFile: sac.iconFile || '',
                    selectionType: 'sacred'
                });
                e.dataTransfer.setData('text/plain', dragData);
                e.dataTransfer.effectAllowed = 'copy';
            }
        }
    }
});

// Event delegation for drag & drop onto slots
document.body.addEventListener('dragover', (e) => {
    const slot = e.target.closest('.slot') || e.target.closest('.action-slot');
    if (slot) {
        e.preventDefault();
        slot.classList.add('drag-over-active');
    }
});

document.body.addEventListener('dragleave', (e) => {
    const slot = e.target.closest('.slot') || e.target.closest('.action-slot');
    if (slot) {
        slot.classList.remove('drag-over-active');
    }
});

document.body.addEventListener('drop', (e) => {
    const slot = e.target.closest('.slot') || e.target.closest('.action-slot');
    if (slot) {
        e.preventDefault();
        slot.classList.remove('drag-over-active');
        
        try {
            const dragData = e.dataTransfer.getData('text/plain');
            if (!dragData) return;
            const data = JSON.parse(dragData);
            
            // Check if dropping onto a timeline cell (action-slot)
            if (slot.classList.contains('action-slot')) {
                const onClickAttr = slot.getAttribute('onclick') || '';
                const isSacredActionSlot = onClickAttr.includes("'sacred'");
                
                if (isSacredActionSlot && data.selectionType === 'sacred') {
                    const iconPath = data.iconFile && data.iconFile !== 'N/A' ? `Icons/Sacreds/${data.iconFile}` : '';
                    slot.innerHTML = iconPath 
                        ? `<img src="${iconPath}" alt="${data.name}" onerror="handleImageError(this, '${data.name.replace(/'/g, "\\'")}', '${data.element}', 'Sacreds')" style="width:100%; height:100%; object-fit:cover; border-radius:2px;" title="${data.name}">`
                        : `<div class="token-icon" style="background-color: ${data.color};" title="${data.name}">${data.name.substring(0, 2).toUpperCase()}</div>`;
                }
                return;
            }
            
            // Determine slot type
            let slotType = '';
            if (slot.classList.contains('portrait')) slotType = 'soulmate';
            else if (slot.classList.contains('wep-slot')) slotType = 'weapon';
            else if (slot.classList.contains('sac-portrait')) slotType = 'sacred';
            
            // Check version number (1 or 2)
            let versionNum = 2; // default
            if (slot.closest('#version1')) versionNum = 1;
            activeVersionNum = versionNum;
            
            // Match type
            if (data.selectionType === slotType) {
                activeTargetSlot = slot;
                
                // Highlight this slot as the active slot
                document.querySelectorAll('.slot.active-slot').forEach(el => el.classList.remove('active-slot'));
                activeTargetSlot.classList.add('active-slot');
                
                if (slotType === 'soulmate') {
                    selectMockSoulmate(data.id, data.name, data.color, data.element, data.preferredWeapons, data.iconFile);
                } else if (slotType === 'weapon') {
                    selectMockWeapon(data.id, data.name, data.color);
                } else if (slotType === 'sacred') {
                    selectMockSacred(data.id, data.name, data.color, data.element, data.iconFile);
                }
            }
        } catch (err) {
            console.error("Drop error", err);
        }
    }
});

// Background Image Preloader for instant icon display
function preloadAllIcons() {
    console.log("Starting background preloading of icon images...");
    const urlsToPreload = [];

    // 1. Collect Soulmate icon URLs
    if (typeof window.mockSoulmates !== 'undefined') {
        window.mockSoulmates.forEach(char => {
            if (char.iconFile && char.iconFile !== 'N/A') {
                urlsToPreload.push(`Icons/Soulmates/${char.iconFile}`);
            }
        });
    }

    // 2. Collect Sacred icon URLs
    if (typeof window.mockSacreds !== 'undefined') {
        window.mockSacreds.forEach(sac => {
            if (sac.iconFile && sac.iconFile !== 'N/A') {
                urlsToPreload.push(`Icons/Sacreds/${sac.iconFile}`);
            }
        });
    }

    // 3. Preload URLs in the background asynchronously
    let loadedCount = 0;
    const totalCount = urlsToPreload.length;

    urlsToPreload.forEach(url => {
        const img = new Image();
        img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount === totalCount) {
                console.log(`Preloaded all ${totalCount} icons successfully into browser cache.`);
            }
        };
        img.src = url;
    });
}

// Run preloader after window load finishes so it doesn't block main page load
window.addEventListener('load', () => {
    // Delay slightly to give priority to main rendering
    setTimeout(preloadAllIcons, 500);
});
