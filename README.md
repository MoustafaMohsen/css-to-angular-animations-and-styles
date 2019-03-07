# CSS to Angular Animations and Styles

> @keyframe => keyframes()

  

[![Known Vulnerabilities](https://snyk.io/test/github/MoustafaMohsen/css-to-angular-animations-and-styles/badge.svg)](https://snyk.io/test/github/MoustafaMohsen/css-to-angular-animations-and-styles) [![npm version](https://badge.fury.io/js/css-angular.svg)](https://www.npmjs.com/package/css-angular)

  

Convert CSS to Angular Animations ready to use, reads .css file and outputs .ts file.

  

it can make creating animations much easier, you can create your keyframe animation separately and just convert it to work with angular, or convert big animation library like animate.css without the hours of boring copying and pasting

  

**Function:**

- Reads CSS file and extract css `@keyframes` and classes

- converts the `@keyframes` to angular animations methods `keyframes([...])`

- converts the css classes to angular styles methods `style({...})`

- saves both angular animations and styles as as const in the output .ts file ready to use in your angular app.

  
  

## How to use:

**1. navigate to the css file location**

place the css file and open you command line in this location

**2. run the package**

```shell

npx css-angular input.css output.ts

```

no need to install the package first, just run it using npx, make sure you have npx installed, if not install it first`npm install -g npx`

*note: if output.ts file already exsists it will be overwritten*

  
  

## Example

Let implment a simple animation when a component goes from shown to destroyed using `*ngIf` and reverse.

1. download [animate.css](https://raw.githubusercontent.com/daneden/animate.css/master/animate.css) and place it in some folder

2. run `npx css-angular animate.css`

  

3. copy `animate.ts` to your project, and import it to you component

```javascript
import { trigger, transition, animate } from  '@angular/animations';
import { GeneratedStyles } from  './animate';

@Component({
  ...

  animations:[
    trigger("YOUR_ANIMATION_NAME", [
      transition(`:leave`, [
        animate("0.5s ease", GeneratedStyles.Animations.fadeOut)
      ]),

      transition(`:enter`, [
        animate("0.5s ease", GeneratedStyles.Animations.fadeIn)
      ])
    ])
  ]
})


// the following is just an example of how *ngIf could be used
export  class  AppComponent  implements  OnInit {
    show=true;
    ngOnInit(): void {
        // toggle between true and false every 2 secound
        setInterval(() => {
            this.show=!this.show;
        }, 2000);;
    }
}
```

4. apply the animation to your html

```html
<mycomponent  [@YOUR_ANIMATION_NAME]  *ngIf="show"></mycomponent>
```

now you animation is working, you can use different combinations of animations and/or different states

  

read more about [angular animations](https://angular.io/guide/animations)

  
  

### Notes:

- this application will extract the `@keyframes` and classes that's formatted like `.example` only and ignore any thing else, for example all the following `#example`  `.example:after`  `example`  `example:after .example`  `[example]` will be ignored, so try to make the file simple (classes and keyframes only) and without any mistakes

- class selectors and keyframes like `width-100` will become `GeneratedStyles.class['width-100']` or for keyframes `GeneratedStyles.Animations['width-100']`

- you can use angular's `'*'` as a css property value

  
  

## Contributing

  

1. Fork it!

2. Create your feature branch: `git checkout -b my-new-feature`

3. Commit your changes: `git commit -am 'Add some feature'`

4. Push to the branch: `git push origin my-new-feature`

5. Submit a pull request :D

  

Please read [CONTRIBUTING.md](https://github.com/MoustafaMohsen/css-to-angular-animations-and-styles/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

  
  

## Authors

*  **Moustafa Mohsen** - *Initial* - [moustafamohsen.com](moustafamohsen.com)



### Versioning

[SemVer](http://semver.org/)


### License

[MIT License](LICENSE.md)


---

[NPM page](https://www.npmjs.com/package/css-angular)

[Moustafa Mohsen](moustafamohsen.com)

  
  

[![HitCount](http://hits.dwyl.io/moustafamohsen/css-to-angular-animations-and-styles.svg)](http://hits.dwyl.io/moustafamohsen/css-to-angular-animations-and-styles)