<template>
	<div>
		<b-form>
			<b-form-row class="align-items-center">
				<b-col xl="12">
					<b-row class="">
						<b-col sm="6" class="">
							<b-form-group label="Area" >
								<b-form-input
								id="input-2"
								v-model="area.name"
								placeholder="Inserisci il nome dell'area"
								required
								></b-form-input>
							</b-form-group>
						</b-col>
						<b-col sm="6">
							<b-form-group label="Utenti" class=""> 
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
					</b-row>
				</b-col>
			</b-form-row>
		</b-form>

		<h5>Seleziona il tipo di area</h5>

		<b-form-group>
			<b-row class="align-items-center no-gutters">
				<b-col md="auto" class="mr-1 mb-2">
					<b-button 
					@click="changeArea('province')"
					name="selectedarea" value="province"
					class="btn  btn-outline-primary btn-block"
					:class="{ 'active': selectedArea === 'province' }">
						Provincia
					</b-button>
				</b-col>
				<b-col md="auto" class="mr-1 mb-2">
					<b-button
					@click="changeArea('city')"
					name="selectedarea" value="city"
					class="btn  btn-outline-primary btn-block"
					:class="{ 'active': selectedArea === 'city' }">
						Città
					</b-button>
				</b-col>
				<b-col md="auto" class="mr-1 mb-2">
					<b-button
					@click="changeArea('polygon')"
					name="selectedarea"
					value="polygon"
					class="btn  btn-outline-primary btn-block"
					:class="{ 'active': selectedArea === 'polygon' }">
						Perimetro
					</b-button>
				</b-col>

				<b-col md="" class="flex-grow-1 mb-2" ></b-col>

				<b-button md="auto" variant="primary" @click="onSubmit()" 
				class="ml-1 btn btn-success mb-1">Salva l'area</b-button>
			</b-row>	
		</b-form-group>
		<div v-if="selectedArea === 'polygon'" class="d-flex justify-content-begin align-items-center mb-2">
			<img width="20" height="20" src="https://img.icons8.com/pastel-glyph/64/000000/info--v1.png" alt="info">
			<p class="mb-0 ml-2">Usa il tasto crea forma per tracciare il perimetro dell'area</p>
		</div>
		
		<polygon-edit :area="area" :selectedArea="selectedArea" ></polygon-edit>
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
			//alert(JSON.stringify(this.area))
			let res = await AreaService.addArea(this.area);
			// sent to mommaarea after save
			this.$router.push({ path: "/momarea" });
		},
		onReset(event) {
        event.preventDefault()
        this.area.name = ''
		},
		changeArea(value){
			this.selectedArea=value;
			console.log("select",this.selectedArea);
		},
	},
}	
</script>

<style scoped>
</style>