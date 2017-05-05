import { NgModule } from '@angular/core';
import { ParallaxBackground } from './parallax-bg.directive';
import { ParallaxHeader } from './parallax-header.directive';

@NgModule({
  declarations: [
    ParallaxBackground,
    ParallaxHeader
  ],
  exports: [
    ParallaxBackground,
    ParallaxHeader
  ]
})
export class ParallaxModule {}
