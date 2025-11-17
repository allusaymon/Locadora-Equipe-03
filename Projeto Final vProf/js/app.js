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

    // Estado da aplicação (variáveis que guardam dados e preferências atuais)
    let clients = []; // array carregado do JSON
    let filtered = []; // array filtrado/ordenado que é renderizado
    let sortState = {
      key: 'id',
      dir: 'asc'
    }; // ordenação atual

    // Referências DOM
    const tableBody = document.querySelector('#clientsTable tbody');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const refreshBtn = document.getElementById('refreshBtn');
    const statusMessage = document.getElementById('statusMessage');
    const headerCells = document.querySelectorAll('#clientsTable thead th.sortable');

    // Função principal de carregamento usando fetch para buscar o JSON local
    async function loadClients() {
      setStatus('Carregando clientes...');
      try {
        const res = await fetch('clientes.json', {
          cache: 'no-store'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        clients = await res.json(); // normaliza/valida cada registro (gera tipos corretos)
        clients = clients.map(normalizeClient);
        applyFiltersAndSort();
        setStatus(`Carregados ${clients.length} clientes.`);
      } catch (err) {
        setStatus('Erro ao carregar clientes: ' + err.message);
        tableBody.innerHTML = '';
      }
    }

    // Normaliza campos (garante tipos consistentes)
    function normalizeClient(c) {
      return {
        id: Number(c.id),
        nome: String(c.nome),
        email: String(c.email),
        telefone: String(c.telefone || ''),
        cidade: String(c.cidade || ''),
        dataCadastro: c.dataCadastro ? new Date(c.dataCadastro).toISOString() : null,
        ativo: Boolean(c.ativo)
      };
    }

    // Renderiza a tabela com o array filtrado
    function renderTable(arr) {
      tableBody.innerHTML = '';
      if (!arr.length) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">Nenhum cliente encontrado.</td></tr>`;
        return;
      }
      const frag = document.createDocumentFragment();
      arr.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${c.id}</td>
          <td>${escapeHtml(c.nome)}</td>
          <td>${escapeHtml(c.email)}</td>
          <td>${escapeHtml(c.telefone)}</td>
          <td>${escapeHtml(c.cidade)}</td>
          <td>${c.dataCadastro ? (new Date(c.dataCadastro)).toLocaleDateString() : '-'}</td>
          <td>${c.ativo ? 'Sim' : 'Não'}</td>
        `;
        frag.appendChild(tr);
      });
      tableBody.appendChild(frag);
    }

    // Aplicar filtros (pesquisa e status) e ordenar antes de renderizar
    function applyFiltersAndSort() {
      const term = searchInput.value.trim().toLowerCase();
      const status = statusFilter.value;
      filtered = clients.filter(c => {
        const matchesStatus = status === 'all' ? true : String(c.ativo) === status;
        const matchesTerm = !term || [c.nome, c.email, c.cidade].some(v => String(v).toLowerCase().includes(term));
        return matchesStatus && matchesTerm;
      });
      sortArray(filtered, sortState.key, sortState.dir); // atualizar indicadores visuais do cabeçalho
      updateHeaderSortIndicators();
      renderTable(filtered);
    }

    // Ordena array por chave e direção
    function sortArray(arr, key, dir) {
      arr.sort((a, b) => {
        const A = a[key];
        const B = b[key];
        // Tratar tipos: números, strings e datas
        if (key === 'id') return (A - B) * (dir === 'asc' ? 1 : -1);
        if (key === 'dataCadastro') {
          const diff = (new Date(A || 0)) - (new Date(B || 0));
          return diff * (dir === 'asc' ? 1 : -1);
        }
        // strings: usar localeCompare para acentuação correta
        return String(A).localeCompare(String(B), 'pt-BR', {
          numeric: true
        }) * (dir === 'asc' ? 1 : -1);
      });
    }

    // Atualiza setas de ordenação no cabeçalho
    function updateHeaderSortIndicators() {
      headerCells.forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (th.dataset.key === sortState.key) th.classList.add(sortState.dir === 'asc' ? 'sorted-asc' : 'sorted-desc');
      });
    }

    // Escapa texto para evitar injeção simples de HTML
    function escapeHtml(text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Indica mensagens de status ao usuário
    function setStatus(msg) {
      statusMessage.textContent = msg;
    }

    // Event listeners: pesquisa, filtro, recarregar e clique nos cabeçalhos para ordenar
    searchInput.addEventListener('input', debounce(applyFiltersAndSort, 220));
    statusFilter.addEventListener('change', applyFiltersAndSort);
    refreshBtn.addEventListener('click', loadClients);
    headerCells.forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.key;
        if (sortState.key === key) sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
        else {
          sortState.key = key;
          sortState.dir = 'asc';
        }
        applyFiltersAndSort();
      });
    });

    // Pequena função debounce para reduzir chamadas durante digitação
    function debounce(fn, ms = 200) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
      };
    }

    // Inicialização: carregar clientes ao abrir a página
    document.addEventListener('DOMContentLoaded', loadClients);



