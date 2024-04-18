import colors from 'ansi-colors';
import { docToArchieML } from '@newswire/doc-to-archieml';
import fs from 'fs-extra';
import { google } from 'googleapis';
import gulp from 'gulp';
import path from 'path';
import { sheetToData } from '@newswire/sheet-to-data';

// eslint-disable-next-line no-sync
const config = fs.readJsonSync('./project.config.json');

async function getData() {
  const auth = await google.auth.getClient({
    scopes: [
      'https://www.googleapis.com/auth/documents.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly'
    ]
  });

  const { files } = config;
  for (const file of files) {
    const filepath = path.join('src/_data', `${file.name}.json`);

    let data;
    let color;

    switch (file.type) {
      case 'doc':
        // eslint-disable-next-line no-await-in-loop
        data = await docToArchieML({
          documentId: file.fileId,
          auth
        });
        color = 'magenta';
        break;
      case 'sheet':
        // eslint-disable-next-line no-await-in-loop
        data = await sheetToData({
          spreadsheetId: file.fileId,
          auth
        });
        color = 'cyan';
        break;
      default:
        throw new Error(
          `No data fetching method found for type '${file.type}'`
        );
    }

    // eslint-disable-next-line no-await-in-loop
    await fs.outputJson(filepath, data, {
      spaces: 2
    });

    logDownload(file.name, file.fileId, color);
  }
}

function logDownload(fileName, fileId, color) {
  console.log(colors[color](`Downloaded \`${fileName}\` (${fileId})`));
}

function fetch(resolve) {
  getData();
  resolve();
}

gulp.task('fetch', fetch);

export default fetch;
