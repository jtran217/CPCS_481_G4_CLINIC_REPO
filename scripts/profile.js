document.addEventListener('click', function(e) {
    // --- Configuration ---
    const stateOptions = ["AB", "BC", "ON", "QC"];
    const sexOptions = ["Female", "Male", "Other"];
    const saveBtnContainer = document.querySelector('.form-footer');
    const saveBtn = document.querySelector('.form-footer .btn-primary');
    
    // --- 1. Handle Edit Pencil Click ---
    const editBtn = e.target.closest('.edit-icon-btn');
    if (editBtn) {
        const card = editBtn.closest('.card');
        if (!card.classList.contains('is-editing')) {
            enableEditMode(card);
            activateSaveButton();
        }
    }

    // --- 2. Handle Add Contact Click ---
    const addContactBtn = e.target.closest('.btn-small-outline');
    if (addContactBtn && e.target.closest('.profile-section-card')) {
        addEmergencyContactRow();
        activateSaveButton();
    }

    // --- 3. Handle Remove Contact Click ---
    if (e.target.classList.contains('btn-remove')) {
        const row = e.target.closest('.contact-row');
        row.remove();
        // Check if empty
        const container = document.querySelector('.profile-section-card:nth-of-type(4)');
        if (!container.querySelector('.contact-row')) {
            const emptyText = container.querySelector('.empty-state-text');
            if (emptyText) emptyText.style.display = 'block';
        }
        activateSaveButton();
    }

    // --- 4. Handle Save Button Click ---
    if (e.target.matches('.form-footer .btn-primary')) {
        saveAllChanges();
    }

    // --- Helper Functions ---

    function enableEditMode(card) {
        card.classList.add('is-editing');
        const valueDivs = card.querySelectorAll('.info-value');

        valueDivs.forEach(div => {
            const currentVal = div.innerText.trim();
            const id = div.id || '';
            let inputHtml = '';

            if (id.includes('dob')) {
                inputHtml = `<input type="date" class="edit-input" value="${currentVal}">`;
            } else if (id.includes('sex')) {
                inputHtml = createSelect(sexOptions, currentVal);
            } else if (id.includes('state')) {
                inputHtml = createSelect(stateOptions, currentVal);
            } else {
                inputHtml = `<input type="text" class="edit-input" value="${currentVal}">`;
            }
            div.innerHTML = inputHtml;
        });
    }

    function createSelect(options, selected) {
        const opts = options.map(opt => 
            `<option value="${opt}" ${opt.toLowerCase() === selected.toLowerCase() ? 'selected' : ''}>${opt}</option>`
        ).join('');
        return `<select class="edit-input">${opts}</select>`;
    }

    function addEmergencyContactRow() {
        const container = document.querySelector('.profile-section-card:nth-of-type(4)');
        const emptyState = container.querySelector('.empty-state-text');
        if (emptyState) emptyState.style.display = 'none';

        const row = document.createElement('div');
        row.className = 'contact-row';
        row.innerHTML = `
            <div class="contact-field-group">
                <label>Contact Name</label>
                <input type="text" class="edit-input" placeholder="Name">
            </div>
            <div class="contact-field-group">
                <label>Relationship</label>
                <input type="text" class="edit-input" placeholder="Relationship">
            </div>
            <div class="contact-field-group">
                <label>Phone</label>
                <input type="text" class="edit-input" placeholder="(555) 555-5555">
            </div>
            <button class="btn-remove">Remove</button>
        `;
        container.appendChild(row);
    }

    function activateSaveButton() {
        if(saveBtnContainer) {
            saveBtnContainer.classList.add('active');
            saveBtn.classList.remove('disabled-look');
            saveBtn.classList.add('active-state');
            saveBtn.innerText = "Save Changes";
        }
    }

    function saveAllChanges() {
        const editingCards = document.querySelectorAll('.card.is-editing');
        editingCards.forEach(card => {
            const inputs = card.querySelectorAll('.info-value input, .info-value select');
            inputs.forEach(input => {
                const newVal = input.value;
                const parentDiv = input.closest('.info-value');
                parentDiv.innerHTML = newVal;
            });
            card.classList.remove('is-editing');
        });

        if(saveBtnContainer) {
            saveBtnContainer.classList.remove('active');
            saveBtn.classList.add('disabled-look');
        }
    }
});