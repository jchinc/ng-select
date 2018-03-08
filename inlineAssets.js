const vinylFs = require('vinyl-fs');
const inlineNg2Template = require('gulp-inline-ng2-template');

vinylFs
    .src(['./src/**/*.ts'])
    .pipe(
        inlineNg2Template({
            base: './src',
            useRelativePaths: true
        })
    )
    .pipe(vinylFs.dest('./tmp/src'));
