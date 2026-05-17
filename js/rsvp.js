const rsvpForm = document.getElementById('rsvp-form');
const guestCodeInput = document.getElementById('guest-code');
const rsvpResult = document.getElementById('rsvp-result');

let currentCode = '';
let currentMaxCompanions = 0;

const normalizeCode = value => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);

guestCodeInput.addEventListener('input', () => {
    guestCodeInput.value = normalizeCode(guestCodeInput.value);
});

const setStatus = (message, type = 'info') => {
    const status = document.getElementById('status-message');
    const color = type === 'error' ? '#b22222' : '#333';
    const html = `<div class="text-placeholder" style="color: ${color};">${message}</div>`;

    if (status) {
        status.innerHTML = html;
    } else {
        rsvpResult.innerHTML = html;
    }
};

const createGuestCard = index => {
    const card = document.createElement('div');
    card.className = 'guest-card content-placeholder';
    card.dataset.index = index;
    card.innerHTML = `
        <div class="form-row">
            <label for="guest-full-name-${index}">Nome completo do convidado ${index + 1}</label>
            <input id="guest-full-name-${index}" class="guest-full-name" type="text" placeholder="Nome completo" required>
        </div>
        <div class="form-row">
            <label for="guest-is-child-${index}">É criança?</label>
            <select id="guest-is-child-${index}" class="guest-is-child">
                <option value="false">Não</option>
                <option value="true">Sim</option>
            </select>
        </div>
        <div class="form-row guest-age-row hidden">
            <label for="guest-age-${index}">Idade</label>
            <input id="guest-age-${index}" class="guest-age" type="number" min="0" placeholder="Idade" />
        </div>
        <div class="form-row">
            <button type="button" class="button-secondary remove-guest-button">Remover convidado</button>
        </div>
    `;

    const childSelect = card.querySelector('.guest-is-child');
    const ageRow = card.querySelector('.guest-age-row');
    const ageInput = card.querySelector('.guest-age');
    const removeButton = card.querySelector('.remove-guest-button');

    childSelect.addEventListener('change', () => {
        const isChild = childSelect.value === 'true';
        if (isChild) {
            ageRow.classList.remove('hidden');
        } else {
            ageRow.classList.add('hidden');
            ageInput.value = '';
        }
    });

    removeButton.addEventListener('click', () => {
        card.remove();
        updateAddGuestButton();
        const guestCards = document.querySelectorAll('.guest-card');
        guestCards.forEach((currentCard, currentIndex) => {
            currentCard.dataset.index = currentIndex;
            const nameInput = currentCard.querySelector('.guest-full-name');
            const nameLabel = currentCard.querySelector(`label[for^="guest-full-name-"]`);
            const isChildSelect = currentCard.querySelector('.guest-is-child');
            const ageInputCurrent = currentCard.querySelector('.guest-age');
            const ageLabel = currentCard.querySelector(`label[for^="guest-age-"]`);

            if (nameInput && nameLabel) {
                nameInput.id = `guest-full-name-${currentIndex}`;
                nameLabel.htmlFor = `guest-full-name-${currentIndex}`;
                nameLabel.textContent = `Nome completo do convidado ${currentIndex + 1}`;
            }
            if (isChildSelect) {
                isChildSelect.id = `guest-is-child-${currentIndex}`;
            }
            if (ageInputCurrent && ageLabel) {
                ageInputCurrent.id = `guest-age-${currentIndex}`;
                ageLabel.htmlFor = `guest-age-${currentIndex}`;
            }
        });
    });

    return card;
};

const updateAddGuestButton = () => {
    const addButton = document.getElementById('add-guest-button');
    const guests = document.querySelectorAll('.guest-card');
    if (!addButton) return;

    if (guests.length >= currentMaxCompanions || currentMaxCompanions === 0) {
        addButton.disabled = true;
        addButton.textContent = 'Limite atingido';
    } else {
        addButton.disabled = false;
        addButton.textContent = '+ Adicionar convidado';
    }
};

