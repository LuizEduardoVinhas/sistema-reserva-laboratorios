/**
 * ==============================================================================
 * SISTEMA DE RESERVA DE LABORATÓRIOS - CONTROLADOR PRINCIPAL (script.js)
 * Disciplina: Maturidade em Desenvolvimento de Software — UNINASSAU
 * Professor: Rafael Pacheco Ferreira
 * 
 * Arquitetura: Vanilla ES6+ orientado a objetos espelhando UML 01 e UML 02.
 * Zero dependências externas | Execução 100% Client-Side
 * ==============================================================================
 */

"use strict";

/* ==============================================================================
   1. MODELAGEM ORIENTADA A OBJETOS (DIAGRAMA DE CLASSES UML 02)
   ============================================================================== */

/**
 * Representa o Professor responsável pela solicitação de reserva.
 * UML 02: Professor (nome: string, matricula: string)
 */
class Professor {
  /**
   * @param {string} nome 
   * @param {string} matricula 
   */
  constructor(nome, matricula) {
    this.nome = String(nome).trim();
    this.matricula = String(matricula).trim();
  }
}

/**
 * Representa uma unidade de Laboratório acadêmico.
 * UML 02: Laboratorio (nome: string, capacidade: number, disponivel: boolean)
 */
class Laboratorio {
  /**
   * @param {string|number} id
   * @param {string} nome 
   * @param {number} capacidade 
   * @param {boolean} disponivel 
   * @param {string} [notaInformativa=""]
   */
  constructor(id, nome, capacidade, disponivel, notaInformativa = "") {
    this.id = id;
    this.nome = String(nome).trim();
    this.capacidade = Number(capacidade);
    this.disponivel = Boolean(disponivel);
    this.notaInformativa = notaInformativa;
  }

  /**
   * Regra de Negócio (Slide 9):
   * Laboratórios com capacidade inferior a 30 alunos NÃO podem receber aulas regulares.
   * @returns {boolean}
   */
  permiteAulaRegular() {
    return this.capacidade >= 30;
  }
}

/**
 * Representa o vínculo de agendamento entre um Professor e um Laboratório.
 * UML 02: Reserva (data: string, horario: string, finalidade: string)
 * Multiplicidade: 1 Professor -> 0..* Reservas; 1 Laboratorio -> 0..* Reservas
 */
class Reserva {
  /**
   * @param {Professor} professor 
   * @param {Laboratorio} laboratorio 
   * @param {string} data - Formato ISO YYYY-MM-DD
   * @param {string} horario - Faixa de horário (Ex: '08:00 – 10:00')
   * @param {string} finalidade - 'Aula Regular' | 'Monitoria' | 'Pesquisa' | 'Evento / Workshop'
   */
  constructor(professor, laboratorio, data, horario, finalidade) {
    if (!(professor instanceof Professor)) {
      throw new TypeError("O parâmetro professor deve ser uma instância válida de Professor.");
    }
    if (!(laboratorio instanceof Laboratorio)) {
      throw new TypeError("O parâmetro laboratorio deve ser uma instância válida de Laboratorio.");
    }
    this.id = "res_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    this.professor = professor;
    this.laboratorio = laboratorio;
    this.data = data;
    this.horario = horario;
    this.finalidade = finalidade;
    this.criadaEm = new Date();
  }

  /**
   * Formata a data ISO (YYYY-MM-DD) para formato legível acadêmico (ex.: 24 nov. 2026).
   * @returns {string}
   */
  getDataFormatadaCurta() {
    if (!this.data) return "—";
    const partes = this.data.split("-");
    if (partes.length !== 3) return this.data;
    const [ano, mes, dia] = partes;
    const meses = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    const indiceMes = parseInt(mes, 10) - 1;
    return `${dia} ${meses[indiceMes] || mes} ${ano}`;
  }

