# Sistema de Reserva de Laboratórios
### Atividade Prática: *Do UML ao Software*
**Disciplina:** Maturidade em Desenvolvimento de Software  
**Instituição:** UNINASSAU  
**Docente:** Prof. Rafael Pacheco Ferreira  

---

## 1. Visão Geral e Objetivo do Projeto

O **Sistema de Reserva de Laboratórios** é uma solução web *front-end* desenvolvida para informatizar e organizar o agendamento de espaços acadêmicos no portal docente universitário. O projeto foi concebido a partir da interpretação e tradução rigorosa de artefatos clássicos de Engenharia de Software (Diagrama de Casos de Uso e Diagrama de Classes UML), demonstrando a transição fluida entre a modelagem conceitual e a implementação de código pronto para produção.

A aplicação opera de forma 100% autônoma no navegador (*client-side*), com persistência em memória durante a sessão, sem necessidade de servidores de backend ou dependências externas de terceiros.

---

## 2. Arquitetura e Decisões Técnicas

### 2.1. Stack Tecnológica Exclusiva
* **HTML5 Semântico:** Uso estruturado de elementos como `<header>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<table>` e `<form>`, garantindo acessibilidade (WAI-ARIA) e legibilidade.
* **CSS3 Moderno:** Arquitetura baseada em variáveis CSS (*Design Tokens*), layout bidimensional com CSS Grid e Flexbox, design *Mobile-First* e ausência de *frameworks* pesados (como Bootstrap ou Tailwind).
* **JavaScript Puro (Vanilla ES6+):** Código estruturado com Classes ECMAScript 2015+, funções puras de validação, manipulação direta e performática do DOM e tratamento de eventos reativos.

### 2.2. Estrutura de Arquivos
```text
sistema-reserva-laboratorios/
├── index.html        # Estrutura semântica e esqueleto das 3 seções da interface
├── style.css         # Design system institucional, temas, grid e responsividade
├── script.js         # Modelos OO, regras de negócio, pipeline <<include>> e DOM
└── README.md         # Documentação técnica e de engenharia de software
```

### 2.3. Modelagem Orientada a Objetos (UML 02)
O código em `script.js` reflete fielmente as entidades especificadas no Diagrama de Classes:
* **Classe `Professor`:** Encapsula os atributos `nome` (string) e `matricula` (string).
* **Classe `Laboratorio`:** Encapsula `id`, `nome` (string), `capacidade` (number), `disponivel` (boolean) e o método de domínio `permiteAulaRegular()`.
* **Classe `Reserva`:** Representa a associação entre um `Professor` (1) e um `Laboratorio` (1) para uma determinada `data`, `horario` e `finalidade`. Implementa formatação amigável de datas.

### 2.4. Tratamento de Indisponibilidade (Laboratório 02)
Para honrar o estado inicial do **Laboratório 02** (`disponivel: false`), foram implementadas três camadas de proteção em conformidade com as boas práticas de Engenharia de Software:
1. **Camada Visual Informativa:** O card exibe o badge semântico `• Indisponível` e nota explicativa (*"Temporariamente fora de uso"*).
2. **Camada de Interface (UI Guard):** No formulário de agendamento, a respectiva tag `<option>` recebe a propriedade `disabled`, impedindo sua seleção comum.
3. **Camada de Domínio / Regra de Negócio (JS):** A função `validarReserva()` verifica explicitamente a propriedade `laboratorio.disponivel`. Qualquer tentativa de submissão forçada é imediatamente interceptada e bloqueada com mensagem de erro clara.

---

## 3. Matriz de Rastreabilidade de Requisitos

A tabela abaixo correlaciona os requisitos da especificação e casos de uso com os componentes de interface e blocos de código implementados:

