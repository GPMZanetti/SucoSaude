var express = require('express');
var roteador = express.Router();

// recupera configurações de acesso aos serviços IBM Watson
const ibmWatson = require('../lib/credenciaisIBMWatson');
const idHabilidade = 'caa2f366-79b5-432f-8152-8569d6195d99';

// post para o serviço: IBM Watson Assistant
roteador.post('/assistente', function (req, res, next) {
  // recupera mensagem de texto e contexto da conversa
  var { texto, contextoDoDialogo } = req.body;
  contexto = JSON.parse(contextoDoDialogo);

  // constrói JSON para envio dos dados ao serviço
  const parametros = {
    input: { text: texto },
    workspaceId: idHabilidade,
    context: contexto
  };

  // envia os dados ao serviço e retorna mensagem
  ibmWatson.assistente.message(
    parametros,
    function (erro, resposta) {
      if (erro)
        res.json({ status: 'ERRO', data: erro.toString() });
      else
        res.json({ status: 'OK', data: resposta });
    }
  );
});

module.exports = roteador;
