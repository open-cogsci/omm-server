<template>
  <v-row no-gutters>
    <v-col cols="12">
      <v-skeleton-loader
        :loading="loading && !study"
        type="table"
      >
        <v-data-table
          dense
          :loading="loading"
          :headers="columns"
          :items="localRows"
        >
          <template v-slot:body="{ items, headers }">
            <draggable
              :value="rows"
              tag="tbody"
              handle=".sortHandle"
              @change="saveOrder"
            >
              <tr v-if="!items.length" class="text-center">
                <td>
                  No jobs to show. Have you upload a jobs file yet?
                </td>
              </tr>
              <tr
                v-for="item in items"
                v-else
                :id="item.position"
                :key="item.position"
              >
                <template v-for="(header, key) in headers">
                  <td v-if="header.value" :key="item[header.value].id">
                    <span v-if="frozen(header.value)">{{ item[header.value] }}</span>
                    <v-edit-dialog
                      v-else-if="header.dtype === 'variable'"
                      :return-value.sync="item[header.value].value"
                      @save="save"
                      @cancel="cancel"
                      @open="open"
                      @close="close"
                    >
                      {{ item[header.value].value }}
                      <template v-slot:input>
                        <v-text-field
                          v-model="item[header.value].value"
                          label="Edit"
                          single-line
                        />
                      </template>
                    </v-edit-dialog>
                  </td>
                  <td v-else :key="key" class="px-1" style="width: 0.1%">
                    <v-btn style="cursor: move" icon class="sortHandle">
                      <v-icon>mdi-drag-horizontal-variant</v-icon>
                    </v-btn>
                  </td>
                </template>
              </tr>
            </draggable>
          </template>
        </v-data-table>
      </v-skeleton-loader>
    </v-col>
  </v-row>
</template>

<script>
import { upperFirst } from 'lodash'
import { mapActions } from 'vuex'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  components: {
    draggable: () => import('vuedraggable')
  },
  props: {
    study: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      localRows: this.rows || []
    }
  },
  computed: {
    columns () {
      if (this.variables.length === 0 || this.loading) {
        return []
      }
      return [
        {
          sortable: false
        },
        {
          text: 'Job ID',
          value: 'id',
          sortable: false
        },
        ...this.variables
      ]
    },
    variables () {
      return this.study?.variables.map(aVar => ({
        text: upperFirst(aVar.name),
        value: aVar.name,
        dtype: aVar.dtype?.name,
        sortable: false
      })) || []
    },
    rows () {
      if (this.loading || !this.study.jobs) { return [] }
      return this.study.jobs.map(job => ({
        id: job.id,
        ...job.variables.reduce((result, variable) => {
          const pivot = variable.value(job.id)
          result[variable.name] = {
            value: pivot.value,
            id: pivot.$id
          }
          return result
        }, {})
      }))
    },
    watch: {
      rows (val) {
        this.localRows = val
      }
    }
    // jobsTable () {
    //   // Temporary fix for nasty Vuex-ORM bug
    //   const results = {}
    //   for (const job of this.study.jobs) {
    //     results[job.position] = pick(job, ['id', 'position'])
    //     results[job.position].record = job
    //     results[job.position].variables = {}
    //     for (const variable of job.variables) {
    //       const pivot = variable.value(job.id)
    //       results[job.position].variables[variable.id] = {
    //         id: variable.id,
    //         record: variable,
    //         name: variable.name,
    //         value: pivot.value,
    //         pivot
    //       }
    //     }
    //   }
    //   return results
    // }
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    save () {

    },
    cancel () {

    },
    open () {

    },
    close () {

    },
    frozen (val) {
      return ['id'].includes(val)
    },
    async saveOrder (event) {
      try {
        const src = this.study.jobs[event.moved.oldIndex]
        const target = this.study.jobs[event.moved.newIndex]
        await src.moveTo(target.position)
      } catch (e) {
        processErrors(e, this.notify)
      }
    }
  }
}
</script>
