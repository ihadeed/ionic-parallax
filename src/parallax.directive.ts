import { Directive, Input, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { Content, DomController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

@Directive({
    selector: '[parallax]',
})
export class ParallaxDirective implements OnInit, OnDestroy {

    @Input()
    ratio: number = 80;

    @Input()
    rootElement: HTMLElement;

    @Input()
    nodes: number;

    private _watch: Subscription;

    constructor(
        private _content: Content,
        private _el: ElementRef,
        private _rnd: Renderer2,
        private _domCtrl: DomController
    ) {}

    ngOnInit() {
        let el: HTMLElement = this.getNativeElement();

        // We figure out everything by measuring the distance between
        // <ion-content> and the element this directive is attached to.

        // In case this element is not a direct child of <ion-content>,
        // we need to specify the number of parent nodes separating this
        // element from <ion-content>.

        // For example:
        // <ion-content>
        //   <ion-card>
        //      <div parallax [nodes]="1" style="background-url: url(...)"></div>
        //   </ion-card>
        // </ion-content>

        if (!!this.nodes && !isNaN(this.nodes) && this.nodes > 0) {
            for (let i = 0; i < this.nodes; i++) {
                try {
                    el = el.parentElement;
                } catch (e) {
                    // this shouldn't happen unless if the developer misconfigured this element
                    // use any element as a fallback... it will not really work but at least it won't throw errors.
                    el = this.getNativeElement();
                }
            }
        }

        this.rootElement = el;
        this.listen();
        this._onScroll(null, true);
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

    getRootElement(): HTMLElement {
        return this.rootElement;
    }

    private _onScroll(ev: any, force: boolean = false) {

        this._domCtrl.read(() => {

            const
                viewHeight: number = this._content.scrollHeight,
                distanceYtoBottom: number = this.getRootElement().offsetHeight + this.getRootElement().offsetTop - this._content.scrollTop,
                distanceYtoTop: number = this.getRootElement().offsetTop - this._content.scrollTop,
                distanceYtoCenter: number = distanceYtoTop + this.getRootElement().offsetHeight / 2
            ;

            if (!force && (distanceYtoBottom < 0 || distanceYtoTop > viewHeight)) {
                // the element is not visible, let's not do anything about this scroll event
                return;
            }

            // magic formula
            // figure out how much should we move the image from 50%
            let y = (viewHeight - distanceYtoCenter) / viewHeight * this.ratio / 2 + 50;

            // make sure it's > 0 && < 100
            y = Math.min(100, Math.max(y, 0));

            // update the DOM!
            this._domCtrl.write(() => {
                this._rnd.setStyle(this.getNativeElement(), 'background-position', `center ${y}%`);
            });

        });

    }

}
