<template>
<div>
    <b-row>
        <b-col>
            <b-form-input v-model="filter.name" placeholder="cerca per nome azienda" type="search" v-on:keyup.enter="updateFilter()"></b-form-input>
        </b-col>
        <b-col>
            <b-form-select v-model="filter.type" :options="company_types" value-field="id" text-field="name"></b-form-select>
        </b-col>
        <b-col>
            <b-button @click="updateFilter()" variant="default"><i class="fa fa-search" aria-hidden="true"></i>
                filtra
            </b-button>
            &nbsp;
            <b-button variant="outline-primary" @click="exportXls()">
                <i class="fa fa-file-excel-o" aria-hidden="true"></i>
                Esporta</b-button>
        </b-col>
    </b-row>

    <hr />
    <b-table ref="table" striped hover :items="companies" :fields="fields" :busy="loading" :v-model="tablevalues">
        <template #cell(name)="row">
            {{ row.item.name }}
        </template>
        <!-- count numbre of employees -->
        <template #cell(num_employees)="row">
            {{ row.item.name=="Totale"?row.item.num_employees:row.item.offices.reduce((a, b) => a + b.num_employees, 0) }}
        </template>
        <template #cell(moma_name)="row">
            <template v-for="user in row.item.users">
                <b-tr>
                    {{ user.first_name }} {{ user.last_name }}
                </b-tr>
            </template>
        </template>
        <template #cell(moma_email)="row">
            <template v-for="user in row.item.users">
                <b-tr>
                    {{ user.username }}
                </b-tr>
            </template>
        </template>

        <template #cell(offices)="row">
            <template v-for="office in row.item.offices">
                <b-tr>{{ office.name }}</b-tr>
            </template>
            <!-- {{ row.item.offices.length>0 ? "" : "" }}
                <b-tr v-for="row.item.offices.map(office => office.name) ">{{}}</b-tr> -->
        </template>
        <template #cell(pscl)="row">
            <template v-for="office in row.item.offices" v-if="row.item.name!=='Totale'">
                <b-tr>
                    <b-icon @click="DownloadPscl(row.item.id,office.id,row.item.name)" :icon="iconDownload(office.pscl)" :title="`PSCL ${office.name}`" v-bind:style="{ color: iconColor(office.pscl) }">
                    </b-icon>
                </b-tr>
            </template>
            <template v-if="row.item.name=='Totale'">
                <b-tr>
                    <b-icon @click="ZipPscl()" icon="download" title="PSCL Zip">
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
            <template v-for="survey in row.item.surveys" v-if="row.item.name!=='Totale'">
                <b-tr v-if="survey!==null">
                    <b-icon @click="exportSurveyData(survey.id,survey.name)" icon="download" :title="`Risultati Questionario ${survey.name}`">
                    </b-icon>
                </b-tr>
            </template>
            <template v-if="row.item.name=='Totale'">
                <b-tr>
                    <b-icon @click="Export()" icon="download" title="Risultati Questionario tutti i Questionari">
                    </b-icon>
                </b-tr>
            </template>
        </template>
        <template #cell(impatti)="row">
            <template v-for=" survey in  row.item.surveys">
                <b-tr v-if="row.item.offices[0] !== undefined">
                    <b-icon @click="generatePSCLXlsx( survey.id,row.item.offices[0].id,row.item.name,row.item.offices[0].name)" icon="download" :title="`Foglio Impatti ${row.item.offices[0].name}`">
                    </b-icon>
                </b-tr>
            </template>
        </template>
        <template #cell(offices_num)="row">
            {{ row.item.name=="Totale"?row.item.offices_num:row.item.offices.length }}
        </template>
        <template #table-busy>
            <div class="text-center text-danger my-2">
                <b-spinner class="align-middle"></b-spinner>
                <strong>Loading...</strong>
            </div>
        </template>
    </b-table>
<template>
  <div>
    <!-- Modal for selecting export options -->
    <b-modal v-model="showModalExport" title="Opzioni di Esportazione" hide-footer>
      <!-- Buttons Export all or select surveys and questions -->
      <b-row>
        <b-col ><b-button @click="AllExportSurveyData('Tutti')" variant="primary">Esporta tutti</b-button> </b-col>
        <b-col ><b-button @click="showModalForExport()" variant="primary">Esporta selezione</b-button></b-col>
      </b-row>
        
    </b-modal>
  </div>
</template>

<template>
  <div>

    <!-- Modal for selecting surveys and questions -->
    <b-modal v-model="showModalSurveys" title="Esporta i resultati" hide-footer>
      <!-- Survey selection -->
    <label for="surveySelect">Scegli i questionari che vuoi esportare:</label>
      <b-form-select id="surveySelect" v-model="selectedSurvey" multiple>
        <option v-for="survey in surveys" :value="survey.id">{{ survey.name }}</option>
      </b-form-select>

      <!-- next button open modalquestions and close showModalSurveys -->
        <b-button @click="showModalForQuestions()" variant="primary">Seguente</b-button>
    </b-modal>
  </div>
