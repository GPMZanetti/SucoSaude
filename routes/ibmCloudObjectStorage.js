var express = require('express');
var roteador = express.Router();
var ibmPushNotifications = require('ibm-push-notifications');

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

    var notificacoesPush = new PushNotificationsApiKey(PushNotifications.Region.US_SOUTH, "30251d6a-8a76-49f9-ac4c-77c4db56791f", "-rMewhpqu3wmplNZDWm-I3B7AT7SNehhM8-jD6JdynqP");
 
    // Get authtoken
    notificacoesPush.getAuthToken(function(hastoken,token){
        console.log(hastoken, token);
    });

    var mensagem = PushMessageBuilder.Message.alert("O suco está pronto")
        .url("www.ibm.com").build();
    /*var firefox = PushMessageBuilder.FirefoxWeb.title("IBM")
        .iconUrl("http://www.iconsdb.com/icons/preview/purple/message-2-xxl.png")
        .timeToLive(1.0).payload({ "alert" : "O suco está pronto" }).build();
    var configuracoes = PushMessageBuilder.Settings.firefoxWeb(firefox).build();
    var exemploDeNotificacao =  Notification.message(mensagem).settings(configuracoes).build();
    notificacoesPush.send(exemploDeNotificacao, function(error, response, body) {
        console.log("Error: " + error);
        console.log("Response: " + JSON.stringify(response));
        console.log("Body: " + body);
    });*/
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