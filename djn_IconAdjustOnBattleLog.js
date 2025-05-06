/*:ja
 * @target MZ
 * @plugindesc バトルログのアイコンサイズをフォントサイズ追従させるプラグイン
 * @author 大臣
 * @url https://github.com/daijin/rpgmz-plugins
 *
 * @help
 * バトルログに \I[n] でアイコンを出力した場合に、
 * アイコンのサイズをフォントサイズに追従させるプラグインです。
 * サイズは自動計算で決定します。
 * 
 * 特にプラグインコマンドはありません。
 *
 * 本プラグインのライセンスについて(License):
 *  - 本プラグインはMITライセンスのもとで公開しています。
 *  - This plugin is released under the MIT License.
 */
(() => {
  const _Window_Base_drawIcon = Window_Base.prototype.drawIcon;

  Window_Base.prototype.drawIcon = function(iconIndex, x, y) {
    const bitmap = ImageManager.loadSystem("IconSet");
    const pw = 32;
    const ph = 32;
    const sx = (iconIndex % 16) * pw;
    const sy = Math.floor(iconIndex / 16) * ph;

    // バトルログの場合のみフォントサイズに合わせて拡大縮小
    const classname = this.constructor.name;
    if (classname === "Window_PastBattleLog" || classname === "Window_BattleLog") {
      const fontSize = this.contents.fontSize;
      const scale = fontSize / 32;
      const dw = pw * scale;
      const dh = ph * scale;

      // アイコンの位置を微調整（上下左右の余白を詰める）
      const offsetX = (pw - dw) / 4;  // 横方向の余白調整
      const offsetY = (ph - dh) / 4;  // 縦方向の余白調整

      this.contents.blt(bitmap, sx, sy, pw, ph, x + offsetX, y + offsetY, dw, dh);
    } else {
      // 通常は元のサイズで描画
      this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
    }
  };
})();
