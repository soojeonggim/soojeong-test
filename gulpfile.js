import gulp from 'gulp';

// Import tasks
import bake from './tasks/bake.js';
import clean from './tasks/clean.js';
import clear from './tasks/clear.js';
import copy from './tasks/copy.js';
import fetch from './tasks/fetch.js';
import format from './tasks/format.js';
import images from './tasks/images.js';
import lint from './tasks/lint.js';
import nunjucks from './tasks/nunjucks.js';
import scripts from './tasks/scripts.js';
import serve from './tasks/serve.js';
import styles from './tasks/styles.js';

// Define complex tasks
const build = gulp.series(
    gulp.parallel(styles, copy, scripts, images, nunjucks, bake),
    lint,
    format
);

// Default task
gulp.task('default', build);

// Development task
gulp.task('dev', gulp.series(build, serve));

// Individual tasks
gulp.task('clean', clean);
gulp.task('clear', clear);
gulp.task('fetch', fetch);
gulp.task('format', format);
