/**
 * Gerenciador de Armazenamento Local e Compartilhamento via URL
 * Permite que o sorteio funcione 100% online e offline sem servidores obrigatórios.
 * Suporta caracteres acentuados em português (João, Cláudia, etc.) de forma 100% segura.
 */
class StorageManager {
  static STORAGE_KEY_DATA = 'amigo_oculto_data_2026';
  static STORAGE_KEY_ADMIN_PIN = 'amigo_oculto_admin_pin_2026';
  static STORAGE_KEY_USER_RESULT = 'amigo_oculto_user_result_2026';

  /**
   * Criptografia reversível via XOR em nível de bytes UTF-8
   * Garante que os nomes dos amigos sorteados não fiquem visíveis em texto puro no link
   * e suporta 100% de acentos e caracteres especiais em português.
   */
  static encryptText(text, key) {
    try {
      const utf8Bytes = new TextEncoder().encode(text);
      const keyBytes = new TextEncoder().encode(key);
      const encryptedBytes = new Uint8Array(utf8Bytes.length);

      for (let i = 0; i < utf8Bytes.length; i++) {
        encryptedBytes[i] = utf8Bytes[i] ^ keyBytes[i % keyBytes.length];
      }

      let binary = '';
      for (let i = 0; i < encryptedBytes.length; i++) {
        binary += String.fromCharCode(encryptedBytes[i]);
      }

      return btoa(binary);
    } catch (e) {
      console.error('Erro na criptografia:', e);
      return btoa(encodeURIComponent(text));
    }
  }

