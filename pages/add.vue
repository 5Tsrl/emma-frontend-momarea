<template>
    <div>
		<b-form-group id="input-group-2" label="Nome area:" label-for="input-2">
			<b-form-input
			id="input-2"
			v-model="area.name"
			placeholder="Inserisci nome area"
			required
			></b-form-input>
		</b-form-group>

		<b-form-group id="input-group-2" label="User:" label-for="input-2">
			<b-form-select
			id="input-2"
			v-model="selectedUsers"
			:options="users"
			placeholder=""
			required
			multiple
			></b-form-select>
		</b-form-group>
		<h5>Seleziona l´area</h5>
		<b-form-group>
			<b-row>
				<b-col md="4">
					<b-form-radio v-model="selectedArea" name="selectedarea" value="province">
						Provincia
					</b-form-radio>
				</b-col>
				<b-col md="4">
					<b-form-radio v-model="selectedArea" name="selectedarea" value="city">
						Città
					</b-form-radio>
				</b-col>
				<b-col md="4">
					<b-form-radio v-model="selectedArea" name="selectedarea" value="polygon">
						Poligon
					</b-form-radio>
				</b-col>
			</b-row>
		</b-form-group>
		<polygon-edit :area="area" :selectedArea="selectedArea" ></polygon-edit>
		<br>
		<b-button variant="primary" @click="onSubmit()" class="mb-3">Salva</b-button>
	</div>
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
			selectedArea: null,
		};
	},
	async created(){
		// this.loading=true;
		var data = (await AreaService.addArea(null)).data;
		//this.area=data.area;
		this.users=data.users;
		console.log("data",data);
		// this.loading=false;
	},
	computed: {
		selectedUsers: {
			get() {
				// if this.area.users is array 
				console.log("area",this.area);
				if(this.area.users == null){
					return [];
				}else{
					if (Array.isArray(this.area.users)) {
						return this.area.users.map(user => user.id);
					}else{
						return this.area.users._ids;
					}
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
			let res = await AreaService.addArea(this.area);
			// sent to mommaarea after save
			this.$router.push({ path: "/momarea" });
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