  /**
   * Formata a data ISO (YYYY-MM-DD) por extenso para o card lateral (ex.: 24 de novembro de 2026).
   * @returns {string}
   */
  getDataFormatadaExtenso() {
    if (!this.data) return "—";
    const partes = this.data.split("-");
    if (partes.length !== 3) return this.data;
    const [ano, mes, dia] = partes;
    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    const indiceMes = parseInt(mes, 10) - 1;
    return `${dia} de ${meses[indiceMes] || mes} de ${ano}`;
  }
}

/* ==============================================================================
   2. ESTADO DA APLICAÇÃO (IN-MEMORY PERSISTENCE & MOCK DATA)
   ============================================================================== */

/**
 * Carga Inicial Obrigatória conforme Requisitos:
 * 1. Lab 01: 30 alunos | Disponível (true)
 * 2. Lab 02: 40 alunos | Indisponível (false)
 * 3. Lab 03: 25 alunos | Disponível (true) - Restrição de capacidade < 30
 */
const estadoApp = {
  laboratorios: [
    new Laboratorio("lab-01", "Laboratório 01", 30, true, "Pronto para receber sua atividade"),
    new Laboratorio("lab-02", "Laboratório 02", 40, false, "Temporariamente fora de uso"),
    new Laboratorio("lab-03", "Laboratório 03", 25, true, "Restrito: não permitido para aulas regulares")
  ],
  reservas: []
};

/**
 * Inicialização com os dados de demonstração visíveis no layout do PDF da atividade.
 */
function inicializarDadosMock() {
  const prof1 = new Professor("Prof. Rafael Pacheco", "202401587");
  const prof2 = new Professor("Prof.ª Mariana Costa", "202300942");

  const lab1 = estadoApp.laboratorios.find(l => l.id === "lab-01");
  const lab3 = estadoApp.laboratorios.find(l => l.id === "lab-03");

  if (lab1) {
    estadoApp.reservas.push(
      new Reserva(prof1, lab1, "2026-11-24", "08:00 – 10:00", "Aula Regular")
    );
  }
  if (lab3) {
    estadoApp.reservas.push(
      new Reserva(prof2, lab3, "2026-11-25", "14:00 – 16:00", "Monitoria")
    );
  }
}

/* ==============================================================================
   3. REFERÊNCIAS DO DOM (DOCUMENT OBJECT MODEL)
   ============================================================================== */
const DOM = {
  // Toast
  toast: document.getElementById("toast-sucesso"),
  toastMsg: document.getElementById("toast-mensagem"),
  btnFecharToast: document.getElementById("btn-fechar-toast"),

  // Seção 01: Laboratórios
  labsGrid: document.getElementById("labs-grid"),
  contadorLabs: document.getElementById("contador-labs"),

  // Seção 02: Formulário
  formReserva: document.getElementById("form-reserva"),
  inputNome: document.getElementById("prof-nome"),
  inputMatricula: document.getElementById("prof-matricula"),
  selectLab: document.getElementById("select-laboratorio"),
  selectFinalidade: document.getElementById("select-finalidade"),
  inputData: document.getElementById("reserva-data"),
  selectHorario: document.getElementById("select-horario"),
  alertaPreventivo: document.getElementById("alerta-capacidade-preventivo"),
  alertaErroSubmissao: document.getElementById("alerta-erro-submissao"),
  mensagemErroSubmissao: document.getElementById("mensagem-erro-submissao"),

  // Spans de Erros por Campo
  erroNome: document.getElementById("erro-nome"),
  erroMatricula: document.getElementById("erro-matricula"),
  erroLab: document.getElementById("erro-laboratorio"),
  erroFinalidade: document.getElementById("erro-finalidade"),
  erroData: document.getElementById("erro-data"),
  erroHorario: document.getElementById("erro-horario"),

  // Painel Lateral (Live Preview)
  previewLabNome: document.getElementById("preview-lab-nome"),
  previewLabCapacidade: document.getElementById("preview-lab-capacidade"),
  previewData: document.getElementById("preview-data"),
  previewHorario: document.getElementById("preview-horario"),
  previewFinalidade: document.getElementById("preview-finalidade"),
  previewStatusBox: document.getElementById("preview-status-box"),
  previewStatusTitulo: document.getElementById("preview-status-titulo"),
  previewStatusDesc: document.getElementById("preview-status-desc"),
  previewStatusIcon: document.getElementById("preview-status-icon"),

  // Seção 03: Reservas
  corpoTabelaReservas: document.getElementById("corpo-tabela-reservas"),
  reservasMobileCards: document.getElementById("reservas-mobile-cards"),
  contadorReservas: document.getElementById("contador-reservas"),
  estadoVazioReservas: document.getElementById("reservas-estado-vazio")
};

