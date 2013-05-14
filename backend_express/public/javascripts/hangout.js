
// wait until hangout ready then load everything

if (gapi && gapi.hangout) {

  var initHangout = function(apiInitEvent) {
    if (apiInitEvent.isApiReady) {
      //prepareAppDOM();

      console.log("hangout ready");


      $.getScript("//fixus.jit.su//javascripts/two.min.js", function(a, b, c) {
          
        $.getScript("//fixus.jit.su/socket.io/socket.io.js", function(a, b, c) {
          console.log('socket.io loaded');
          $('body').append('<link rel="stylesheet" type="text/css" href="//fixus.jit.su/stylesheets/barstyle.css"><div class="browser-landing" id="main"><div class="compact marquee"><div id="feedback"></div><div id="info" style="visibility: visible;"><p id="info_start" style="display: inline;"> Click on the microphone icon and begin speaking for as long as you like. </p><p id="info_speak_now" style="display: none;"> Speak now. </p><p id="info_no_speech" style="display: none;"> No speech was detected. You may need to adjust your <a href="http://support.google.com/chrome/bin/answer.py?hl=en&answer=1407892">microphone settings</a>. </p><p id="info_no_microphone" style="display: none;"> No microphone was found. Ensure that a microphone is installed and that <a href="http://support.google.com/chrome/bin/answer.py?hl=en&answer=1407892"> microphone settings</a> are configured correctly. </p><p id="info_allow" style="display: none;"> Click the "Allow" button above to enable your microphone. </p><p id="info_denied" style="display: none;"> Permission to use microphone was denied. </p><p id="info_blocked" style="display: none;"> Permission to use microphone is blocked. To change, go to chrome://settings/contentExceptions#media-stream </p><p id="info_upgrade" style="display: none;"> Web Speech API is not supported by this browser. Upgrade to <a href="http://www.google.com/chrome">Chrome</a> version 25 or later. </p></div><div id="div_start"><button id="start_button" onclick="startButton(event)" style="display: inline-block;"><img alt="Start" id="start_img" src="//fixus.jit.su/img/mic.gif"></button></div><div id="results"><span class="final" id="final_span"></span><span class="interim" id="interim_span"></span></div><textarea id="manualInput" rows="1">i me you we happy sad and angry</textarea><button onclick="manualInputSubmit()" ontap="manualInputSubmit()">Submit</button></div></div></div>');
          
          start();

          $.getScript("//fixus.jit.su//javascripts/speech.js", function(a, b, c) {
            console.log('speech.js loaded');
          });
        });
      });

      gapi.hangout.data.onStateChanged.add(function(stateChangeEvent) {
      });
      gapi.hangout.onParticipantsChanged.add(function(partChangeEvent) {
      });

      gapi.hangout.onApiReady.remove(initHangout);
    }
  };

  gapi.hangout.onApiReady.add(initHangout);
}


var socket;

function start() {

  socket = io.connect('http://fixus.jit.su:80');
  console.log(socket);
  var userGuid = guid();
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('set nickname', { name: userGuid });
  });

  var categories = [
    "posemo",
    "negemo",
    "anger", 
    "complexity", 
    "status",
    "depression",
    "formality",
    "honesty"
  ];

  var lessCommand = [
    "Dial down the sunshine!",
    "Look on the bright side!",
    "Calm down, don't be such a dick!", 
    "Can't you say it clearly?",
    "Speak for yourself!",
    "Pull yourself out of it already!",
    "You elitist asshole.",
    "Nobody wants to read your diary!"
  ];

  var moreCommand = [
    "Look on the bright side!",
    "Dial down the sunshine!",
    "Grow a pair.", 
    "Thank you captain obvious.", 
    "It's not all about you all the time!",
    "You can't really be that happy.",
    "Who do you think you're talking to? Ever heard of manners?",
    "Be more honest! Fucking lying piece of shit!"
  ];

  var baseScore = 1;
  var scalePower = 2, minHeightScale = 1, maxHeightScale = 50;

  var scoresa = new Array(categories.length);
  var scoresb = new Array(categories.length);

  for (var i=0; i<categories.length; i++) {
    scoresa[i] = 0;
    scoresb[i] = 0;
  }


  // setup
  var height = $('#feedback').height();
  for(var i = 0; i < categories.length; i++) {
    var category = categories[i];
    $('#feedback').append("<div class='category'><div class='score mine' id='my"+category+"'>"+category+"</div><div class='score yours' id='your"+category+"'></div></div>");
    $('.score').css('height', height / categories.length);
  }

  
  function draw() {
    var totalScale = 0;
    var maxScale = 0;
    var maxScaleIndex = 0;
    var balances = new Array(categories.length);
    var scales = new Array(categories.length);
    for(var i = 0; i < categories.length; i++) {
      var totalScore = scoresa[i] + scoresb[i];
      if(totalScore > 0) {
        balances[i] = scoresa[i] / totalScore;
      } else {
        balances[i] = .5;
      }
      scales[i] = Math.pow(2 * Math.abs(balances[i] - .5), scalePower);
      scales[i] = map(scales[i], 0, 1, minHeightScale, maxHeightScale);
      totalScale += scales[i];
      if(scales[i] > maxScale) {
        maxScale = scales[i];
        maxScaleIndex = i;
      }
    }

    var width = $('#feedback').width();
    var height = $('#feedback').height();
    for(var i = 0; i < categories.length; i++) {
      var curHeight = height * (scales[i] / totalScale);
      var widtha = balances[i] * width;
      var widthb = width - widtha;
      var category = categories[i];
      $('#my'+category).width(widtha);
      $('#my'+category).height(curHeight);
      $('#your'+category).width(widthb);
      $('#your'+category).height(curHeight);
      
      if(i == maxScaleIndex) {
        $('#command').text(getCommand(i, balances[i]));
        gapi.hangout.layout.displayNotice(getCommand(i, balances[i]), false);
      }
    }

  }


  draw();

  function getCommand(category, balance) {
    return (balance < .5 ? lessCommand : moreCommand)[category];
  }

  socket.on('stats', function (data) {
    var flip = userGuid != data.users[0];
    var usera = flip ? 1 : 0;
    var userb = flip ? 0 : 1;
    console.log(data);
    //console.log("usera:"+usera+" userb:"+userb+" flip:"+flip+" userGuid:"+userGuid+" data.users[0]:"+data.users[0]);
    for(var i = 0; i < categories.length; i++) {
      scoresa[i] = (data.users[usera]) ? baseScore + data[categories[i]][usera] : baseScore;
      scoresb[i] = (data.users[userb]) ? baseScore + data[categories[i]][userb] : baseScore;
    }

    //gapi.hangout.layout.displayNotice(flip, true);

    console.log(scoresa);
    console.log(scoresb);


    draw();
  });

}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}


function map(x, inmin, inmax, outmin, outmax) {
  return ((x-inmin) / (inmax-inmin)) * (outmax-outmin) + outmin;
}

function manualInputSubmit() {
    console.log(socket);
  socket.emit('event', {
    transcript: document.getElementById('manualInput').value,
    confidence: 1});

}
