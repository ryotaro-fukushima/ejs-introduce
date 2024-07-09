## Gulp Template Setup Instructions

このドキュメントでは、Gulpを使用してプロジェクトのセットアップから実行までの手順を説明します。このテンプレートを使用することで、EJSやSASSのコンパイル、および開発サーバーの立ち上げが自動化されます。

### 初期セットアップ

まず、プロジェクトのリポジトリをクローンします。

```bash
git clone [リポジトリURL]
```

次に、クローンしたディレクトリに移動します。

```bash
cd [クローンしたディレクトリのパス]
```

### プロジェクトの構成

プロジェクトの必要なディレクトリとファイルを作成するには、以下のコマンドを実行します。

```bash
gulp setup
```

このコマンドは、JavaScript、SASSのソースファイル用のディレクトリや、必要なHTMLとEJSテンプレートなどを自動的に生成します。

### プロジェクトのビルドとサーバーの起動

プロジェクトのビルドとローカル開発サーバーの起動を行います。これには、EJSとSASSファイルのコンパイルが含まれ、生成されたファイルは `dist` ディレクトリに配置されます。

```bash
gulp
```

このコマンドは、設定されたタスクを実行して、ファイルの変更を監視し続けます。また、BrowserSyncを通じて、ファイルの変更があるたびにブラウザを自動的にリロードします。

### 終了方法

開発が完了し、サーバーを停止する場合は、ターミナルで `Ctrl + C` を押すことでプロセスを終了できます。
