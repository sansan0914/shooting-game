
/**
 * 座標を管理するためのクラス
 */
class Position {
  /**
   * @constructor
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   */
  constructor(x, y) {
    /**
     * X 座標
     * @type {number}
     */
    this.x = x;
    /**
     * Y 座標
     * @type {number}
     */
    this.y = y;
  }

  /**
   * 値を設定する
   * @param {number} [x] - 設定する X 座標
   * @param {number} [y] - 設定する Y 座標
   */
  set(x, y) {
    if (x != null) { this.x = x; }
    if (y != null) { this.y = y; }
  }
}

/**
 * キャラクター管理のための基幹クラス
 */
class Character {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @param {number} w - w 幅
   * @param {number} y - y 高さ
   * @param {number} life - キャラクターのライフ（生存フラグを兼ねる）
   * @param {Image} image - キャラクターの画像
   */
  constructor(ctx, x, y, w, h, life, imagePath) {
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = ctx;

    /**
     * @type {Position}
     */
    this.position = new Position(x, y);

    /**
     * @type {number}
     */
    this.width = w;

    /**
     * @type {number}
     */
    this.height = h;

    /**
     * @type {number}
     */
    this.life = life;

    /**
     * @type {boolean}
     */
    this.ready = false;

    /**
     * @type {Image}
     */
    this.image = new Image();
    this.image.addEventListener('load', () => {
      //画像のロードが完了したら準備完了フラグを立てる
      this.ready = true;
    }, false)
    this.image.src = imagePath;
  }

  /**
   * キャラクターを描画する
   */
  draw() {
    //キャラクターの幅を考慮してオフセットする量
    let offsetX = this.width / 2;
    let offsetY = this.height / 2;

    this.ctx.drawImage(
      this.image,
      this.position.x - offsetX,
      this.position.y - offsetY,
      this.width,
      this.height
    );
  }
}

/**
 * viper クラス
 */
class Viper extends Character {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @param {number} w - w 幅
   * @param {number} h - h 高さ
   * @param {Image} image - キャラクターの画像
   */
  constructor(ctx, x, y, w, h, image) {
    // Character クラスを継承しているので、まずは継承元となる
    // Character クラスのコンストラクタを呼び出すことで初期化する
    // （super が継承元のコンストラクタの呼び出しに相当する）
    super(ctx, x, y, w, h, 0, image);

    /**
     * 自身の移動スピード（update 一回あたりの移動量）
     * @type {number}
     */
    this.speed = 3;

    /**
     * viper が登場中かどうかを表すフラグ
     * @type {boolean}
     */
    this.isComing = false;
    /**
     * 登場演出を開始した際のタイムスタンプ
     * @type {number}
     */
    this.comingStart = null;
    /**
     * 登場演出を完了とする座標
     * @type {Position}
     */
    this.comingEndPosition = null;

    /**
     * 自身が持つショットインスタンスの配列
     */
    this.shotArray = null;

    /**
     * ショットを打った後のチェック用カウンター
     * @type {number}
     */
    this.shotCheckCounter = 0;

    /**
     * ショットを打つことのできる間隔
     */
    this.shotInterval = 10;

  }

  /**
   * 登場演出に関する設定を行う
   * @param {number} startX - 登場開始時の X 座標
   * @param {number} startY - 登場開始時の Y 座標
   * @param {number} endX - 登場終了とする X 座標
   * @param {number} endY - 登場終了とする Y 座標
   */
  setComing(startX, startY, endX, endY) {
    // 登場中のフラグを立てる
    this.isComing = true;
    // 登場開始時のタイムスタンプを取得する
    this.comingStart = Date.now();
    // 登場開始位置に自機を移動させる
    this.position.set(startX, startY);
    //登場開始とする座標を設定する
    this.comingStartPosition = new Position(startX, startY);
    // 登場終了とする座標を設定する
    this.comingEndPosition = new Position(endX, endY);
  }

  /**
   * ショットを設定する
   * @param { Array<shot> } shotArray - 自身に設定するショットの配列
   */
  setShotArray(shotArray) {
    //自身のプロパティに設定する
    this.shotArray = shotArray;
  }

