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
      // Seleciona apenas as colunas que possuem a classe 'sortable'
      const headerCells = document.querySelectorAll('#clientsTable thead th.sortable'); 

      // Função principal de carregamento usando fetch para buscar o JSON local
      async function loadClients() {
          setStatus('Carregando clientes...');
          try {
              // Configurado para buscar 'clientes.json' na mesma pasta
              const res = await fetch('clientes.json', {
                  cache: 'no-store'
              });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              clients = await res.json();
              
              // Normaliza e valida os tipos de dados
              clients = clients.map(normalizeClient);
              
              // Aplica filtros e ordenação e renderiza
              applyFiltersAndSort();
              
              setStatus(`Carregados ${clients.length} clientes. Pronto para uso.`);
          } catch (err) {
              setStatus('Erro ao carregar clientes: ' + err.message);
              tableBody.innerHTML = '';
          }
      }

      // Normaliza campos (garante tipos consistentes e adiciona fotoUrl)
      function normalizeClient(c) {
          return {
              id: Number(c.id),
              nome: String(c.nome),
              email: String(c.email),
              telefone: String(c.telefone || 'N/A'),
              cidade: String(c.cidade || 'N/A'),
              dataCadastro: c.dataCadastro ? new Date(c.dataCadastro).toISOString() : null,
              ativo: Boolean(c.ativo),
              fotoUrl: String(c.fotoUrl || 'https://placehold.co/70x70/CCCCCC/000000?text=Foto') // Adiciona fallback para foto
          };
      }

      // Renderiza a tabela com o array filtrado, usando o novo layout
      function renderTable(arr) {
          tableBody.innerHTML = '';
          if (!arr.length) {
              tableBody.innerHTML = `<tr><td colspan="9" class="text-center">Nenhum cliente encontrado. Ajuste os filtros ou a pesquisa.</td></tr>`;
              return;
          }
          const frag = document.createDocumentFragment();
          arr.forEach(c => {
              const statusBadge = c.ativo 
                  ? '<span class="badge bg-success">Ativo</span>' 
                  : '<span class="badge bg-danger">Inativo</span>';

              const tr = document.createElement('tr');
              
              // Estrutura de linha adaptada ao layout POOH e campos do JASON
              tr.innerHTML = `
                  <td>${c.id}</td>
                  <td>
                      <img class="rounded-circle" width="70px" height="70px" src="${escapeHtml(c.fotoUrl)}" alt="Foto de ${escapeHtml(c.nome)}">
                  </td>
                  <td>${escapeHtml(c.nome)}</td>
                  <td>${escapeHtml(c.email)}</td>
                  <td>${escapeHtml(c.telefone)}</td>
                  <td>${escapeHtml(c.cidade)}</td>
                  <td>${c.dataCadastro ? (new Date(c.dataCadastro)).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>${statusBadge}</td>
                  <td>
                      <button class="btn btn-sm btn-warning me-1" title="Editar ${escapeHtml(c.nome)}">
                          <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-danger" title="Excluir ${escapeHtml(c.nome)}">
                          <i class="bi bi-trash"></i>
                      </button>
                  </td>
              `;
              frag.appendChild(tr);
          });
          tableBody.appendChild(frag);
      }

      // --- Lógica de Filtro e Ordenação (Mantida do Cliente Jason) ---
      
      function applyFiltersAndSort() {
          const term = searchInput.value.trim().toLowerCase();
          const status = statusFilter.value;
          filtered = clients.filter(c => {
              // Filtragem por status (all, true, false)
              const matchesStatus = status === 'all' ? true : String(c.ativo) === status;
              
              // Filtragem por termo de pesquisa (nome, email, cidade)
              const matchesTerm = !term || [c.nome, c.email, c.cidade].some(v => String(v).toLowerCase().includes(term));
              
              return matchesStatus && matchesTerm;
          });
          
          sortArray(filtered, sortState.key, sortState.dir);
          updateHeaderSortIndicators();
          renderTable(filtered);
      }

      function sortArray(arr, key, dir) {
          arr.sort((a, b) => {
              const A = a[key];
              const B = b[key];
              
              if (key === 'id') return (A - B) * (dir === 'asc' ? 1 : -1);
              
              if (key === 'dataCadastro') {
                  const diff = (new Date(A || 0)) - (new Date(B || 0));
                  return diff * (dir === 'asc' ? 1 : -1);
              }
              
              // Comparação de strings com suporte a acentuação (pt-BR)
              return String(A).localeCompare(String(B), 'pt-BR', {
                  numeric: true
              }) * (dir === 'asc' ? 1 : -1);
          });
      }

      function updateHeaderSortIndicators() {
          headerCells.forEach(th => {
              th.classList.remove('sorted-asc', 'sorted-desc');
              if (th.dataset.key === sortState.key) th.classList.add(sortState.dir === 'asc' ? 'sorted-asc' : 'sorted-desc');
          });
      }

      function escapeHtml(text) {
          return String(text)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
      }

      function setStatus(msg) {
          statusMessage.innerHTML = msg;
      }
      
      // Pequena função debounce para reduzir chamadas durante digitação
      function debounce(fn, ms = 220) {
          let t;
          return (...args) => {
              clearTimeout(t);
              t = setTimeout(() => fn(...args), ms);
          };
      }

      // --- Event Listeners e Inicialização ---

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

      // Inicialização: carregar clientes ao abrir a página
      document.addEventListener('DOMContentLoaded', loadClients);

      // Ação de Novo Cliente (exemplo de como manipular o form)
      document.getElementById('newClientForm').addEventListener('submit', function(event) {
          event.preventDefault();
          // Aqui você capturaria os dados do formulário e enviaria para uma API (POST)
          setStatus("Funcionalidade 'Novo Cliente' simulada. Dados não salvos.");
          document.querySelector('#add-cliente').classList.remove('show'); // Fecha o offcanvas
          // Para fechar o offcanvas programaticamente, é necessário o objeto Bootstrap, mas o JS simples aqui simula o fechamento.
      });

