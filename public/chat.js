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
let formFolder = document.getElementById('formFolder');
let inputFolder = document.getElementById('inputFolder');
let btnAddFolder = document.getElementById('addFolder');
let btnBack = document.querySelector('.bx-chevron-left');
let message = document.getElementById('input');
let btn = document.getElementById('btn_send');
let output = document.querySelector('.display');
let folderList = document.querySelector(".folders-cont");
let friendList = document.querySelector(".friends-cont");
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
let friendsCont = document.querySelector(".friends-cont");
let btnFriends = document.getElementById("btnFriends");
let rightPanelTitle = document.getElementById("rightPanelTitle");
let btnAddFriend = document.getElementById("btnAddFriend");
let searchBar = document.getElementById("searchBar");
let btnFolders = document.getElementById("btnFolders");
let btnCustomize = document.getElementById("btnCustomize");
let customizeCont = document.querySelector(".customizeCont");
let secodndaryBg = document.getElementById("secondaryBg");
let selectBg = document.getElementById("selectBg");
let dropBg = document.querySelector(".dropBg");
let fileSelectBg = document.getElementById("fileSelectBg");
let backgroundsCont = document.querySelector(".backgrounds");
let btnCreateDoc = document.querySelector(".bx-file-blank");
let songProgress = document.getElementById("songProgress");
let waves = document.getElementById("waves");
let btnNextSong = document.querySelector(".bx-skip-next");
let btnPrevSong = document.querySelector(".bx-skip-previous");
let middlePane = document.querySelector(".middle");
let inputMsgBar = document.getElementById("input");
let mainCont = document.querySelector(".main");
const right = document.querySelector('.right');
let btnLoopSong = document.querySelector(".bx-rotate-ccw");
let foldersPluginPos = "right";
let leftPanel = document.querySelector(".left");
const URL = window.location;
const API_URL = "http://linkit1.duckdns.org";
let ventanaActiva = null;
let minWin = false;
let minPlugin = true;
let playerLoaded = false;
let currentFolder = "main";
let genVolumeBar = document.getElementById("genVolumeBar");

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
loopedSong = false;
btnLoopSong.onclick = () =>{
  if(loopedSong){
    btnLoopSong.style.setProperty('background-color', 'transparent', 'important');
    loopedSong = false;
  }else{
    btnLoopSong.style.setProperty('background-color', '#ffffff1a', 'important');
    loopedSong = true;
  }
}
let songs = [];
let audio = null;
let lastPlayerBtn = null;
btnPlayer.onclick = async () => {
  if(minPlugin){
    if(window.innerWidth < 600){
      leftPanel.style.display = "none";
      plugin.style.width = "l00%";
      plugin.style.height = "90%";
    }else{
      leftPanel.style.width = "59%";
    }
    plugin.style.scale = 1;
    plugin.style.position = "relative";
    plugin.style.zIndex = 5;
    minPlugin = false;
    btnPlayer.style.opacity = 1;
      playerLoaded = true;
      const response = await fetch("/getMusic");
      if (!response.ok) {
        currentSongTitle.innerText = "No Song";
        playlist.innerHTML = "<p>No music has been found :c<br>Upload mp3 files.</p>";
        throw new Error(`Error: ${response.statusText}`);
      }
      const mp3Files = await response.json();
      console.log(mp3Files);
      if(mp3Files.length > 0){
        if(!audio) currentSongTitle.innerText = "Select a song";
        playlist.innerHTML = "";
        mp3Files.forEach(song => {
          if(!songs.includes(song)) songs.push(song);
          const button = document.createElement("button");
          console.log(song)
          button.textContent = song;
          button.setAttribute("id", song);
          button.onclick = () => {
            if(audio != null && !audio.paused) audio.pause();
            audio = new Audio("api/files/" + song);
            audio.volume = parseFloat(genVolumeBar.value);
            audio.play();
            audio.addEventListener("loadedmetadata", () => {
              songProgress.max = audio.duration;
            });
            if(lastPlayerBtn != button && lastPlayerBtn != null){
              lastPlayerBtn.classList.remove("active-song");
              lastPlayerBtn = button;
            }
            if(lastPlayerBtn == null) lastPlayerBtn = button;
            audio.addEventListener("timeupdate", () => {
              songProgress.value = audio.currentTime;
            });
            audio.addEventListener('ended', function() {
              if(loopedSong){
                let songInd = songs.indexOf(song);
                songInd = songInd + 0;
                let nextSong = songs[songInd] || songs[0];
                let tmpBtn = document.getElementById(nextSong);
                tmpBtn.click();
              }else{
                button.classList.remove("active-song");
                let songInd = songs.indexOf(song);
                songInd = songInd + 1;
                let nextSong = songs[songInd] || songs[0];
                let tmpBtn = document.getElementById(nextSong);
                tmpBtn.click();
              }
            });
            btnNextSong.onclick = () => {
              audio.pause();
              button.classList.remove("active-song");
              let songInd = songs.indexOf(song);
              songInd = songInd + 1;
              let nextSong = songs[songInd] || songs[0];
              let tmpBtn = document.getElementById(nextSong);
              tmpBtn.click();
            }
            btnPrevSong.onclick = () => {
                audio.pause();
                button.classList.remove("active-song");
                let songInd = songs.indexOf(song);
                songInd = songInd - 1;
                let nextSong = songs[songInd] || songs[songs.length-1];
                let tmpBtn = document.getElementById(nextSong);
                tmpBtn.click();
            }
            currentSongTitle.innerText = song;
            button.classList.add("active-song");
            btnPlayStop.classList.remove("bx-play");
            btnPlayStop.classList.add("bx-pause");
          }
          btnPlayStop.onclick = () => {
            if(btnPlayStop.classList.contains("bx-pause")){
              audio.pause();
              btnPlayStop.classList.add("bx-play");
              btnPlayStop.classList.remove("bx-pause");
              waves.querySelectorAll('span').forEach(el => { el.classList.add('pausedAnim'); });
            }else{
              audio.play();
              btnPlayStop.classList.add("bx-pause");
              btnPlayStop.classList.remove("bx-play");
              waves.querySelectorAll('span').forEach(el => { el.classList.remove('pausedAnim'); });
            }
          }
          playlist.appendChild(button);
        });
      }else{
        currentSongTitle.innerText = "No Song";
        playlist.innerHTML = "<p>No music has been found :c<br>Upload mp3 files.</p>";
      }
  }else{
    plugin.style.scale = 0;
    plugin.style.zIndex = -2;
    setTimeout(() => { plugin.style.position = "absolute"; leftPanel.style.width = "73%";}, 100);
    minPlugin = true;
    btnPlayer.style.opacity = 0.7;
    if(window.innerWidth < 600){
      leftPanel.style.display = "flex";
      setTimeout(() => { plugin.style.position = "absolute"; leftPanel.style.width = "100%";}, 100);
    }
  }
}
songProgress.onchange = () => audio.currentTime = songProgress.value;
genVolumeBar.addEventListener('input', function() {
  const newVolume = parseFloat(genVolumeBar.value);
  if(audio!=null) audio.volume = newVolume;
});
function createIframeWindow(site){
  const iframeCont = document.createElement("div");
  iframeCont.className = "iframeCont";
  const newWindowIcon = document.createElement("i");
  newWindowIcon.className = "bx bx-plus";
  newWindowIcon.id = "newWindow";
  const windowTop = document.createElement("div");
  windowTop.className = "window-top";
  const windowTitle = document.createElement("span");
  windowTitle.id = "window-title";
  windowTitle.innerText = "Window Title";
  const minWindowIcon = document.createElement("i");
  minWindowIcon.className = "bx bx-minus";
  minWindowIcon.id = "minWindow";
  const btnCloseWindowIcon = document.createElement("i");
  btnCloseWindowIcon.className = "bx bx-x";
  btnCloseWindowIcon.id = "btnCloseWindow";
  windowTop.appendChild(windowTitle);
  windowTop.appendChild(minWindowIcon);
  windowTop.appendChild(btnCloseWindowIcon);
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
  iframe.src = site;
  iframeUrl.value = '';
  document.getElementById('window-title').innerText = iframe.src;
  iframe.width = '100%';
  iframe.height = '100%';
  iframeCont.appendChild(iframe);
  iframeForm.style.display = "none";
  iframe.onload = () => { iframeCont.style.display = "block"; }
  newWindowIcon.onclick = () => { iframeForm.style.display = "block"; }
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
    iframeCont.style.cursor = "grab";
    document.onmousemove = null;
    document.onmouseup = null;
  }
}

