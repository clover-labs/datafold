var Webflow = Webflow || [];
Webflow.push(function() {
  // unbind webflow form handling
  $(document).off('submit');
});

(function() {
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
      document.getElementById('form-jobID').value = position.id;
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

  fetchPositions().then(result => {
    let data = result.data;
    let arrayN = {};
    for(let i = 0; i < data.length; i++) {
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
        let card = document.createElement("a");
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
        let link = document.createElement("div");
        link.className = "button button-primary w-button";
        link.innerText = "Learn More";
        card.href = "#" + array[key][j].id;
        card.addEventListener("click", modify_position(array[key][j]));
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
      let position = result.data;
      document.getElementById('form-jobID').value = position.id;
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

  $("#application-form").find(':input').on('invalid', function (event) {
    let input = $(this);
    this.nextSibling.classList.remove('hidden');
    this.classList.add('field-input-error');

    let first = $("#application-form").find(':invalid').first();

    if (input[0] === first[0]) {
      let navbarHeight = $('nav.navbar').height() + 38;
      let elementOffset = input.offset().top - navbarHeight;
      let pageOffset = window.pageYOffset - navbarHeight;

      if (elementOffset > pageOffset && elementOffset < pageOffset + window.innerHeight) {
        return true;
      }

      $('html,body').animate({
        scrollTop: elementOffset
      },'slow');
    }
  })

  const form = document.getElementById('application-form'),
        formSuccess = document.getElementById('application-form-success'),
        formFail = document.getElementById('application-form-error'),
        formName = document.getElementById("fullName"),
        formEmail = document.getElementById("email-app");

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!fileErr.classList.contains('hidden')) fileErr.classList.add('hidden');
    formFail.style.display = "none";
    let btn = document.getElementById('submit-app-btn');
    let btnText = btn.value;
    let btnWait = btn.getAttribute("data-wait");
    const formData = new FormData(e.target);
    let formProps = Object.fromEntries(formData);
    delete formProps["resume-field"];
    delete formProps["form-jobID"];
    if(formProps.fullName !== "" && formProps.email !== "") {
      btn.value = btnWait;
      btn.classList.add('loading');
      submitApplication(formProps).then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Error');
      }).then((result) => {
        form.classList.add('hidden');
        formSuccess.style.display = "block";
        document.getElementById('job-app-section').scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
      }).catch((error) => {
        console.log(error);
        btn.value = btnText;
        btn.classList.remove('loading');
        formFail.style.display = "block";
      });
    }
    else {
      btn.value = btnText;
      btn.classList.remove('loading');
      formFail.style.display = "block";
      if(formProps.fullName === "") {
        formName.classList.add('field-input-error');
        formName.nextSibling.classList.remove('hidden');
      }
      if(formProps.email === "") {
        formEmail.classList.add('field-input-error');
        formEmail.nextSibling.classList.remove('hidden');
      }
    }
  });

  function fieldErrored(input) {
    if(input.value === "") {
      input.classList.add('field-input-error');
      input.nextSibling.classList.remove('hidden');
    }
    else {
      input.classList.remove('field-input-error');
      input.nextSibling.classList.add('hidden');
    }
  }

  formName.addEventListener("change", function(event) {
    fieldErrored(this);
  });

  formEmail.addEventListener("change", function(event) {
    fieldErrored(this);
  });

  const resume = document.getElementById("resume-field"),
        fileSizeErr = document.getElementById('file-upload-oversize'),
        fileTypeErr = document.getElementById('file-upload-type'),
        fileErr = document.getElementById('file-upload-fail'),
        fileSuccess = document.getElementById('file-upload-success'),
        fileUploading = document.getElementById('file-upload-working'),
        fileName = document.getElementById('file-upload-filename'),
        fileLabel = document.getElementById('field-label-default'),
        resumeUrl = document.getElementById('resume');

  resume.addEventListener("change", function(event) {
    let files = resume.files;
    console.log("change event");
    if (files.length) {
      let file = files[0];
      if(!fileSizeErr.classList.contains('hidden')) fileSizeErr.classList.add('hidden');
      if(!fileErr.classList.contains('hidden')) fileErr.classList.add('hidden');
      if(!fileTypeErr.classList.contains('hidden')) fileTypeErr.classList.add('hidden');
      if(!fileSuccess.classList.contains('hidden')) fileSuccess.classList.add('hidden');
      if(!fileUploading.classList.contains('hidden')) fileUploading.classList.add('hidden');
      if(fileLabel.classList.contains('hidden')) fileLabel.classList.remove('hidden');
      fileName.innerText = "";

      let filesize = ((file.size/1024)/1024).toFixed(4); // MB
      console.log("File size: " + filesize + " MB");
      console.log("File type: " + file.type);
      if( (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/pdf" || file.type === "application/msword") !== true ) {
        console.log("Incorect file type");
        fileTypeErr.classList.remove('hidden');
        resume.value = null;
        resumeUrl.value = "";
      }
      else if(filesize > 10) {
        console.log("File too big");
        fileSizeErr.classList.remove('hidden');
        resume.value = null;
        resumeUrl.value = "";
      }
      else {
        console.log("All good");
        fileUploading.classList.remove('hidden');
        const formData = new FormData();
        formData.append("file", file);

        let request = {
          method: 'POST',
          body: formData,
          redirect: 'follow'
        };
        fetch(`${baseURL}/uploads`, request).then(response => {
          if(response.ok){
            return response.json();
          }
          throw new Error(response.statusText);
        }).then(response => {
          console.log(response);
          fileUploading.classList.add('hidden');
          if(response.data.hasOwnProperty('uri')) {
            fileSuccess.classList.remove('hidden');
            fileLabel.classList.add('hidden');
            fileName.innerText = response.data.filename;
            resumeUrl.value = response.data.uri;
          }
        }).catch(error => {
          console.log("Upload Error: " + error);
          fileUploading.classList.add('hidden');
          fileErr.classList.remove('hidden');
          resume.value = null;
          resumeUrl.value = "";
        });
      }
    }
  }, false);

  async function submitApplication(formFields) {
    let jobID = document.getElementById('form-jobID').value;
    let personal = [];
    let urls = [];

    for (const key in formFields) {
      if(key === "LinkedIn" || key === "Twitter" || key === "GitHub" || key === "Portfolio" || key === "Other") {
        if(formFields[key] !== "") {
          urls.push({"name": key, "value": formFields[key]});
        }
      }
      else {
        if(formFields[key] !== "") {
          personal.push({"name": key, "value": formFields[key]});
        }
      }
    }
    let data = {
      "personalInformation": personal,
      "source": "Datafold website"
    };
    if(urls.length > 0) {
      data.urls = urls;
    }
    let request = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow'
    };

    const response = await fetch(`${baseURL}/postings/${jobID}/apply`, request);
    return response;
  }

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

})();