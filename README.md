# showdoc.js

## Description

[showdoc](https://github.com/star7th/showdoc) 服务器 `Node.js` 版本，使用 [Nest](https://github.com/nestjs/nest) 框架开发。

当前对应的 `showdoc` 版本为 [2.8.7](https://github.com/star7th/showdoc/releases/tag/v2.8.7)。

## Notice

### sqlite3

关于使用 `sqlite3` 的库问题，这里使用的是 [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3), 但由于这个库安装时需要进行编译，可能需要安装对应平台的开发套件，如果之前没有安装过并且嫌麻烦的话，可以替换使用性能没那么强的 [sqlite3](https://github.com/mapbox/node-sqlite3)。

```bash
# 操作命令
$ npm uninstall better-sqlite3
$ npm install sqlite3 --save
```

```ts
// app.module.ts 中修改使用的类型
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: '../sqlite/showdoc.db.php'
})
```

## Installation

```bash
# install
$ npm install
```

## Running the app

before running, please copy and rename file `sqlite/showdoc.db.default.php` to `sqlite/showdoc.db.php`.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 踩过的坑

1. 拦截器不能获取装饰器修改过的 statusCode，如 @HttpCode 和 @Redirect 。 <https://github.com/nestjs/nest/issues/1342>

2. 如果控制器中使用 @Res 参数，那么必须要在控制器里面调用 res.send，否则会没有返回。
