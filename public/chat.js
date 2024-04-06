const socket = io();
let uploadBtn = document.getElementById("send_file");
let closeUpload = document.getElementById("closeUpload");
let inputFile = document.getElementById("file");
let sendto = document.getElementById("sendto");
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
let currentFolder = "main";
// Front-end functions
btnMenu.onclick = () => {
  overlay.style.display = 'block';
  menu.style.display = 'block';
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
sendto.innerHTML = "<option value='"+newUser+"'>"+newUser+"</option>";

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
  if(lastFolder != undefined && lastFolder.classList.contains('currentFolder')) lastFolder.classList.remove("currentFolder");
  folderEl.classList.add("currentFolder");
  currentFolder = folder;
  socket.emit('changedFolder', { folder: currentFolder, user: newUser })
  output.innerHTML = '';
  lastFolder = folderEl;
  btnBack.style.visibility = 'visible'
}

btnBack.onclick = () => {
  currentFolder = 'main';
  socket.emit('changedFolder', { folder: currentFolder, user: newUser })
  folderEl.classList.remove('currentFolder')
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
    if(extension == "png" || extension == "jpg" || extension == "webp" || extension == "jpeg")
      output.innerHTML += `<img class='rounded-4' src='${data.message}'><br>`
    if(extension == "docx" || extension == "doc")
      output.innerHTML += `<button onclick='loadDoc("${data.message}")' name='${data.message}'>${data.message}<br>`
    else output.innerHTML += `<a target='_blank' href='${data.message}'>${data.message}</a><br>`
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
