<template>
  <v-list three-line class="py-0">
    <template v-for="study in studies">
      <v-list-item :key="study.id">
        <v-list-item-content>
          <v-list-item-title v-text="study.name" />
          <v-list-item-subtitle v-text="study.description" />
        </v-list-item-content>
      </v-list-item>
      <v-divider :key="`${study.id}-divider`" />
    </template>
  </v-list>
</template>

<script>
export default {
  data () {
    return {
      studies: [
        {
          id: 6,
          name: 'Study 6',
          description: 'Something involving monkeys'
        },
        {
          id: 7,
          name: 'Study 7',
          description: 'Laborum ipsum ex reprehenderit dolore consequat amet ullamco.'
        },
        {
          id: 8,
          name: 'Study 8',
          description: 'Consequat nulla ex ullamco voluptate esse voluptate officia.'
        }
      ]
    }
  }
}
</script>
