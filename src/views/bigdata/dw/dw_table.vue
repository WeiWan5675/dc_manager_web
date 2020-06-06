<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">表名</label>
        <el-input v-model="query.dwTableName" clearable placeholder="表名" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">表类型</label>
        <el-input v-model="query.dwTableType" clearable placeholder="表类型" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">所属schema</label>
        <el-input v-model="query.dwTableSchemaName" clearable placeholder="所属schema" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">业务归属</label>
        <el-input v-model="query.businessOwner" clearable placeholder="业务归属" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="表名">
            <el-input v-model="form.dwTableName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="表类型">
            <el-select v-model="form.dwTableType" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.hive_table_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="数据路径">
            <el-input v-model="form.dataPath" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="建表语句">
            <el-input v-model="form.tableSql" :rows="3" type="textarea" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="是否是分区表">
            <el-select v-model="form.isPartitionTable" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.true_false"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="分区字段">
            <el-input v-model="form.partitionField" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="外部表标识">
            <el-select v-model="form.isExtTable" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.true_false"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="表结构JSON">
            <el-input v-model="form.tableJson" :rows="3" type="textarea" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="业务归属">
            <el-input v-model="form.businessOwner" style="width: 370px;" />
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
        <el-table-column prop="dwTableName" label="表名" />
        <el-table-column prop="dwTableType" label="表类型">
          <template slot-scope="scope">
            {{ dict.label.hive_table_type[scope.row.dwTableType] }}
          </template>
        </el-table-column>
        <el-table-column prop="dwTableSchemaName" label="所属schema" />
        <el-table-column prop="dataPath" label="数据路径" />
        <el-table-column prop="isPartitionTable" label="分区表标识">
          <template slot-scope="scope">
            {{ dict.label.true_false[scope.row.isPartitionTable] }}
          </template>
        </el-table-column>
        <el-table-column prop="partitionField" label="分区字段" />
        <el-table-column prop="isExtTable" label="外部表标识">
          <template slot-scope="scope">
            {{ dict.label.true_false[scope.row.isExtTable] }}
          </template>
        </el-table-column>
        <el-table-column prop="businessOwner" label="业务归属" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','dwHiveTables:edit','dwHiveTables:del']" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudDwHiveTables from '@/api/bigdata/dw/dwHiveTables'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, dwTableName: null, dwTableType: null, dwTableSchema: null, dwTableSchemaName: null, dataPath: null, tableSql: null, isPartitionTable: null, partitionField: null, isExtTable: null, tableJson: null, businessOwner: null, remark: null, delFlag: null, createTime: null, updateTime: null }
export default {
  name: 'DwHiveTables',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['hive_table_type', 'true_false', 'true_false'],
  cruds() {
    return CRUD({ title: 'DwHiveTableInfo', url: 'api/bigdata/dw/dwHiveTables', sort: 'id,desc', crudMethod: { ...crudDwHiveTables }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'dwHiveTables:add'],
        edit: ['admin', 'dwHiveTables:edit'],
        del: ['admin', 'dwHiveTables:del']
      },
      rules: {
      },
      queryTypeOptions: [
        { key: 'dwTableName', display_name: '表名' },
        { key: 'dwTableType', display_name: '表类型' },
        { key: 'dwTableSchemaName', display_name: '表所在schema' },
        { key: 'businessOwner', display_name: '业务归属' }
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
