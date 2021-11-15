
マップ遷移の流れ
----------
1. Interpreter のマップ遷移イベントで $gamePlayer.reserveTransfer() が実行される
2. Scene_Map.updateTransferPlayer() で $gamePlayer.isTransferring() を監視 → 即 SceneManager.goto(Scene_Map)
3. Scene_Map.stop() で現在シーンからフェードアウト開始 fadeOutForTransfer
4. フェードアウトが完了するまでは SceneManager が Scene の isCurrentSceneBusy() をチェックし、実際には遷移しない。
5. 新しいマップ (新しい Scene_Map) へ遷移し、マップデータのロードが終わったら Game_Player.performTransfer() が実行される。
