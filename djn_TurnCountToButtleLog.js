/*:ja
 * @target MZ
 * @plugindesc 現在の経過ターン数をバトルログに出力するプラグイン
 * @author 大臣
 * @url https://github.com/daijin/rpgmz-plugins
 *
 * @param fontColor
 * @text ログ文字色
 * @desc 挿入するログの文字色の番号。初期値は1。
 * @type color
 * @default 1
 * 
 * @param logPrefix
 * @text ログの前に入れる文字列
 * @desc 挿入するログの前に入れる文字列。初期値は「【」
 * @type text
 * @default 【
 * 
 * @param logSufix
 * @text ログの後ろに入れる文字列
 * @desc 挿入するログの後ろに入れる文字列。初期値は「】」
 * @type text
 * @default 】
 * 
 * @help
 * バトルログに経過ターン数を挿入するプラグインです。
 * バトルログを常時表示したりログを見返すときにセパレータとして使えます。
 * ログへ出力されるタイミングはターン開始時です。
 * TPBは未サポートです。
 * 
 * 特にプラグインコマンドはありません。
 *
 * 本プラグインのライセンスについて(License):
 *  - 本プラグインはMITライセンスのもとで公開しています。
 *  - This plugin is released under the MIT License.
 */
(() => {
  /////////////////////////////////////////////////////////////////////////////
  // コンフィグ値
  const pluginName = 'djn_TurnCountToButtleLog';
  const configs = PluginManager.parameters(pluginName);

  const configFontColor = Number(configs['fontColor'] || 1);
  const configLogPrefix = String(configs['logPrefix'] || '');
  const configLogsufix = String(configs['logSufix'] || '');

  /////////////////////////////////////////////////////////////////////////////
  const _startTurn = BattleManager.startTurn;

  BattleManager.startTurn = function() {
    _startTurn.call(this);
    const turn = $gameTroop._turnCount;

    BattleManager._logWindow.addText(
      "\\c[" + configFontColor + "]" + configLogPrefix + "ターン " + turn + configLogsufix + "\\c[0]");
  };
})();
