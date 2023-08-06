import { ElementRef } from '@angular/core';
import { AutoFocusDirective } from './auto-focus.directive';

describe('AutoFocusDirective', () => {
  let elementRef:ElementRef
  it('should create an instance', () => {
    const directive = new AutoFocusDirective(elementRef);
    expect(directive).toBeTruthy();
  });
});
