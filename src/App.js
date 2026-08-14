import { useEffect, useState } from "react";
import "./App.css";

import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";

function App() {
  const [tela, setTela] = useState(0);

  // =====================================================
  // USUÁRIO
  // =====================================================

  const [nomeUsuario, setNomeUsuario] = useState("");

  const [nomeCadastro, setNomeCadastro] = useState("");
  const [emailCadastro, setEmailCadastro] = useState("");
  const [telefoneCadastro, setTelefoneCadastro] = useState("");
  const [senhaCadastro, setSenhaCadastro] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [usuarioCadastrado, setUsuarioCadastrado] = useState(null);

  const [emailLogin, setEmailLogin] = useState("");
  const [senhaLogin, setSenhaLogin] = useState("");

  const [emailRecuperacao, setEmailRecuperacao] = useState("");

  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);

  // =====================================================
  // ANÁLISE
  // =====================================================

  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState([]);

  // =====================================================
  // ESTUDOS
  // =====================================================

  const [estudoSelecionado, setEstudoSelecionado] =
    useState(null);

  // =====================================================
  // CONTATOS
  // =====================================================

  const [contatos, setContatos] = useState([]);

  const [novoNome, setNovoNome] = useState("");
  const [novaRelacao, setNovaRelacao] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");

  // =====================================================
  // NAVEGAÇÃO
  // =====================================================

  function irPara(numero) {
    setTela(numero);
  }

  // =====================================================
  // OBSERVAR LOGIN
  // =====================================================

  useEffect(() => {
    const cancelar = onAuthStateChanged(
      auth,
      async (usuario) => {
        setUsuarioAtual(usuario);

        if (usuario) {
          const nome =
            usuario.displayName || "Usuário";

          setNomeUsuario(nome);
          setEmailLogin(usuario.email || "");

          try {
            const usuarioRef = doc(
              db,
              "usuarios",
              usuario.uid
            );

            const usuarioSnapshot =
              await getDoc(usuarioRef);

            if (usuarioSnapshot.exists()) {
              const dados =
                usuarioSnapshot.data();

              setUsuarioCadastrado({
                nome: dados.nome || nome,
                email:
                  dados.email ||
                  usuario.email ||
                  "",
                telefone:
                  dados.telefone || "",
              });

              setNomeUsuario(
                dados.nome || nome
              );
            }

            // CONTATOS
            const contatosRef = collection(
              db,
              "usuarios",
              usuario.uid,
              "contatos"
            );

            const contatosSnapshot =
              await getDocs(contatosRef);

            setContatos(
              contatosSnapshot.docs.map(
                (item) => ({
                  id: item.id,
                  ...item.data(),
                })
              )
            );

            // HISTÓRICO
            const historicoRef =
              collection(
                db,
                "usuarios",
                usuario.uid,
                "historico"
              );

            const consulta = query(
              historicoRef,
              orderBy(
                "criadoEm",
                "desc"
              )
            );

            const historicoSnapshot =
              await getDocs(consulta);

            setHistorico(
              historicoSnapshot.docs.map(
                (item) => ({
                  id: item.id,
                  ...item.data(),
                })
              )
            );
          } catch (erro) {
            console.error(
              "Erro ao carregar dados:",
              erro
            );
          }
        } else {
          setNomeUsuario("");
          setUsuarioCadastrado(null);
          setContatos([]);
          setHistorico([]);
        }

        setCarregandoUsuario(false);
      }
    );

    return () => cancelar();
  }, []);

  // =====================================================
  // CRIAR CONTA
  // =====================================================

  async function criarConta() {
    const nome = nomeCadastro.trim();
    const email = emailCadastro
      .trim()
      .toLowerCase();
    const telefone =
      telefoneCadastro.trim();

    if (!nome) {
      alert("Digite seu nome.");
      return;
    }

    if (!email) {
      alert("Digite seu e-mail.");
      return;
    }

    if (!telefone) {
      alert("Digite seu telefone.");
      return;
    }

    if (senhaCadastro.length < 6) {
      alert(
        "A senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    if (senhaCadastro !== confirmarSenha) {
      alert("As senhas não são iguais.");
      return;
    }

    try {
      const credencial =
        await createUserWithEmailAndPassword(
          auth,
          email,
          senhaCadastro
        );

      const usuario = credencial.user;

      await updateProfile(usuario, {
        displayName: nome,
      });

      await setDoc(
        doc(
          db,
          "usuarios",
          usuario.uid
        ),
        {
          nome,
          email,
          telefone,
          criadoEm:
            new Date().toISOString(),
        }
      );

      setUsuarioAtual(usuario);

      setUsuarioCadastrado({
        nome,
        email,
        telefone,
      });

      setNomeUsuario(nome);

      setContatos([]);
      setHistorico([]);

      setNomeCadastro("");
      setEmailCadastro("");
      setTelefoneCadastro("");
      setSenhaCadastro("");
      setConfirmarSenha("");

      alert("Conta criada com sucesso!");

      setTela(6);
    } catch (erro) {
      console.error(erro);

      if (
        erro.code ===
        "auth/email-already-in-use"
      ) {
        alert(
          "Este e-mail já está cadastrado."
        );
      } else if (
        erro.code ===
        "auth/invalid-email"
      ) {
        alert("Digite um e-mail válido.");
      } else if (
        erro.code ===
        "auth/weak-password"
      ) {
        alert(
          "A senha precisa ter pelo menos 6 caracteres."
        );
      } else {
        alert(
          "Não foi possível criar a conta."
        );
      }
    }
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async function fazerLogin() {
    const email = emailLogin
      .trim()
      .toLowerCase();

    if (!email) {
      alert("Digite seu e-mail.");
      return;
    }

    if (!senhaLogin) {
      alert("Digite sua senha.");
      return;
    }

    try {
      const credencial =
        await signInWithEmailAndPassword(
          auth,
          email,
          senhaLogin
        );

      const usuario = credencial.user;

      setUsuarioAtual(usuario);

      setNomeUsuario(
        usuario.displayName ||
          "Usuário"
      );

      setSenhaLogin("");

      setTela(6);
    } catch (erro) {
      console.error(erro);

      if (
        erro.code ===
          "auth/invalid-credential" ||
        erro.code ===
          "auth/wrong-password" ||
        erro.code ===
          "auth/user-not-found"
      ) {
        alert(
          "E-mail ou senha incorretos."
        );
      } else {
        alert(
          "Não foi possível fazer login."
        );
      }
    }
  }

  // =====================================================
  // RECUPERAÇÃO DE SENHA
  // =====================================================

  async function recuperarSenha() {
    const email = emailRecuperacao
      .trim()
      .toLowerCase();

    if (!email) {
      alert("Digite seu e-mail.");
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email
      );

      alert(
        "Se esse e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha."
      );

      setEmailRecuperacao("");
      setTela(3);
    } catch (erro) {
      console.error(erro);

      alert(
        "Não foi possível enviar o e-mail de recuperação."
      );
    }
  }

  // =====================================================
  // SAIR
  // =====================================================

  async function fazerLogout() {
    try {
      await signOut(auth);

      setTela(3);
      setEmailLogin("");
      setSenhaLogin("");
      setNomeUsuario("");
      setUsuarioAtual(null);
    } catch (erro) {
      console.error(erro);

      alert(
        "Não foi possível sair da conta."
      );
    }
  }

  // =====================================================
  // ADICIONAR CONTATO
  // =====================================================

  async function adicionarContato() {
    if (!usuarioAtual) {
      alert(
        "Faça login para adicionar contatos."
      );
      setTela(3);
      return;
    }

    if (!novoNome.trim()) {
      alert(
        "Digite o nome do contato."
      );
      return;
    }

    if (!novaRelacao.trim()) {
      alert(
        "Digite o parentesco ou relação."
      );
      return;
    }

    if (!novoTelefone.trim()) {
      alert(
        "Digite o número de telefone."
      );
      return;
    }

    const novoContato = {
      nome: novoNome.trim(),
      relacao: novaRelacao.trim(),
      telefone: novoTelefone.trim(),
      emoji: "👤",
      criadoEm:
        new Date().toISOString(),
    };

    try {
      const contatosRef = collection(
        db,
        "usuarios",
        usuarioAtual.uid,
        "contatos"
      );

      const documento =
        await addDoc(
          contatosRef,
          novoContato
        );

      setContatos((anteriores) => [
        ...anteriores,
        {
          id: documento.id,
          ...novoContato,
        },
      ]);

      setNovoNome("");
      setNovaRelacao("");
      setNovoTelefone("");

      setTela(11);
    } catch (erro) {
      console.error(erro);

      alert(
        "Não foi possível salvar o contato."
      );
    }
  }

  // =====================================================
  // EXCLUIR CONTATO
  // =====================================================

  async function excluirContato(
    id,
    nome
  ) {
    const confirmar =
      window.confirm(
        `Deseja realmente excluir o contato ${nome}?`
      );

    if (!confirmar) return;

    if (!usuarioAtual) {
      alert("Faça login novamente.");
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "usuarios",
          usuarioAtual.uid,
          "contatos",
          id
        )
      );

      setContatos((anteriores) =>
        anteriores.filter(
          (contato) =>
            contato.id !== id
        )
      );
    } catch (erro) {
      console.error(erro);

      alert(
        "Não foi possível excluir o contato."
      );
    }
  }

  // =====================================================
  // ANALISAR MENSAGEM
  // =====================================================

  async function analisarMensagem() {
    if (!mensagem.trim()) {
      alert(
        "Digite ou cole uma mensagem para analisar."
      );
      return;
    }

    const novaAnalise = {
      mensagem: mensagem.trim(),

      resultado:
        "Possível golpe detectado",

      data: new Date().toLocaleString(
        "pt-BR"
      ),

      motivos: [
        "Link desconhecido ou suspeito",
        "Linguagem de urgência",
        "Possível solicitação de dados pessoais",
        "Tentativa de induzir a vítima a agir rapidamente",
      ],

      criadoEm:
        new Date().toISOString(),
    };

    const temporaria = {
      id: Date.now(),
      ...novaAnalise,
    };

    setHistorico((anteriores) => [
      temporaria,
      ...anteriores,
    ]);

    if (usuarioAtual) {
      try {
        const historicoRef =
          collection(
            db,
            "usuarios",
            usuarioAtual.uid,
            "historico"
          );

        const documento =
          await addDoc(
            historicoRef,
            novaAnalise
          );

        setHistorico((atual) =>
          atual.map((item) =>
            item.id === temporaria.id
              ? {
                  id: documento.id,
                  ...novaAnalise,
                }
              : item
          )
        );
      } catch (erro) {
        console.error(erro);

        alert(
          "A análise foi realizada, mas não foi possível salvá-la no histórico."
        );
      }
    }

    setTela(8);
  }

  function novaAnalise() {
    setMensagem("");
    setTela(7);
  }

  if (carregandoUsuario) {
    return (
      <div className="app">
        <div className="screen onboarding">
          <div className="illustration">
            🛡️
          </div>

          <h1>
            Guardião Digital 60+
          </h1>

          <p>
            Carregando sua conta...
          </p>
        </div>
      </div>
    );
  }

