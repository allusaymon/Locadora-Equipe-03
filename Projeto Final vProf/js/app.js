//PARTE DO MATHEUS:

//Adicionei um método de evento que percebe quando a página é totalmente carregada, pra aí exibir a função que descreverei dps
document.addEventListener('DOMContentLoaded', function () {

//A constante view vai guardar o que o LocalStorage (objeto que guarda dados permanentemente de acesso) perceber.
    const View = localStorage.getItem('modalvisto');

    if (!View) { //Se não tiver nada na Constante View, significa que o site não foi acessado... Então mostra o modal!
        // Mostra o modal
        const meumodal = new bootstrap.Modal(document.getElementById('welcome'));
//A constante meumodal percebe o modal feito pelo boostrap e relaciona ele com a div principal, que apelidei de Welcome 
        meumodal.show();
//O Show é um método do boostrap que mostra o modal na tela
        localStorage.setItem('modalvisto', 'true');
//Depois do modal ser visto uma vez, o LocalStorage guarda esse acesso e marca como visto.
//O usuário que viu o modal de boas vindas uma vez, não verá ele de novo enquanto não fechar o site por inteiro.
    }

});

//PARTE DO GUILHERME: 
//Criação de Constantes para referenciar elementos do HTML
const bodydatabela = document.querySelector('#tabelalocatarios tbody');
const statusdosdados = document.getElementById('status');
const recarregar = document.getElementById('btnrecarregar');
const filtropesquisa = document.getElementById('searchInput');
const colunasOrdenaveis = document.querySelectorAll('.sortable');

let dadosGlobais = []; 
//Após carregar o json uma vez, deve-se armazenar em uma varíavel todos os 10 clientes: Só assim vai dar pra organizar eles por filtros e ordenação
let sortKey = 'id';
// Chave contendo o valor da coluna ID (padrão quando se carrega a página). Quando se clica em outra coluna, é pra esse valor sair de ID e ir pra coluna clicada...
let sortDirection = 'asc';
//Chave contendo a direção da ordem que a coluna selecionada estará. "Ascendente" (menor pro maior) é o valor padrão, mas tbm tem o ˜Descendente˜ (maior pro menor).



//FUNÇÃO DE FILTRO E ORDENAÇÃO:
function processarErenderizar() {
    let copiaGlobal = [...dadosGlobais];
// Cria uma cópia da variável global, que tem os 10 clientes inseridos.
    
    // 1. PARTE DO FILTRO:
    const texto = filtropesquisa.value.toLowerCase().trim();
//Uma constante que armazenará os valores dentro da barra de pesquisa e fará com que ele não seja case sensitive e que os espaços brancos não influenciem no filtro que virá depois.
    if (texto) {
        copiaGlobal = copiaGlobal.filter(cliente => {
            return (
                cliente.nome.toLowerCase().includes(texto) ||
                cliente.email.toLowerCase().includes(texto) ||
                cliente.cidade.toLowerCase().includes(texto)
            );
        });
    }
//Se tiver algum texto na barra, os 10 clientes serão filtrados, procurando as letras do texto nas colunas nome, se não tiver, na email, e se não tiver, na cidade. Se não tiver texto, esse if é ignorado, já que o return só é ativado se o if tiver algo.
    
    // 2. PARTE DA ORDENAÇÃO:
    copiaGlobal.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
//Sort é uma função do javascript que compara dois valores... Nesse caso, cliente A e cliente B dentro da lista.
//Para o cliente A, quero saber qual coluna foi clicada para atribuir a ordenação e armazenar esse valor nessa nova varíavel valA.
//Para o cliente B, quero saber qual coluna foi clicada para atribuir a ordenação e armazenar esse valor nessa nova varíavel valB.
    
        if (sortKey === 'dataCadastro') {
            valA = new Date(valA);
            valB = new Date(valB);
        } else if (typeof valA === 'string' && typeof valB === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
//Se a coluna clicada foi a de data, quero transformar o valor de string dela pra DATE. 
//Se eu usasse o sort (val A e valB agr) pra comparar o dado string com string, iria ser uma comparação de caracteres... E não de data.


        let comparison = 0;
        if (valA > valB) { comparison = 1; } 
        else if (valA < valB) { comparison = -1; }

        return sortDirection === 'asc' ? comparison : comparison * -1;
    });
