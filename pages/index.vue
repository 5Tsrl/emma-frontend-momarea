<template>
  <div>
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
        { key: "users", label: "User" },
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
