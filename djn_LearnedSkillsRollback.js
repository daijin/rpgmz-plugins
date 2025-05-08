/*:
 * @target MZ
 * @plugindesc 戦闘から逃走・敗北時に、戦闘中の新規習得スキルを元に戻します。
 * @author 大臣
 * @url https://github.com/daijin/rpgmz-plugins
 * 
 * @help
 * このプラグインは、バトル中にスキルを習得（ラーニング）したあとで、
 * 戦闘を逃走または敗北したときに、戦闘開始前のスキルセットに戻すプラグインです。
 * 
 * 戦闘開始時に既に習得しているスキルを記録し、
 * 逃走・敗北時はそれに戻します。
 */
(() => {

  // 戦闘開始時に現在のスキルIDを記録
  var _Scene_Battle_start = Scene_Battle.prototype.start;
  Scene_Battle.prototype.start = function() {
    $gameParty.members().forEach(function(actor) {
      actor._previousSkills = actor.skills().map(skill => skill.id);
    });
    _Scene_Battle_start.call(this);
  };

  // スキルを記録状態に戻す関数
  function resetLearnedSkills() {
    $gameParty.members().forEach(function(actor) {
      const currentSkillIds = actor.skills().map(skill => skill.id);
      // 今のスキルのうち、バトル開始前になかったものを削除
      currentSkillIds.forEach(function(skillId) {
        if (!actor._previousSkills.includes(skillId)) {
          actor.forgetSkill(skillId);
        }
      });
    });
  }

  // 逃走成功時にリセット
  var _BattleManager_processEscape = BattleManager.processEscape;
  BattleManager.processEscape = function() {
    var success = _BattleManager_processEscape.call(this);
    if (success) {
      resetLearnedSkills();
    }
    return success;
  };

  // 敗北時にもリセット（Game_Interpreterのバトル終了処理）
  var _BattleManager_processDefeat = BattleManager.processDefeat;
  BattleManager.processDefeat = function() {
    resetLearnedSkills();
    _BattleManager_processDefeat.call(this);
  };

})();