  static decryptText(encoded, key) {
    try {
      const binary = atob(encoded);
      const keyBytes = new TextEncoder().encode(key);
      const decryptedBytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        decryptedBytes[i] = binary.charCodeAt(i) ^ keyBytes[i % keyBytes.length];
      }

      return new TextDecoder().decode(decryptedBytes);
    } catch (e) {
      console.error('Falha ao decodificar:', e);
      return null;
    }
  }

  /**
   * Codifica um objeto JSON em string Base64 segura para URL com suporte total a UTF-8
   */
  static encodePayload(payload) {
    try {
      const jsonStr = JSON.stringify(payload);
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      return encodeURIComponent(btoa(binary));
    } catch (e) {
      console.error('Erro ao codificar payload:', e);
      return '';
    }
  }

  /**
   * Decodifica a string Base64 da URL de volta para o objeto JSON original
   */
  static decodePayload(encodedStr) {
    try {
      const binary = atob(decodeURIComponent(encodedStr));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Erro ao decodificar payload da URL:', e);
      return null;
    }
  }

  /**
   * Retorna os dados padrão iniciais da aplicação
   */
  static getDefaultData() {
    return {
      version: '2026.2',
      title: 'Amigo Oculto de Natal 2026',
      drawId: null,
      createdAt: null,
      participants: [],
      exclusions: {}, // { "Rafael": ["Beatriz"] }
      draw: null,     // { "Rafael": "Beatriz", "Beatriz": "Carlos" ... }
      drawSalt: 'natal_magico_2026',
      revealedCount: 0,
    };
  }

  /**
   * Obtém os dados salvos localmente
   */
  static loadData() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_DATA);
      if (!raw) return this.getDefaultData();
      return { ...this.getDefaultData(), ...JSON.parse(raw) };
    } catch (e) {
      console.error('Erro ao ler localStorage:', e);
      return this.getDefaultData();
    }
  }

  /**
   * Salva os dados no localStorage
   */
  static saveData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY_DATA, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
      return false;
    }
  }

  /**
   * Obtém o PIN do Administrador (Padrão: "2026")
   */
  static getAdminPin() {
    return localStorage.getItem(this.STORAGE_KEY_ADMIN_PIN) || '2026';
  }

  /**
   * Atualiza o PIN do Administrador
   */
  static setAdminPin(pin) {
    localStorage.setItem(this.STORAGE_KEY_ADMIN_PIN, pin);
  }

  /**
   * Carrega o resultado fixo deste participante salvo neste dispositivo
   */
  static getUserResult() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_USER_RESULT);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  /**
   * Limpa o resultado gravado no dispositivo (usado quando o sorteio é refeito)
   */
  static clearUserResult() {
    try {
      localStorage.removeItem(this.STORAGE_KEY_USER_RESULT);
    } catch (e) {}
  }

  /**
   * Fixa o resultado do sorteio para este participante vinculado ao sorteio específico (drawId)
   */
  static setUserResult(participantName, friendName, drawId = null, drawCreatedAt = null) {
    try {
      const record = {
        name: participantName,
        friend: friendName,
        drawId: drawId || null,
        drawCreatedAt: drawCreatedAt || null,
        date: new Date().toISOString(),
      };
      localStorage.setItem(this.STORAGE_KEY_USER_RESULT, JSON.stringify(record));
      return record;
    } catch (e) {
      console.error('Erro ao gravar resultado no dispositivo:', e);
      return null;
    }
  }

  /**
   * Codifica todo o sorteio em uma string compacta e segura para a URL
   */
  static encodeDrawToUrl(data) {
    if (!data.draw || !data.participants) return '';

    const salt = data.drawSalt || 'natal_2026';
    const createdAt = data.createdAt || Date.now();
    const drawId = data.drawId || (`draw_${createdAt}`);
    
    // Ofusca cada destinatário usando a chave única do participante
    const encryptedDraw = {};
    for (const [giver, receiver] of Object.entries(data.draw)) {
      encryptedDraw[giver] = this.encryptText(receiver, giver + salt);
    }

    const payload = {
      id: drawId,
      t: data.title || 'Amigo Oculto 2026',
      p: data.participants,
      d: encryptedDraw,
      s: salt,
      c: createdAt,
    };

    return this.encodePayload(payload);
  }

  /**
   * Decodifica os dados do sorteio vindos da URL
   */
  static decodeDrawFromUrl(encodedString) {
    const payload = this.decodePayload(encodedString);
    if (!payload || !payload.p || !payload.d) return null;

    const createdAt = payload.c || Date.now();
    const drawId = payload.id || (`draw_${createdAt}`);

    return {
      drawId: drawId,
      title: payload.t || 'Amigo Oculto de Natal 2026',
      participants: payload.p,
      encryptedDraw: payload.d,
      drawSalt: payload.s || 'natal_2026',
      createdAt: createdAt,
    };
  }

  /**
   * Decifra o amigo secreto de uma pessoa específica
   */
  static revealFriendForParticipant(participantName, encryptedDraw, salt) {
    if (!encryptedDraw || !encryptedDraw[participantName]) return null;
    const cipher = encryptedDraw[participantName];
    return this.decryptText(cipher, participantName + salt);
  }

  /**
   * Gera o link completo de compartilhamento (WhatsApp / Redes)
   */
  static generateShareLink(data, participantName = null) {
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedData = this.encodeDrawToUrl(data);
    let url = `${baseUrl}#draw=${encodedData}`;

    if (participantName) {
      url += `&p=${encodeURIComponent(participantName)}`;
    }

    return url;
  }

  /**
   * Exclui apenas o sorteio (mantém participantes e regras)
   */
  static resetDrawOnly() {
    const data = this.loadData();
    data.draw = null;
    data.drawId = null;
    data.createdAt = null;
    data.drawSalt = `natal_${Date.now()}`;
    this.saveData(data);
    this.clearUserResult();
    return data;
  }

  /**
   * Exclui tudo e recomeça do zero
   */
  static resetEverything() {
    localStorage.removeItem(this.STORAGE_KEY_DATA);
    this.clearUserResult();
    return this.getDefaultData();
  }
}

window.StorageManager = StorageManager;
