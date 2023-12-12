<template>
	<b-tabs content-class="mt-3">
    <b-tab title="Area provincia " v-if="area.province!=null">
		<b-row>
			<b-col md="6" sm="12">
				<b-form-group id="input-group-2" label="Nome area:" label-for="input-2">
					<b-form-input
					id="input-2"
					v-model="area.name"
					placeholder="Inserisci nome area"
					required
					></b-form-input>
				</b-form-group>
			</b-col>
			<b-col md="6" sm="12">
				<b-form-group id="input-group-2" label="User:" label-for="input-2">
					<b-form-select
					id="input-2"
					v-model="area.users[0].id"
					:options="users"
					placeholder=""
					required
					></b-form-select>
				</b-form-group>
			</b-col>
		</b-row>
		<b-button variant="primary" @click="onSubmit()">Salva</b-button>
		<polygon-edit></polygon-edit>
	</b-tab>
    <b-tab title="Area citta" v-if="area.city!=null">
		<b-row>
			<b-col md="6" sm="12">
				<b-form-group id="input-group-2" label="Nome area:" label-for="input-2">
					<b-form-input
					id="input-2"
					v-model="area.name"
					placeholder="Inserisci nome area"
					required
					></b-form-input>
				</b-form-group>
			</b-col>
			<b-col md="6" sm="12">
				<b-form-group id="input-group-2" label="User:" label-for="input-2">
					<b-form-select
					id="input-2"
					v-model="area.users[0].id"
					:options="users"
					placeholder=""
					required
					></b-form-select>
				</b-form-group>
			</b-col>
		</b-row>
		<b-button variant="primary" @click="onSubmit()">Salva</b-button>
		<polygon-edit></polygon-edit>
	</b-tab>
    <b-tab title="Area poligono" v-if="area.polygon!=null">
		<b-row>
			<b-col md="6" sm="12">
				<b-form-group id="input-group-2" label="Nome area:" label-for="input-2">
					<b-form-input
					id="input-2"
					v-model="area.name"
					placeholder="Inserisci nome area"
					required
					></b-form-input>
				</b-form-group>
			</b-col>
			<b-col md="6" sm="12">
				<b-form-group id="input-group-2" label="User:" label-for="input-2">
					<b-form-select
					id="input-2"
					v-model="area.users[0].id"
					:options="users"
					placeholder=""
					required
					></b-form-select>
				</b-form-group>
			</b-col>
		</b-row>
		<b-button variant="primary" @click="onSubmit()" >Salva</b-button>
		<polygon-edit></polygon-edit>
	</b-tab>
  </b-tabs>
</template>

<script>
import Util from "@/mixing/util";
import UserService from "@/services/user.service";
import PolygonEdit from "../components/PolygonEdit.vue";
import AreaService from "../area.service";


export default {
	name: "edit",
	mixins: [Util],
	components: {
		PolygonEdit,
	},

	data(){
		return{
			area: {
				provincia: null,
				city: null,
				polygon: null,

			},
			users: null,
			id: null,
			loading: false,
		};
	},
	async created(){
		this.loading=true;
		console.log("params",this.$route.params)
		this.id = parseInt(this.$route.params.id);
		var data = (await AreaService.editArea(this.id,null)).data;
		this.area=data.area;
		this.users=data.users;
		console.log("data",data);
		this.loading=false;
	},
	methods: {
		async onSubmit() {
			alert(JSON.stringify(this.area))
			let res = await AreaService.editArea(this.id,this.area);
		},
		onReset(event) {
        event.preventDefault()
        this.area.name = ''
		},
	},
}
		
</script>

<style scoped>
</style>
