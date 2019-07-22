registerPlugin({
  name: 'Media player',
  icon: 'play_circle_outline',
  queries: [
    'pause | stop | play | resume',
    'volume up | volume down',
    'skip 10 seconds | skip 1 minute',
    'back 10 seconds | back 1 minute',
    'go back to the beginning',
    'go to the end',
  ],
  addCommandHandler: (commander) => {
    const forAllVideos = (perVideoCommand) => {
      return "const videos = document.getElementsByTagName('video');\nfor (let video of videos" +
        ") { " + perVideoCommand + " }\n";
    };

    const forAllAudios = (perAudioCommand) => {
      return "const audios = document.getElementsByTagName('audio');\nfor (let audio of audios" +
        ") { " + perAudioCommand + " }\n";
    };

    commander.addCommands([
      'pause', 'stop'
    ], (query) => {
      commander.executeScripts(forAllVideos("video.pause();") + forAllAudios("audio.pause();"));
    });

    commander.addCommands([
      'play', 'resume'
    ], (query) => {
      commander.executeScripts(forAllVideos("video.play();") + forAllAudios("audio.play();"));
    });

    commander.addCommands([
      'increase volume', 'volume up'
    ], (query) => {
      commander.executeScripts(forAllVideos("video.volume = Math.min(1, video.volume + .2);") + forAllAudios("audio.volume = Math.min(1, audio.volume + .2);"))
    });

    commander.addCommands([
      'decrease volume', 'volume down'
    ], (query) => {
      commander.executeScripts(forAllVideos("video.volume = Math.max(0, video.volume - .2);") + forAllAudios("audio.volume = Math.max(0, audio.volume - .2);"));
    });

    commander.addCommands(['(make it) loud'], (query) => {
      commander.executeScripts(forAllVideos("video.volume = .8;") + forAllAudios("audio.volume = .8;"));
    });

    commander.addCommands(['(make it) very loud'], (query) => {
      commander.executeScripts(forAllVideos("video.volume = 1;") + forAllAudios("audio.volume = 1;"));
    });

    commander.addCommands(['(make it) quiet'], (query) => {
      commander.executeScripts(forAllVideos("video.volume = .2;") + forAllAudios("audio.volume = .2;"));
    });

    commander.addCommands([
      'skip *query seconds', '(go) forward *query seconds'
    ], (query) => {
      let seconds = parseFloat(query);
      if (!(seconds > 0)) {
        seconds = 10;
      }
      commander.executeScripts(forAllVideos("video.currentTime += " + seconds + ";") + forAllAudios("audio.currentTime += " + seconds + ";"));
    });

    commander.addCommands(['(go) back *query seconds'], (query) => {
      let seconds = parseFloat(query);
      if (!(seconds > 0)) {
        seconds = 10;
      }
      commander.executeScripts(forAllVideos("video.currentTime -= " + seconds + ";") + forAllAudios("audio.currentTime -= " + seconds + ";"));
    });

    commander.addCommands([
      'skip *query minutes', '(go) forward *query minutes'
    ], (query) => {
      let minutes = parseFloat(query);
      if (!(minutes > 0)) {
        minutes = 1;
      }
      let seconds = minutes * 60;
      commander.executeScripts(forAllVideos("video.currentTime += " + seconds + ";") + forAllAudios("audio.currentTime += " + seconds + ";"));
    });

    commander.addCommands(['(go) back *query minutes'], (query) => {
      let minutes = parseFloat(query);
      if (!(minutes > 0)) {
        minutes = 1;
      }
      let seconds = minutes * 60;
      commander.executeScripts(forAllVideos("video.currentTime -= " + seconds + ";") + forAllAudios("audio.currentTime -= " + seconds + ";"));
    });

    commander.addCommands([
      'skip 1 minute',
      '(go) forward 1 minute',
      'skip one minute',
      '(go) forward one minute',
      'skip a minute',
      '(go) forward a minute'
    ], (query) => {
      let seconds = 60;
      commander.executeScripts(forAllVideos("video.currentTime += " + seconds + ";") + forAllAudios("audio.currentTime += " + seconds + ";"));
    });

    commander.addCommands([
      '(go) back 1 minute', '(go) back one minute', '(go) back a minute'
    ], (query) => {
      let seconds = 60;
      commander.executeScripts(forAllVideos("video.currentTime -= " + seconds + ";") + forAllAudios("audio.currentTime -= " + seconds + ";"));
    });

    commander.addCommands(['(go) back to (the) beginning'], (query) => {
      commander.executeScripts(forAllVideos("video.currentTime = 0;") + forAllAudios("audio.currentTime = 0;"));
    });

    commander.addCommands(['(go) to (the) end'], (query) => {
      commander.executeScripts(forAllVideos("video.currentTime = video.duration;") + forAllAudios("audio.currentTime = audio.duration;"));
    });
  }
});
