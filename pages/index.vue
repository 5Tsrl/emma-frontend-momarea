<template>
    <div>
		<b-form>
			<b-form-row>
				<b-col md="4" v-if="isAuthorized('admin, moma')">
				<b-form-group label="Tipo di coworking:">
				<b-form-select
					v-model="type"
					:options="coworking_types"
					value-field="id"
            		text-field="name"
					@input="updateType($event)"
					></b-form-select>
				</b-form-group>
				</b-col>

		<b-col md="4" v-if="isAuthorized('admin, moma')">
			<b-form-group label="Città:">
			<b-form-select
				v-model="city"
				:options="offices_city"
				value-field="id"
            	text-field="name"
				@input="updateCity($event)"></b-form-select>
			</b-form-group>
		</b-col>
		<b-col >
			<br>
			<br>
			<b-form-checkbox v-model="coworking" @change="toggle"> Coworking</b-form-checkbox>
		</b-col>
			<b-col>
				<br>
				<br>
				<b-button @click="fitMarkers()" size="sm" class="btn btn-primary float-right"><i class="ti-fullscreen mr-1"></i>&nbsp;Visualizza tutti gli spazi</b-button></b-col>
		</b-form-row>
		
    	</b-form>
		
		
		<br>
		<!-- <b-button v-b-toggle.collapse-1 variant="secondary">Filtro</b-button>
 	<b-collapse id="collapse-1" class="mt-2">
		<b-form-select v-model="selected" :options="options" size="sm" class="mt-3" text-field="Città"></b-form-select>

    </b-collapse> -->
		
		<div id="map-container" class="mt-3">
				<div id="spinner-container" class="text-center" v-if="loading">
					<b-spinner id="spinner" variant="success" label="Spinning"></b-spinner>
				</div>
		
				<l-map id="my-map"  :zoom="zoom" :center="center" :options="getMapOptions"
					@update:center="centerUpdate" @update:zoom="zoomUpdate" ref="map">
					<l-tile-layer :url="getTilesUrl" :attribution="getMapAttribution" :options="getLayerOptions" />

					<span v-if="offices_layer.length > 0">
						<l-marker v-for="office in offices_layer" :key="office.id" :lat-lng="[office.lat, office.lon]"
							:icon="companyIcon(office.coworking)" :options="{ title: office.name }">
							<l-popup ><strong>{{ office.company.name }}</strong><br><b-link
									:to="`/offices/edit/${office.id}`"  :disabled="!(loggedUserIsMomaArea || loggedUserIsAdmin || loggedUserIsMomaManagerAziendale)">{{ office.name }}</b-link>
									<div v-for="cow in office.info_coworking">
										<br><strong v-if="office.coworking == 1 && office.info_coworking!=null">{{ coworking_types[cow.type] }}</strong>
										<br><strong v-if="office.coworking == 1 && office.info_coworking!=null">Sale: {{ cow.sale }}</strong>
										<br><strong v-if="office.coworking == 1 && office.info_coworking!=null">Costo: {{ cow.costo }} €</strong>
										<br><b-link
										v-if="office.coworking == 1 && office.info_coworking!=null" :to="cow.link">Prenotazione</b-link>
									</div>
								
							</l-popup>
						</l-marker>
					</span>	
					<l-feature-group ref="layers">
						<span v-if="polygons.length > 0">
						<l-polygon v-for="polygon in polygons" :key="polygon.id" :lat-lngs="polygon.latlngs" :options="{ color: 'red' }" @click="clickCasa" ref="poly">
							</l-polygon>
					</span>		

					</l-feature-group>		
					

					<l-wms-tile-layer :key="wmsRenderKey"
						base-url="http://geomap.reteunitaria.piemonte.it/ws/siccms/coto-01/wmsg01/wms_sicc124_mobilita"
						:visible="true" :transparent="true" format="image/png">
					</l-wms-tile-layer>
					<!-- <l-draw-toolbar position="topright" ref="draw"/> -->
				</l-map>
		</div>		
    </div>
</template>

<script>
import Util from "@/mixing/util";
import L from "leaflet";
import { latLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LCircleMarker, LWMSTileLayer, LPopup, LPolygon } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import UserService from "@/services/user.service";
import LDrawToolbar from 'vue2-leaflet-draw-toolbar';

