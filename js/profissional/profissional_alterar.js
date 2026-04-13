const formulario = document.getElementById("form-reenvio-prof");
const divMensagem = document.getElementById("mensagem-retorno");


//Pega id para buscar dados no php
document.addEventListener("DOMContentLoaded", () => {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    
    if (id) {
        buscarDadosProfissional(id);
    } else {
        mostrarMensagem('erro', "ID do usuário não fornecido. Volte e tente novamente.");
        document.getElementById("btn-enviar").disabled = true;
    }
});

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validarCPF = (cpf) => cpf.replace(/\D/g, '').length === 11;

function mostrarMensagem(tipo, msg) {
    divMensagem.innerHTML = msg;
    divMensagem.className = `alert alert-${tipo === 'erro' ? 'danger' : 'success'} show mb-4`;
    divMensagem.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

//Busca as informações no BD
async function buscarDadosProfissional(id) {
    try {
        const retorno = await fetch(`../php/profissional/profissional_get_alterar.php?id=${id}`);
        const resposta = await retorno.json();

        if (resposta.status === "ok" && resposta.data.length > 0) {
            const prof = resposta.data[0];

            // Preenche os inputs de texto
            document.getElementById("id_usuario").value = prof.id_usuario;
            document.getElementById("nome").value = prof.nome;
            document.getElementById("email").value = prof.email;
            document.getElementById("cpf").value = prof.cpf;
            document.getElementById("registro_profissional").value = prof.registro_profissional;
            document.getElementById("especialidade").value = prof.especialidade;
            
            // Tratamento caso a data venha em formato diferente, mas o input date exige YYYY-MM-DD
            if (prof.data_nascimento) {
                document.getElementById("data_nascimento").value = prof.data_nascimento;
            }

        } else {
            mostrarMensagem('erro', "Erro ao buscar os dados do profissional: " + resposta.mensagem);
        }
    } catch (e) {
        mostrarMensagem('erro', "Falha de conexão ao tentar buscar os dados.");
    }
}

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Esconde os erros antigos
    document.querySelectorAll('.msg-erro').forEach(el => el.classList.remove('show'));
    divMensagem.classList.add('d-none');
    
    // Coleta dos dados
    const idUsuario = document.getElementById("id_usuario").value;
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const registro = document.getElementById("registro_profissional").value.trim();
    const especialidade = document.getElementById("especialidade").value.trim();
    const dataNascimento = document.getElementById("data_nascimento").value;
    const senha = document.getElementById("senha").value;

    const certificacao = document.getElementById("certificacao").files[0];
    const identidade = document.getElementById("identidade").files[0];

    let temErro = false;

    // Validações básicas da interface
    if (nome.length < 3) { document.getElementById("erroNome").textContent = "Nome muito curto."; document.getElementById("erroNome").classList.add("show"); temErro = true; }
    if (!validarEmail(email)) { document.getElementById("erroEmail").textContent = "E-mail inválido."; document.getElementById("erroEmail").classList.add("show"); temErro = true; }
    if (!validarCPF(cpf)) { document.getElementById("erroCpf").textContent = "CPF deve ter 11 números."; document.getElementById("erroCpf").classList.add("show"); temErro = true; }
    if (!registro) { document.getElementById("erroRegistro").textContent = "Obrigatório."; document.getElementById("erroRegistro").classList.add("show"); temErro = true; }
    if (!especialidade) { document.getElementById("erroEspecialidade").textContent = "Obrigatório."; document.getElementById("erroEspecialidade").classList.add("show"); temErro = true; }
    if (!dataNascimento) { document.getElementById("erroData").textContent = "Data obrigatória."; document.getElementById("erroData").classList.add("show"); temErro = true; }
    if (senha.length > 0 && senha.length < 6) { document.getElementById("erroSenha").textContent = "A nova senha deve ter no mínimo 6 caracteres."; document.getElementById("erroSenha").classList.add("show"); temErro = true; }
    
    // Verificação rigorosa dos arquivos (Como é reenvio, são obrigatórios)
    if (!certificacao) { alert("Você precisa anexar o novo certificado."); temErro = true; }
    if (!identidade) { alert("Você precisa anexar o novo documento de identidade."); temErro = true; }

    if (temErro) return;

    // Interface de carregamento
    const btn = document.getElementById("btn-enviar");
    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "⏳ Enviando Documentos...";

    // 3. Montando a "Caixa" com arquivos e textos
    const fd = new FormData();
    fd.append("id_usuario", idUsuario);
    fd.append("nome", nome);
    fd.append("email", email);
    fd.append("cpf", cpf.replace(/\D/g, ''));
    fd.append("registro_profissional", registro);
    fd.append("especialidade", especialidade);
    fd.append("data_nascimento", dataNascimento);
    fd.append("senha", senha);
    
    // Anexando os binários
    fd.append("certificacao_profissional", certificacao);
    fd.append("carteira_identidade_nacional", identidade);

    try {
        const retorno = await fetch("../php/profissional/profissional_alterar.php", {
            method: 'POST',
            body: fd  
        });
        const resposta = await retorno.json();

        if (resposta.status === "ok") {
            mostrarMensagem('sucesso', "✅ Documentação reenviada com sucesso! Seu status voltou para análise.");
            
            // Joga de volta para a tela de consultar status (ajuste o link se necessário)
            setTimeout(() => { window.location.href = '../login/index.html'; }, 3000);
        } else {
            mostrarMensagem('erro', "❌ " + resposta.mensagem);
        }
    } catch (e) {
        mostrarMensagem('erro', "❌ Erro de conexão com o servidor. Tente novamente.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
});

// Máscara básica para CPF em tempo real
document.getElementById('cpf').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    e.target.value = value;
});