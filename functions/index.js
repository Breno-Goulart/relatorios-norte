const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");

initializeApp();
const db = getFirestore();

exports.catalogarPublicador = onDocumentCreated("relatorios/{reportId}", async (event) => {
    const data = event.data.data();
    const nomeCorrigido = data.nome;
    const nomeBusca = data.nome_busca;

    const pubRef = db.collection("publicadores");
    const snapshot = await pubRef.where("nome", "==", nomeCorrigido).limit(1).get();

    if (snapshot.empty) {
        await pubRef.add({
            nome: nomeCorrigido,
            nome_busca: nomeBusca,
            tipo_padrao: data.tipo,
            dataCriacao: FieldValue.serverTimestamp()
        });
        console.log(`Novo publicador cadastrado: ${nomeCorrigido}`);
    }
    return null;
});