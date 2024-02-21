import httpClient from "@/services/httpClient";

var mime = require("mime-types");

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
	// get companies to export data from export list
	async getExportList(type = null, q = null) {
		var params = new URLSearchParams();
		if (type) {
			params.append("type", type);
		}
		if (q) {
			params.append("q", q);
		}
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