// EVENTS TO DRAGGABLE PLUGINS
let nuevoDiv = null;
function checkCollision(element1, element2) {
  if (!element1 || !element2) return false;
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();
  // Comprueba si los rectángulos se superponen
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}
function isMouseInsideElement(mouseX, mouseY, element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    // Comprueba si las coordenadas del mouse están dentro del rectángulo del elemento
    return mouseX >= rect.left &&
           mouseX <= rect.right &&
           mouseY >= rect.top &&
           mouseY <= rect.bottom;
}
tempBarra = null;
document.querySelectorAll('.draggablePlugin').forEach(barra => {
    tempBarra = barra;
    barra.addEventListener('mousedown', (e) => {
      ventanaActiva = barra.parentElement;  // El div padre es el que se mueve
      if(ventanaActiva.classList.contains("top-content")) ventanaActiva = ventanaActiva.parentElement;
      const rect = ventanaActiva.getBoundingClientRect();
      ventanaActiva.style.width = rect.width + 'px';
      ventanaActiva.style.height = rect.height + 'px';
      if (getComputedStyle(ventanaActiva).position !== 'absolute') {
        ventanaActiva.style.position = 'absolute';
        ventanaActiva.style.left = rect.left + window.scrollX + 'px';
        ventanaActiva.style.top = rect.top + window.scrollY + 'px';
      }
      if(ventanaActiva.classList.contains("right")){
        if(foldersPluginPos == "right"){
          nuevoDiv = document.createElement('div');
          // Copiar width y height
          nuevoDiv.style.width = rect.width + 'px';
          nuevoDiv.style.height = rect.height + 'px';
          // (Opcional) darle estilo para que lo veas
          nuevoDiv.style.backgroundColor = 'rgba(0, 0, 255, 0.2)';
          nuevoDiv.style.border = '1px dashed blue';
          // Insertarlo como último hijo del contenedor .main
          document.querySelector('.main').prepend(nuevoDiv);
          foldersPluginPos = "left";
        }else{
          nuevoDiv = document.createElement('div');
          nuevoDiv.style.width = rect.width + 'px';
          nuevoDiv.style.height = rect.height + 'px';
          nuevoDiv.style.backgroundColor = 'rgba(0, 0, 255, 0.2)';
          nuevoDiv.style.border = '1px dashed blue';
          document.querySelector('.main').appendChild(nuevoDiv);
          foldersPluginPos = "right";
        }
      }
      ventanaActiva.style.position = "absolute";
      offsetX = e.clientX - ventanaActiva.offsetLeft;
      offsetY = e.clientY - ventanaActiva.offsetTop;
      barra.style.setProperty('cursor','grabbing','important');
    });
  });

  // Mover solo el div activo
  document.addEventListener('mousemove', (e) => {
    if(ventanaActiva) {
      ventanaActiva.style.left = (e.clientX - offsetX) + 'px';
      ventanaActiva.style.top = (e.clientY - offsetY) + 'px';
    }
  });
  // Detener movimiento
  document.addEventListener('mouseup', (e) => {
    tempBarra.style.setProperty('cursor','grab','important');
    if(ventanaActiva){
      ventanaActiva.style.position = "relative";
      ventanaActiva.style.left = 0;
      ventanaActiva.style.top = 0;
      const currentMouseX = e.clientX;
      const currentMouseY = e.clientY;
      if(isMouseInsideElement(currentMouseX,currentMouseY,nuevoDiv)){
        if(foldersPluginPos == "left") document.querySelector('.main').prepend(ventanaActiva);
        else document.querySelector('.main').appendChild(ventanaActiva);
      }
      nuevoDiv.remove();
      ventanaActiva = null;
    }
  });

