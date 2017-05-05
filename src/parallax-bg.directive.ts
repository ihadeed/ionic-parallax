import { Directive, OnDestroy, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Content, DomController, Platform } from 'ionic-angular';
import { ParallaxBase } from './parallax-base';

@Directive({
  selector: '[parallax-bg]'
})
export class ParallaxBackground extends ParallaxBase implements AfterViewInit, OnDestroy, ParallaxBase {

  private _originalHeight: number;
  private _newHeight: number;
  private _lastY: number = 0;

  constructor(
    _content: Content,
    _el: ElementRef,
    _rnd: Renderer2,
    _domCtrl: DomController,
    _plt: Platform
  ) {
    super(_content, _el, _rnd, _domCtrl, _plt);
  }

  ngAfterViewInit() {
    this._setElementHeight();
    super.ngAfterViewInit();
  }

  private _getDimensions(): any {

    const
      el: HTMLElement = this.getNativeElement(),
      clientRect: ClientRect = el.getBoundingClientRect(),
      contentTop: number = this._content.contentTop,
      viewHeight: number = this._content.contentHeight,
      distanceYtoBottom: number = clientRect.bottom - contentTop,
      distanceYtoTop: number = clientRect.top - contentTop,
      elementHeight: number = el.offsetHeight,
      distanceYtoCenter: number = distanceYtoTop + elementHeight
    ;

    return {
      distanceYtoBottom,
      distanceYtoTop,
      distanceYtoCenter,
      viewHeight,
      elementHeight
    };

  }

  private _setElementHeight(): void {

    const
      el: HTMLElement = this.getNativeElement(),
      { viewHeight, elementHeight } = this._getDimensions(),
      maxY = (viewHeight + (this._originalHeight = elementHeight)) / viewHeight * this.ratio / 100 + 0.5
    ;

    if (isNaN(viewHeight) || viewHeight === 0) {
      // in some cases the view height isn't available yet because the page hasn't loaded
      // we need to check in a bit
      this._plt.timeout(this._setElementHeight.bind(this), 100);
      return;
    }

    this._newHeight = this._originalHeight * (maxY + 1);

    this._rnd.setStyle(el, 'height', this._newHeight + 'px');
    this._rnd.setStyle(el, 'background-position-x', '50%');

    this._onScroll(null, true);

  }

  /**
   * Returns back the number of pixels that the background moved/should move by
   * @return {number}
   * @private
   */
  protected _getOffsetY(): number {
    return this._lastY * this._originalHeight;
  }

  protected _onScroll(ev: any, force: boolean = false) {

    this._domCtrl.read(() => {

      const
        { distanceYtoBottom, distanceYtoTop, viewHeight, distanceYtoCenter } = this._getDimensions(),
        actualDistanceYtoBottom: number = distanceYtoBottom + this._newHeight - this._originalHeight - this._getOffsetY(),
        actualDistanceYtoTop: number = distanceYtoTop + this._getOffsetY()
      ;

      if (!force && (actualDistanceYtoBottom < 0 || actualDistanceYtoTop > viewHeight)) {
        // the element is not visible, let's not do anything about this scroll event
        return;
      }

      // magic formula
      // figure out how much should we move the image from 50%
      const y = (viewHeight - distanceYtoCenter) / viewHeight / 2 * 40 / 100 + 0.5;

      // make sure it's > 0 && < 100
      // also save this value to memory
      this._lastY = Math.min(1, Math.max(y, -1));

      this._domCtrl.write(() => {

        // update the DOM!
        this._rnd.setStyle(this.getNativeElement(), this._plt.Css.transform, `translate3d(0, -${ this._getOffsetY() }px, 0)`)

      });

    });

  }

}
