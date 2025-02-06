const btnStart = document.getElementById('start');
const btnStop = document.getElementById('stop');
const content = document.getElementById('final');
const interim = document.getElementById('interim');
const status = document.getElementById('status');

let voices = []; // Array para armazenar as vozes disponíveis

// Função para preencher as vozes disponíveis
function populateVoices() {
    voices = speechSynthesis.getVoices();
}

// Função para falar o texto
function speak(text) {
    const textSpeak = new SpeechSynthesisUtterance(text);
    
    // Ajuste das propriedades
    textSpeak.rate = 1.3; // Velocidade da fala
    textSpeak.volume = 1; // Volume máximo
    textSpeak.pitch = 2; // Tom da voz

    // Seleciona uma voz específica
    const selectedVoice = voices.find(voice => voice.lang === 'pt-BR' && voice.name.includes('Google'));
    if (selectedVoice) {
        textSpeak.voice = selectedVoice; // Define a voz selecionada
    }

    // Início da fala
    window.speechSynthesis.speak(textSpeak);
}



// Atualiza as vozes quando a lista mudar
speechSynthesis.onvoiceschanged = populateVoices;
function wishMe() {
    const hour = new Date().getHours();
    if (hour < 12) {
        speak("Bom dia, Chefe...");
    } else if (hour < 18) {
        speak("Boa tarde, Senhor...");
    } else {
        speak("Boa noite, Senhor... como voce esta?");
    }
}

window.addEventListener('load', () => {
    speak("Inicializando Diamond...");
    wishMe();
});

if ("webkitSpeechRecognition" in window) {
    const recognition = new webkitSpeechRecognition();

    // Configurações do reconhecimento
    recognition.continuous = true; // Mantém o reconhecimento ativo
    recognition.interimResults = true; // Permite resultados intermediários
    recognition.lang = 'pt-BR'; // Define o idioma para português do Brasil

    let final_transcript = "";
    let interim_transcript = "";

    // Manipulador de evento quando o reconhecimento começa
    recognition .onstart = () => {
        status.style.display = 'block';
        status.textContent = "Escutando...";
    };

    // Manipulador de evento quando o reconhecimento retorna resultados
    recognition.onresult = (event) => {
        interim_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                final_transcript += transcript + ' ';
                content.textContent = final_transcript;
                takeCommand(final_transcript.toLowerCase());
            } else {
                interim_transcript += transcript;
                interim.textContent = interim_transcript;
            }
        }
    };

    // Manipulador de evento quando o reconhecimento é finalizado
    recognition.onend = () => {
        status.style.display = 'none';
        interim.textContent = '';
    };

    // Iniciar reconhecimento de voz
    btnStart.addEventListener('click', () => {
        final_transcript = '';
        recognition.start();
    });

    // Parar reconhecimento de voz
    btnStop.addEventListener('click', () => {
        recognition.stop();
    });
} else {
    alert("Desculpe, seu navegador não suporta reconhecimento de voz.");
}

function takeCommand(message) {
    try {
        if (message.includes('hey') || message.includes('olá')) {
            speak("Olá, Senhor! Como posso ajudar você?");
        } else if (message.includes("abrir google")) {
            window.open("https://google.com", "_blank");
            speak("Abrindo Google...");
        } else if (message.includes("abrir youtube")) {
            window.open("https://youtube.com", "_blank");
            speak("Abrindo YouTube...");
        } else if (message.includes("abrir facebook")) {
            window.open("https://facebook.com", "_blank");
            speak("Abrindo Facebook...");
        } else if (message.includes('o que é') || message.includes('quem é') || message.includes('o que são')) {
            const query = message.replace(/o que é |quem é |o que são /, "");
            window.open(`https://www.google.com/search?q=${query}`, "_blank");
            speak(`Isso é o que encontrei na internet sobre ${query}.`);
        } else if (message.includes('wikipedia')) {
            const query = message.replace("wikipedia", "").trim();
            window.open(`https://pt.wikipedia.org/wiki/${query}`, "_blank");
            speak(`Isso é o que encontrei na Wikipedia sobre ${query}.`);
        } else if (message.includes('hora')) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            speak(`A hora atual é ${time}.`);
        } else if (message.includes('data')) {
            const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
            speak(`A data de hoje é ${date}.`);
        } else if (message.includes('calculadora')) {
            window.open('Calculator:///');
            speak("Abrindo a calculadora.");
        } else {
            const query = message.replace(" ", "+");
            window.open(`https://www.google.com/search?q=${query}`, "_blank");
            speak(`Encontrei algumas informações sobre ${message} no Google.`);
        }
    } catch (error) {
        console.error("Erro ao processar o comando:", error);
        speak("Desculpe, ocorreu um erro ao processar seu comando.");
    }
}

// app.js

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
            console.log('Service Worker registrado com sucesso:', registration);
            askNotificationPermission();
        })
        .catch(function(error) {
            console.error('Falha ao registrar o Service Worker:', error);
        });
}

function askNotificationPermission() {
    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            console.log('Permissão para notificações concedida.');
            subscribeUserToPush();
        } else {
            console.log('Permissão para notificações negada.');
        }
    });
}

function subscribeUserToPush() {
    navigator.serviceWorker.ready.then(function(registration) {
        const applicationServerKey = urlB64ToUint8Array('<YOUR_PUBLIC_VAPID_KEY>');
        registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        }).then(function(subscription) {
            console.log('Usuário inscrito para notificações push:', subscription);
            // Aqui você pode enviar a inscrição para o seu servidor para enviar notificações
        }).catch(function(error) {
            console.error('Falha ao se inscrever para notificações push:', error);
        });
    });
}

// Função para converter a chave VAPID
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}