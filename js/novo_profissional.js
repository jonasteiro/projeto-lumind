document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();
});

document.getElementById("enviar").addEventListener("click", () => {
    novo();
});

async function novo(){
    var nome            = document.getElementById("nome").value;
    var email           = document.getElementById("email").value;
    var senha           = document.getElementById("senha").value;
    var data_nascimento = document.getElementById("data_nascimento").value;
    var telefone        = document.getElementById("telefone").value;
    var especialidade   = document.getElementById("especialidade").value;
    var registro        = document.getElementById("registro_profissional").value;

    /*
    //deixando de lado a documentacao por enquanto
    var input_cip = document.getElementById("cip");
    var input_cin = document.getElementById("cin");
    */


    const fd = new FormData();
    
    fd.append("nome", nome);
    fd.append("email", email);
    fd.append("senha", senha);
    fd.append("data_nascimento", data_nascimento);
    fd.append("telefone", telefone);

    fd.append("especialidade", especialidade);
    fd.append("registro_profissional", registro);

    /*
    if (input_cip.files.length > 0) {
        fd.append("cip", input_cip.files[0]); 
    }
    
    if (input_cin.files.length > 0) {
        fd.append("cin", input_cin.files[0]);
    }
    */

    const retorno = await fetch("../php/novo_profissional.php", {
        method: 'POST',
        body: fd  
    });
    
    const resposta = await retorno.json();
    
    if(resposta.status == "ok"){
        alert("SUCESSO: " + resposta.mensagem);
        window.location.href = "../home/";
    }else{
        alert("ERRO: " + resposta.mensagem);
    }
}