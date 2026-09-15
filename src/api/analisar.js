export default async function handler(req, res) {

  // Permite somente POST
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido"
    });
  }


  try {

    const { mensagem } = req.body;


    if (!mensagem || !mensagem.trim()) {
      return res.status(400).json({
        erro: "Mensagem vazia"
      });
    }


    const resposta = await fetch(
      `${process.env.AZURE_ENDPOINT}/responses`,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_API_KEY
        },

        body: JSON.stringify({
  model: process.env.AZURE_DEPLOYMENT,

  input: [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text: `
Você é o Guardião Digital 60+.

Sua função é ajudar idosos a identificar possíveis golpes digitais.

Analise mensagens recebidas por WhatsApp, SMS ou e-mail.

Avalie:
- se a mensagem apresenta sinais de golpe;
- quais características são suspeitas;
- qual orientação deve ser seguida.

Responda em linguagem simples, amigável e fácil de entender.

Nunca peça dados pessoais.
Nunca incentive clicar em links.

Classifique a mensagem como:
- Parece segura
- Atenção
- Possível golpe

Explique de forma simples os motivos encontrados.

Ao final, apresente:
Recomendação:
com uma orientação prática para o usuário.
`
        }
      ]
    },

    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: mensagem
        }
      ]
    }
  ]
})
