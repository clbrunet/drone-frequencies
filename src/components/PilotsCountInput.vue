<template>
  <div class="pilots-count-input">
    <label :for="inputName">{{ pilotsCountKey.charAt(0).toUpperCase() + pilotsCountKey.slice(1) }}
      pilots count :</label>
    <div class="number-input">
      <img src="@/assets/minus-96.png" alt="minus" class="minus" @click="decrementCount">
      <input type="number" :id="inputName" :name="inputName"
        min="0" :max="maxPilotsCount" v-model.number="pilotsCount">
      <img src="@/assets/plus-96.png" alt="plus" class="plus" @click="incrementCount">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Mutation } from 'vuex-class';

@Component
export default class PilotsCountInput extends Vue {
  @Prop({
    type: String,
    required: true
  }) pilotsCountKey!: string
  @Prop({
    type: Number,
    required: true
  }) maxPilotsCount!: number

  @Mutation setPilotsCount!: (payload: { key: string, count: number }) => void;

  pilotsCount = 0;
  inputName = this.pilotsCountKey + 'PilotsCountInput';

  @Watch('pilotsCount')
  onPilotsCountChanged(newCount: number): void {
    if (typeof newCount != 'number') {
      return;
    }
    this.setPilotsCount({ key: this.pilotsCountKey, count: newCount });
  }

  incrementCount(): void {
    if (this.pilotsCount === this.maxPilotsCount) {
      return;
    }
    this.pilotsCount++;
  }

  decrementCount(): void {
    if (this.pilotsCount === 0) {
      return;
    }
    this.pilotsCount--;
  }
}
</script>

<style scoped>
.pilots-count-input * {
  margin: 5px 0px;
}

.pilots-count-input .number-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
}

.number-input input {
  border-radius: 5px;
  /* border-color: #87CEEB; */
  border-style: solid;
  /* box-shadow: 0 0 2px #87CEEB; */
  box-shadow: 0 0 2px black;
}

.minus, .plus {
  width: 30px;
  height: 30px;
  padding: 5px;
  margin: 0px 5px;
  /* filter: invert(74%) sepia(66%) saturate(6232%) hue-rotate(164deg) brightness(95%) contrast(101%); */
}

</style>
