// variável para controlar o contexto do diálogo
var contextoDoDialogo = '{}';

function enviarMensagemAoAssistente() {
    // recupera mensagem digitada pelo usuário
    var mensagemDeTexto = document.formularioBatePapo.mensagemDeTexto.value;
    var batePapo = document.getElementById('bate-papo');

    // na primeira chamada (boas vindas) mensagemDeTexto é undefined
    // então define como vazio para dar erro na API
    if (mensagemDeTexto === undefined || mensagemDeTexto === '')
        mensagemDeTexto = '';
    else // exibe a mensagem na tela
        batePapo.innerHTML += '<p>Você -> ' + mensagemDeTexto + '</p>';
    
    // limpa o campo de entrada
    document.formularioBatePapo.mensagemDeTexto.value = '';

    // post para o serviço Watson Assistant
    $.post("/bate-papo/assistente",
        { texto: mensagemDeTexto, contextoDoDialogo },

        // tratamento de sucesso do processamento do post
        function (dadosRetornados, statusRequest) {
            // se ocorreu algum erro no processamento da API
            if (dadosRetornados.status === 'ERRO')
                alert(dadosRetornados.data);
            // caso os dados tenham retornado com sucesso
            else {
                // exibe retorno da API e recupera o contexto para o próximo diálogo
                dadosRetornados.data.result.output.text.forEach(elemento => {
                    batePapo.innerHTML += '<p>Laranjinha -> ' + elemento + '</p>';
                });
                contextoDoDialogo = JSON.stringify(dadosRetornados.data.result.context);
            }
        }
    )

    // tratamento de erro do post
    .fail(function(dadosRetornados) {
        alert('Erro: ' + dadosRetornados.status + ' ' + dadosRetornados.statusText);
    });
}

// envia mensagem quando o usuário pressionar Enter
$(document).keypress(
    function (evento) {
        if (evento.which == '13') {
            evento.preventDefault();
            enviarMensagemAoAssistente();
        }
    }
);

// após carregar todos os recursos da página, faz post para o serviço para exibir mensagem de boas vindas do bate-papo
$(document).ready(function () {
    enviarMensagemAoAssistente();
});