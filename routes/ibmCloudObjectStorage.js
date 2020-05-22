var express = require('express');
var roteador = express.Router();

const cos = require("../lib/IBMCloudObjectStorage");

roteador.post('/guardar', function (req, res, next) {
    var pedido = {
        id: Math.floor(Math.random()*1000000000),
        cliente: req.body.cliente,
        situacao: "fazendo",
        itens: [],
    }

    var quantItens = 0;
    var vetorPedido = req.body.pedido.split(", ");
    // retirar espaço do primeiro suco do pedido
    vetorPedido[0] = vetorPedido[0].substring(1);

    vetorPedido.forEach(elemento => {
        var vetorItem = elemento.split(" com ");
        var item = {
            suco: vetorItem[0],
            adicional: vetorItem[1],
        }
        pedido.itens[quantItens] = item;

        quantItens++;
    });
    
    cos.enviarItem("bd-sucosaude-cos-standard", pedido.id + ".json", JSON.stringify(pedido));

    res.json({
        "status": "OK",
        "data": pedido,
    });
});

roteador.get('/preco', function (req, res, next) {
    var pedido = req.query.pedido;
    var arquivo;
    var preco = 0;

    cos.getItem("bd-sucosaude-cos-standard", "cardapio.json", (dados) => {
        if (dados != null)
            arquivo = Buffer.from(dados.Body).toString();
    }).then(() => {
        var cardapio = JSON.parse(arquivo);
        pedido.itens.forEach(item => {
            cardapio.sucos.nomes.forEach((suco, indice) => {
                if (suco == item.suco)
                    preco += cardapio.sucos.valores[indice];
            });
            cardapio.adicionais.nomes.forEach((adicional, indice) => {
                if (adicional == item.adicional)
                    preco += cardapio.adicionais.valores[indice];
            });
        });
        res.json({
            "status": "OK",
            "data": preco,
        });
    }).catch(() => {
        res.json({
            "status": "ERRO",
            "data": "Cardápio indisponível",
        });
    });
});

module.exports = roteador;