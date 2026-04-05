const formulario = document.getElementById("form-alterar-responsavel");
const divErro = document.getElementById("divErro");
const divSucesso = document.getElementById("divSucesso");

document.addEventListener("DOMContentLoaded", () => {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    if (id) {
        buscar(id);
    } else {
        alert("ID não encontrado na URL.");
        window.location.href = "lista_responsaveis.html";
    }
});

// ================= UTILITÁRIOS DE VALIDAÇÃO =================
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCPF(cpf) {
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
}

function validarTelefone(tel) {
    const apenasNumeros = tel.replace(/\D/g, '');
    return apenasNumeros.length >= 10 && apenasNumeros.length <= 11;
}

function mostrarMensagem(tipo, msg) {
    const div = tipo === 'erro' ? divErro : divSucesso;
    const outra = tipo === 'erro' ? divSucesso : divErro;
    
    div.textContent = msg;
    div.classList.add('show');
    div.style.display = 'block';
    outra.classList.remove('show');
    outra.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= FASE 1: BUSCA DOS DADOS =================
async function buscar(id) {
    try {
        const retorno = await fetch("../php/responsavel/responsavel_get.php?id=" + id);
        const resposta = await retorno.json();

        if (resposta.status == "ok") {
            const r = resposta.data[0];
            document.getElementById("id_usuario").value = id;
            document.getElementById("nome").value = r.nome;
            document.getElementById("email").value = r.email;
            document.getElementById("cpf").value = r.cpf;
            document.getElementById("telefone").value = r.telefone || "";
            document.getElementById("data_nascimento").value = r.data_nascimento;
        } else {
            alert("Erro ao recuperar dados: " + resposta.mensagem);
            window.location.href = "lista_responsaveis.html";
        }
    } catch (e) {
        console.error("Erro no fetch de busca:", e);
        alert("Erro de conexão ao buscar dados.");
    }
}

// ================= FASE 2: TRATAMENTO DE EXCEÇÕES E UPDATE =================
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Limpar todos os erros visuais antes de validar
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
    divErro.style.display = 'none';
    divSucesso.style.display = 'none';

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const data = document.getElementById("data_nascimento").value;
    const senha = document.getElementById("senha").value;
    let temErro = false;

    // --- Tratamento de Exceções por Campo ---
    if (nome.length < 3) {
        document.getElementById("erroNome").textContent = "O nome deve ter pelo menos 3 caracteres.";
        document.getElementById("erroNome").classList.add("show");
        temErro = true;
    }

    if (!validarEmail(email)) {
        document.getElementById("erroEmail").textContent = "Informe um e-mail válido.";
        document.getElementById("erroEmail").classList.add("show");
        temErro = true;
    }

    if (!validarCPF(cpf)) {
        document.getElementById("erroCpf").textContent = "CPF deve conter 11 dígitos numéricos.";
        document.getElementById("erroCpf").classList.add("show");
        temErro = true;
    }

    if (!validarTelefone(telefone)) {
        document.getElementById("erroTelefone").textContent = "Telefone inválido (DDD + número).";
        document.getElementById("erroTelefone").classList.add("show");
        temErro = true;
    }

    if (!data) {
        document.getElementById("erroData").textContent = "A data de nascimento é obrigatória.";
        document.getElementById("erroData").classList.add("show");
        temErro = true;
    }

    if (senha.length > 0 && senha.length < 6) {
        mostrarMensagem('erro', "A nova senha deve ter no mínimo 6 caracteres.");
        temErro = true;
    }

    // Se houver qualquer exceção, para o envio
    if (temErro) return;

    // Estado de carregamento do botão
    const btn = document.getElementById("btnEnviar");
    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "⏳ Salvando Alterações...";

    // Preparação dos dados (Limpeza de máscaras)
    const fd = new FormData();
    fd.append("nome", nome);
    fd.append("email", email);
    fd.append("cpf", cpf.replace(/\D/g, ''));
    fd.append("telefone", telefone.replace(/\D/g, ''));
    fd.append("data_nascimento", data);
    fd.append("senha", senha);

    try {
        const id = document.getElementById("id_usuario").value;
        const retorno = await fetch("../php/responsavel/responsavel_alterar.php?id=" + id, {
            method: 'POST',
            body: fd  
        });

        // Tratamento de exceção para resposta não-JSON
        const textoResposta = await retorno.text();
        let resposta;
        try {
            resposta = JSON.parse(textoResposta);
        } catch (e) {
            throw new Error("O servidor retornou uma resposta inválida (não-JSON).");
        }

        if (resposta.status == "ok") {
            mostrarMensagem('sucesso', "✅ " + resposta.mensagem);
            setTimeout(() => { window.location.href = 'lista_responsavel.html'; }, 2000);
        } else {
            mostrarMensagem('erro', "❌ " + resposta.mensagem);
        }

    } catch (erro) {
        mostrarMensagem('erro', "❌ Erro: " + erro.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
});

// Máscaras em tempo real (Apenas números)
document.getElementById('cpf').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
});

document.getElementById('telefone').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
});