btnCreateDoc.onclick = ()=> {
  if(btnCreateDoc.classList.contains("clicked")){
    btnCreateDoc.classList.remove("clicked");
    middlePane.style.zIndex = -1;
    middlePane.style.transform = "scale(0)";
    middlePane.style.opacity = 0;
    middlePane.style.position = "absolute"; 
    inputMsgBar.style.width = "91%";
    right.style.width = "25%";
    mainCont.style.gap = "0px";
    return;
  };
  btnCreateDoc.classList.add("clicked");
  middlePane.style.position = "relative"; 
  middlePane.style.zIndex = 1;
  middlePane.style.transform = "scale(1)";
  middlePane.style.opacity = 1;
  inputMsgBar.style.width = "87%";
  right.style.width = "35%";
  mainCont.style.gap = "10px";
};
btnGo.onclick = () => {
  const iframeCont = document.createElement("div");
  iframeCont.className = "iframeCont";
  const newWindowIcon = document.createElement("i");
  newWindowIcon.className = "bx bx-plus";
  newWindowIcon.id = "newWindow";
  const windowTop = document.createElement("div");
  windowTop.className = "window-top";
  const windowTitle = document.createElement("span");
  windowTitle.id = "window-title";
  windowTitle.innerText = "Window Title";
  const windowAction = document.createElement("button");
  windowAction.id = "windowAction";
  let timer;
  let clicks = 0;
  windowAction.addEventListener('click', function() {
    clicks++;
    if (clicks === 1) {
      timer = setTimeout(() => {
        minWin = true;
        iframeCont.style.display = "none";
        btnIframe.style.opacity = 0.7;
        clicks = 0; // Resetea el contador
      }, 250); // 300ms es un tiempo común para diferenciar
    } else {
      clearTimeout(timer);
      minWin = false;
      document.body.removeChild(iframeCont);
      btnIframe.style.opacity = 0.7;
      clicks = 0;
    }
  });
  const minWindowIcon = document.createElement("i");
  minWindowIcon.className = "bx bx-minus";
  minWindowIcon.id = "minWindow";
  const btnCloseWindowIcon = document.createElement("i");
  btnCloseWindowIcon.className = "bx bx-x";
  btnCloseWindowIcon.id = "btnCloseWindow";
  windowTop.appendChild(windowTitle);
  windowTop.appendChild(windowAction);
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
  iframe.onload = () => iframeCont.style.display = "block";
  newWindowIcon.onclick = () => iframeForm.style.display = "block";
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
btnFile.onclick = ()=> uploadFile.style.display = "flex";
document.body.addEventListener("dragenter", ()=> uploadFile.style.display = "flex");

// Back-end functions
function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1);
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return '';
}

