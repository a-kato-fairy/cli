'use strict';

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');

let cacheConf;

module.exports.confFile = path.resolve('') + '/a5doc.yml';

const erdLabelType = {
  // 物理名
  PHYSICAL: 'physical',
  // 論理名
  LOGICAL: 'logical',
  // 物理名 + 論理名
  BOTH: 'both',
};
module.exports.erdLabelType = erdLabelType;
       
const erdColumnType = {
  // 全カラムを表示
  ALL: 'all',
  // PKのみ
  PK: 'pk',
  // PKとUKのみ
  PK_UK: 'pk+uk',
  // カラムなし
  NO: 'no',
};
module.exports.erdColumnType = erdColumnType;

const defaultConf = {
  // ドキュメントのrootディレクトリ
  docroot: '.',
  // ドキュメントのスタイル
  docstyle: 'wiki',
  // 対象ドキュメント
  sidebar: {
    title: '目次',
    // 対象ドキュメント収集モジュール
    indexer: 'dirnameIndexer',
  },
};

module.exports.read = function(confFile) {
  if (confFile) {
    module.exports.confFile = confFile;
  }
  const conf = yaml.safeLoad(fs.readFileSync(module.exports.confFile, 'utf8'));
  module.exports._extend(conf);
  return cacheConf;
}

module.exports.get = function(property) {
  if (!cacheConf) {
    module.exports.read();
  }
  if (!property) {
    return cacheConf;
  }
  if (property === 'mdLink') {
    return cacheConf[property];
  }
}

module.exports._extend = function(options) {
  if (!cacheConf) {
    cacheConf = _.merge({}, defaultConf);
  }
  cacheConf = _.merge(cacheConf, options);
}
