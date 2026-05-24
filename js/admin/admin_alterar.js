const formulario = document.getElementById("form-alterar-admin");
const divErro = document.getElementById("divErro");
const divSucesso = document.getElementById("divSucesso");

document.addEventListener("DOMContentLoaded", () => {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    if (id) buscar(id);
});

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCPF(cpf) {
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
}

// Mostra a div de sucesso ou erro nativa do HTML (se não usar o SweetAlert)
function mostrarMensagem(tipo, msg) {
    const div = tipo === 'erro' ? divErro : divSucesso;
    const outra = tipo === 'erro' ? divSucesso : divErro;
    
    div.textContent = msg;
    div.classList.remove('d-none');
    outra.classList.add('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Limpa as mensagens em vermelho debaixo dos inputs
function limparErrosInputs() {
    const mensagensErro = ['erroNome', 'erroEmail', 'erroCpf', 'erroData'];
    mensagensErro.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.textContent = "";
    });
}

// ==========================================
// FUNÇÃO DE BUSCA CORRIGIDA (Voltou o [0])
// ==========================================
async function buscar(id) {
    try {
        // Apontando para o seu arquivo original que já funcionava
        const retorno = await fetch("../php/admin/administrador_get.php?id=" + id);
        const resposta = await retorno.json();

        if (resposta.status === "ok" && resposta.data.length > 0) {
            // Retornamos o [0] para ler o primeiro item do Array devolvido pelo PHP
            const adm = resposta.data[0]; 
            
            document.getElementById("id_usuario").value = id;
            document.getElementById("nome").value = adm.nome || "";
            document.getElementById("email").value = adm.email || "";
            document.getElementById("cpf").value = adm.cpf || "";
            
            if (adm.data_nascimento) {
                // Pega só a data (YYYY-MM-DD)
                document.getElementById("data_nascimento").value = adm.data_nascimento.split(' ')[0];
            }
            
            // Marca o switch se o status for 1
            document.getElementById("status_adm").checked = (adm.status_adm == 1 || adm.status_adm === "1");
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Ops!',
                text: resposta.mensagem || 'Administrador não encontrado.',
                confirmButtonColor: '#0284c7'
            }).then(() => {
                window.location.href = "lista_administrador.html"; 
            });
        }
    } catch (erro) {
        console.error("Erro ao buscar dados:", erro);
        Swal.fire('Erro', 'Falha na comunicação com o servidor ao carregar dados.', 'error');
    }
}

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    limparErrosInputs();
    
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const data = document.getElementById("data_nascimento").value;
    const senha = document.getElementById("senha").value;
    let temErro = false;

    if (nome.length < 3) {
        document.getElementById("erroNome").textContent = "Nome muito curto.";
        temErro = true;
    }
    if (!validarEmail(email)) {
        document.getElementById("erroEmail").textContent = "E-mail inválido.";
        temErro = true;
    }
    if (!validarCPF(cpf)) {
        document.getElementById("erroCpf").textContent = "CPF deve ter 11 dígitos.";
        temErro = true;
    }
    if (!data) {
        document.getElementById("erroData").textContent = "Data obrigatória.";
        temErro = true;
    }
    if (senha.length > 0 && senha.length < 6) {
        Swal.fire('Atenção', 'A nova senha deve ter no mínimo 6 caracteres.', 'warning');
        temErro = true;
    }

    if (temErro) return;

    // Prepara o botão para carregamento
    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.innerHTML = "⏳ Salvando...";

    // Prepara os dados para o PHP
    const fd = new FormData();
    fd.append("id_usuario", document.getElementById("id_usuario").value); 
    fd.append("nome", nome);
    fd.append("email", email);
    fd.append("cpf", cpf.replace(/\D/g, ''));
    fd.append("data_nascimento", data);
    fd.append("senha", senha);
    fd.append("status_adm", document.getElementById("status_adm").checked ? 1 : 0);

    try {
        const retorno = await fetch("../php/admin/administrador_alterar.php", {
            method: 'POST',
            body: fd  
        });
        const resposta = await retorno.json();

        if (resposta.status == "ok") {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: resposta.mensagem || 'Dados atualizados com êxito!',
                confirmButtonColor: '#0284c7'
            }).then(() => {
                window.location.href = 'lista_administrador.html'; 
            });
        } else {
            mostrarMensagem('erro', "❌ " + resposta.mensagem);
        }
    } catch (e) {
        console.error("Erro no envio:", e);
        mostrarMensagem('erro', "❌ Erro de conexão com o servidor ao salvar.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = "<i class='bi bi-save me-1'></i> Salvar Alterações";
    }
});

// Máscara básica para CPF
document.getElementById('cpf').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    e.target.value = value;
});

// Segurança
if (typeof validarAcesso === "function") {
    validarAcesso(['Administrador']);
}