const getGuestEntries = () => {
    const guestCards = Array.from(document.querySelectorAll('.guest-card'));
    return guestCards.map(card => {
        const nameInput = card.querySelector('.guest-full-name');
        const childSelect = card.querySelector('.guest-is-child');
        const ageInput = card.querySelector('.guest-age');

        return {
            full_name: nameInput.value.trim(),
            is_child: childSelect.value === 'true',
            age: ageInput.value ? Number(ageInput.value) : null
        };
    });
};

const renderConfirmationForm = (code, firstName, maxCompanions) => {
    currentCode = code;
    currentMaxCompanions = Number(maxCompanions) || 0;

    const companionText = currentMaxCompanions > 0
        ? `Você pode levar até ${currentMaxCompanions} convidados com você. Clique no botão de + para adicionar.`
        : 'Você não pode adicionar acompanhantes extras.';

    rsvpResult.innerHTML = `
        <div class="rsvp-form-wrapper">
            <div class="text-placeholder">
                <p>Olá, <strong>${firstName}</strong>! Preencha seu nome completo para confirmar sua presença.</p>
            </div>
            <form id="confirm-form">
                <div class="form-row">
                    <label for="principal-name">Seu nome completo</label>
                    <input id="principal-name" type="text" placeholder="Nome completo" required>
                </div>
                <div class="text-placeholder">
                    <p>${companionText}</p>
                </div>
                <div class="form-row">
                    <button type="button" class="button-secondary" id="add-guest-button">+ Adicionar convidado</button>
                </div>
                <div id="guest-list"></div>
                <div class="form-row" style="margin-top: 10px;">
                    <button type="submit" class="button-primary">Confirmar</button>
                </div>
                <div id="status-message" class="rsvp-result"></div>
            </form>
            <div id="confirm-modal" class="modal-overlay hidden">
                <div class="modal-content">
                    <p id="confirm-modal-text"></p>
                    <div class="rsvp-buttons">
                        <button type="button" class="button-primary" id="confirm-modal-confirm">Confirmar</button>
                        <button type="button" class="button-secondary" id="confirm-modal-cancel">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const addButton = document.getElementById('add-guest-button');
    const guestList = document.getElementById('guest-list');

    addButton.addEventListener('click', () => {
        const currentGuests = guestList.querySelectorAll('.guest-card').length;
        if (currentGuests < currentMaxCompanions) {
            const card = createGuestCard(currentGuests);
            guestList.appendChild(card);
            updateAddGuestButton();
        }
    });

    updateAddGuestButton();

    const confirmForm = document.getElementById('confirm-form');
    confirmForm.addEventListener('submit', async event => {
        event.preventDefault();
        await submitConfirmation(true);
    });
};

const showConfirmModal = (message, onConfirm) => {
    const modal = document.getElementById('confirm-modal');
    const modalText = document.getElementById('confirm-modal-text');
    const confirmBtn = document.getElementById('confirm-modal-confirm');
    const cancelBtn = document.getElementById('confirm-modal-cancel');
    if (!modal || !modalText || !confirmBtn || !cancelBtn) return;

    modalText.textContent = message;
    modal.classList.remove('hidden');

    const cleanup = () => {
        modal.classList.add('hidden');
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
    };

    confirmBtn.onclick = async () => {
        cleanup();
        await onConfirm();
    };

    cancelBtn.onclick = () => {
        cleanup();
        setStatus('Envio cancelado. Revise seus dados antes de enviar.', 'info');
    };
};

const submitConfirmation = async (attending) => {
    const payload = {
        code: currentCode,
        attending,
        guests: []
    };

    if (attending) {
        const principalName = document.getElementById('principal-name').value.trim();
        if (!principalName) {
            setStatus('Por favor, preencha seu nome completo.', 'error');
            return;
        }

        payload.guests.push({
            full_name: principalName,
            is_child: false
        });

        const guestEntries = getGuestEntries();
        for (let i = 0; i < guestEntries.length; i++) {
            const guest = guestEntries[i];
            if (!guest.full_name) {
                setStatus('Preencha o nome completo de todos os convidados adicionados.', 'error');
                return;
            }
            if (guest.is_child && (guest.age === null || Number.isNaN(guest.age))) {
                setStatus('Informe a idade para todas as crianças adicionadas.', 'error');
                return;
            }

            const guestPayload = {
                full_name: guest.full_name,
                is_child: guest.is_child
            };

            if (guest.is_child) {
                guestPayload.age = guest.age;
            }

            payload.guests.push(guestPayload);
        }
    }

    const confirmMessage = attending
        ? 'Você está prestes a enviar sua confirmação. Deseja confirmar o envio?'
        : 'Você está prestes a enviar uma resposta negativa. Deseja confirmar o envio?';

    showConfirmModal(confirmMessage, async () => {
        setStatus('Enviando confirmação...');

        try {
            const response = await fetch('https://rsvp-api-nine.vercel.app/api/confirmations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                setStatus('Não foi possível enviar a confirmação. Tente novamente mais tarde.', 'error');
                return;
            }

            const successText = attending
                ? 'Obrigada! Sua presença foi confirmada com sucesso.'
                : 'Obrigado por avisar. Sua resposta foi registrada.';

            setStatus(successText, 'success');
            const form = document.getElementById('confirm-form');
            if (form) {
                form.querySelectorAll('button').forEach(button => button.disabled = true);
                form.querySelectorAll('input').forEach(input => input.disabled = true);
                form.querySelectorAll('select').forEach(select => select.disabled = true);
            }
        } catch (error) {
            setStatus('Falha na conexão. Verifique sua internet e tente novamente.', 'error');
            console.error(error);
        }
    });
};

const showAttendanceOptions = (code, firstName, maxCompanions) => {
    currentCode = code;
    currentMaxCompanions = Number(maxCompanions) || 0;

    rsvpResult.innerHTML = `
        <div class="rsvp-form-wrapper">
            <div class="text-placeholder">
                <p>Olá, <strong>${firstName}</strong>!</p>
                <p>Você irá participar do nosso casamento?</p>
            </div>
            <div class="rsvp-buttons">
                <button class="button-primary" type="button" data-answer="yes">Sim</button>
                <button class="button-secondary" type="button" data-answer="no">Não</button>
            </div>
            <div id="status-message" class="rsvp-result"></div>
            <div id="confirm-modal" class="modal-overlay hidden">
                <div class="modal-content">
                    <p id="confirm-modal-text"></p>
                    <div class="rsvp-buttons">
                        <button type="button" class="button-primary" id="confirm-modal-confirm">Confirmar</button>
                        <button type="button" class="button-secondary" id="confirm-modal-cancel">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const buttons = rsvpResult.querySelectorAll('[data-answer]');
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const answer = button.getAttribute('data-answer');
            if (answer === 'yes') {
                renderConfirmationForm(code, firstName, maxCompanions);
            } else {
                await submitConfirmation(false);
            }
        });
    });
};

