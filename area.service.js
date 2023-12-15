import httpClient from "@/services/httpClient";

var mime = require("mime-types");

class AreaService {
	editArea(id,form_data) {
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
	addArea(form_data=null) {
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

}

export default new AreaService();
