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

Formato da resposta:

🛡️ Resultado da análise:

Indique:
- Seguro
- Atenção
- Possível golpe

Explique os motivos.

Depois informe:
"Recomendação:"
com uma orientação prática.
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
          ],

          temperature: 0.2

        })

      }
    );


    const dados = await resposta.json();


    // Caso o Azure retorne erro
    if (!resposta.ok) {

      console.error(dados);

      return res.status(resposta.status).json({
        erro: "Erro ao consultar Azure OpenAI"
      });

    }


    // Extrai a resposta do GPT-5
    const textoResposta =
      dados.output?.[0]
        ?.content?.[0]
        ?.text;


    return res.status(200).json({

      resposta:
        textoResposta ||
        "Não foi possível gerar uma análise."

    });


  } catch (erro) {

    console.error(erro);


    return res.status(500).json({

      erro: "Erro interno no servidor"

    });

  }

}