let timerToast = null;

/* ==============================================================================
   4. PIPELINE DE CASOS DE USO (UML 01: <<include>>)
   ============================================================================== */

/**
 * RF01 — CONSULTAR LABORATÓRIOS
 * Renderiza os cards informativos de cada laboratório e popula as opções do <select>.
 */
function renderizarLaboratorios() {
  DOM.labsGrid.innerHTML = "";

  // Reset e opção padrão do <select>
  DOM.selectLab.innerHTML = '<option value="" disabled selected>Selecione um laboratório</option>';

  estadoApp.laboratorios.forEach(lab => {
    // --- Renderização do Card na Seção 01 ---
    const card = document.createElement("article");
    card.className = `lab-card ${lab.disponivel ? "" : "lab-card--unavailable"}`;
    card.setAttribute("aria-label", `${lab.nome}, capacidade para ${lab.capacidade} alunos, ${lab.disponivel ? "Disponível" : "Indisponível"}`);

    const badgeStatusHtml = lab.disponivel
      ? `<span class="lab-badge lab-badge--available"><span class="badge-dot"></span>Disponível</span>`
      : `<span class="lab-badge lab-badge--unavailable"><span class="badge-dot"></span>Indisponível</span>`;

    // Aviso do Slide 9 embutido no card do Lab 03 (< 30)
    const avisoRestricaoHtml = (!lab.permiteAulaRegular() && lab.disponivel)
      ? `
        <div class="lab-card__restriction-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Restrito: não permitido para aulas regulares</span>
        </div>
      `
      : "";

    card.innerHTML = `
      <div class="lab-card__top">
        <div class="lab-card__icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        ${badgeStatusHtml}
      </div>
      <div class="lab-card__body">
        <h3 class="lab-card__title">${lab.nome}</h3>
        <p class="lab-card__capacity">Capacidade: ${lab.capacidade} alunos</p>
        <p class="lab-card__status-msg">${lab.notaInformativa}</p>
        ${avisoRestricaoHtml}
      </div>
    `;

    DOM.labsGrid.appendChild(card);

    // --- População do Select no Formulário (RF02) ---
    const option = document.createElement("option");
    option.value = lab.id;

    if (!lab.disponivel) {
      option.disabled = true;
      option.textContent = `${lab.nome} (Indisponível)`;
    } else {
      option.textContent = `${lab.nome} (${lab.capacidade} alunos)`;
    }

    DOM.selectLab.appendChild(option);
  });

  if (DOM.contadorLabs) {
    DOM.contadorLabs.textContent = `${estadoApp.laboratorios.length} espaços cadastrados`;
  }
}

/**
 * RF03 — VALIDAR RESERVA
 * Executa todas as regras de negócio antes de permitir a conclusão da reserva.
 * 
 * Regras Validadas:
 * 1. Campos obrigatórios preenchidos e não em branco.
 * 2. Disponibilidade do laboratório (bloqueio do Lab 02).
 * 3. Regra de Negócio (Slide 9): capacidade < 30 não permite "Aula Regular".
 * 4. Prevenção de conflito de agenda (mesmo laboratório, data e horário).
 * 
 * @param {Object} dados
 * @returns {{valido: boolean, erros: Object, mensagemGeral: string|null}}
 */
