const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const chaveWatson = 'eOuz6snI3I7TMuHH3slMCNLB4-PTfTRf605LQpEriEl4';

// configuração para o IBM Watson Assistant
const assistente = new AssistantV1({
    url: 'https://gateway.watsonplatform.net/assistant/api',
    version: '2020-01-04',
    authenticator: new IamAuthenticator({
        apikey: chaveWatson
    })
});

module.exports = {assistente};