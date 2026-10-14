<template>
  <div>
    <b-form>
      <b-form-row class="align-items-end">
        <b-col
          v-if="isAuthorized('admin, moma') && selectedArea=='province'"
          md="4"
        >
          <b-form-group
            :label="$t('momarea.components.PolygonEdit.province')"
            label-for="momarea-poly-province"
          >
            <b-form-select
              id="momarea-poly-province"
              v-model="area.province"
              :options="offices_province"
              value-field="id"
              text-field="name"
              @update:model-value="updateProvince"
            />
          </b-form-group>
        </b-col>
        <b-col
          v-if="isAuthorized('admin, moma') && selectedArea=='city'"
          md="4"
        >
          <b-form-group
            :label="$t('momarea.components.PolygonEdit.city')"
            label-for="momarea-poly-city"
          >
            <b-form-select
              id="momarea-poly-city"
              v-model="area.city"
              :options="offices_city"
              value-field="id"
              text-field="name"
              @update:model-value="updateCity"
            />
          </b-form-group>
        </b-col>
        <b-col
          v-if="isAuthorized('admin, moma') && selectedArea=='city'"
          md="4"
        >
          <b-form-group
            :label="$t('momarea.components.PolygonEdit.filterProvince')"
            label-for="momarea-poly-province-filter"
          >
            <b-form-select
              id="momarea-poly-province-filter"
              v-model="cityProvinceFilter"
              :options="filterProvinceOptions"
              value-field="id"
              text-field="name"
              @update:model-value="updateCityFilter"
            />
          </b-form-group>
        </b-col>
        <b-col class="d-flex justify-content-end align-self-end mb-3 mb-md-0">
          <b-button
            size="sm"
            variant="primary"
            @click="fitMarkers()"
          >
            <b-icon
              icon="arrows-fullscreen"
              aria-hidden="true"
              class="me-1"
            />
            {{ $t('momarea.components.PolygonEdit.see_spaces') }}
          </b-button>
        </b-col>
        <b-col
          cols="12"
          class="mt-2"
        >
          <p class="text-muted small mb-0">
            {{ $t('momarea.components.PolygonEdit.keyboardHint') }}
          </p>
        </b-col>
      </b-form-row>
    </b-form>

    <div
      id="map-container"
      class="mt-3"
      role="region"
      :aria-label="$t('momarea.momarea.mapRegionLabel')"
    >
      <div
        v-if="loading"
        id="spinner-container"
        role="status"
        aria-live="polite"
      >
        <b-spinner
          variant="primary"
          :label="$t('momarea.export.loading')"
        />
        <span class="mt-2">{{ $t('momarea.export.loading') }}</span>
      </div>
		
      <l-map 
        id="my-map"  
        ref="map" 
        :zoom="zoom" 
        :center="center"
        :options="getMapOptions" 
        @update:center="centerUpdate" 
        @update:zoom="zoomUpdate"
        @ready="onMapReady"
      >
        <l-tile-layer 
          :url="getTilesUrl" 
          :attribution="getMapAttribution" 
          :options="getLayerOptions"
        />

        <span v-if="offices_layer.length > 0">
          <l-marker
            v-for="office in offices_layer"
            :key="office.id"
            :lat-lng="[office.lat, office.lon]"
            :icon="companyIcon"
            :options="{ title: `${office.company.name}, ${office.name}` }"
          >
            <l-popup>
              <strong>{{ office.company.name }}</strong><br>
              <!-- aria-label only (visible text stays office.name) - static
                   IT string on purpose, per explicit request, not $t() -->
              <b-link
                v-if="loggedUserIsMomaArea || loggedUserIsAdmin || loggedUserIsMomaAzienda"
                :to="`/offices/edit/${office.id}`"
                :aria-label="`Vai a ${office.name}, ${office.company.name}`"
              >{{ office.name }}</b-link>
              <span v-else>{{ office.name }}</span>
            </l-popup>
          </l-marker>
        </span>	
        <span v-if="polygons.length > 0">
          <l-polygon
            v-for="polygon in polygons"
            :key="polygon.id"
            ref="poly"
            :lat-lngs="polygon.latlngs"
            :options="{ color: 'red' }"
          />
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
import { LMap, LTileLayer, LMarker, LCircleMarker, LWmsTileLayer, LPopup, LPolygon } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import UserService from "@/services/user.service";
// leaflet-draw registers L.Control.Draw / L.FeatureGroup draw+edit
// extensions on the global L; no Vue 3 wrapper is needed since we drive
// the control imperatively from onMapReady().
import 'leaflet-draw';
import AreaService from "../area.service";
import { buildTerritoryOptions } from "@/services/territory-options";

