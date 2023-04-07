const btnEncurtar = document.querySelector(".btn-encurtar");
const input = document.querySelector(".shorten input[type=text]");

btnEncurtar.addEventListener("click", () => {
  if (input.value.trim() == "") {
    showErrorMessage("Por favor digite uma url...");
  } else if (!isUrl(input.value.trim())) {
    showErrorMessage("Digite uma url correcta por favor");
  } else {
    removeErrorMessage();
    let url = `https://api.shrtco.de/v2/shorten?url=${input.value.trim()}`;
    encurtar(url);
    input.value = '';
  }
});

// Evento de digitar no input da url
input.addEventListener("keyup", () => {
  if (input.value.trim() == "") {
    showErrorMessage("Por favor digite uma url...");
  } else if (!isUrl(input.value.trim())) {
    showErrorMessage("Digite uma url correcta por favor");
  } else {
    removeErrorMessage();
  }
});

function showErrorMessage(msg) {
  document.querySelector("p.error").textContent = msg;
  document.querySelector(".bg").classList.add("error");
}
function removeErrorMessage() {
  document.querySelector(".bg").classList.remove("error");
}

function isUrl(str) {
  const pattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return pattern.test(str);
}

async function encurtar(url) {
  setDefaultConfigInBtnCopy();
  const response = await fetch(url);
  const data = await response.json();
  //Verificar se tudo deu certo
  if (data.ok == true) {
    let code = data.result.code;
    let linkEncurtado = data.result.full_short_link;
    let linkOriginal = data.result.original_link;
    addLinkInLocalStorage(code, linkEncurtado, linkOriginal);
    addLinkInHTML(linkOriginal, linkEncurtado);
  } else {
    // console.log("Houve um erro");
  }
}

// inserir links na div links container
function addLinkInHTML(linkOriginal, LinkEncurtado) {
  let linksContainer = document.querySelector(".links-encurtados-container");
  let templateDiv = `<div class="link">
          <p class="original">${linkOriginal}</p>
          <div>
          <a href="${LinkEncurtado}" class="encurtado">${LinkEncurtado}</a>
          <button class="btn-copy" data-link="${LinkEncurtado}">Copy</button>
          </div>
        </div>
        `;
  linksContainer.innerHTML += templateDiv;
}

// Localstarare
function addLinkInLocalStorage(code, linkEncurtado, linkOriginal) {
  let AllLinks = JSON.parse(localStorage.getItem("links")) || [];
  AllLinks.push({
    code: code,
    linkEncurtado: linkEncurtado,
    linkOriginal: linkOriginal
  });
  localStorage.setItem("links", JSON.stringify(AllLinks));
}

// mostrar os links que estão no localstorage

function showLinksInLocalStorage() {
  let links = JSON.parse(localStorage.getItem("links"));

  if (links == null) {
  } else {
    for (let i = 0; i < links.length; i++) {
      addLinkInHTML(links[i].linkOriginal, links[i].linkEncurtado);
    }
  }
}

showLinksInLocalStorage();

document.addEventListener('click',(e)=>{
  if(e.target.classList.contains('btn-copy')){
    setDefaultConfigInBtnCopy();
    let element = e.target;
    console.log(element.getAttribute('data-link'));
    navigator.clipboard.writeText(element.getAttribute('data-link')).then(()=>{
      element.innerText = 'Copied!';
      element.classList.add('copied');
    });
  }
})

// Esse função serve para setar o texto copy em todos os botões que têm a classe btn-copy
function setDefaultConfigInBtnCopy(){
  let allButtons = document.querySelectorAll('.btn-copy');
  allButtons.forEach((button)=>{
    button.classList.remove('copied');
    button.innerText = 'copy';
  });
}

// função responsável pela verificação de internet
function verifyInternet(){
  let xhr = new XMLHttpRequest(); //criando novo objeto XML
  xhr.open("GET","https://jsonplaceholder.typicode.com/posts", true); //sending get request on this URL
  xhr.onload = ()=>{ 
      //uma vez ajax carregado
      //se o status do ajax for igual a 200 ou menor que 300, isso significa que o usuário está obtendo dados desse URL fornecido
      //ou seu status de resposta é 200, o que significa que ele está online
      if(xhr.status == 200 && xhr.status < 300){
         //o usuário está com internet
          setTimeout(()=>{ //ocultar a notificação do brinde automaticamente após 5 segundos
              //remover o prenchimento branco
              online();
          }, 200);
      }else{
          //o usuário está sem internet
          offline(); //chamando a função offline se o status do ajax não for igual a 200 ou não inferior a 300
      }
  }
  xhr.onerror = ()=>{
      offline(); //chamando a função offline se o URL passado não estiver correto ou retornando 404 ou outro erro
  }
  xhr.send(); //enviando solicitação get para o URL passado
}


function offline(){
  document.querySelector('.alert-internet').classList.add('open');
  document.querySelector('.shorten button ').style.pointerEvents = 'none';
}
function online(){
  document.querySelector('.alert-internet').classList.remove('open');
  document.querySelector('.shorten button ').style.pointerEvents = 'all';

}

window.onload = ()=>{
  setInterval(()=>{ //esta função setInterval chama ajax frequentemente após 100ms
    verifyInternet();
  }, 50);
}