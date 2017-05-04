# ionic-parallax

WIP, here's a quick usage example: 

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
     <div parallax [ratio]=50></div>
  </ion-card>
</ion-content>
```

```scss
ion-card {
  position: relative;
   
  > img[parallax] {
    position: absolute;
    height: inherit;
  }
}
```