import { Directive, Input, OnDestroy, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Content, DomController, Platform, ViewController } from 'ionic-angular';
import { ParallaxBase } from './parallax-base';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

@Directive({
  selector: '[parallax-header]'
})
export class ParallaxHeader extends ParallaxBase implements AfterViewInit, OnDestroy, ParallaxBase {

  @Input()
  set fade(val: boolean) {
    this._fade = typeof val !== 'boolean' || val;
  }

  get fade(): boolean {
    return this._fade;
  }

  @Input()
  set scale(val: boolean) {
    this._scale = typeof val !== 'boolean' || val;
  }

  get scale(): boolean {
    return this._scale;
  }

  @Input()
  set compact(val: boolean) {
    this._compact = typeof val !== 'boolean' || val;
  }

  get compact(): boolean {
    return this._compact;
  }

  @Input()
  set bounce(val: boolean) {
    this._bounce = typeof val !== 'boolean' || val;
  }

  get bounce(): boolean {
    return this._bounce;
  }

  @Input()
  fadeAt: number;

  private _originalHeight: number;
  private _fade: boolean = false;
  private _scale: boolean = false;
  private _compact: boolean = false;
  private _bounce: boolean = false;

  private _scrollEndWatch: Subscription;

  constructor(
    _content: Content,
    _el: ElementRef,
    _rnd: Renderer2,
    _domCtrl: DomController,
    _plt: Platform,
    private viewCtrl: ViewController
  ) {
    super(_content, _el, _rnd, _domCtrl, _plt);
  }

  ngAfterViewInit() {
    this._originalHeight = this.getNativeElement().offsetHeight;
    this.fadeAt = this.fadeAt || this._originalHeight * 0.75;
    this._onScroll(null, true);
    super.ngAfterViewInit();
    if (this.compact) {
      let sub = this.viewCtrl.writeReady.subscribe(() => {
        sub.unsubscribe();
        this._content.scrollTo(0, this._originalHeight / 2);
      })
    }
  }

  listen() {
    super.listen();
    if (this.bounce) {
      // this._rnd.listen(this._content.getNativeElement(), 'touchend', this._onScrollEnd.bind(this));
      this._scrollEndWatch = Observable.fromEvent(this._content.getNativeElement(), 'touchend').subscribe(this._onScrollEnd.bind(this));
    }
  }

  unlisten() {
    super.unlisten();
    this._scrollEndWatch && this._scrollEndWatch.unsubscribe && this._scrollEndWatch.unsubscribe();
  }

  protected _onScroll(ev: any, force: boolean = false) {

    this._domCtrl.read(() => {

      let translateAmt, scaleAmt, scrollTop;
      scrollTop = this._content.scrollTop;

      this._domCtrl.write(() => {

        if (scrollTop > this._originalHeight) return;

        if (scrollTop >= 0) {
          translateAmt = scrollTop / 2;
          scaleAmt = 1 - (-scrollTop / this._originalHeight * 0.15);
        } else {
          translateAmt = 0;
          scaleAmt = 1;
        }

        let transform = `translate3d(0, ${translateAmt}px, 0)`;

        if (this.scale) {
          transform += ` scale3d(${scaleAmt}, ${scaleAmt}, 1)`;
        }

        this._rnd.setStyle(this.getNativeElement(), this._plt.Css.transform, transform);

        if (this.fade && (this._originalHeight - scrollTop) <= this.fadeAt) {
          let opacity = (this._originalHeight - scrollTop) / this.fadeAt;
          this._rnd.setStyle(this.getNativeElement(), 'opacity', opacity);
        }

      });

    });

  }

  private _onScrollEnd(ev: any) {
    if (this._content.scrollTop < this._originalHeight / 2) {
      this._content.scrollTo(0, this._originalHeight / 2);
    }
  }

}