let username = getCookie("username");
if(username == '') window.location.href = '/welcome';
const newUser = username.replace(/\+|%20/g, " ");
btnProfile.innerHTML = newUser;

socket.emit('getUser', { user: newUser });

btnFriends.onclick = async() => {
  btnFolders.style.display = "block";
  btnFriends.style.display = "none";
  rightPanelTitle.innerText = "Friends";
  folderList.style.display = "none";
  friendsCont.style.display = "flex";
  while (friendsCont.children.length > 1) div.removeChild(div.children[1]);
  const response = await fetch(URL+'getFriends', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user: newUser})
  });
  if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
  const friends = await response.json();
  friends.forEach(friend=> {
    let friendName = friend.folder.replace('friend', '');
    friendName = friendName.replace(newUser, '');
    const folderDiv = document.createElement('div');
    folderDiv.className = 'folder';
    const folderTitle = document.createElement('span');
    folderTitle.className = 'folder-title';
    folderTitle.id = friend.folder;
    folderTitle.textContent = friendName;
    const icon = document.createElement('i');
    icon.className = 'bx bx-dots-horizontal-rounded';
    icon.style.color = '#ffffff';
    folderDiv.appendChild(folderTitle);
    folderDiv.appendChild(icon);
    friendList.appendChild(folderDiv);
  });
  btnAddFriend.onclick = () => {
    let data = {
      friendUser: searchBar.value,
      user: newUser 
    } 
    fetch(URL+"addfriend", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data) 
    }).then(res => {
      if(res.status == 404) alert("User doesn't exists :c");
    });
  }
}
btnFolders.onclick = () => {
  btnFriends.style.display = "block";
  btnFolders.style.display = "none";
  socket.emit('getFolders', {user: newUser});
  rightPanelTitle.innerText = "Folders";
  folderList.style.display = "flex";
  friendsCont.style.display = "none";
}
let fetchedBgs = false;
btnCustomize.onclick = () => {
  if(btnCustomize.style.opacity != 1){
    btnCustomize.style.opacity = 1;
    customizeCont.style.setProperty("display", "inline", "important");
  }else{
    btnCustomize.style.opacity = 0.7;
    customizeCont.style.setProperty("display", "none", "important");
  }
  if(!fetchedBgs){
    let data = {user: newUser}
    fetch(URL+"getBackgrounds",{
      method: 'post',
      body: JSON.stringify(data),
      headers: {"Content-Type": "application/json"}
    }).then(res =>res.json()).then(bgs=>{
      bgs.forEach(bg => {
        const bgImg = document.createElement("img");
        bgImg.setAttribute("class","bg-item");
        bgImg.setAttribute("draggable","false");
        bgImg.src = "api/"+bg.bg_src;
        backgroundsCont.appendChild(bgImg);
        bgImg.onclick = () => document.body.style.backgroundImage = "url('api/"+ bg.bg_src + "')";
      });
      fetchedBgs = true;
    }); 
  }
}
secodndaryBg.onclick = () => document.body.style.backgroundImage = "url('" + secodndaryBg.src + "')";
async function postFile(file) {
  progressCont.style.display = "flex";
  const data = new FormData();
  data.append("file", file);
  data.append("user", newUser);
  data.append("folder", currentFolder);
  await axios.post('/upload', data, {
    onUploadProgress(e){
      const porcentage = Math.round((e.loaded * 100)/e.total);
      porcentageBar.innerText = porcentage + "%";
    }
  });
  porcentageBar.innerText = "0%";
  progressCont.style.display = "none";
}
async function postBg(file){
  progressCont.style.display = "flex";
  const data = new FormData();
  data.append("bg_src", file);
  data.append("user", newUser);
  await axios.post('/uploadBg', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }, onUploadProgress(e){
      const porcentage = Math.round((e.loaded * 100)/e.total);
      if(porcentage <90) porcentageBar.innerText = porcentage + "%";
      if(porcentage == 100){
        console.log("bg succesfully sended, waiting for save...");
        fileSelectBg.value = '';
      }
    }
  });
  porcentageBar.innerText = "0%";
  progressCont.style.display = "none";
  const bgImg = document.createElement("img");
  bgImg.setAttribute("class","bg-item");
  bgImg.setAttribute("draggable","false");
  bgImg.src = "api/files/"+file.name;
  backgroundsCont.appendChild(bgImg);
  bgImg.onclick = () => document.body.style.backgroundImage = "url('api/" + "files/"+file.name + "')";
}
selectBg.onclick = async(event) => {
  event.preventDefault();
  let fileLength = fileSelectBg.files.length;
  if(fileLength > 0){
    for (let i = 0; i < fileLength; i++) {
      const file = fileSelectBg.files[i];
      await postBg(file);
    }
  }else{
    customizeCont.style.display = "none";
    btnCustomize.style.opacity = 0.7;
  }
}

