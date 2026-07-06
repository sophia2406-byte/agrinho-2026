/* Executa apenas quando o DOM estiver totalmente carregado */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // Seletores curtos para facilitar a leitura do código
  const $ = (seletor, escopo = document) => escopo.querySelector(seletor);
  const $$ = (seletor, escopo = document) => [...escopo.querySelectorAll(seletor)];

  // Atualiza o ano do rodapé dinamicamente
  const anoEl = $("#ano-atual");
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  // Mostra a hora local no rodapé (texto alterado dinamicamente)
  const horaEl = $("#hora-local");
  const atualizarHora = () => {
    if (!horaEl) return;
    const agora = new Date();
    const hh = String(agora.getHours()).padStart(2, "0");
    const mm = String(agora.getMinutes()).padStart(2, "0");
    horaEl.textContent = `${hh}:${mm}`;
  };
  atualizarHora();
  setInterval(atualizarHora, 30000); // reatualiza a cada 30s

  const html = document.documentElement;
  const botaoTema = $("#tema-toggle");
  const CHAVE_TEMA = "agrinho-tema";

  // Aplica o tema salvo (ou o preferido pelo sistema) ao carregar
  const temaSalvo = localStorage.getItem(CHAVE_TEMA);
  const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
  html.setAttribute("data-tema", temaSalvo || (prefereEscuro ? "escuro" : "claro"));

  // Alterna entre claro/escuro e guarda a escolha
  const alternarTema = () => {
    const atual = html.getAttribute("data-tema");
    const novo = atual === "escuro" ? "claro" : "escuro";
    html.setAttribute("data-tema", novo);
    localStorage.setItem(CHAVE_TEMA, novo);
  };
  if (botaoTema) botaoTema.addEventListener("click", alternarTema);

  const cabecalho = $("#cabecalho");
  const linksNav = $$(".nav__link");
  const secoes = $$("main section[id]");

  // Adiciona sombra/fundo ao cabeçalho após rolar um pouco
  const atualizarCabecalho = () => {
    if (window.scrollY > 40) cabecalho.classList.add("is-fixo");
    else cabecalho.classList.remove("is-fixo");
  };

  // Destaca no menu o link da seção visível na tela
  const atualizarLinkAtivo = () => {
    let atual = "";
    secoes.forEach((secao) => {
      if (window.scrollY >= secao.offsetTop - 140) atual = secao.id;
    });
    linksNav.forEach((link) => {
      const alvo = link.getAttribute("href").replace("#", "");
      link.classList.toggle("is-ativo", alvo === atual);
    });
  };

  const toggle = $("#nav-toggle");
  const lista = $("#nav-lista");

  // Abre/fecha o menu lateral e atualiza o atributo de acessibilidade
  const alternarMenu = () => {
    const aberto = lista.classList.toggle("is-aberto");
    toggle.classList.toggle("is-aberto", aberto);
    toggle.setAttribute("aria-expanded", String(aberto));
    toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu de navegação");
  };
  if (toggle) toggle.addEventListener("click", alternarMenu);

  // Fecha o menu ao clicar em qualquer link
  linksNav.forEach((link) =>
    link.addEventListener("click", () => {
      if (lista.classList.contains("is-aberto")) alternarMenu();
    })
  );

  const barra = $("#barra-progresso");
  const botaoTopo = $("#botao-topo");

  // Calcula a porcentagem já rolada da página
  const atualizarProgresso = () => {
    const alturaRolavel = document.body.scrollHeight - window.innerHeight;
    const pct = alturaRolavel > 0 ? (window.scrollY / alturaRolavel) * 100 : 0;
    if (barra) barra.style.width = `${pct}%`;
    // Exibe o botão "topo" depois de rolar meia tela
    if (botaoTopo) botaoTopo.classList.toggle("is-visivel", window.scrollY > window.innerHeight * 0.5);
  };

  // Volta suavemente ao início da página
  if (botaoTopo) {
    botaoTopo.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Um único listener de scroll executa todas as tarefas ligadas ao rolar
  const aoRolar = () => {
    atualizarCabecalho();
    atualizarLinkAtivo();
    atualizarProgresso();
  };
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar(); // executa uma vez no carregamento

  const elementosRevelar = $$("[data-revelar]");
  const observadorRevelar = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("is-visivel");
          obs.unobserve(entrada.target); // revela apenas uma vez
        }
      });
    },
    { threshold: 0.15 }
  );
  elementosRevelar.forEach((el) => observadorRevelar.observe(el));

  const numeros = $$(".stat__num");

  // Anima um número de 0 até o valor alvo usando requestAnimationFrame
  const animarNumero = (el) => {
    const alvo = Number(el.dataset.alvo);
    const sufixo = el.dataset.sufixo || "";
    const duracao = 1600;
    const inicio = performance.now();

    const passo = (agora) => {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      // easing suave (desacelera no fim)
      const eased = 1 - Math.pow(1 - progresso, 3);
      el.textContent = Math.round(alvo * eased) + sufixo;
      if (progresso < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  // Dispara a animação quando o bloco de estatísticas entra na tela
  const observadorNumeros = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          animarNumero(entrada.target);
          obs.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  numeros.forEach((n) => observadorNumeros.observe(n));

  // Banco de perguntas: objeto com enunciado, opções e índice da correta
  const perguntas = [
    {
      pergunta: "Qual prática ajuda a economizar água na lavoura?",
      opcoes: ["Irrigação por sensores", "Regar sempre ao meio-dia", "Deixar o solo descoberto", "Aumentar a área plantada"],
      correta: 0,
    },
    {
      pergunta: "O que fazem os drones na agricultura sustentável?",
      opcoes: ["Aumentam o uso de veneno", "Monitoram a plantação de cima", "Substituem as abelhas", "Poluem o ar do campo"],
      correta: 1,
    },
    {
      pergunta: "Por que a biodiversidade é importante no campo?",
      opcoes: ["Atrapalha a colheita", "Não tem função", "Poliniza e controla pragas", "Aumenta o desperdício"],
      correta: 2,
    },
    {
      pergunta: "O que é economia circular no agro?",
      opcoes: ["Jogar tudo fora", "Reaproveitar restos como adubo e energia", "Plantar só uma cultura", "Usar mais combustível"],
      correta: 1,
    },
  ];

  // Estado do quiz
  let indiceQuiz = 0;
  let acertos = 0;

  const elPergunta = $("#quiz-pergunta");
  const elOpcoes = $("#quiz-opcoes");
  const elContador = $("#quiz-contador");
  const elFeedback = $("#quiz-feedback");
  const elProgressoQuiz = $("#quiz-progresso");
  const elResultado = $("#quiz-resultado");
  const elAcertos = $("#quiz-acertos");
  const elMensagem = $("#quiz-mensagem");
  const btnReiniciar = $("#quiz-reiniciar");

  // Mostra a pergunta atual e cria os botões de opção dinamicamente
  const mostrarPergunta = () => {
    const q = perguntas[indiceQuiz];
    elContador.textContent = `Pergunta ${indiceQuiz + 1} de ${perguntas.length}`;
    elPergunta.textContent = q.pergunta;
    elProgressoQuiz.style.width = `${((indiceQuiz) / perguntas.length) * 100}%`;
    elFeedback.textContent = "";
    elOpcoes.innerHTML = ""; // limpa opções anteriores

    q.opcoes.forEach((texto, i) => {
      const botao = document.createElement("button");
      botao.className = "quiz__opcao";
      botao.type = "button";
      botao.textContent = texto;
      botao.addEventListener("click", () => responder(i, botao));
      elOpcoes.appendChild(botao);
    });
  };

  // Processa a resposta escolhida
  const responder = (escolha, botao) => {
    const q = perguntas[indiceQuiz];
    const botoes = $$(".quiz__opcao", elOpcoes);
    botoes.forEach((b) => (b.disabled = true)); // trava novos cliques

    if (escolha === q.correta) {
      acertos++;
      botao.classList.add("is-certa");
      elFeedback.textContent = "Correto! 🌿";
      elFeedback.style.color = "var(--verde-mata)";
    } else {
      botao.classList.add("is-errada");
      botoes[q.correta].classList.add("is-certa");
      elFeedback.textContent = "Quase! Veja a resposta certa acima.";
      elFeedback.style.color = "#d9534f";
    }

    // Avança para a próxima pergunta (ou resultado) após uma pausa
    setTimeout(() => {
      indiceQuiz++;
      if (indiceQuiz < perguntas.length) mostrarPergunta();
      else mostrarResultado();
    }, 1100);
  };

  // Exibe a tela final com pontuação e mensagem personalizada
  const mostrarResultado = () => {
    elProgressoQuiz.style.width = "100%";
    $(".quiz__pergunta").hidden = true;
    elOpcoes.hidden = true;
    elFeedback.hidden = true;
    elContador.hidden = true;
    elResultado.hidden = false;
    elAcertos.textContent = acertos;

    // Mensagem muda conforme o desempenho
    let msg;
    if (acertos === perguntas.length) msg = "Perfeito! Você é um guardião do futuro sustentável. 🏆";
    else if (acertos >= 2) msg = "Muito bem! Você já entende bastante sobre o agro do futuro.";
    else msg = "Bom começo! Explore o site e tente novamente. 🌱";
    elMensagem.textContent = msg;
  };

  // Reinicia o quiz do zero
  const reiniciarQuiz = () => {
    indiceQuiz = 0;
    acertos = 0;
    $(".quiz__pergunta").hidden = false;
    elOpcoes.hidden = false;
    elFeedback.hidden = false;
    elContador.hidden = false;
    elResultado.hidden = true;
    mostrarPergunta();
  };
  if (btnReiniciar) btnReiniciar.addEventListener("click", reiniciarQuiz);
  if (elPergunta) mostrarPergunta(); // inicia o quiz

  const formCalc = $("#calc-form");
  const resultadoCalc = $("#calc-resultado");
  const anelCalc = $("#calc-anel");
  const percentCalc = $("#calc-percent");
  const tituloCalc = $("#calc-titulo");
  const dicaCalc = $("#calc-dica");

  if (formCalc) {
    formCalc.addEventListener("submit", (e) => {
      e.preventDefault(); // evita recarregar a página

      // Reúne as respostas (name q1..q5) e soma os pontos
      const dados = new FormData(formCalc);
      const nomes = ["q1", "q2", "q3", "q4", "q5"];
      let soma = 0;
      let respondidas = 0;

      nomes.forEach((nome) => {
        const valor = dados.get(nome);
        if (valor) {
          soma += Number(valor);
          respondidas++;
        }
      });

      // Validação: todas as 5 perguntas precisam de resposta
      const aviso = $("#calc-aviso");
      if (respondidas < nomes.length) {
        aviso.hidden = false; // mostra aviso inline (sem interromper com alert)
        aviso.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      aviso.hidden = true; // limpa o aviso quando tudo estiver preenchido

      // Índice = pontos obtidos / pontos máximos (5 × 3 = 15)
      const indice = Math.round((soma / (nomes.length * 3)) * 100);

      // Define título e dica personalizados por faixa
      let titulo, dica;
      if (indice >= 80) {
        titulo = "Índice verde-floresta! 🌳";
        dica = "Seus hábitos já são um exemplo de equilíbrio. Continue inspirando quem está ao seu redor a fazer o mesmo.";
      } else if (indice >= 55) {
        titulo = "Índice verde-folha! 🌿";
        dica = "Você está no caminho certo. Um próximo passo simples: reaproveitar mais a água e priorizar alimentos locais.";
      } else {
        titulo = "Índice em crescimento! 🌱";
        dica = "Toda mudança começa pequena. Escolha um hábito desta semana — como separar o lixo — e transforme-o em rotina.";
      }

      // Preenche e revela o resultado
      resultadoCalc.hidden = false;
      tituloCalc.textContent = titulo;
      dicaCalc.textContent = dica;

      // Anima o anel circular (circunferência ≈ 327)
      const circunferencia = 327;
      const offset = circunferencia - (circunferencia * indice) / 100;
      anelCalc.style.strokeDashoffset = offset;

      // Anima o número do percentual
      let atualPct = 0;
      const subir = () => {
        if (atualPct < indice) {
          atualPct++;
          percentCalc.textContent = `${atualPct}%`;
          requestAnimationFrame(subir);
        }
      };
      subir();

      // Rola até o resultado
      resultadoCalc.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // Dados das imagens da galeria
  const imagens = [
    { src: "assets/img/gal-precisao.svg", titulo: "Trator autônomo", legenda: "Máquinas guiadas por GPS aplicam a dose exata em cada metro.", cat: "tecnologia" },
    { src: "assets/img/gal-sensores.svg", titulo: "Sensores no solo", legenda: "Dados em tempo real dizem exatamente quando irrigar.", cat: "tecnologia" },
    { src: "assets/img/gal-reflorestamento.svg", titulo: "Reflorestamento", legenda: "Mudas nativas devolvem sombra, vida e proteção ao solo.", cat: "natureza" },
    { src: "assets/img/gal-agua.svg", titulo: "Mata ciliar", legenda: "Árvores nas margens mantêm rios e nascentes saudáveis.", cat: "natureza" },
    { src: "assets/img/gal-solar.svg", titulo: "Energia limpa", legenda: "Sol e vento abastecem a fazenda com energia renovável.", cat: "sustentabilidade" },
    { src: "assets/img/gal-colheita.svg", titulo: "Colheita e biodiversidade", legenda: "Alimento saudável convive com flores, abelhas e vida.", cat: "sustentabilidade" },
  ];

  const grade = $("#galeria-grade");
  const filtros = $("#galeria-filtros");

  // Cria os cartões da galeria dinamicamente (com lazy loading nativo)
  const renderizarGaleria = () => {
    grade.innerHTML = imagens
      .map(
        (img) => `
        <figure class="galeria__card" data-cat="${img.cat}" data-titulo="${img.titulo}" data-legenda="${img.legenda}" data-src="${img.src}" tabindex="0" role="button" aria-label="Ampliar: ${img.titulo}">
          <img src="${img.src}" alt="${img.titulo}" loading="lazy" />
          <figcaption class="galeria__legenda"><strong>${img.titulo}</strong><span>${img.cat}</span></figcaption>
        </figure>`
      )
      .join("");
  };
  if (grade) renderizarGaleria();

  // Filtro por categoria
  if (filtros) {
    filtros.addEventListener("click", (e) => {
      const botao = e.target.closest(".chip");
      if (!botao) return;
      const filtro = botao.dataset.filtro;

      // Atualiza o botão ativo
      $$(".chip", filtros).forEach((c) => c.classList.remove("is-ativo"));
      botao.classList.add("is-ativo");

      // Mostra/esconde cartões conforme o filtro
      $$(".galeria__card", grade).forEach((card) => {
        const mostrar = filtro === "todos" || card.dataset.cat === filtro;
        card.classList.toggle("is-oculto", !mostrar);
      });
    });
  }

  // Modal — abre a imagem ampliada
  const modal = $("#modal");
  const modalImg = $("#modal-img");
  const modalTitulo = $("#modal-titulo");
  const modalLegenda = $("#modal-legenda");

  const abrirModal = (card) => {
    modalImg.src = card.dataset.src;
    modalImg.alt = card.dataset.titulo;
    modalTitulo.textContent = card.dataset.titulo;
    modalLegenda.textContent = card.dataset.legenda;
    modal.hidden = false;
    document.body.style.overflow = "hidden"; // trava o scroll ao abrir
  };

  const fecharModal = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  if (grade) {
    // Clique ou tecla Enter no cartão abre o modal
    grade.addEventListener("click", (e) => {
      const card = e.target.closest(".galeria__card");
      if (card) abrirModal(card);
    });
    grade.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const card = e.target.closest(".galeria__card");
        if (card) {
          e.preventDefault();
          abrirModal(card);
        }
      }
    });
  }
  if (modal) {
    $("#modal-fechar").addEventListener("click", fecharModal);
    $("#modal-fundo").addEventListener("click", fecharModal);
    // Fecha com a tecla Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) fecharModal();
    });
  }

  const depoimentos = [
    { texto: "Depois que passamos a monitorar o solo, gastamos menos água e colhemos mais. A tecnologia virou aliada da natureza.", nome: "Marina Cardoso", papel: "Produtora rural (fictícia)", ini: "MC" },
    { texto: "Meus alunos entenderam que cuidar do meio ambiente e produzir alimento são a mesma missão. O projeto abriu olhos.", nome: "Prof. Alberto Lima", papel: "Educador (fictício)", ini: "AL" },
    { texto: "Plantar árvores no meio da lavoura parecia loucura. Hoje é onde as abelhas mais trabalham e a terra mais agradece.", nome: "João Ferreira", papel: "Agricultor familiar (fictício)", ini: "JF" },
  ];

  const trilho = $("#slider-trilho");
  const pontos = $("#slider-pontos");
  let slideAtual = 0;
  let intervaloSlider;

  // Monta os slides e os pontos indicadores
  const renderizarSlider = () => {
    trilho.innerHTML = depoimentos
      .map(
        (d) => `
        <div class="slide">
          <div class="slide__caixa">
            <span class="slide__aspas" aria-hidden="true">&ldquo;</span>
            <p class="slide__texto">${d.texto}</p>
            <div class="slide__autor">
              <span class="slide__avatar" aria-hidden="true">${d.ini}</span>
              <span><span class="slide__nome">${d.nome}</span><span class="slide__papel">${d.papel}</span></span>
            </div>
          </div>
        </div>`
      )
      .join("");

    pontos.innerHTML = depoimentos
      .map((_, i) => `<button class="slider__ponto ${i === 0 ? "is-ativo" : ""}" role="tab" aria-label="Depoimento ${i + 1}"></button>`)
      .join("");
  };

  // Move o slider até o índice indicado
  const irParaSlide = (indice) => {
    slideAtual = (indice + depoimentos.length) % depoimentos.length; // volta ao início/fim
    trilho.style.transform = `translateX(-${slideAtual * 100}%)`;
    $$(".slider__ponto", pontos).forEach((p, i) => p.classList.toggle("is-ativo", i === slideAtual));
  };

  // Avança automaticamente a cada 6 segundos
  const iniciarAuto = () => {
    intervaloSlider = setInterval(() => irParaSlide(slideAtual + 1), 6000);
  };
  const reiniciarAuto = () => {
    clearInterval(intervaloSlider);
    iniciarAuto();
  };

  if (trilho) {
    renderizarSlider();
    iniciarAuto();

    $("#slider-proximo").addEventListener("click", () => { irParaSlide(slideAtual + 1); reiniciarAuto(); });
    $("#slider-anterior").addEventListener("click", () => { irParaSlide(slideAtual - 1); reiniciarAuto(); });

    // Pontos indicadores navegam direto
    pontos.addEventListener("click", (e) => {
      const ponto = e.target.closest(".slider__ponto");
      if (!ponto) return;
      const indice = [...pontos.children].indexOf(ponto);
      irParaSlide(indice);
      reiniciarAuto();
    });
  }

  /* --- Acordeões (Curiosidades e FAQ) --- */
  const cabecas = $$(".acordeao__cabeca");
  cabecas.forEach((cabeca) => {
    cabeca.addEventListener("click", () => {
      const aberto = cabeca.getAttribute("aria-expanded") === "true";
      const corpo = cabeca.nextElementSibling;

      // Fecha os demais itens do mesmo acordeão (comportamento sanfona)
      const grupo = cabeca.closest(".acordeao");
      $$(".acordeao__cabeca", grupo).forEach((outra) => {
        if (outra !== cabeca) {
          outra.setAttribute("aria-expanded", "false");
          outra.nextElementSibling.style.maxHeight = null;
        }
      });

      // Alterna o item clicado
      cabeca.setAttribute("aria-expanded", String(!aberto));
      corpo.style.maxHeight = aberto ? null : `${corpo.scrollHeight}px`;
    });
  });

  /* --- Validação do formulário de contato --- */
  const form = $("#form-contato");
  const sucesso = $("#form-sucesso");

  // Mostra ou limpa a mensagem de erro de um campo
  const definirErro = (campo, mensagem) => {
    const grupo = campo.closest(".form__campo");
    const erroEl = $(`[data-erro="${campo.id}"]`);
    grupo.classList.toggle("is-invalido", Boolean(mensagem));
    if (erroEl) erroEl.textContent = mensagem;
  };

  // Regras de validação de cada campo
  const validarCampo = (campo) => {
    const valor = campo.value.trim();
    if (campo.id === "nome") {
      if (valor.length < 2) return definirErro(campo, "Digite seu nome (mín. 2 letras).") || false;
    }
    if (campo.id === "email") {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // padrão simples de e-mail
      if (!regexEmail.test(valor)) return definirErro(campo, "Informe um e-mail válido.") || false;
    }
    if (campo.id === "mensagem") {
      if (valor.length < 10) return definirErro(campo, "Escreva ao menos 10 caracteres.") || false;
    }
    definirErro(campo, ""); // limpa o erro se estiver válido
    return true;
  };

  if (form) {
    const campos = [$("#nome"), $("#email"), $("#mensagem")];

    // Valida em tempo real ao sair de cada campo
    campos.forEach((campo) => campo.addEventListener("blur", () => validarCampo(campo)));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // Valida todos os campos e verifica se todos passaram
      const todosValidos = campos.map(validarCampo).every(Boolean);

      if (todosValidos) {
        sucesso.hidden = false;
        form.reset();
        campos.forEach((c) => c.closest(".form__campo").classList.remove("is-invalido"));
        setTimeout(() => (sucesso.hidden = true), 6000); // esconde após 6s
      } else {
        sucesso.hidden = true;
      }
    });
  }

  /* --- Cursor personalizado (efeito de ponteiro) --- */
  const cursor = $("#cursor");
  const cursorPonto = $("#cursor-ponto");

  // Só ativa em dispositivos com ponteiro fino (mouse)
  if (cursor && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      cursorPonto.style.left = `${e.clientX}px`;
      cursorPonto.style.top = `${e.clientY}px`;
    });

    // Aumenta o cursor ao passar sobre elementos interativos
    const interativos = "a, button, .card, .galeria__card, input, textarea, label";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(interativos)) cursor.classList.add("is-ativo");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(interativos)) cursor.classList.remove("is-ativo");
    });
  }

  const balancaProducao = $("#balanca-producao");
  const balancaNatureza = $("#balanca-natureza");
  const balancaPeso = $("#balanca-peso");
  const balancaPivo = $("#balanca-pivo");

  // Sorteia dois valores que somam 100% e atualiza a balança
  const reequilibrar = () => {
    const producao = Math.floor(Math.random() * 41) + 30; // entre 30% e 70%
    const natureza = 100 - producao;
    balancaProducao.textContent = `${producao}%`;
    balancaNatureza.textContent = `${natureza}%`;
    balancaPeso.style.width = `${producao}%`;
  };
  if (balancaPivo) {
    balancaPivo.addEventListener("click", reequilibrar);
    // Volta ao equilíbrio perfeito após uma pequena demonstração inicial
    setTimeout(() => {
      balancaProducao.textContent = "50%";
      balancaNatureza.textContent = "50%";
      balancaPeso.style.width = "50%";
    }, 400);
  }

  /* Mensagem de boas-vindas personalizada no console (sem poluir a UI) */
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  console.log(`%c${saudacao}! 🌱 Bem-vindo(a) ao AgroVivo · Agrinho 2026`, "color:#6fae4f;font-size:14px;font-weight:bold");
});
