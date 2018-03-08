export default {
    name: 'ngSelect',
    input: './tmp/esm5/ng-select.js',
    output: {
        file: './dist/bundles/ng-select.umd.js',
        format: 'umd',
        globals: {
            '@angular/core': 'ng.core'
        }
    },
    external: [
        '@angular/core'
    ]
}