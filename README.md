# first-step-backend

First-Stepのバックエンド。AWS SAMを利用してデプロイを行う。

## デプロイ方法
参考：[プロセス DynamoDB イベント](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/serverless-example-ddb.html)

### STEP1: アプリケーションのパッケージ化
``` bash
sam package \
    --template-file template.yaml \
    --output-template-file packaged.yaml \
    --s3-bucket {bucketname}
```

### STEP2: アプリケーションのデプロイ
``` bash
# 2回目以降は　sam deploy だけでいけるっぽい
# {appname}がAPI Gatewayの名前になる
sam deploy \
    --template-file packaged.yaml \
    --stack-name {appname} \
    --capabilities CAPABILITY_IAM \
```

## テンプレートファイルの検証方法
参考：[AWS SAMテンプレートファイルの検証](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/serverless-sam-cli-using-validate.html)  
現在の作業ディレクトリで `template.yaml(/yml)` ファイルを検証できる。

``` bash
sam validate
```
