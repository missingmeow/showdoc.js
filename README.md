# showdoc.js

## Description

[showdoc](https://github.com/star7th/showdoc) 服务器 `Node.js` 版本，使用 [Nest](https://github.com/nestjs/nest) 框架开发。

当前对应的 `showdoc` 版本为 [2.8.7](https://github.com/star7th/showdoc/releases/tag/v2.8.7)。

## Installation

```bash
# install
$ npm install
```

## Running the app

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
