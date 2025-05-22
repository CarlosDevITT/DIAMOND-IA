// Rate limiting
const RATE_LIMIT = 10; // 10 requests
const RATE_LIMIT_TIME = 60000; // 1 minute
let requestCount = 0;
let lastRequestTime = 0;

const checkRateLimit = () => {
  const now = Date.now();
  
  if (now - lastRequestTime > RATE_LIMIT_TIME) {
    requestCount = 0;
    lastRequestTime = now;
  }
  
  if (requestCount >= RATE_LIMIT) {
    throw new Error("rate_limit_exceeded");
  }
  
  requestCount++;
};

document.addEventListener('DOMContentLoaded', () => {
  // System context with States Softwares information
  const SYSTEM_CONTEXT = `
    Você é o DIAMOND, assistente virtual da States Softwares (https://state-software.vercel.app/).
    Siga estas regras:
    1. Sempre responda em português claro e profissional
    2. Nunca use *asteriscos* ou blocos de código
    3. Destaque os serviços da States Softwares:
       - Desenvolvimento de soluções em IA
       - Automação de processos empresariais
       - Análise de dados inteligente
   
    5. Seja conciso e objetivo nas respostas
  `;

  // DOM Elements
  const chatsContainer = document.querySelector('.chats-container');
  const promptForm = document.querySelector('.prompt-form');
  const promptInput = document.querySelector('.prompt-input');
  const sendPromptBtn = document.querySelector('#send-prompt-btn');
  const suggestionsItems = document.querySelectorAll('.suggestions-item');
  const themeToggleBtn = document.querySelector('#theme-toggle-btn');
  const deleteChatsBtn = document.querySelector('#delete-chats-btn');
  const stopResponseBtn = document.querySelector('#stop-response-btn');
  const fileInput = document.querySelector('#file-input');
  const addFileBtn = document.querySelector('#add-file-btn');
  const cancelFileBtn = document.querySelector('#cancel-file-btn');
  const fileUploadWrapper = document.querySelector('.file-upload-wrapper');
  const filePreview = document.querySelector('.file-preview');
  const container = document.querySelector('.container');

  // API Configuration
  const API_KEY = "AIzaSyCEzTK6M5oCGSF6LlE9sc0ZoI5a4UriAx8";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
  // App State
  let controller, typingInterval;
  const chatHistory = [
    {
      role: "user",
      parts: [{ text: SYSTEM_CONTEXT }]
    }
  ];
  const userData = { message: "", file: {} };

  // Theme setup
  const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
  document.body.classList.toggle("light-theme", isLightTheme);
  themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";

  // Clean response text from markdown
  const cleanResponse = (text) => {
    let cleaned = text
      .replace(/\*\*/g, '')        // Remove bold
      .replace(/`{3}[\s\S]*?`{3}/g, '') // Remove code blocks
      .replace(/`/g, '')           // Remove inline code
      .replace(/#+\s*/g, '')       // Remove headings
      .replace(/\n{3,}/g, '\n\n'); // Limit line breaks
    
    // Ensure States Softwares is mentioned when relevant
    const techKeywords = ['IA', 'inteligência artificial', 'software', 'automação', 'dados'];
    const shouldMention = techKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (shouldMention && !cleaned.includes('States Softwares')) {
      cleaned += `\n\nConheça nossas soluções em: https://state-software.vercel.app/`;
    }
    
    return cleaned.trim();
  };

  // Create message element
  const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };

  // Typing effect for bot responses
  const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;
    
    typingInterval = setInterval(() => {
      if (wordIndex < words.length) {
        textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
        scrollToBottom();
      } else {
        clearInterval(typingInterval);
        botMsgDiv.classList.remove("loading");
        document.body.classList.remove("bot-responding");
      }
    }, 40);
  };

  // Generate response from Gemini API
  const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");
    controller = new AbortController();
    
    try {
      checkRateLimit();
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: chatHistory }),
        signal: controller.signal,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const rawResponse = data.candidates[0].content.parts[0].text;
      const cleanedResponse = cleanResponse(rawResponse);
      
      typingEffect(cleanedResponse, textElement, botMsgDiv);
      chatHistory.push({ role: "model", parts: [{ text: cleanedResponse }] });
      
    } catch (error) {
      clearInterval(typingInterval);
      textElement.innerHTML = `
        <div class="error-message">
          <span class="material-symbols-rounded">error</span>
          ${error.message === "rate_limit_exceeded" 
            ? "Muitas requisições. Aguarde 1 minuto." 
            : "Erro ao gerar resposta. Tente novamente."}
        </div>
      `;
      botMsgDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");
    }
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = promptInput.value.trim();
    if (!userMessage || document.body.classList.contains("bot-responding")) return;

    userData.message = userMessage;
    promptInput.value = "";
    document.body.classList.add("chats-active", "bot-responding");
    fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");

    // Create user message
    const userMsgHTML = `
      <p class="message-text">${userData.message}</p>
      ${userData.file.data 
        ? userData.file.isImage 
          ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />`
          : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`
        : ""}
    `;
    
    const userMsgDiv = createMessageElement(userMsgHTML, "user-message");
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    // Add user message to history
    const parts = [{ text: userData.message }];
    if (userData.file.data) {
      parts.push({
        inline_data: {
          mime_type: userData.file.mime_type,
          data: userData.file.data
        }
      });
    }
    chatHistory.push({ role: "user", parts });

    // Create bot response
    setTimeout(() => {
      const botMsgHTML = `
        <img class="avatar" src="assets/avatar.png" alt="DIAMOND" />
        <p class="message-text">Processando sua solicitação...</p>
      `;
      const botMsgDiv = createMessageElement(botMsgHTML, "bot-message", "loading");
      chatsContainer.appendChild(botMsgDiv);
      scrollToBottom();
      generateResponse(botMsgDiv);
    }, 600);
  };

  // Handle file upload
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const base64String = e.target.result.split(",")[1];
      filePreview.src = e.target.result;
      fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");
      
      userData.file = {
        fileName: file.name,
        data: base64String,
        mime_type: file.type,
        isImage
      };
    };
  });

  // Event Listeners
  cancelFileBtn.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");
    filePreview.src = "";
  });

  stopResponseBtn.addEventListener("click", () => {
    controller?.abort();
    clearInterval(typingInterval);
    document.body.classList.remove("bot-responding");
  });

  themeToggleBtn.addEventListener("click", () => {
    const isLightTheme = document.body.classList.toggle("light-theme");
    localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
    themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";
  });

  deleteChatsBtn.addEventListener("click", () => {
    chatHistory.length = 1; // Keep only system context
    chatsContainer.innerHTML = "";
    document.body.classList.remove("chats-active", "bot-responding");
  });

  suggestionsItems.forEach((item) => {
    item.addEventListener("click", () => {
      promptInput.value = item.querySelector(".text").textContent;
      promptForm.dispatchEvent(new Event("submit"));
    });
  });

  promptForm.addEventListener("submit", handleFormSubmit);
  addFileBtn.addEventListener("click", () => fileInput.click());
});