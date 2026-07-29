const asaas = require("./src/services/AsaasApi");

(async () => {

    const resposta =
        await asaas.receberWebhook({

            event: "PAYMENT_RECEIVED",

            payment: "123456"

        });

    console.log(resposta);

})();