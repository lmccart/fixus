

var final_transcript = '';
var recognizing = false;
var start_timestamp;
var recognition;
var selfSpeaking = false;

function startSpeech() {

  if (!('webkitSpeechRecognition' in window)) {
    upgrade();
  } else {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    setInterval(checkSpeaker, 100);
    setInterval(function(){updateSpeechTime(250);}, 250);

    recognition.onstart = function() {
      recognizing = true;
    };

    recognition.onerror = function(event) {
      if (event.error == 'no-speech') {
        console.log("no speech RESTART");
        startButton();
      }
      if (event.error == 'audio-capture') {
        console.log('info_no_microphone');
      }
      if (event.error == 'not-allowed') {
        if (event.timeStamp - start_timestamp < 100) {
          console.log('info_blocked');
        } else {
          console.log('info_denied');
        }
      }
    };

    recognition.onend = function() {
      recognizing = false;

      // retrigger
      console.log("RESTART");
      startButton();
    };

    recognition.onresult = function(event) {
      // check it's your own audio
      if (selfSpeaking) {
        var interim_transcript = '';
        if (typeof(event.results) == 'undefined') {
          recognition.onend = null;
          recognition.stop();
          upgrade();
          return;
        }
        //console.log(event);
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
            final_transcript += "(" + event.results[i][0].confidence + ")";

            console.log("event: "+event.results[i][0].transcript+" ("+event.results[i][0].confidence+")");
            parser.parseLine(event.results[i][0].transcript);

          } else {
            interim_transcript += "|";
            for (var j = 0; j < event.results[i].length; ++j) {
              interim_transcript += event.results[i][j].transcript;
              interim_transcript += "(" + event.results[i][j].confidence + ")";
              interim_transcript += " | ";
            }
          }
        }
        final_transcript = final_transcript;
        //final_span.innerHTML = linebreak(final_transcript);
        //interim_span.innerHTML = linebreak(interim_transcript);
      } else console.log("other person speaking");
    };
  }

  // trigger start button
  startButton();
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}


function startButton(event) {
  console.log("start "+recognizing);
  if (!recognizing) {
    final_transcript = '';
    recognition.lang = 'en-US';
    recognition.start();
    ignore_onend = false;
    // final_span.innerHTML = '';
    // interim_span.innerHTML = '';
    start_timestamp = event ? event.timeStamp : new Date().getTime();
  }
}


function checkSpeaker() {
  var volumes = gapi.hangout.av.getVolumes();
  var localVol = localID ? volumes[localID] : 0;
  var otherVol = otherID ? volumes[otherID] : 0;
  //console.log(volumes);
  var prevSpeaking = selfSpeaking;
  selfSpeaking = localVol >= otherVol;
  if (prevSpeaking != selfSpeaking) console.log("selfSpeaking switched to "+selfSpeaking);
}

function updateSpeechTime(itvl) {

  var numSamples = 1000/itvl;

  // get volumes
  var volumes = gapi.hangout.av.getVolumes();

  var localTime = 0, otherTime = 0;
  
  for (var i=0; i<2; i++) {

    var id = (i==0) ? localID : otherID;
     
    var vol = id ? volumes[id] : 0;
    var volAvg = id ? parseFloat(gapi.hangout.data.getValue(id+"-volAvg")) : 0;

    // update volume avg
    if (!i) {
      volAvg = (vol + (numSamples-1)*volAvg)/numSamples;
      gapi.hangout.data.setValue(id+"-volAvg", String(volAvg));
    }

    // update talk time
    var st = id ? parseInt(gapi.hangout.data.getValue(id+"-st"), 10) : 0;
    if (!i && (vol > 0 || volAvg > 1.0)) {
      st += itvl;
      gapi.hangout.data.setValue(id+"-st", String(st));
      localTime = st;
    }
    else if (i) {
      otherTime = st;
    }

    st = new Date(st);
    st = st.toLocaleTimeString();
    st = st.substring(st.indexOf(':')+1, st.indexOf(' '));

    $('#talkTime'+i).text(st);
  }

  // check for speaking time imbalance
  var now = new Date().getTime();
  if(now - lastNotificationTime > notificationInterval) {

    if (localTime / (localTime + otherTime) > 0.75 && !gapi.hangout.av.getMicrophoneMute() && localTime > 30*1000) {
      gapi.hangout.layout.displayNotice("You've been auto-muted because you're talking too much.", false);
      gapi.hangout.av.setMicrophoneMute(true);
      lastNotificationTime = now;
    } 
  } 
}