//Estabelece uma lógica de comparação por valores numéricos. Se a variável comparacao for 0, quer dizer que Cliente A e B são iguais (mesmo nome, cidade, etc).
//Se valA for maior que valB (caso a letra B de Bruno vier depois que a letra A de Ana, tá igual o alfabeto, então...), a variavel comparacao será 1 (é a ordem ascendente, mas o programa n sabe ainda)
//Se valA for menor que valB (caso a letra B de Bruno vier antes que A de Ana, tá detrás pra frente, então...), a variavel comparacao será -1 (é a ordem descendente, mas o programa n sabe ainda)
//O último return é complicado. Nele, explicamos que Ascendente usa 1 e Descedente usa -1, na lógica que criamos. Para ser "asc", a variavel comparacao tem q ser positiva... Mas pra ser qualquer outra coisa, a variavel tem q ser negativa (por isso multiplica por -1, qualquer numero vira negativo assim)

//Por fim, no fim de toda filtragem ou ordenação, devemos carregar o json de novo: Por isso o chamado da função de renderizar.
    renderizarDados(copiaGlobal);
}


//Pode não lembrar, mas essa função se chama assim por convenção ok
function handleSortClick(event) {
    const novaSortKey = event.currentTarget.getAttribute('data-key');
//Expliquei que a sortkey seleciona a coluna, né? Mas pra ela conseguir, temos que explicar que é através do click que ela seleciona.
//A novaSortkey faz o mesmo que a anterior, só que de forma mais específica: Armazena na chave o valor da coluna, identificando ela (um valor data-key, pode ser a ID, Nome, cidade...)

    if (novaSortKey === sortKey) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey = novaSortKey;
        sortDirection = 'asc';
    }
//Estabelece a lógica de cliques: Se a mesma coluna for clicada duas vezes (novasortkey = antiga), o código vai inverter a ordem entre ascendente e a recém-definida descendente.
//Mas se já tiver clicado em uma coluna, e a próxima ciclada for outra: Muda a coluna anteriormente clicada pra ordem ascendente e foca na outra.
    
    event.currentTarget.classList.add(`sorted-${sortDirection}`);
    processarErenderizar();
}
// Adiciona a classe "sorted", que usamos no CSS pra fazer as setinhas mudando assim que a coluna é clicada!
//Chama a função de ordenação e filtro pra confirmar tudo.


