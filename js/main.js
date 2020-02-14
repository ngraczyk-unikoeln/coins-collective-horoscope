var menu = [{
    ID: 0,
    NAME: 'Home',
    URL: 'home',
    ACTIVE: true,
    DB_NAME: ''
  }, {
    ID: 1,
    NAME: 'Nerd',
    URL: 'nerd',
    ACTIVE: false,
    DB_NAME: 'AR_nerd'
    //DB_NAME: 'nilsql'
  }, {
    ID: 2,
    NAME: 'Treehugger',
    URL: 'treehugger',
    ACTIVE: false,
    DB_NAME: 'AR_treehugger'
  }, {
    ID: 3,
    NAME: 'Spiritualist',
    URL: 'spiritualist',
    ACTIVE: false,
    DB_NAME: 'AR_spiritualism'
  }, {
    ID: 4,
    NAME: 'Fatherlander',
    URL: 'fatherlander',
    ACTIVE: false,
    DB_NAME: 'AR_fatherlander'
  }
  /*, {
    ID: 4,
    NAME: 'Vegan',
    URL: 'vegan',
    ACTIVE: false
  }, {
    ID: 5,
    NAME: 'Fitness',
    URL: 'fitness',
    ACTIVE: false
  }, {
    ID: 6,
    NAME: 'Yolo',
    URL: 'yolo',
    ACTIVE: false
  }*/
];

var predictions = [];
var activeDate = null;
var activePage = null;
var dayDifference = 0;
var predictFuture = 1;
var activeDB = '';
var allDataJSON = [];
var lastPrediction = null;

init();

function init() {

  var savedMenu = localStorage.getItem('savedMenu');
  if (savedMenu) {
    menu = JSON.parse(savedMenu);
  }
  createMenu();

  bindEvents();
}

function bindEvents() {
  $('.cardCollective').on('click', changeMenu);

  $('#tribeMenu').on('click', 'a', function() {

    dayDifference = 0;
    predictFuture = 1;
    lastPrediction = null;
    setDate(moment().add(1, 'day').format('YYYY-MM-DD'));

    $('.badge').removeClass('badge-light');
    var link = this.href;
    $(this).find('.badge').addClass('badge-light');
    activePage = this.href.split('#/')[1];

    activeDB = menu.find(a => a.URL == activePage);
    //console.log(activeDB);
    activeDB = activeDB.DB_NAME;

    if (activeDB == '') {
      showPage('home');
      return false;
    }

    fetchDataForPrediction(activePage);
    fetchLastData(activePage);

    document.getElementById('predictionDIV').style.display = 'none';
    showPage('predictionDIV');

  });

  $('.changeDay').on('click', function() {
    if (this.classList.contains('fa-chevron-right')) {
      setDate(moment(activeDate).add(1, 'day').format('YYYY-MM-DD'));
      dayDifference++;
      predictFuture = 1;
      fetchDataForPrediction(activePage);
    } else {
      dayDifference--;
      predictFuture = 0;
      setDate(moment(activeDate).subtract(1, 'day').format('YYYY-MM-DD'));
      fetchDataForPrediction(activePage);
    }
  })

  /*window.addEventListener("hashchange", function() {
    showPage(window.location.hash.replace('#/', ''));
  }, false);*/
}

function setDate(date) {

  activeDate = date;

  $('.day').html(moment(activeDate).format('DD'));
  $('.month').html(moment(activeDate).format('MMM'));
}

function changeMenu() {
  var isToggeled = this.classList.toggle('active');
  var item = menu.find(a => a.ID == this.dataset.collectiveid);
  item.ACTIVE = isToggeled;
  createMenu();
  localStorage.setItem('savedMenu', JSON.stringify(menu));
}

function createMenu() {
  var html = '';

  for (var idx in menu) {
    if (!menu[idx].ACTIVE) continue;

    html += `<a href="#/${menu[idx].URL}"><span class="badge badge-transparent">${menu[idx].NAME}</span></a>`;
    if (menu[idx].ID == 0) continue;

    var item = document.querySelector(`[data-collectiveid="${menu[idx].ID}"]`);
    if (item) {
      item.classList.toggle('active', true);
    }
  }

  document.getElementById('tribeMenu').innerHTML = html;
}

function showPage(selector) {
  $('.pagetoggle').hide();
  $('#' + selector).show();
}

// make the app progressive and installable
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js')
    .then(function() {
      console.log('serviceWorker registered');
    })
    .catch(function(err) {
      console.log(err);
    })
}

//eigenen hinweis zum installieren geben
/*window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  //event.preventDefault();
  //deferredPrompt = event;
  //return false;
});*/

/*
if (!worker) {
  worker = new Worker('js/worker.js');
}
worker.postMessage(seq);
worker.onmessage = function (event) {
  console.log('prediction: ' + event.data);
  self.negativityScore(event.data);
  self.sentiment(convertToSentiment(event.data));
};*/

