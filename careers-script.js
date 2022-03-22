const baseURL = "https://proxy.cloverlabs.dev/lever";
var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};

function removeHash() { 
  history.pushState("", document.title, window.location.pathname + window.location.search);
}

const positions = document.getElementById("open-positions-container"),
      loader = document.getElementById("positions-loading"),
      error = document.getElementById("positions-error"),
      back = document.getElementById("position-back"),
      singleLoader = document.getElementById("position-loading"),
      singleError = document.getElementById("position-error"),
      singlePosition = document.getElementById("position-data");

back.addEventListener("click", function (e) {
  removeHash();
  window.scrollTo(0, 0);
  document.getElementsByClassName("career")[0].style.display = 'block';
  document.getElementsByClassName("open-positions-section")[0].style.display = 'block';
  document.getElementById("single-position").style.display = 'none';
});

const modify_position = function(position) {
  return function curried_func(e) {
    window.scrollTo(0, 0);
    document.getElementsByClassName("career")[0].style.display = 'none';
    document.getElementsByClassName("open-positions-section")[0].style.display = 'none';
    document.getElementById("position-heading").innerText = position.text;
    if(position.categories.team && (position.categories.location || position.categories.commitment)) {
      document.getElementById("position-dash").style.display = "block";
    } else {
      document.getElementById("position-dash").style.display = "none";
    }
    if(position.categories.team) {
      document.getElementById("position-team").innerText = position.categories.team;
    }
    else {
      document.getElementById("position-team").innerText = "";
    }
    if(position.categories.location && position.categories.commitment){
      document.getElementById("position-location").innerText = position.categories.location + " / " + position.categories.commitment;
    }
    else {
      if(position.categories.location) {
        document.getElementById("position-location").innerText = position.categories.location;
      }
      if(position.categories.commitment) {
        document.getElementById("position-location").innerText = position.categories.commitment;
      }
    }
    document.getElementById("position-desc").innerHTML = position.content.descriptionHtml;
    if(position.content.lists) {
      let lists = position.content.lists;
      for(let i = 0; i < lists.length; i++) {
        document.getElementById("position-desc").innerHTML += "<h3><strong>" + lists[i].text + "</strong></h3>";
        document.getElementById("position-desc").innerHTML += "<ul>" + lists[i].content + "</ul>";
      }
    }
    document.getElementById("single-position").style.display = 'block';
  }
}

const form = document.getElementById('application-form');
form.addEventListener('submit', function(e){
  e.preventDefault();
  const formData = new FormData(e.target);
  const formProps = Object.fromEntries(formData);
  console.log(formProps);
});

const resume = document.getElementById("resume"),
      fileSizeErr = document.getElementById('file-upload-oversize'),
      fileTypeErr = document.getElementById('file-upload-type'),
      fileErr = document.getElementById('file-upload-fail'),
      fileSuccess = document.getElementById('file-upload-success'),
      fileUploading = document.getElementById('file-upload-working');

