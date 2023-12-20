<template>
    <div>
		<b-form>
			<b-form-row>
				<b-col md="4" v-if="isAuthorized('admin, moma') && selectedArea=='province'">
					<b-form-group label="Provincia:">
					<b-form-select
						v-model="area.province"
						:options="offices_province"
						value-field="id"
						text-field="name"
						@input="updateProvince($event)"></b-form-select>
					</b-form-group>
				</b-col>
				<b-col md="4" v-if="isAuthorized('admin, moma') && selectedArea=='city'" >
					<b-form-group label="Città:">
					<b-form-select
						v-model="area.city"
						:options="offices_city"
						value-field="id"
						text-field="name"
						@input="updateCity($event)"></b-form-select>
					</b-form-group>
				</b-col>
				<b-col>
					<br>
					<br>
					<b-button @click="fitMarkers()" size="sm" class="btn btn-primary float-right"><i class="ti-fullscreen mr-1"></i>&nbsp;Visualizza tutti gli spazi</b-button>
				</b-col>
		</b-form-row>
		
    	</b-form>
		
		
		<br>
		
		<div id="map-container" class="mt-3">
				<div id="spinner-container" class="text-center" v-if="loading">
					<b-spinner id="spinner" variant="success" label="Spinning"></b-spinner>
				</div>
		
				<l-map 
				id="my-map"  
				:zoom="zoom" 
				:center="center" 
				:options="getMapOptions"
				@update:center="centerUpdate" 
				@update:zoom="zoomUpdate" 
				@ready="fitMarkers"
				ref="map">
					<l-tile-layer 
					:url="getTilesUrl" 
					:attribution="getMapAttribution" 
					:options="getLayerOptions" />

					<span v-if="offices_layer.length > 0">
						<l-marker v-for="office in offices_layer" :key="office.id" :lat-lng="[office.lat, office.lon]"
							:icon="companyIcon" :options="{ title: office.name }">
							<l-popup ><strong>{{ office.company.name }}</strong><br><b-link
									:to="`/offices/edit/${office.id}`"  :disabled="!(loggedUserIsMomaArea || loggedUserIsAdmin || loggedUserIsMomaManagerAziendale)">{{ office.name }}</b-link>
							</l-popup>
						</l-marker>
					</span>	
					<span v-if="polygons.length > 0">
						<l-polygon v-for="polygon in polygons" :key="polygon.id" :lat-lngs="polygon.latlngs" :options="{ color: 'red' }" @click="clickCasa" ref="poly">
							</l-polygon>
					</span>		

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
import AreaService from "../area.service";

const companyIcon = L.divIcon({
	html: "<i class=\"fa fa-building-o fa-2x\"></i>",
	iconSize: [20, 20],
	className: "myDivIcon",
});

