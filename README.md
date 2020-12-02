# showdoc.js

## Description

For leaning [Nest](https://github.com/nestjs/nest) framework, I just decide to rewrite the [showdoc](https://github.com/star7th/showdoc) server api. So this is same as original but in different development language.

The version of [showdoc](https://github.com/star7th/showdoc) correspond to this repository is [2.8.7](https://github.com/star7th/showdoc/releases/tag/v2.8.7). If you want to run the web, please copy the [web](https://github.com/star7th/showdoc/tree/v2.8.7/web) directory from [showdoc](https://github.com/star7th/showdoc/tree/v2.8.7) to the same directory where you've cloned this repository.

By the way, not all functions will be implemented.

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

## TODO

please search 'todo' for more TODOs.

以下为空接口，待后面再补充，也可能不会做。

1. /api/ScriptCron/run 由网站前台脚本触发的周期任务

2. /api/update/checkDb 检测更新数据库

3. api/adminUser/checkUpdate 检查 showdoc 的更新

## 踩过的坑

1. 拦截器不能获取装饰器修改过的 statusCode，如 @HttpCode 和 @Redirect 。[看这里](https://github.com/nestjs/nest/issues/1342)。

2. 如果控制器中使用 @Res 参数，那么必须要在控制器里面调用 res.send，否则会没有返回。ps: 最新版本有个 `passthrough` 参数可以解决这个问题，[看这里](https://docs.nestjs.com/controllers#library-specific-approach)。
