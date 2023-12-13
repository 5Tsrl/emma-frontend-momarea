<template>
	<div>
	<b-tabs content-class="mt-3">
    <b-tab title="Area provincia " v-if="area.province!=null">
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
					v-model="area.users"
					:options="users"
					placeholder=""
					required
					multiple
					></b-form-select>
				</b-form-group>
			</b-col>
			<b-col md="2" sm="12">
				<b-button variant="primary" @click="onSubmit()" class="mt-4">Salva</b-button>
			</b-col>
		</b-row>
		<polygon-edit :area="area" key="province"></polygon-edit>
	</b-tab>
    <b-tab title="Area citta" v-if="area.city!=null">
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
					<!-- vue select v-model is and array of objects I would like to obtain its id -->
					<b-form-select
					id="input-2"
					v-model="selectedUsers"
					:options="users"
					placeholder=""
					required
					multiple
					></b-form-select>
				</b-form-group>
			</b-col>
			<b-col md="2" sm="12">
				<b-button variant="primary" @click="onSubmit()" class="mt-4">Salva</b-button>
			</b-col>
		</b-row>
		<polygon-edit :area="area" key="city"></polygon-edit>
	</b-tab>
    <b-tab title="Area poligono" v-if="area.polygon!=null">
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
					v-model="area.users"
					:options="users"
					placeholder=""
					required
					multiple
					></b-form-select>
				</b-form-group>
			</b-col>
			<b-col md="2" sm="12">
				<b-button variant="primary" @click="onSubmit()" class="mb-4">Salva</b-button>
			</b-col>
		</b-row>
		<polygon-edit :area="area" key="polygon"></polygon-edit>
	</b-tab>
  </b-tabs>  
  <!-- <polygon-edit :polygon="area.polygon"></polygon-edit> -->
</div>
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
				users: null,

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
		let res = (await AreaService.editArea(this.id,null)).data;
		this.area=res.area;
		console.log("area",this.area);
		this.users=res.users;
		console.log("data",res);
		this.loading=false;
	},
	computed: {
		selectedUsers: {
			get() {
				// if this.area.users is array 
				console.log("area",this.area);
				if (Array.isArray(this.area.users)) {
					return this.area.users.map(user => user.id);
				}else{
					return this.area.users._ids;
				}
				
				
			},
			set(value) {
				console.log("value",value);
				this.area.users = {_ids:value};
				console.log("area",this.area);
			}
		}
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
