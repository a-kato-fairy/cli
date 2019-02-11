a5doc
=====

MDで仕様書を作成することをサポートするためのツールです。

SphinxやGitBookなど、テキストでドキュメントを管理するツールは、すでに、いくつもありますが、それらのツールは、MDファイルをソースとして、htmlやpdfに変換してドキュメントを閲覧しますが、a5docは`MDファイルを作成することをサポートする`ツールです。  

作成されたMDファイルは、githubやgitlabのwikiに、そのままコミットして、wikiで仕様書を参照すること、あるいはテキストエディタで仕様書を読むことを目的にしています。  

a5docは、WEBサーバー機能を持っているわけではなくて、単純にMDファイルの補正と作成をするだけなので、SphinxやGitBookなどの実行になんら影響を与えません。  
普段は、wikiで仕様書を書いて、HTMLで公開するとかPDFでドキュメントを納品するときに、その目的に適したSphinxやGitBookを使うといった、併用が良いと思います。  

* [はじめに](#はじめに)
* [目次の作成](#目次の作成)（_Sidebar.mdとして出力）
* [テーブル定義の作成](#テーブル定義の作成)
* [ER図の作成](#ER図の作成)
* [Swagger.ymlからAPIインターフェース仕様のMDを作成](#Swagger.ymlからAPIインターフェース仕様のMDを作成)
* [PDFで出力](#PDFで出力)
    - [PDFのレイアウト調整に関する補足](#PDFのレイアウト調整に関する補足)
* [文書内のTOCを更新](#文書内のTOCを更新)
* MD仕様書から用語の抽出・・・・・・・・・・・・・未実装
* GLOSSARYの作成・・・・・・・・・・・・・・・・・未実装
* 用語のスペルチェック（リンク切れチェック）・・・未実装
* 章のナンバリング・・・・・・・・・・・・・・・・未実装
* CRUD表の作成・・・・・・・・・・・・・・・・・・未実装

## はじめに

Node.jsが使える状態を前提としています。

### a5docをグローバルにインストールする場合
```bash
# インストール
npm install -g a5doc

# 初期設定
a5doc init
```
初期設定を実行すると、カレントディレクトリに、 `a5doc.yml` が作成されます。  
a5docの設定は、このファイルで行います。

### a5docをローカルにインストールする場合

a5docのインストール
```bash
npm install --save a5doc
```

package.jsonにscriptを追加
```json
{
  ・・・
  "scripts": {
    "a5doc": "a5doc"
  },
  ・・・
}
```

初期設定を実行
```bash
npm run a5doc init
```
`a5doc.yml` が作成されます。  

## 目次の作成

githubやgitlabのwikiでは、_Sidebar.mdに記述された内容が、サイドバーに表示される仕様となっています。
この_Sidebar.mdの作成をツールが行います。

見出しの作成方法は、2つあります。
* ディレクトリ名を目次にする dirnameIndexer を使う 
* 見出しの作成を細かく指定する chapterIndexer を使う  

### dirnameIndexer

シンプルに、ディレクトリ名で目次を作成します。  
目次作成のデフォルトがdirnameIndexerなので、設定なしでも実行できますが、
a5doc.ymlに設定すると以下のようになります。  
```yml
# ドキュメントのルートディレクトリ
docroot: ./example/docs
# _Sidebar作成
sidebar:
  # 対象文書の走査モジュール
  indexer: dirnameIndexer
```
目次作成コマンドを実行します。
```bash
a5doc sidebar
```

### chapterIndexer

見出しの順番を制御したり、目次に表示する内容を制御したい場合は、文書ファイルの走査方法を、指定することができます。

(Step.1)

a5doc.ymlに目次作成方法を設定します。  
```yml
# ドキュメントのルートディレクトリ
docroot: ./example/docs
# _Sidebar作成
sidebar:
  # 対象文書の走査モジュール
  indexer: chapterIndexer

# chapterIndexerの走査方法の設定
chapters:
  - title: Home
    src: home.md
  - title: 設計
    chapters:
      - title: ER図
        dir: 設計/テーブル定義
        src: "**/ER図*.md"
        collapse: true
      - title: テーブル定義
        dir: 設計/テーブル定義
        src:
          - "**/*.md"
          - "!**/ER図*.md"
        collapse: false
```

(Step.2)

a5doc.ymlに設定を追加したら、以下のコマンドで生成します。

```bash
a5doc sidebar
```

上記のa5doc.ymlで生成した場合の実行結果のサンプルは、[./example/docs/_Sidebar.md](./example/docs/_Sidebar.md)です。

## テーブル定義の作成

MDでテーブル定義を書いてみるとわかるのだが、表が異常に書きづらいです。  
excelで書いた方が、よほど生産的なのだけれど、テキストで管理したいので、テーブル定義のMDは自動生成することにして、テーブル定義に必要な情報をymlで作成します。  
MDのテーブルのフォーマット処理も施されているので、テキストエディタでMDのまま見ても十分に読み取れます。  
リポジトリには、ymlファイルも一緒にコミットしておきます。

(Step.1)

a5doc.ymlにテーブル定義の作成方法を設定します。  
```yml
table:
  src:
    - ./example/.a5doc/table/**/*.yml           # (1) 
  tableMdDir: ./example/docs/設計/テーブル定義  # (2) 
```
* (1) ymlで書いたファイルを指定。複数指定可能。
* (2) 出力先のディレクトリ

(Step.2)

ymlでテーブルの仕様を記述します。

例
```yml
id:          m_account      # (1)
name:        アカウント     # (2)
category:    master         # (3)
description: |              # (4)
  アカウントを管理するテーブル。  
  テーブルの該当に関する説明をここに記述する。この記述自体がMDで書ける。
  * 注意事項１
  * 注意事項２
  * 注意事項３

columns:                    # (5)
  id:                       # (5-1)
    name:          ID       # (5-2)
    type:          long     # (5-3)
    autoIncrement: true     # (5-4)

  login_id:
    name:          ログインID
    type:          varchar
    length:        100

  account_name:
    name:          名前
    type:          varchar
    length:        32
    notNull:       false     # (5-5)
    desc: |
      アカウント名が登録されていないときには、
      ログインIDをアカウント名として使用する

  company_id:
    name:          会社ID
    type:          long

  deleted_at:
    name:          削除日時
    type:          datetime

primary:                     # (6)        
  - id

indexes:                     # (7)
  uk_login_id:               # (7-1)
    type: unique             # (7-2)
    columns:                 # (7-3)
      - login_id
      - deleted_at

foreignKeys:                 # (8)
  fk_dept_company:           # (8-1)
    columns: [company_id]    # (8-2)
    references:              # (8-3)
      tableId: m_company     # (8-3-1)
      columns: [id]          # (8-3-2)
    relationType: 1N:1       # (8-4)

```

* (1) テーブル名（物理名）
* (2) テーブル名（論理名）
* (3) カテゴリ
* (4) 概要（MD記法で記入）
* (5) カラムの仕様
    * (5-1) カラム名（物理名）
    * (5-2) カラム名（論理名）
    * (5-3) 型
    * (5-4) 長さ
    * (5-5) NOT NULL制約 (false=NULL可。デフォルト=true)
* (6) プライマリーキー
* (7) インデックス
    * (7-1) インデックス名
    * (7-2) インデックスのタイプ（uniqueが指定可能。デフォルト=非unique）
    * (7-3) カラム名
* (8) 外部キー
    * (8-1) 外部キー名
    * (8-2) カラム名
    * (8-3) 参照先
        * (8-3-1) テーブル名
        * (8-3-2) カラム名
    * (8-4) 関係  
        以下のような書き方が出来ます。左右を逆にしても大丈夫です。
        * 1:1  ……… 1 対 1
        * 1:01 ……… 1 対 0 or 1
        * 1:N  ……… 1 対 多
        * 1:0N ……… 1 対 0 or 多
        * 1:1N ……… 1 対 1 or 多

(Step.3)

以下のコマンドで、テーブル定義のMDを作成します。  
```
a5doc table
```

自動生成されたMDの出力サンプルは、[example/docs/設計/テーブル定義/アカウント.md](example/docs/設計/テーブル定義/アカウント.md)にあります。

## ER図の作成

PlantUMLで記述されたER図を作成します。  
テーブル定義のymlの中で、FKの定義を書いておくと、それを読み取って、ER図のMDファイルを作成します。  
テーブル数が多すぎると、PlantUMLがうまくレイアウトしてくれないこともあるので、いくつかのグループに分けて、ER図を作成するとよいと思います。

(Step.1)

a5doc.ymlにER図の作成方法を設定します。  
```yml
table:
  erd:
    - id: ER-001
      docTitle: ER図（全体）
      description: システム全体のER図
      path: ./example/docs/設計/テーブル定義/ER図-全体.md
      # 表示するテキスト形式
      # logical=論理名 | physical=物理名 | both=物理名+論理名
      labelType: logical
      # 作図するテーブルを指定
      entityPatterns: 
        # id=テーブルIDの正規表現
        # columnType=表示するカラムタイプ
        # all=全カラムを表示 | no=カラムなし | pk=PKのみ | pk+uk=PKとUKのみ
        - id: .*
          columnType: no

    - id: ER-002
      docTitle: ER図（顧客）
      description: 顧客を中心にしたER図
      path: ./example/docs/設計/テーブル定義/ER図-顧客.md
      labelType: physical
      entityPatterns: 
        - id: m_account.*
          columnType: pk
        - id: m_customer
          columnType: all

    - id: ER-003
      docTitle: ER図（アカウント）
      description: アカウント周辺のER図
      path: ./example/docs/設計/テーブル定義/ER図-アカウント.md
      labelType: both
      entityPatterns: 
        - id: m_account.*
          columnType: all
```

(Step.2)

以下のコマンドで、テーブル定義のMDを作成します。  
```
a5doc erd
```

自動生成されたMDの出力サンプルは、[example/docs/設計/テーブル定義/ER図-全体.md](example/docs/設計/テーブル定義/ER図-全体.md)、[ER図-顧客.md](example/docs/設計/テーブル定義/ER図-顧客.md)、[ER図-アカウント.md](example/docs/設計/テーブル定義/ER図-アカウント.md)を参照してください。

## Swagger.ymlからAPIインターフェース仕様のMDを作成

APIのインターフェース仕様を記述するのも、テーブル定義と同じように、ymlで書いてMDに変換します。  
この場合のymlの書式は、Swagger Specで、MDへの変換は、[swagger-markdown](https://www.npmjs.com/package/swagger-markdown) を使います。  

* swagger.ymlの分割とマージ  
    swagger.ymlは1つのファイルに記述することになっていますが、APIの数が多くなってくると編集しづらいので、ymlを分割して記述できるようになっています。  

    例えば、ユーザーデータに関係したAPIは、`ユーザー.yml`に書いて、注文処理に関するAPIは、`注文.yml`と書いておくと、MDも`ユーザー.md`と`注文.md`の2つが作成されます。MDとして閲覧するときにも、自分好みに整理することができます。  

    そして、単純なマージ処理でしかありませんが、分割されたymlを1つのswagger.yml(swagger.json)として出力することも可能です。  

* 共通定義となるcommon.yml  
    実際に、いくつかのymlを書いてみると、気になるのが、重複した記述です。  
    VSCodeなどのエディタを使うと、swagger.ymlの構文チェックをしてくれるので、分割されたymlも、それ単独でswagger specとして正しい状態にしておきたいですが、そうすると、複数のymlで重複した定義をすることになります。  
    この状態を緩和する機能として、common.ymlに共通部分を外だしすることができるようにしています。

(Step.1)

a5doc.ymlにswaggerからのMD作成方法を設定します。  
```yml
swagger:
  src:                         # (1)
    - 設計/API/**/*.yml
    - "!設計/API/swagger.yml"
    - "!設計/API/common.yml"
  dst: 設計/API                # (2)
  common: 設計/API/common.yml  # (3)
  merge:                       # (4)
    - 設計/API/swagger.yml
    - 設計/API/swagger.json
```
* (1) 分割されたswagger specのymlの検索パターン  
    同じディレクトリに swagger.yml を出力する場合は、`!`で除外しておく。  
    同じく、共通定義のcommon.yml も md出力対象ではないので、`!`で除外しておく。
* (2) mdの出力先ディレクトリ  
* (3) 共通定義のyml  
* (4) 1つにマージしたswagger specの出力指定  
    ymlとjsonの出力指定が可能。

(Step.2)

以下のコマンドで、テーブル定義のMDを作成します。  
```
a5doc swagger
```

## PDFを出力

GitBookの機能を使って、PDFを出力します。  
gitbookの実行は、dockerコンテナで実行していますので、あらかじめ、docker-composeが実行できる環境を準備してください。  
wikiを運営していくうちに、設計書では記事も多数含まれるようになります。  
wikiとしてみるときと、pdfで出力するときの見出し（目次）は別々にしたいこともあるでしょう。
その場合には、sidebarを作成したときとは、別の chapterIndexer を指定することができます。

(Step.1)

PDF専用の目次を設定します。
```
# PDF作成
gitbook:
  indexer: chapterIndexer
  $chaptersRef: pdfChapters

pdfChapters:
  - title: 設計
    dir: 設計
    src: "**/*.md"
```

(Step.2)

以下のコマンドで、gitbook用の初期設定および目次ページを作成します。  
```
a5doc gitbook
```
`.gitbook` フォルダの中に、gitbookを実行するための最小構成の設定ファイルが作成されます。  
`.gitbook/book.json`を開いて、 title と author を変更してください。

(Step.3)

以下のコマンドで、PDFを出力します。  
```
npm run pdf
```
`.gitbook/book.pdf` にPDFが作成ています。

2回目以降のPDF出力は、目次の更新が必要ない場合は、 `npm run pdf` だけの実行で大丈夫です。  
目次の更新をする場合は、 `a5doc gitbook` を実行してください。（book.jsonは上書きされません）

### PDFのレイアウト調整に関する補足

※PDFのレイアウトを変更する必要がない場合は、読み飛ばして問題ありません。  
gitbookはテンプレート化されていて、プラグインでテーマを変更することができます。デフォルトのテーマは、こちら<https://github.com/GitbookIO/theme-default>が使われています。  
他のテーマを探して、npm で install するもよし、あるいは、デフォルトのテーマの _layout をコピーして、そのファイルを編集することでも、調整可能です。ちょっとだけ変更するなら、こっちの方が、良いかもしれません。 

(Step.1)  

デフォルトテーマを持ってきて、ドキュメントのディレクトリにコピーします。
```bash
# cloneして、_layoutをコピーします
mkdir tmp
cd tmp
git clone https://github.com/GitbookIO/theme-default.git .
cp -r _layout ${MY_PROJECT_DOCROOT}

# _layout以外は不要なので削除します
cd ..
rm -rf tmp

# PDF作成にしかgitbookを使わない場合は、ebookフォルダ以外は不要なので削除します。
cd ${MY_PROJECT_DOCROOT}/_layout
rm -rf website layout.html
```
※ ${MY_PROJECT_DOCROOT}は、自分のプロジェクトのドキュメントのルートディレクトリを指しています。  

(Step.2)

目次ページを変更する場合のポイントについて、説明します。  
修正するファイルは、`_layout/ebook/summary.html`です。  
例えば、ページ番号を出力しないようにする場合は、以下のとおりです。
```twig
{% extends "./page.html" %}

{% block title %}{{ "SUMMARY"|t }}{% endblock %}

{% macro articles(_articles) %}
    {% for article in _articles %}
        <li>
            <!--
             (ポイント1)
             ここで style="border: none;" にすると下線が無くなります。
            -->
            <span class="inner" style="border: none;">
                {% if article.path or article.url %}
                    {% if article.path %}
                        <a href="{{ article.path|contentURL }}{{ article.anchor }}">{{ article.title }}</a>
                    {% else %}
                        <a target="_blank" href="{{ article.url }}">{{ article.title }}</a>
                    {% endif %}
                {% else %}
                    <span>{{ article.title }}</span>
                {% endif %}
                <!--
                 (ポイント2)
                 if 0 にしてページ番号の出力が実行されないようにします
                -->
                {% if 0 %}
                <span class="page">{{ article.level }}</span>
                {% endif %}
            </span>
            {% if article.articles.length > 0 %}
            <ol>
                {{ articles(article.articles) }}
            </ol>
            {% endif %}
        </li>
    {% endfor %}
{% endmacro %}

・・・

```

(Step.3)

ヘッダーを変更する場合のポイントについて、説明します。  
修正するファイルは、`_layout/ebook/pdf_header.html`です。  
例えば、ページ番号を右端に出力させてみます。  
gitbookのテンプレートで使える変数については、以下を参照してください。
<https://toolchain.gitbook.com/templating/variables.html>  

```twig
{% extends "./page.html" %}

{% block body %}
<div class="pdf-header">
    <span>{{ page.title }}</span>
    <!-- (ポイント) 以下を追加します -->
    <span style="float: right;">Page {{ page.num }}</span>
</div>
{% endblock %}
```

(Step.4)

フッターを変更する場合のポイントについて、説明します。  
修正するファイルは、`_layout/ebook/pdf_footer.html`です。  
例えば、左端に著者を出力させてみます。  

```twig
{% extends "./page.html" %}

{% block body %}
<div class="pdf-footer">
    <!-- (ポイント) 以下を追加します -->
    <span>{{ config.title }}</span>
    <span class="footer-pages-count">{{ page.num }}</span>
</div>
{% endblock %}
```

(Step.5)

SUMMARYの書き方について、補足します。  
page.titleには、SUMMARY.mdに書いたリンクテキストが入っています。  
例えば、以下のようなリンクが書かれているとします。
```md
# Summary

* 設計  
    - ER図  
        - [アカウント](設計/テーブル定義/ER図-アカウント.md)  
```
この場合、リンクテキストが、"アカウント"なので、`ER図-アカウント.md`の文書の`page.title`には"アカウント"が入ります。  
ファイル名でも、文書内の最初の見出しでもありません。  

ちなみに、文書内に front-matter を書き込むこともできます。  
front-matterで定義された変数は、 `page.xxx` で参照することができます。  
ただし、残念ながらヘッダーとフッターには展開されません。

それから、もう1つ、ハマりそうな事として、リンクテキストを章を跨いで同じ文字列で使ってしまうと、2つ目以降の文書のヘッダーやフッターで2重に出力されてしまいます。（おそらくebookコンバーターのバグだと思います）  
以下のような場合に、このバグに遭遇します。
```md
# Summary

* 設計  
    - ER図  
        - [アカウント](設計/テーブル定義/ER図-アカウント.md)  
    - テーブル定義  
        - [アカウント](設計/テーブル定義/アカウント.md)  
```
ER図とテーブル定義の別々の章に"アカウント"があります。  
こうなっていると、テーブル定義の方のアカウントのページのヘッダーでpage.titleが使われていると、"アカウントアカウント"と2重に出力されます。  
今のところ、対応方法は、 "リンクテキストを重複しないようにする" です。

## 文書内のTOCを更新

markdownには、目次の表示機能はありません。  
wikiで文書先頭に文書内の見出しで目次が欲しい場合には、自力でリンクを配置する必要があります。  
そして、目次のメンテナンスは、よく忘れてしまうので、一括で目次更新するコマンドを用意しました。  

(Step.1)

目次を配置したい文書内に、拡張タグ<toc>を埋め込みます。
※<toc>タグは、markdown的に及びhtml的にも意味のないタグなので、副作用はありません。

例： test.md
```md
<toc>       <!-- このような感じで、中身は空で大丈夫です -->
</toc>      <!-- 開始タグと終了タグの両方とも行頭から記述してください -->

## 索引 1
・・・
・・・
### 1.1. 見出し A
・・・
・・・
#### 1.1.1. 小見出し
・・・
・・・
## 索引 2
・・・
・・・
```

(Step.2)

以下のコマンドで、<toc>タグ内に、索引が作成されます。
```
a5doc toc
```

例： 実行後の test.md 
```md
<toc>

- [索引 1](#索引-1)
  - [1.1. 見出し A](#1.1.-見出し-A)
- [索引 2](#索引-2)

</toc>

## 索引 1
・・・
・・・
### 1.1. 見出し A
・・・
・・・
#### 1.1.1. 小見出し
・・・
・・・
## 索引 2
・・・
・・・
```

(Step.3)

`<toc>`のオプションです。
* **src**
    外部のファイルを見出しとして検索します。検出されたファイルは、さらに文書内の見出し抽出を行って、目次に展開されます。
* **depth**
    目次に出力するレベルをmd内の見出しレベルで指定します。  
    1から始まる数値です。  
    "# 見出し" の場合は、depth=1 で、 "### 見出し" の場合は、depth=3 です。
    指定しない場合は、全部出力されます。  
* **level**
    目次に出力する階層レベルを0から始まる数値で指定します。指定しない場合は、全部出力されます。  
    文書内の最小depthを0として数えます。以下の例では、最小depth=2なのでlevelは0～2となります。
    ```md
    ## 大見出し・・・・・・・・・・・・level=0, depth=2
    ### 中見出し・・・・・・・・・・・・level=1, depth=3
    #### 小見出し・・・・・・・・・・・・level=2, depth=4
    ```

例
```md
<toc src="./設計/**/*.md" level="1" depth="3">
</toc>
```
