
import React, { useState } from "react";
import "../../App.css";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

function Home() {
  const [message, setMessage] = useState("");

  function handleAnalyze() {
    if (!message.trim()) {
      alert("Cole uma mensagem antes de analisar.");
      return;
    }

    alert("Mensagem enviada para análise.");
  }

  function handleClear() {
    setMessage("");
  }

  return (
    <main className="home">
      <Header/>

      {/* HERO */}
      <section className="hero">
        <div className="heroContent">

          <div className="heroText">

            <span className="heroTag">
              🛡️ PROTEÇÃO DIGITAL
            </span>

            <h1>
              Uma mensagem pode esconder um golpe.
              <span>
                Nós ajudamos você a identificar.
              </span>
            </h1>

            <p>
              O Guardião Digital 60+ analisa mensagens e identifica
              características comuns de golpes digitais, ajudando você
              a navegar com mais segurança.
            </p>

            <div className="heroButtons">

              <a
                href="#analise"
                className="primaryButton"
              >
                🔎 Analisar mensagem
              </a>

            </div>

            <div className="heroBenefits">

              <div>
                <span>🔎</span>
                <strong>Análise rápida</strong>
              </div>

              <div>
                <span>🧠</span>
                <strong>Fácil de entender</strong>
              </div>

              <div>
                <span>💙</span>
                <strong>Mais segurança</strong>
              </div>

            </div>

          </div>

          <div className="heroRobot">

            <div className="robotGlow"></div>

            <img
              src="/robozinho.png"
              alt="Robô Guardião Digital 60+"
            />

            <div className="robotMessage">
              <strong>Olá! 👋</strong>
              <span>Estou aqui para ajudar.</span>
            </div>

          </div>

        </div>
      </section>


      {/* ANÁLISE */}
      <section
        className="analysisSection"
        id="analise"
      >

        <div className="analysisHeader">

          <div className="sectionIcon">
            🔎
          </div>

          <div>
            <h2>Analisar uma mensagem</h2>

            <p>
              Cole aqui a mensagem que você recebeu para verificar
              se ela pode apresentar sinais de golpe.
            </p>
          </div>

        </div>


        <div className="messageBox">

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Cole aqui a mensagem suspeita..."
            maxLength={2000}
          />

          <div className="characterCount">
            {message.length}/2000
          </div>

        </div>


        <div className="analysisButtons">

          <button
            className="primaryButton"
            onClick={handleAnalyze}
          >
            🔎 Analisar mensagem
            <span>→</span>
          </button>

          <button
            className="clearButton"
            onClick={handleClear}
          >
            🗑️ Limpar
          </button>

        </div>

      </section>


      
      <section className="howSection">

        <div className="sectionTitle">

          <span>
            COMO FUNCIONA
          </span>

          <h2>
            Proteção simples e fácil de entender
          </h2>

          <p>
            O Guardião Digital 60+ foi pensado para tornar
            a segurança digital mais acessível.
          </p>

        </div>


        <div className="steps">

          <div className="stepCard">

            <div className="stepNumber">
              01
            </div>

            <div className="stepIcon">
              📩
            </div>

            <h3>
              Cole a mensagem
            </h3>

            <p>
              Insira a mensagem que você recebeu e deseja verificar.
            </p>

          </div>


          <div className="stepCard">

            <div className="stepNumber">
              02
            </div>

            <div className="stepIcon">
              🤖
            </div>

            <h3>
              Faça a análise
            </h3>

            <p>
              O sistema procura características comuns de golpes.
            </p>

          </div>


          <div className="stepCard">

            <div className="stepNumber">
              03
            </div>

            <div className="stepIcon">
              🛡️
            </div>

            <h3>
              Receba orientação
            </h3>

            <p>
              Entenda os possíveis riscos e navegue com mais segurança.
            </p>

          </div>

        </div>

      </section>
        <Footer/>
    </main>

  );
}

export default Home;
