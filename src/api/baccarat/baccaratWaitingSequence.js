import { request } from '@/utils/request.js'

/**
 * 表注释 API JS
 */

export default {

  /**
   * 获取表注释分页列表
   * @returns
   */
  getList (params = {}) {
    return request({
      url: 'baccarat/waitingSequence/index',
      method: 'get',
      params
    })
  },

  /**
   * 获取表注释分页列表
   * @returns
   */
  chart (id,params = {}) {

    console.log('请求表单数据：', params);
    return request({
      url: 'baccarat/waitingSequence/chart/' + id,
      method: 'get',
      params
    })
  },


  /**
   * 添加表注释
   * @returns
   */
  save (data = {}) {
    return request({
      url: 'baccarat/waitingSequence/save',
      method: 'post',
      data
    })
  },

  /**
   * 更新表注释数据
   * @returns
   */
  update (id, data = {}) {
    return request({
      url: 'baccarat/waitingSequence/update/' + id,
      method: 'put',
      data
    })
  },

  /**
   * 读取表注释
   * @returns
   */
  read (id) {
    return request({
      url: 'baccarat/waitingSequence/read/' + id,
      method: 'get',
      data
    })
  },

  /**
   * 将表注释删除，有软删除则移动到回收站
   * @returns
   */
  deletes (data) {
    return request({
      url: 'baccarat/waitingSequence/delete',
      method: 'delete',
      data
    })
  },

  /**
   * 从回收站获取表注释数据列表
   * @returns
   */
  getRecycleList (params = {}) {
    return request({
      url: 'baccarat/waitingSequence/recycle',
      method: 'get',
      params
    })
  },

  /**
   * 恢复表注释数据
   * @returns
   */
  recoverys (data) {
    return request({
      url: 'baccarat/waitingSequence/recovery',
      method: 'put',
      data
    })
  },

  /**
   * 真实删除表注释
   * @returns
   */
  realDeletes (data) {
    return request({
      url: 'baccarat/waitingSequence/realDelete',
      method: 'delete',
      data
    })
  },

  /**
   * 更改表注释数据
   * @returns
   */
  changeStatus (data = {}) {
    return request({
      url: 'baccarat/waitingSequence/changeStatus',
      method: 'put',
      data
    })
  },

  /**
   * 修改表注释数值数据，自增自减
   * @returns
   */
  numberOperation (data = {}) {
    return request({
      url: 'baccarat/waitingSequence/numberOperation',
      method: 'put',
      data
    })
  },

  /**
    * 表注释导入
    * @returns
    */
  importExcel (data = {}) {
    return request({
      url: 'baccarat/waitingSequence/import',
      method: 'post',
      data
    })
  },

  /**
   * 表注释下载模板
   * @returns
   */
  downloadTemplate () {
    return request({
      url: 'baccarat/waitingSequence/downloadTemplate',
      method: 'post',
      responseType: 'blob'
    })
  },

  /**
   * 表注释导出
   * @returns
   */
  exportExcel (params = {}) {
    return request({
      url: 'baccarat/waitingSequence/export',
      method: 'post',
      responseType: 'blob',
      params
    })
  },


}