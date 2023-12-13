<template>
  <div>
    <b-row md="2" v-if="isAuthorized('admin')" class="pt-4">
          <b-link
            to="/momarea/add"
            class="btn btn-sm float-right btn-success"
            title="Aggiungi Area">
            <i class="fa fa-plus" aria-hidden="true"></i>
            Aggiungi Area
          </b-link>
    </b-row>
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
        {{ row.item.polygon }}
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
      ]
    };
  },
  async created() {
    this.areas = (await AreaService.getAreas()).data.areas;
    console.log(this.areas);
  },
  methods: {
    deleteArea(id) {
      // Handle delete logic here
    }
  }
};
</script>

<style>
button {
    padding: 4px 8px;
    margin-right: 4px;
}
</style>