resume.addEventListener("change", function(event) {
  var files = resume.files;
  if (files.length) {
    let file = files[0];
    console.log(file);
    console.log(file.type);
    if(fileSizeErr.classList.contains('hidden')) fileSizeErr.classList.add('hidden');
    if(fileErr.classList.contains('hidden')) fileErr.classList.add('hidden');
    if(fileTypeErr.classList.contains('hidden')) fileTypeErr.classList.add('hidden');
    if(fileSuccess.classList.contains('hidden')) fileSuccess.classList.add('hidden');
    if(fileUploading.classList.contains('hidden')) fileUploading.classList.add('hidden');
    let filesize = ((file.size/1024)/1024).toFixed(4); // MB
    if( !(file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/pdf" || file.type === "application/msword") ) {
      fileTypeErr.classList.remove('hidden');
    }
    else if(filesize > 30) {
      fileSizeErr.classList.remove('hidden');
    }
    else {
      fileUploading.classList.remove('hidden');
      const formData = new FormData();
      formData.append("file", file);
      uploadFile(formData).then(response => {
        console.log(response);
        fileUploading.classList.add('hidden');
        if(response.data.hasOwnProperty('uri')) fileSuccess.classList.remove('hidden');
        else fileErr.classList.remove('hidden');
      });
    }
  }
}, false);

async function uploadFile(file) {
  let request = {
    method: 'POST',
    body: file,
    redirect: 'follow'
  };
  const response = await fetch(`${baseURL}/uploads`, request);
  const fileInfo = await response.json();
  return fileInfo;
}

async function fetchPositions() {
  error.style.display = "none";
  loader.style.display = "flex";
  const response = await fetch(`${baseURL}/postings`, requestOptions);
  const positions = await response.json();
  loader.style.display = "none";
  return positions;
}

async function fetchPosition(id) {
  singleError.style.display = "none";
  singleLoader.style.display = "flex";
  const response = await fetch(`${baseURL}/postings/${id}`, requestOptions);
  const positions = await response.json();
  singleLoader.style.display = "none";
  return positions;
}

async function fetchPositionForm(id) {
  const response = await fetch(`${baseURL}/postings/${id}/apply`, requestOptions);
  const formFields = await response.json();
  return formFields;
}

fetchPositions().then(result => {
  let data = result.data;
  let arrayN = {};
  for(let i = 0; i < data.length; i++) {
    //fetchPositionForm(data[i].id).then(result => { console.log(data[i].text); console.log(result.data.personalInformation); console.log(result.data.urls); });
    if(data[i].state == 'published') {
      let team = "";
      if(data[i].hasOwnProperty("categories") && data[i].categories.hasOwnProperty("team") && data[i].categories.team) {
        team = data[i].categories.team.toLowerCase().replace(' ', '-');
      }
      else {
        team = "uncategorized";
      }
      if(!arrayN.hasOwnProperty(team)) {
        arrayN[team] = [];
      }
      arrayN[team].push(data[i]);
    }
  }

  let array = Object.keys(arrayN).sort().reduce(function (acc, key) { 
    acc[key] = arrayN[key];
    return acc;
  }, {});

  let fragment = document.createDocumentFragment();
  for (var key of Object.keys(array)) {
    let catHeading = document.createElement("h2");
    catHeading.className = "heading-22";
    catHeading.innerText = '';
    let container = document.createElement("div");
    container.className = "w-layout-grid open-positions";
    for(let j = 0; j < array[key].length; j++) {
      if(catHeading.innerText == '') {
        if(array[key][j].categories.team) {
          catHeading.innerText = array[key][j].categories.team;
        }
        else {
          catHeading.innerText = "Uncategorized";
        }
      }
      let card = document.createElement("div");
      card.className = "position-card";
      let content = document.createElement("div");
      content.className = "position-card-content";
      let title = document.createElement("h3");
      title.className = "heading-13";
      title.innerText = array[key][j].text;
      let details = document.createElement("div");
      details.className = "text-block";
      if(array[key][j].categories.location && array[key][j].categories.commitment) {
        details.innerText = array[key][j].categories.location + " / " + array[key][j].categories.commitment;
      }
      content.append(title,details);
      let button = document.createElement("div");
      button.className = "position-card-button";
      let link = document.createElement("a");
      link.className = "button button-primary w-button";
      link.innerText = "Learn More";
      link.href = "#" + array[key][j].id;
      link.addEventListener("click", modify_position(array[key][j]));
      button.appendChild(link);
      card.append(content,button);
      container.appendChild(card);
    }
    fragment.append(catHeading,container);
  }
  positions.appendChild(fragment);
}).catch(err => {
  console.log('error', err);
  error.style.display = "block";
});

if(window.location.hash != '') {
  singlePosition.style.display = 'none';
  document.getElementsByClassName("career")[0].style.display = 'none';
  document.getElementsByClassName("open-positions-section")[0].style.display = 'none';
  document.getElementById("single-position").style.display = 'block';
  let id = window.location.hash.replace("#", "");
  fetchPosition(id).then(result => {
    fetchPositionForm(id).then(fields => console.log(fields.data));
    let position = result.data;
    document.getElementById("position-heading").innerText = position.text;
    if(position.categories.team && (position.categories.location || position.commitment)) {
      document.getElementById("position-dash").style.display = "block";
    } else {
      document.getElementById("position-dash").style.display = "none";
    }
    if(position.categories.team) {
      document.getElementById("position-team").innerText = position.categories.team;
    }
    if(position.categories.location && position.categories.commitment){
      document.getElementById("position-location").innerText = position.categories.location + " / " + position.categories.commitment;
    }
    else {
      if(position.categories.location) {
        document.getElementById("position-location").innerText = position.categories.location;
      }
      if(position.categories.commitment) {
        document.getElementById("position-location").innerText = position.categories.commitment;
      }
    }
    document.getElementById("position-desc").innerHTML = position.content.descriptionHtml;
    if(position.content.lists) {
      let lists = position.content.lists;
      for(let i = 0; i < lists.length; i++) {
        document.getElementById("position-desc").innerHTML += "<h3><strong>" + lists[i].text + "</strong></h3>";
        document.getElementById("position-desc").innerHTML += "<ul>" + lists[i].content + "</ul>";
      }
    }
    singlePosition.style.display = 'block';
  }).catch(err => {
    console.log('error', err);
    singleError.style.display = "block";
  });
}