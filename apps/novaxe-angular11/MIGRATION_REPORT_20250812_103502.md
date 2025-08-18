# Novaxe SEB Angular 15 Migration

Date: Tue 12 Aug 2025 10:36:23 MDT

## Versions

     _                      _                 ____ _     ___
    / \   _ __   __ _ _   _| | __ _ _ __     / ___| |   |_ _|
   / △ \ | '_ \ / _` | | | | |/ _` | '__|   | |   | |    | |
  / ___ \| | | | (_| | |_| | | (_| | |      | |___| |___ | |
 /_/   \_\_| |_|\__, |\__,_|_|\__,_|_|       \____|_____|___|
                |___/
    

Angular CLI: 15.2.11
Node: 20.19.0 (Unsupported)
Package Manager: npm 10.8.2
OS: darwin arm64

Angular: 15.2.10
... animations, common, compiler, compiler-cli, core, forms
... language-service, platform-browser, platform-browser-dynamic
... router

Package                         Version
---------------------------------------------------------
@angular-devkit/architect       0.1502.11
@angular-devkit/build-angular   15.2.11
@angular-devkit/core            15.2.11
@angular-devkit/schematics      15.2.11
@angular/cli                    15.2.11
@angular/youtube-player         10.2.7
@schematics/angular             15.2.11
rxjs                            6.6.7
typescript                      4.9.5
    

## Angular Core Tree
fakebook@0.0.0 /Users/markvandendool/HarmonicOracle GitHub/Novaxe SEB
├─┬ @angular/animations@15.2.10
│ └── @angular/core@15.2.10 deduped
├─┬ @angular/common@15.2.10
│ └── @angular/core@15.2.10 deduped
├─┬ @angular/compiler@15.2.10
│ └── @angular/core@15.2.10 deduped
├── @angular/core@15.2.10
├─┬ @angular/forms@15.2.10
│ └── @angular/core@15.2.10 deduped
├─┬ @angular/platform-browser-dynamic@15.2.10
│ └── @angular/core@15.2.10 deduped
├─┬ @angular/platform-browser@15.2.10
│ └── @angular/core@15.2.10 deduped
├─┬ @angular/router@15.2.10
│ └── @angular/core@15.2.10 deduped
├─┬ @angular/youtube-player@10.2.7
│ └── @angular/core@15.2.10 deduped invalid: "^10.0.0 || ^11.0.0-0" from node_modules/@angular/youtube-player
├─┬ codelyzer@5.2.2
│ └── @angular/core@15.2.10 deduped invalid: "^10.0.0 || ^11.0.0-0" from node_modules/@angular/youtube-player, ">=2.3.1 <10.0.0 || >9.0.0-beta <10.0.0 || >9.1.0-beta <10.0.0 || >9.2.0-beta <10.0.0" from node_modules/codelyzer
└─┬ ngx-cookie@5.0.2
  └── @angular/core@15.2.10 deduped invalid: "^10.0.0 || ^11.0.0-0" from node_modules/@angular/youtube-player, ">=2.3.1 <10.0.0 || >9.0.0-beta <10.0.0 || >9.1.0-beta <10.0.0 || >9.2.0-beta <10.0.0" from node_modules/codelyzer


## Current Branch
migration/angular-15

## Changed Files
 M angular.json
 D dist/novaxe/0-es2015.447af09ddfac3fda802e.worker.js
 D dist/novaxe/0-es5.447af09ddfac3fda802e.worker.js
 M dist/novaxe/3rdpartylicenses.txt
 D dist/novaxe/Chord_Grid_v2.55c96933f8f732c75445.otf
 D dist/novaxe/NovaxeSDCTFont.4d23a81731a2b71c34de.otf
 D dist/novaxe/cadre2.2807089d2ee72e4cc964.gif
 D dist/novaxe/fa-brands-400.2285773e6b4b172f07d9.woff
 D dist/novaxe/fa-brands-400.23f19bb08961f37aaf69.eot
 D dist/novaxe/fa-brands-400.2f517e09eb2ca6650ff5.svg
 D dist/novaxe/fa-brands-400.527940b104eb2ea366c8.ttf
 D dist/novaxe/fa-brands-400.d878b0a6a1144760244f.woff2
 D dist/novaxe/fa-regular-400.4689f52cc96215721344.svg
 D dist/novaxe/fa-regular-400.491974d108fe4002b2aa.ttf
 D dist/novaxe/fa-regular-400.77206a6bb316fa0aded5.eot
 D dist/novaxe/fa-regular-400.7a3337626410ca2f4071.woff2
 D dist/novaxe/fa-regular-400.bb58e57c48a3e911f15f.woff
 D dist/novaxe/fa-solid-900.1551f4f60c37af51121f.woff2
 D dist/novaxe/fa-solid-900.7a8b4f130182d19a2d7c.svg
 D dist/novaxe/fa-solid-900.9bbb245e67a133f6e486.eot
 D dist/novaxe/fa-solid-900.be9ee23c0c6390141475.ttf
 D dist/novaxe/fa-solid-900.eeccf4f66002c6f2ba24.woff
 M dist/novaxe/index.html
 D dist/novaxe/main-es2015.f5a6a916557dda4a836f.js
 D dist/novaxe/main-es5.f5a6a916557dda4a836f.js
 D dist/novaxe/main_comma.06c07effa8a371e98456.otf
 D dist/novaxe/nvxFont.9d601971457163bfe236.otf
 D dist/novaxe/polyfills-es2015.4fb7327abfb5faf32641.js
 D dist/novaxe/polyfills-es5.45ce5d79642185d13cc0.js
 D dist/novaxe/runtime-es2015.c164a4bfa1e961cfb630.js
 D dist/novaxe/runtime-es5.c164a4bfa1e961cfb630.js
 D dist/novaxe/scripts.991df11391afa2c74a14.js
 D dist/novaxe/styles.30fe040cff08768f5570.css
 D dist/novaxe/ui-icons_444444_256x240.a4a8691ca395136aee47.png
 D dist/novaxe/ui-icons_555555_256x240.0d6de499db574dd313c1.png
 D dist/novaxe/ui-icons_777620_256x240.e084661154ad58415fa1.png
 D dist/novaxe/ui-icons_777777_256x240.853909d9945e29dd80d5.png
 D dist/novaxe/ui-icons_cc0000_256x240.dc29114100c22b4660e3.png
 D dist/novaxe/ui-icons_ffffff_256x240.1e360be5458b462df279.png
 M tsconfig.json
?? MIGRATION_REPORT_20250812_103502.md
?? dist/novaxe/307.b6d97258d3db5a5a.js
?? dist/novaxe/Chord_Grid_v2.9e9477e4cc83323e.otf
?? dist/novaxe/NovaxeSDCTFont.17e1ae1663747280.otf
?? dist/novaxe/cadre2.5e1704b7d1d6dbc6.gif
?? dist/novaxe/fa-brands-400.0e53fe4feaaacc48.woff
?? dist/novaxe/fa-brands-400.7edea186e9687169.woff2
?? dist/novaxe/fa-brands-400.9c02eaf6eede2776.ttf
?? dist/novaxe/fa-brands-400.a76d53bf993d73a2.svg
?? dist/novaxe/fa-brands-400.b2970adce8797051.eot
?? dist/novaxe/fa-regular-400.04dd5282f2256565.woff
?? dist/novaxe/fa-regular-400.7346017cbe156280.ttf
?? dist/novaxe/fa-regular-400.a0140e7cea6c13f1.eot
?? dist/novaxe/fa-regular-400.e2b3a9dcfb1fca6e.woff2
?? dist/novaxe/fa-regular-400.ee37fbccfd7cfca6.svg
?? dist/novaxe/fa-solid-900.620019ed9d1100b6.woff2
?? dist/novaxe/fa-solid-900.974801a4444657f1.eot
?? dist/novaxe/fa-solid-900.cd7322bf5a6e6fcf.svg
?? dist/novaxe/fa-solid-900.d5b0a3566b352ee9.ttf
?? dist/novaxe/fa-solid-900.e67670b0779338ff.woff
?? dist/novaxe/main.01ef9f67c7534426.js
?? dist/novaxe/main_comma.452c6d9040d0d7ed.otf
?? dist/novaxe/nvxFont.e4e07eff3d88583d.otf
?? dist/novaxe/polyfills.d9a72f45752b4b3d.js
?? dist/novaxe/runtime.e0dc936971715318.js
?? dist/novaxe/scripts.6960116c534b5b7e.js
?? dist/novaxe/styles.9872f0cc61b59c1a.css
?? dist/novaxe/ui-icons_444444_256x240.6cc023e43a8df5f8.png
?? dist/novaxe/ui-icons_555555_256x240.59728d23ea35458b.png
?? dist/novaxe/ui-icons_777620_256x240.a7a212e890d8888e.png
?? dist/novaxe/ui-icons_777777_256x240.9f47befe01e14def.png
?? dist/novaxe/ui-icons_cc0000_256x240.cdf7f103552282df.png
?? dist/novaxe/ui-icons_ffffff_256x240.2afe93ed459124c7.png
?? src/types/
