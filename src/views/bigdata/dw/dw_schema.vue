<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">Schema名称</label>
        <el-input v-model="query.dwSchemaName" clearable placeholder="Schema名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">Schema编号</label>
        <el-input v-model="query.dwSchemaCode" clearable placeholder="Schema编号" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">所属业务线</label>
        <el-input v-model="query.businessLine" clearable placeholder="所属业务线" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">使用状态</label>
        <el-input v-model="query.useFlag" clearable placeholder="使用状态" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-date-picker
          v-model="query.createTime"
          :default-time="['00:00:00','23:59:59']"
          type="daterange"
          range-separator=":"
          size="small"
          class="date-item"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="createTimeStart"
          end-placeholder="createTimeEnd"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission">
        <slot>
          <el-button type="info">刷新表</el-button>
        </slot>
      </crudOperation>
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="Schema名称" prop="dwSchemaName">
            <el-input v-model="form.dwSchemaName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="Schema编号">
            <el-input v-model="form.dwSchemaCode" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="数据库类型" prop="dbType">
            <el-select v-model="form.dbType" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.db_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属业务线" prop="businessLine">
            <el-select v-model="form.businessLine" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.business_line"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="责任人">
            <el-input v-model="form.personLiable" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="提交日期">
            <el-date-picker v-model="form.submitTime" type="datetime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="使用状态">
            <el-select v-model="form.useFlag" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.dw_use_status"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="服务地址" prop="dwServerIp">
            <el-input v-model="form.dwServerIp" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="服务端口" prop="dwServerPort">
            <el-input v-model="form.dwServerPort" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="元数据类型" prop="dwMetastoreType">
            <el-select v-model="form.dwMetastoreType" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.hive_metastore_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="form.dwMetastoreUser" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.dwMetastorePass" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" :rows="3" type="textarea" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="dwSchemaName" label="Schema名称" />
        <el-table-column prop="dwSchemaCode" label="Schema编号" />
        <el-table-column prop="dbType" label="数据库类型">
          <template slot-scope="scope">
            {{ dict.label.db_type[scope.row.dbType] }}
          </template>
        </el-table-column>
        <el-table-column prop="businessLine" label="所属业务线">
          <template slot-scope="scope">
            {{ dict.label.business_line[scope.row.businessLine] }}
          </template>
        </el-table-column>
        <el-table-column prop="useFlag" label="使用状态">
          <template slot-scope="scope">
            {{ dict.label.dw_use_status[scope.row.useFlag] }}
          </template>
        </el-table-column>
        <el-table-column prop="personLiable" label="责任人" />
        <el-table-column prop="dwServerIp" label="服务地址" />
        <el-table-column prop="submitTime" label="提交日期">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.submitTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column v-permission="['admin','dwSchemaInfo:edit','dwSchemaInfo:del']" label="操作" width="200px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
            <el-button type="info">刷新</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudDwSchemaInfo from '@/api/bigdata/dw/dwSchemaInfo'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, dwSchemaName: null, dwSchemaCode: null, dbType: null, businessLine: null, remark: null, createTime: null, updateTime: null, personLiable: null, submitTime: null, useFlag: null, delFlag: null, dwServerIp: null, dwServerPort: null, dwMetastoreType: null, dwMetastoreUser: null, dwMetastorePass: null }
export default {
  name: 'DwSchemaInfo',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['db_type', 'business_line', 'dw_use_status', 'table_data_status', 'hive_metastore_type'],
  cruds() {
    return CRUD({ title: 'DataWarehouse', url: 'api/bigdata/dw/dwSchemaInfo', sort: 'id,desc', crudMethod: { ...crudDwSchemaInfo }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'dwSchemaInfo:add'],
        edit: ['admin', 'dwSchemaInfo:edit'],
        del: ['admin', 'dwSchemaInfo:del']
      },
      rules: {
        dwSchemaName: [
          { required: true, message: 'Schema名称不能为空', trigger: 'blur' }
        ],
        dbType: [
          { required: true, message: '数据库类型不能为空', trigger: 'blur' }
        ],
        businessLine: [
          { required: true, message: '所属业务线不能为空', trigger: 'blur' }
        ],
        dwServerIp: [
          { required: true, message: '服务地址不能为空', trigger: 'blur' }
        ],
        dwServerPort: [
          { required: true, message: '服务端口不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'dwSchemaName', display_name: 'Schema名称' },
        { key: 'dwSchemaCode', display_name: 'Schema编号' },
        { key: 'businessLine', display_name: '所属业务线' },
        { key: 'useFlag', display_name: '使用状态' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
