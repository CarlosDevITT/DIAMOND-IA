    const CONFIG = {
      RATE_LIMIT: 10,
      RATE_LIMIT_TIME: 60000,
      API_KEY: "AIzaSyCEzTK6M5oCGSF6LlE9sc0ZoI5a4UriAx8",
      API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      SYSTEM_CONTEXT: `
        Você é o DIAMOND, assistente virtual da States Softwares (https://state-software.vercel.app/).
        Siga estas regras:
        1. Sempre responda em português claro e profissional
        2. Nunca use *asteriscos* ou blocos de código
        3. Destaque os serviços da States Softwares:
           - Desenvolvimento de soluções em IA
           - Automação de processos empresariais
           - Análise de dados inteligente
        4. Seja conciso e objetivo nas respostas
      `,
      TYPING_SPEED: 40,
      RESPONSE_DELAY: 600,
      ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'text/plain']
    };

    // State Management
    const state = {
      requestCount: 0,
      lastRequestTime: 0,
      chatHistory: [{ role: "user", parts: [{ text: CONFIG.SYSTEM_CONTEXT }] }],
      userData: { message: "", file: null },
      controller: null,
      typingInterval: null,
      isResponding: false
    };

    // DOM Elements with null checking
    const getElements = () => ({
      chatsContainer: document.querySelector('.chats-container'),
      promptForm: document.querySelector('.prompt-form'),
      promptInput: document.querySelector('.prompt-input'),
      sendPromptBtn: document.querySelector('#send-prompt-btn'),
      suggestionsItems: document.querySelectorAll('.suggestions-item'),
      themeToggleBtn: document.querySelector('#theme-toggle-btn'),
      deleteChatsBtn: document.querySelector('#delete-chats-btn'),
      stopResponseBtn: document.querySelector('#stop-response-btn'),
      fileInput: document.querySelector('#file-input'),
      addFileBtn: document.querySelector('#add-file-btn'),
      cancelFileBtn: document.querySelector('#cancel-file-btn'),
      fileUploadWrapper: document.querySelector('.file-upload-wrapper'),
      filePreview: document.querySelector('.file-preview'),
      container: document.querySelector('.container')
    });

    // Utility Functions
    const scrollToBottom = (container) => {
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }
    };

    const cleanResponse = (text) => {
      if (!text) return "";
      
      let cleaned = text
        .replace(/\*\*/g, '')
        .replace(/`{3}[\s\S]*?`{3}/g, '')
        .replace(/`/g, '')
        .replace(/#+\s*/g, '')
        .replace(/\n{3,}/g, '\n\n');
      
      const techKeywords = ['IA', 'inteligência artificial', 'software', 'automação', 'dados'];
      const shouldMention = techKeywords.some(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (shouldMention && !cleaned.includes('States Softwares')) {
        cleaned += `\n\nConheça nossas soluções em: https://state-software.vercel.app/`;
      }
      
      return cleaned.trim();
    };

    const createMessageElement = (content, ...classes) => {
      const div = document.createElement("div");
      div.classList.add("message", ...classes);
      div.innerHTML = content;
      return div;
    };

    // Rate Limiting
    const checkRateLimit = async () => {
      const now = Date.now();
      
      if (now - state.lastRequestTime > CONFIG.RATE_LIMIT_TIME) {
        state.requestCount = 0;
        state.lastRequestTime = now;
      }
      
      if (state.requestCount >= CONFIG.RATE_LIMIT) {
        throw new Error("rate_limit_exceeded");
      }
      
      state.requestCount++;
    };

    // Typing Effect
    const startTypingEffect = (text, textElement, botMsgDiv) => {
      textElement.textContent = "";
      const words = text.split(" ");
      let wordIndex = 0;
      
      state.typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
          textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
          scrollToBottom(getElements().container);
        } else {
          clearInterval(state.typingInterval);
          botMsgDiv.classList.remove("loading");
          state.isResponding = false;
          document.body.classList.remove("bot-responding");
        }
      }, CONFIG.TYPING_SPEED);
    };

    // API Response Handling
    const generateResponse = async (botMsgDiv) => {
      const textElement = botMsgDiv.querySelector(".message-text");
      state.controller = new AbortController();
      
      try {
        await checkRateLimit();
        
        const response = await fetch(`${CONFIG.API_URL}?key=${CONFIG.API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: state.chatHistory }),
          signal: state.controller.signal
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Erro na API");
        }

        const data = await response.json();
        const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!rawResponse) throw new Error("Resposta inválida da API");
        
        const cleanedResponse = cleanResponse(rawResponse);
        state.chatHistory.push({ role: "model", parts: [{ text: cleanedResponse }] });
        startTypingEffect(cleanedResponse, textElement, botMsgDiv);
        
      } catch (error) {
        clearInterval(state.typingInterval);
        textElement.innerHTML = `
          <div class="error-message">
            <span class="material-symbols-rounded">error</span>
            ${error.message === "rate_limit_exceeded" 
              ? "Muitas requisições. Aguarde 1 minuto." 
              : "Erro ao gerar resposta. Tente novamente."}
          </div>
        `;
        botMsgDiv.classList.remove("loading");
        state.isResponding = false;
        document.body.classList.remove("bot-responding");
      }
    };

    // Form Submission
    const handleFormSubmit = (e, elements) => {
      e.preventDefault();
      if (state.isResponding || !elements.promptInput.value.trim()) return;

      state.userData.message = elements.promptInput.value.trim();
      elements.promptInput.value = "";
      state.isResponding = true;
      document.body.classList.add("chats-active", "bot-responding");
      elements.fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");

      const userMsgHTML = `
        <p class="message-text">${state.userData.message}</p>
        ${state.userData.file 
          ? state.userData.file.isImage 
            ? `<img src="data:${state.userData.file.mime_type};base64,${state.userData.file.data}" class="img-attachment" />`
            : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${state.userData.file.fileName}</p>`
          : ""}
      `;
      
      const userMsgDiv = createMessageElement(userMsgHTML, "user-message");
      elements.chatsContainer.appendChild(userMsgDiv);
      scrollToBottom(elements.container);

      const parts = [{ text: state.userData.message }];
      if (state.userData.file) {
        parts.push({
          inline_data: {
            mime_type: state.userData.file.mime_type,
            data: state.userData.file.data
          }
        });
      }
      state.chatHistory.push({ role: "user", parts });

      setTimeout(() => {
        const botMsgHTML = `
          <img class="avatar" src="../assets/avatar.png" alt="DIAMOND" />
          <p class="message-text">Processando sua solicitação...</p>
        `;
        const botMsgDiv = createMessageElement(botMsgHTML, "bot-message", "loading");
        elements.chatsContainer.appendChild(botMsgDiv);
        scrollToBottom(elements.container);
        generateResponse(botMsgDiv);
      }, CONFIG.RESPONSE_DELAY);
    };

    // File Upload Handling
    const handleFileUpload = (file, elements) => {
      if (!file || !CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
        alert("Tipo de arquivo não suportado");
        return;
      }

      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (e) => {
        const base64String = e.target.result.split(",")[1];
        elements.filePreview.src = e.target.result;
        elements.fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");
        
        state.userData.file = {
          fileName: file.name,
          data: base64String,
          mime_type: file.type,
          isImage
        };
      };
    };

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      const elements = getElements();
      
      // Theme Setup
      const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
      document.body.classList.toggle("light-theme", isLightTheme);
      elements.themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";

      // Event Listeners
      elements.cancelFileBtn.addEventListener("click", () => {
        state.userData.file = null;
        elements.fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");
        elements.filePreview.src = "";
      });

      elements.stopResponseBtn.addEventListener("click", () => {
        if (state.controller) state.controller.abort();
        if (state.typingInterval) clearInterval(state.typingInterval);
        state.isResponding = false;
        document.body.classList.remove("bot-responding");
      });

      elements.themeToggleBtn.addEventListener("click", () => {
        const isLightTheme = document.body.classList.toggle("light-theme");
        localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
        elements.themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";
      });

      elements.deleteChatsBtn.addEventListener("click", () => {
        state.chatHistory = [{ role: "user", parts: [{ text: CONFIG.SYSTEM_CONTEXT }] }];
        elements.chatsContainer.innerHTML = "";
        document.body.classList.remove("chats-active", "bot-responding");
        state.isResponding = false;
      });

      elements.suggestionsItems.forEach((item) => {
        item.addEventListener("click", () => {
          const text = item.querySelector(".text")?.textContent;
          if (text) {
            elements.promptInput.value = text;
            elements.promptForm.dispatchEvent(new Event("submit"));
          }
        });
      });

      elements.promptForm.addEventListener("submit", (e) => handleFormSubmit(e, elements));
      elements.addFileBtn.addEventListener("click", () => elements.fileInput.click());
      elements.fileInput.addEventListener("change", () => handleFileUpload(elements.fileInput.files[0], elements));
    });