uploadBtn.onclick = async (event) => {
  event.preventDefault();
  const fileLength = inputFile.files.length;
  for (let i = 0; i < fileLength; i++) {
    const file = inputFile.files[i];
    closeUpload.click();
    await postFile(file); 
  }
  inputFile.value = "";
  dropArea.innerHTML = '';
  dropArea.innerText = 'Drop Or Select Your Files Here';
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
  inputFile.files = files;
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
    postFile(newFile);
  }
});
dropBg.addEventListener('click', () => fileSelectBg.click());
dropArea.addEventListener('click', () => inputFile.click());
inputFile.onchange = () => showFiles();

function addFolder() {
  folderList.insertBefore(formFolder, folderList.lastChild);
  formFolder.style.display = 'block';
  inputFolder.focus();
}

// Get clicked folder
let lastFolder;
let folderEl;
folderList.onclick = (event)=>{
  let folder = event.target.id;
  if(folder == 'inputFolder' || folder == '') return;
  if(folder == 'addFolder'){ addFolder(); return}
  folderEl = document.getElementById(folder);
  if(lastFolder != undefined && lastFolder.parentElement.classList.contains('currentFolder')) lastFolder.parentElement.classList.remove("currentFolder");
  folderEl.parentElement.classList.add("currentFolder");
  currentFolder = folder;
  socket.emit('changedFolder', { folder: currentFolder, user: newUser });
  output.innerHTML = '';
  lastFolder = folderEl;
  btnBack.style.visibility = 'visible';
}
friendList.onclick = (event)=>{
  let folder = event.target.id;
  if(folder == 'inputFolder' || folder == '') return;
  if(folder == 'addFolder'){ addFolder(); return}
  if(folder == 'searchBar') return;
  if(folder == 'btnAddFriend') return;
  folderEl = document.getElementById(folder);
  if(lastFolder != undefined && lastFolder.parentElement.classList.contains('currentFolder')) lastFolder.parentElement.classList.remove("currentFolder");
  folderEl.parentElement.classList.add("currentFolder");
  currentFolder = folder;
  socket.emit('changedFolder', { folder: currentFolder, user: ''});
  output.innerHTML = '';
  lastFolder = folderEl;
  btnBack.style.visibility = 'visible';
}

