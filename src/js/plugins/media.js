import { mdiPlayCircleOutline } from "@mdi/js";
import commander from "../commander";

function forAllVideos(perVideoCommand) {
  return (
    "const videos = document.getElementsByTagName('video');\nfor (let video of videos" +
    ") { " +
    perVideoCommand +
    " }\n"
  );
}

function forAllAudios(perAudioCommand) {
  return (
    "const audios = document.getElementsByTagName('audio');\nfor (let audio of audios" +
    ") { " +
    perAudioCommand +
    " }\n"
  );
}

const plugins = [
  {
    name: "Media player",
    icon: mdiPlayCircleOutline,
    queries: [
      "pause | stop | play | resume",
      "volume up | volume down",
      "skip 10 seconds | skip 1 minute",
      "back 10 seconds | back 1 minute",
      "go back to the beginning",
      "go to the end"
    ],
    commands: [
      {
        commands: ["pause", "stop"],
        callback: query => {
          commander.executeScripts(
            forAllVideos("video.pause();") + forAllAudios("audio.pause();")
          );
        }
      },

      {
        commands: ["play", "resume"],
        callback: query => {
          commander.executeScripts(
            forAllVideos("video.play();") + forAllAudios("audio.play();")
          );
        }
      },

      {
        commands: ["increase volume", "volume up"],
        callback: query => {
          commander.executeScripts(
            forAllVideos("video.volume = Math.min(1, video.volume + .2);") +
              forAllAudios("audio.volume = Math.min(1, audio.volume + .2);")
          );
        }
      },

      {
        commands: ["decrease volume", "volume down"],
        callback: query => {
          commander.executeScripts(
            forAllVideos("video.volume = Math.max(0, video.volume - .2);") +
              forAllAudios("audio.volume = Math.max(0, audio.volume - .2);")
          );
        }
      },

      {
        commands: ["(make it) loud"],
        callback: query => {
          commander.executeScripts(
            forAllVideos("video.volume = .8;") +
              forAllAudios("audio.volume = .8;")
          );
        }
      },

      {
        commands: ["(make it) very loud"],
        callback: query => {
          commander.executeScripts(
            forAllVideos("video.volume = 1;") +
              forAllAudios("audio.volume = 1;")
          );
        }
      },

      {
        commands: ["(make it) quiet"],
        callback: query => {
          commander.executeScripts(
            forAllVideos("video.volume = .2;") +
              forAllAudios("audio.volume = .2;")
          );
        }
      },

      {
        commands: ["skip *query seconds", "(go) forward *query seconds"],
        callback: query => {
          let seconds = parseFloat(query);
          if (!(seconds > 0)) {
            seconds = 10;
          }
          commander.executeScripts(
            forAllVideos("video.currentTime += " + seconds + ";") +
              forAllAudios("audio.currentTime += " + seconds + ";")
          );
        }
      },

      {
        commands: ["(go) back *query seconds"],
        callback: query => {
          let seconds = parseFloat(query);
          if (!(seconds > 0)) {
            seconds = 10;
          }
          commander.executeScripts(
            forAllVideos("video.currentTime -= " + seconds + ";") +
              forAllAudios("audio.currentTime -= " + seconds + ";")
          );
        }
      },

      {
        commands: ["skip *query minutes", "(go) forward *query minutes"],
        callback: query => {
          let minutes = parseFloat(query);
          if (!(minutes > 0)) {
            minutes = 1;
          }
          let seconds = minutes * 60;
          commander.executeScripts(
            forAllVideos("video.currentTime += " + seconds + ";") +
              forAllAudios("audio.currentTime += " + seconds + ";")
          );
        }
      },

      {
        commands: ["(go) back *query minutes"],
        callback: query => {
          let minutes = parseFloat(query);
          if (!(minutes > 0)) {
            minutes = 1;
          }
          let seconds = minutes * 60;
          commander.executeScripts(
            forAllVideos("video.currentTime -= " + seconds + ";") +
              forAllAudios("audio.currentTime -= " + seconds + ";")
          );
        }
      },

      {
        commands: [
          "skip 1 minute",
          "(go) forward 1 minute",
          "skip one minute",
          "(go) forward one minute",
          "skip a minute",
          "(go) forward a minute"
        ],
        callback: query => {
          let seconds = 60;
          commander.executeScripts(
            forAllVideos("video.currentTime += " + seconds + ";") +
              forAllAudios("audio.currentTime += " + seconds + ";")
          );
        }
      },

      {
        commands: [
          "(go) back 1 minute",
          "(go) back one minute",
          "(go) back a minute"
        ],
        callback: query => {
          let seconds = 60;
          commander.executeScripts(
            forAllVideos("video.currentTime -= " + seconds + ";") +
              forAllAudios("audio.currentTime -= " + seconds + ";")
          );
        }
      },

      {
        commands: ["(go) back to (the) beginning"],
        callback: query => {
          commander.executeScripts(
            forAllVideos("video.currentTime = 0;") +
              forAllAudios("audio.currentTime = 0;")
          );
        }
      },

      {
        commands: ["(go) to (the) end"],
        callback: query => {
          commander.executeScripts(
            forAllVideos("video.currentTime = video.duration;") +
              forAllAudios("audio.currentTime = audio.duration;")
          );
        }
      }
    ]
  }
];

export default plugins;
