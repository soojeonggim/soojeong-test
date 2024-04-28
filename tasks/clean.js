import { deleteSync } from 'del';
import gulp from 'gulp';

function clean(resolve) {
  deleteSync(['docs/temp/*']); // Change this path to a specific directory meant for cleaning
  resolve();
}

gulp.task('clean', clean);

export default clean;


// Got help from chat gpt to modify clean.js because whenever I run "gulp", all important files are deleted.