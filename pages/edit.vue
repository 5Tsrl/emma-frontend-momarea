<template>
	<div>
	  <!-- Sezione del Form -->
	  <b-form>
		<b-form-row class="align-items-center">
		  <b-col xl="12">
			<b-row class="">
			  <!-- Input per il Nome dell'Area -->
			  <b-col sm="6" class="">
				<b-form-group label="Area">
				  <b-form-input
					id="input-2"
					v-model="area.name"
					placeholder="Inserisci il nome dell'area"
					required
				  ></b-form-input>
				</b-form-group>
			  </b-col>
			  <!-- Select per gli Utenti -->
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
  
	  <h5>Seleziona l'area</h5>
  
	  <!-- Pulsanti per la Selezione del Tipo di Area -->
	  <b-form-group>
		<b-row class="align-items-center no-gutters">
		  <!-- Pulsante per la Provincia -->
		  <b-col md="auto" class="mr-1 mb-2">
			<b-button
			  @click="changeArea('province')"
			  class="btn btn-outline-primary btn-block"
			  :class="{ 'active': selectedArea === 'province' }"
			>
			  Provincia
			</b-button>
		  </b-col>
		  <!-- Pulsante per la Città -->
		  <b-col md="auto" class="mr-1 mb-2">
			<b-button
			  @click="changeArea('city')"
			  class="btn btn-outline-primary btn-block"
			  :class="{ 'active': selectedArea === 'city' }"
			>
			  Città
			</b-button>
		  </b-col>
		  <!-- Pulsante per il Poligono -->
		  <b-col md="auto" class="mr-1 mb-2">
			<b-button
			  @click="changeArea('polygon')"
			  class="btn btn-outline-primary btn-block"
			  :class="{ 'active': selectedArea === 'polygon' }"
			>
			  Perimetro
			</b-button>
		  </b-col>
  
		  <!-- Spaziatore per Spostare i Pulsanti a Destra -->
		  <b-col md="" class="flex-grow-1 mb-2"></b-col>
  
		  <!-- Pulsante per Sottomettere l'Area -->
		  <b-button
			md="auto"
			variant="primary"
			@click="onSubmit()"
			class="ml-1 btn btn-success mb-1"
		  >
			Salva l'area
		  </b-button>
		</b-row>
	  </b-form-group>
	  <div v-if="selectedArea === 'polygon'" class="d-flex justify-content-begin align-items-center mb-2">
			<img width="20" height="20" src="https://img.icons8.com/pastel-glyph/64/000000/info--v1.png" alt="info">
			<p class="mb-0 ml-2">Usa il tasto crea forma per tracciare il perimetro dell'area</p>
		</div>
  
	  <!-- Componente per Modificare il Poligono -->
	  <polygon-edit :area="area" :selectedArea="selectedArea"></polygon-edit>
	  <br />
	  <!-- Pulsante per Sottomettere il Form -->
	  <b-button variant="primary" @click="onSubmit()" class="mb-3">
		Salva
	  </b-button>
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
  
	data() {
	  return {
		area: {
		  province: null,
		  city: null,
		  polygon: null,
		  users: [{id: null}],
		},
		users: null,
		id: null,
		loading: false,
		selectedArea: null,
	  };
	},
	async created() {
	  // Recupero dei dati alla creazione del componente
	  this.loading = true;
	  console.log("params", this.$route.params);
	  this.id = parseInt(this.$route.params.id);
	  let res = (await AreaService.editArea(this.id, null)).data;
	  this.area = res.area;
	  console.log("area", this.area);
	  if (this.area.polygon !== null) {
		this.selectedArea = "polygon";
	  } else if (this.area.city !== null) {
		this.selectedArea = "city";
	  } else if (this.area.provincia !== null) {
		this.selectedArea = "province";
	  }
	  this.users = res.users;
	  console.log("data", res);
	  this.loading = false;
	},
	computed: {
	  // Proprietà calcolata per gli utenti selezionati
	  selectedUsers: {
		get() {
		  console.log("area", this.area);
		  if (this.area.users == null) {
			return [];
		  } else {
			if (Array.isArray(this.area.users)) {
			  return this.area.users.map((user) => user.id);
			} else {
			  return this.area.users._ids;
			}
		}
		}
		,
			set(value) {
				console.log("value",value);
				this.area.users = {_ids:value};
				console.log("area",this.area);
			}
	},
	},
	methods: {
	  // Metodo per gestire la sottomissione del form
	  async onSubmit() {
		alert(JSON.stringify(this.area));
		let res = await AreaService.editArea(this.id, this.area);
		// Reindirizza dopo il salvataggio
		this.$router.push({ path: "/momarea" });
	  },
	  // Metodo per reimpostare i campi del form
	  onReset(event) {
		event.preventDefault();
		this.area.name = "";
	  },
	  // Metodo per gestire il cambio del tipo di area
	  changeArea(areaType) {
		this.selectedArea = areaType;
		// Aggiungi ulteriori logiche se necessario
	  },
	},
  }
  </script>
  
  <style scoped>
  </style>
  