| ID Requisito | Tipo | Descrição Sumária | Implementação na Interface (UI) | Implementação no Código |
| :--- | :--- | :--- | :--- | :--- |
| **RF01** | Funcional | Consultar Laboratórios | Seção `01`: Grid de cards com nome, capacidade, status e restrições. | `script.js` &rarr; `renderizarLaboratorios()` |
| **RF02** | Funcional | Realizar Reserva | Seção `02`: Formulário com inputs de Professor, Matrícula, Lab, Data, Horário e Finalidade. | `index.html` &rarr; `<form id="form-reserva">` / `script.js` &rarr; `handleSubmissaoReserva()` |
| **RF03** | Funcional | Validar Reserva (`<<include>>`) | Destaques vermelhos nos campos, mensagens de erro contextuais e banner de bloqueio. | `script.js` &rarr; `validarReserva()` |
| **RF04** | Funcional | Confirmar Reserva (`<<include>>`) | Banner flutuante (*toast*) superior verde animado com mensagem de sucesso. | `script.js` &rarr; `confirmarReserva()` / `exibirToast()` |
| **RF05** | Funcional | Listar Reservas | Seção `03`: Tabela detalhada em desktop e lista de cards individuais em mobile. | `script.js` &rarr; `renderizarReservas()` |
| **RNF01** | Não Funcional | Usabilidade e Hierarquia | Paleta institucional azul-marinho, divisão clara em três seções numeradas e painel lateral *Live Preview*. | `style.css` (Design Tokens e layouts modulares) |
| **RNF02** | Não Funcional | Responsividade | Layout adaptável via Media Queries: 1 coluna em mobile e grid 3 colunas / 2 colunas em telas amplas. | `style.css` (`@media (min-width: 640px)` e `@media (min-width: 992px)`) |

---

## 4. Análise de Impacto da Mudança de Requisito (Slide 9)

> **Mudança Introduzida:**  
> *"Laboratórios com capacidade inferior a 30 alunos não podem ser reservados para aulas regulares."*

Em resposta às 4 perguntas analíticas propostas no material da disciplina:

### 1. Quais requisitos foram afetados?
* **RF01 (Consultar Laboratórios):** Passou a exigir a comunicação preventiva da restrição de capacidade no catálogo.
* **RF02 (Realizar Reserva):** Exigiu a criação de um componente reativo no formulário para alertar o professor no momento da escolha.
* **RF03 (Validar Reserva):** Teve sua lógica de validação expandida com uma regra condicional composta: se a finalidade for `"Aula Regular"`, a capacidade do laboratório obrigatoriamente deve ser $\ge 30$.
* **RNF01 (Usabilidade):** Afetado positivamente pela inclusão de mensagens orientativas preventivas, evitando que o docente só descubra a incompatibilidade após preencher todo o formulário.

### 2. O que mudou na interface?
1. **Card de Consulta do Laboratório 03:** Inclusão de um selo de aviso âmbar: `⚠️ Restrito: não permitido para aulas regulares`.
2. **Formulário de Reserva:** Exibição dinâmica de uma caixa de alerta preventiva amarela (`#alerta-capacidade-preventivo`) assim que o Laboratório 03 é selecionado.
3. **Painel Lateral ("SUA SOLICITAÇÃO"):** Feedback instantâneo com sinalizador vermelho `Revise a finalidade: Aulas regulares exigem um laboratório com 30 lugares ou mais` quando a combinação inválida é configurada.
4. **Banner de Submissão:** Caixa de erro em vermelho escuro com o texto exato do requisito caso haja tentativa de envio.

### 3. Qual validação foi criada?
Na classe de domínio `Laboratorio`, foi adicionado o método:
```javascript
permiteAulaRegular() {
  return this.capacidade >= 30;
}
```
Na função `validarReserva(dados)`, foi inserida a regra impeditiva:
```javascript
if (dados.finalidade === "Aula Regular" && !laboratorio.permiteAulaRegular()) {
  return {
    valido: false,
    erros: { finalidade: "O espaço não comporta aulas regulares." },
    mensagemGeral: "Atenção: Laboratórios com capacidade inferior a 30 alunos não podem ser reservados para aulas regulares."
  };
}
```