btnBack.onclick = () => {
  currentFolder = 'main';
  socket.emit('changedFolder', { folder: currentFolder, user: newUser });
  folderEl.parentElement.classList.remove('currentFolder');
  btnBack.style.visibility = 'hidden';
}

btn.addEventListener('click', ()=>{
  if(message.value.trim() == '') return;
  socket.emit('chat:message', {
    message: message.value,
    user: newUser,
    folder: currentFolder
  });
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
    if(extension == "docx" || extension == "doc")
      output.innerHTML += `<button class='fileBtn' onclick='loadDoc("${data.message}")' name='${data.message}'>${msg}</button>`;
    else output.innerHTML += `<div class='linkCont'><a target='_blank' href='api/${data.message}'><button class='fileBtn'>${msg}</button></a><div class='msgMenuCont'><i onclick="delMessage('${data.message}','${data.folder}')" class='bx bx-trash' style='opacity:0.7'></i></div></div>`;
  }else {
    let isLink = data.message.slice(0, 5);
    if(isLink == "https" || isLink == "https:") output.innerHTML += `<div class='linkCont'><a target='_blank' href='${data.message}'>${data.message}</a><div class='msgMenuCont'><i onclick="delMessage('${data.message}','${data.folder}')" class='bx bx-trash' style='opacity:0.7'></i></div></div>`;
    else output.innerHTML += `<div class='linkCont'><p style='word-break: break-all'>${data.user === newUser ? '' : data.user+':'}${data.message}</p><div class='msgMenuCont'><i onclick="delMessage('${data.message}','${data.folder}')" class='bx bx-trash' style='opacity:0.7'></i></div></div>`; 
  }
  const interval = setInterval(() => output.scrollTop=output.scrollHeight, 50);
  setTimeout(() => clearInterval(interval), 2500);
}

