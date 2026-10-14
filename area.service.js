import httpClient from "@/services/httpClient";

// CakePHP's find('list') returns an associative array keyed by the row's
// primary key (never a 0-indexed sequential array in practice - real DB ids,
// UUID or int), so json_encode() always serializes it as a JSON OBJECT, never
// an array: { "9fa6c4c0-...": "user@example.com" }. bootstrap-vue-next's
// options normalizer (useFormSelect's normalizeOptions) does an unconditional
// opts.map(...) with no Array.isArray guard, so binding this object directly
// to :options on <b-form-checkbox-group>/<b-form-select> throws
// "(intermediate value).map is not a function" and the page never finishes
// mounting. Reproduces on every brand (not rer-specific) since find('list')
// never returns a sequential array. Keys are coerced to String even when the
// DB id is a native integer, so this stays consistent with
// selectedUsers()'s getter below (also String-coerced) - a type mismatch
// between an option's `value` and the v-model array would silently break the
// pre-checked state when editing an area with already-linked users.
export function usersMapToOptions(usersMap) {
	if (usersMap == null) {
		return [];
	}
	if (Array.isArray(usersMap)) {
		return usersMap;
	}
	return Object.entries(usersMap).map(([id, email]) => ({ value: String(id), text: email }));
}

class AreaService {
	async editArea(id,form_data) {
		if(form_data == null){
			return httpClient.get(`/areas/edit/${id}.json`);
		}else{
			return httpClient({
				method: "post",
				url: `/areas/edit/${id}.json`,
				data: form_data,
	
			});
		}
	}
	async indexAreas(area_name=null,username=null) {
		if(area_name == null && username == null){
			return httpClient.get(`/areas/index.json`);
		}else if(area_name == null){
			return httpClient.get(`/areas/index.json?username=${username}`);
		}else if(username == null){
			return httpClient.get(`/areas/index.json?area_name=${area_name}`);
		}else
		{
			return httpClient.get(`/areas/index.json?area_name=${area_name}&username=${username}`);
		}
		
	}
	async addArea(form_data=null) {
		if(form_data == null){
			return httpClient.get(`/areas/add.json`);
		}else{
			return httpClient({
				method: "post",
				url: `/areas/add.json`,
				data: form_data,
	
			});
		}
	}
	async deleteArea(id) {
		return httpClient({
			method: "post",
			url: `/areas/delete/${id}.json`,
		});
	}
	async getTerritories() {
		return httpClient.get("/areas/territories.json");
	}
	// get companies to export data from export list
	async getExportList(paramsOrYear = "2023", type = null, q = null, page = 1, limit = 10) {
		const defaults = {
			year: "2023",
			type: null,
			q: null,
			page: 1,
			limit: 10,
		};

		let config = { ...defaults };

		if (typeof paramsOrYear === "object" && paramsOrYear !== null) {
			config = { ...config, ...paramsOrYear };
		} else {
			const numericYear = Number(paramsOrYear);
			const looksLikeYear = !Number.isNaN(numericYear) && numericYear >= 2000 && numericYear <= 2100;

			if (looksLikeYear) {
				config = {
					...config,
					year: String(paramsOrYear),
					type,
					q,
					page,
					limit,
				};
			} else {
				config = {
					...config,
					type: paramsOrYear,
					q: type,
					page: q || 1,
					limit: page || 10,
				};
			}
		}

		const params = new URLSearchParams();
		if (config.year) {
			params.append("year", config.year);
		}
		if (config.type) {
			params.append("type", config.type);
		}
		if (config.q) {
			params.append("q", config.q);
		}
		params.append("page", String(config.page || 1));
		params.append("limit", String(config.limit || 10));

		return httpClient.get("/companies/ExportList.json?" + params.toString());
	}
	// post questions for export
	async getExportQuestions(survey_id,export_data) {
		return httpClient({
			method: "post",
			url: `/answers/getExportQuestions.json`,
			data: export_data,

		});
	}

}

export default new AreaService();