### 4. Quais cenários de teste comprovam a mudança?
| ID | Laboratório | Capacidade | Finalidade | Resultado Esperado | Validação da Regra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CT-M01** | Lab 03 | 25 alunos | Aula Regular | **Bloqueio** com mensagem de erro | ✅ Valida o impedimento do Slide 9 |
| **CT-M02** | Lab 03 | 25 alunos | Monitoria | **Sucesso** e reserva confirmada | ✅ Garante que o Lab 03 permanece útil para outras atividades |
| **CT-M03** | Lab 03 | 25 alunos | Pesquisa | **Sucesso** e reserva confirmada | ✅ Valida permissão para atividades extracurriculares |
| **CT-M04** | Lab 01 | 30 alunos | Aula Regular | **Sucesso** e reserva confirmada | ✅ Valida que laboratórios com 30 lugares aceitam aulas |

---

## 5. Roteiro de Testes Manuais (QA)

Execute os seguintes passos para validação completa de qualidade no navegador:

### Teste 1: Fluxo Feliz (Reserva Válida de Aula Regular)
1. Preencha **Nome do Professor**: `Prof. Carlos Eduardo`.
2. Preencha **Matrícula**: `202409999`.
3. Selecione **Laboratório**: `Laboratório 01 (30 alunos)`.
4. Selecione **Finalidade**: `Aula Regular`.
5. Selecione uma **Data** futura e um **Horário** (ex.: `10:00 – 12:00`).
6. Clique em **Confirmar Reserva**.
7. **Resultado Esperado:** Toast verde exibido no topo (*"Reserva confirmada com sucesso..."*), formulário limpo, e nova linha inserida no topo da tabela da Seção 03.

### Teste 2: Campos Obrigatórios Vazios
1. Com o formulário limpo, clique diretamente em **Confirmar Reserva**.
2. **Resultado Esperado:** O envio é impedido; bordas vermelhas e mensagens de campo obrigatório aparecem sob cada campo; banner geral de erro é ativado.

### Teste 3: Tentativa de Reserva em Laboratório Indisponível
1. Abra o campo *dropdown* de **Laboratório**.
2. Verifique se o item `Laboratório 02 (Indisponível)` está desabilitado (`disabled`).
3. **Resultado Esperado:** Não é possível selecionar o Laboratório 02 pelo mouse ou teclado.

### Teste 4: Tentativa Inválida da Regra de Capacidade (Slide 9)
1. Selecione **Laboratório**: `Laboratório 03 (25 alunos)`.
2. Selecione **Finalidade**: `Aula Regular`.
3. Observe o painel lateral *Sua Solicitação* acusando o status de revisão.
4. Preencha os demais campos e clique em **Confirmar Reserva**.
5. **Resultado Esperado:** Submissão bloqueada. Exibição do banner vermelho com o texto:  
   *`Atenção: Laboratórios com capacidade inferior a 30 alunos não podem ser reservados para aulas regulares.`*

### Teste 5: Sucesso no Laboratório 03 com Finalidade Permitida
1. Mantendo o `Laboratório 03 (25 alunos)`, altere a **Finalidade** para `Monitoria` ou `Pesquisa`.
2. Clique em **Confirmar Reserva**.
3. **Resultado Esperado:** Reserva aceita e confirmada com sucesso!

### Teste 6: Prevenção de Conflito de Horário (Engenharia de Software)
1. Tente registrar uma nova reserva para o `Laboratório 01`, na mesma data `24/11/2026` e no horário `08:00 – 10:00` (que já consta na carga mock inicial).
2. **Resultado Esperado:** O sistema recusa o agendamento informando que o laboratório já se encontra ocupado naquele intervalo.

---

## 6. Instruções de Execução Local

Como o projeto utiliza estritamente tecnologias nativas dos navegadores modernos (*Zero Dependencies*), nenhuma instalação de pacotes (`npm`, `yarn`) ou servidor web é requerida.

### Método 1: Execução Direta
1. Navegue até a pasta do projeto:
   ```text
   C:\Users\Luiz Eduardo\.gemini\antigravity\scratch\sistema-reserva-laboratorios\
   ```
2. Dê um duplo clique no arquivo `index.html` para abri-lo em qualquer navegador moderno (Google Chrome, Microsoft Edge, Mozilla Firefox ou Safari).

### Método 2: Servidor Local Estático (Opcional)
Se preferir rodar com um servidor estático leve via terminal:
```bash
# Com Python 3 instalado:
python -m http.server 8080

# Ou com utilitários npx:
npx serve .
```
Acesse `http://localhost:8080` no navegador.