</template>
<template>
  <div>

    <!-- Modal for selecting surveys and questions -->
    <b-modal v-model="showModalQuestions" title="Esporta i resultati" hide-footer>
        <!-- busy until get questions -->
        <b-spinner v-if="questions.length===0" label="Loading..."></b-spinner>

      <!-- Question selection -->
      <div v-if="questions.length!=0">
        <label for="questionSelect">Scegli le domande che desideri esportare nei risultati:</label>
        <b-form-select id="questionSelect" v-model="selectedQuestions" multiple>
            <option v-for="question in questions" :value="question.id">{{ question.text }}</option>
        </b-form-select>

      <!-- Export button -->
      <b-button @click="AllExportSurveyData('Tutti',0)" variant="primary">Esporta</b-button>
    </div>
     
    </b-modal>
  </div>
</template>

    
</div>
</template>

<script>
import UserService from "@/services/user.service";
import AreaService from "../area.service";
import Util from "@/mixing/util";
var mime = require("mime-types");
import XLSX from "xlsx";

export default {
    mixins: [Util],
    data() {
        return {
            companies: [{
                    id: 1,
                    name: 'Company A',
                    offices: 'Area 1'
                },
                {
                    id: 2,
                    name: 'Company B',
                    offices: 'Area 2'
                },
                {
                    id: 3,
                    name: 'Company C',
                    offices: 'Area 1'
                },
                // Add more companies here
            ],
            fields: [
                // { key: 'id', label: 'ID' },
                {
                    key: 'name',
                    label: 'Name',
                    sortable: true
                },
                //add moma Area name and moma Area email
                {
                    key: 'moma_name',
                    label: 'Nome Mobility Manager',
                    sortable: true
                },
                {
                    key: 'moma_email',
                    label: 'Email Mobility Manager',
                    sortable: true
                },
                {
                    key: 'num_employees',
                    label: 'Numero Impiegati / Studenti',
                    sortable: true
                },
                {
                    key: 'offices_num',
                    label: 'numero di sedi',
                    sortable: true
                },
                {
                    key: 'offices',
                    label: 'Sedi',
                    sortable: true
                },
                {
                    key: 'pscl',
                    label: 'PSCL',
                },
                {
                    key: 'survey',
                    label: 'Questionari',
                    sortable: true
                },
                {
                    key: 'surveyresults',
                    label: 'Risultati Questionario'
                },
                {
                    key: 'impatti',
                    label: 'Foglio Impatti'
                },

            ],
            filter: {
                type: null,
                name: null,
            },
            company_types: [],
            loading: false,
            busy: false,
            busyXlsx: false,
            tablevalues: [],
            showModalExport: false,
            showModalSurveys: false,
            showModalQuestions: false,
            selectedSurvey: null,
            selectedQuestions: [],
            surveys: [], // Add your survey data here
            questions: [], // Add your question data here
            statsIntervalId: null,
        };
    },
    async created() {
        this.loading = true;
        let r = await AreaService.getExportList();
        this.companies = r.data.companies;
        let res = await UserService.getCompanyTypes();
        this.company_types = res.data.company_types;
        this.company_types.unshift(
			{
					id: null,
					name: "Tutte",
				});
        this.filter.type=this.company_types[0].id;
        // add last row with sum of employees and offices
        this.companies.push({
            id: 0,
            name: "Totale",
            moma_name: "",
            offices: [],
            // sum all employees
            num_employees: this.companies.reduce((total, company) => {
                return total + company.offices.reduce((total, office) => total + (office.num_employees != null ? office.num_employees : 0), 0);
            }, 0),
            // sum all offices
            offices_num: this.companies.reduce((acc, company) => {
                return acc + company.offices.length;
            }, 0),
        });

        this.loading = false;            
    },
    methods: {
        sleep(milliseconds) {
            return new Promise((resolve) => setTimeout(resolve, milliseconds));
        },
        async DownloadPscl(company_id, office_id, companyName) {
            let files = (await UserService.listPSCL(company_id, office_id)).data.files;
            if (files.length > 0) {
                let fname = files[files.length - 1];
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
            } else {
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
                this.$bvToast.toast("Esportazione in corso", {
                    title: "Esportazione",
                    variant: "info",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
                let res = await UserService.exportSurveyData(survey_id);
                this.$bvToast.toast(res.data.message, {
						title: "No Uploads",
						variant: "warning",
						autoHideDelay: 2000,
						appendToast: true,
					});
				this.statsIntervalId = setInterval(async () => {
					try {
						this.getStatusExport(survey_id, survey_name);
					} catch (e) {                
						console.log(e);
					}
				}, 10000);
                // let ext = mime.extension(res.data.type);
                // console.log(res);
                // // if (ext === "json") {
                // //     this.$bvToast.toast("Error in questionnaire export", {
                // //         title: "No Uploads",
                // //         variant: "warning",
                // //         autoHideDelay: 2000,
                // //         appendToast: true,
                // //     });
                // //     this.busy = false;
                // //     return;
                // // }
                // // const url = window.URL.createObjectURL(new Blob([res.data]));
                // // const link = document.createElement("a");
                // // link.href = url;
                // // link.setAttribute("download", `${survey_name}.${ext}`);
                // // document.body.appendChild(link);
                // // link.click();
            } catch (error) {
                console.log(error);
            } finally {
                this.busy = false;
            }
        },
        async generatePSCLXlsx(survey_id, office_id, companyName, officeName) {
            try {
                this.busyXlsx = true;
                const res = await UserService.generatePSCLXlsx(office_id, survey_id);
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement("a");
                link.href = url;

                link.setAttribute("download", `pscl-${companyName.replace(" ", "_")}-${officeName.replace(" ", "_")}.xls`);
                document.body.appendChild(link);
                link.click();
            } catch (e) {
                this.$bvToast.toast(String(e), {
                    title: "Errore",
                    variant: "danger",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
                console.log(e);
            } finally {
                this.busyXlsx = false;
            }
        },
        async updateFilter() {
            await AreaService.getExportList(
                this.filter.type,
                this.filter.name
            ).then((res) => {
                this.companies = res.data.companies;
            });
             // add last row with sum of employees and offices
            this.companies.push({
                id: 0,
                name: "Totale",
                moma_name: "",
                offices: [],
                // sum all employees
                num_employees: this.companies.reduce((total, company) => {
                    return total + company.offices.reduce((total, office) => total + (office.num_employees != null ? office.num_employees : 0), 0);
                }, 0),
                // sum all offices
                offices_num: this.companies.reduce((acc, company) => {
                    return acc + company.offices.length;
                }, 0),
            });
            localStorage.setItem("filter_company_name", this.filter.name);
            localStorage.setItem("filter_company_type", this.filter.type);
        },
        exportXls() {
            try {
                // Get table rows
                const rows = this.$refs.table.$el.querySelectorAll('tr');

                // Define columns to omit
                const omitColumns = ['PSCL', 'Risultati Questionario', 'Foglio Impatti'];

                // Map rows to data
                const data = Array.from(rows).map(row => {
                    const cells = Array.from(row.querySelectorAll('td'));

                    if (cells.length === 0) {
                        return null; // or you can return an empty object, depending on your preference
                    }

                    return this.fields
                        .map((field, index) => ({
                            index,
                            label: field.label
                        }))
                        .filter(field => !omitColumns.includes(field.label))
                        .map(field => cells[field.index] ? cells[field.index].innerText : '');
                });

                // Add headers
                const headers = this.fields
                    .map(field => field.label)
                    .filter(label => !omitColumns.includes(label));
                data.unshift(headers);
                console.log(data);
                // Create a workbook
                let wb = XLSX.utils.book_new();
                wb.Props = {
                    Title: "Esportazione Excel",
                    Subject: "Esportazione",
                    Author: "--",
                    CreatedDate: new Date(),
                };
                wb.SheetNames.push("moma area table");
                // Convert data to worksheet
                const ws = XLSX.utils.json_to_sheet(data);
                wb.Sheets["moma area table"] = ws;
                XLSX.writeFile(wb, "indicatore.xlsx");
            } catch (err) {
                console.error(err);
            }
        },
        // create a function to return the icon name based files.length
        iconDownload(files) {
            // console.log(files);
            if (files.length > 0) {
                return "download";
            } else {
                return "x-circle";
            }
        },
        iconColor(files) {
            // console.log(files);
            if (files.length > 0) {
                return "green";
            } else {
                return "red";
            }
        },
        async ZipPscl() {
            // take only companies id and offices id from this.companies object
            let companies = this.companies.map((company) => {
                if(company.name!=="Totale"){
                    return {
                            id: company.id,
                            offices: company.offices.map((office) => {
                                return office.id;
                            }),
                    };
                }
            });
            console.log("filtercompanies", companies);
            await UserService.downloadPSCLZip(companies);

        },
        // export all survey answers using an array of survey ids obtained from the companies object
        async AllExportSurveyData(survey_name, all = true) {
            
            
            try {
                this.busy = true;
                
                let res;
                let exportData={surveys:this.selectedSurvey,questions:this.selectedQuestions};
                if (all) {
                    this.showModalExport = false;
                    this.selectedSurvey = this.surveys.map((survey) => survey.id);
                    res = await UserService.exportSurveyData(null,all,exportData);
                    
                }else{
                    
                    // alert if not questions are selected
                    if (this.selectedQuestions.length === 0) {
                        this.$bvToast.toast("Seleziona almeno una domanda", {
                            title: "Errore",
                            variant: "danger",
                            autoHideDelay: 2000,
                            appendToast: true,
                        });
                        return;
                    }else{
                        // alert the export is in progress
                        this.$bvToast.toast("Esportazione in corso", {
                            title: "Esportazione",
                            variant: "info",
                            autoHideDelay: 2000,
                            appendToast: true,
                        });
                    }
                    this.showModalQuestions = false;
                    res = await UserService.exportSurveyData(null,all,exportData);
                }
                this.$bvToast.toast(res.data.message, {
						title: "No Uploads",
						variant: "warning",
						autoHideDelay: 2000,
						appendToast: true,
					});
				this.statsIntervalId = setInterval(async () => {
					try {
						this.getStatusExport(null, survey_name);
					} catch (e) {                
						console.log(e);
					}
				}, 10000);
                
                // let ext = mime.extension(res.data.type);
                
                // if (ext === "json") {
                //     this.$bvToast.toast("Error in survey export", {
                //         title: "No Uploads",
                //         variant: "warning",
                //         autoHideDelay: 2000,
                //         appendToast: true,
                //     });
                //     this.busy = false;
                //     return;
                // }
                // const url = window.URL.createObjectURL(new Blob([res.data]));
                // const link = document.createElement("a");
                // link.href = url;
                // link.setAttribute("download", `${survey_name}.${ext}`);
                // document.body.appendChild(link);
                // link.click();
            } catch (error) {
                console.log(error);
                // alert error in export
                this.$bvToast.toast("Errore in esportazione", {
                    title: "Errore",
                    variant: "danger",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
            } finally {
                this.busy = false;
            }
        },
        // show modal for selecting survey and questions
        Export() {
            this.showModalExport = true;
            this.surveys=[];
            this.companies.forEach((company) => {
                    if(company.name!=="Totale"){
                        company.surveys.forEach((survey) => {
                            if (survey !== null) {
                                this.surveys.push({ id: survey.id, name: survey.name });
                            }
                        });
                    }
                });
            // select the first survey
            this.selectedSurvey = this.surveys.map((survey) => survey.id);
        },
        showModalForExport() {
            this.showModalExport = false;
            this.showModalSurveys = true;
           
        },
        async showModalForQuestions() {
            // alert if no survey is selected
            if (this.selectedSurvey === null) {
                this.$bvToast.toast("Seleziona almeno un questionario", {
                    title: "Errore",
                    variant: "danger",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
                return;
            }
            this.showModalSurveys = false;
            this.showModalQuestions = true;
            const res = await AreaService.getExportQuestions(null,this.selectedSurvey);
            console.log("res", res);
            // get questions from res.data.questions and add them to this.questions where res.data.questions is an array of questions objects with id and name
            this.questions = res.data.questions.map((question) => {
                return { id: question.question.id, text: `${question.question.id} - ${question.question.description}` };
            });
            // this.selectedSurvey.forEach((survey) => {
            //     this.questions.push({ id: survey, text: "Tutte le domande" });
            // });
        },
        async getStatusExport(survey_id, survey_name) {
            try {
                let res = await UserService.getStatusExport(survey_id);
                if (res.data == null){
                    this.lock = [false, false, false, false, false];
                    this.message = "Scegli un'operazione";
                    return;
                }
				console.log("res from getStatusExport",res);
                let ext = mime.extension(res.data.type);
				console.log("ext",ext);
				if(ext === "json")
				{
					let message = res.data.message;
					let lock = res.data.lock;
					this.$bvToast.toast("In lavorazione", {
							title: "No Uploads",
							variant: "warning",
							autoHideDelay: 2000,
							appendToast: true,
						});
						this.busy = false;
						return;
					
				}else{		
					
					// alert of the download
					this.$bvToast.toast("Esportazione completata", {
						title: "Esportazione",
						variant: "success",
						autoHideDelay: 2000,
						appendToast: true,
					});
					const url = window.URL.createObjectURL(new Blob([res.data]));
					const link = document.createElement("a");
					link.href = url;
					link.setAttribute("download", `${survey_name}.${ext}`);
					document.body.appendChild(link);
					link.click();
					if (this.statsIntervalId) {
						clearInterval(this.statsIntervalId);
					}
				}

            } catch (error) {
				this.$bvToast.toast(error.message, {
						title: "No Uploads",
						variant: "warning",
						autoHideDelay: 2000,
						appendToast: true,
					});
            }
        },

    },
};
</script>
