'use strict';

// Required libraries
const ibm = require('ibm-cos-sdk');

function registrarErro(erro) {
    console.log(`ERRO: ${erro.code} - ${erro.message}\n`);
}

// Recupera a lista de depósitos disponíveis
function getDepositos() {
    console.log('Recuperando a lista de depósitos');
    return cos.listBuckets()
    .promise()
    .then((dados) => {
        if (dados.Buckets != null) {
            for (var i = 0; i < dados.Buckets.length; i++) {
                console.log(`Nome do depósito: ${dados.Buckets[i].Name}`);
            }
        }
    })
    .catch((registrarErro));
}

// Recupera a lista de conteúdos de um depósito
function getConteudosDoDeposito(nomeDoDeposito) {
    console.log(`Recuperando os conteúdos do depósito: ${nomeDoDeposito}`);
    return cos.listObjects(
        {Bucket: nomeDoDeposito},
    ).promise()
    .then((dados) => {
        if (dados != null && dados.Contents != null) {
            for (var i = 0; i < dados.Contents.length; i++) {
                var chaveDoItem = dados.Contents[i].Key;
                var tamanhoDoItem = dados.Contents[i].Size;
                console.log(`Item: ${chaveDoItem} (${tamanhoDoItem} bytes).`)
            }
        }
    })
    .catch(registrarErro);
}

// Recupera um item específico do depósito
function getItem(nomeDoDeposito, nomeDoItem, funcao) {
    return cos.getObject({
        Bucket: nomeDoDeposito, 
        Key: nomeDoItem
    }).promise()
    .then((dados) => funcao(dados))
    .catch(registrarErro);
}

// Cria um novo arquivo de texto
function enviarItem(nomeDoDeposito, nomeDoItem, textoDoArquivo) {
    return cos.putObject({
        Bucket: nomeDoDeposito, 
        Key: nomeDoItem, 
        Body: textoDoArquivo
    }).promise()
    .then(() => {
    })
    .catch(registrarErro);
}

// Exclui um item
function excluirItem(nomeDoDeposito, nomeDoItem) {
    return cos.deleteObject({
        Bucket: nomeDoDeposito,
        Key: nomeDoItem
    }).promise()
    .then(() => {
        console.log(`O item ${nomeDoItem} foi excluído!`);
    })
    .catch(registrarErro);
}

// Constantes para os valores do IBM COS
const COS_ENDPOINT = "s3.us-south.cloud-object-storage.appdomain.cloud";  // example: s3.us-south.cloud-object-storage.appdomain.cloud
const COS_API_KEY_ID = "FRmmvszlrJF0ekW6NOPMZDbTiEYljtaa0bqovO4I4kjp";  // example: xxxd12V2QHXbjaM99G9tWyYDgF_0gYdlQ8aWALIQxXx4
const COS_AUTH_ENDPOINT = "https://iam.cloud.ibm.com/identity/token";
const COS_SERVICE_CRN = "crn:v1:bluemix:public:cloud-object-storage:global:a/bc91b437b42b4a0b800ce58ef7b89485:c5cece0e-72e1-4110-b57b-b314ef0f2f07::"; // example: crn:v1:bluemix:public:cloud-object-storage:global:a/xx999cd94a0dda86fd8eff3191349999:9999b05b-x999-4917-xxxx-9d5b326a1111::
const COS_STORAGE_CLASS = "us-south-standard"; // example: us-south-standard

// Iniciar a biblioteca do IBM COS
var config = {
    endpoint: COS_ENDPOINT,
    apiKeyId: COS_API_KEY_ID,
    ibmAuthEndpoint: COS_AUTH_ENDPOINT,
    serviceInstanceId: COS_SERVICE_CRN,
};

var cos = new ibm.S3(config);

module.exports = {
    registrarErro,
    getDepositos,
    getConteudosDoDeposito,
    getItem,
    enviarItem,
    excluirItem
}