import { OnDestroy, AfterViewInit, Renderer2, ElementRef, Input } from '@angular/core';
import { Content, DomController, Platform } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

export abstract class ParallaxBase implements AfterViewInit, OnDestroy {

  @Input()
  ratio: number = 50;

  protected _watch: Subscription;

  constructor(
    protected _content: Content,
    protected _el: ElementRef,
    protected _rnd: Renderer2,
    protected _domCtrl: DomController,
    protected _plt: Platform
  ) {}

  ngAfterViewInit() {
    this.listen();
  }

  ngOnDestroy() {
    this.unlisten();
  }

  listen(): void {
    this._watch = this._content.ionScroll.subscribe(this._onScroll.bind(this));
  }

  unlisten(): void {
    this._watch && typeof this._watch.unsubscribe === 'function' && this._watch.unsubscribe();
  }

  getNativeElement(): HTMLElement {
    return this._el.nativeElement;
  }

  protected abstract _onScroll(ev: any, force: boolean);

}
