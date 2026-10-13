/**
 * Motor de Sorteio de Amigo Oculto com Restrições / Exclusões
 * Garante ciclo hamiltoniano e derangement perfeito.
 */
class SecretSantaEngine {
  /**
   * Valida se a configuração de participantes e exclusões é teoricamente possível
   * @param {string[]} participants - Lista de participantes
   * @param {Object.<string, string[]>} exclusions - Mapa de participante -> quem ele NÃO pode tirar
   * @returns {{ valid: boolean, message?: string }}
   */
  static validate(participants, exclusions = {}) {
    if (!participants || participants.length < 3) {
      return {
        valid: false,
        message: 'É necessário ter no mínimo 3 participantes para realizar o amigo oculto.',
      };
    }

    // Verifica se algum participante excluiu todo mundo
    for (const p of participants) {
      const excluded = exclusions[p] || [];
      // O participante não pode tirar a si mesmo (1) + as exclusões
      const forbiddenSet = new Set([p, ...excluded]);
      const availableCandidates = participants.filter((c) => !forbiddenSet.has(c));

      if (availableCandidates.length === 0) {
        return {
          valid: false,
          message: `O participante "${p}" não possui ninguém disponível para tirar devido às regras de exclusão.`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Embaralha um array aleatoriamente (Fisher-Yates)
   * @param {Array} array 
   * @returns {Array} novo array embaralhado
   */
  static shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Executa o sorteio tentando primeiro um ciclo fechado único (A -> B -> C -> ... -> A)
   * para uma experiência tradicional onde ninguém fica em mini-grupos fechados isolados.
   * Se não for possível devido a exclusões rígidas, recorre a qualquer derangement válido.
   * 
   * @param {string[]} participants 
   * @param {Object.<string, string[]>} exclusions 
   * @param {number} maxAttempts 
   * @returns {{ success: boolean, draw?: Object.<string, string>, error?: string }}
   */
  static executeDraw(participants, exclusions = {}, maxAttempts = 1500) {
    const val = this.validate(participants, exclusions);
    if (!val.valid) {
      return { success: false, error: val.message };
    }

    const n = participants.length;

    // Normaliza exclusões
    const normExclusions = {};
    participants.forEach((p) => {
      normExclusions[p] = new Set(exclusions[p] || []);
    });

    // Função de verificação se A pode tirar B
    const canGive = (giver, receiver) => {
      if (giver === receiver) return false;
      if (normExclusions[giver] && normExclusions[giver].has(receiver)) return false;
      return true;
    };

    // TENTATIVA 1: Gerar um Ciclo Hamiltoniano Único (A -> B -> C -> D -> A)
    // Tenta encontrar aleatoriamente até maxAttempts vezes
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const shuffled = this.shuffle(participants);
      let isValidCycle = true;

      for (let i = 0; i < n; i++) {
        const giver = shuffled[i];
        const receiver = shuffled[(i + 1) % n];
        if (!canGive(giver, receiver)) {
          isValidCycle = false;
          break;
        }
      }

      if (isValidCycle) {
        const draw = {};
        for (let i = 0; i < n; i++) {
          draw[shuffled[i]] = shuffled[(i + 1) % n];
        }
        return { success: true, draw };
      }
    }

    // TENTATIVA 2: Algoritmo Backtracking Geral (Garante derangement perfeito se existir)
    const result = this.solveBacktracking(participants, canGive);
    if (result) {
      return { success: true, draw: result };
    }

    return {
      success: false,
      error: 'Não foi possível encontrar uma combinação válida que atenda a todas as regras de exclusão. Tente remover algumas restrições e tente novamente.',
    };
  }

  /**
   * Resolução por Backtracking com ordenação heurística aleatória
   */
  static solveBacktracking(participants, canGive) {
    const givers = this.shuffle(participants);
    const assigned = new Map();
    const usedReceivers = new Set();

    function backtrack(index) {
      if (index === givers.length) {
        return true;
      }

      const currentGiver = givers[index];
      // Candidatos disponíveis para esse giver
      const candidates = participants
        .filter((r) => !usedReceivers.has(r) && canGive(currentGiver, r));

      // Embaralha candidatos para garantir imprevisibilidade
      const shuffledCandidates = SecretSantaEngine.shuffle(candidates);

      for (const receiver of shuffledCandidates) {
        assigned.set(currentGiver, receiver);
        usedReceivers.add(receiver);

        if (backtrack(index + 1)) {
          return true;
        }

        // Desfaz escolha
        assigned.delete(currentGiver);
        usedReceivers.delete(receiver);
      }

      return false;
    }

    if (backtrack(0)) {
      const finalDraw = {};
      assigned.forEach((receiver, giver) => {
        finalDraw[giver] = receiver;
      });
      return finalDraw;
    }

    return null;
  }
}

// Exporta globalmente
window.SecretSantaEngine = SecretSantaEngine;
