<template>
  <div>
    <b-form @submit.prevent="filterarea">
    <b-form-row class="align-items-center flex-grow-1">
      <b-col xl="" class="">
        <b-row class="">
          <b-col sm="6" class="">
            <b-form-group label="Area" >
              <b-form-input
                v-model="filter.name_area"
                type="search"
                placeholder="Filtra usando il nome dell'area"
              ></b-form-input>
            </b-form-group>
          </b-col>
          <b-col sm="6">
            <b-form-group label="Utenti" class=""> 
              <b-form-input
                v-model="filter.user_area"
                type="search"
                placeholder="Filtra per utenti di competenza"
              ></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>
      </b-col>

      <b-col lg="auto" class="d-md-flex align-items-center">
        <b-button type="submit" variant="primary" class="btn  btn-info w-100 mb-2 mb-md-0 mr-md-2 align-middle py-1">Filtra</b-button>

        <b-link to="/momarea/export" class="btn  btn-secondary w-100 mb-2 mb-md-0 mr-md-2 align-middle py-1" title="Esporta dati in massa">
          <i class="download" aria-hidden="true"></i>
          Vai&nbsp;a&nbsp;Esporta&nbsp;dati&nbsp;in&nbsp;massa
        </b-link>

        <b-link to="/momarea/add" class="btn  btn-success w-100 mb-2 mb-md-0 align-middle py-1" title="Aggiungi Area">
          <i class="fa fa-plus d-inline align-middle mr-1" aria-hidden="true"></i>
          <span class="d-inline align-middle">Aggiungi&nbsp;Area</span>
        </b-link>

      </b-col>
    </b-form-row>
  </b-form>
<br>
    <b-table 
      striped
      hover
      :items="areas" :fields="fields">
      <template #cell(name)="row">
        {{ row.item.name }}
      </template>
      <template #cell(city)="row">
        {{ row.item.city }}
      </template>
      <template #cell(province)="row">
        {{ row.item.province }}
      </template>
      <template #cell(polygon)="row">
        <img v-if= "row.item.polygon!=null" width="25" height="25" src="https://img.icons8.com/color/48/ok--v1.png" alt="external-Polygon-basic-elements-others-inmotus-design"/>
      </template>
      <template #cell(users)="row">
        {{ row.item.users.length>0 ? row.item.users[0].email: "" }}
        <b-link :title="row.item.users.slice(1).map(user => user.email)" v-if="row.item.users.length>=2">
          <span>{{ "[+"+(row.item.users.length-1)+"]" }}</span>
        </b-link>
        <!-- <b-tooltip :title="row.item.users.join(', ')">
          <span>{{ row.item.users[0].email }}</span>
        </b-tooltip> -->
      </template>
      <template #cell(actions)="row">
        <b-link
              v-if="isAuthorized('admin')"
              :to="`/momarea/edit/${row.item.id}`"
              title="Modifica Area"><b-icon icon="pencil"></b-icon></b-link>&nbsp;
        <b-icon
          v-if="isAuthorized('admin')"
          @click="deleteArea(row.item.id)"
          icon="trash"
          title="Elimina Area">
        </b-icon>
      </template>
    </b-table>
  </div>
</template>

<script>
import UserService from "@/services/user.service";
import Util from "@/mixing/util";
import AreaService from "../area.service";

export default {
  mixins: [Util],
  data() {
    return {
      areas: [], // Replace with your actual data
      fields: [
        { key: "name", label: "Nome" },
        { key: "city", label: "Città" },
        { key: "province", label: "Provincia" },
        { key: "polygon", label: "Perimetro" },
        { key: "users", label: "Utenti" },
        { key: "actions", label: "Azioni" }
      ],
      filter: {
				name_area: null, 
        user_area: null,
			},
    };
  },
  async created() {
    this.areas = (await AreaService.indexAreas()).data.areas;
    console.log(this.areas);
  },
  methods: {
    async deleteArea(id) {
      await AreaService.deleteArea(id);
      this.areas = this.areas.filter(area => area.id != id);
    },
    async filterarea () {
      this.areas = (await AreaService.indexAreas(this.filter.name_area, this.filter.user_area)).data.areas;
    console.log(this.areas);
    },
  },
};
</script>

<style>
button {
    padding: 4px 8px;
    margin-right: 4px;
}
</style>
  