const companyIcon = L.divIcon({
	html: "<i class=\"fa fa-building fa-2x\"></i>",
	iconSize: [20, 20],
	className: "myDivIcon",
});

export default {
	name: "PolygonEdit",
	components: {
		LMap,
		LMarker,
		LTileLayer,
		LCircleMarker,
		LPopup,
		"l-wms-tile-layer": LWmsTileLayer,
		LPolygon,
	},
	mixins: [Util],
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
			drawnItems: null,
			cityProvinceFilter: null,
			filterProvinceOptions: [],
			territories: null,
		};
	},
	computed: {
	},
	watch: {
		selectedArea: function (val) {
			console.log("selectedArea",val);
			if(val=='polygon'){
				// this.drawControl is set in initMapControls() (leaflet-draw's
				// L.Control.Draw); guarded here only in case this watcher ever
				// fires before onMapReady() has run.
				if (this.drawControl) {
					this.drawControl.addTo(this.$refs.map.leafletObject);
				}
				this.applyDrawPolygonLabel();
				this.area.city=null;
				this.area.province=null;
			}else if(val=='city'){
				if (this.drawControl) {
					this.drawControl.remove();
				}
				this.area.province=null;
				this.area.polygon=null;
				// remove polygon layer
				this.polygons=[];
				// remove polygon from map
				this.$refs.map.leafletObject.eachLayer(function(layer){
					if(layer instanceof L.Polygon){
						layer.remove();
					}
				});
			}else if(val=='province'){
				if (this.drawControl) {
					this.drawControl.remove();
				}
				this.area.city=null;
				this.area.polygon=null;
				this.polygons=[];
				this.$refs.map.leafletObject.eachLayer(function(layer){
					if(layer instanceof L.Polygon){
						layer.remove();
					}
				});
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

		// Fetch territories data; on failure, fallback to office-only options
		try {
			const territoriesResponse = await AreaService.getTerritories();
			this.territories = territoriesResponse.data;
		} catch (error) {
			console.warn("Failed to fetch territories", error);
			this.territories = { provinces: [], comuni: {} };
		}

		// Build province and city options using the territories helper
		const territoryOpts = buildTerritoryOptions({
			offices: this.office_list,
			territories: this.territories,
			province: null, // No filter initially
		});

		// Convert arrays to the {id, name} option format for selects
		this.offices_province = territoryOpts.provinces.map(p => ({ id: p, name: p }));
		this.offices_province.unshift({ id: null, name: "Tutte" });

		this.offices_city = territoryOpts.cities.map(c => ({ id: c, name: c }));
		this.offices_city.unshift({ id: null, name: "Tutte" });

		// Initialize filter province options (all provinces)
		this.filterProvinceOptions = territoryOpts.provinces.map(p => ({ id: p, name: p }));
		this.filterProvinceOptions.unshift({ id: null, name: "Tutte" });
		this.cityProvinceFilter = null;
		
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
			this.$refs.map.leafletObject.fitBounds(polygon.latlngs, { maxZoom: 16 });
			// remove drawControl
			if (this.drawControl) {
				this.drawControl.remove();
			}

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
	// this.$refs.map.leafletObject.addLayer(polygonmap);
	// polygonmap.addTo(editActions)
		
		
	},
	methods: {
		// vue-leaflet's leafletObject isn't synchronously available in mounted()
		// (see docs/dev-notes/vue-leaflet-mapobject-fix.md) - this file's own
		// <l-map @ready="..."> already proved the working pattern via
		// fitMarkers(), so the rest of the map-dependent setup that used to live
		// directly in mounted() (and threw "map is undefined" there) hangs off
		// the same ready event instead. Guarded so it only runs once even if
		// ready ever fires again (e.g. a future map remount).
		onMapReady(e) {
			this.fitMarkers(e);
			if (this._mapControlsInitialized) {
				return;
			}
			this._mapControlsInitialized = true;
			this.initMapControls();
		},
		initMapControls() {
      const map =this.$refs.map.leafletObject;

      // Issue 12 (a11y, WCAG 2.1.1/2.4.3): Leaflet renders popup content in a
      // separate DOM pane (.leaflet-popup-pane), outside the marker's tab
      // order. The marker itself is already keyboard-focusable/-activatable
      // (divIcon + default `keyboard: true` map option - see getMapOptions in
      // src/mixing/util.js), but once the popup opens, focus never moves into
      // it, so a keyboard user can never reach the link inside. One listener
      // at map level (not per-marker) is enough since offices_layer/markers
      // change dynamically with the city/province filters.
      map.on('popupopen', (e) => {
        // WCAG 4.1.2 (disclosure pattern): the marker is the trigger for this
        // popup, so its aria-expanded must flip to true the moment the popup
        // opens - independent of the focus-management logic below.
        const marker = e.popup._source;
        const markerEl = marker && typeof marker.getElement === 'function' ? marker.getElement() : null;
        if (markerEl) {
          markerEl.setAttribute('aria-expanded', 'true');
        }
        const container = e.popup.getElement();
        if (!container) {
          return;
        }
        const focusable = container.querySelector('a, button, [tabindex]');
        if (focusable) {
          focusable.focus();
        }

        // WCAG 2.1.2/2.4.3: Tab/Shift+Tab past the close button must close
        // the popup, not leave it open behind. Native Tab can't do this:
        // `popupPane` is created after `markerPane` (Map._initPanes()), so
        // it's always later in the DOM - forward Tab from an open popup
        // structurally can't reach a later marker, it exits the whole map
        // (confirmed live: closing on focus-out and trusting/reasserting
        // `relatedTarget` still skipped every marker). So we compute the
        // real next/previous marker ourselves (via markerPane's DOM order +
        // the last Tab keydown's Shift state) and focus it directly.
        let tabForward = true;
        const handleKeyDown = (keyDownEvent) => {
          if (keyDownEvent.key === 'Tab') {
            tabForward = !keyDownEvent.shiftKey;
          } else if (keyDownEvent.key === 'Escape') {
            // Not reliably handled by Leaflet's own closeOnEscapeKey here -
            // close explicitly instead of trusting it.
            map.closePopup(e.popup);
          }
        };
        const handleFocusOut = (focusOutEvent) => {
          const next = focusOutEvent.relatedTarget;
          if (next && container.contains(next)) {
            // Still inside the popup (e.g. link -> close button) - stays open.
            return;
          }
          this._popupClosedByFocusOut = true;
          const markerPane = map.getPane('markerPane');
          const markerEls = markerPane ? Array.from(markerPane.querySelectorAll('[tabindex]')) : [];
          const sourceEl = e.popup._source && typeof e.popup._source.getElement === 'function'
            ? e.popup._source.getElement()
            : null;
          const currentIndex = sourceEl ? markerEls.indexOf(sourceEl) : -1;
          const targetEl = currentIndex === -1 ? null : markerEls[currentIndex + (tabForward ? 1 : -1)];
          map.closePopup(e.popup);
          if (targetEl) {
            targetEl.focus();
          } else if (next && document.contains(next)) {
            // First/last marker in this direction - nothing left to step to.
            next.focus();
          }
        };
        container.addEventListener('keydown', handleKeyDown);
        container.addEventListener('focusout', handleFocusOut);
        e.popup._a11yKeyDownHandler = handleKeyDown;
        e.popup._a11yFocusOutHandler = handleFocusOut;
        e.popup._a11yFocusOutContainer = container;
      });
      map.on('popupclose', (e) => {
        // Read once up front (not only in the focus step below) so
        // aria-expanded resets to false on every close path, including the
        // focus-out path that returns early before reaching the marker.focus() call.
        const marker = e.popup._source;
        const markerEl = marker && typeof marker.getElement === 'function' ? marker.getElement() : null;
        if (markerEl) {
          markerEl.setAttribute('aria-expanded', 'false');
        }
        if (e.popup._a11yFocusOutContainer) {
          e.popup._a11yFocusOutContainer.removeEventListener('focusout', e.popup._a11yFocusOutHandler);
          e.popup._a11yFocusOutContainer.removeEventListener('keydown', e.popup._a11yKeyDownHandler);
          delete e.popup._a11yFocusOutHandler;
          delete e.popup._a11yKeyDownHandler;
          delete e.popup._a11yFocusOutContainer;
        }
        if (this._popupClosedByFocusOut) {
          // Focus already moved to a real element (e.g. the next marker) -
          // leave it there instead of yanking it back to the origin marker.
          this._popupClosedByFocusOut = false;
          return;
        }
        if (markerEl) {
          markerEl.focus();
        }
      });
      // Initial aria-expanded=false on every office marker, set as soon as
      // Leaflet adds it to the map - independent of when/if the l-popup
      // child component finishes binding its popup, so this can't race that.
      // Matched by icon.options.className (not object identity against the
      // module-level companyIcon const): Vue 3 wraps the `companyIcon` data
      // property in a reactive Proxy, so the icon instance Leaflet actually
      // stores on the marker is that Proxy, never === the raw module const.
      map.on('layeradd', (e) => {
        const layer = e.layer;
        const iconOptions = layer && layer.options && layer.options.icon && layer.options.icon.options;
        if (iconOptions && iconOptions.className === 'myDivIcon' && typeof layer.getElement === 'function') {
          const el = layer.getElement();
          if (el) {
            el.setAttribute('aria-expanded', 'false');
          }
        }
      });

      // leaflet-draw's L.Control.Draw is the real, installed drawing toolbar
      // (see Momarea's CLAUDE.md - the L.Toolbar2.* API this file used to
      // call belonged to a bridge plugin that was never actually installed).
      // drawnItems holds the single drawn/loaded polygon layer; edit/delete
      // are handled by leaflet-draw's own standard toolbar buttons via the
      // edit.featureGroup option below, replacing the retired per-layer
      // click-to-open-popup micro-UI (L.Toolbar2.EditToolbar.Popup +
      // L.ColorPicker, neither of which was ever provided by any installed
      // package).
      this.drawnItems = new L.FeatureGroup();
      map.addLayer(this.drawnItems);
      this.drawControl = new L.Control.Draw({
        position: this.position,
        draw: {
          polygon: {},
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: this.drawnItems,
          remove: true,
        },
      });
      if (this.area.polygon == null && this.selectedArea == 'polygon') {
        this.drawControl.addTo(map);
        this.applyDrawPolygonLabel();
      }

      map.on("draw:created", (e) => {
        var type = e.layerType,
          layer = e.layer;
        if (type == 'polygon') {
          // Only one polygon per area - clear any previous one before
          // adding the new one.
          this.drawnItems.clearLayers();
          this.drawnItems.addLayer(layer);
          this.area.polygon = "POLYGON((" + layer._latlngs[0].map(function (item) {
            return item.lat + " " + item.lng;
          }).join(",") + "," + layer._latlngs[0][0].lat + " " + layer._latlngs[0][0].lng + "))";
        }
      });

      map.on("draw:edited", (e) => {
        this.area.polygon = "POLYGON((" + e.layers._layers[Object.keys(e.layers._layers)[0]]._latlngs[0].map(function (item) {
          return item.lat + " " + item.lng;
        }).join(",") + "," + e.layers._layers[Object.keys(e.layers._layers)[0]]._latlngs[0][0].lat + " " + e.layers._layers[Object.keys(e.layers._layers)[0]]._latlngs[0][0].lng + "))";
      });
      map.on("draw:deleted", () => {
        this.area.polygon = null;
        // Idempotent re-add: the control's lifecycle is now driven by
        // drawnItems.clearLayers()/addLayer() rather than remove/re-add, so
        // defensively remove first to avoid double-adding it to the map.
        map.removeControl(this.drawControl);
        map.addControl(this.drawControl);
        this.applyDrawPolygonLabel();
      });

    // })
	

	// this.$refs.map.leafletObject.addLayer(polygonmap);

	
		// Disabling a toolbar item
		// this.$refs.draw.drawOptions.circle = false;
		// this.$refs.map.leafletObject.addControl(this.$refs.draw.draw,circle = false);
		// this.$refs.map.leafletObject.addControl(this.$refs.draw.draw.marker = false);
		// this.$refs.map.leafletObject.addControl(this.$refs.draw.draw.polyline = false);

		// this.$refs.map.leafletObject.drawOptions.circle = false;
		// console.log("drawOptions",this.$refs.map.leafletObject.draw);
		// LDrawToolbar.initialize()
		// this.$refs.map.leafletObject.drawControl.setDrawingOptions({
		// 	position: 'topright',
		// 	draw: {
		// 		circle: false, 
		// 		marker: false,	
		// 		polyline: false, 
		// 		}  // <-- this does nothing
		// 	});
		// this.$refs.map.leafletObject.removeControl(drawControl);
		// this.$refs.map.leafletObject.addControl(drawControl);
		// this.$refs.map.leafletObject.drawControl._toolbars.edit.options

	// 	drawControl = new L.Toolbar2.DrawToolbar({
	// 		position: 'topright',
	// 		draw: {
	// 			circle: false, 
	// 			marker: false,	
	// 			polyline: false, 
	// 			}  // <-- this does nothing
    //   });
	//   	this.$refs.map.leafletObject.addControl(drawControl);

	// 	this.$refs.map.leafletObject.on("draw:created", (e) => {
	// 		console.log("draw:created", e);
	// 		if (e.layerType === 'rectangle' || e.layerType === 'polygon') {
	// 			console.log("getLatLngs", e.layer.getLatLngs());
	// 			console.log("getBounds", e.layer.getBounds());
	// 			e.layer.addTo(this.$refs.map.leafletObject);
   	// 		}
			
	// 		// this.$refs.map.leafletObject.addLayer(e.layer);
	// 	});

		
		
	},
		zoomUpdate(zoom) {
			this.currentZoom = zoom;
		},
		centerUpdate(center) {
			this.currentCenter = center;
		},
		fitMarkers(e) {
			console.log("fitMarkers",e);
			if(this.offices_layer.length > 0){
				this.$refs.map.leafletObject.fitBounds(this.offices_layer, { maxZoom: 16 });
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
	  updateCityFilter(){
		const territoryOpts = buildTerritoryOptions({
			offices: this.office_list,
			territories: this.territories,
			province: this.cityProvinceFilter,
		});
		this.offices_city = territoryOpts.cities.map(c => ({ id: c, name: c }));
		this.offices_city.unshift({ id: null, name: "Tutte" });
		if (this.area.city && !territoryOpts.cities.includes(this.area.city)) {
			this.area.city = null;
		}
	  },
		async editArea(id, polygon) {
		try {
			let response = await AreaService.editArea(id,{polygon: polygon} );
			this.wmsRenderKey = Date.now();
			return response;
		} catch (error) {
			console.log(error);
		}
		},
		applyDrawPolygonLabel() {
			// leaflet-draw renders the "draw polygon" button as an icon-only
			// <a> with no aria-label and an untranslated "Draw a polygon" title;
			// L.drawLocal can't fix this because the string is copied once at
			// module-import time, before any Vue lifecycle hook runs. The DOM
			// node itself is recreated synchronously on every addTo()/addControl(),
			// so this must be called right after each one.
			const map = this.$refs.map.leafletObject;
			const link = map.getContainer().querySelector('a.leaflet-draw-draw-polygon');
			if (!link) return;
			const label = this.$t('momarea.components.PolygonEdit.drawPolygonAriaLabel');
			link.setAttribute('aria-label', label);
			link.setAttribute('title', label);
		},
	},
	
	
};
</script>

<style>
@import "leaflet.markercluster/dist/MarkerCluster.css";
@import "leaflet.markercluster/dist/MarkerCluster.Default.css";
@import "vue-select/dist/vue-select.css";
@import "leaflet-draw/dist/leaflet.draw.css";

.myDivIcon {
	text-align: center;
	/* Horizontally center the text (icon) */
	line-height: 20px;
	/* Vertically center the text (icon) */
}

/* Issue 12 (a11y): the Leaflet popup is rendered outside this component's
   scoped template (in .leaflet-popup-pane, a sibling of #map-container), so
   the shared Paper-Dashboard-focus-outline-restore convention used elsewhere
   in this module (".momarea-page :focus-visible", scoped) cannot reach it.
   Kept here, in the module's already non-scoped <style> block. */
.leaflet-popup-content a:focus-visible {
	outline: 2px solid currentColor;
	outline-offset: 2px;
}

#map-container {
	position: relative;
	height: 60vh;
	min-height: 320px;
	border: 1px solid rgba(0, 0, 0, 0.125);
	border-radius: 6px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	overflow: hidden;
}

#spinner-container {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.65);
	z-index: 500;
}


</style>
