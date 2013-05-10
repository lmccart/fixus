

(function() {
  if (gapi && gapi.hangout) {

    var initHangout = function(apiInitEvent) {
      if (apiInitEvent.isApiReady) {
        //prepareAppDOM();

        console.log("hangout ready");


        $.getScript("//fixus.jit.su/socket.io/socket.io.js", function(a, b, c) {
          console.log('loaded');
          $('body').append('<div class="browser-landing" id="main"><div class="compact marquee"><div id="info" style="visibility: visible;"><p id="info_start" style="display: inline;"> Click on the microphone icon and begin speaking for as long as you like. </p><p id="info_speak_now" style="display: none;"> Speak now. </p><p id="info_no_speech" style="display: none;"> No speech was detected. You may need to adjust your <a href="http://support.google.com/chrome/bin/answer.py?hl=en&answer=1407892">microphone settings</a>. </p><p id="info_no_microphone" style="display: none;"> No microphone was found. Ensure that a microphone is installed and that <a href="http://support.google.com/chrome/bin/answer.py?hl=en&answer=1407892"> microphone settings</a> are configured correctly. </p><p id="info_allow" style="display: none;"> Click the "Allow" button above to enable your microphone. </p><p id="info_denied" style="display: none;"> Permission to use microphone was denied. </p><p id="info_blocked" style="display: none;"> Permission to use microphone is blocked. To change, go to chrome://settings/contentExceptions#media-stream </p><p id="info_upgrade" style="display: none;"> Web Speech API is not supported by this browser. Upgrade to <a href="http://www.google.com/chrome">Chrome</a> version 25 or later. </p></div><div id="div_start"><button id="start_button" onclick="startButton(event)" style="display: inline-block;"><img alt="Start" id="start_img" src="//fixus.jit.su/img/mic.gif"></button></div><div id="results"><span class="final" id="final_span"></span><span class="interim" id="interim_span"></span></div><textarea id="manualInput" rows="1">i me you we happy sad and angry</textarea><button onclick="manualInputSubmit()" ontap="manualInputSubmit()">Submit</button></div></div><canvas id="PinTumbler" data-processing-sources="//fixus.jit.su/PinTumbler.pde" width="1280" height="720"></canvas>');

          $.getScript("//fixus.jit.su//javascripts/fixus.js");
          $.getScript("//fixus.jit.su//javascripts/speech.js", function(a, b, c) {
            console.log('hi');
          });
          $.getScript("//fixus.jit.su//javascripts/processing.min.js", function(a, b, c) {
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
})();