function validarReserva(dados) {
  const erros = {};
  let mensagemGeral = null;

  // 1. Validação de campos vazios ou apenas espaços
  if (!dados.nome || dados.nome.trim().length === 0) {
    erros.nome = "O nome do professor é obrigatório.";
  }

  if (!dados.matricula || dados.matricula.trim().length === 0) {
    erros.matricula = "A matrícula do professor é obrigatória.";
  }

  if (!dados.laboratorioId) {
    erros.laboratorioId = "Selecione um laboratório válido.";
  }

  if (!dados.data) {
    erros.data = "Informe a data da reserva.";
  }

  if (!dados.horario) {
    erros.horario = "Selecione o horário desejado.";
  }

  if (!dados.finalidade) {
    erros.finalidade = "Selecione a finalidade da reserva.";
  }

  if (Object.keys(erros).length > 0) {
    return {
      valido: false,
      erros,
      mensagemGeral: "Por favor, preencha todos os campos obrigatórios sinalizados."
    };
  }

  // Obter a instância do laboratório selecionado
  const laboratorio = estadoApp.laboratorios.find(l => l.id === dados.laboratorioId);
  if (!laboratorio) {
    return {
      valido: false,
      erros: { laboratorioId: "Laboratório não encontrado no sistema." },
      mensagemGeral: "Laboratório inválido."
    };
  }

  // 2. Validação de Disponibilidade
  if (!laboratorio.disponivel) {
    return {
      valido: false,
      erros: { laboratorioId: "Este laboratório está indisponível para reservas." },
      mensagemGeral: `O ${laboratorio.nome} está temporariamente fora de uso.`
    };
  }

  // 3. Regra do Slide 9 (Mudança de Requisito Crítica):
  // "Laboratórios com capacidade inferior a 30 alunos não podem ser reservados para aulas regulares."
  if (dados.finalidade === "Aula Regular" && !laboratorio.permiteAulaRegular()) {
    return {
      valido: false,
      erros: {
        finalidade: `O ${laboratorio.nome} (${laboratorio.capacidade} alunos) não comporta aulas regulares.`
      },
      mensagemGeral: "Atenção: Laboratórios com capacidade inferior a 30 alunos não podem ser reservados para aulas regulares."
    };
  }

  // 4. Prevenção de Conflito de Horário (Engenharia de Software Robusta)
  const conflitoExistente = estadoApp.reservas.some(r => 
    r.laboratorio.id === laboratorio.id &&
    r.data === dados.data &&
    r.horario === dados.horario
  );

  if (conflitoExistente) {
    return {
      valido: false,
      erros: {
        horario: "Conflito de agenda neste horário.",
        data: "Laboratório já reservado nesta data."
      },
      mensagemGeral: `Conflito de horário: O ${laboratorio.nome} já possui uma reserva confirmada para este horário.`
    };
  }

  return { valido: true, erros: {}, mensagemGeral: null };
}

/**
 * RF04 — CONFIRMAR RESERVA
 * Realiza o registro oficial da reserva, feedback visual e atualização de tela.
 * 
 * @param {Object} dadosValidos 
 */
function confirmarReserva(dadosValidos) {
  const laboratorio = estadoApp.laboratorios.find(l => l.id === dadosValidos.laboratorioId);
  const professor = new Professor(dadosValidos.nome, dadosValidos.matricula);

  const novaReserva = new Reserva(
    professor,
    laboratorio,
    dadosValidos.data,
    dadosValidos.horario,
    dadosValidos.finalidade
  );

  // Inserção no início da lista (LIFO) para visibilidade imediata
  estadoApp.reservas.unshift(novaReserva);

  // Limpa o formulário e erros visuais
  limparErrosVisuais();
  DOM.formReserva.reset();

  // Reset do painel de Live Preview
  atualizarLivePreview();

  // Atualiza listagem dinâmica (RF05)
  renderizarReservas();

  // Exibe o Toast de confirmação visual (RF04)
  exibirToast(`Reserva confirmada com sucesso para ${laboratorio.nome}!`);
}

/**
 * RF02 — REALIZAR RESERVA (Orquestrador do Submit)
 * Intercepta o evento de submit e executa a cadeia de <<include>>:
 * Realizar Reserva -> Validar Reserva (RF03) -> Confirmar Reserva (RF04)
 * 
 * @param {Event} event 
 */
