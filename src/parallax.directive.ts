import { Directive, Input, OnInit, AfterViewInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { Content, DomController, Platform } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

@Directive({
    selector: '[parallax]'
})
export class ParallaxDirective implements OnInit, AfterViewInit, OnDestroy {

    @Input()
    ratio: number = 40;

    private _watch: Subscription;

    private _originalHeight: number;

    constructor(
        private _content: Content,
        private _el: ElementRef,
        private _rnd: Renderer2,
        private _domCtrl: DomController,
        private _plt: Platform
    ) { }

    ngOnInit() {
        this.listen();
    }

    ngAfterViewInit() {
        this._plt.timeout(() => {
            // TODO figure out why the height is not correct unless if we wait a little bit ...
            this._onScroll(null, true);
        }, 500);
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

    private _onScroll(ev: any, force: boolean = false) {

        this._domCtrl.read(() => {
            const
                el: HTMLElement = this.getNativeElement(),
                clientRect: ClientRect = el.getBoundingClientRect(),
                contentTop: number = this._content.contentTop,
                viewHeight: number = this._plt.height() - this._content.contentBottom - this._content.contentTop,
                distanceYtoBottom: number = clientRect.bottom - contentTop,
                distanceYtoTop: number = clientRect.top - contentTop
            ;

            if (!force && (distanceYtoBottom < 0 || distanceYtoTop > viewHeight)) {
                // the element is not visible, let's not do anything about this scroll event
                return;
            }

            this._domCtrl.write(() => {

                if (!this._originalHeight) {
                    const maxY = (viewHeight + (this._originalHeight = el.offsetHeight)) / viewHeight * this.ratio / 100;
                    this._rnd.setStyle(this.getNativeElement(), 'height', this._originalHeight * (maxY + 1) + 'px');
                    this._rnd.setStyle(this.getNativeElement(), 'background-position-x', '50%');
                }

                // magic formula
                // figure out how much should we move the image from 50%
                let y = (viewHeight - distanceYtoTop) / viewHeight * this.ratio / 100;

                // make sure it's > 0 && < 100
                y = Math.min(1, Math.max(y, 0));

                // update the DOM!
                this._rnd.setStyle(el, this._plt.Css.transform, `translate3d(0, -${ y * this._originalHeight }px, 0)`)

            });

        })

    }

}
