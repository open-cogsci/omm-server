<template>
  <v-row no-gutters>
    <v-col cols="12">
      <v-data-table
        dense
        :loading="loading"
        :headers="columns"
        :items="rows"
      >
        <template v-slot:body="{ items, headers }">
          <tbody>
            <tr v-for="(item, idx) in items" :key="idx">
              <td v-for="(header, key) in headers" :key="key">
                <span v-if="frozen(header.value)">{{ item[header.value] }}</span>
                <v-edit-dialog
                  v-else-if="header.dtype === 'variable'"
                  :return-value.sync="item[header.value]"
                  @save="save"
                  @cancel="cancel"
                  @open="open"
                  @close="close"
                >
                  {{ item[header.value] }}
                  <template v-slot:input>
                    <v-text-field
                      v-model="item[header.value]"
                      label="Edit"
                      single-line
                    />
                  </template>
                </v-edit-dialog>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
import { upperFirst } from 'lodash'

export default {
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
  computed: {
    columns () {
      return [
        {
          text: '#',
          value: 'position',
          sortable: false
        },
        ...this.variables
      ]
    },
    variables () {
      return this.study?.variables.map(aVar => ({
        text: upperFirst(aVar.name),
        value: aVar.name,
        sortable: false,
        dtype: aVar.dtype?.name
      })) || []
    },
    rows () {
      return this.study.jobs.map(job => ({
        id: job.position,
        position: job.position,
        ...job.variables.reduce((result, variable) => {
          const pivot = variable.value(job.id)
          result.id = pivot.$id
          result[variable.name] = pivot.value
          return result
        }, {})
      }))
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
    save () {

    },
    cancel () {

    },
    open () {

    },
    close () {

    },
    frozen (val) {
      return ['position'].includes(val)
    }
  }
}
</script>
