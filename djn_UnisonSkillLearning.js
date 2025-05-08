/*:
 * @target MZ
 * @plugindesc スキルラーニング合成システム v1.0
 * @author 大臣
 * @url https://github.com/daijin/rpgmz-plugins
 *
 * @param SkillUnisons
 * @text スキル合成パターン
 * @type struct<Unison>[]
 * @desc 合成するスキルの組み合わせを設定します。
 *
 * @param ShowMessage
 * @text 閃きメッセージ表示
 * @type boolean
 * @default true
 * @desc 合成スキル習得時に、メッセージを表示するか
 *
 * @param LearnMessageText
 * @text 閃きメッセージ本文
 * @type string
 * @default %1は%2を閃いた！
 * @desc 合成スキル習得時のメッセージ。%1はアクター名、%2はスキル名。初期値: %1は%2を閃いた！
 *
 * @param LearnTextColor
 * @text 閃き文字色
 * @type color
 * @default 14
 * @desc 閃いたスキル名の文字色番号（ウィンドウスキンのカラー番号）
 *
 * @param LearnSe
 * @text 習得SE
 * @type file
 * @dir audio/se/
 * @default Skill2
 * @desc 習得時に鳴らすSEファイル名（audio/seフォルダ内）
 *
 * @param LearnSeVolume
 * @text SEボリューム
 * @type number
 * @default 90
 * @desc SEの音量
 *
 * @param LearnSePitch
 * @text SEピッチ
 * @type number
 * @default 100
 * @desc SEのピッチ
 */

/*~struct~Unison:
 * @param SkillA
 * @text スキルA
 * @type skill
 * @desc 合成元スキルの一つ
 *
 * @param SkillB
 * @text スキルB
 * @type skill
 * @desc 合成元スキルのもう一つ
 *
 * @param ResultSkill
 * @text 習得スキル
 * @type skill
 * @desc 派生で閃く合成スキル
 */

(() => {
  /////////////////////////////////////////////////////////////////////////////
  // parameters
  const parameters = PluginManager.parameters(document.currentScript.src.match(/([^\/]+)\.js$/)[1]);

  const skillUnisons = JSON.parse(parameters['SkillUnisons'] || '[]').map(unison => JSON.parse(unison));
  const showMessage = parameters['ShowMessage'] === 'true';
  const learnMessageText = String(parameters['LearnMessageText'] || 'を閃いた！');
  const learnTextColor = Number(parameters['LearnTextColor'] || 14);
  const learnSeName = String(parameters['LearnSe'] || 'Skill2');
  const learnSeVolume = Number(parameters['LearnSeVolume'] || 90);
  const learnSePitch = Number(parameters['LearnSePitch'] || 100);

  // スキル習得時の処理フック（非バトル時用）
  const _Game_Actor_learnSkill = Game_Actor.prototype.learnSkill;
  Game_Actor.prototype.learnSkill = function(skillId) {
    const alreadyLearned = this.isLearnedSkill(skillId);
    _Game_Actor_learnSkill.call(this, skillId);

    // 未習得のスキルだったら合成技習得チェック（未検証）
    if (!alreadyLearned) {
      //this.checkUnisonLearning(skillId);
    }
  };

  // 習得ログのフック（バトル時用）
  const _Window_BattleLog_displayFailure = Window_BattleLog.prototype.displayFailure;
  Window_BattleLog.prototype.displayFailure = function(target) {
    _Window_BattleLog_displayFailure.call(this, target);

    // チェック処理
    if (target && target.isActor()) {
      target.checkUnisonLearning(target);
    }
  }

  // 習得した組み合わせをチェック
  Game_Actor.prototype.checkUnisonLearning = function(target) {
    skillUnisons.forEach(unison => {
      const skillA = Number(unison.SkillA);
      const skillB = Number(unison.SkillB);
      const resultSkill = Number(unison.ResultSkill);

      if (!this.isLearnedSkill(resultSkill) &&
          this.isLearnedSkill(skillA) && this.isLearnedSkill(skillB)) {
        // 習得
        this.learnSkill(resultSkill);

        // 習得した合成技を表示
        if (showMessage) {
          const skill = $dataSkills[resultSkill];
          const icon = skill.iconIndex > 0 ? `\\I[${skill.iconIndex}]` : "";
          //const text = this.name() + `は\\C[${learnTextColor}]${icon}${skill.name}\\C[0]${learnMessageText}`;
          const text = learnMessageText.format(this.name(), `\\C[${learnTextColor}]${icon}${skill.name}\\C[0]`);

          if (SceneManager._scene instanceof Scene_Battle) {
            // 戦闘中ならバトルログへ
            //BattleManager._logWindow.addText(text);
            BattleManager._logWindow.push("addText", text);
            BattleManager._logWindow.push("wait");
          }
          else {
            // 非戦闘時なら通常メッセージへ
            $gameMessage.add(text);
          }

          // 習得時SE鳴らす
          if (learnSeName) {
            AudioManager.playSe({
              name: learnSeName,
              volume: learnSeVolume,
              pitch: learnSePitch,
              pan: 0
            });
          }
        }
      }
    })
  };
})();
