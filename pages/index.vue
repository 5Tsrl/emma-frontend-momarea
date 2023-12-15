<template>
  <div>
    <b-form @onsubmit.prevent>
      <b-form-row>
        <b-col md="3">
          <b-form-group label="Nome Area">
            <b-form-input
              v-model="filter.name_area"
			  type="search"
              placeholder="Scrivi alcune lettere"></b-form-input>
          </b-form-group>
        </b-col>

        <b-col md="3">
          <b-form-group label="User Area">
            <b-form-input
              v-model="filter.user_area"
			  type="search"
              placeholder="Scrivi alcune lettere"></b-form-input>
          </b-form-group>
        </b-col>
        
        <b-col md="1">
          <b-form-group class="pt-4">
            <b-button @click.prevent="filterarea()">Filtra</b-button>
          </b-form-group>
        </b-col>

        <b-col md="5" v-if="isAuthorized('admin')" class="pt-4">
              <b-link
                to="/momarea/add"
                class="btn btn-sm float-right btn-success"
                title="Aggiungi Area">
                <i class="fa fa-plus" aria-hidden="true"></i>
                Aggiungi Area
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
        <img v-if= "row.item.polygon!=null" width="20" height="20" src="https://img.icons8.com/external-others-inmotus-design/67/external-Polygon-basic-elements-others-inmotus-design.png" alt="external-Polygon-basic-elements-others-inmotus-design"/>
      </template>
      <template #cell(users)="row">
        {{ row.item.users[0].email }}
        <b-link :title="row.item.users.slice(1).map(user => user.email)" v-if="row.item.users.length>=2">
          <span>{{ "[+"+(row.item.users.length-1)+"]" }}</span>
        </b-link>
        <!-- <b-tooltip :title="row.item.users.join(', ')">
          <span>{{ row.item.users[0].email }}</span>
        </b-tooltip> -->
      </template>
      <template #cell(actions)="row">
        <b-link
              :to="`/momarea/edit/${row.item.id}`"
              title="Modifica Area"><b-icon icon="pencil"></b-icon></b-link>&nbsp;
        <b-icon
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
        { key: "name", label: "Name" },
        { key: "city", label: "City" },
        { key: "province", label: "Province" },
        { key: "polygon", label: "Polygon" },
        { key: "users", label: "Users" },
        { key: "actions", label: "Actions" }
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
