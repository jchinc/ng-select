export default {
    name: 'ngSelect',
    input: './tmp/esm5/ng-select.js',
    output: {
        file: './dist/bundles/ng-select.umd.js',
        format: 'umd',
        globals: {
            '@angular/core': 'ng.core',
            '@angular/common': 'ng.common',
            '@angular/forms': 'ng.forms'
        }
    },
    external: [
        '@angular/core',
        '@angular/common',
        '@angular/forms'
    ]
}