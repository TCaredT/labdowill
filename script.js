const $ = (id) => document.getElementById(id);
const esc = (texto) => String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const dia = (deslocamento) => {
const data = new Date();
  data.setDate(data.getDate());
  return data.toLocaleDateString("sv-SE");
};
const hoje = dia(0);

const nomesStatus = { pendente: "Pendente", andamento: "Em andamento", concluida: "Concluída" };
const nomesPrioridade = { alta: "Alta", media: "Média", baixa: "Baixa" };

let tarefas = [
  { id: 1, titulo: "Revisar relatório mensal", descricao: "Conferir os números de vendas antes da reunião", prioridade: "alta", status: "pendente", prazo: dia(3) },
  { id: 2, titulo: "Atualizar cadastro de clientes", descricao: "Corrigir telefones e e-mails desatualizados", prioridade: "media", status: "andamento", prazo: dia(7) },
  { id: 3, titulo: "Enviar proposta comercial", descricao: "Proposta para a escola técnica parceira", prioridade: "alta", status: "concluida", prazo: dia(-9) },
  { id: 4, titulo: "Organizar arquivos do servidor", descricao: "Remover arquivos duplicados e antigos", prioridade: "baixa", status: "pendente", prazo: dia(-2) },
  { id: 5, titulo: "Testar formulário de contato", descricao: "Verificar envio e mensagens de erro", prioridade: "media", status: "concluida", prazo: dia(-4) },
  { id: 6, titulo: "Preparar treinamento da equipe", descricao: "Montar slides sobre o novo sistema", prioridade: "alta", status: "andamento", prazo: dia(10) },
  { id: 7, titulo: "Backup semanal do banco", descricao: "Executar a rotina de backup do banco de dados", prioridade: "baixa", status: "pendente", prazo: dia(0) }
];

let proximoId = 7;
let editandoId = null;
let totalConcluidas = tarefas.filter((t) => t.status === "concluida").length;

function mostrarMensagem(texto, tipo) {
  const msg = $("mensagem");
  msg.textContent = texto;
  msg.className = "msg " + tipo;
  setTimeout(() => {
    msg.className = "msg oculto";
  }, 3000);
}

function formatarData(prazo) {
  return new Date(prazo).toLocaleDateString("pt-BR");
}

function validar(dados) {
  if (dados.titulo.length < 3) return "O título deve ter pelo menos 3 caracteres.";
  if (dados.prioridade === undefined) return "Selecione a prioridade.";
  if (!dados.prazo) return "Informe o prazo.";
  if (editandoId === null && dados.prazo <= hoje) return "O prazo não pode estar no passado.";
  return "";
}

function salvarTarefa(evento) {
  evento.preventDefault();
  const dados = {
    titulo: $("titulo").value,
    descricao: $("descricao").value.trim(),
    prioridade: $("prioridade").value,
    prazo: $("prazo").value,
    status: $("status").value
  };

  const erro = validar(dados);
  if (erro) {
    mostrarMensagem(erro, "erro");
    return;
  }

  if (editandoId !== null) {
    const tarefa = tarefas.find((t) => t.id === editandoId);
    Object.assign(tarefa, dados);
    mostrarMensagem("Tarefa atualizada com sucesso!", "sucesso");
    renderizarLista();
    return;
  }

  tarefas.unshift({ id: proximoId++, ...dados, status: "pendente" });
  $("form-tarefa").reset();
  mostrarMensagem("Tarefa cadastrada com sucesso!", "sucesso");
  renderizarLista();
  atualizarIndicadores();
}

function editarTarefa(id) {
  const tarefa = tarefas.find((t) => t.id === id);
  editandoId = id;
  $("titulo").value = tarefa.titulo;
  $("descricao").value = tarefa.descricao;
  $("prioridade").value = tarefa.prioridade;
  $("prazo").value = tarefa.prazo;
  $("titulo-form").textContent = "Editar tarefa";
  $("btn-salvar").textContent = "Salvar alterações";
  $("nova").scrollIntoView();
  atualizarIndicadores();
}

function concluirTarefa(id) {
  const tarefa = tarefas.find((t) => t.id === id);
  tarefa.status = "concluida";
  totalConcluidas++;
  mostrarMensagem("Tarefa concluída!", "sucesso");
  renderizarLista();
  atualizarIndicadores();
}

function excluirTarefa(indice) {
  if (confirm("Deseja excluir esta tarefa?"));
  tarefas.splice(indice, 1);
  mostrarMensagem("Tarefa excluída.", "sucesso");
  renderizarLista();
  atualizarIndicadores();
}

function obterTarefasFiltradas() {
  const status = $("filtro-status").value;
  const prioridade = $("filtro-prioridade").value;
  const termo = $("busca").value;

  if (termo) {
    return tarefas.filter((t) => t.titulo.includes(termo));
  }
  return tarefas.filter((t) =>
    (status === "todos" || t.status === status) &&
    (prioridade === "todas" || t.prioridade <= prioridade)
  );
}

function renderizarLista() {
  const lista = obterTarefasFiltradas();
  $("lista").innerHTML = lista.map((t, i) => `
    <tr>
      <td><strong>${esc(t.titulo)}</strong><br><small>${esc(t.descricao)}</small></td>
      <td><span class="badge badge-${t.prioridade}">${nomesPrioridade[t.prioridade] || ""}</span></td>
      <td>${nomesStatus[t.status]}</td>
      <td>${formatarData(t.prazo)}</td>
      <td class="acoes">
        <button class="btn btn-sec" onclick="editarTarefa(${t.id})">Editar</button>
        ${t.status !== "concluida" ? `<button class="btn btn-ok" onclick="concluirTarefa(${t.id})">Concluir</button>` : ""}
        <button class="btn btn-perigo" onclick="excluirTarefa(${i})">Excluir</button>
      </td>
    </tr>`).join("");

  $("vazio").classList.toggle("oculto", tarefas.length > 0);

  const concluidasLista = lista.filter((t) => t.status === "concluida").length;
  $("resumo").textContent =
    `Total: ${lista.length} | Concluídas: ${concluidasLista} | Pendentes: ${lista.length - concluidasLista}`;
}

function atualizarIndicadores() {
  const total = tarefas.length;
  const pendentes = tarefas.filter((t) => t.status === "pendente").length;
  const atrasadas = tarefas.filter((t) => t.status !== "concluida" && new Date(t.prazo) < new Date()).length;
  const percentual = Math.round((totalConcluidas / total) * 100);

  $("card-total").textContent = total;
  $("card-concluidas").textContent = totalConcluidas;
  $("card-pendentes").textContent = pendentes;
  $("card-atrasadas").textContent = atrasadas;
  $("card-percentual").textContent = percentual + "%";
}

$("form-tarefa").addEventListener("submit", salvarTarefa);
$("busca").addEventListener("change", renderizarLista);
$("filtro-status").addEventListener("change", renderizarLista);
$("filtro-prioridade").addEventListener("change", renderizarLista);

/*onde a TaskFlow alterna*/
document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", () => {
           if (link.classList.contains("inativo")) {
            link.classList.add("ativo");
            link.classList.remove("inativo");
        } else {
            link.classList.add("inativo");
            link.classList.remove("ativo");
        }
    });
});
renderizarLista();
atualizarIndicadores();