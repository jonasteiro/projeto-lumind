// js/pessoa_tea.js/pessoa_tea_alterar.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-alterar-pessoa-tea");
    const divErro = document.getElementById("divErro");
    const divSucesso = document.getElementById("divSucesso");

    const IDADE_MINIMA = 3;

    // =======================================================
    // BLOQUEIO DE DATAS NO CALENDÁRIO (Mínimo 3 Anos)
    // =======================================================
    const inputData = document.getElementById("data_nascimento");
    if (inputData) {
        const dataLimite = new Date();
        dataLimite.setFullYear(dataLimite.getFullYear() - IDADE_MINIMA);
        
        const ano = dataLimite.getFullYear();
        const mes = String(dataLimite.getMonth() + 1).padStart(2, '0');
        const dia = String(dataLimite.getDate()).padStart(2, '0');
        
        // Impede de selecionar no calendário uma data que resulte em menos de 3 anos
        inputData.setAttribute('max', `${ano}-${mes}-${dia}`); 
    }

    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    if (id) buscar(id);

    function validarEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    function mostrarMensagem(tipo, msg) {
        if (typeof Swal !== 'undefined') {
            if (tipo === 'erro') {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: msg,
                    confirmButtonColor: '#d33'
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: msg,
                    confirmButtonColor: '#0284c7'
                }).then(() => {
                    window.location.href = 'lista_pessoa_tea.html';
                });
            }
        } else {
            const div = tipo === 'erro' ? divErro : divSucesso;
            const outra = tipo === 'erro' ? divSucesso : divErro;
            div.textContent = msg;
            div.classList.remove('d-none');
            outra.classList.add('d-none');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (tipo === 'sucesso') {
                setTimeout(() => { window.location.href = 'lista_pessoa_tea.html'; }, 2000);
            }
        }
    }

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
                document.getElementById("observacao").value = p.observacao || "";
                
                // 1. Garante que o campo de senha fique sempre vazio na tela de alteração
                document.getElementById("senha").value = ""; 
                
                // 2. Preenche a data de nascimento
                if (p.data_nascimento) {
                    document.getElementById("data_nascimento").value = p.data_nascimento.split(' ')[0];
                }

                // 3. Seleção inteligente do Nível TEA
                const selectNivel = document.getElementById("nivel_tea");
                if (p.nivel_tea) {
                    // Tenta a seleção direta primeiro
                    selectNivel.value = p.nivel_tea;
                    
                    // Se não tiver selecionado nada, faz uma busca por aproximação
                    if (selectNivel.selectedIndex <= 0) {
                        for (let i = 0; i < selectNivel.options.length; i++) {
                            if (selectNivel.options[i].value.includes(p.nivel_tea) || p.nivel_tea.includes(selectNivel.options[i].value)) {
                                selectNivel.selectedIndex = i;
                                break;
                            }
                        }
                    }
                }

            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro!',
                        text: "Erro: " + resposta.mensagem,
                        confirmButtonColor: '#d33'
                    }).then(() => {
                        window.location.href = "lista_pessoa_tea.html";
                    });
                } else {
                    alert("Erro: " + resposta.mensagem);
                    window.location.href = "lista_pessoa_tea.html";
                }
            }
        } catch (e) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro de Conexão',
                    text: 'Erro de conexão ao buscar dados.',
                    confirmButtonColor: '#d33'
                });
            } else {
                alert("Erro de conexão ao buscar dados.");
            }
        }
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Limpa os erros de texto embaixo dos inputs
            const camposErro = ['erroNome', 'erroEmail', 'erroCpf', 'erroData', 'erroNivel'];
            camposErro.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.textContent = '';
            });

            const nome = document.getElementById("nome").value.trim();
            const email = document.getElementById("email").value.trim();
            const nivel = document.getElementById("nivel_tea").value;
            const data = document.getElementById("data_nascimento").value;
            const senha = document.getElementById("senha").value;
            let temErro = false;

            // Validações
            if (nome.length < 3) { 
                const el = document.getElementById("erroNome");
                if (el) el.textContent = "Nome muito curto."; 
                temErro = true; 
            }
            if (!validarEmail(email)) { 
                const el = document.getElementById("erroEmail");
                if (el) el.textContent = "E-mail inválido."; 
                temErro = true; 
            }
            if (!nivel) { 
                const el = document.getElementById("erroNivel");
                if (el) el.textContent = "Selecione um nível."; 
                temErro = true; 
            }
            
            // Validação rigorosa de Data de Nascimento (Idade Mínima)
            if (!data) { 
                const el = document.getElementById("erroData");
                if (el) el.textContent = "Data obrigatória."; 
                temErro = true; 
            } else {
                const dataNasc = new Date(data);
                const hoje = new Date();
                let idade = hoje.getFullYear() - dataNasc.getFullYear();

                const mesAtual = hoje.getMonth();
                const diaAtual = hoje.getDate();
                const mesNasc = dataNasc.getMonth();
                const diaNasc = dataNasc.getDate();

                if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
                    idade--;
                }

                if (idade < IDADE_MINIMA) {
                    const el = document.getElementById("erroData");
                    if (el) el.textContent = `O paciente deve ter no mínimo ${IDADE_MINIMA} anos de idade.`; 
                    temErro = true;
                }
            }

            if (temErro) return;

            const btn = document.getElementById("btnEnviar");
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i> Salvando...';
            }

            const fd = new FormData();
            fd.append("nome", nome);
            fd.append("email", email);
            fd.append("cpf", document.getElementById("cpf").value.replace(/\D/g, ''));
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

                if (resposta.status == "ok" || resposta.status == "sucesso") {
                    mostrarMensagem('sucesso', resposta.mensagem || 'Dados atualizados com sucesso!');
                } else {
                    mostrarMensagem('erro', resposta.mensagem || 'Verifique os dados e tente novamente.');
                }
            } catch (erro) {
                mostrarMensagem('erro', 'Erro de conexão com o servidor.');
                console.error("Erro na requisição:", erro);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = "<i class='bi bi-save me-1'></i> Salvar Alterações";
                }
            }
        });
    }
});