function handleSubmissaoReserva(event) {
  event.preventDefault();

  const dadosForm = {
    nome: DOM.inputNome.value.trim(),
    matricula: DOM.inputMatricula.value.trim(),
    laboratorioId: DOM.selectLab.value,
    finalidade: DOM.selectFinalidade.value,
    data: DOM.inputData.value,
    horario: DOM.selectHorario.value
  };

  limparErrosVisuais();

  // Executa validação de negócio (RF03)
  const resultadoValidacao = validarReserva(dadosForm);

  if (!resultadoValidacao.valido) {
    // Exibe erros específicos em cada input
    aplicarErrosNosCampos(resultadoValidacao.erros);

    // Exibe banner geral de erro
    if (resultadoValidacao.mensagemGeral) {
      DOM.mensagemErroSubmissao.textContent = resultadoValidacao.mensagemGeral;
      DOM.alertaErroSubmissao.classList.remove("alert-box--hidden");
    }

    // Scroll suave até o alerta de erro se necessário
    DOM.alertaErroSubmissao.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }

  // Se válido, confirma a reserva (RF04)
  confirmarReserva(dadosForm);
}

/**
 * RF05 — LISTAR RESERVAS
 * Exibe a lista completa de reservas confirmadas na sessão (Tabela Desktop + Cards Mobile).
 */
