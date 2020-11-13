/**
 * 该文件定义一些常用的常量
 */

export const error_codes = {
  //通用性错误 ：'错误代码':'英文描述'
  10101: '未知错误', //未知错误导致请求接口失败（可能是参数缺失等问题）
  10102: '你尚未登录', //你尚未登录
  10103: '没有权限', //权限不够

  //用户类错误
  10201: 'Username has exist', //用户名已经存在
  10202: 'The email has exist', //注册邮箱已经存在
  10204: 'Username or password is wrong', //用户名或者密码错误
  10205: 'Wrong mobile format', //错误的手机号码格式
  10206: 'captcha wrong or expired', //验证码错误或者过期
  10207: ' There is no such name', //该昵称不存在
  10208: ' 密码错误',
  10209: ' 该用户不存在或者尚未注册',
  10210: ' Username or password is wrong', //用户名或者密码错误，并且输入错误次数过多

  //项目类错误
  10301: '没有项目访问权限',
  10302: '没有项目管理权限',
  10303: '不是项目创建者',
  10304: '个性域名已经存在',
  10305: '个性域名只能是字母或数字的组合',
  10306: 'api_key 或 api_token 不匹配',
  10307: ' password is wrong', //输入项目密码错误
  10308: ' password is wrong', //输入项目密码错误，并且输入错误次数过多
};

export const jwtSecret = 'missmeow';