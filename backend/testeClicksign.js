const ClicksignApi = require("./src/services/ClicksignApi");

async function main() {

  console.log(

    await ClicksignApi.listarDocumentos()

  );

}

main();