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
          id: 1,
          name: 'Study 1',
          description: 'Something involving monkeys'
        },
        {
          id: 2,
          name: 'Study 2',
          description: 'Laborum ipsum ex reprehenderit dolore consequat amet ullamco.'
        },
        {
          id: 3,
          name: 'Study 3',
          description: 'Consequat nulla ex ullamco voluptate esse voluptate officia.'
        }
      ]
    }
  }
}
</script>
