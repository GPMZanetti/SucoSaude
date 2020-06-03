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

    console.log("1");
    //var notificacoesPush = new ibmPushNotifications.PushNotificationsWithApiKey(ibmPushNotifications.PushNotifications.Region.US_SOUTH, "30251d6a-8a76-49f9-ac4c-77c4db56791f", "-rMewhpqu3wmplNZDWm-I3B7AT7SNehhM8-jD6JdynqP");
 
    var notificacoesPush = new ibmPushNotifications.PushNotifications(ibmPushNotifications.PushNotifications.Region.US_SOUTH, "30251d6a-8a76-49f9-ac4c-77c4db56791f", "8235227e-f163-4b12-a1c6-46754f67bc04");

    /*console.log("1");
    // Get authtoken
    notificacoesPush.getAuthToken(function(hastoken,token){
        console.log(hastoken, token);
    });*/

    console.log("1");

    var mensagem = ibmPushNotifications.PushMessageBuilder.Message.alert("O suco está pronto")
        .url("www.ibm.com").build();
        console.log("1");
    var firefox = ibmPushNotifications.PushMessageBuilder.FirefoxWeb.title("IBM")
        .iconUrl("http://www.iconsdb.com/icons/preview/purple/message-2-xxl.png")
        .timeToLive(1.0).payload({ "alert" : "O suco está pronto" }).build();
        console.log("1");
    var configuracoes = ibmPushNotifications.PushMessageBuilder.Settings.firefoxWeb(firefox).build();
    console.log("1");
    var exemploDeNotificacao =  Notification.message(mensagem).settings(configuracoes).build();
    console.log("1");
    notificacoesPush.send(exemploDeNotificacao, function(error, response, body) {
        console.log("Error: " + error);
        console.log("Response: " + JSON.stringify(response));
        console.log("Body: " + body);
    });
    console.log("1");
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