//A função mais chata, mas também uma das mais importantes: Tratamento de Erros.
function renderizarDados(clientes) {
    if (!bodydatabela) {
        statusdosdados.textContent = "ERRO: TABELA NÃO ENCONTRADA.";
        return;
    } 
//Se o Body da tabela não existir, imprime o status dos dados de que não foi encontrada.
    
bodydatabela.innerHTML = ''; 
    if (clientes.length === 0) {
        const semLinha = `<tr><td colspan="8" class="text-center py-4 text-gray-500">Nenhum cliente encontrado.</td></tr>`;
        bodydatabela.innerHTML = semLinha;
        
        const totalClientes = dadosGlobais.length;
        const statusMsg = filtropesquisa.value.trim() !== '' ? 
                          `0 clientes encontrados (Filtro ativo).` : 
                          `${totalClientes} clientes carregados.`;
        statusdosdados.textContent = statusMsg;
        return;
    }
//Se o body existir, mas estiver sem nenhum dado do cliente: Imprime o que tá armazenado na constante sem linha, de que nenhum cliente foi encontrado.
//Agora para o filtro que criei, quando mesmo ativado, ele encontrar nada... É bom que apareça embaixo da exibição do JSON quantos clientes foram encontrados de acordo com o filtro.
    
    clientes.forEach(cliente => {
        let dataFormatada = 'Data Inválida';
        try {
            const dataObj = new Date(cliente.dataCadastro);
            if (!isNaN(dataObj)) dataFormatada = dataObj.toLocaleDateString('pt-BR');
        } catch (e) {}
//Esse Try existe basicamente pra converter a coluna de data, que anteriormente defini seu tipo para DATE, para ficar no formato brasileiro de dd/mes/ano 
        
    const linhas = document.createElement('tr');
        linhas.innerHTML = `
            <td>${cliente.id}</td>
            <td>
                <img src="${cliente.fotoUrl}"  
                        class="cliente-foto"
                        style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover;"
            </td>
            <td class="font-medium">${cliente.nome}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.cidade}</td>
            <td>${dataFormatada}</td>
            <td>
                <button class="btn btn-sm btn-info text-white me-2 shadow-sm" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-danger shadow-sm" title="Excluir">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        bodydatabela.appendChild(linhas);
    });
//Para as linhas que serão criadas quando puxarmos o JSON no meu tbody, referenciei as colunas que cada linha precisarão estar...
//E customizei algumas. Tipo defini o tamanho da foto, que ela vai ser oval, e criei novos botões de editar e excluir com icons do boostraps.

    const statusMsg = filtropesquisa.value.trim() !== '' ? 
                      `${clientes.length} clientes encontrados (Filtro ativo).` : 
                      `${clientes.length} clientes carregados com sucesso.`;
    statusdosdados.textContent = statusMsg;
}
//Por fim, pra caso o filtro ativado funcione... Que apareça abaixo do meu tbody o resultado de quantos foram encontrados.


//A função principal da Task: Use o Fetch pra puxar o JSON pro HTML.
async function carregarDados() {
    statusdosdados.textContent = "Carregando dados...";
    filtropesquisa.value = ''; // Limpa a pesquisa
    sortKey = 'id'; // Reseta a ordenação
    sortDirection = 'asc';
    colunasOrdenaveis.forEach(th => th.classList.remove('sorted-asc', 'sorted-desc'));
//Toda vez que os dados forem carregados (É comum serem devido ao botão Recarregar existir):
//Caso demore, exibe o Carregando. Quando carrega, deixa limpo a barra de filtro. Reseta a ordenação, modificando também o CSS de setas.
    try {
        const response = await fetch('clientes.json');
        if (!response.ok) {
            throw new Error(`Erro: ${response.status} ${response.statusText}`);
        }

        dadosGlobais = await response.json();
        
        // Processa e renderiza a lista inicial (ordenada por ID)
        processarErenderizar(); 

    } catch (error) {
        console.error("Falha ao carregar dados.", error);
        statusdosdados.textContent = `Erro: Falha ao carregar dados. ${error.message}`;
        dadosGlobais = []; 
        if (bodydatabela) bodydatabela.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Não foi possível carregar os dados.</td></tr>`;
    }
}
//O Try: Ele cria uma constante pra puxar o JSON através do fetch, e se caso der errado especificamente DEPOIS de puxar, exibe erro.
//Ele também converte o JSON, que vem como string por padrão, pra .json e chama a função de processar tudo isso.
//O Catch: Exibe erro se SEQUER deu pra puxar os JSON.


// Inicialização e Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    
    if (recarregar) {
        recarregar.addEventListener('click', carregarDados);
    }
    
    // 1. Listener para o FILTRO: Chama a função principal de processamento
    if (filtropesquisa) {
        filtropesquisa.addEventListener('input', processarErenderizar);
    }

    // 2. Listeners para a ORDENAÇÃO
    colunasOrdenaveis.forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', handleSortClick);
    });
});
