<template>
  <div>
    <div class="text-h5">
      Jobs
    </div>
    <code>
      {{ data }}
    </code>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  }
}
</script>
