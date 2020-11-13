import { error_codes } from './const.util';

/**
 * 封装数据成指定结构并返回去
 * @param data
 */
export function sendResult(data: Record<string, unknown>): Record<string, unknown> {
  const result = {};
  if (data['error_code']) {
    result['error_code'] = data['error_code'];
    result['error_message'] = data['error_message'];
  } else {
    result['error_code'] = 0;
    result['data'] = data;
  }
  return result;
}

/**
 * 封装错误信息并返回
 * @param error_code 错误代码
 * @param error_message 错误信息提示
 */
export function sendError(error_code: number, error_message = ''): Record<string, unknown> {
  error_code = error_code ? error_code : 10103;

  if (error_message == '') {
    error_message = error_codes[error_code];
  }
  const result = {};
  result['error_code'] = error_code;
  result['error_message'] = error_message;
  return result;
}
