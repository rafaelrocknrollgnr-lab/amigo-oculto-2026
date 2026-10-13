# 🎄 Amigo Oculto de Natal 2026 🎅🎁

Sistema moderno, bonito e festivo para sorteio de **Amigo Oculto (Amigo Secreto) de Natal 2026**, projetado para funcionar online de forma 100% gratuita através do **GitHub Pages** e ser compartilhado facilmente pelo **WhatsApp**.

---

## ✨ Funcionalidades Principais

1. **🎅 Painel do Administrador (Protegido por PIN):**
   - Acesso seguro ao painel através de um PIN (Padrão de fábrica: `2026`, alterável nas configurações).
   - Cadastro individual de participantes ou importação em massa (colar lista de nomes).
   - Visualização de quantos participantes e exclusões estão ativos.

2. **🚫 Regras de Exclusão Personalizadas:**
   - Defina quem uma pessoa **NÃO pode tirar** (ideal para casais, irmãos, pais e filhos).
   - Suporte a **múltiplas exclusões** por pessoa.
   - Opção de regra recíproca automática (nem A tira B, nem B tira A) ou unidirecional.
   - O algoritmo impede automaticamente que qualquer pessoa tire a si mesma.

3. **🎲 Algoritmo de Sorteio Matemático:**
   - Algoritmo de *Derangement* com prioridade em **Ciclo Hamiltoniano Único** (A ➔ B ➔ C ➔ D ➔ A), garantindo uma corrente única sem mini-grupos isolados.
   - Validação prévia: se as restrições tornarem o sorteio impossível, o sistema avisa exatamente o motivo antes de sortear.
   - Sem duplicidades: cada pessoa dá exatamente um presente e recebe exatamente um presente.

4. **📲 Compartilhamento no WhatsApp:**
   - **Link Geral para o Grupo:** Envie um único link no grupo do WhatsApp. Cada participante clica, seleciona seu nome e descobre seu amigo.
   - **Links Individuais:** O administrador também tem botões diretos para enviar o link personalizado para cada pessoa, com o nome dela já pré-selecionado!

5. **🔒 Resultado Fixo e Confidencial:**
   - Ao selecionar o nome e confirmar a identidade, o sorteio é realizado e **o amigo secreto fica fixo** gravado no dispositivo da pessoa.
   - Não é possível sortear mais de uma vez.
   - **Cortina de Privacidade:** Botão para ocultar o nome na tela caso haja pessoas por perto.

6. **🗑️ Opção de Excluir e Recomeçar:**
   - **Refazer apenas o sorteio:** Mantém todos os participantes e regras de exclusão já cadastradas, gerando apenas novos pares.
   - **Excluir tudo e começar do zero:** Apaga completamente participantes, regras e sorteio para recomeçar do início.

7. **🌟 Tema Natalino Encantador:**
   - Neve caindo suavemente em segundo plano (Canvas 60fps).
   - Pisca-pisca de luzes natalinas animadas no topo.
   - Caixa de presente 3D interativa com animação de agitar e abrir.
   - Efeitos sonoros de sinos natalinos (*Jingle Bells*) gerados via Web Audio API (sem precisar carregar arquivos externos).
   - Chuva de confetes coloridos (*canvas-confetti*) na revelação do amigo.
   - Design 100% responsivo para celulares (iPhone e Android) e computadores.

---

## 🚀 Como Publicar no GitHub Pages (Online)

Este projeto foi construído em HTML5, CSS3 e JavaScript puro (Vanilla JS), o que significa que ele roda diretamente no navegador e pode ser hospedado de forma 100% gratuita no **GitHub Pages**:

1. **Envie os arquivos para o repositório:**
   ```bash
   git add .
   git commit -m "feat: Amigo Oculto de Natal 2026 completo"
   git push -u origin main
   ```

2. **Ative o GitHub Pages:**
   - Acesse o repositório no GitHub: `https://github.com/rafaelrocknrollgnr-lab/amigo-oculto-2026`
   - Vá na aba **Settings** (Configurações).
   - No menu lateral esquerdo, clique em **Pages**.
   - Na seção **Branch**, selecione `main` e a pasta `/ (root)`.
   - Clique em **Save**.

3. **Pronto!**
   - Em cerca de 1 a 2 minutos, o seu sistema estará online no link:
   - `https://rafaelrocknrollgnr-lab.github.io/amigo-oculto-2026/`

---

## 📱 Como Usar Passo a Passo

### 1. Criando o Sorteio (Administrador)
1. Abra o site e clique no botão **Admin** no canto superior direito.
2. Digite o PIN: `2026`.
3. Na aba **1. Participantes**, adicione os nomes de todas as pessoas.
4. Na aba **2. Regras de Exclusão**, adicione as regras de quem não pode tirar quem (ex: casais).
5. Na aba **3. Realizar Sorteio**, clique em **Realizar Sorteio Agora! 🎅**.
6. Copie o link gerado ou clique em **Compartilhar** para enviar diretamente no grupo do WhatsApp!

### 2. Para os Participantes
1. A pessoa clica no link recebido no WhatsApp.
2. Seleciona o próprio nome na lista.
3. Clica em **Descobrir Meu Amigo Oculto!** (ou clica na caixa de presente).
4. O sistema faz a animação natalina, toca os sinos de Natal e revela o amigo sorteado!
5. O resultado fica gravado e fixado no aparelho dela.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico:** Estrutura limpa e acessível.
- **CSS3 Moderno:** Flexbox, Grid, Glassmorphism, Gradientes, Animações 3D.
- **JavaScript (ES6+):** Algoritmo de Derangement, Storage Manager, Criptografia reversível para URLs.
- **Web Audio API:** Sintetizador de sinos e sons natalinos em tempo real sem dependências externas.
- **Canvas API:** Efeito suave de flocos de neve caindo.
- **Canvas-Confetti:** Explosão de confetes na revelação do amigo.
- **FontAwesome & Google Fonts:** Tipografia festiva (*Mountains of Christmas*, *Cinzel*, *Outfit*).

---

Feito com espírito natalino para o **Natal 2026**! 🎄🎅🎁