  /**
   * キャラクターの状態を更新し描画を行う
   */
  update() {
    // 現時点のタイムスタンプを取得する
    let justTime = Date.now();

    // 登場シーンの処理
    if (this.isComing === true) {
      let comingTime = (justTime - this.comingStart) / 1000;
      // 登場中は時間が経つほど上に向かって進む
      let y = this.comingStartPosition.y - comingTime * 50;
      // 一定の位置まで移動したら登場シーンを終了する
      if (y <= this.comingEndPosition.y) {
        this.isComing = false;        // 登場シーンフラグを下ろす
        y = this.comingEndPosition.y; // 行き過ぎの可能性もあるので位置を再設定
      }
      // 求めた Y 座標を自機に設定する
      this.position.set(this.position.x, y);
      // justTime を 100 で割ったとき余りが 50 より小さくなる場合だけ半透明にする
      if (justTime % 100 < 50) {
        this.ctx.globalAlpha = 0.5;
      }

    } else {
      //キーの押下状態を調べて挙動を変える
      if (window.isKeyDown.key_ArrowLeft === true) {
        this.position.x -= this.speed     //左矢印キー
      }
      if (window.isKeyDown.key_ArrowRight === true) {
        this.position.x += this.speed     //左矢印キー
      }
      if (window.isKeyDown.key_ArrowUp === true) {
        this.position.y -= this.speed     //左矢印キー
      }
      if (window.isKeyDown.key_ArrowDown === true) {
        this.position.y += this.speed     //左矢印キー
      }

      //移動後の位置が画面外へ出ていかないか確認して修正する
      let canvasWidth = this.ctx.canvas.width;
      let canvasHeight = this.ctx.canvas.height;
      let tx = Math.min(Math.max(this.position.x, 0), canvasWidth)
      let ty = Math.min(Math.max(this.position.y, 0), canvasHeight)

      this.position.set(tx, ty);

      //キーの押下状態を調べてショットを生成する
      if (window.isKeyDown.key_z === true) {
        //ショットを打てる状態なのか確認する
        //ショットチェック用カウンターが０以上ならショットを生成できる
        if (this.shotCheckCounter >= 0) {
          //ショットの生存を確認し非生存のものがあれば生成する
          for (let i = 0; i < this.shotArray.length; ++i) {
            //非生存かどうかを確認する
            if (this.shotArray[i].life <= 0) {
              //自機キャラクターの座標にショットを生成する
              this.shotArray[i].set(this.position.x, this.position.y);
              //ショットを生成したのでインターバルを設定する
              this.shotCheckCounter = -this.shotInterval;
              //１つ生成したらループを抜ける
              break;
            }
          }
        }
      }
      ++this.shotCheckCounter;
    }



    //自機キャラクターを描画する
    this.draw();

    //念のためグローバルなアルファの状態を元に戻す
    this.ctx.globalAlpha = 1.0;
  }
}

/**
 * shot クラス
 */
class Shot extends Character {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @param {number} w - w 幅
   * @param {number} h - h 高さ
   * @param {Image} image - キャラクターの画像
   */
  constructor(ctx, x, y, w, h, imagePath) {
    // Character クラスを継承しているので、まずは継承元となる
    // Character クラスのコンストラクタを呼び出すことで初期化する
    // （super が継承元のコンストラクタの呼び出しに相当する）
    super(ctx, x, y, w, h, 0, imagePath);

    /**
     * 自身の移動スピード（update 一回あたりの移動量）
     * @type {number}
     */
    this.speed = 7;

  }
  /**
  * ショットを配置する
  * @param {number} x - 配置する X 座標
  * @param {number} y - 配置する Y 座標
  */
  set(x, y) {
    //登場開始位置にショットを移動させる
    this.position.set(x, y)
    //ショットの値を０より大きい値（生存の状態）にする
    this.life = 1;
  }

  /**
   * キャラクターの状態を更新し、描画を行う
   */
  update() {
    //もしショットのライフが０以下の場合何もしない
    if (this.life <= 0) { return; }
    //もしショットが画面外へ移動していたらライフを０（非生存状態）に設定する
    if (this.position.y + this.height < 0) {
      this.life = 0;
    }
    //ショットを上に向かって移動させる
    this.position.y -= this.speed;
    //ショットを描画する
    this.draw();
  }
}
