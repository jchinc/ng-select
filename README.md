# ng-component-seed
Plantilla para crear y publicar un componente Angular 2+

## tsconfig.json
Archivo para configuración typescript durante el desarrollo. Intellisense, etc...

    ### tsconfig-esm2015.json
    Configuración typescript para compilación EcmaScript 2015.

    ### compilerOptions.rootDir
    Se utiliza para indicar el directorio base donde se considerarán los archivos indicados en "files".

    ### angularCompilerOptions.skipTemplateCodegen
    Evita la creación de los archivos .ngfactory.js y .ngsummary.json

    ### angularCompilerOptions.flatModuleOutFile, angularCompilerOptions.flatModuleId
    Archivo e ID para generar el archivo FESM2015 (archivo que integra todos los módulos en un único archivo)

## ROLLUP
Agrupa los módulos, clases en un sólo archivo. Reconoce formato ES2015 y ES5. Los archivos ya deben venir en el formato deseado y rollup únicamente los agrupa.

    ### rollup external:[]
    Se utiliza para evitar que las librerías externas utilizadas se intenten compilar como parte de la librería. Considerarlos tal cual, como externas.

    ### rollup globals
    Se utiliza para compilación en UMD, para que las referencias las lea del objeto global (window).

## Saber cúal archivo se utilizará para cada plataforma
    "main": "./bundles/ng-message.umd.js",
    "module": "./esm5/ng-message.js",
    "es2015": "./esm2015/ng-message.js",
    "typings": "./ng-message.d.ts",

## Pasos
    "clean": "rm -rf ./dist",
    "build:inline": "mkdir tmp && cp -r *.ts ./tmp && node inlineAssets.js",
    "build:esm2015": "ngc -p tsconfig-esm2015.json",
    "build:fesm2015": "rollup -c rollup-esm2015.conf.js",
    "build:esm5": "ngc -p tsconfig-esm5.json",
    "build:fesm5": "rollup -c rollup-esm5.conf.js",
    "build:umd": "rollup -c rollup-umd.conf.js",
    "build:min": "uglifyjs ./dist/bundles/ng-message.umd.js -c -m -o ./dist/bundles/ng-message.umd.min.js",
    "move:assets": "cp -r ./tmp/esm2015/*.d.ts ./tmp/esm2015/src ./tmp/esm2015/*.json ./package.json README.md ./dist && rm -rf ./tmp"