rsvpForm.addEventListener('submit', async event => {
    event.preventDefault();
    const code = normalizeCode(guestCodeInput.value);

    if (code.length !== 4) {
        setStatus('Por favor, insira um código alfanumérico de 4 caracteres.', 'error');
        return;
    }

    setStatus('Consultando o código, aguarde...');

    try {
        const response = await fetch(`https://rsvp-api-nine.vercel.app/api/codes/${encodeURIComponent(code)}`);

        if (!response.ok) {
            if (response.status === 404) {
                setStatus('Código não encontrado. Verifique se o código está correto.', 'error');
            } else {
                setStatus('Ocorreu um erro ao consultar o código. Tente novamente em alguns instantes.', 'error');
            }
            return;
        }

        const data = await response.json();
        if (data) {
            if(data.confirmed) {
                setStatus('Sua presença já foi confirmada. Se deseja alterar sua confirmação, por favor entre em contato conosco.', 'info');
                return;
            }
            if(data.expiration_date && new Date(data.expiration_date) < new Date()) {
                setStatus('Este código expirou e não pode mais ser utilizado.', 'error');
                return;
            }
            if (data.first_name)
                showAttendanceOptions(code, data.first_name, data.max_companions);
        } else {
            setStatus('Não foi possível identificar o convidado. Verifique o código e tente novamente.', 'error');
        }
    } catch (error) {
        setStatus('Falha na conexão. Verifique sua internet e tente novamente.', 'error');
        console.error(error);
    }
});
