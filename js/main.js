// main.js - Script principal para o frontend doDaimond

document.addEventListener('DOMContentLoaded', function() {
    // Navegação Mobile
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }
    
    // Fechar menu ao clicar em um link
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    });
    
    // Animação de scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
            }
        });
    };
    
    // Iniciar animações
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    
    // Terminal interativo na página de demonstração
    const terminalBody = document.getElementById('terminal-body');
    const terminalOutput = document.getElementById('terminal-output');
    const currentInput = document.getElementById('current-input');
    const cursor = document.getElementById('cursor');
    const demoControls = document.querySelectorAll('.demo-control');
    
    if (terminalBody && demoControls.length > 0) {
        // Simulação de digitação
        const typeWriter = (text, element, speed = 50) => {
            let i = 0;
            element.textContent = '';
            cursor.style.display = 'inline-block';
            
            const typing = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typing);
                    setTimeout(() => {
                        respondToCommand(text);
                    }, 500);
                }
            }, speed);
        };
        
        // Respostas pré-definidas para comandos
        const responses = {
            'Olá,Daimond!': 'Olá! Sou oDaimond, seu assistente de IA. Como posso ajudar você hoje?',
            'Quais são suas capacidades?': 'Posso ajudar com pesquisa e documentação, análise de dados, desenvolvimento web, redação de conteúdo, geração de imagens e muito mais. Basta me dizer o que você precisa!',
            'Crie um gráfico de dados': 'Claro! Aqui está um gráfico de exemplo mostrando o crescimento de tecnologias de IA nos últimos 5 anos. Posso personalizar este gráfico com seus dados específicos ou criar outros tipos de visualizações conforme sua necessidade.',
            'Pesquise sobre IA generativa': 'Realizando pesquisa sobre IA generativa... A IA generativa é uma tecnologia que cria conteúdo novo como texto, imagens, música e código. Exemplos incluem GPT, DALL-E e Midjourney. Essa tecnologia está revolucionando diversos setores como arte, design, desenvolvimento de software e marketing.',
            'Desenvolva um site para mim': 'Posso desenvolver um site personalizado para você! Precisarei de informações sobre o propósito do site, público-alvo, funcionalidades desejadas e preferências de design. Posso criar desde landing pages simples até aplicações web mais complexas.',
            'Gere uma imagem de um gato': 'Gerando imagem de um gato... Pronto! Criei uma imagem de um gato fofo com pelo laranja sentado em uma janela observando o pôr do sol. Posso ajustar detalhes como cor, posição ou cenário conforme sua preferência.'
        };
        
        // Responder ao comando
        const respondToCommand = (command) => {
            const response = responses[command] || 'Desculpe, não entendi esse comando. Pode tentar novamente?';
            
            // Criar nova linha para resposta
            const newOutput = document.createElement('div');
            newOutput.className = 'terminal-output';
            newOutput.textContent = response;
            
            // Adicionar resposta ao terminal
            terminalBody.appendChild(newOutput);
            
            // Criar nova linha para próximo comando
            setTimeout(() => {
                const newLine = document.createElement('div');
                newLine.className = 'terminal-line';
                
                const newPrompt = document.createElement('span');
                newPrompt.className = 'terminal-prompt';
                newPrompt.textContent = 'usuário@manus:~$';
                
                const newInput = document.createElement('span');
                newInput.className = 'terminal-input';
                newInput.id = 'current-input';
                newInput.textContent = '';
                
                const newCursor = document.createElement('span');
                newCursor.className = 'terminal-cursor';
                newCursor.id = 'cursor';
                
                newLine.appendChild(newPrompt);
                newLine.appendChild(newInput);
                newLine.appendChild(newCursor);
                
                terminalBody.appendChild(newLine);
                
                // Atualizar referências
                currentInput = newInput;
                cursor = newCursor;
                
                // Scroll para o final do terminal
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }, 500);
        };
        
        // Adicionar eventos aos botões de demonstração
        demoControls.forEach(button => {
            button.addEventListener('click', function() {
                const command = this.getAttribute('data-command');
                typeWriter(command, currentInput);
            });
        });
    }
    
    // FAQ Accordion na página de demonstração
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.fa-chevron-down');
            
            // Inicialmente, ocultar todas as respostas
            answer.style.display = 'none';
            
            question.addEventListener('click', function() {
                // Toggle da resposta
                if (answer.style.display === 'none') {
                    answer.style.display = 'block';
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    answer.style.display = 'none';
                    icon.style.transform = 'rotate(0)';
                }
            });
        });
    }
    
    // Adicionar estilos CSS adicionais para FAQ
    const style = document.createElement('style');
    style.textContent = `
        .faq-container {
            margin-top: 2rem;
        }
        
        .faq-item {
            margin-bottom: 1rem;
            border: 1px solid #E5E7EB;
            border-radius: 0.5rem;
            overflow: hidden;
        }
        
        .faq-question {
            padding: 1.5rem;
            background-color: #F9FAFB;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .faq-question:hover {
            background-color: #F3F4F6;
        }
        
        .faq-question h3 {
            margin: 0;
            font-size: 1.125rem;
        }
        
        .faq-question i {
            transition: transform 0.3s ease;
        }
        
        .faq-answer {
            padding: 0 1.5rem 1.5rem;
            background-color: #F9FAFB;
        }
        
        .faq-answer p {
            margin: 0;
        }
    `;
    document.head.appendChild(style);
});