function renderizarReservas() {
  DOM.corpoTabelaReservas.innerHTML = "";
  DOM.reservasMobileCards.innerHTML = "";

  const total = estadoApp.reservas.length;
  DOM.contadorReservas.textContent = `${total} ${total === 1 ? "reserva nesta sessão" : "reservas nesta sessão"}`;

  if (total === 0) {
    DOM.estadoVazioReservas.classList.remove("empty-state--hidden");
    return;
  }

  DOM.estadoVazioReservas.classList.add("empty-state--hidden");

  estadoApp.reservas.forEach(reserva => {
    const badgeClasse = obterClasseBadgeFinalidade(reserva.finalidade);

    // --- 1. Linha da Tabela (Desktop) ---
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <span class="table-cell-main">${reserva.laboratorio.nome}</span>
        <span class="table-cell-sub">Capacidade: ${reserva.laboratorio.capacidade} alunos</span>
      </td>
      <td>
        <span class="table-cell-main">${reserva.professor.nome}</span>
        <span class="table-cell-sub">Matrícula ${reserva.professor.matricula}</span>
      </td>
      <td>
        <span class="table-cell-main">${reserva.getDataFormatadaCurta()}</span>
      </td>
      <td>
        <span class="table-cell-main">${reserva.horario}</span>
      </td>
      <td>
        <span class="finalidade-badge ${badgeClasse}">${reserva.finalidade}</span>
      </td>
    `;
    DOM.corpoTabelaReservas.appendChild(tr);

    // --- 2. Card Mobile (Layout Fluido / RNF02) ---
    const cardMob = document.createElement("div");
    cardMob.className = "reserva-mobile-card";
    cardMob.innerHTML = `
      <div class="reserva-mobile-card__header">
        <h4 class="reserva-mobile-card__title">${reserva.laboratorio.nome}</h4>
        <span class="finalidade-badge ${badgeClasse}">${reserva.finalidade}</span>
      </div>
      <p class="reserva-mobile-card__prof">${reserva.professor.nome}</p>
      <p class="reserva-mobile-card__mat">Matrícula ${reserva.professor.matricula}</p>
      <div class="reserva-mobile-card__grid">
        <div>
          <span class="reserva-mobile-card__meta-label">Data</span>
          <span class="reserva-mobile-card__meta-val">${reserva.getDataFormatadaCurta()}</span>
        </div>
        <div>
          <span class="reserva-mobile-card__meta-label">Horário</span>
          <span class="reserva-mobile-card__meta-val">${reserva.horario}</span>
        </div>
      </div>
    `;
    DOM.reservasMobileCards.appendChild(cardMob);
  });
}

/* ==============================================================================
   5. REATIVIDADE & LIVE PREVIEW ("SUA SOLICITAÇÃO")
   ============================================================================== */

/**
 * Atualiza o painel lateral em tempo real conforme os inputs do formulário são alterados.
 * Garante a regra preventiva visual do Slide 9 antes do submit.
 */
function atualizarLivePreview() {
  const labId = DOM.selectLab.value;
  const finalidade = DOM.selectFinalidade.value;
  const data = DOM.inputData.value;
  const horario = DOM.selectHorario.value;

  const lab = estadoApp.laboratorios.find(l => l.id === labId);

  // Nome e Capacidade
  if (lab) {
    DOM.previewLabNome.textContent = lab.nome;
    DOM.previewLabCapacidade.textContent = `${lab.capacidade} alunos`;
  } else {
    DOM.previewLabNome.textContent = "Nenhum laboratório";
    DOM.previewLabCapacidade.textContent = "—";
  }

  // Data Formatada
  if (data) {
    const partes = data.split("-");
    if (partes.length === 3) {
      const mesesExtenso = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
      ];
      const dia = partes[2];
      const mes = mesesExtenso[parseInt(partes[1], 10) - 1];
      const ano = partes[0];
      DOM.previewData.textContent = `${dia} de ${mes} de ${ano}`;
    } else {
      DOM.previewData.textContent = data;
    }
  } else {
    DOM.previewData.textContent = "—";
  }

  // Horário e Finalidade
  DOM.previewHorario.textContent = horario || "—";
  DOM.previewFinalidade.textContent = finalidade || "—";

  // Alerta Preventivo dentro do Formulário (Slide 9)
  if (lab && !lab.permiteAulaRegular()) {
    DOM.alertaPreventivo.classList.remove("alert-box--hidden");
  } else {
    DOM.alertaPreventivo.classList.add("alert-box--hidden");
  }

  // Card Lateral: Validação Reativa
  if (lab && finalidade === "Aula Regular" && !lab.permiteAulaRegular()) {
    definirStatusPreview(
      "invalid",
      "Revise a finalidade",
      "Aulas regulares exigem um laboratório com 30 lugares ou mais."
    );
  } else if (lab && finalidade) {
    definirStatusPreview(
      "valid",
      "Espaço compatível",
      `O ${lab.nome} atende aos critérios para ${finalidade}.`
    );
  } else {
    definirStatusPreview(
      "neutral",
      "Aguardando dados",
      "Preencha o formulário para visualizar os detalhes e a validação do espaço."
    );
  }
}

/**
 * Modifica as classes e texto do bloco de status no painel lateral.
 * @param {'neutral'|'valid'|'invalid'} tipo 
 * @param {string} titulo 
 * @param {string} desc 
 */
function definirStatusPreview(tipo, titulo, desc) {
  DOM.previewStatusBox.className = `preview-status preview-status--${tipo}`;
  DOM.previewStatusTitulo.textContent = titulo;
  DOM.previewStatusDesc.textContent = desc;

  if (tipo === "invalid") {
    DOM.previewStatusIcon.innerHTML = `
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    `;
    DOM.previewStatusIcon.style.stroke = "var(--color-danger-text)";
  } else if (tipo === "valid") {
    DOM.previewStatusIcon.innerHTML = `
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    `;
    DOM.previewStatusIcon.style.stroke = "var(--color-success-text)";
  } else {
    DOM.previewStatusIcon.innerHTML = `
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    `;
    DOM.previewStatusIcon.style.stroke = "var(--color-text-muted)";
  }
}

/* ==============================================================================
   6. MENSAGENS E FEEDBACK VISUAL
   ============================================================================== */

/**
 * Exibe o Toast global de feedback (RF04).
 * @param {string} mensagem 
 */
function exibirToast(mensagem) {
  DOM.toastMsg.textContent = mensagem;
  DOM.toast.classList.remove("toast--hidden");

  if (timerToast) {
    clearTimeout(timerToast);
  }

  timerToast = setTimeout(() => {
    fecharToast();
  }, 5000);
}

function fecharToast() {
  DOM.toast.classList.add("toast--hidden");
  if (timerToast) {
    clearTimeout(timerToast);
    timerToast = null;
  }
}

/**
 * Remove classes e avisos de erro de todos os campos.
 */
function limparErrosVisuais() {
  DOM.alertaErroSubmissao.classList.add("alert-box--hidden");
  DOM.mensagemErroSubmissao.textContent = "";

  const inputs = [
    DOM.inputNome,
    DOM.inputMatricula,
    DOM.selectLab,
    DOM.selectFinalidade,
    DOM.inputData,
    DOM.selectHorario
  ];
  inputs.forEach(el => el.classList.remove("is-invalid"));

  const errorSpans = [
    DOM.erroNome,
    DOM.erroMatricula,
    DOM.erroLab,
    DOM.erroFinalidade,
    DOM.erroData,
    DOM.erroHorario
  ];
  errorSpans.forEach(span => {
    span.textContent = "";
  });
}

/**
 * Aplica os erros recebidos da validação nos campos correspondentes.
 * @param {Object} erros 
 */
function aplicarErrosNosCampos(erros) {
  if (erros.nome) {
    DOM.inputNome.classList.add("is-invalid");
    DOM.erroNome.textContent = erros.nome;
  }
  if (erros.matricula) {
    DOM.inputMatricula.classList.add("is-invalid");
    DOM.erroMatricula.textContent = erros.matricula;
  }
  if (erros.laboratorioId) {
    DOM.selectLab.classList.add("is-invalid");
    DOM.erroLab.textContent = erros.laboratorioId;
  }
  if (erros.finalidade) {
    DOM.selectFinalidade.classList.add("is-invalid");
    DOM.erroFinalidade.textContent = erros.finalidade;
  }
  if (erros.data) {
    DOM.inputData.classList.add("is-invalid");
    DOM.erroData.textContent = erros.data;
  }
  if (erros.horario) {
    DOM.selectHorario.classList.add("is-invalid");
    DOM.erroHorario.textContent = erros.horario;
  }
}

/**
 * Retorna a classe CSS correspondente para o badge de finalidade.
 * @param {string} finalidade 
 * @returns {string}
 */
function obterClasseBadgeFinalidade(finalidade) {
  switch (finalidade) {
    case "Aula Regular":
      return "finalidade-badge--aula-regular";
    case "Monitoria":
      return "finalidade-badge--monitoria";
    case "Pesquisa":
      return "finalidade-badge--pesquisa";
    case "Evento / Workshop":
      return "finalidade-badge--evento-workshop";
    default:
      return "finalidade-badge--aula-regular";
  }
}

/* ==============================================================================
   7. EVENT LISTENERS E BOOTSTRAP DA APLICAÇÃO
   ============================================================================== */
function configurarEventListeners() {
  // Submissão do Formulário de Reserva
  DOM.formReserva.addEventListener("submit", handleSubmissaoReserva);

  // Fechamento manual do Toast
  DOM.btnFecharToast.addEventListener("click", fecharToast);

  // Listeners de reatividade para o Live Preview e limpeza de erro ao digitar
  const camposReativos = [
    DOM.selectLab,
    DOM.selectFinalidade,
    DOM.inputData,
    DOM.selectHorario
  ];

  camposReativos.forEach(campo => {
    campo.addEventListener("change", () => {
      campo.classList.remove("is-invalid");
      atualizarLivePreview();
    });
  });

  // Limpeza de erros ao digitar nome e matrícula
  [DOM.inputNome, DOM.inputMatricula].forEach(input => {
    input.addEventListener("input", () => {
      input.classList.remove("is-invalid");
      const spanErro = input.id === "prof-nome" ? DOM.erroNome : DOM.erroMatricula;
      if (spanErro) spanErro.textContent = "";
    });
  });
}

/**
 * Ponto de Entrada da Aplicação (DOMContentLoaded)
 */
document.addEventListener("DOMContentLoaded", () => {
  inicializarDadosMock();
  renderizarLaboratorios();
  renderizarReservas();
  atualizarLivePreview();
  configurarEventListeners();
});
