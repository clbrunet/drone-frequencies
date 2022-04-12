<template>
  <div class="home">
    <form class="pilots-form" @submit.prevent="formProcessing">
      <label for="DJIPilots">DJI pilots :</label>
      <div class="number-input">
        <img src="@/assets/minus-96.png" alt="minus" class="minus" @click="DJIPilots > 0 ? DJIPilots-- : 0">
        <input type="number" id="DJIPilots" name="DJIPilots"
        min="0" max="7" v-model.number="DJIPilots">
        <img src="@/assets/plus-96.png" alt="plus" class="plus" @click="DJIPilots < 7 ? DJIPilots++ : 0">
      </div>
      <label for="sharkbytePilots">Sharkbyte pilots :</label>
      <div class="number-input">
        <img src="@/assets/minus-96.png" alt="minus" class="minus" @click="sharkbytePilots > 0 ? sharkbytePilots-- : 0">
        <input type="number" id="sharkbytePilots" name="sharkbytePilots"
        min="0" max="8" v-model.number="sharkbytePilots">
        <img src="@/assets/plus-96.png" alt="plus" class="plus" @click="sharkbytePilots < 8 ? sharkbytePilots++ : 0">
      </div>
      <label for="analogPilots">Analog pilots :</label>
      <div class="number-input">
        <img src="@/assets/minus-96.png" alt="minus" class="minus" @click="analogPilots > 0 ? analogPilots-- : 0">
        <input type="number" id="analogPilots" name="analogPilots"
        min="0" max="8" v-model.number="analogPilots">
        <img src="@/assets/plus-96.png" alt="plus" class="plus" @click="analogPilots < 8 ? analogPilots++ : 0">
      </div>
      <div class="IMD">
      <label for="shouldCheckIMD">Calculate IMDs(inter-modulation distortions) : </label>
      <input type="checkbox" id="shouldCheckIMD" name="shouldCheckIMD"
        v-model="shouldCheckIMD" @change="onShouldCheckIMDChange">
      </div>
      <input type="submit" value="Submit">
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

type Pilot = {
  technology: "DJI" | "Sharkbyte" | "Analog";
  number: number;
  channels: { readonly name: string, readonly frequency: number }[];
  channelIndex: number;
};

@Component
export default class Home extends Vue {
  readonly DJIChannels = [
    { name: "1", frequency: 5660 },
    { name: "2", frequency: 5695 },
    { name: "3", frequency: 5735 },
    { name: "4", frequency: 5770 },
    { name: "5", frequency: 5805 },
    // removed channel
    // { name: "8", frequency: 5839 },
    { name: "6", frequency: 5878 },
    { name: "7", frequency: 5914 },
  ];

  readonly sharkbyteChannels = [
    { name: "1", frequency: 5660 },
    { name: "2", frequency: 5695 },
    { name: "3", frequency: 5735 },
    { name: "4", frequency: 5770 },
    { name: "5", frequency: 5805 },
    { name: "6", frequency: 5839 },
    { name: "7", frequency: 5878 },
    { name: "8", frequency: 5914 },
  ];

  readonly analogChannels = [
    { name: "R1", frequency: 5658 },
    { name: "R2", frequency: 5695 },
    { name: "A8", frequency: 5725 },
    { name: "R3", frequency: 5732 },
    { name: "B1", frequency: 5733 },
    { name: "F1", frequency: 5740 },
    { name: "A7", frequency: 5745 },
    { name: "B2", frequency: 5752 },
    { name: "F2", frequency: 5760 },
    { name: "A6", frequency: 5765 },
    { name: "R4", frequency: 5769 },
    { name: "B3", frequency: 5771 },
    { name: "F3", frequency: 5780 },
    { name: "A5", frequency: 5785 },
    { name: "B4", frequency: 5790 },
    { name: "F4", frequency: 5800 },
    { name: "A4", frequency: 5805 },
    { name: "R5", frequency: 5806 },
    { name: "B5", frequency: 5809 },
    { name: "F5", frequency: 5820 },
    { name: "A3", frequency: 5825 },
    { name: "B6", frequency: 5828 },
    { name: "F6", frequency: 5840 },
    { name: "R6", frequency: 5843 },
    { name: "A2", frequency: 5845 },
    { name: "B7", frequency: 5847 },
    { name: "F7", frequency: 5860 },
    { name: "A1", frequency: 5865 },
    { name: "B8", frequency: 5866 },
    { name: "R7", frequency: 5880 },
    { name: "F8", frequency: 5880 },
    { name: "R8", frequency: 5917 },
  ];

  DJIPilots = 0;
  sharkbytePilots = 0;
  analogPilots = 0;
  shouldCheckIMD = true;

  formError = "";

  best: { smallestDifference: number, smallestIMDDifference: number, pilots: Pilot[] } = {
    smallestDifference: -1,
    smallestIMDDifference: -1,
    pilots: [],
  };

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
    if (index >= this.DJIPilots + this.sharkbytePilots + this.analogPilots) {
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
    const pilotsCount = this.DJIPilots + this.sharkbytePilots + this.analogPilots;
    if (pilotsCount < 2 || 8 < pilotsCount) {
      this.formError = "The number of pilots must be between 2 and 8.";
      return;
    }
    this.formError = "";
    let pilots: Pilot[] = [];
    for (let i = 0; i < this.DJIPilots; i++) {
      pilots.push({ technology: "DJI", number: i + 1,
          channels: this.DJIChannels, channelIndex: 0 });
    }
    for (let i = 0; i < this.sharkbytePilots; i++) {
      pilots.push({ technology: "Sharkbyte", number: i + 1,
          channels: this.sharkbyteChannels, channelIndex: 0 });
    }
    for (let i = 0; i < this.analogPilots; i++) {
      pilots.push({ technology: "Analog", number: i + 1,
          channels: this.analogChannels, channelIndex: 0 });
    }
    this.best.smallestDifference = 25;
    this.best.smallestIMDDifference = -1;
    this.best.pilots = [];
    this.setBest(pilots, 0);
  }

  onShouldCheckIMDChange(): void {
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
  max-width: 1000px;
  margin: 5px 0px;
}
</style>
