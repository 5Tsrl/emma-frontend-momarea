<template>
    <b-tabs content-class="mt-3">
    <b-tab title="Area provincia ">
		<b-row>
			<b-col md="5" sm="12">
				<b-form-group id="input-group-2" label="Nome area:" label-for="input-2">
					<b-form-input
					id="input-2"
					v-model="area.name"
					placeholder="Inserisci nome area"
					required
					></b-form-input>
				</b-form-group>
			</b-col>
			<b-col md="5" sm="12">
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
			<b-col md="2" sm="12">
				<b-button variant="primary" @click="onSubmit()" class="mt-4">Salva</b-button>
			</b-col>
		</b-row>
		<polygon-edit :area="area" key="province"></polygon-edit>
	</b-tab>
    <b-tab title="Area citta">
		<b-row>
			<b-col md="5" sm="12">
				<b-form-group id="input-group-2" label="Nome area:" label-for="input-2">
					<b-form-input
					id="input-2"
					v-model="area.name"
					placeholder="Inserisci nome area"
					required
					></b-form-input>
				</b-form-group>
			</b-col>
			<b-col md="5" sm="12">
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
			<b-col md="2" sm="12">
				<b-button variant="primary" @click="onSubmit()" class="mt-4">Salva</b-button>
			</b-col>
		</b-row>
		<polygon-edit :area="area" key="city"></polygon-edit>
	</b-tab>
    <b-tab title="Area poligono">
		<b-row>
			<b-col md="5" sm="12">
				<b-form-group id="input-group-2" label="Nome area:" label-for="input-2">
					<b-form-input
					id="input-2"
					v-model="area.name"
					placeholder="Inserisci nome area"
					required
					></b-form-input>
				</b-form-group>
			</b-col>
			<b-col md="5" sm="12">
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
			<b-col md="2" sm="12">
				<b-button variant="primary" @click="onSubmit()" class="mt-4">Salva</b-button>
			</b-col>
		</b-row>
		<polygon-edit :area="area" key="polygon"></polygon-edit>
	</b-tab>
  </b-tabs>
</template>

<script>
import Util from "@/mixing/util";
import UserService from "@/services/user.service";
import PolygonEdit from "../components/PolygonEdit.vue";
import AreaService from "../area.service";


export default {
	name: "add",
	mixins: [Util],
	components: {
		PolygonEdit,
	},

	data(){
		return{
			area: {
				name: null,
				province: null,
				city: null,
				polygon: null,
				users:[{id: null}],


			},
			users: null,
			loading: false,
		};
	},
	async created(){
		this.loading=true;
		var data = (await AreaService.addArea(null)).data;
		//this.area=data.area;
		this.users=data.users;
		console.log("data",data);
		this.loading=false;
	},
	methods: {
		async onSubmit() {
			alert(JSON.stringify(this.area))
			let res = await AreaService.addArea(this.area);
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