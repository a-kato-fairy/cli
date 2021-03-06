#!/usr/bin/env node
'use strict';

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const fs = require('fs-extra');
const path = require('path');

const tableManager = require('./tableManager');
const erdWriter = require('./erdWriter');
const sidebarWriter = require('./sidebarWriter');
const customTagWriter = require('./customTagWriter');
const swaggerWriter = require('./swaggerWriter');
const gitbookSummaryWriter = require('./gitbookSummaryWriter');
const convFMWriter = require('./convFMWriter');
const linkChecker = require('./linkChecker');

const cmd = argv._[0];

try {
  if (cmd === 'init') {
    [
      {src: __dirname+'/../init/a5doc.yml', dst: path.resolve('')+'/a5doc.yml'},
      {src: __dirname+'/../init/_gitignore', dst: path.resolve('')+'/.gitignore'},
    ].forEach((op) => {
      fs.copyFileSync(op.src, op.dst);
    });
  } else if (cmd === 'table') {
    tableManager.writeMdAll();
  } else if (cmd === 'erd') {
    erdWriter.writeAll();
  } else if (cmd === 'swagger') {
    swaggerWriter.writeAll();
  } else if (cmd === 'sidebar') {
    sidebarWriter.write();
  } else if (cmd === 'toc' || cmd === 'breadcrumb') {
    if (argv._[1]) {
      customTagWriter.write(cmd, argv._[1]);
    } else {
      customTagWriter.writeAll(cmd);
    }
  } else if (cmd === 'slug') {
    linkChecker.slug(argv._[1]);
  } else if (cmd === 'link-check' || cmd === 'fix-link') {
    const opt = cmd === 'fix-link' ? {fix: true} : {};
    let result;
    if (argv._[1]) {
      result = linkChecker.check(argv._[1], opt);
    } else {
      result = linkChecker.checkAll(opt);
    }
    if (!result) {
      process.exit(1);
    }
  } else if (cmd === 'alltag') {
    customTagWriter.writeAll();
  } else if (cmd === 'front-matter') {
    convFMWriter.writeAll();
  } else if (cmd === 'gitbook') {
    const gitbookDir = path.resolve('') + '/.gitbook';
    if (!fs.existsSync(gitbookDir)) {
      fs.copySync(__dirname+'/../.gitbook', gitbookDir);
      const bookPath = path.join(gitbookDir, 'book.json');
      const packagePath = path.resolve('') + '/package.json';
      const book = require(bookPath);
      const pkg = require(packagePath);
      book.title = '〇〇設計書';
      book.author = '作成者〇〇';
      book.root = '..';
      fs.writeFileSync(bookPath, JSON.stringify(book, null, 2));
      if (!pkg.scripts.pdf) {
        pkg.scripts.pdf = 'docker-compose -f .gitbook/docker-compose.yml run --rm gitbook build && docker-compose -f .gitbook/docker-compose.yml run --rm gitbook pdf';
        fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
      }
    }
    gitbookSummaryWriter.write();
  } else {
    console.error('不明なコマンドです: ' + cmd);
  }
} catch (err) {
  console.error(err);
}
