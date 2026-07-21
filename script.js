const form = document.getElementById("form-tarefa");
const input = document.getElementById("input-tarefa");
const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const vazio = document.getElementById("vazio");
const botaoLimpar = document.getElementById("limpar");
const botaoTema = document.getElementById("tema");
const botoesFiltro = document.querySelectorAll(".filtro");

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let filtroAtual = "todas";

function salvar() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function tarefasFiltradas() {
  if (filtroAtual === "ativas") return tarefas.filter((t) => !t.concluida);
  if (filtroAtual === "concluidas") return tarefas.filter((t) => t.concluida);
  return tarefas;
}

function atualizarRodape() {
  const pendentes = tarefas.filter((t) => !t.concluida).length;
  contador.textContent = `${pendentes} pendente(s) de ${tarefas.length}`;
  vazio.style.display = tarefasFiltradas().length === 0 ? "block" : "none";
}

function criarItem(tarefa) {
  const indiceReal = tarefas.indexOf(tarefa);

  const li = document.createElement("li");
  if (tarefa.concluida) li.classList.add("concluida");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = tarefa.concluida;
  checkbox.addEventListener("change", () => alternar(indiceReal));

  const span = document.createElement("span");
  span.className = "texto";
  span.textContent = tarefa.texto;
  // Duplo clique para editar
  span.addEventListener("dblclick", () => editar(span, indiceReal));

  const remover = document.createElement("button");
  remover.className = "remover";
  remover.textContent = "✕";
  remover.setAttribute("aria-label", "Remover tarefa");
  remover.addEventListener("click", () => excluir(indiceReal));

  li.append(checkbox, span, remover);
  return li;
}

function renderizar() {
  lista.innerHTML = "";
  tarefasFiltradas().forEach((tarefa) => lista.appendChild(criarItem(tarefa)));
  atualizarRodape();
}

function adicionar(texto) {
  tarefas.push({ texto, concluida: false });
  salvar();
  renderizar();
}

function alternar(indice) {
  tarefas[indice].concluida = !tarefas[indice].concluida;
  salvar();
  renderizar();
}

function excluir(indice) {
  tarefas.splice(indice, 1);
  salvar();
  renderizar();
}

function editar(span, indice) {
  const campo = document.createElement("input");
  campo.type = "text";
  campo.value = tarefas[indice].texto;
  span.replaceWith(campo);
  campo.focus();

  function confirmar() {
    const novo = campo.value.trim();
    if (novo) tarefas[indice].texto = novo;
    salvar();
    renderizar();
  }

  campo.addEventListener("blur", confirmar);
  campo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") campo.blur();
    if (e.key === "Escape") renderizar();
  });
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const texto = input.value.trim();
  if (texto) {
    adicionar(texto);
    input.value = "";
    input.focus();
  }
});

botaoLimpar.addEventListener("click", () => {
  tarefas = tarefas.filter((t) => !t.concluida);
  salvar();
  renderizar();
});

botoesFiltro.forEach((botao) => {
  botao.addEventListener("click", () => {
    botoesFiltro.forEach((b) => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    filtroAtual = botao.dataset.filtro;
    renderizar();
  });
});

// ----- Tema (claro/escuro) -----
function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  botaoTema.textContent = tema === "escuro" ? "☀️" : "🌙";
  localStorage.setItem("tema", tema);
}

botaoTema.addEventListener("click", () => {
  const atual = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
  aplicarTema(atual);
});

aplicarTema(localStorage.getItem("tema") || "claro");
renderizar();
