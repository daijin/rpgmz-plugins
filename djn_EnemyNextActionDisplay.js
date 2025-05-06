/*:ja
 * @target MZ
 * @plugindesc 敵の次行動とアイコンをコマンド選択中のみ頭上に表示するプラグイン
 * @author 大臣
 * @url https://github.com/daijin/rpgmz-plugins
 *
 * @param fontSize
 * @text フォントサイズ
 * @type number
 * @default 18
 * 
 * @help
 * 戦闘中、プレイヤーのコマンド選択中のみ、敵の頭上に次行動名とアイコンを表示します。
 * 特にプラグインコマンドはありません。
 *
 * 本プラグインのライセンスについて(License):
 *  - 本プラグインはMITライセンスのもとで公開しています。
 *  - This plugin is released under the MIT License.
 */

(() => {
    ///////////////////////////////////////////////////////////////////////////
    // コンフィグ値
    const pluginName = 'djn_EnemyNextActionDisplay';
    const configs = PluginManager.parameters(pluginName);
    const configFontSize = Number(configs['fontSize'] || 18);

    ///////////////////////////////////////////////////////////////////////////
    // 行動決定時に行動名とアイコンIDを保存する
    const _Game_Enemy_makeActions = Game_Enemy.prototype.makeActions;
    Game_Enemy.prototype.makeActions = function() {
        _Game_Enemy_makeActions.call(this);
        if (this._actions.length > 0) {
            const action = this._actions[0];
            if (action.isSkill()) {
                const item = action.item();
                if (item) {
                    this._nextActionName = item.name;
                    this._nextActionIcon = item.iconIndex;
                    this._nextActionSkillId = item.id;
                } else {
                    this._nextActionName = '';
                    this._nextActionIcon = 0;
                    this._nextActionSkillId = 0;
                }
            } else {
                this._nextActionName = '';
                this._nextActionIcon = 0;
                this._nextActionSkillId = 0;
            }
        } else {
            this._nextActionName = '';
            this._nextActionIcon = 0;
            this._nextActionSkillId = 0;
        }
    };

    Game_Enemy.prototype.nextActionName = function() {
        return this._nextActionName || '';
    };

    Game_Enemy.prototype.nextActionIcon = function() {
        return this._nextActionIcon || 0;
    };

    // 敵スプライトの初期化拡張
    const _Sprite_Enemy_initMembers = Sprite_Enemy.prototype.initMembers;
    Sprite_Enemy.prototype.initMembers = function() {
        _Sprite_Enemy_initMembers.call(this);

        // 未習得スキルかどうかで文字色を変える
        /*
        const learned = $gameParty.members().some(function(actor) {
            return actor.skills().some(function(skill) {
                return skill.id === this._nextActionSkillId;
            });
        });
        */
        
        // 行動名表示用スプライト
        this._actionTextSprite = new Sprite(new Bitmap(120, configFontSize));
        this._actionTextSprite.bitmap.fontSize = configFontSize;
        this._actionTextSprite.bitmap.fontFace = "rmmz-mainfont";
        // this._actionTextSprite.bitmap.textColor = learned ? ColorManager.normalColor() : ColorManager.textColor(2);
        this._actionTextSprite.bitmap.textColor = ColorManager.normalColor();
        this.addChild(this._actionTextSprite);

        // アイコン表示用スプライト
        this._actionIconSprite = new Sprite();
        this.addChild(this._actionIconSprite);
    };

    // 毎フレーム更新
    const _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function() {
        _Sprite_Enemy_update.call(this);
        this.updateActionDisplay();
    };

    // 表示更新
    Sprite_Enemy.prototype.updateActionDisplay = function() {
        const enemy = this._battler;
        const isSelecting = $gameParty.inBattle() && BattleManager.isInputting();

        if (enemy && isSelecting) {
            const text = enemy.nextActionName();
            const iconIndex = enemy.nextActionIcon();
            const bitmap = this._actionTextSprite.bitmap;

            // 行動名描画
            bitmap.clear();
            if (text) {
                // 行動名描画
                bitmap.drawText(text, 0, 0, 120, configFontSize, 'center');
            }
            this._actionTextSprite.x = -60;
            this._actionTextSprite.y = -this.height - 40;

            // アイコン描画
            if (iconIndex > 0) {
                const pw = ImageManager.iconWidth;
                const ph = ImageManager.iconHeight;
                const sx = (iconIndex % 16) * pw;
                const sy = Math.floor(iconIndex / 16) * ph;
                const bitmapIcon = ImageManager.loadSystem('IconSet');

                this._actionIconSprite.bitmap = bitmapIcon;
                this._actionIconSprite.setFrame(sx, sy, pw, ph);
                this._actionIconSprite.x = -pw / 2;
                this._actionIconSprite.y = this._actionTextSprite.y - (configFontSize * 2);
                this._actionIconSprite.visible = true;
            } else {
                this._actionIconSprite.visible = false;
            }

            this._actionTextSprite.visible = true;
        } else {
            this._actionTextSprite.visible = false;
            this._actionIconSprite.visible = false;
        }
    };
})();
