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

