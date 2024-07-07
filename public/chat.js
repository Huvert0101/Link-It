const socket = io();
let uploadBtn = document.getElementById("send_file");
let offsetX = 0, offsetY = 0, mouseX = 0, mouseY = 0;
let startWidth, startHeight, startX, startY;
let closeUpload = document.getElementById("closeUpload");
let inputFile = document.getElementById("file");
let uploadFile = document.querySelector(".uploadWrapper");
let btnFile = document.getElementById("btn_add");
let dropArea = document.querySelector(".dropArea");
let porcentageBar = document.getElementById("porcentage");
let progressCont = document.querySelector(".uploading-cont");
let formFolder = document.getElementById('formFolder')
let inputFolder = document.getElementById('inputFolder')
let btnAddFolder = document.getElementById('addFolder')
let btnBack = document.querySelector('.bx-arrow-back')
let message = document.getElementById('input');
let btn = document.getElementById('btn_send');
let output = document.querySelector('.display');
let folderList = document.querySelector(".folders-cont");
let btnMenu = document.querySelector('.bx-menu');
const menu = document.querySelector('.right');
let overlay = document.querySelector('.overlay');
let btnIframe = document.querySelector(".bx-globe");
let iframeForm = document.querySelector(".iframe-form");
let iframeUrl = document.getElementById("iframe_url");
let windowTop = document.querySelector(".window-top");
let btnGo = document.getElementById("btnGo");
let resizer = document.getElementById("resizer");
let btnCloseWindow = document.getElementById("btnCloseWindow");
let btnMinWindow = document.getElementById("minWindow");
let btnNewWindow = document.getElementById("newWindow");
let btnProfile = document.querySelector(".btnProfile");
let btnPlayer = document.querySelector(".bxs-music");
let plugin = document.querySelector(".plugin");
let playlist = document.querySelector(".playlist");
let currentSongTitle = document.getElementById("currentSongTitle");
const URL = "https://www-linkit-2baa3535.koyeb.app";
let minWin = false;
let minPlugin = true;
let playerLoaded = false;
let currentFolder = "main";

// Front-end functions

btnMenu.onclick = () => {
  overlay.style.display = 'block';
  menu.style.display = 'block';
}
btnIframe.onclick = () => {
  if(minWin){
    btnIframe.style.opacity = 1;
    document.querySelector(".iframeCont").style.display = "block";
  }else{
    iframeForm.style.display = "block";
    btnIframe.style.opacity = 1;
    iframeUrl.focus();
  }
}
btnPlayer.onclick = async () => {
  if(minPlugin){
    plugin.style.scale = 1;
    plugin.style.position = "relative";
    plugin.style.zIndex = 5;
    minPlugin = false;
    btnPlayer.style.opacity = 1;
    if(!playerLoaded){
      playerLoaded = true;
      const response = await fetch(URL+'/getMusic');
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const mp3Files = await response.json();
      console.log(mp3Files);
      if(mp3Files.length > 0){
        let songs = [];
        let audio = null;
        currentSongTitle.innerText = "Select a song";
        mp3Files.forEach(song => {
          songs.push(song);
          const button = document.createElement("button");
          button.textContent = song;
          button.setAttribute("id", song);
          button.onclick = () => {
            audio = new Audio(URL+"/files/" + song);
            audio.play();
            audio.addEventListener('ended', function() {
              button.classList.remove("active-song");
              let songInd = songs.indexOf(song);
              songInd = songInd + 1;
              let nextSong = songs[songInd] || 0;
              let tmpBtn = document.getElementById(nextSong);
              console.log(tmpBtn);
              tmpBtn.click();
            });
            currentSongTitle.innerText = song;
            button.classList.add("active-song");
            btnPlayStop.classList.remove("bx-play");
            btnPlayStop.classList.add("bx-pause");
          }
          playlist.appendChild(button);
        })
        console.log(songs);
      }else{
        currentSongTitle.innerText = "No Song";
        playlist.innerHTML = "<p>No music has been found :c<br>Upload mp3 files.</p>";
      }
    }
  }else{
    plugin.style.scale = 0;
    plugin.style.zIndex = -2;
    setTimeout(() => {
      plugin.style.position = "absolute";
    }, 100);
    minPlugin = true;
    btnPlayer.style.opacity = 0.7;
  }
}
btnGo.onclick = () => {
  const iframeCont = document.createElement("div");
  iframeCont.className = "iframeCont";

  // Crear el icono de nueva ventana
  const newWindowIcon = document.createElement("i");
  newWindowIcon.className = "bx bx-plus";
  newWindowIcon.id = "newWindow";

  // Crear la barra superior de la ventana
  const windowTop = document.createElement("div");
  windowTop.className = "window-top";

  // Crear el título de la ventana
  const windowTitle = document.createElement("span");
  windowTitle.id = "window-title";
  windowTitle.innerText = "Window Title";

  // Crear el icono de minimizar
  const minWindowIcon = document.createElement("i");
  minWindowIcon.className = "bx bx-minus";
  minWindowIcon.id = "minWindow";

  // Crear el icono de cerrar
  const btnCloseWindowIcon = document.createElement("i");
  btnCloseWindowIcon.className = "bx bx-x";
  btnCloseWindowIcon.id = "btnCloseWindow";

  // Añadir el título y los iconos a la barra superior de la ventana
  windowTop.appendChild(windowTitle);
  windowTop.appendChild(minWindowIcon);
  windowTop.appendChild(btnCloseWindowIcon);

  // Añadir los elementos a iframeCont
  iframeCont.appendChild(newWindowIcon);
  iframeCont.appendChild(windowTop);
  document.body.appendChild(iframeCont);
  btnCloseWindowIcon.onclick = () => {
    minWin = false;
    document.body.removeChild(iframeCont);
    btnIframe.style.opacity = 0.7;
  }
  minWindowIcon.onclick = () => {
    minWin = true;
    iframeCont.style.display = "none";
    btnIframe.style.opacity = 0.7;
  }

  var iframe = document.createElement('iframe');
  iframe.src = iframeUrl.value;
  iframeUrl.value = '';
  document.getElementById('window-title').innerText = iframe.src;
  iframe.width = '100%';
  iframe.height = '100%';
  iframeCont.appendChild(iframe);
  iframeForm.style.display = "none";
  iframe.onload = () => {
    iframeCont.style.display = "block";
  }
  newWindowIcon.onclick = () => {
    iframeForm.style.display = "block";
  }
windowTop.onmousedown = function(e) {
        e.preventDefault();
        iframeCont.style.cursor = "grabbing";
        // Obtener la posición inicial del ratón
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Adjuntar los eventos para mover el div y soltarlo
        document.onmousemove = elementDrag;
        document.onmouseup = closeDragElement;
    };

    // Función que se ejecuta mientras se arrastra el div
    function elementDrag(e) {
        e.preventDefault();
        // Calcular el nuevo desplazamiento del ratón
        offsetX = mouseX - e.clientX;
        offsetY = mouseY - e.clientY;
        // Actualizar la posición inicial del ratón
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Establecer la nueva posición del div
        iframeCont.style.top = (iframeCont.offsetTop - offsetY) + "px";
        iframeCont.style.left = (iframeCont.offsetLeft - offsetX) + "px";
    }

    // Función que se ejecuta cuando se suelta el div
    function closeDragElement() {
        // Desconectar los eventos de movimiento y soltar
        iframeCont.style.cursor = "grab";
        document.onmousemove = null;
        document.onmouseup = null;
    }
}
overlay.onclick = () => {
  menu.style.display = 'none';
  overlay.style.display = 'none';
}
closeUpload.onclick = (e)=>{
  e.preventDefault()
  uploadFile.style.display = "none";
}
btnFile.onclick = ()=>{
  uploadFile.style.display = "flex";
}
// Drag and drop
document.body.addEventListener("dragenter", ()=>{
  uploadFile.style.display = "flex";
});

