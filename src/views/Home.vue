<template>
  <div class="home">
    <form class="pilots-form" @submit.prevent="formProcessing">
      <PilotsCountInput pilots-count-key="DJI" :max-pilots-count="7"/>
      <PilotsCountInput pilots-count-key="sharkbyte" :max-pilots-count="8"/>
      <PilotsCountInput pilots-count-key="analog" :max-pilots-count="8"/>
      <div class="IMD">
        <label for="shouldCheckIMD">Calculate IMDs(inter-modulation distortions) : </label>
        <input type="checkbox" id="shouldCheckIMD" name="shouldCheckIMD"
          v-model="shouldCheckIMD" @change="onShouldCheckIMDChanged">
      </div>
      <input class="pilots-form-submit" type="submit" value="Submit">
    </form>
    <p v-if="formError != ''" class="form-error">{{ formError }}</p>
    <div v-if="best.pilots.length > 0" class="result">
      <div class="differences">
        <p>Smallest difference without IMD : {{ best.smallestDifference }}MHz</p>
        <p v-if="shouldCheckIMD" >Smallest difference with IMD : {{ best.smallestIMDDifference }}MHz</p>
      </div>
      <ul>
        <li v-for="(pilot, index) in best.pilots" :key="index">
          {{ pilot.technology }} {{ pilot.number }} : channel {{ pilot.channels[pilot.channelIndex].name }},
          {{ pilot.channels[pilot.channelIndex].frequency }}MHz
        </li>
      </ul>
    </div>
    <img class="chart-img" src="https://oscarliang.com/ctt/uploads/2021/03/5.8ghz-fpv-channels-chart-diagram-frequency-analog-digital-dji-sharkbyte-05-21.jpg"
      alt="channels chart">
    <a href="https://oscarliang.com/fpv-channels/" target="_blank">https://oscarliang.com/fpv-channels/</a>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import PilotsCountInput from '@/components/PilotsCountInput.vue'

import { DJIChannels, sharkbyteChannels, analogChannels } from '@/helpers/channels'

type Pilot = {
  technology: "DJI" | "Sharkbyte" | "Analog";
  number: number;
  channels: { readonly name: string, readonly frequency: number }[];
  channelIndex: number;
};

@Component({
  components: {
    PilotsCountInput,
  }
})
export default class Home extends Vue {

  shouldCheckIMD = true;

  formError = "";

  best: {
    smallestDifference: number,
    smallestIMDDifference: number,
    pilots: Pilot[]
  } = {
    smallestDifference: -1,
    smallestIMDDifference: -1,
    pilots: [],
  };

  @Getter getPilotsCount!: {
    DJI: number,
    sharkbyte: number,
    analog: number,
  };

  get totalPilotsCount(): number {
    return this.getPilotsCount.DJI + this.getPilotsCount.sharkbyte + this.getPilotsCount.analog;
  }

  getSmallestIMDDifference(pilots: Pilot[]): number {
    let smallestIMDDifference = Infinity;
    for (let i = 0; i < pilots.length; i++) {
      for (let j = i + 1; j < pilots.length; j++) {
        const firstIMD = pilots[i].channels[pilots[i].channelIndex].frequency * 2
          - pilots[j].channels[pilots[j].channelIndex].frequency;
        const secondIMD = pilots[j].channels[pilots[j].channelIndex].frequency * 2
          - pilots[i].channels[pilots[i].channelIndex].frequency;
        for (let k = 0; k < pilots.length; k++) {
          const firstDifference = Math.abs(firstIMD
            - pilots[k].channels[pilots[k].channelIndex].frequency);
          const secondDifference = Math.abs(secondIMD
            - pilots[k].channels[pilots[k].channelIndex].frequency);
          if (firstDifference < smallestIMDDifference) {
            smallestIMDDifference = firstDifference;
          }
          if (secondDifference < smallestIMDDifference) {
            smallestIMDDifference = secondDifference;
          }
        }
      }
    }
    return smallestIMDDifference;
  }

  getSmallestDifference(pilots: Pilot[]): number {
    let smallestDifference = Infinity;
    for (let i = 0; i < pilots.length; i++) {
      for (let j = i + 1; j < pilots.length; j++) {
        const difference = Math.abs(pilots[i].channels[pilots[i].channelIndex].frequency
          - pilots[j].channels[pilots[j].channelIndex].frequency);
        if (difference < smallestDifference) {
          smallestDifference = difference;
        }
      }
    }
    return smallestDifference;
  }

