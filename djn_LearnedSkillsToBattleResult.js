/*:
 * @target MZ
 * @plugindesc 戦闘終了後に新たに習得したスキルをバトルリザルト画面で表示します。
 * @author 大臣
 * @url https://github.com/daijin/rpgmz-plugins
 * 
 * @help
 * このプラグインは、戦闘終了後に新たに習得したスキルを
 * バトルリザルト画面に表示する機能を追加します。
 * 
 * 戦闘開始時に既に習得しているスキルを記録し、
 * 戦闘後に新たに習得したスキルのみを表示します。
 */

(() => {

  // 戦闘開始時に既習得スキルを記録
  var _Scene_Battle_start = Scene_Battle.prototype.start;
  Scene_Battle.prototype.start = function() {
    $gameParty.members().forEach(function(actor) {
      actor._previousSkills = actor.skills().map(skill => skill.id);
    });
    _Scene_Battle_start.call(this);
  };

  // 戦闘終了時の報酬メッセージ作成時に習得スキルも追加
  var _BattleManager_makeRewards = BattleManager.makeRewards;
  BattleManager.makeRewards = function() {
    _BattleManager_makeRewards.call(this);
    this._learnedSkillsText = this.makeLearnedSkillsText();
  };

  // 新たに習得したスキルを文字列化
  BattleManager.makeLearnedSkillsText = function() {
    let text = '';
    $gameParty.members().forEach(function(actor) {
      actor.skills().forEach(function(skill) {
        if (!actor._previousSkills.includes(skill.id)) {
          text += `\\I[${skill.iconIndex}]${skill.name}\n`;
        }
      });
    });
    return text;
  };

  // 報酬メッセージの表示時に習得スキルを追記
  var _BattleManager_displayRewards = BattleManager.displayRewards;
  BattleManager.displayRewards = function() {
  _BattleManager_displayRewards.call(this);
    if (this._learnedSkillsText) {
      $gameMessage.add("\n\\c[16]【新規習得スキル】\\c[0]");
      $gameMessage.add(this._learnedSkillsText);
    }
  };

})();
