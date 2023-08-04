const socket = io();
let uploadBtn = document.getElementById("send_file");
let closeUpload = document.getElementById("closeUpload");
let form = document.getElementById("form");
let inputFile = document.getElementById("file");
let account = document.getElementById("account");
let sendto = document.getElementById("sendto");
let uploadFile = document.querySelector(".uploadWrapper");
let btnFile = document.getElementById("btn_add");
//let detecDrop = document.querySelector("body");
//let dropArea = document.querySelector(".drop-area");
//let closeDrop = document.getElementById("closeDrop");
//let dropUserInput = document.getElementById("dropUserInput");
let porcentageBar = document.getElementById("porcentage");
let progressCont = document.querySelector(".uploading-cont");
let formFolder = document.getElementById('formFolder')
let inputFolder = document.getElementById('inputFolder')
let btnAddFolder = document.getElementById('addFolder')
let currentFolder = "main";
// Front-end functions
closeUpload.onclick = (e)=>{
  e.preventDefault()
  uploadFile.style.display = "none";
}
btnFile.onclick = ()=>{
  uploadFile.style.display = "flex";
}
// Drag and drop
//detecDrop.addEventListener("dragenter", ()=>{
//    dropArea.style.display = "block";
//});
//closeDrop.onclick = ()=>{
//    dropArea.style.display = "none";
//}
//dropArea.addEventListener("dragover", (event) =>{
//    event.preventDefault();
//});

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
console.log(newUser)
sendto.innerHTML = "<option value='"+newUser+"'>"+newUser+"</option>";

socket.emit('getUser', { user: newUser });

uploadBtn.onclick = async (event)=>{
    event.preventDefault();
    const data = new FormData(form);
    data.append("user", newUser);
    data.append("folder", currentFolder)
    progressCont.style.display = "flex";
    closeUpload.click();
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
    //inputFile.value = "";
    //userInput.value = newUser;
}
//DOM elements
let message = document.getElementById('input');
let btn = document.getElementById('btn_send');
let output = document.querySelector('.display');
//let modal2 = document.querySelector(".modal2");
//let closeFolder = document.getElementById("closeFolder");
//let btnCreateFolder = document.getElementById("btnCreateFolder");
let folderName = document.getElementById("folderName");
let folderList = document.querySelector(".folders-cont");
//btnAddFolder.onclick = ()=>{
    //modal2.style.display = "flex";
//    console.log("Añadir folder")
//}

//btnCreateFolder.onclick = (event)=>{
//    
//    closeFolder.click();
//    folderName.value = "";
//}
function addFolder() {
  console.log('click')
  folderList.insertBefore(formFolder, folderList.lastChild)
  formFolder.style.display = 'block'
  inputFolder.focus();
}
// Get clicked folder

let lastFolder;
folderList.onclick = (event)=>{
  let folder = event.target.id;
  if(folder == 'inputFolder' || folder == '') return
  if(folder == 'addFolder'){ addFolder(); return}
  let folderEl = document.getElementById(folder);
  if(lastFolder != undefined){
    if(lastFolder.classList.contains("currentFolder")){
      lastFolder.classList.remove("currentFolder");
    }
  }
  folderEl.classList.add("currentFolder");
  currentFolder = folder;
  socket.emit('changedFolder', {
    folder: currentFolder,
    user: newUser
  })
  output.innerHTML = '';
  lastFolder = folderEl;
}
btn.addEventListener('click', ()=>{
    if(message.value.trim() == '') return;
    socket.emit('chat:message', {
      message: message.value,
      user: newUser,
      folder: currentFolder
    });
    console.log(message.value)
    //userInput.value = newUser;
});
const interval = setInterval(() => {
    output.scrollTop=output.scrollHeight;
}, 50);
setTimeout(() => {
    clearInterval(interval);
}, 1500);
addEventListener('keydown', function(e){
    if(e.keyCode == 13 && message.value.trim() != ""){
      socket.emit('chat:message', {
        message: message.value,
        user: newUser,
        folder: currentFolder
      });
    }
});

formFolder.onsubmit = (e) => {
  e.preventDefault();
  socket.emit('createFolder', {
    user: newUser,
    folderName: inputFolder.value
  });
  inputFolder.value = '';
  formFolder.style.display = 'none';
}


function addToDom(data) {
    if(data.type == "file"){
      let extension = data.message.split('.').pop();
      if(extension == "png" || extension == "jpg" || extension == "webp" || extension == "jpeg")
        output.innerHTML += `<img class='rounded-4' src='${data.message}'><br>`
      else output.innerHTML += `<a target='_blank' href='${data.message}'>${data.message}</a><br>`
    }else{
      let isLink = data.message.slice(0, 5);
      if(isLink == "https" || isLink == "https:") output.innerHTML += `<a target='_blank' href='${data.message}'>${data.message}</a><br>`
      else output.innerHTML += `<span>${data.message}</span><br>` 
    }
  output.scrollTop=output.scrollHeight;
}

function addBtnFolder() {
  let node = document.getElementById('addFolder');
  folderList.insertBefore(node, null)
}

socket.on('chat:message', (data) => {
    setTimeout(() => {
        output.scrollTop=output.scrollHeight;
    }, 50);
    message.value = '';
    if(data.user == newUser && data.folder == currentFolder) addToDom(data)
});
socket.on('createdFolder', (data)=>{
  if(data.user == newUser) folderList.innerHTML += `<div class='folder'>
  <span class='folder-title' id='${data.folderName}'>${data.folderName}</span></div>`;
  addBtnFolder()
});
socket.on('getFiles', (files)=>{
    if(files.user == newUser){
        let extension = files.filePath.split('.').pop();
        if(extension == "png" || extension == "jpg" || extension == "webp" || extension == "jpeg"){
            output.innerHTML += `<img class='rounded-4'src='${files.filePath}'><br>`
        }else{
            output.innerHTML += `<a target='_blank' href='${files.filePath}'> ${files.filePath}</a><br>`
        }
        const interval2 = setInterval(() => {
            output.scrollTop=output.scrollHeight;
        }, 50);
        setTimeout(() => {
            clearInterval(interval2);
        }, 1500);
    }
});
let cont = 0;
let fetchedFolders = false;
socket.on('getMessages', (data) => {
    message.value = '';
    if(cont == 0){
        cont++;
        data.forEach(el => addToDom(el));
    }
});
socket.on('getFolders', (data)=>{
    if(data.length == 0){ addBtnFolder(); return}
    console.log(data)
    if(data[0].user == newUser && !fetchedFolders){
      data.forEach(el =>{
        console.log(el.folder)
        folderList.innerHTML += `<div class='folder'><span class='folder-title' id='${el.folder}'>${el.folder}</span></div>`;
      });
      addBtnFolder()
    }
    fetchedFolders = true; // do stuff with it
});
socket.on('getMessagesFol', (data)=>{
    if(data.length < 0) return;
    if(data[0].folder == currentFolder && !output.hasChildNodes()){
      data.forEach(el => addToDom(el))
      let interval2 = setInterval(() => {
        output.scrollTop=output.scrollHeight;
      }, 50);
      setTimeout(() => {
        clearInterval(interval2);
      }, 1500);
    }
});
async function delFol(folder){
    const data = {folderName: folder, user: newUser};
    await axios.post('/delFol', data).then((res)=>{
        if(res.status = 200){
            let folderEl = document.getElementById(folder);
            let delEl = document.getElementById(folder + "1");
            folderEl.remove();
            delEl.remove();
        }else{
            console.log(res);
        }
    });
}