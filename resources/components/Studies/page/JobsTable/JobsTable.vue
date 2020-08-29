<template>
  <v-row no-gutters>
    <v-col cols="12">
      <v-skeleton-loader
        :loading="loading"
        type="table"
        transition="fade-transition"
      >
        <v-data-table
          dense
          :loading="saving"
          :headers="columns"
          :items="rows"
          :server-items-length="totalRecords"
          :footer-props="{
            itemsPerPageOptions: [10, 25, 50]
          }"
          :page.sync="page"
          :items-per-page.sync="perPage"
          fixed-header
          :height="tableHeight"
        >
          <template v-slot:body="{ items, headers }">
            <draggable
              v-model="rows"
              tag="tbody"
              handle=".sortHandle"
              :disabled="!editable"
              @change="updateOrder"
              @start="drag = true"
              @end="drag = false"
            >
              <tr v-if="!(items.length || headers.length)" key="no-items" class="text-center">
                <td>
                  {{ $t('studies.jobs_table.no_jobs') }}
                </td>
              </tr>
              <tr
                v-for="item in items"
                v-else
                :id="item.id"
                :key="item.id"
                class="list-group-item"
              >
                <td v-if="editable" class="px-1" style="width: 0.1%">
                  <v-btn style="cursor: move" icon class="sortHandle">
                    <v-icon>mdi-drag-horizontal-variant</v-icon>
                  </v-btn>
                </td>
                <td style="min-width:70px">
                  {{ item.id }}
                </td>
                <template v-for="header in headers">
                  <td
                    v-if="header.value && item.variables[header.value]"
                    :key="item.variables[header.value].id"
                  >
                    <span v-if="header.dtype !== 'variable' || !editable">
                      {{ item.variables[header.value].pivot.value }}
                    </span>
                    <v-edit-dialog
                      v-else
                      :return-value="editingBuffer"
                      @open="editingBuffer=item.variables[header.value].pivot.value"
                      @cancel="editingBuffer=null"
                      @save="save(editingBuffer, item.id, item.variables[header.value].id)"
                    >
                      {{ item.variables[header.value].pivot.value }}
                      <template v-slot:input>
                        <v-text-field
                          v-model="editingBuffer"
                          label="Edit"
                          single-line
                        />
                      </template>
                    </v-edit-dialog>
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
  sync: ['page', 'per-page'],
  components: {
    draggable: () => import('vuedraggable')
  },
  props: {
    study: {
      type: Object,
      default: () => ({})
    },
    jobs: {
      type: Array,
      default: () => []
    },
    variables: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    refreshing: {
      type: Boolean,
      default: false
    },
    totalRecords: {
      type: Number,
      default: 0
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      newOrder: [],
      saving: false,
      drag: false,
      editingBuffer: ''
    }
  },
  computed: {
    columns () {
      if (this.variables.length === 0 || this.loading || !this.jobs?.length) {
        return []
      }

      const headers = [
        {
          text: 'Job ID',
          value: 'id',
          sortable: false
        },
        ...(this.variables?.map(aVar => ({
          text: upperFirst(aVar.name),
          value: aVar.name,
          dtype: aVar.dtype?.name,
          sortable: false
        })) || [])
      ]
      if (this.editable) {
        headers.unshift({ sortable: false })
      }
      return headers
    },
    rows: {
      get () {
        if (this.loading || !this.jobs) { return [] }
        return this.jobs
      },
      set (newOrder) {
        // Store the new order locally as a temporary measure
        this.newOrder = newOrder
      }
    },
    tableHeight () {
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
      return vh - 400
    }
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async save (value, jobID, variableID) {
      try {
        this.saving = true
        const job = this.jobs.find(job => job.id === jobID)
        if (!job) {
          throw new Error('Job not found in local records')
        }
        await job.setVariableValue(variableID, value)
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.saving = false
      }
    },
    frozen (val) {
      return ['id'].includes(val)
    },
    async updateOrder (event) {
      // First update the jobs table locally then remotely. This applies the optimistic UI principle
      // in that a change is expected to be valid. If not, the server will respond with an error and
      // the former data, which will bounce back the UI (in this case jobs table) to its previous
      // state.
      try {
        // Obtain the moved element, at the element located at the new target spot.
        const src = this.jobs[event.moved.oldIndex]
        const target = this.jobs[event.moved.newIndex]
        // Check if the new order has been saved locally. If it hasn't been, something went
        // wrong and abort.
        if (this.newOrder.length === 0) {
          throw new Error('New order is empty')
        }
        // Construct a new array consisting of id and position pairs that can be directly passed
        // to the job model's update function.
        const updatedOrder = this.newOrder.map((job, i) => ({
          id: job.id,
          position: i + 1
        }))
        // Reset newOrder value to empty
        this.newOrder = []
        // Emit event to parent with updated order data, so it can update the store.
        this.$emit('update:order', updatedOrder)
        // Update the data on the server side too.
        this.saving = true
        await src.moveTo(target.position)
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>
