# ionic-parallax

```bash
npm i --save ionic-parallax
```

```ts
import { ParallaxModule } from 'ionic-parallax';

@NgModule({
  imports: [
    ...
     ParallaxModule
  ]
}) 
```

```html
<ion-content>
  <ion-card>
     <div parallax [nodes]="1" style="background-url: url(...)"></div>
  </ion-card>
</ion-content>
```