function convertToSentiment(param) {

  if (lastPrediction) {
    if (lastPrediction > param) {
      //console.log(`last: ${lastPrediction} > ${param} :now`);
      lastPrediction = param;
      return '🙁↘️';
    } else if (lastPrediction < param) {
      //console.log(`last: ${lastPrediction} < ${param} :now`);
      lastPrediction = param;
      return '🙂↗️';
    } else {
      //console.log(`last: ${lastPrediction} = ${param} :now`);
      lastPrediction = param;
      return '🤷‍♀️';
    }
  } else {
    lastPrediction = param;
  }
  param = param.toString().slice(-3);
  param = parseInt(param) / 100;
  //console.log(param);
  if (param > 7) return '😍';
  if (param > 6) return '😀';
  if (param > 5) return '🙂';
  if (param > 4) return '😐';
  if (param > 2) return '🙁';
  if (param > 1) return '😦';


  return '😱';
}

function fetchDataForPrediction(tribe) {

  if (predictions[tribe]) {
    calcPrediction(predictions[tribe]);
  } else {

    fetch(`api.php?q=group_learn&t=${tribe}&db=${activeDB}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }

        return response.json();
      })
      .then(json => {

        allDataJSON = json;

        predictions[tribe] = [];

        predictions[tribe].push(parseFloat(json[json.length - 3].average_sentiment));
        predictions[tribe].push(parseFloat(json[json.length - 2].average_sentiment));
        predictions[tribe].push(parseFloat(json[json.length - 1].average_sentiment));

        calcPrediction(predictions[tribe]);

      })
      .catch(function() {
        this.dataError = true;
      });

  }
}

function calcPrediction(predictionArr) {
  //console.log(dayDifference, predictionArr[dayDifference], predictionArr[dayDifference + 1], predictionArr[dayDifference + 2]);
  var prediction = 0;

  if (dayDifference > -1) {
    prediction = doPrediction(
      parseFloat(predictionArr[dayDifference]),
      parseFloat(predictionArr[dayDifference + 1]),
      parseFloat(predictionArr[dayDifference + 2])
    );
  } else {
    var idx = allDataJSON.length + dayDifference;
    //console.log('no predictions', idx);
    prediction = allDataJSON[idx];
    if (prediction) {
      prediction = prediction.average_sentiment;
    }
    //console.log(prediction);
  }
  //console.log(predictionArr.length, dayDifference + 3);
  if (dayDifference > -1 && predictFuture === 1 && predictionArr.length == dayDifference + 3) {
    predictionArr.push(prediction);
  }

  document.getElementById('result').innerHTML = `
  <div class="prediction animated lightSpeedIn">

    <span class="sentiment">${convertToSentiment(prediction)}</span>

    <p>${prediction}</p>

    <p>Sterne schauen ist nicht schwer - Sterne deuten hingegen sehr!</p>

  </div>`;
}

function fetchLastData(tribe) {
  fetch(`api.php?q=last&a=100&t=${tribe}&db=${activeDB}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      return response.json();
    })
    .then(json => {

      keywordCalc(json);
    })
    .catch(function() {
      this.dataError = true;
    });
}

function keywordCalc(data) {
  var keywords = [];

  for (var idx in data) {
    if (!data[idx]['keywords[content]'] || data[idx]['keywords[content]'] == '') continue;
    //console.log('hi', data[idx]['keywords[content]']);
    //var temp = data[idx]['keywords[content]'].replace(/=1/g, '');
    var temp = data[idx]['keywords[content]'].replace('{', '');
    temp = temp.replace('}', '');
    temp = temp.split(', ');

    for (var idx2 in temp) {
      var keys = temp[idx2].split('=');
      var search = keywords.find(a => a.keyword == keys[0]);

      if (!search) {
        search = {
          keyword: keys[0],
          amount: 0,
          max: 1
        };
        keywords.push(search)
      }
      if (keys[1] != '1') {
        search.max = keys[1];
      }
      search.amount = search.amount + parseInt(keys[1]);
    }
  }

  keywords = keywords.sort(function(a, b) {

    if (a.amount > b.amount) {
      return -1;
    }
    if (b.amount > a.amount) {
      return 1;
    }
    return 0;
  });

  showKeywords(keywords);
}

function showKeywords(data) {
  var html = '';
  var words = [];

  var i = 0;
  for (var idx in data) {
    if (data[idx].keyword == '') continue;

    words.push({
      text: data[idx].keyword,
      weight: data[idx].amount
    });

    if (i > 4) continue;
    i++;

    html += `
    <li class="list-group-item">
      <span class="pull-right">${data[idx].amount} (max: ${data[idx].max})</span><span class="pull-left">${i}.</span> ${data[idx].keyword}
    </li>`;
  }


  document.getElementById('keywordList').innerHTML = html;

  $('#wordCloud').jQCloud('destroy');
  $('#wordCloud').jQCloud(words, {
    width: $('#nerd').width() - 20,
    height: 400
  });

}

function getTrainingData() {
  fetch('api.php?q=group_learn')
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      return response.json();
    })
    .then(json => {

      var trainingArr = [];

      for (var idx in json) {
        trainingArr.push(json[idx].average_sentiment);
      }

      console.log(JSON.stringify(trainingArr));

    })
    .catch(function() {
      this.dataError = true;
    });
}
