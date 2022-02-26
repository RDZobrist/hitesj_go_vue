<template>
  <b-modal
    :id="id"
    ref="modal"
    @hidden="onClose"
    centered
    hide-footer
    :title="modalText"
    content-class="modal-style"
  >
    <div>
      <b-button
        @click="closeModalAndExecuteAction"
        class="border-blue-shadow"
        variant="primary"
      >
        Logout
      </b-button>
    </div>
  </b-modal>
</template>

<script>
// import { CREATE_FILE } from '@/store/actions.type'
// import { EMIT } from '@/store/mutations.type'

export default {
  name: 'upload-modal',
  props: {
    executeAction: {
      type: Function,
      require: true
    },
    modalText: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  methods: {
    onClose () {
      this.$emit('close')
    },
    show () {
      this.$refs['modal'].show()
    },
    hide () {
      this.$refs['modal'].hide()
    },
    closeModalAndExecuteAction () {
      this.executeAction()
      this.hide()
    }
  }
}
</script>

<style scoped lang="scss">
button {
  background: #fff;
  color: #111;
  @extend %buttons-border;
  box-shadow: 0px 0px 15px 2px rgb(216, 216, 216);
  &:hover {
    background-color: $app-bg4;
    color: #111;
  }
}
::v-deep .modal-style {
  @extend %modal-corners;
  border-radius: 8px;
  text-align: center;
}
</style>