export default {
	name: "polygon-edit",
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
	props: {
		area: Object,
		selectedArea: String,
	},
	data() {
		return {
			zoom: 15,
			center: latLng(45.4654219, 9.1859243),
			currentZoom: 11.5,
			currentCenter: latLng(45.4654219, 9.1859243),
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
			companyIcon: companyIcon,
			wmsRenderKey: Date.now(),
			// city:null,
			offices_city: [],
			polygons: [],
			position: "topright",
			// province:null,
			offices_province: [],
			// polygon:null,
			drawControl: null,
		};
	},
	computed: {
	},
	watch: {
		selectedArea: function (val) {
			console.log("selectedArea",val);
			if(val=='polygon'){
				this.drawControl.addTo(this.$refs.map.mapObject);
				this.area.city=null;
				this.area.province=null;
			}else if(val=='city'){
				this.drawControl.remove();
				this.area.province=null;
				this.area.polygon=null;
			}else if(val=='province'){
				this.drawControl.remove();
				this.area.city=null;
				this.area.polygon=null;
			}
			
			this.offices_layer = this.generateLayer(this.area.city,this.area.province);
			console.log(this.offices_layer)
		},
		// city: function (val) {
		// 	this.offices_layer = this.generateLayer(val);
		// 	console.log(this.offices_layer)
		// },
		// province: function (val) {
		// 	this.offices_layer = this.generateLayer(val);
		// 	console.log(this.offices_layer)
		// },
		// polygon: function (val) {
		// 	this.offices_layer = this.generateLayer(val);
		// 	console.log(this.offices_layer)
		// },
	},
	async created () {	
		this.loading = true;	
		let response = await UserService.getOffices(null, "id, name, company_id, lat, lon, Companies.name, Companies.type, address, city, coworking, info_coworking, province");
		this.office_list = response.data.offices;
		this.offices_layer = this.generateLayer();
		this.offices_city = Array.from(new Set(this.offices_layer.reduce((acc, item) => {
		  if (!(item.city == null || item.city == '')) {
			acc.push(item.city.trim().toUpperCase());
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
		// this.city =this.offices_city[0].id;
		// repalce office_city for office_province
		this.offices_province = Array.from(new Set(this.offices_layer.reduce((acc, item) => {
		  if (!(item.province == null || item.province == '')) {
			acc.push(item.province.trim().toUpperCase());
		  }
		  return acc;
		}, []))).filter(value => value !== null);
		
		this.offices_province.sort(function (a, b) {
					return a > b;
				});
		this.offices_province.unshift(
			{
					id: null,
					name: "Tutte",
				});
		// this.province = this.offices_province[0].id;
		
		this.offices_layer = this.generateLayer(this.area.city,this.area.province);
		if(this.area.polygon !== null && this.selectedArea=='polygon'){
			let polygon = {
			latlngs: this.area.polygon.replace("POLYGON((","").replace("))","").split(",").map(function (item) {
				return item.split(" ").map(function (item) {
					return parseFloat(item);
				});
			})
			};
			this.polygons.push(polygon);
			this.$refs.map.mapObject.fitBounds(polygon.latlngs);	
			// remove drawControl
			this.drawControl.remove();

			this.loading = false;
			

		}else{
			this.loading = false;	
			this.fitMarkers();	

		}
		console.log("areacreated",this.area);

		
		
	 
		
// 		let polygon = await AreaService.editArea(1,null);
// 	console.log("polygon",polygon);
// 	let polygonarea = polygon.data.area.polygon;
// 	this.area=polygon.data.area;
	
// 	// become this string polygon=POLYGON((45.08 7.69,45.08 7.7,45.1 7.7,45.1 7.69,45.08 7.69)) to this.polygon: {
// //     latlngs: [[45.08 , 7.69], [45.08 , 7.7], [45.1 7.7], [45.1 7.69], [45.08 7.69]]
// //   },
// 	this.polygon = {
// 	latlngs: polygonarea.replace("POLYGON((","").replace("))","").split(",").map(function (item) {
// 		return item.split(" ").map(function (item) {
// 			return parseFloat(item);
// 		});
// 	})
// 	};
// 	this.polygons.push(this.polygon);
// 	console.log("this.polygon",this.polygons);
	
	

	// let polygon = {
	// latlngs: this.polygon.replace("POLYGON((","").replace("))","").split(",").map(function (item) {
	// 	return item.split(" ").map(function (item) {
	// 		return parseFloat(item);
	// 	});
	// })
	// };
	// this.polygons.push(polygon);

		
	// // this.polygon = polygon.data.area.polygon.replace("POLYGON((","").replace("))","").split(",");
	// console.log("this.polygon",this.polygons);
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
	async mounted() {
		// this.$nextTick(() => {
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

	  // remove polyline, marker ,rectangle and circle from drawControl
	  
	this.drawControl = new L.Toolbar2.DrawToolbar({
		position: this.position,
		actions: [
			L.Toolbar2.DrawAction.Polygon,
		],
	})
	console.log("adddraw",this.area.polygon,this.selectedArea);
	if(this.area.polygon == null && this.selectedArea=='polygon'){
		this.drawControl.addTo(map);
	}


		

     
        
    //   });

	  map.on("draw:created", (e) =>{
        var type = e.layerType,
            layer = e.layer;
		console.log("layer",layer);
        layer.on('click', function(event) {
          this.editMode = true
          new L.Toolbar2.EditToolbar.Popup(event.latlng, {
            actions: editActions
          }).addTo(map, layer);
        	});
		console.log("area",this.area);
        if(type=='polygon'){
			// console.log("ref",this.$refs.map.mapObject);
			layer.addTo(map);
			console.log("layer",layer);
			console.log("area",this.area);
			this.area.polygon = "POLYGON(("+layer._latlngs[0].map(function (item) {
				console.log("item",item);
				return item.lat + " " + item.lng;
			}).join(",") + "," + layer._latlngs[0][0].lat + " " + layer._latlngs[0][0].lng + "))";
			}
			map.removeControl(this.drawControl);
		});
		

	  map.on("draw:edited", (e) => {
			console.log("draw:edited", e);
			console.log("draw:edited", e.layers._layers[Object.keys(e.layers._layers)[0]]._latlngs);
			// become this array e.layers._layers[Object.keys(e.layers._layers)[0]]._latlngs = Array(5) [ {…}, {…}, {…}, {…}, {…} ]
				// ​
				// 0: Object { lat: 45.08, lng: 7.69 }
				// ​
				// 1: Object { lat: 45.08, lng: 7.7 }
				// ​
				// 2: Object { lat: 45.08996539529993, lng: 7.719419817183387, equals: equals(obj, maxMargin), … }
				// ​
				// 3: Object { lat: 45.1, lng: 7.7 }
				// ​
				// 4: Object { lat: 45.1, lng: 7.69 }
				// ​
				// length: 5
				// ​
				// <prototype>: Array []

				
			// to this string polygon='POLYGON((45.08 7.69,45.08 7.7,45.1 7.7,45.1 7.69,45.08 7.69))'
			// limit item to 2 decimal and repeat the frist item at the end
			// var polygon = "POLYGON(("+e.layers._layers[Object.keys(e.layers._layers)[0]]._latlngs[0].map(function (item) {
			// 	console.log("item",item);
			// 	return item.lat.toFixed(2) + " " + item.lng.toFixed(2);
			// }).join(",") + "," + e.layers._layers[Object.keys(e.layers._layers)[0]]._latlngs[0][0].lat.toFixed(2) + " " + e.layers._layers[Object.keys(e.layers._layers)[0]]._latlngs[0][0].lng.toFixed(2) + "))";
			// console.log("polygon",polygon);

			// // var polygon = e.layers._layers[Object.keys(e.layers._layers)[0]].toGeoJSON().geometry;
			// let res = this.editArea(1, polygon);
			// // await UserService.editArea(id, polygon);
			console.log("areaedit", this.area);
			this.area.polygon = "POLYGON(("+e.layers._layers[Object.keys(e.layers._layers)[0]]._latlngs[0].map(function (item) {
				console.log("item",item);
				return item.lat + " " + item.lng;
			}).join(",") + "," + e.layers._layers[Object.keys(e.layers._layers)[0]]._latlngs[0][0].lat + " " + e.layers._layers[Object.keys(e.layers._layers)[0]]._latlngs[0][0].lng + "))";
			map.removeControl(this.drawControl);
		});
		map.on("draw:deleted", (e) => {
			console.log("draw:deleted", e);
			this.area.polygon = null;
			//add drawtoolbar
			map.addControl(this.drawControl);
			

			
		});
		
    // })
	

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

		
		
	},
	methods: {
		zoomUpdate(zoom) {
			this.currentZoom = zoom;
		},
		centerUpdate(center) {
			this.currentCenter = center;
		},
		fitMarkers(e) {
			console.log("fitMarkers",e);
			if(this.offices_layer.length > 0){
				this.$refs.map.mapObject.fitBounds(this.offices_layer);
			}
			this.loading = false;
		},
		generateLayer: function (city=null,province=null) {
			return this.office_list.filter((x) => {
				if (x.company !== undefined && x.company !== null && x.lat != null) {
						if(city !== null){
							if(x.city!== null){
								if((x.city.trim().toUpperCase() == city)){
									return (x.city.trim().toUpperCase() == city);
								}
							
							}
						}else if(province !== null){
							if(x.province!== null){
								if((x.province.trim().toUpperCase() == province)){
									return (x.province.trim().toUpperCase() == province);
								}
							}
							

						}else{
							return true;
						}
					
				}
			});
		},
	  updateCity(){
		this.offices_layer = this.generateLayer(this.area.city,null);
		console.log(this.offices_layer)
		console.log("city",this.area.city)
	  },
	  updateProvince(){
		this.offices_layer = this.generateLayer(null,this.area.province);
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
		async editArea(id, polygon) {
		try {
			let response = await AreaService.editArea(id,{polygon: polygon} );
			this.wmsRenderKey = Date.now();
			return response;
		} catch (error) {
			console.log(error);
		}
		},
	},
	
	
};
</script>

<style >
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
