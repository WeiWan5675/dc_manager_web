import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/bigdata/dw/dwSchemaInfo',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/bigdata/dw/dwSchemaInfo/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/bigdata/dw/dwSchemaInfo',
    method: 'put',
    data
  })
}

export default { add, edit, del }
export function updateTables(data) {
  console.log(data)
  return request({
    url: 'api/bigdata/dw/dwSchemaInfo/updateTables',
    method: 'get',
    params: data
  })
}
