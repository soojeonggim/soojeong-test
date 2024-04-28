import * as journalize from 'journalize';
import browserSync from 'browser-sync';
import fs from 'fs-extra';
import gulp from 'gulp';
import gulpData from 'gulp-data';
import isValidGlob from 'is-valid-glob';
import nunjucksRender from 'gulp-nunjucks-render';
import rename from 'gulp-rename';

const config = fs.readJsonSync('./project.config.json');

function bake(resolve) {
  const dataDir = 'src/_data/';

  function manageEnv(env) {
    for (const k in config) {
      if (config.hasOwnProperty(k)) {
        env.addGlobal(k, config[k]);
      }
    }

    fs.readdir(dataDir, (err, files) => {
      if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
      }

      files.forEach((file) => {
        if (file.endsWith('json')) {
          const key = file.split('.json')[0];
          const fileContents = fs.readFileSync(dataDir + file);
          const value = JSON.parse(fileContents);
          env.addGlobal(key, value);
        }
      });
    });

    for (const key in journalize) {
      const func = journalize[key];
      if (typeof func === 'function') {
        env.addFilter(key, func);
      }
    }
  }

  if (!config.to_bake) {
    resolve();
    return;
  }

  config.to_bake.forEach((bake) => {
    if (!bake.template || !bake.slug || bake.path === null) {
      throw new Error('Configuration error: Missing required bake configuration.');
    }

    const fileContents = fs.readFileSync(`${dataDir}${bake.data}.json`);
    let data = JSON.parse(fileContents);

    if (typeof data === 'object') {
      data = data[bake.array];
    }
    if (!data) {
      throw new Error(`Data array '${bake.array}' is undefined.`);
    }

    data.forEach((d) => {
      if (!d.title) {
        console.error('Missing title for generating slug:', d);
        return; // Skip this item or handle it appropriately
      }
      d.slug = generateSlug(d.title); // Generate slug from title

      if (!isValidGlob(`docs/${bake.path}/${d.slug}.html`)) {
        throw new Error(`Invalid glob pattern for: docs/${bake.path}/${d.slug}.html`);
      }

      gulp.src(`src/_templates/${bake.template}.njk`)
        .pipe(gulpData(() => d))
        .pipe(nunjucksRender({
          path: ['src/_templates'],
          manageEnv: manageEnv
        }))
        .pipe(rename({
          basename: d.slug,
          extname: '.html'
        }))
        .pipe(gulp.dest(`docs/${bake.path}`))
        .pipe(browserSync.stream());
    });
  });

  resolve();
}

function generateSlug(title) {
  return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

gulp.task('bake', bake);

export default bake;