// Back-end functions
function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

let username = getCookie("username");
if(username == '') window.location.href = '/welcome';
const newUser = username.replace(/\+|%20/g, " ");
btnProfile.innerHTML = newUser;

socket.emit('getUser', { user: newUser });

async function postFile (file) {
  progressCont.style.display = "flex";
  const data = new FormData();
  data.append("file", file)
  data.append("user", newUser);
  data.append("folder", currentFolder)
  await axios.post('/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }, onUploadProgress(e){
      const porcentage = Math.round((e.loaded * 100)/e.total);
      porcentageBar.innerText = porcentage + "%";
      if(porcentage == 100){
        porcentageBar.innerText = "0%";
        progressCont.style.display = "none";
      }
    }
  });
}

uploadBtn.onclick = async (event) => {
  event.preventDefault();

  const fileLength = inputFile.files.length;
  for (let i = 0; i < fileLength; i++) {
    const file = inputFile.files[i];
    postFile(file)  
    closeUpload.click();
  }

  inputFile.value = "";
  dropArea.innerHTML = '';
  dropArea.innerText = 'Drop Or Select Your Files Here';
  //userInput.value = newUser;
}

dropArea.addEventListener('dragover', (e) => e.preventDefault());

function showFiles () {
  dropArea.innerHTML = '';
  for (let i = 0; i < inputFile.files.length; i++) {
    const file = inputFile.files[i];
    dropArea.innerHTML += "<p class='fileItem'>"+file.name+"</p>"; 
  }
}

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  inputFile.files = files
  showFiles();
})

message.addEventListener('paste', (e) => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  const itemsLength = items.length;

  for (let i = 0; i < itemsLength; i++) {
    const item = items[i];
    const file = item.getAsFile();
    if(!file) return
    let newFile;

    switch (file.type) {
      case 'application/pdf':
        newFile = new File([file], "File"+Date.now()+".pdf", { type: file.type });
        break;
      case 'video/mp4':
        newFile = new File([file], "File"+Date.now()+".mp4", { type: file.type });
        break; 
      case 'video/webm':
        newFile = new File([file], "File"+Date.now()+".webm", { type: file.type });
        break; 
      default:
        newFile = new File([file], "File"+Date.now()+".png", { type: file.type });
        break;
    }
    postFile(newFile)
  }
})