return (
    <div className="app">

      {/* =====================================================
          TELA 1 - PROTEÇÃO INTELIGENTE
      ===================================================== */}

      {tela === 0 && (
        <div className="screen onboarding">

          <div className="illustration">
            🛡️
          </div>

          <h1>
            Proteção Inteligente
            <br />
            contra golpes digitais
          </h1>

          <p>
            Analise mensagens, links e imagens
            com inteligência artificial antes
            de interagir ou clicar.
          </p>

          <button onClick={() => irPara(1)}>
            Próximo
          </button>

          <div className="dots">
            <span className="active"></span>
            <span></span>
            <span></span>
          </div>

        </div>
      )}

      {/* =====================================================
          TELA 2 - INTELIGÊNCIA ARTIFICIAL
      ===================================================== */}

      {tela === 1 && (
        <div className="screen onboarding">

          <button
            className="back-button"
            onClick={() => irPara(0)}
          >
            ←
          </button>

          <div className="illustration">
            🤖
          </div>

          <h1>
            A Inteligência Artificial
            <br />
            para você
          </h1>

          <p>
            Nossa IA verifica mensagens,
            links e imagens para identificar
            possíveis perigos digitais.
          </p>

          <button onClick={() => irPara(2)}>
            Próximo
          </button>

          <div className="dots">
            <span></span>
            <span className="active"></span>
            <span></span>
          </div>

        </div>
      )}

      {/* =====================================================
          TELA 3 - VOCÊ NUNCA ESTARÁ SOZINHO
      ===================================================== */}

      {tela === 2 && (
        <div className="screen onboarding">

          <button
            className="back-button"
            onClick={() => irPara(1)}
          >
            ←
          </button>

          <div className="illustration">
            👴🏻
          </div>

          <h1>
            Você nunca estará
            <br />
            sozinho
          </h1>

          <p>
            Receba ajuda para identificar golpes
            e compartilhar alertas com pessoas
            de confiança.
          </p>

          <button onClick={() => irPara(3)}>
            Começar
          </button>

          <div className="dots">
            <span></span>
            <span></span>
            <span className="active"></span>
          </div>

        </div>
      )}

      {/* =====================================================
          TELA 4 - LOGIN
      ===================================================== */}

      {tela === 3 && (
        <div className="screen form-screen">

          <button
            className="back-button"
            onClick={() => irPara(2)}
          >
            ←
          </button>

          <div className="logo">
            🛡️
          </div>

          <h1>
            Bem-Vindo!
          </h1>

          <p>
            Guardião Digital 60+
          </p>

          <input
            type="email"
            value={emailLogin}
            onChange={(e) =>
              setEmailLogin(e.target.value)
            }
            placeholder="Digite seu e-mail"
          />

          <input
            type="password"
            value={senhaLogin}
            onChange={(e) =>
              setSenhaLogin(e.target.value)
            }
            placeholder="Digite sua senha"
          />

          <button onClick={fazerLogin}>
            ENTRAR
          </button>

          <button
            className="link-button"
            onClick={() => irPara(4)}
          >
            Esqueceu sua senha?
          </button>

          <p className="small">
            Não possui uma conta?
          </p>

          <button
            className="create-button"
            onClick={() => irPara(5)}
          >
            Criar conta
          </button>

        </div>
      )}

      {/* =====================================================
          TELA 5 - RECUPERAÇÃO DE SENHA
      ===================================================== */}

      {tela === 4 && (
        <div className="screen form-screen">

          <button
            className="back-button"
            onClick={() => irPara(3)}
          >
            ←
          </button>

          <div className="logo">
            🔑
          </div>

          <h1>
            Recuperação de senha
          </h1>

          <p>
            Proteja sua conta e continue
            navegando com segurança.
          </p>

          <input
            type="email"
            value={emailRecuperacao}
            onChange={(e) =>
              setEmailRecuperacao(e.target.value)
            }
            placeholder="Digite seu e-mail"
          />

          <button onClick={recuperarSenha}>
            ENVIAR CÓDIGO
          </button>

        </div>
      )}

      {/* =====================================================
          TELA 6 - CRIAR CONTA
      ===================================================== */}

      {tela === 5 && (
        <div className="screen form-screen">

          <button
            className="back-button"
            onClick={() => irPara(3)}
          >
            ←
          </button>

          <div className="logo">
            🛡️
          </div>

          <h1>
            Criando sua conta no
            <br />
            Guardião Digital 60+
          </h1>

          <p>
            Preencha seus dados para começar.
          </p>

          <input
            type="text"
            value={nomeCadastro}
            onChange={(e) =>
              setNomeCadastro(e.target.value)
            }
            placeholder="Informe seu nome"
          />

          <input
            type="email"
            value={emailCadastro}
            onChange={(e) =>
              setEmailCadastro(e.target.value)
            }
            placeholder="Digite seu e-mail válido"
          />

          <input
            type="tel"
            value={telefoneCadastro}
            onChange={(e) =>
              setTelefoneCadastro(e.target.value)
            }
            placeholder="Informe seu número de telefone"
          />

          <input
            type="password"
            value={senhaCadastro}
            onChange={(e) =>
              setSenhaCadastro(e.target.value)
            }
            placeholder="Crie uma senha"
          />

          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) =>
              setConfirmarSenha(e.target.value)
            }
            placeholder="Confirme sua senha"
          />

          <button onClick={criarConta}>
            CRIAR CONTA
          </button>

        </div>
      )}

      {/* =====================================================
          TELA 7 - INÍCIO
      ===================================================== */}

      {tela === 6 && (
        <div className="screen home-screen">

          <button
            className="back-button"
            onClick={() => irPara(3)}
          >
            ←
          </button>

          <div className="top-user">

            <div>

              <span>
                Olá, {nomeUsuario || "Usuário"}! 👋
              </span>

              <strong>
                Como posso ajudar você hoje?
              </strong>

            </div>

            <div className="avatar">
              👩🏻
            </div>

          </div>

          <div className="home-shield">
            🛡️
          </div>

          <h1>
            Proteja-se contra
            <br />
            golpes digitais
          </h1>

          <p>
            Verifique mensagens suspeitas
            antes de clicar ou responder.
          </p>

          <button
            className="main-action"
            onClick={() => irPara(7)}
          >
            🔍 ANALISAR MENSAGEM
          </button>

          <button
            className="secondary"
            onClick={() => {
              setEstudoSelecionado(null);
              irPara(9);
            }}
          >
            📚 Aprender sobre golpes
          </button>

          <button
            className="secondary"
            onClick={() => irPara(10)}
          >
            🕘 Histórico
          </button>

          <button
            className="secondary"
            onClick={() => irPara(11)}
          >
            👥 Contatos de confiança
          </button>

          <button
            className="secondary"
            onClick={fazerLogout}
          >
            🚪 Sair da conta
          </button>

        </div>
      )}
            {/* =====================================================
          TELA 8 - ANALISAR MENSAGEM
      ===================================================== */}

      {tela === 7 && (
        <div className="screen analysis-screen">

          <button
            className="back-button"
            onClick={() => irPara(6)}
          >
            ←
          </button>

          <div className="page-header">

            <div className="small-logo">
              🛡️
            </div>

            <div className="avatar">
              👩🏻
            </div>

          </div>

          <h1>
            Analise uma mensagem
          </h1>

          <p>
            Cole abaixo a mensagem que você
            recebeu e deseja verificar.
          </p>

          <textarea
            value={mensagem}
            onChange={(e) =>
              setMensagem(e.target.value)
            }
            placeholder="Cole aqui a mensagem recebida..."
          />

          <button
            className="main-action"
            disabled={mensagem.trim() === ""}
            onClick={analisarMensagem}
          >
            🔍 ANALISAR MENSAGEM
          </button>

          <div className="example">

            <strong>
              Exemplo:
            </strong>

            <p>
              "Olá, seu banco identificou uma
              movimentação suspeita. Clique neste
              link para confirmar seus dados."
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          TELA 9 - RESULTADO
      ===================================================== */}

      {tela === 8 && (
        <div className="screen result-screen">

          <button
            className="back-button"
            onClick={() => irPara(7)}
          >
            ←
          </button>

          <div className="page-header">

            <div className="small-logo">
              🛡️
            </div>

            <div className="avatar">
              👩🏻
            </div>

          </div>

          <div className="danger-icon">
            ⚠️
          </div>

          <h1>
            POSSÍVEL GOLPE
            <br />
            DETECTADO!
          </h1>

          <p className="result-description">
            A inteligência artificial encontrou
            sinais que podem indicar uma tentativa
            de golpe.
          </p>

          <div className="result-box">

            <h2>
              MOTIVOS ENCONTRADOS
            </h2>

            <div className="reason">
              🔗
              <span>
                Link desconhecido ou suspeito
              </span>
            </div>

            <div className="reason">
              💰
              <span>
                Pedido urgente de dinheiro
              </span>
            </div>

            <div className="reason">
              🔐
              <span>
                Solicitação de dados pessoais
              </span>
            </div>

            <div className="reason">
              ⚠️
              <span>
                Linguagem de pressão ou urgência
              </span>
            </div>

          </div>

          <div className="recommendation">

            <h2>
              RECOMENDAÇÃO
            </h2>

            <p>
              <strong>1.</strong> Não clique no link.
            </p>

            <p>
              <strong>2.</strong> Confirme a informação
              diretamente com a instituição ou pessoa.
            </p>

            <p>
              <strong>3.</strong> Não envie dinheiro,
              senhas ou códigos.
            </p>

          </div>

          <button
            className="main-action"
            onClick={() => irPara(6)}
          >
            VOLTAR AO INÍCIO
          </button>

          <button
            className="secondary"
            onClick={() => irPara(11)}
          >
            👥 AVISAR CONTATO
          </button>

        </div>
      )}

      {/* =====================================================
          TELA 10 - ESTUDOS
      ===================================================== */}

      {tela === 9 && (
        <div className="screen study-screen">

          <button
            className="back-button"
            onClick={() => irPara(6)}
          >
            ←
          </button>

          <div className="page-icon">
            📚
          </div>

          <h1>
            Aprenda sobre golpes
          </h1>

          <p className="study-intro">
            Conhecimento é uma das principais formas
            de se proteger contra golpes digitais.
          </p>

          {/* =================================================
              PHISHING
          ================================================= */}

          <div className="study-card">

            <div className="study-icon">
              🔗
            </div>

            <div className="study-content">

              <h2>
                Phishing e links falsos
              </h2>

              <p>
                O criminoso envia uma mensagem fingindo
                ser uma empresa, banco ou serviço conhecido
                para fazer você clicar em um link.
              </p>

              <button
                className="study-button"
                onClick={() =>
                  setEstudoSelecionado(
                    estudoSelecionado === "phishing"
                      ? null
                      : "phishing"
                  )
                }
              >
                {estudoSelecionado === "phishing"
                  ? "Ocultar informações"
                  : "Saiba como se proteger"}
              </button>

              {estudoSelecionado === "phishing" && (
                <div className="study-details">

                  <strong>
                    ⚠️ Como identificar
                  </strong>

                  <span>
                    • Link estranho ou diferente
                    do site oficial.
                  </span>

                  <span>
                    • Mensagem dizendo que você
                    precisa agir imediatamente.
                  </span>

                  <span>
                    • Pedido de senha, código
                    ou dados pessoais.
                  </span>

                  <strong>
                    🛡️ Como se proteger
                  </strong>

                  <span>
                    • Não clique no link.
                  </span>

                  <span>
                    • Entre no aplicativo ou site
                    oficial diretamente.
                  </span>

                </div>
              )}

            </div>
          </div>

          {/* =================================================
              FALSO FAMILIAR
          ================================================= */}

          <div className="study-card">

            <div className="study-icon">
              👨‍👩‍👧
            </div>

            <div className="study-content">

              <h2>
                Golpe do falso familiar
              </h2>

              <p>
                O golpista finge ser um filho, neto ou
                outro familiar e afirma estar precisando
                de dinheiro com urgência.
              </p>

              <button
                className="study-button"
                onClick={() =>
                  setEstudoSelecionado(
                    estudoSelecionado === "familiar"
                      ? null
                      : "familiar"
                  )
                }
              >
                {estudoSelecionado === "familiar"
                  ? "Ocultar informações"
                  : "Saiba como se proteger"}
              </button>

              {estudoSelecionado === "familiar" && (
                <div className="study-details">

                  <strong>
                    ⚠️ Fique atento
                  </strong>

                  <span>
                    • A pessoa pede dinheiro
                    com muita pressa.
                  </span>

                  <span>
                    • Diz que trocou de número.
                  </span>

                  <span>
                    • Evita chamadas de vídeo
                    ou ligação.
                  </span>

                  <strong>
                    🛡️ O que fazer
                  </strong>

                  <span>
                    • Ligue para o familiar pelo
                    número que você já conhece.
                  </span>

                  <span>
                    • Não faça transferências
                    antes de confirmar.
                  </span>

                </div>
              )}

            </div>
          </div>

          {/* =================================================
              FALSO BANCO
          ================================================= */}

          <div className="study-card">

            <div className="study-icon">
              🏦
            </div>

            <div className="study-content">

              <h2>
                Falso funcionário do banco
              </h2>

              <p>
                O criminoso se apresenta como funcionário
                do banco e afirma que existe uma
                movimentação suspeita na conta.
              </p>

              <button
                className="study-button"
                onClick={() =>
                  setEstudoSelecionado(
                    estudoSelecionado === "banco"
                      ? null
                      : "banco"
                  )
                }
              >
                {estudoSelecionado === "banco"
                  ? "Ocultar informações"
                  : "Saiba como se proteger"}
              </button>

              {estudoSelecionado === "banco" && (
                <div className="study-details">

                  <strong>
                    ⚠️ Sinais de alerta
                  </strong>

                  <span>
                    • Pedido de senha ou código
                    de segurança.
                  </span>

                  <span>
                    • Pedido para instalar
                    aplicativos.
                  </span>

                  <span>
                    • Solicitação de transferência
                    para uma "conta segura".
                  </span>

                  <strong>
                    🛡️ Lembre-se
                  </strong>

                  <span>
                    • Nunca informe sua senha ou
                    código de autenticação.
                  </span>

                  <span>
                    • Entre em contato com o banco
                    pelos canais oficiais.
                  </span>

                </div>
              )}

            </div>
          </div>

          {/* =================================================
              PIX
          ================================================= */}

          <div className="study-card">

            <div className="study-icon">
              💸
            </div>

            <div className="study-content">

              <h2>
                Golpes envolvendo Pix
              </h2>

              <p>
                Golpistas podem utilizar histórias falsas,
                falsas cobranças ou pedidos urgentes para
                convencer a vítima a realizar um Pix.
              </p>

              <button
                className="study-button"
                onClick={() =>
                  setEstudoSelecionado(
                    estudoSelecionado === "pix"
                      ? null
                      : "pix"
                  )
                }
              >
                {estudoSelecionado === "pix"
                  ? "Ocultar informações"
                  : "Saiba como se proteger"}
              </button>

              {estudoSelecionado === "pix" && (
                <div className="study-details">

                  <strong>
                    ⚠️ Antes de fazer um Pix
                  </strong>

                  <span>
                    • Confira o nome do destinatário.
                  </span>

                  <span>
                    • Desconfie de pedidos inesperados.
                  </span>

                  <span>
                    • Não faça transferências
                    pressionado pela urgência.
                  </span>

                  <strong>
                    🛡️ Se houver dúvida
                  </strong>

                  <span>
                    • Pare a operação e confirme
                    a informação.
                  </span>

                </div>
              )}

            </div>
          </div>

          {/* =================================================
              FALSAS PROMOÇÕES
          ================================================= */}

          <div className="study-card">

            <div className="study-icon">
              🎁
            </div>

            <div className="study-content">

              <h2>
                Falsas promoções e prêmios
              </h2>

              <p>
                Mensagens prometendo prêmios, descontos
                ou benefícios podem ser usadas para
                conseguir dados pessoais ou dinheiro.
              </p>

              <button
                className="study-button"
                onClick={() =>
                  setEstudoSelecionado(
                    estudoSelecionado === "premio"
                      ? null
                      : "premio"
                  )
                }
              >
                {estudoSelecionado === "premio"
                  ? "Ocultar informações"
                  : "Saiba como se proteger"}
              </button>

              {estudoSelecionado === "premio" && (
                <div className="study-details">

                  <strong>
                    ⚠️ Desconfie quando
                  </strong>

                  <span>
                    • Você ganhou algo que nunca
                    participou.
                  </span>

                  <span>
                    • Pedem pagamento para liberar
                    um prêmio.
                  </span>

                  <span>
                    • Pedem informações pessoais
                    para receber o benefício.
                  </span>

                  <strong>
                    🛡️ Proteção
                  </strong>

                  <span>
                    • Procure a promoção no site
                    oficial da empresa.
                  </span>

                </div>
              )}

            </div>
          </div>

          {/* =================================================
              ROUBO DE SENHAS
          ================================================= */}

          <div className="study-card">

            <div className="study-icon">
              🔐
            </div>

            <div className="study-content">

              <h2>
                Roubo de senhas e códigos
              </h2>

              <p>
                Senhas e códigos de autenticação podem
                permitir que criminosos acessem contas
                e realizem operações em nome da vítima.
              </p>

              <button
                className="study-button"
                onClick={() =>
                  setEstudoSelecionado(
                    estudoSelecionado === "senha"
                      ? null
                      : "senha"
                  )
                }
              >
                {estudoSelecionado === "senha"
                  ? "Ocultar informações"
                  : "Saiba como se proteger"}
              </button>

              {estudoSelecionado === "senha" && (
                <div className="study-details">

                  <strong>
                    🔐 Nunca compartilhe
                  </strong>

                  <span>
                    • Senhas.
                  </span>

                  <span>
                    • Códigos recebidos por SMS.
                  </span>

                  <span>
                    • Códigos de autenticação
                    de aplicativos.
                  </span>

                  <strong>
                    🛡️ Boa prática
                  </strong>

                  <span>
                    • Use senhas diferentes para
                    serviços diferentes.
                  </span>

                </div>
              )}

            </div>
          </div>

          {/* =================================================
              ALERTA EDUCATIVO
          ================================================= */}

          <div className="study-warning">

            <h2>
              🚨 Suspeita de golpe?
            </h2>

            <p>
              Pare antes de clicar, transferir dinheiro
              ou fornecer informações.
            </p>

            <div>
              <strong>1.</strong>{" "}
              Não responda imediatamente.
            </div>

            <div>
              <strong>2.</strong>{" "}
              Não clique em links suspeitos.
            </div>

            <div>
              <strong>3.</strong>{" "}
              Confirme a informação por um canal oficial.
            </div>

            <div>
              <strong>4.</strong>{" "}
              Se necessário, peça ajuda a uma pessoa
              de confiança.
            </div>

          </div>

        </div>
      )}      {/* =====================================================
          TELA 11 - HISTÓRICO
      ===================================================== */}

      {tela === 10 && (
        <div className="screen info-screen history-screen">

          <button
            className="back-button"
            onClick={() => irPara(6)}
          >
            ←
          </button>

          <div className="page-icon">
            🕘
          </div>

          <h1>
            Histórico de análises
          </h1>

          <p>
            Consulte as mensagens que já foram
            verificadas pelo Guardião Digital 60+.
          </p>

          {historico.length === 0 ? (

            <div className="empty-history">

              <div>
                📭
              </div>

              <h2>
                Nenhuma análise ainda
              </h2>

              <p>
                As mensagens que você analisar
                aparecerão aqui.
              </p>

              <button
                className="main-action"
                onClick={() => irPara(7)}
              >
                🔍 FAZER PRIMEIRA ANÁLISE
              </button>

            </div>

          ) : (

            <div className="history-list">

              {historico.map((item) => (

                <div
                  className="history-card"
                  key={item.id}
                >

                  <div className="history-header">

                    <span className="history-danger">
                      ⚠️
                    </span>

                    <div>

                      <strong>
                        {item.resultado}
                      </strong>

                      <small>
                        {item.data}
                      </small>

                    </div>

                  </div>

                  <div className="history-message">
                    "{item.mensagem}"
                  </div>

                  <div className="history-reasons">

                    <strong>
                      Sinais encontrados:
                    </strong>

                    {item.motivos &&
                      item.motivos.map(
                        (motivo, index) => (

                          <span key={index}>
                            • {motivo}
                          </span>

                        )
                      )}

                  </div>

                </div>

              ))}

              <button
                className="main-action"
                onClick={novaAnalise}
              >
                🔍 ANALISAR NOVA MENSAGEM
              </button>

            </div>

          )}

        </div>
      )}

      {/* =====================================================
          TELA 12 - CONTATOS
      ===================================================== */}

      {tela === 11 && (
        <div className="screen info-screen">

          <button
            className="back-button"
            onClick={() => irPara(6)}
          >
            ←
          </button>

          <div className="page-icon">
            👥
          </div>

          <h1>
            Contatos de confiança
          </h1>

          <p>
            Pessoas escolhidas para receber
            alertas quando houver um possível golpe.
          </p>

          {contatos.length === 0 ? (

            <div className="empty-history">

              <div>
                👥
              </div>

              <h2>
                Nenhum contato cadastrado
              </h2>

              <p>
                Adicione uma pessoa de confiança
                para receber alertas.
              </p>

            </div>

          ) : (

            contatos.map((contato) => (

              <div
                className="contact-card"
                key={contato.id}
              >

                <div className="contact-avatar">
                  {contato.emoji}
                </div>

                <div className="contact-info">

                  <h2>
                    {contato.nome}
                  </h2>

                  <p>
                    {contato.relacao}
                  </p>

                  <span className="contact-phone">
                    📱 {contato.telefone}
                  </span>

                </div>

                <button
                  className="delete-contact"
                  onClick={() =>
                    excluirContato(
                      contato.id,
                      contato.nome
                    )
                  }
                  title="Excluir contato"
                >
                  🗑️
                </button>

              </div>

            ))

          )}

          <button
            className="main-action add-contact-button"
            onClick={() => irPara(12)}
          >
            ➕ ADICIONAR CONTATO
          </button>

        </div>
      )}

      {/* =====================================================
          TELA 13 - ADICIONAR CONTATO
      ===================================================== */}

      {tela === 12 && (
        <div className="screen form-screen">

          <button
            className="back-button"
            onClick={() => irPara(11)}
          >
            ←
          </button>

          <div className="logo">
            👥
          </div>

          <h1>
            Adicionar contato
          </h1>

          <p>
            Cadastre uma pessoa de confiança.
          </p>

          <input
            type="text"
            value={novoNome}
            onChange={(e) =>
              setNovoNome(e.target.value)
            }
            placeholder="Nome do contato"
          />

          <input
            type="text"
            value={novaRelacao}
            onChange={(e) =>
              setNovaRelacao(e.target.value)
            }
            placeholder="Parentesco ou relação"
          />

          <input
            type="tel"
            value={novoTelefone}
            onChange={(e) =>
              setNovoTelefone(e.target.value)
            }
            placeholder="Número de telefone"
          />

          <button onClick={adicionarContato}>
            ADICIONAR CONTATO
          </button>

          <button
            className="secondary"
            onClick={() => irPara(11)}
          >
            CANCELAR
          </button>

        </div>
      )}

    </div>
  );
}

export default App;