  isDifferencesBetter(pilots: Pilot[], index: number): boolean {
    for (let i = 0; i < index; i++) {
      if (Math.abs(pilots[i].channels[pilots[i].channelIndex].frequency
        - pilots[index].channels[pilots[index].channelIndex].frequency)
        < this.best.smallestDifference) {
        return false;
      }
    }
    return true;
  }

  setBest(pilots: Pilot[], index: number): void {
    if (index >= this.totalPilotsCount) {
      let smallestDifference = this.getSmallestDifference(pilots);
      if (this.shouldCheckIMD == false) {
        if (smallestDifference > this.best.smallestDifference) {
          this.best.smallestDifference = smallestDifference;
          this.best.pilots = JSON.parse(JSON.stringify(pilots));
        }
        return;
      }
      let smallestIMDDifference = this.getSmallestIMDDifference(pilots);
      if (smallestDifference >= this.best.smallestDifference
        && smallestIMDDifference >= this.best.smallestIMDDifference) {
        this.best.smallestDifference = smallestDifference;
        this.best.smallestIMDDifference = smallestIMDDifference;
        this.best.pilots = JSON.parse(JSON.stringify(pilots));
      }
      return;
    }

    if (index > 0 && pilots[index - 1].technology === pilots[index].technology) {
      pilots[index].channelIndex = pilots[index - 1].channelIndex + 1;
    } else {
      pilots[index].channelIndex = 0;
    }
    while (pilots[index].channelIndex < pilots[index].channels.length) {
      if (this.isDifferencesBetter(pilots, index)) {
        this.setBest(pilots, index + 1);
      }
      pilots[index].channelIndex++;
    }
  }

  formProcessing(): void {
    const pilotsCount = this.totalPilotsCount;
    if (pilotsCount < 2 || 8 < pilotsCount) {
      this.formError = "The number of pilots must be between 2 and 8.";
      return;
    }
    this.formError = "";
    let pilots: Pilot[] = [];
    for (let i = 0; i < this.getPilotsCount.DJI; i++) {
      pilots.push({ technology: "DJI", number: i + 1,
        channels: DJIChannels, channelIndex: 0 });
    }
    for (let i = 0; i < this.getPilotsCount.sharkbyte; i++) {
      pilots.push({ technology: "Sharkbyte", number: i + 1,
        channels: sharkbyteChannels, channelIndex: 0 });
    }
    for (let i = 0; i < this.getPilotsCount.analog; i++) {
      pilots.push({ technology: "Analog", number: i + 1,
        channels: analogChannels, channelIndex: 0 });
    }
    this.best.smallestDifference = 25;
    this.best.smallestIMDDifference = -1;
    this.best.pilots = [];
    this.setBest(pilots, 0);
  }

  onShouldCheckIMDChanged(): void {
    this.best.smallestIMDDifference = this.getSmallestIMDDifference(this.best.pilots);
  }
}
</script>

<style scoped>
p {
  margin: 5px 0px;
}

ul {
  margin: 5px 0px;
}

a {
  margin: 5px 0px;
}

.home {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pilots-form {
  display: flex;
  flex-direction: column;
  align-items:center;
  justify-content: center;
}

.pilots-form * {
  margin: 5px 0px;
}

.pilots-form-submit {
  font-weight: bold;
  padding: 10px;
  /* background-color: #87CEEB; */
  border-color: none;
  border-radius: 15px;
  /* box-shadow: 0px 0px 10px #00A5E7; */
  box-shadow: 0px 0px 10px black;
  border-style: solid;
  border-width: 0px;
  /* border-color: #00A5E7; */
  cursor: pointer;
}

.IMD {
  flex-direction: row;
}

.form-error {
  color: red;
}

.result {
  display: flex;
  flex-direction: column;
  align-items:center;
  justify-content: center;
}

.result .differences {
  margin: 5px 0px;
}

.result ul {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.result li {
  list-style-type: none;
  margin: 5px 0px;
}

.chart-img {
  width: 100%;
  max-width: 900px;
  margin: 5px 0px;
}
</style>
