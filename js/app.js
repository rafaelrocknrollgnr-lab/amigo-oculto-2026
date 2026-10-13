/**
 * Controlador Principal da Aplicação Amigo Oculto de Natal 2026
 */
document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // ESTADO DA APLICAÇÃO
  // ============================================================
  let appData = StorageManager.loadData();
  let currentParticipantName = null;
  let activeUrlDraw = null; // Quando aberto via link compartilhado do WhatsApp
  let pendingResetType = null; // 'drawOnly' ou 'everything'

  // ============================================================
  // ELEMENTOS DO DOM
  // ============================================================
  // Vistas
  const participantView = document.getElementById('participantView');
  const adminView = document.getElementById('adminView');

  // Navegação
  const adminToggleBtn = document.getElementById('adminToggleBtn');
  const exitAdminBtn = document.getElementById('exitAdminBtn');
  const goToAdminBtn = document.getElementById('goToAdminBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');

  // Estados do Participante
  const noDrawActiveState = document.getElementById('noDrawActiveState');
  const selectionState = document.getElementById('selectionState');
  const drawingAnimationState = document.getElementById('drawingAnimationState');
  const revealedState = document.getElementById('revealedState');

  // Controles do Participante
  const participantSelect = document.getElementById('participantSelect');
  const drawActionBtn = document.getElementById('drawActionBtn');
  const giftBox = document.getElementById('giftBox');
  const namesTicker = document.getElementById('namesTicker');
  const countdownProgress = document.getElementById('countdownProgress');
  const revealedUserName = document.getElementById('revealedUserName');
  const revealedFriendName = document.getElementById('revealedFriendName');
  const togglePrivacyBtn = document.getElementById('togglePrivacyBtn');
  const privacyCurtain = document.getElementById('privacyCurtain');
  const showSecretBtn = document.getElementById('showSecretBtn');

  // Modais
  const adminLoginModal = document.getElementById('adminLoginModal');
  const loginAdminPinInput = document.getElementById('loginAdminPinInput');
  const submitAdminLoginBtn = document.getElementById('submitAdminLoginBtn');
  const closeAdminLoginModal = document.getElementById('closeAdminLoginModal');
  const adminLoginError = document.getElementById('adminLoginError');

  const confirmIdentityModal = document.getElementById('confirmIdentityModal');
  const modalConfirmName = document.getElementById('modalConfirmName');
  const confirmIdentityBtn = document.getElementById('confirmIdentityBtn');
  const cancelIdentityBtn = document.getElementById('cancelIdentityBtn');

  const resetConfirmModal = document.getElementById('resetConfirmModal');
  const resetModalTitle = document.getElementById('resetModalTitle');
  const resetModalMessage = document.getElementById('resetModalMessage');
  const confirmResetActionBtn = document.getElementById('confirmResetActionBtn');
  const cancelResetModalBtn = document.getElementById('cancelResetModalBtn');

  // Abas do Admin
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Admin: Status & Compartilhamento
  const adminDrawStatusBadge = document.getElementById('adminDrawStatusBadge');
  const adminTotalParticipants = document.getElementById('adminTotalParticipants');
  const adminTotalExclusions = document.getElementById('adminTotalExclusions');
  const adminShareSection = document.getElementById('adminShareSection');
  const shareLinkInput = document.getElementById('shareLinkInput');
  const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
  const whatsappShareBtn = document.getElementById('whatsappShareBtn');

  // Admin: Participantes
  const newParticipantInput = document.getElementById('newParticipantInput');
  const addParticipantBtn = document.getElementById('addParticipantBtn');
  const participantsList = document.getElementById('participantsList');
  const participantCount = document.getElementById('participantCount');
  const bulkAddToggleBtn = document.getElementById('bulkAddToggleBtn');
  const singleAddForm = document.getElementById('singleAddForm');
  const bulkAddForm = document.getElementById('bulkAddForm');
  const bulkParticipantsTextarea = document.getElementById('bulkParticipantsTextarea');
  const confirmBulkAddBtn = document.getElementById('confirmBulkAddBtn');
  const cancelBulkAddBtn = document.getElementById('cancelBulkAddBtn');

  // Admin: Exclusões
  const exclusionSubjectSelect = document.getElementById('exclusionSubjectSelect');
  const exclusionTargetSelect = document.getElementById('exclusionTargetSelect');
  const reciprocalExclusionCheck = document.getElementById('reciprocalExclusionCheck');
  const addExclusionRuleBtn = document.getElementById('addExclusionRuleBtn');
  const exclusionsListContainer = document.getElementById('exclusionsListContainer');
  const clearAllExclusionsBtn = document.getElementById('clearAllExclusionsBtn');

  // Admin: Sorteio
  const executeDrawBtn = document.getElementById('executeDrawBtn');
  const checkParticipants = document.getElementById('checkParticipants');
  const checkSolvable = document.getElementById('checkSolvable');
  const adminSpoilerSection = document.getElementById('adminSpoilerSection');
  const toggleSpoilerBtn = document.getElementById('toggleSpoilerBtn');
  const spoilerContent = document.getElementById('spoilerContent');
  const spoilerTableBody = document.getElementById('spoilerTableBody');

  // Admin: Configurações & Reset
  const adminPinInput = document.getElementById('adminPinInput');
  const saveAdminPinBtn = document.getElementById('saveAdminPinBtn');
  const btnRedrawOnly = document.getElementById('btnRedrawOnly');
  const btnDeleteEverything = document.getElementById('btnDeleteEverything');

  // Toasts
  const toastContainer = document.getElementById('toastContainer');

  // ============================================================
  // FUNÇÕES DE UTILIDADE E TOAST
  // ============================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check text-green';
    if (type === 'error') icon = 'fa-circle-xmark text-red';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  function updateSoundIcon() {
    const isMuted = window.christmasAudio.isMuted;
    soundToggleBtn.innerHTML = isMuted
      ? '<i class="fa-solid fa-volume-xmark text-red"></i>'
      : '<i class="fa-solid fa-volume-high text-gold"></i>';
  }

  // ============================================================
  // PARSER DE URL (QUANDO CLICADO VIA WHATSAPP)
  // ============================================================
  function checkUrlParameters() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const drawDataParam = params.get('draw');
    const participantParam = params.get('p');

    if (drawDataParam) {
      const decoded = StorageManager.decodeDrawFromUrl(drawDataParam);
      if (decoded && decoded.participants && decoded.encryptedDraw) {
        activeUrlDraw = decoded;
        
        // Se a base local estiver vazia ou com sorteio diferente, salva uma cópia dos participantes
        if (!appData.draw) {
          appData.participants = decoded.participants;
          appData.title = decoded.title;
        }

        // Se veio um participante específico no link (ex: #draw=...&p=Rafael)
        if (participantParam) {
          currentParticipantName = decodeURIComponent(participantParam);
        }
      }
    }
  }

  // ============================================================
  // RENDERIZAÇÃO DA TELA DO PARTICIPANTE
  // ============================================================
  function renderParticipantView() {
    // 1. Verifica se já existe um resultado fixo gravado para este dispositivo
    const savedResult = StorageManager.getUserResult();
    const hasActiveDraw = (appData.draw && Object.keys(appData.draw).length > 0) || (activeUrlDraw !== null);

    if (savedResult && savedResult.name && savedResult.friend) {
      // Já realizou o sorteio e o nome é fixo!
      showRevealedScreen(savedResult.name, savedResult.friend, false);
      return;
    }

    if (!hasActiveDraw) {
      // Nenhum sorteio ativo
      noDrawActiveState.classList.remove('hidden');
      selectionState.classList.add('hidden');
      drawingAnimationState.classList.add('hidden');
      revealedState.classList.add('hidden');
      return;
    }

    // Sorteio ativo disponível para selecionar o nome
    noDrawActiveState.classList.add('hidden');
    selectionState.classList.remove('hidden');
    drawingAnimationState.classList.add('hidden');
    revealedState.classList.add('hidden');

    // Preenche lista de participantes no select
    const participants = activeUrlDraw ? activeUrlDraw.participants : appData.participants;
    participantSelect.innerHTML = '<option value="" disabled selected>Selecione seu nome na lista...</option>';

    // Ordena alfabeticamente para facilitar encontrar
    const sorted = [...participants].sort((a, b) => a.localeCompare(b));
    sorted.forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = `🎅 ${name}`;
      if (currentParticipantName && currentParticipantName === name) {
        option.selected = true;
      }
      participantSelect.appendChild(option);
    });

    if (participantSelect.value) {
      drawActionBtn.disabled = false;
    } else {
      drawActionBtn.disabled = true;
    }
  }

  // ============================================================
  // ANIMAÇÃO DE SORTEIO E REVELAÇÃO
  // ============================================================
  function startDrawSequence(participantName) {
    let friendName = null;

    // Busca o amigo sorteado
    if (activeUrlDraw) {
      friendName = StorageManager.revealFriendForParticipant(
        participantName,
        activeUrlDraw.encryptedDraw,
        activeUrlDraw.drawSalt
      );
    } else if (appData.draw && appData.draw[participantName]) {
      friendName = appData.draw[participantName];
    }

    if (!friendName) {
      showToast('Erro ao localizar o seu amigo oculto. Fale com o organizador!', 'error');
      return;
    }

    // Transição de telas
    selectionState.classList.add('hidden');
    drawingAnimationState.classList.remove('hidden');

    // Chacoalha a caixa de presente e emite sons
    giftBox.classList.add('shaking');
    window.christmasAudio.playBoxShake();

    const participants = activeUrlDraw ? activeUrlDraw.participants : appData.participants;
    const filteredOthers = participants.filter((p) => p !== participantName);

    let counter = 0;
    const totalDuration = 3200; // 3.2 segundos de suspense natalino
    const intervalTime = 90;
    const totalTicks = totalDuration / intervalTime;

    const tickerInterval = setInterval(() => {
      counter++;
      const randomName = filteredOthers[Math.floor(Math.random() * filteredOthers.length)];
      namesTicker.textContent = randomName || 'Sorteando...';
      
      const progressPercent = Math.min(100, (counter / totalTicks) * 100);
      countdownProgress.style.width = `${progressPercent}%`;

      if (counter % 3 === 0) {
        window.christmasAudio.playBoxShake();
      }

      if (counter >= totalTicks) {
        clearInterval(tickerInterval);
        giftBox.classList.remove('shaking');

        // Fixa o resultado localmente (NUNCA mais pode mudar neste aparelho)
        StorageManager.setUserResult(participantName, friendName);

        // Exibe a tela de revelação com celebração
        showRevealedScreen(participantName, friendName, true);
      }
    }, intervalTime);
  }

  function showRevealedScreen(participantName, friendName, triggerCelebration = false) {
    selectionState.classList.add('hidden');
    drawingAnimationState.classList.add('hidden');
    noDrawActiveState.classList.add('hidden');
    revealedState.classList.remove('hidden');

    revealedUserName.textContent = participantName;
    revealedFriendName.textContent = friendName;

    if (triggerCelebration) {
      // Toca celebração Jingle Bells
      window.christmasAudio.playJingleBellsCelebration();

      // Chuva de confetes natalinos (dourado, vermelho, verde, branco)
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dc2626', '#16a34a', '#fbbf24', '#ffffff'],
        });

        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#fbbf24', '#dc2626'],
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#16a34a', '#fbbf24'],
          });
        }, 350);
      }
    }
  }

  // ============================================================
  // RENDERIZAÇÃO DO PAINEL DO ADMINISTRADOR
  // ============================================================
  function renderAdminView() {
    const totalP = appData.participants.length;
    let totalExcl = 0;
    Object.values(appData.exclusions).forEach((list) => {
      totalExcl += list.length;
    });

    adminTotalParticipants.textContent = totalP;
    adminTotalExclusions.textContent = totalExcl;
    participantCount.textContent = totalP;

    // Status do Sorteio
    if (appData.draw && Object.keys(appData.draw).length > 0) {
      adminDrawStatusBadge.className = 'status-badge badge-active';
      adminDrawStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Sorteio Realizado!';
      adminShareSection.classList.remove('hidden');
      
      // Gera link
      const shareUrl = StorageManager.generateShareLink(appData);
      shareLinkInput.value = shareUrl;

      // Habilita seção de spoilers
      adminSpoilerSection.classList.remove('hidden');
      renderAdminSpoilerTable();
    } else {
      adminDrawStatusBadge.className = 'status-badge badge-pending';
      adminDrawStatusBadge.innerHTML = '<i class="fa-solid fa-hourglass-start"></i> Aguardando Sorteio';
      adminShareSection.classList.add('hidden');
      adminSpoilerSection.classList.add('hidden');
    }

    renderParticipantsList();
    renderExclusionsUI();
    validatePreDrawChecklist();
  }

  // Lista de Participantes
  function renderParticipantsList() {
    if (appData.participants.length === 0) {
      participantsList.innerHTML = `
        <div class="empty-list-notice">
          <i class="fa-solid fa-user-group"></i>
          <p>Nenhum participante cadastrado ainda. Comece adicionando os nomes acima!</p>
        </div>
      `;
      return;
    }

    participantsList.innerHTML = '';
    appData.participants.forEach((name) => {
      const card = document.createElement('div');
      card.className = 'participant-item-card';

      const initial = name.trim().charAt(0).toUpperCase();
      const exclusionsCount = (appData.exclusions[name] || []).length;
      const exclusionBadge = exclusionsCount > 0
        ? `<span class="participant-exclusions-badge"><i class="fa-solid fa-ban"></i> ${exclusionsCount} restriç${exclusionsCount > 1 ? 'ões' : 'ão'}</span>`
        : '';

      card.innerHTML = `
        <div class="participant-info">
          <div class="participant-avatar">${initial}</div>
          <div>
            <div class="participant-name-text">${name}</div>
            ${exclusionBadge}
          </div>
        </div>
        <button class="btn-remove-participant" data-name="${name}" title="Remover participante">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;

      participantsList.appendChild(card);
    });

    // Eventos de exclusão de participante
    document.querySelectorAll('.btn-remove-participant').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const nameToRemove = btn.getAttribute('data-name');
        removeParticipant(nameToRemove);
      });
    });
  }

  // Seção de Exclusões
  function renderExclusionsUI() {
    // Popula os selects com os participantes
    exclusionSubjectSelect.innerHTML = '<option value="" disabled selected>Escolha quem...</option>';
    exclusionTargetSelect.innerHTML = '<option value="" disabled selected>Escolha o proibido...</option>';

    appData.participants.forEach((name) => {
      const opt1 = document.createElement('option');
      opt1.value = name;
      opt1.textContent = name;
      exclusionSubjectSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = name;
      opt2.textContent = name;
      exclusionTargetSelect.appendChild(opt2);
    });

    // Renderiza lista ativa de exclusões
    exclusionsListContainer.innerHTML = '';
    let hasExclusions = false;

    for (const [giver, targets] of Object.entries(appData.exclusions)) {
      if (targets && targets.length > 0) {
        hasExclusions = true;
        targets.forEach((target) => {
          const item = document.createElement('div');
          item.className = 'exclusion-tag-card';
          item.innerHTML = `
            <div class="exclusion-tag-text">
              <strong>${giver}</strong> não tira <span>${target}</span>
            </div>
            <button class="btn-remove-participant" data-giver="${giver}" data-target="${target}" title="Remover regra">
              <i class="fa-solid fa-xmark"></i>
            </button>
          `;
          exclusionsListContainer.appendChild(item);
        });
      }
    }

    if (!hasExclusions) {
      exclusionsListContainer.innerHTML = '<p class="text-muted text-sm">Nenhuma exclusão cadastrada no momento.</p>';
    }

    // Eventos de remover regra
    exclusionsListContainer.querySelectorAll('.btn-remove-participant').forEach((btn) => {
      btn.addEventListener('click', () => {
        const g = btn.getAttribute('data-giver');
        const t = btn.getAttribute('data-target');
        removeExclusionRule(g, t);
      });
    });
  }

  // Tabela de Spoiler do Admin
  function renderAdminSpoilerTable() {
    if (!appData.draw) return;
    spoilerTableBody.innerHTML = '';

    for (const [giver, receiver] of Object.entries(appData.draw)) {
      const tr = document.createElement('tr');
      const individualLink = StorageManager.generateShareLink(appData, giver);

      tr.innerHTML = `
        <td><strong>${giver}</strong></td>
        <td><span class="text-gold font-bold">🎁 ${receiver}</span></td>
        <td><span class="badge-pending text-xs"><i class="fa-solid fa-lock"></i> Gravado</span></td>
        <td>
          <button class="btn btn-sm btn-whatsapp copy-individual-link" data-link="${encodeURIComponent(individualLink)}" data-giver="${giver}">
            <i class="fa-brands fa-whatsapp"></i> Link de ${giver}
          </button>
        </td>
      `;
      spoilerTableBody.appendChild(tr);
    }

    spoilerTableBody.querySelectorAll('.copy-individual-link').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rawLink = decodeURIComponent(btn.getAttribute('data-link'));
        const giverName = btn.getAttribute('data-giver');
        const msg = `🎄 *Amigo Oculto de Natal 2026* 🎅\n\nOlá ${giverName}! O seu sorteio já está pronto.\nClique no link abaixo para descobrir quem você tirou:\n${rawLink}\n\n_Guarde em segredo!_ 🤫🎁`;
        
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
      });
    });
  }

  // Checklist Pré-Sorteio
  function validatePreDrawChecklist() {
    const countOk = appData.participants.length >= 3;
    const validation = SecretSantaEngine.validate(appData.participants, appData.exclusions);

    checkParticipants.innerHTML = countOk
      ? '<i class="fa-solid fa-circle-check text-green"></i> <span>Pelo menos 3 participantes cadastrados</span>'
      : '<i class="fa-solid fa-circle-xmark text-red"></i> <span>Mínimo de 3 participantes necessário (atualmente: ' + appData.participants.length + ')</span>';

    checkSolvable.innerHTML = validation.valid
      ? '<i class="fa-solid fa-circle-check text-green"></i> <span>Regras de exclusão matematicamente possíveis</span>'
      : `<i class="fa-solid fa-circle-xmark text-red"></i> <span>${validation.message}</span>`;

    executeDrawBtn.disabled = !countOk || !validation.valid;
  }

  // ============================================================
  // AÇÕES DO ADMINISTRADOR
  // ============================================================
  function addParticipant(name) {
    const cleanName = name.trim();
    if (!cleanName) return;

    if (appData.participants.some((p) => p.toLowerCase() === cleanName.toLowerCase())) {
      showToast(`O participante "${cleanName}" já está na lista!`, 'error');
      return;
    }

    appData.participants.push(cleanName);
    StorageManager.saveData(appData);
    renderAdminView();
    showToast(`"${cleanName}" adicionado com sucesso!`, 'success');
  }

  function removeParticipant(name) {
    appData.participants = appData.participants.filter((p) => p !== name);
    // Limpa exclusões associadas
    delete appData.exclusions[name];
    for (const key in appData.exclusions) {
      appData.exclusions[key] = appData.exclusions[key].filter((p) => p !== name);
    }
    // Se o sorteio estava feito, anula pois mudou a lista
    if (appData.draw) {
      appData.draw = null;
      showToast('A lista mudou. Será necessário realizar o sorteio novamente.', 'info');
    }
    StorageManager.saveData(appData);
    renderAdminView();
  }

  function addExclusionRule(subject, target, reciprocal = true) {
    if (!subject || !target) return;
    if (subject === target) {
      showToast('A pessoa já não pode tirar a si mesma por regra natural!', 'error');
      return;
    }

    if (!appData.exclusions[subject]) {
      appData.exclusions[subject] = [];
    }
    if (!appData.exclusions[subject].includes(target)) {
      appData.exclusions[subject].push(target);
    }

    if (reciprocal) {
      if (!appData.exclusions[target]) {
        appData.exclusions[target] = [];
      }
      if (!appData.exclusions[target].includes(subject)) {
        appData.exclusions[target].push(subject);
      }
    }

    // Se havia sorteio ativo, anula pois mudaram as regras
    if (appData.draw) {
      appData.draw = null;
      showToast('As regras mudaram. O sorteio anterior foi invalidado.', 'info');
    }

    StorageManager.saveData(appData);
    renderAdminView();
    showToast('Regra de exclusão aplicada com sucesso!', 'success');
  }

  function removeExclusionRule(giver, target) {
    if (appData.exclusions[giver]) {
      appData.exclusions[giver] = appData.exclusions[giver].filter((t) => t !== target);
      if (appData.exclusions[giver].length === 0) {
        delete appData.exclusions[giver];
      }
    }
    StorageManager.saveData(appData);
    renderAdminView();
    showToast('Regra de exclusão removida.', 'info');
  }

  // ============================================================
  // EVENT LISTENERS & BINDINGS
  // ============================================================

  // Navegação entre Telas
  adminToggleBtn.addEventListener('click', () => {
    // Abre modal de login do admin
    adminLoginError.classList.add('hidden');
    loginAdminPinInput.value = '';
    adminLoginModal.classList.remove('hidden');
    loginAdminPinInput.focus();
  });

  goToAdminBtn.addEventListener('click', () => {
    adminToggleBtn.click();
  });

  closeAdminLoginModal.addEventListener('click', () => {
    adminLoginModal.classList.add('hidden');
  });

  submitAdminLoginBtn.addEventListener('click', () => {
    const inputPin = loginAdminPinInput.value.trim();
    const correctPin = StorageManager.getAdminPin();

    if (inputPin === correctPin) {
      adminLoginModal.classList.add('hidden');
      participantView.classList.remove('active');
      participantView.classList.add('hidden');
      adminView.classList.remove('hidden');
      adminView.classList.add('active');
      renderAdminView();
      showToast('Acesso concedido ao Painel do Administrador!', 'success');
    } else {
      adminLoginError.classList.remove('hidden');
    }
  });

  loginAdminPinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitAdminLoginBtn.click();
    }
  });

  exitAdminBtn.addEventListener('click', () => {
    adminView.classList.remove('active');
    adminView.classList.add('hidden');
    participantView.classList.remove('hidden');
    participantView.classList.add('active');
    renderParticipantView();
  });

  // Alternar Som
  soundToggleBtn.addEventListener('click', () => {
    window.christmasAudio.toggleMute();
    updateSoundIcon();
  });

  // Abas do Painel do Admin
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      btn.classList.add('active');
      const targetTabId = btn.getAttribute('data-tab');
      document.getElementById(targetTabId).classList.add('active');
    });
  });

  // Adicionar Participante
  addParticipantBtn.addEventListener('click', () => {
    addParticipant(newParticipantInput.value);
    newParticipantInput.value = '';
    newParticipantInput.focus();
  });

  newParticipantInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addParticipantBtn.click();
    }
  });

  // Adicionar Vários (Bulk)
  bulkAddToggleBtn.addEventListener('click', () => {
    singleAddForm.classList.toggle('hidden');
    bulkAddForm.classList.toggle('hidden');
  });

  cancelBulkAddBtn.addEventListener('click', () => {
    bulkAddForm.classList.add('hidden');
    singleAddForm.classList.remove('hidden');
  });

  confirmBulkAddBtn.addEventListener('click', () => {
    const raw = bulkParticipantsTextarea.value;
    if (!raw.trim()) return;

    // Divide por nova linha ou vírgula
    const names = raw.split(/[\n,]+/).map((n) => n.trim()).filter((n) => n.length > 0);
    let addedCount = 0;

    names.forEach((name) => {
      if (!appData.participants.some((p) => p.toLowerCase() === name.toLowerCase())) {
        appData.participants.push(name);
        addedCount++;
      }
    });

    StorageManager.saveData(appData);
    bulkParticipantsTextarea.value = '';
    bulkAddForm.classList.add('hidden');
    singleAddForm.classList.remove('hidden');
    renderAdminView();
    showToast(`${addedCount} novos participantes adicionados!`, 'success');
  });

  // Aplicar Exclusão
  addExclusionRuleBtn.addEventListener('click', () => {
    const subject = exclusionSubjectSelect.value;
    const target = exclusionTargetSelect.value;
    const isReciprocal = reciprocalExclusionCheck.checked;

    if (!subject || !target) {
      showToast('Selecione ambas as pessoas para a regra!', 'error');
      return;
    }

    addExclusionRule(subject, target, isReciprocal);
  });

  clearAllExclusionsBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja apagar todas as regras de exclusão?')) {
      appData.exclusions = {};
      if (appData.draw) appData.draw = null;
      StorageManager.saveData(appData);
      renderAdminView();
      showToast('Todas as exclusões foram removidas!', 'info');
    }
  });

  // Realizar Sorteio pelo Admin
  executeDrawBtn.addEventListener('click', () => {
    executeDrawBtn.disabled = true;
    executeDrawBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sorteando...';

    setTimeout(() => {
      const result = SecretSantaEngine.executeDraw(appData.participants, appData.exclusions);

      if (result.success) {
        appData.draw = result.draw;
        appData.createdAt = Date.now();
        StorageManager.saveData(appData);

        renderAdminView();
        window.christmasAudio.playJingleBellsCelebration();

        if (typeof confetti === 'function') {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        }

        showToast('🎅 Sorteio realizado com sucesso total!', 'success');
      } else {
        showToast(result.error || 'Erro ao realizar sorteio.', 'error');
      }

      executeDrawBtn.disabled = false;
      executeDrawBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Realizar Sorteio Agora! 🎅</span>';
    }, 400);
  });

  // Spoiler Toggle
  toggleSpoilerBtn.addEventListener('click', () => {
    spoilerContent.classList.toggle('hidden');
    toggleSpoilerBtn.innerHTML = spoilerContent.classList.contains('hidden')
      ? '<i class="fa-solid fa-eye"></i> Ver Resultados'
      : '<i class="fa-solid fa-eye-slash"></i> Ocultar Resultados';
  });

  // Compartilhamento no WhatsApp e Cópia do Link
  copyShareLinkBtn.addEventListener('click', () => {
    shareLinkInput.select();
    navigator.clipboard.writeText(shareLinkInput.value).then(() => {
      showToast('Link do sorteio copiado com sucesso!', 'success');
    }).catch(() => {
      document.execCommand('copy');
      showToast('Link copiado!', 'success');
    });
  });

  whatsappShareBtn.addEventListener('click', () => {
    const link = shareLinkInput.value;
    const msg = `🎄🎅 *AMIGO OCULTO DE NATAL 2026* 🎁✨\n\nO nosso sorteio oficial de Natal já está pronto!\n\nPara descobrir quem você tirou:\n1️⃣ Clique no link abaixo\n2️⃣ Selecione o seu nome\n3️⃣ Abra o seu presente virtual!\n\n👉 ${link}\n\n_Atenção: Guarde segredo até o dia da festa!_ 🤫`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  });

  // Configurações & Reset
  saveAdminPinBtn.addEventListener('click', () => {
    const newPin = adminPinInput.value.trim();
    if (!newPin || newPin.length < 3) {
      showToast('O PIN deve ter no mínimo 3 dígitos!', 'error');
      return;
    }
    StorageManager.setAdminPin(newPin);
    adminPinInput.value = '';
    showToast('PIN do Administrador atualizado com sucesso!', 'success');
  });

  btnRedrawOnly.addEventListener('click', () => {
    pendingResetType = 'drawOnly';
    resetModalTitle.textContent = 'Refazer Sorteio?';
    resetModalMessage.textContent = 'Isso apagará os amigos secretos sorteados atualmente, mas MANTERÁ a sua lista de participantes e as exclusões.';
    confirmResetActionBtn.className = 'btn btn-outline-warning';
    confirmResetActionBtn.textContent = 'Sim, Refazer Sorteio';
    resetConfirmModal.classList.remove('hidden');
  });

  btnDeleteEverything.addEventListener('click', () => {
    pendingResetType = 'everything';
    resetModalTitle.textContent = 'Excluir Sorteio e Começar do Zero?';
    resetModalMessage.textContent = 'ATENÇÃO: Isso apagará TODOS os participantes, TODAS as regras de exclusão e o sorteio. Você começará do zero absoluto.';
    confirmResetActionBtn.className = 'btn btn-danger';
    confirmResetActionBtn.textContent = 'Sim, Apagar Tudo';
    resetConfirmModal.classList.remove('hidden');
  });

  cancelResetModalBtn.addEventListener('click', () => {
    resetConfirmModal.classList.add('hidden');
    pendingResetType = null;
  });

  confirmResetActionBtn.addEventListener('click', () => {
    resetConfirmModal.classList.add('hidden');
    if (pendingResetType === 'drawOnly') {
      appData = StorageManager.resetDrawOnly();
      renderAdminView();
      showToast('Sorteio resetado. Você pode gerar um novo agora!', 'info');
    } else if (pendingResetType === 'everything') {
      appData = StorageManager.resetEverything();
      renderAdminView();
      showToast('Todos os dados foram excluídos. O sistema foi zerado!', 'info');
    }
    pendingResetType = null;
  });

  // Participante: Seleção do Nome
  participantSelect.addEventListener('change', () => {
    currentParticipantName = participantSelect.value;
    drawActionBtn.disabled = !currentParticipantName;
    window.christmasAudio.playClick();
  });

  // Participante: Clique no Presente ou no Botão de Revelar
  giftBox.addEventListener('click', () => {
    if (!participantSelect.value) {
      showToast('Por favor, selecione seu nome na lista acima primeiro!', 'info');
      participantSelect.focus();
      return;
    }
    drawActionBtn.click();
  });

  drawActionBtn.addEventListener('click', () => {
    if (!participantSelect.value) return;

    modalConfirmName.textContent = participantSelect.value;
    confirmIdentityModal.classList.remove('hidden');
  });

  cancelIdentityBtn.addEventListener('click', () => {
    confirmIdentityModal.classList.add('hidden');
  });

  confirmIdentityBtn.addEventListener('click', () => {
    confirmIdentityModal.classList.add('hidden');
    startDrawSequence(participantSelect.value);
  });

  // Participante: Ocultar / Mostrar Nome por Privacidade
  togglePrivacyBtn.addEventListener('click', () => {
    privacyCurtain.classList.toggle('hidden');
  });

  showSecretBtn.addEventListener('click', () => {
    privacyCurtain.classList.add('hidden');
  });

  // Inicialização
  updateSoundIcon();
  checkUrlParameters();
  renderParticipantView();
});
