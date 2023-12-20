<template>
    <div>
        <b-table 
        striped
        hover
        :items="companies" 
        :fields="fields"   
        :busy="loading">
            <template #cell(name)="row">
                {{ row.item.name }}
            </template>
            <!-- count numbre of employees -->
            <template #cell(num_employees)="row">
                {{ row.item.offices.reduce((a, b) => a + b.num_employees, 0) }}
            </template>
                <template #cell(moma_name)="row">
                    <template v-for="user in row.item.users">
                        <b-tr >{{ user.first_name }}</b-tr> 
                    </template>
                </template>

            <template #cell(offices)="row" >
                <template v-for="office in row.item.offices">
                    <b-tr v-if="office.pscl!==null">{{ office.name }}</b-tr>  
                </template>
                <!-- {{ row.item.offices.length>0 ? "" : "" }}
                <b-tr v-for="row.item.offices.map(office => office.name) ">{{}}</b-tr> -->
            </template>
            <template #cell(pscl)="row" >
                <template v-for="office in row.item.offices">
                    <b-tr v-if="office.pscl!==null">
                        <b-icon
                        @click="DownloadPscl(row.item.id,office.id,row.item.name)"
                        icon="download"
                        :title="`PSCL ${office.name}`">
                        </b-icon>
                    </b-tr>  
                </template>
            </template>
            <template #cell(survey)="row">
                <template v-for="survey in row.item.surveys">
                    <b-tr v-if="survey!==null">{{ survey.name }}</b-tr>
                </template>
            </template>
            <template #cell(surveyresults)="row">
                <template v-for="survey in row.item.surveys">
                    <b-tr v-if="survey!==null">
                        <b-icon
                        @click="exportSurveyData(survey.id,survey.name)"
                        icon="download"
                        :title="`Risultati Questionario ${survey.name}`">
                        </b-icon>
                    </b-tr>
                </template>
            </template>
            <template #cell(offices_num)="row">
                {{ row.item.offices.length }}
            </template>
            <template #table-busy>
                <div class="text-center text-danger my-2">
                <b-spinner class="align-middle"></b-spinner>
                <strong>Loading...</strong>
                </div>
            </template>
        </b-table>
    </div>
</template>

<script>
import UserService from "@/services/user.service";
import AreaService from "../area.service";
import Util from "@/mixing/util";
var mime = require("mime-types");

export default {
    mixins: [Util],
    data() {
        return {
            companies: [
                { id: 1, name: 'Company A', offices: 'Area 1' },
                { id: 2, name: 'Company B', offices: 'Area 2' },
                { id: 3, name: 'Company C', offices: 'Area 1' },
                // Add more companies here
            ],
            fields: [
                // { key: 'id', label: 'ID' },
                { key: 'name', label: 'Name' , sortable: true},
                //add moma Area name and moma Area email
                {key:'moma_name', label:'Moma Area', sortable: true},
                {key:'moma_email',label:'Moma Email', sortable: true},
                { key: 'num_employees', label: 'Numero Impiegati / Studenti', sortable: true},
                { key: 'offices_num', label: 'numero di sedi', sortable: true },
                { key: 'offices', label: 'Sedi', sortable: true },
                {key:'pscl', label: 'PSCL'},
                { key: 'survey', label: 'Questionari', sortable: true },
                { key: 'surveyresults', label: 'Risultati Questionario'},
                
            ],
        };
    },
   async created() {
        this.loading = true;
        await AreaService.getExportList().then((res) => {
            this.companies = res.data.companies;
        });
        this.loading = false;
    },
    methods: {
        async DownloadPscl(company_id, office_id,companyName) {
            let files = (await UserService.listPSCL(company_id, office_id)).data.files;
            if(files.length>0){
                let fname = files[files.length-1];
                console.log(fname);
                try {
                    this.busy = true;
                    const res = await UserService.downloadPSCL(company_id, office_id, fname);
                    let ext = mime.extension(res.data.type);
                    if (ext === "json") {
                        this.$bvToast.toast("Nessun file caricato", {
                            title: "No Uploads",
                            variant: "warning",
                            autoHideDelay: 2000,
                            appendToast: true,
                        });
                        return;
                    }
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", `${fname}-${companyName}.${ext}`);
                    document.body.appendChild(link);
                    link.click();
                } catch (e) {
                    console.log(e);
                } finally {
                    this.busy = false;
                }
            }else{
                this.$bvToast.toast("Nessun file caricato", {
                    title: "No Uploads",
                    variant: "warning",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
            }
            // await AreaService.downloadPscl(company_id, office_id);
        },
        async exportSurveyData(survey_id, survey_name) {
			try {
				this.busy = true;
				const res = await UserService.exportSurveyData(survey_id);
				let ext = mime.extension(res.data.type);
				console.log(res);
				if (ext === "json") {
					this.$bvToast.toast("Error in questionnaire export", {
						title: "No Uploads",
						variant: "warning",
						autoHideDelay: 2000,
						appendToast: true,
					});
					this.busy = false;
					return;
				}
				const url = window.URL.createObjectURL(new Blob([res.data]));
				const link = document.createElement("a");
				link.href = url;
				link.setAttribute("download", `${survey_name}.${ext}`);
				document.body.appendChild(link);
				link.click();
			} catch (error) {
				console.log(error);
			} finally {
				this.busy = false;
			}
		},
    },
};
</script>
