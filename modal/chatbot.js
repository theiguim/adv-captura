document.addEventListener('DOMContentLoaded', () => {
    const chatIcon = document.getElementById('chat-icon');
    const chatModal = document.getElementById('chat-modal');
    const chatHeader = document.querySelector('.chat-header');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatMessagesContainer = document.getElementById('chat-messages');

    // URL do seu backend. **MUDAR PARA A URL DO SEU BACKEND!**
    const BACKEND_URL = 'https://api-consulta-processos-h2kw.onrender.com/chat'; // Exemplo: ajuste para a sua rota de chat

    // --- Funções Auxiliares ---

    // Gera um UUID (Identificador Universalmente Único) simples
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Gerencia o Session ID
    function getSessionId() {
        let sessionId = localStorage.getItem('chatSessionId');
        if (!sessionId) {
            sessionId = generateUUID();
            localStorage.setItem('chatSessionId', sessionId);
            console.log('Novo Session ID gerado e salvo:', sessionId);
        } else {
            console.log('Session ID existente carregado:', sessionId);
        }
        return sessionId;
    }

    // Adiciona uma mensagem ao chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessagesContainer.appendChild(messageDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Rola para o final
    }

    window.addEventListener('resize', () => {
        // Apenas garante que a rolagem aconteça se o modal estiver ativo e o teclado abriu/fechou
        if (chatModal.classList.contains('active')) {
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
    });

    // --- Lógica de Interação ---

    // Abrir o modal
    chatIcon.addEventListener('click', () => {
        chatModal.classList.add('active');
        // Ao abrir, garante que o sessionId esteja inicializado
        getSessionId();
    });

    // Fechar o modal
    const closeChatModal = () => {
        chatModal.classList.remove('active');
        body.classList.remove('chat-modal-open');
        chatInput.blur();
    };

    // Fechar o modal (botão interno)
    closeChatBtn.addEventListener('click', closeChatModal);

    // Fechar modal ao clicar fora dele
    chatModal.addEventListener('click', (event) => {
        if (event.target === chatModal) {
            closeChatModal();
        }
    });

    // *** NOVO: Fechar modal ao clicar no cabeçalho ***
    chatHeader.addEventListener('click', closeChatModal);

    // Enviar mensagem
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        addMessage(message, 'user');
        chatInput.value = ''; // Limpa o input

        // Simula um "digitando..." enquanto espera a resposta
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
        typingIndicator.innerHTML = '<p>Digitando...</p>';
        chatMessagesContainer.appendChild(typingIndicator);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

        try {
            const sessionId = getSessionId(); // Garante que temos o sessionId
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mensagem: message, sessionId: sessionId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.resposta || 'Erro ao comunicar com o servidor.');
            }

            const data = await response.json();

            // Remove o indicador de digitação
            chatMessagesContainer.removeChild(typingIndicator);
            addMessage(data.resposta, 'bot');

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            // Remove o indicador de digitação mesmo em caso de erro
            if (chatMessagesContainer.contains(typingIndicator)) {
                chatMessagesContainer.removeChild(typingIndicator);
            }
            addMessage('Ops! Houve um erro ao processar sua solicitação. Tente novamente mais tarde.', 'bot');
        }
    }

    sendChatBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Inicializa a primeira mensagem do bot ao carregar o modal
    // (já está no HTML, mas você pode adicionar mais dinamicamente se quiser)
    // chatMessagesContainer.innerHTML = '<div class="message bot-message"><p>Olá! Sou seu assistente jurídico. Em que posso ajudar?</p></div>';
});