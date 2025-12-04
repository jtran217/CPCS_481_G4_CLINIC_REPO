// --- Configuration ---
const stateOptions = ["AB", "BC", "ON", "QC"];
const sexOptions = ["Female", "Male", "Other"];

// Map div IDs to validation rule keys
const fieldIdToRuleKey = {
    'profile-fname': 'first-name',
    'profile-lname': 'last-name',
    'profile-email': 'email',
    'profile-phone': 'patient-phone',
    'profile-dob': 'patient-dob',
    'profile-sex': 'patient-sex',
    'profile-health': 'patient-health-number',
    'profile-street': 'street-address',
    'profile-city': 'city',
    'profile-state': 'state',
    'profile-postal': 'postal-code'
};

document.addEventListener('click', function(e) {
    const saveBtnContainer = document.querySelector('.form-footer');
    const saveBtn = document.querySelector('.form-footer .btn-primary');
    
    // --- 1. Handle Edit Pencil Click ---
    const editBtn = e.target.closest('.edit-icon-btn');
    if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        const card = editBtn.closest('.card');
        if (card && !card.classList.contains('is-editing')) {
            if (card.querySelector('#emergency-contacts-view')) {
                enableEmergencyContactEdit(card);
            } else {
                enableEditMode(card);
            }
            activateSaveButton();
        }
    }

    // --- 2. Handle Add Contact Click ---
    const addContactBtn = e.target.closest('.btn-add-contact');
    if (addContactBtn) {
        addEmergencyContactRow();
        activateSaveButton();
    }

    // --- 3. Handle Remove Contact Click ---
    if (e.target.classList.contains('btn-remove')) {
        const row = e.target.closest('.contact-row');
        row.remove();
        activateSaveButton();
    }

    // --- 4. Handle Save Button Click ---
    if (e.target.matches('.form-footer .btn-primary') || e.target.closest('.form-footer .btn-primary')) {
        e.preventDefault();
        e.stopPropagation();
        saveAllChanges();
        return;
    }
    
    // --- 5. Handle input validation on blur ---
    if (e.target.matches('input[data-field], select[data-field]')) {
        const input = e.target;
        const field = input.getAttribute('data-field');
        if (!field) return;
        
        // Emergency contacts use contact-row as container
        const row = input.closest('.contact-row');
        if (row) {
            validateSingleField(row, field, input);
        } else {
            // Regular fields use info-group as container
            const group = input.closest('.info-group');
            if (group) {
                validateSingleField(group, field, input);
            }
        }
    }

    // --- Helper Functions ---

    function enableEditMode(card) {
        card.classList.add('is-editing');
        const valueDivs = card.querySelectorAll('.info-value');

        valueDivs.forEach(div => {
            const currentVal = div.innerText.trim();
            const id = div.id || '';
            const ruleKey = fieldIdToRuleKey[id] || '';
            let inputHtml = '';
            let errorHtml = `<div class="form-error" data-error-for="${ruleKey}"></div>`;

            if (id.includes('dob')) {
                inputHtml = `<input type="date" class="edit-input" data-field="${ruleKey}" value="${currentVal}">`;
            } else if (id.includes('sex')) {
                inputHtml = createSelect(sexOptions, currentVal, ruleKey);
            } else if (id.includes('state')) {
                inputHtml = createSelect(stateOptions, currentVal, ruleKey);
            } else {
                inputHtml = `<input type="text" class="edit-input" data-field="${ruleKey}" value="${currentVal}">`;
            }
            div.innerHTML = inputHtml + errorHtml;
            
            // Add blur validation
            const input = div.querySelector('input, select');
            if (input && ruleKey) {
                input.addEventListener('blur', function() {
                    const group = div.closest('.info-group');
                    validateSingleField(group, ruleKey, this);
                });
            }
        });
    }

    function createSelect(options, selected, ruleKey = '') {
        const opts = options.map(opt => 
            `<option value="${opt}" ${opt.toLowerCase() === selected.toLowerCase() ? 'selected' : ''}>${opt}</option>`
        ).join('');
        return `<select class="edit-input" data-field="${ruleKey}">${opts}</select>`;
    }

    function enableEmergencyContactEdit(card) {
        card.classList.add('is-editing');
        const viewContainer = card.querySelector('#emergency-contacts-view');
        const editContainer = card.querySelector('#emergency-contacts-edit');
        
        // Get existing contacts from view
        const existingContacts = [];
        const contactItems = viewContainer.querySelectorAll('.contact-item');
        contactItems.forEach(item => {
            const infoGroups = item.querySelectorAll('.info-group');
            existingContacts.push({
                name: infoGroups[0]?.querySelector('.info-value')?.textContent?.trim() || '',
                relationship: infoGroups[1]?.querySelector('.info-value')?.textContent?.trim() || '',
                phone: infoGroups[2]?.querySelector('.info-value')?.textContent?.trim() || ''
            });
        });
        
        // Show edit container, hide view
        viewContainer.style.display = 'none';
        editContainer.style.display = 'block';
        editContainer.innerHTML = '';
        
        // Add existing contacts as editable rows
        if (existingContacts.length > 0) {
            existingContacts.forEach(contact => {
                addEmergencyContactRow(contact.name, contact.relationship, contact.phone);
            });
        }
        
        // Add "Add Contact" button if not exists
        if (!editContainer.querySelector('.btn-add-contact')) {
            const addBtn = document.createElement('button');
            addBtn.className = 'btn-small-outline btn-add-contact';
            addBtn.innerHTML = '<span class="icon-plus"></span>+ Add Contact';
            editContainer.appendChild(addBtn);
        }
    }
    
    function addEmergencyContactRow(name = '', relationship = '', phone = '') {
        const editContainer = document.querySelector('#emergency-contacts-edit');
        if (!editContainer) return;
        
        // Get unique index based on timestamp to avoid conflicts
        const rowIndex = Date.now() + Math.random();
        const rowId = `contact-row-${rowIndex}`;
        
        const row = document.createElement('div');
        row.className = 'contact-row';
        row.setAttribute('data-row-id', rowId);
        row.innerHTML = `
            <div class="contact-field-group">
                <label>Contact Name</label>
                <input type="text" class="edit-input" data-field="emergency-contact-name" placeholder="Name" value="${name}">
                <div class="form-error" data-error-for="emergency-contact-name"></div>
            </div>
            <div class="contact-field-group">
                <label>Relationship</label>
                <input type="text" class="edit-input" data-field="emergency-contact-relationship" placeholder="Relationship" value="${relationship}">
                <div class="form-error" data-error-for="emergency-contact-relationship"></div>
            </div>
            <div class="contact-field-group">
                <label>Phone</label>
                <input type="text" class="edit-input" data-field="emergency-contact-phone" placeholder="(555) 555-5555" value="${phone}">
                <div class="form-error" data-error-for="emergency-contact-phone"></div>
            </div>
            <button class="btn-remove">Remove</button>
        `;
        
        // Insert before the "Add Contact" button
        const addBtn = editContainer.querySelector('.btn-add-contact');
        if (addBtn) {
            editContainer.insertBefore(row, addBtn);
        } else {
            editContainer.appendChild(row);
        }
        
        // Add blur event listeners for real-time validation
        const inputs = row.querySelectorAll('input[data-field]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                const field = this.getAttribute('data-field');
                validateSingleField(row, field, this);
            });
        });
    }
    
    async function validateSingleField(container, field, input) {
        const rules = await loadValidationRules();
        const value = input.type === 'select-one' ? input.value : input.value.trim() || '';
        const errorEl = container.querySelector(`div[data-error-for="${field}"]`);
        
        // Use field directly as rule key (it's already mapped correctly)
        const rule = rules[field];
        if (!rule) return true;
        
        // Clear previous error
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }
        input.classList.remove('error');
        
        // Required validation
        if (rule.required && !value) {
            if (errorEl) {
                errorEl.textContent = rule.errorMessage;
                errorEl.classList.add('visible');
            }
            input.classList.add('error');
            return false;
        }
        
        // Skip other validations if empty and not required
        if (!value) {
            return true;
        }
        
        // Min length validation
        if (rule.minLength) {
            let checkValue = value;
            if (field === 'patient-phone' || field === 'emergency-contact-phone') {
                checkValue = value.replace(/[\s\-()]/g, '');
            }
            if (checkValue.length < rule.minLength) {
                if (errorEl) {
                    errorEl.textContent = rule.lengthMessage || `Must be at least ${rule.minLength} characters`;
                    errorEl.classList.add('visible');
                }
                input.classList.add('error');
                return false;
            }
        }
        
        // Pattern validation
        if (rule.pattern) {
            const reg = new RegExp(rule.pattern);
            if (!reg.test(value)) {
                if (errorEl) {
                    errorEl.textContent = rule.patternMessage;
                    errorEl.classList.add('visible');
                }
                input.classList.add('error');
                return false;
            }
        }
        
        return true;
    }

    function activateSaveButton() {
        if(saveBtnContainer) {
            saveBtnContainer.classList.add('active');
            saveBtn.classList.remove('disabled-look');
            saveBtn.classList.add('active-state');
            saveBtn.innerText = "Save Changes";
        }
    }

    async function saveAllChanges() {
        const editingCards = document.querySelectorAll('.card.is-editing');
        let allValid = true;
        
        // Validate ALL fields in ALL editing cards
        for (const card of editingCards) {
            // Handle emergency contacts
            if (card.querySelector('#emergency-contacts-edit')) {
                const isValid = await validateEmergencyContacts();
                if (!isValid) {
                    allValid = false;
                }
            } else {
                // Validate regular info sections
                const inputs = card.querySelectorAll('.info-value input[data-field], .info-value select[data-field]');
                for (const input of inputs) {
                    const field = input.getAttribute('data-field');
                    if (!field) continue;
                    
                    const group = input.closest('.info-group');
                    if (group) {
                        const valid = await validateSingleField(group, field, input);
                        if (!valid) {
                            allValid = false;
                        }
                    }
                }
            }
        }
        
        // If validation failed, don't save anything
        if (!allValid) {
            return; // Don't save if validation failed
        }
        
        // If validation passed, save all changes
        for (const card of editingCards) {
            // Handle emergency contacts
            if (card.querySelector('#emergency-contacts-edit')) {
                saveEmergencyContacts(card);
            } else {
                // Handle regular info sections
                const inputs = card.querySelectorAll('.info-value input, .info-value select');
                inputs.forEach(input => {
                    const newVal = input.value;
                    const parentDiv = input.closest('.info-value');
                    // Remove error message div before saving
                    const errorDiv = parentDiv.querySelector('.form-error');
                    if (errorDiv) errorDiv.remove();
                    parentDiv.innerHTML = newVal;
                });
            }
            card.classList.remove('is-editing');
        }

        if(saveBtnContainer) {
            saveBtnContainer.classList.remove('active');
            saveBtn.classList.add('disabled-look');
        }
    }
    
    async function validateEmergencyContacts() {
        const rules = await loadValidationRules();
        const editContainer = document.querySelector('#emergency-contacts-edit');
        if (!editContainer || editContainer.style.display === 'none') {
            return true; // Not in edit mode
        }
        
        const contactRows = editContainer.querySelectorAll('.contact-row');
        if (contactRows.length === 0) {
            return true; // No contacts to validate
        }
        
        let isValid = true;
        
        contactRows.forEach((row) => {
            const nameInput = row.querySelector('input[data-field="emergency-contact-name"]');
            const relationshipInput = row.querySelector('input[data-field="emergency-contact-relationship"]');
            const phoneInput = row.querySelector('input[data-field="emergency-contact-phone"]');
            
            // Validate name
            const nameRule = rules['emergency-contact-name'];
            if (nameRule && nameInput) {
                const nameValue = nameInput.value.trim() || '';
                const nameErrorEl = row.querySelector('div[data-error-for="emergency-contact-name"]');
                
                // Clear previous errors
                if (nameErrorEl) {
                    nameErrorEl.textContent = '';
                    nameErrorEl.classList.remove('visible');
                }
                nameInput.classList.remove('error');
                
                if (nameRule.required && !nameValue) {
                    if (nameErrorEl) {
                        nameErrorEl.textContent = nameRule.errorMessage;
                        nameErrorEl.classList.add('visible');
                    }
                    nameInput.classList.add('error');
                    isValid = false;
                } else if (nameValue) {
                    if (nameRule.minLength && nameValue.length < nameRule.minLength) {
                        if (nameErrorEl) {
                            nameErrorEl.textContent = nameRule.lengthMessage || `Must be at least ${nameRule.minLength} characters`;
                            nameErrorEl.classList.add('visible');
                        }
                        nameInput.classList.add('error');
                        isValid = false;
                    } else if (nameRule.pattern) {
                        const reg = new RegExp(nameRule.pattern);
                        if (!reg.test(nameValue)) {
                            if (nameErrorEl) {
                                nameErrorEl.textContent = nameRule.patternMessage;
                                nameErrorEl.classList.add('visible');
                            }
                            nameInput.classList.add('error');
                            isValid = false;
                        } else {
                            if (nameErrorEl) {
                                nameErrorEl.textContent = '';
                                nameErrorEl.classList.remove('visible');
                            }
                            nameInput.classList.remove('error');
                        }
                    } else {
                        if (nameErrorEl) {
                            nameErrorEl.textContent = '';
                            nameErrorEl.classList.remove('visible');
                        }
                        nameInput.classList.remove('error');
                    }
                } else {
                    if (nameErrorEl) {
                        nameErrorEl.textContent = '';
                        nameErrorEl.classList.remove('visible');
                    }
                    nameInput.classList.remove('error');
                }
            }
            
            // Validate relationship
            const relationshipRule = rules['emergency-contact-relationship'];
            if (relationshipRule && relationshipInput) {
                const relationshipValue = relationshipInput.value.trim() || '';
                const relationshipErrorEl = row.querySelector('div[data-error-for="emergency-contact-relationship"]');
                
                // Clear previous errors
                if (relationshipErrorEl) {
                    relationshipErrorEl.textContent = '';
                    relationshipErrorEl.classList.remove('visible');
                }
                relationshipInput.classList.remove('error');
                
                if (relationshipRule.required && !relationshipValue) {
                    if (relationshipErrorEl) {
                        relationshipErrorEl.textContent = relationshipRule.errorMessage;
                        relationshipErrorEl.classList.add('visible');
                    }
                    relationshipInput.classList.add('error');
                    isValid = false;
                }
            }
            
            // Validate phone
            const phoneRule = rules['emergency-contact-phone'];
            if (phoneRule && phoneInput) {
                const phoneValue = phoneInput.value.trim() || '';
                const phoneErrorEl = row.querySelector('div[data-error-for="emergency-contact-phone"]');
                
                // Clear previous errors
                if (phoneErrorEl) {
                    phoneErrorEl.textContent = '';
                    phoneErrorEl.classList.remove('visible');
                }
                phoneInput.classList.remove('error');
                
                if (phoneRule.required && !phoneValue) {
                    if (phoneErrorEl) {
                        phoneErrorEl.textContent = phoneRule.errorMessage;
                        phoneErrorEl.classList.add('visible');
                    }
                    phoneInput.classList.add('error');
                    isValid = false;
                } else if (phoneValue) {
                    // Check min length (remove formatting for length check)
                    const cleanPhone = phoneValue.replace(/[\s\-()]/g, '');
                    if (phoneRule.minLength && cleanPhone.length < phoneRule.minLength) {
                        if (phoneErrorEl) {
                            phoneErrorEl.textContent = phoneRule.lengthMessage;
                            phoneErrorEl.classList.add('visible');
                        }
                        phoneInput.classList.add('error');
                        isValid = false;
                    } else if (phoneRule.pattern) {
                        const reg = new RegExp(phoneRule.pattern);
                        if (!reg.test(phoneValue)) {
                            if (phoneErrorEl) {
                                phoneErrorEl.textContent = phoneRule.patternMessage;
                                phoneErrorEl.classList.add('visible');
                            }
                            phoneInput.classList.add('error');
                            isValid = false;
                        } else {
                            if (phoneErrorEl) {
                                phoneErrorEl.textContent = '';
                                phoneErrorEl.classList.remove('visible');
                            }
                            phoneInput.classList.remove('error');
                        }
                    } else {
                        if (phoneErrorEl) {
                            phoneErrorEl.textContent = '';
                            phoneErrorEl.classList.remove('visible');
                        }
                        phoneInput.classList.remove('error');
                    }
                } else {
                    if (phoneErrorEl) {
                        phoneErrorEl.textContent = '';
                        phoneErrorEl.classList.remove('visible');
                    }
                    phoneInput.classList.remove('error');
                }
            }
        });
        
        return isValid;
    }
    
    function saveEmergencyContacts(card) {
        const viewContainer = card.querySelector('#emergency-contacts-view');
        const editContainer = card.querySelector('#emergency-contacts-edit');
        const contactRows = editContainer.querySelectorAll('.contact-row');
        
        viewContainer.innerHTML = '';
        viewContainer.style.display = 'block';
        editContainer.style.display = 'none';
        
        if (contactRows.length === 0) {
            viewContainer.innerHTML = '<div class="empty-state-text">No contacts added</div>';
            return;
        }
        
        contactRows.forEach(row => {
            const nameInput = row.querySelector('input[data-field="emergency-contact-name"]');
            const relationshipInput = row.querySelector('input[data-field="emergency-contact-relationship"]');
            const phoneInput = row.querySelector('input[data-field="emergency-contact-phone"]');
            const name = nameInput?.value || '';
            const relationship = relationshipInput?.value || '';
            const phone = phoneInput?.value || '';
            
            if (name || relationship || phone) {
                const contactItem = document.createElement('div');
                contactItem.className = 'contact-item';
                contactItem.innerHTML = `
                    <div class="info-grid">
                        <div class="info-group">
                            <label>Name</label>
                            <div class="info-value">${name || '—'}</div>
                        </div>
                        <div class="info-group">
                            <label>Relationship</label>
                            <div class="info-value">${relationship || '—'}</div>
                        </div>
                        <div class="info-group">
                            <label>Phone Number</label>
                            <div class="info-value">${phone || '—'}</div>
                        </div>
                    </div>
                `;
                viewContainer.appendChild(contactItem);
            }
        });
        
        if (viewContainer.children.length === 0) {
            viewContainer.innerHTML = '<div class="empty-state-text">No contacts added</div>';
        }
    }
});