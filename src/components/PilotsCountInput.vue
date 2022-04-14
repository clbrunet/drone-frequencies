<template>
  <div class="pilots-count-input">
    <label :for="inputName">{{ pilotsCountKey }} pilots count :</label>
    <div class="number-input">
      <img src="@/assets/minus-96.png" alt="minus" class="minus" @click="decrementCount">
      <input type="number" :id="inputName" :name="inputName"
        min="0" :max="maxPilotsCount" v-model.number="pilotsCount" @change="onInputChanged">
      <img src="@/assets/plus-96.png" alt="plus" class="plus" @click="incrementCount">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';

const PilotsCountInputProps = Vue.extend({
  props: {
    pilotsCountKey: {
      type: String,
      required: true,
    },
    maxPilotsCount: {
      type: Number,
      required: true,
    },
  }
})

@Component
export default class PilotsCountInput extends PilotsCountInputProps {
  @Getter getPilotsCount!: {
    DJI: number,
    sharkbyte: number,
    analog: number,
  };
  @Mutation setPilotsCount!: (payload: { key: string, count: number }) => void;


  pilotsCount = 0;
  inputName = this.pilotsCountKey + 'PilotsCountInput';

  onInputChanged(): void {
    if (typeof this.pilotsCount != 'number') {
      return;
    }
    this.setPilotsCount({ key: this.pilotsCountKey, count: this.pilotsCount });
  }

  incrementCount(): void {
    if (this.pilotsCount === this.maxPilotsCount) {
      return;
    }
    this.pilotsCount++;
    this.setPilotsCount({ key: this.pilotsCountKey, count: this.pilotsCount });
  }

  decrementCount(): void {
    if (this.pilotsCount === 0) {
      return;
    }
    this.pilotsCount--;
    this.setPilotsCount({ key: this.pilotsCountKey, count: this.pilotsCount });
  }
}
</script>

<style scoped>
.pilots-form * {
  margin: 5px 0px;
}

.pilots-form .number-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
}

.minus, .plus {
  width: 30px;
  height: 30px;
  padding: 5px;
  margin: 0px 5px;
}

</style>
