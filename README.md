## 概要

サイバーエージェントの複数人同時対話システム (webrobot-controller) から，ロボットの映像を取得し，推論用スクリプトに送る＆推論用スクリプトから送られてきた推論結果をオペレータ用インタフェースに送信するためのスクリプトです．<br>
[推論用のスクリプト](https://github.com/m0chi1216/anomaly_detection)と同じマシン上で動作させてください．

## 準備
- mediamtxのインストール
  - 動作環境に応じてインストールしてください
- Node.jsおよびnpmをインストール
- wsモジュールのインストール
```
npm install ws
```
- Skywayキーの設定
  - webrobot-controllerで使用しているキーを，`index.html`内の変数`skywayKey`に設定してください
## 手順
1. mediamtxによるRTSPサーバの起動
```
cd mediamtxのディレクトリ
./mediamtx
``` 
2. HTTPサーバの起動
```
node http.js
```
3. 映像をRTSPサーバに転送するためのスクリプトの実行
```
node rtsp.js
```
4. ブラウザで`http://localhost:8080`にアクセスする．デベロッパーツールを開き，コンソールに「PEER OPEN」と表示されたら「Connect」ボタンをクリックし，ロボットの映像が表示されることを確認する
5. [こちら](https://github.com/m0chi1216/anomaly_detection)のリポジトリを使用して推論用のスクリプトを実行し，コンソールに推論結果が連続的に表示されたらOK