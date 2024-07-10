'use strict';

// ----------------------------------------
// Packages
// ----------------------------------------
import gulp from 'gulp';
import fs from 'fs';
import path from 'path';
import plumber from 'gulp-plumber';
import ejs from 'gulp-ejs';
import rename from 'gulp-rename';
import sass from 'gulp-dart-sass';
import autoprefixer from 'gulp-autoprefixer';
import prettify from 'gulp-prettify'; 
import convertEncoding from 'gulp-convert-encoding';
import sourcemaps from 'gulp-sourcemaps';
// import concat from 'gulp-concat';
// import uglify from 'gulp-uglify';
import browserSync from 'browser-sync';


// ----------------------------------------
// Settings
// ----------------------------------------
const paths = {
    root: {
        src: 'src/',
        dest: 'dist/'
    },
    html: {
        src: 'src/resources/',
        dest: 'dist/',
        views: 'src/resources/views/'
    },
    styles: {
        src: 'src/assets/sass/',
        dest: 'dist/public/css/',
        map: './maps'
    },
    scripts: {
        src: 'src/assets/js/',
        dest: 'dist/public/js/',
        map: './maps'
    },
    images: {
        // imageファイルはdist/public/images/に直接配置すること
        // src: 'src/assets/images/**/*.{jpg,jpeg,png,svg,gif}',
        srcDir: 'src/assets/images/',
        dest: 'dist/public/images/'
    }
}

const htmlOptions = {
    indent_size: 2,
    indent_with_tabs: false,
}

// エラーハンドリングのための関数
function handleError(err) {
    console.error(err.toString());
    this.emit('end');
}


// ----------------------------------------
// 初回のみのSettings コマンド：gulp setup
// ----------------------------------------

// ディレクトリとファイルを作成する関数
function createFile(dir, fileName, contents) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });  // ディレクトリがなければ作成
  }
  fs.writeFileSync(path.join(dir, fileName), contents);  // ファイル作成
}

// 'setup'タスク: ディレクトリと基本ファイルの作成
function setup(done) {
  // JavaScriptとCSS
  createFile(paths.scripts.src, 'main.js', '// JavaScript entry point');
  createFile(paths.scripts.src, 'home.js', '// Home page JavaScript');
  createFile(paths.styles.src, 'app.scss', '// Sass entry point');
  createFile(paths.styles.src, 'base.scss', '// Base styles');
  
  // ビュー、モジュール、コモンのHTMLとEJS設定
  const indexContent = `
  <%
    const page = {
        bodyClass: 'home',
    }
  %>
  <%- include('../common/_head', {page: page}) %> 
  <%- include('../common/_header', {page: page}) %> 
  <main>
    Hello World
  </main>
  <%- include('../common/_footer', {page: page}) %>
`;

  const headContent = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WordPressで動的に入れる</title>
        <link rel="stylesheet" href="./public/css/base.css">
        <link rel="stylesheet" href="./public/css/app.css">
    </head>

    <% if(page.bodyClass == 'home'){ _%>
    <body class="<%= page.bodyClass %>">
    <% } else { _%>
    <body>
    <% } _%>
  `;

  const headerContent = `
    <header>
        <h1>Header</h1>
    </header>
    `;

  const footerContent = `
    <footer>
        <p>&copy; 9999</p>
    </footer>

    <script src="./public/js/main.js"></script>
    <% if(page.bodyClass == 'home'){ _%>
    <script src="./public/js/home.js"></script>
    <% } _%>
    </body>
    </html>
    `;

  createFile(path.join(paths.html.src, 'views'), 'index.ejs', indexContent);
  createFile(path.join(paths.html.src, 'common'), '_head.ejs', headContent);
  createFile(path.join(paths.html.src, 'common'), '_header.ejs', headerContent);
  createFile(path.join(paths.html.src, 'common'), '_footer.ejs', footerContent);
  createFile(path.join(paths.html.src, 'modules'), '_mainVisual.ejs', '<div></div>');

// dist/public/images ディレクトリの作成 imageファイルはここで直接配置する
  createFile(paths.images.dest, 'dummy.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>');

  done(); // タスク完了をGulpに通知
}


// ----------------------------------------
// Ejs Task
// ----------------------------------------
function ejsTask() {
  return gulp.src([paths.html.views + '**/*.ejs', '!' + paths.html.views + '**/_*.ejs']) 
    .pipe(plumber({ errorHandler: handleError })) // エラーハンドリング
    .pipe(ejs()) // EJSをHTMLに変換
    .pipe(prettify(htmlOptions)) // HTMLを整形
    .pipe(convertEncoding({ to: 'utf-8' })) // 出力をUTF-8に変換
    .pipe(rename({ extname: '.html' })) // 出力ファイルの拡張子を.htmlに変更
    .pipe(gulp.dest(paths.html.dest)); // コンパイルされたHTMLを出力
}


// ----------------------------------------
// SASS Task
// ----------------------------------------
function sassTask() {
  return gulp.src(paths.styles.src + '**/*.scss')
    .pipe(sourcemaps.init()) // ソースマップの初期化を最初に行う
    .pipe(plumber({ errorHandler: handleError })) // エラーハンドリング
    .pipe(sass().on('error', sass.logError)) // SassをCSSにコンパイルし、エラーをログに出力
    .pipe(autoprefixer()) // ベンダープレフィックスの追加
    .pipe(sourcemaps.write(paths.styles.map)) // ソースマップを外部ファイルとして保存
    .pipe(gulp.dest(paths.styles.dest)); // コンパイルされたCSSを出力
}


// ----------------------------------------
// Javascript Task
// ----------------------------------------
function scriptsTask() {
  return gulp.src(paths.scripts.src + '**/*.js')
    .pipe(sourcemaps.init()) // ソースマップの初期化
    .pipe(plumber({ errorHandler: handleError })) // エラーハンドリング
    .pipe(sourcemaps.write(paths.scripts.map)) // ソースマップを外部ファイルとして保存
    .pipe(gulp.dest(paths.scripts.dest)) // コンパイルされたJSを出力

    // 以下のコードをコメントアウト/有効化して、必要に応じてミニファイする
    // jQueryなどのミニファイ済みファイルが含まれている場合は不要
    /*
    .pipe(concat('main.js')) // ファイルの結合
    .pipe(gulp.dest(paths.scripts.dest)) // 出力先ディレクトリに書き込み

    .pipe(uglify()) // ミニファイ
    .pipe(rename({ extname: '.min.js' })) // ファイル名の変更
    .pipe(gulp.dest(paths.scripts.dest)); // 出力先ディレクトリに再度書き込み
    */
}


// ----------------------------------------
// Browser Sync
// ----------------------------------------

const browserSyncOption = {
    port: 8000,
    server: {
        baseDir: paths.root.dest
    },
    directory: false,
    reloadOnRestart: true
};

function sync(done) {
    browserSync.init(browserSyncOption);
    done();
}

// reload処理
const browserReload = (done) => {
    browserSync.reload();
    done();
};

// ファイルの変更を監視するタスク
function watchFiles() {
    gulp.watch(paths.styles.src, gulp.series(sassTask, browserReload));
    gulp.watch(paths.scripts.src, gulp.series(scriptsTask, browserReload));
    gulp.watch(paths.html.src, gulp.series(ejsTask, browserReload));
}


// ----------------------------------------
// Task
// ----------------------------------------

// デフォルトタスク
const defaultTask = gulp.series(
    gulp.parallel(ejsTask, sassTask, scriptsTask),
    sync,
    watchFiles
);

export { setup, defaultTask as default };