dropArea.addEventListener('click', () => inputFile.click())
inputFile.onchange = () => showFiles();

function addFolder() {
  folderList.insertBefore(formFolder, folderList.lastChild)
  formFolder.style.display = 'block'
  inputFolder.focus();
}

// Get clicked folder
let lastFolder;
let folderEl;
folderList.onclick = (event)=>{
  let folder = event.target.id;
  if(folder == 'inputFolder' || folder == '') return
  if(folder == 'addFolder'){ addFolder(); return}
  folderEl = document.getElementById(folder);
  if(lastFolder != undefined && lastFolder.parentElement.classList.contains('currentFolder')) lastFolder.parentElement.classList.remove("currentFolder");
  folderEl.parentElement.classList.add("currentFolder");
  currentFolder = folder;
  socket.emit('changedFolder', { folder: currentFolder, user: newUser })
  output.innerHTML = '';
  lastFolder = folderEl;
  btnBack.style.visibility = 'visible'
}

btnBack.onclick = () => {
  currentFolder = 'main';
  socket.emit('changedFolder', { folder: currentFolder, user: newUser })
  folderEl.parentElement.classList.remove('currentFolder');
  btnBack.style.visibility = 'hidden'
}

btn.addEventListener('click', ()=>{
  if(message.value.trim() == '') return;

  socket.emit('chat:message', {
    message: message.value,
    user: newUser,
    folder: currentFolder
  });
  //userInput.value = newUser;
});

addEventListener('keydown', function(e){
  if(e.key == 'Enter' && message.value.trim() != ""){
    socket.emit('chat:message', {
      message: message.value,
      user: newUser,
      folder: currentFolder
    });
  }
});

formFolder.onsubmit = (e) => {
  e.preventDefault();
  socket.emit('createFolder', { user: newUser, folderName: inputFolder.value });
  inputFolder.value = '';
  formFolder.style.display = 'none';
}

function addToDom(data) {
  if(data.type == "file") {
    let extension = data.message.split('.').pop();
    let msg = data.message.substring(6);
    if(extension == "png" || extension == "jpg" || extension == "webp" || extension == "jpeg")
      output.innerHTML += `<img class='rounded-4' src='${data.message}'><br>`
    if(extension == "docx" || extension == "doc")
      output.innerHTML += `<button class='fileBtn' onclick='loadDoc("${data.message}")' name='${data.message}'>${msg}</button><br>`
    else output.innerHTML += `<a target='_blank' href='${data.message}'><button class='fileBtn'>${msg}</button></a><br>`
  }else {
    let isLink = data.message.slice(0, 5);
    if(isLink == "https" || isLink == "https:") output.innerHTML += `<a target='_blank' href='${data.message}'>${data.message}</a><br>`
    else output.innerHTML += `<p>${data.message}</p>` 
  }
  const interval = setInterval(() => output.scrollTop=output.scrollHeight, 50);
  setTimeout(() => clearInterval(interval), 2500);
}

function addBtnFolder() {
  let node = document.getElementById('addFolder');
  folderList.insertBefore(node, null)
}

socket.on('chat:message', (data) => {
  setTimeout(() => output.scrollTop=output.scrollHeight, 50);
  message.value = '';
  if(data.user == newUser && data.folder == currentFolder) addToDom(data)
});

socket.on('createdFolder', (data)=>{
  if(data.user == newUser){ folderList.innerHTML += `<div class='folder'>
  <span class='folder-title' id='${data.folderName}'>${data.folderName}</span></div>`;
  addBtnFolder() }
});

socket.on('getFiles', (files)=>{ if(files.user == newUser) addToDom(files) });
let cont = 0;
let fetchedFolders = false;
socket.on('getMessages', (data) => {
  message.value = '';
  if(cont == 0){ cont++; data.forEach(el => addToDom(el)); }
});

socket.on('getFolders', (data)=>{
  if(data.length == 0){ addBtnFolder(); return}
  if(data[0].user == newUser && !fetchedFolders){
    data.forEach(el => 
      folderList.innerHTML += `<div class='folder'><span class='folder-title' id='${el.folder}'>${el.folder}</span><i class='bx bx-dots-horizontal-rounded' style='color:#ffffff'></i></div>` );
    addBtnFolder()
  }
  fetchedFolders = true; // do stuff with it
});

socket.on('getMessagesFol', (data)=>{
  output.innerHTML = ''
  if(data.length == 0) return;
  if(data[0].folder == currentFolder && !output.hasChildNodes()) data.forEach(el => addToDom(el))
});

async function delFol(folder){
  const data = {folderName: folder, user: newUser};
  await axios.post('/delFol', data).then((res)=>{
    if(res.status == 200){
      let folderEl = document.getElementById(folder);
      let delEl = document.getElementById(folder + "1");
      folderEl.remove();
      delEl.remove();
    }else console.log(res);
  });
}