export default {
	mixins: [Util],
	components: {
		LMap,
		LMarker,
		LTileLayer,
		LCircleMarker,
		LPopup,
		"l-wms-tile-layer": LWMSTileLayer,		
		LDrawToolbar,		
		LPolygon,
	},
	async created () {	
		this.loading = true;	
		let response = await UserService.getOffices(null, "id, name, company_id, lat, lon, Companies.name, Companies.type, address, city, coworking, info_coworking");
		this.office_list = response.data.offices;
		this.offices_layer = this.generateLayer(this.office_types);
		this.offices_city = Array.from(new Set(this.offices_layer.reduce((acc, item) => {
		  if (!(item.city == null || item.city == '')) {
			acc.push(item.city.trim().toLowerCase());
		  }
		  return acc;
		}, []))).filter(value => value !== null);
		
		this.offices_city.sort(function (a, b) {
					return a > b;
				});
		this.offices_city.unshift(
			{
					id: null,
					name: "Tutte",
				});
		this.city =this.offices_city[0].id;
		this.loading = false;
		this.fitMarkers();		
		this.coworking_types=(await UserService.getCoworkingtypes()).data.types;
		console.log("cow_types",this.coworking_types);
		// this.coworking_types.unshift(
		// 	{
		// 			id: null,
		// 			name: "Tutte",
		// 		});
		let polygon = await UserService.getArea(1);
	console.log("polygon",polygon);
	let polygonarea = polygon.data.area.polygon;
	
	// become this string polygon=POLYGON((45.08 7.69,45.08 7.7,45.1 7.7,45.1 7.69,45.08 7.69)) to this.polygon: {
//     latlngs: [[45.08 , 7.69], [45.08 , 7.7], [45.1 7.7], [45.1 7.69], [45.08 7.69]]
//   },
	this.polygon = {
	latlngs: polygonarea.replace("POLYGON((","").replace("))","").split(",").map(function (item) {
		return item.split(" ").map(function (item) {
			return parseFloat(item);
		});
	})
	};
	this.polygons.push(this.polygon);

		
	// this.polygon = polygon.data.area.polygon.replace("POLYGON((","").replace("))","").split(",");
	console.log("this.polygon",this.polygons);
	// 	// add  L.Draw.Polygon to map using array of long lat
	// var polygonmap = new L.Polygon(this.polygons[0].latlngs);

	// // polygonmap.editing.enable();
	// let editActions = [
    //     L.Toolbar2.EditAction.Popup.Edit,
    //     L.Toolbar2.EditAction.Popup.Delete,
    //     L.Toolbar2.Action.extendOptions({
    //       toolbarIcon: { 
    //         className: 'leaflet-color-picker', 
    //         html: '<i class="fas fa-fill-drip"></i>' 
    //       },
    //       subToolbar: new L.Toolbar2({ actions: [
    //         L.ColorPicker.extendOptions({ color: '#db1d0f' }),
    //         L.ColorPicker.extendOptions({ color: '#025100' }),
    //         L.ColorPicker.extendOptions({ color: '#ffff00' }),
    //         L.ColorPicker.extendOptions({ color: '#0000ff' })
    //       ]})
    //     })
    //   ];
	// polygonmap.on('click', function(event) {
    //       this.editMode = true;
    //       new L.Toolbar2.EditToolbar.Popup(event.latlng, {
    //         actions: editActions
    //       });
    //     });
        
	// polygonmap.addTo(this.$refs.draw);
	// this.$refs.map.mapObject.addLayer(polygonmap);
	// polygonmap.addTo(editActions)
		
		
	},
	mounted() {
		this.$nextTick(() => {
      const map =this.$refs.map.mapObject;

      let editActions = [
        L.Toolbar2.EditAction.Popup.Edit,
        L.Toolbar2.EditAction.Popup.Delete,
        L.Toolbar2.Action.extendOptions({
          toolbarIcon: { 
            className: 'leaflet-color-picker', 
            html: '<i class="fas fa-fill-drip"></i>' 
          },
          subToolbar: new L.Toolbar2({ actions: [
            L.ColorPicker.extendOptions({ color: '#db1d0f' }),
            L.ColorPicker.extendOptions({ color: '#025100' }),
            L.ColorPicker.extendOptions({ color: '#ffff00' }),
            L.ColorPicker.extendOptions({ color: '#0000ff' })
          ]})
        })
      ];

      new L.Toolbar2.DrawToolbar({
          position: this.position,
      }).addTo(map);

      map.on('draw:created', function (e) {
        var type = e.layerType,
            layer = e.layer;
		console.log("layer",layer);
        layer.on('click', function(event) {
          this.editMode = true
          new L.Toolbar2.EditToolbar.Popup(event.latlng, {
            actions: editActions
          }).addTo(map, layer);
        });
        if(type=='polygon' || type=='rectangle'){
			layer.addTo(map);
		}
        
      });
	  
	 
    })
	

	// this.$refs.map.mapObject.addLayer(polygonmap);

	
		// Disabling a toolbar item
		// this.$refs.draw.drawOptions.circle = false;
		// this.$refs.map.mapObject.addControl(this.$refs.draw.draw,circle = false);
		// this.$refs.map.mapObject.addControl(this.$refs.draw.draw.marker = false);
		// this.$refs.map.mapObject.addControl(this.$refs.draw.draw.polyline = false);

		// this.$refs.map.mapObject.drawOptions.circle = false;
		// console.log("drawOptions",this.$refs.map.mapObject.draw);
		// LDrawToolbar.initialize()
		// this.$refs.map.mapObject.drawControl.setDrawingOptions({
		// 	position: 'topright',
		// 	draw: {
		// 		circle: false, 
		// 		marker: false,	
		// 		polyline: false, 
		// 		}  // <-- this does nothing
		// 	});
		// this.$refs.map.mapObject.removeControl(drawControl);
		// this.$refs.map.mapObject.addControl(drawControl);
		// this.$refs.map.mapObject.drawControl._toolbars.edit.options

	// 	drawControl = new L.Toolbar2.DrawToolbar({
	// 		position: 'topright',
	// 		draw: {
	// 			circle: false, 
	// 			marker: false,	
	// 			polyline: false, 
	// 			}  // <-- this does nothing
    //   });
	//   	this.$refs.map.mapObject.addControl(drawControl);

	// 	this.$refs.map.mapObject.on("draw:created", (e) => {
	// 		console.log("draw:created", e);
	// 		if (e.layerType === 'rectangle' || e.layerType === 'polygon') {
	// 			console.log("getLatLngs", e.layer.getLatLngs());
	// 			console.log("getBounds", e.layer.getBounds());
	// 			e.layer.addTo(this.$refs.map.mapObject);
   	// 		}
			
	// 		// this.$refs.map.mapObject.addLayer(e.layer);
	// 	});

		
		// this.$refs.map.mapObject.on("draw:edited", (e) => {
		// 	console.log("draw:edited", e);
		// });
		// this.$refs.map.mapObject.on("draw:deleted", (e) => {
		// 	console.log("draw:deleted", e);
		// });
	},
	data() {
		return {
			zoom: 8,
			center: latLng(45.070339, 7.686864),
			currentZoom: 8,
			currentCenter: latLng(45.070339, 7.686864),
			showMap: true,
			uffici_azienda: [],
			office_id: [],
			offices_layer: [],
			office_types: [1, 2, 8, 9],
			schools_layer: [],
			school_types: [3, 4, 5, 6, 7],
			office_list: [],
			azienda: { id: 0 },
			aziende: [],
			loading: false,
			// companyIcon: null,
			wmsRenderKey: Date.now(),
			coworking:false,
			city:null,
			offices_city: [],
			type:null,
			coworking_types:[],
			polygons: [],
			position: "topright",
		};
	},
	computed: {
	},
	methods: {
		zoomUpdate(zoom) {
			this.currentZoom = zoom;
		},
		centerUpdate(center) {
			this.currentCenter = center;
		},
		fitMarkers() {
			this.$refs.map.mapObject.fitBounds(this.offices_layer);
		},
		generateLayer: function (types,coworking=false,city=null,type=null) {
			return this.office_list.filter((x) => {
				if (x.company !== undefined && x.company !== null && x.lat != null && types.includes(x.company.type)) {
					if(coworking){
						if(city !== null){
							if(x.city!== null){
								if(type !== null && (x.city.trim().toLowerCase() == city)){
									if(x.info_coworking!==null ){
										const coworkingType = x.info_coworking.find(item => item.type === type);
										return coworkingType ? true : false;
									}else{
										return false;
									}
								}else{
									return x.coworking && (x.city.trim().toLowerCase() == city);
								}
								
							}
						}else{
							if(type !== null){
								if(x.info_coworking!==null){
									const coworkingType = x.info_coworking.find(item => item.type === type);
									return coworkingType ? true : false;
								}else{
									return false;
								}
							}else{
									return x.coworking;
								}
							
						}
						
					}else{
						if(city !== null){
							if(x.city!== null){
								if(type !== null && (x.city.trim().toLowerCase() == city)){
									if(x.info_coworking!==null){
										const coworkingType = x.info_coworking.find(item => item.type === type);
										return coworkingType ? true : false;
									}else{
										return false;
									}
								}else{
									return (x.city.trim().toLowerCase() == city);
								}
								
							}
							
						}else{
							if(type !== null){
								if(x.info_coworking!==null){
								const coworkingType = x.info_coworking.find(item => item.type === type);
    							return coworkingType ? true : false;
							}else{
								return false;
							}

							}else{
								return true;
							}
							
						}
						
					}
					
				}
			});
		},
		companyIcon(cow) {
			if(cow==1){
				return L.divIcon({
					html: "<i class=\"fa fa-building-o fa-2x\" style=\"color:red\"></i>",
					iconSize: [20, 20],
					className: "myDivIcon",
				});
			}else{
				return L.divIcon({
					html: "<i class=\"fa fa-building-o fa-2x\"></i>",
					iconSize: [20, 20],
					className: "myDivIcon",
				});
			}
			
		},
		toggle(checked) {
			this.offices_layer = this.generateLayer(this.office_types,checked,this.city,this.type);
			this.offices_city = [...new Set(this.offices_layer.map(item => 
			{
				if(!(item.city==null || item.city == undefined || item.city=='') )
				{
					return item.city.trim().toLowerCase();
					// return item.city;
						
				}
			}))];
			this.offices_city.sort(function (a, b) {
						return a > b;
					});
			this.offices_city.unshift(
				{
						id: null,
						name: "Tutte",
					});
			this.city =this.offices_city[0].id;

      },
	  updateCity(){
		this.offices_layer = this.generateLayer(this.office_types,this.coworking,this.city,this.type);
		console.log(this.offices_layer)
	  },
	  updateType(){
		this.offices_layer = this.generateLayer(this.office_types,this.coworking,this.city,this.type);
		this.offices_city = [...new Set(this.offices_layer.map(item => 
			{
				if(!(item.city==null || item.city == undefined || item.city=='') )
				{
					return item.city.trim().toLowerCase();
					// return item.city;
						
				}
			}))];
			this.offices_city.sort(function (a, b) {
						return a > b;
					});
			this.offices_city.unshift(
				{
						id: null,
						name: "Tutte",
					});
			this.city =this.offices_city[0].id;
		console.log(this.offices_layer)
	  },
	  clickCasa(e) {
			console.log("latlng",e.latlng);
			// this.EditToolbar.editLayer(this.$refs.map, e.latlng);
			console.log("target",e.target);
			// this.$refs.map.mapObject.eachLayer(function(layer){
			// 		console.log("layer",layer);
			// 	});
			console.log("draw",this.$refs.draw);
			console.log("poly",this.$refs.poly[0].layer);
			var polygon = this.$refs.poly;
			let editActions = [
				L.Toolbar2.EditAction.Popup.Edit,
				L.Toolbar2.EditAction.Popup.Delete,
				L.Toolbar2.Action.extendOptions({
				toolbarIcon: { 
					className: 'leaflet-color-picker', 
					html: '<i class="fas fa-fill-drip"></i>' 
				},
				subToolbar: new L.Toolbar2({ actions: [
					L.ColorPicker.extendOptions({ color: '#db1d0f' }),
					L.ColorPicker.extendOptions({ color: '#025100' }),
					L.ColorPicker.extendOptions({ color: '#ffff00' }),
					L.ColorPicker.extendOptions({ color: '#0000ff' })
				]})
				})
			];
			this.editMode = true
			new L.Toolbar2.EditToolbar.Popup(e.latlng, {
			actions: editActions
			}).addTo(this.$refs.map.mapObject, e.target);
			// this.$refs.draw.setDrawingOptions({
			// position: 'topright',
			// draw: {
			// 	circle: false, 
			// 	marker: false,	
			// 	polyline: false, 
			// 	}  // <-- this does nothing
			// });
			// console.log("map.layers",this.$refs.map.getLayers());
			// this.getPolygonCoordinates();
			// if (this.casaMarker) {
			// 	this.$refs.map.mapObject.removeLayer(this.casaMarker);
			// }
			// this.casaMarker = marker(this.casa.latLng, {
			// 	icon: homeIcon,
			// 	draggable: true, // permetto all'utente di correggere la posizione all'occorrenza
			// }).addTo(this.$refs.map.mapObject);
		},
		// getPolygonCoordinates() {
		// 			const polygon = this.$refs.map.mapObject._layers[Object.keys(this.$refs.map.mapObject._layers)[0]]; // Assuming the polygon is the first layer on the map
		// 			const coordinates = polygon.getLatLngs()[0]; // Assuming the polygon has only one outer ring

		// 			// Do something with the coordinates
		// 			console.log("Polygon coordinates:", coordinates);
		// 		},

	},
	
};
</script>

<style scoped>
@import "~leaflet.markercluster/dist/MarkerCluster.css";
@import "~leaflet.markercluster/dist/MarkerCluster.Default.css";
@import "~vue-select/dist/vue-select.css";

.myDivIcon {
	text-align: center;
	/* Horizontally center the text (icon) */
	line-height: 20px;
	/* Vertically center the text (icon) */
}

#map-container {
	position: relative;
	height: 90vh;
	min-height: 300px;
}

#spinner-container {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 500;
}

#spinner {
	position: relative;
	top: 50%;
}
</style>
