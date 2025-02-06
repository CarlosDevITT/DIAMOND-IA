// Função para enviar uma solicitação à Blackbox
const enviarSolicitacao = async (prompt) => {
    const url = 'https://api.blackbox.ai/api/chat';
    const data = {
        messages: [
            {
                content: prompt,
                role: 'user'
            }
        ],
        model: 'deepseek-ai/DeepSeek-R1', // Modelo a ser utilizado
        max_tokens: '1024'
    };

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer SUA_CHAVE_API_AQUI' // Substitua pela sua chave API
        }
    };

    try {
        const response = await axios.post(url, data, config);
        exibirResposta(response.data.result);
    } catch (error) {
        console.error("Erro ao chamar a Blackbox:", error);
    }
};

// Função para exibir a resposta na interface
const exibirResposta = (resposta) => {
    const respostasDiv = document.getElementById('respostas');
    const respostaElement = document.createElement('p');
    respostaElement.textContent = resposta;
    respostasDiv.appendChild(respostaElement);
};

// Adiciona um evento ao botão de enviar
document.getElementById('sendRequest').addEventListener('click', () => {
    const userInput = document.getElementById('userInput').value;
    if (userInput) {
        enviarSolicitacao(userInput);
        document.getElementById('userInput').value = ''; // Limpa o campo de entrada
    }
});