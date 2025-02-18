const WebSocket = require('ws');
const { spawn } = require('child_process');


const wss = new WebSocket.Server({ port: 8181 });
const wssResult = new WebSocket.Server({ port: 8288 });

const clientWebsockets = [];
var count = 0;

function createFFmpegStream(streamId) {
  const rtspUrl = `rtsp://localhost:8554/stream${streamId}`;

  const ffmpeg = spawn('ffmpeg', [
    '-i', '-', // 標準入力から読み取る
    '-r', '3',
    // '-c:v', 'libx264', // ビデオコーデック
    // '-c:a', 'aac',
    // '-preset', 'veryfast', // エンコードプリセット
    '-b:v', '2M',
    '-b:a', '128k',
    '-bufsize', '3M',
    '-c', 'copy',
    '-f', 'rtsp', // RTSP形式
    rtspUrl // RTSPサーバのURL
  ]);

  ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`FFmpegプロセスが終了しました: code ${code}`);
  });

  return ffmpeg;
}

wss.on('connection', function connection(ws) {
  if (!clientWebsockets.includes(ws)) {
    count += 1;
    clientWebsockets.push(ws);
  }

  let streamId = null;
  let ffmpeg = null;

  ws.on('message', function (message, isBinary) {
    // // WebSocketからのデータをFFmpegにパイプ
    if (isBinary) {
      if (ffmpeg && ffmpeg.stdin.writable) {
        ffmpeg.stdin.write(message);
      }
    }
    else {
      const parsedMessage = JSON.parse(message);
      console.log("received: ", parsedMessage.robotId);
      if (!streamId) {
        streamId = parsedMessage.robotId;
        ffmpeg = createFFmpegStream(streamId);
      }
    }
  });

  ws.on('close', function () {
    // WebSocketが閉じられた場合、FFmpegプロセスを終了
    if (ffmpeg) {
      ffmpeg.stdin.end();
    }
  });
});

wssResult.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    getData = JSON.parse(data);

    const robotId = getData["robotId"];
    const socket = clientWebsockets.slice(-1)[0];
    const result = getData["predicted"];
    const reason = getData["reason"];
    const score = getData["score"];

    socket.send(JSON.stringify({"robotId": robotId, "result": result, "score": score, "reason": reason}));
  });
});