function addBtnFolder() {
  let node = document.getElementById('addFolder');
  folderList.insertBefore(node, null);
}
function ytDL(link){
  formData = new FormData();
  formData.append("url", link);
  fetch(API_URL+"/download",{
    method: "POST",
    body: formData
  }).then(response => {
    if (response.ok) return response.blob(); // Recibimos el archivo como un binario (blob)
    throw new Error('Error en la descarga');
  }).then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "musica.mp3"; // Nombre sugerido
    document.body.appendChild(a);
    a.click();
    a.remove();
  })
  .catch(error => console.error("Hubo un fallo:", error));
  console.log(link);
}

socket.on('chat:message', (data) => {
  setTimeout(() => output.scrollTop=output.scrollHeight, 50);
  message.value = '';
  console.log(data);
  if(data.folder.startsWith("friend") && data.folder == currentFolder) {addToDom(data)}
  else{if(data.user == newUser && data.folder == currentFolder) addToDom(data)}
});

socket.on('createdFolder', (data)=>{
  if(data.user == newUser){ folderList.innerHTML += `<div class='folder'>
  <span class='folder-title' id='${data.folderName}'>${data.folderName}</span></div>`;
  addBtnFolder() }
});

socket.on('getFiles', (files)=>{ if(files.user == newUser && files.folder==currentFolder) addToDom(files) });
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
      folderList.innerHTML += `<div class='folder'><span class='folder-title' id='${el.folder}'>${el.folder}</span><i onclick="displayFolderMenu('${el.folder}')" class='bx bx-dots-horizontal-rounded' style='color:#ffffff'></i><div class='folderMenuCont ${el.folder}MenuCont'><i onclick="delFol('${el.folder}')" class='bx  bx-trash' style='color:#ffffff'></i><i class='bx  bx-forward-big' style='color:#ffffff'></i></div></div>`);
    addBtnFolder();
  }
  fetchedFolders = true; // do stuff with it
});

socket.on('getMessagesFol', (data)=>{
  output.innerHTML = ''
  if(data.length == 0) return;
  if(data[0].folder == currentFolder && !output.hasChildNodes()) data.forEach(el => addToDom(el))
});
function displayFolderMenu(folder){
  folderMenuCont = folder+"MenuCont";
  folderMenuContEl = document.querySelector("."+folderMenuCont);
  if(folderMenuContEl.classList.contains("activeMenu")){
    folderMenuContEl.classList.remove("activeMenu");
    folderMenuContEl.style.setProperty("display", "none", "important");
  }else{
    folderMenuContEl.classList.add("activeMenu");
    folderMenuContEl.style.setProperty("display", "flex", "important");
  }
  console.log(folderMenuCont);
}
async function delFol(folder){
  const data = {folderName: folder, user: newUser};
  await axios.post('/delFol', data).then((res)=>{
    if(res.status == 200){
      let folderEl = document.getElementById(folder);
      let delEl = document.getElementById(folder + "1");
      folderEl.parentElement.remove();
      delEl.remove();
    }else console.log(res);
  });
}

async function delMessage(msg,folder){
  const data = {folderName: folder, user: newUser, msg: msg};
  await axios.post('/delMessage', data).then((res)=>{
    if(res.status == 200){
      const link = document.querySelector(`a[href*='${msg}']`);
      if (link) link.remove();
      const parrafos = document.querySelectorAll('p');
      parrafos.forEach(p => {
        if (p.textContent.includes(msg)) {
          p.remove();
        }
      });
    }else console.log(res);
  });
}
