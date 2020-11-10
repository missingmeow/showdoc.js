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
