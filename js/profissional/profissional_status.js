const form = document.getElementById('form-consulta');
const resDiv = document.getElementById('resultado-status');
const cardStatus = document.getElementById('card-status');
const statusTexto = document.getElementById('status-texto');
const motivoTexto = document.getElementById('motivo-texto');
const btnLogin = document.getElementById('btn-login-container');

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validarCPF = (cpf) => cpf.replace(/\D/g, '').length === 11;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    let temErro = false;

    if (!validarEmail(email)) {
        document.getElementById('erroEmail').classList.add('show');
        temErro = true;
    }
    if (!validarCPF(cpf)) {
        document.getElementById('erroCpf').classList.add('show');
        temErro = true;
    }

    if (temErro) return;

    try {
        const fd = new FormData();
        fd.append('email', email);
        fd.append('cpf', cpf.replace(/\D/g, ''));

        const resposta = await fetch('../php/profissional/profissional_status.php', {
            method: 'POST',
            body: fd
        });

        const dados = await resposta.json();

        if (dados.status === 'sucesso') {
            resDiv.classList.remove('d-none');
            statusTexto.textContent = `Status: ${dados.situacao}`;
            
            if (dados.situacao === 'Aprovado') {
                cardStatus.className = "p-3 rounded-4 border border-success bg-success-subtle text-success";
                motivoTexto.textContent = "Sua conta está ativa! Você já pode acessar a plataforma.";
                btnLogin.classList.remove('d-none');
            } else if (dados.situacao === 'Reprovado') {
                cardStatus.className = "p-3 rounded-4 border border-danger bg-danger-subtle text-danger";
                motivoTexto.innerHTML = `<strong>Motivo:</strong> ${dados.motivo}`;
                btnLogin.classList.add('d-none');
            } else {
                cardStatus.className = "p-3 rounded-4 border border-warning bg-warning-subtle text-warning-emphasis";
                motivoTexto.textContent = "Sua documentação ainda está sendo analisada por nossa equipe.";
                btnLogin.classList.add('d-none');
            }
        } else {
            alert(dados.mensagem);
        }
    } catch (erro) {
        alert("Erro ao consultar servidor.");
    }
});

// Limpeza de erros em tempo real
document.getElementById('email').addEventListener('input', function() {
    if (validarEmail(this.value)) document.getElementById('erroEmail').classList.remove('show');
});
document.getElementById('cpf').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
    if (validarCPF(this.value)) document.getElementById('erroCpf').classList.remove('show');
});