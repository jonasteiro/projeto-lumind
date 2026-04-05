const formulario = document.getElementById("form-alterar-pessoa-tea");
const divErro = document.getElementById("divErro");
const divSucesso = document.getElementById("divSucesso");

document.addEventListener("DOMContentLoaded", () => {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    if (id) buscar(id);
});

// ================= VALIDAÇÕES =================
function validarEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validarCPF(cpf) { return cpf.replace(/\D/g, '').length === 11; }

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

// ================= FASE 1: BUSCA =================
async function buscar(id) {
    try {
        const retorno = await fetch("../php/pessoa_tea/pessoa_tea_get.php?id=" + id);
        const resposta = await retorno.json();

        if (resposta.status == "ok") {
            const p = resposta.data[0];
            document.getElementById("id_usuario").value = id;
            document.getElementById("nome").value = p.nome;
            document.getElementById("email").value = p.email;
            document.getElementById("cpf").value = p.cpf;
            document.getElementById("nivel_tea").value = p.nivel_tea;
            document.getElementById("observacao").value = p.observacao || "";
            
            if (p.data_nascimento) {
                document.getElementById("data_nascimento").value = p.data_nascimento.split(' ')[0];
            }
        } else {
            alert("Erro: " + resposta.mensagem);
            window.location.href = "lista_pessoa_tea.html";
        }
    } catch (e) {
        alert("Erro de conexão ao buscar dados.");
    }
}

// ================= FASE 2: UPDATE COM EXCEÇÕES =================
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const nivel = document.getElementById("nivel_tea").value;
    const data = document.getElementById("data_nascimento").value;
    const senha = document.getElementById("senha").value;
    let temErro = false;

    // Blocos de Exceção
    if (nome.length < 3) { 
        document.getElementById("erroNome").textContent = "Nome muito curto."; 
        document.getElementById("erroNome").classList.add("show"); 
        temErro = true; 
    }
    if (!validarEmail(email)) { 
        document.getElementById("erroEmail").textContent = "E-mail inválido."; 
        document.getElementById("erroEmail").classList.add("show"); 
        temErro = true; 
    }
    if (!validarCPF(cpf)) { 
        document.getElementById("erroCpf").textContent = "CPF inválido (11 dígitos)."; 
        document.getElementById("erroCpf").classList.add("show"); 
        temErro = true; 
    }
    if (!nivel) { 
        document.getElementById("erroNivel").textContent = "Selecione um nível."; 
        document.getElementById("erroNivel").classList.add("show"); 
        temErro = true; 
    }
    if (!data) { 
        document.getElementById("erroData").textContent = "Data obrigatória."; 
        document.getElementById("erroData").classList.add("show"); 
        temErro = true; 
    }

    if (temErro) return;

    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.innerHTML = "⏳ Salvando...";

    const fd = new FormData();
    fd.append("nome", nome);
    fd.append("email", email);
    fd.append("cpf", cpf.replace(/\D/g, ''));
    fd.append("nivel_tea", nivel);
    fd.append("observacao", document.getElementById("observacao").value);
    fd.append("data_nascimento", data);
    fd.append("senha", senha);

    try {
        const id = document.getElementById("id_usuario").value;
        const retorno = await fetch("../php/pessoa_tea/pessoa_tea_alterar.php?id=" + id, {
            method: 'POST',
            body: fd  
        });
        const resposta = await retorno.json();

        if (resposta.status == "ok") {
            mostrarMensagem('sucesso', "✅ " + resposta.mensagem);
            setTimeout(() => { window.location.href = 'lista_pessoa_tea.html'; }, 2000);
        } else {
            mostrarMensagem('erro', "❌ " + resposta.mensagem);
        }
    } catch (e) {
        mostrarMensagem('erro', "❌ Erro de comunicação com o servidor.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = "<i class='bi bi-save me-2'></i> Salvar Alterações";
    }
});

document.getElementById('cpf').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
});