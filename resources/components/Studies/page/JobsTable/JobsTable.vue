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
          :loading="loading || saving"
          :headers="columns"
          :items="rows"
        >
          <template v-slot:body="{ items, headers }">
            <tbody>
              <tr v-if="!items.length" key="no-items" class="text-center">
                <td>
                  No jobs to show. Have you already uploaded a jobs file?
                </td>
              </tr>
              <tr
                v-for="item in items"
                v-else
                :id="item.id"
                :key="item.id"
                class="list-group-item"
              >
                <td style="min-width:70px">
                  {{ item.id }}
                </td>
                <template v-for="header in headers">
                  <td
                    v-if="header.value && item.variables[header.value]"
                    :key="item.variables[header.value].id"
                  >
                    <span>{{ item.variables[header.value].pivot.value }}</span>
                  </td>
                </template>
              </tr>
            </tbody>
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
      newOrder: [],
      saving: false,
      drag: false
    }
  },
  computed: {
    columns () {
      if (this.variables.length === 0 || this.loading) {
        return []
      }
      return [
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
    rows: {
      get () {
        if (this.loading || !this.study.jobs) { return [] }
        return this.study.jobs
      },
      set (newOrder) {
        // Store the new order locally as a temporary measure
        this.newOrder = newOrder
      }
    }
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async save (item) {
      try {
        await item.record.setValue(item.value)
      } catch (e) {
        processErrors(e, this.notify)
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
        const src = this.study.jobs[event.moved.oldIndex]
        const target = this.study.jobs[event.moved.newIndex]
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
        this.$emit('updated-order', updatedOrder)
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
