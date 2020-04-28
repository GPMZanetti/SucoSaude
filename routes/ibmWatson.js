var express = require('express');
var roteador = express.Router();

// recupera configurações de acesso aos serviços IBM Watson
const ibmWatson = require('../lib/credenciaisIBMWatson');
const idWatson = '8db28d5c-ef5c-4ad5-837a-ff8998fa245c';

// post para o serviço: IBM Watson Assistant
roteador.post('/assistente', function (req, res, next) {
  // recupera mensagem de texto e contexto da conversa
  var { texto, contextoDoDialogo } = req.body;
  contexto = JSON.parse(contextoDoDialogo);

  // constrói JSON para envio dos dados ao serviço
  const parametros = {
    input: { text: texto },
    workspaceId: idWatson,
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
