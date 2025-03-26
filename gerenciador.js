const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class Tarefa {
    constructor(titulo, prioridade) {
        this.titulo = titulo;
        this.prioridade = prioridade;
        this.concluida = false;
    }
    concluir() {
        this.concluida = true;
    }
}

class ListaTarefas {
    constructor() {
        this.tarefas = new Map();
    }
    adicionarTarefa(tarefa) {
        if (!this.tarefas.has(tarefa.prioridade)) {
            this.tarefas.set(tarefa.prioridade, []);
        }
        this.tarefas.get(tarefa.prioridade).push(tarefa);
    }
    obterIterador() {
        return new IteradorTarefas(this.tarefas);
    }
    listarTarefas() {
        return Array.from(this.tarefas.values()).flat();
    }
}

class IteradorTarefas {
    constructor(tarefas) {
        this.tarefas = Array.from(tarefas.values()).flat();
        this.indice = 0;
    }
    hasNext() {
        return this.indice < this.tarefas.length;
    }
    next() {
        return this.hasNext() ? this.tarefas[this.indice++] : null;
    }
    reset() {
        this.indice = 0;
    }
}

class ComandoCriarTarefa {
    constructor(listaTarefas, tarefa) {
        this.listaTarefas = listaTarefas;
        this.tarefa = tarefa;
    }
    executar() {
        this.listaTarefas.adicionarTarefa(this.tarefa);
        HistoricoComandos.adicionarComando(`Criada: ${this.tarefa.titulo}`);
    }
}

class ComandoConcluirTarefa {
    constructor(tarefa) {
        this.tarefa = tarefa;
    }
    executar() {
        this.tarefa.concluir();
        ObservadorTarefaConcluida.notificar(this.tarefa);
        HistoricoComandos.adicionarComando(`Concluída: ${this.tarefa.titulo}`);
    }
}

class FiltroPrioridade {
    static filtrar(listaTarefas, prioridade) {
        return listaTarefas.tarefas.get(prioridade) || [];
    }
}

class ObservadorTarefaConcluida {
    static observadores = [];
    static adicionarObservador(observador) {
        this.observadores.push(observador);
    }
    static notificar(tarefa) {
        this.observadores.forEach(obs => obs(tarefa));
    }
}

class HistoricoComandos {
    static historico = [];
    static adicionarComando(comando) {
        this.historico.push(comando);
    }
    static listarComandos() {
        return this.historico;
    }
}

const listaTarefas = new ListaTarefas();
ObservadorTarefaConcluida.adicionarObservador((tarefa) => {
    console.log(`Notificação: A tarefa "${tarefa.titulo}" foi concluída.`);
});

function menu() {
    console.log("\nGerenciador de Tarefas:");
    console.log("1. Adicionar tarefa");
    console.log("2. Concluir tarefa");
    console.log("3. Listar tarefas");
    console.log("4. Ver histórico de comandos");
    console.log("5. Sair");
    rl.question("Escolha uma opção: ", (opcao) => {
        switch (opcao) {
            case "1":
                rl.question("Título da tarefa: ", (titulo) => {
                    rl.question("Prioridade (alta, média, baixa): ", (prioridade) => {
                        const tarefa = new Tarefa(titulo, prioridade);
                        new ComandoCriarTarefa(listaTarefas, tarefa).executar();
                        console.log("Tarefa adicionada!");
                        menu();
                    });
                });
                break;
            case "2":
                const tarefas = listaTarefas.listarTarefas();
                if (tarefas.length === 0) {
                    console.log("Nenhuma tarefa disponível para concluir.");
                    return menu();
                }
                console.log("Tarefas disponíveis:");
                tarefas.forEach((t, i) => console.log(`${i + 1}. ${t.titulo} - ${t.prioridade}`));
                rl.question("Escolha o número da tarefa para concluir: ", (indice) => {
                    const tarefa = tarefas[parseInt(indice) - 1];
                    if (tarefa) {
                        new ComandoConcluirTarefa(tarefa).executar();
                        console.log("Tarefa concluída!");
                    } else {
                        console.log("Opção inválida.");
                    }
                    menu();
                });
                break;
            case "3":
                const todasTarefas = listaTarefas.listarTarefas();
                if (todasTarefas.length === 0) {
                    console.log("Nenhuma tarefa cadastrada.");
                } else {
                    console.log("Lista de tarefas:");
                    todasTarefas.forEach((t) => console.log(`- ${t.titulo} (${t.prioridade}) [${t.concluida ? "Concluída" : "Pendente"}]`));
                }
                menu();
                break;
            case "4":
                console.log("Histórico de comandos:", HistoricoComandos.listarComandos());
                menu();
                break;
            case "5":
                rl.close();
                break;
            default:
                console.log("Opção inválida!");
                menu();
        }
    });
}
menu();
