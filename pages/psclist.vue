<template>
  <div class="momarea-page">
    <b-card
      :header="$t('momarea.momarea.filtersTitle')"
      class="shadow-sm mb-3"
    >
      <b-row class="align-items-end">
        <b-col md="5">
          <b-form-group
            :label="$t('momarea.psclist.fieldName')"
            label-for="psclist-filter-name"
            class="mb-2 mb-md-0"
          >
            <b-form-input
              id="psclist-filter-name"
              v-model="filter.name"
              :placeholder="$t('momarea.psclist.placeholderCompanyName')"
              type="search"
              @keyup.enter="updateFilter()"
            />
          </b-form-group>
        </b-col>
        <b-col md="4">
          <b-form-group
            :label="$t('momarea.export.labelCompanyType')"
            label-for="psclist-filter-type"
            class="mb-2 mb-md-0"
          >
            <b-form-select
              id="psclist-filter-type"
              v-model="filter.type"
              :options="company_types"
              value-field="id"
              text-field="name"
            />
          </b-form-group>
        </b-col>
        <b-col
          md="3"
          class="d-flex align-items-end"
        >
          <b-button-group class="w-100">
            <b-button
              variant="primary"
              @click="updateFilter()"
            >
              <i
                class="fa fa-search me-1"
                aria-hidden="true"
              />
              {{ $t('momarea.psclist.btnFilter') }}
            </b-button>
            <b-button
              variant="outline-primary"
              @click="exportXls()"
            >
              <i
                class="fa fa-file-excel-o me-1"
                aria-hidden="true"
              />
              {{ $t('momarea.psclist.btnExport') }}
            </b-button>
          </b-button-group>
        </b-col>
      </b-row>
    </b-card>

    <b-card
      no-body
      class="shadow-sm mb-3"
    >
      <b-table
        ref="table"
        class="mb-0"
        striped
        hover
        :items="companies"
        :fields="fields"
        :busy="loading"
        :v-model="tablevalues"
      >
        <template #cell(name)="row">
          {{ row.item.name }}
        </template>
        <!-- count numbre of employees -->
        <template #cell(num_employees)="row">
          {{ row.item.name=="Totale"?row.item.num_employees:row.item.offices.reduce((a, b) => a + b.num_employees, 0) }}
        </template>
        <template #cell(moma_name)="row">
          <div
            v-for="(user, index) in row.item.users"
            :key="`moma-name-${user.id || user.username || index}`"
            class="d-block"
          >
            {{ user.first_name }} {{ user.last_name }}
          </div>
        </template>
        <template #cell(moma_email)="row">
          <div
            v-for="(user, index) in row.item.users"
            :key="`moma-email-${user.id || user.username || index}`"
            class="d-block"
          >
            {{ user.username }}
          </div>
        </template>

        <template #cell(offices)="row">
          <div
            v-for="(office, index) in row.item.offices"
            :key="`office-${office.id || office.name || index}`"
            class="d-block"
          >
            {{ office.name }}
          </div>
        </template>
        <template #cell(pscl)="row">
          <div
            v-for="(office, index) in row.item.offices"
            v-if="row.item.name!=='Totale'"
            :key="`pscl-${office.id || office.name || index}`"
            class="d-block"
          >
            <b-button
              variant="link"
              class="p-0"
              :aria-label="`PSCL ${office.name} — ${office.pscl.length > 0 ? $t('momarea.momarea.statusHasFiles') : $t('momarea.momarea.statusNoFiles')}`"
              :title="`PSCL ${office.name} — ${office.pscl.length > 0 ? $t('momarea.momarea.statusHasFiles') : $t('momarea.momarea.statusNoFiles')}`"
              :style="{ color: iconColor(office.pscl) }"
              @click="DownloadPscl(row.item.id,office.id,row.item.name,office.pscl[office.pscl.length - 1])"
            >
              <b-icon
                :icon="iconDownload(office.pscl)"
                aria-hidden="true"
              />
            </b-button>
          </div>
          <template v-if="row.item.name=='Totale'">
            <div class="d-block">
              <b-button
                variant="link"
                class="p-0"
                :aria-label="$t('momarea.psclist.titlePSCLZip')"
                :title="$t('momarea.psclist.titlePSCLZip')"
                @click="ZipPscl()"
              >
                <b-icon
                  icon="download"
                  aria-hidden="true"
                />
              </b-button>
            </div>
          </template>
        </template>
        <template #cell(psclName)="row">
          <div
            v-for="(office, index) in row.item.offices"
            v-if="row.item.name!=='Totale'"
            :key="`pscl-name-${office && (office.id || office.name) || index}`"
            class="d-block"
          >
            <span
              v-if="office!==null"
              class="d-block"
            >
              {{ office.pscl[office.pscl.length - 1] }}
            </span>
          </div>
        </template>
        <template #cell(offices_num)="row">
          {{ row.item.name=="Totale"?row.item.offices_num:row.item.offices.length }}
        </template>
        <template #table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle" />
            <strong>{{ $t('momarea.psclist.loading') }}</strong>
          </div>
        </template>
      </b-table>
    </b-card>

    <div>
      <div>
        <!-- Modal for selecting export options -->
        <b-modal
          v-model="showModalExport"
          :title="$t('momarea.psclist.modalTitleExportOptions')"
          hide-footer
        >
          <!-- Buttons Export all or select surveys and questions -->
          <b-row>
            <b-col>
              <b-button
                variant="primary"
                @click="AllExportSurveyData('Tutti')"
              >
                {{ $t('momarea.psclist.btnExportAll') }}
              </b-button>
            </b-col>
            <b-col>
              <b-button
                variant="primary"
                @click="showModalForExport()"
              >
                {{ $t('momarea.psclist.btnExportSelection') }}
              </b-button>
            </b-col>
          </b-row>
        </b-modal>
      </div>
    </div>

    <div>
      <div>
        <!-- Modal for selecting surveys and questions -->
        <b-modal
          v-model="showModalSurveys"
          :title="$t('momarea.psclist.modalTitleExportResults')"
          hide-footer
        >
          <!-- Survey selection -->
          <label for="surveySelect">{{ $t('momarea.psclist.labelChooseSurveys') }}</label>
          <b-form-select
            id="surveySelect"
            v-model="selectedSurvey"
            multiple
          >
            <option
              v-for="survey in surveys"
              :key="survey.id"
              :value="survey.id"
            >
              {{ survey.name }}
            </option>
          </b-form-select>

          <!-- next button open modalquestions and close showModalSurveys -->
          <b-button
            variant="primary"
            @click="showModalForQuestions()"
          >
            {{ $t('momarea.psclist.btnNext') }}
          </b-button>
        </b-modal>
      </div>
    </div>

    <div>
      <div>
        <!-- Modal for selecting surveys and questions -->
        <b-modal
          v-model="showModalQuestions"
          :title="$t('momarea.psclist.modalTitleExportResults')"
          hide-footer
        >
          <!-- busy until get questions -->
          <b-spinner
            v-if="questions.length===0"
            :label="$t('momarea.psclist.loading')"
          />

          <!-- Question selection -->
          <div v-if="questions.length!=0">
            <label for="questionSelect">{{ $t('momarea.psclist.labelChooseQuestions') }}</label>
            <b-form-select
              id="questionSelect"
              v-model="selectedQuestions"
              multiple
            >
              <option
                v-for="question in questions"
                :key="question.id"
                :value="question.id"
              >
                {{ question.text }}
              </option>
            </b-form-select>

            <!-- Export button -->
            <b-button
              variant="primary"
              @click="AllExportSurveyData('Tutti',0)"
            >
              {{ $t('momarea.psclist.btnExport') }}
            </b-button>
          </div>
        </b-modal>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/user.service";
import AreaService from "../area.service";
import Util from "@/mixing/util";
import mime from "mime-types";
import * as XLSX from "xlsx";
import { toast } from "@/services/notification.service";

export default {
    name: "MomareaPsclist",
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
                    label: this.$t('momarea.psclist.fieldName'),
                    sortable: true
                },
                //add moma Area name and moma Area email
                {
                    key: 'moma_name',
                    label: this.$t('momarea.psclist.fieldMomaName'),
                    sortable: true
                },
                {
                    key: 'moma_email',
                    label: this.$t('momarea.psclist.fieldMomaEmail'),
                    sortable: true
                },
                {
                    key: 'num_employees',
                    label: this.$t('momarea.psclist.fieldNumEmployees'),
                    sortable: true
                },
                {
                    key: 'offices_num',
                    label: this.$t('momarea.psclist.fieldOfficesNum'),
                    sortable: true
                },
                {
                    key: 'offices',
                    label: this.$t('momarea.psclist.fieldOffices'),
                    sortable: true
                },
                {
                    key: 'pscl',
                    label: this.$t('momarea.psclist.fieldPSCL'),
                },
                {
                    key: 'psclName',
                    label: this.$t('momarea.psclist.fieldPSCLName'),
                    sortable: true
                },
                // {
                //     key: 'surveyresults',
                //     label: 'Risultati Questionario'
                // },
                // {
                //     key: 'impatti',
                //     label: 'Foglio Impatti'
                // },

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
					name: this.$t('momarea.psclist.optionAll'),
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
        async DownloadPscl(company_id, office_id, companyName, fname=null) {
            // let files = (await UserService.listPSCL(company_id, office_id)).data.files;
            if (fname!=null) {
                // let fname = files[files.length - 1];
                console.log(fname);
                try {
                    this.busy = true;
                    const res = await UserService.downloadPSCL(company_id, office_id, fname);
                    let ext = mime.extension(res.data.type);
                    if (ext === "json") {
                        toast(this.$t('momarea.psclist.toastNoUploads'), {
                            title: this.$t('momarea.psclist.titleNoUploads'),
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
                toast(this.$t('momarea.psclist.toastNoUploads'), {
                    title: this.$t('momarea.psclist.titleNoUploads'),
                    variant: "warning",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
            }
        },
        async exportSurveyData(survey_id, survey_name) {
            try {
                this.busy = true;
                toast(this.$t('momarea.psclist.toastExportInProgress'), {
                    title: this.$t('momarea.psclist.titleExport'),
                    variant: "info",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
                let res = await UserService.exportSurveyData(survey_id);
                toast(res.data.message, {
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
                // //     toast("Error in questionnaire export", {
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
                toast(String(e), {
                    title: this.$t('momarea.psclist.titleError'),
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
                const omitColumns = [this.$t('momarea.psclist.fieldPSCL'), this.$t('momarea.psclist.fieldSurveyResults'), this.$t('momarea.psclist.fieldImpacts')];
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
                // cleand array from null values
                let dataclean = data.filter((el) => {
                    return el != null;
                });
                console.log("clean",dataclean);
                // Create a workbook
                let wb = XLSX.utils.book_new();
                wb.Props = {
                    Title: this.$t('momarea.psclist.excelTitle'),
                    Subject: this.$t('momarea.psclist.excelSubject'),
                    Author: "--",
                    CreatedDate: new Date(),
                };
                wb.SheetNames.push(this.$t('momarea.psclist.excelSheetName'));
                // Convert data to worksheet
                const ws = XLSX.utils.json_to_sheet(dataclean);
                wb.Sheets[this.$t('momarea.psclist.excelSheetName')] = ws;
                XLSX.writeFile(wb, this.$t('momarea.psclist.excelFileName'));
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
            // AA-compliant success/danger (≥4.5:1 on white); the icon shape
            // (download vs x-circle) carries the same meaning without relying on
            // color. Named "green"/"red" failed WCAG 1.4.3 contrast.
            if (files.length > 0) {
                return "#198253";
            } else {
                return "#b33c12";
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
                        toast(this.$t('momarea.psclist.toastSelectQuestion'), {
                            title: this.$t('momarea.psclist.titleError'),
                            variant: "danger",
                            autoHideDelay: 2000,
                            appendToast: true,
                        });
                        return;
                    }else{
                        // alert the export is in progress
                        toast(this.$t('momarea.psclist.toastExportInProgress'), {
                            title: this.$t('momarea.psclist.titleExport'),
                            variant: "info",
                            autoHideDelay: 2000,
                            appendToast: true,
                        });
                    }
                    this.showModalQuestions = false;
                    res = await UserService.exportSurveyData(null,all,exportData);
                }
                toast(res.data.message, {
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
                //     toast("Error in survey export", {
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
                toast(this.$t('momarea.psclist.toastExportError'), {
                    title: this.$t('momarea.psclist.titleError'),
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
                toast(this.$t('momarea.psclist.toastSelectSurvey'), {
                    title: this.$t('momarea.psclist.titleError'),
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
                    this.message = this.$t('momarea.psclist.messageChooseOperation');
                    return;
                }
				console.log("res from getStatusExport",res);
                let ext = mime.extension(res.data.type);
				console.log("ext",ext);
				if(ext === "json") {
					let message = res.data.message;
					let lock = res.data.lock;
					toast(this.$t('momarea.psclist.toastInProgress'), {
							title: this.$t('momarea.psclist.titleNoUploads'),
							variant: "warning",
							autoHideDelay: 2000,
							appendToast: true,
						});
						this.busy = false;
						return;
					
				}else{		
					
					// alert of the download
					toast(this.$t('momarea.psclist.toastExportCompleted'), {
						title: this.$t('momarea.psclist.titleExport'),
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
                toast(error.message, {
                    title: this.$t('momarea.psclist.titleNoUploads'),
                    variant: "warning",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
            }
        },

    },
};
</script>

<style scoped>
/* Shared Paper Dashboard SCSS strips focus outlines app-wide; restore a visible
   focus indicator scoped to this module (WCAG 2.4.7). */
.momarea-page :focus-visible {
	outline: 2px solid currentColor;
	outline-offset: 2px;
}
</style>

<!-- The b-table renders th/td in a child component, so a scoped selector cannot
     reach them; this non-scoped block overrides the Paper Dashboard light-gray
     table-header/muted text with #495057 (~7:1 on white) to meet WCAG 2.1 AA
     contrast (1.4.3). Mirrors the override already present in export.vue. -->
<style>
.momarea-page .text-muted,
.momarea-page small,
.momarea-page .small,
.momarea-page .page-link,
.momarea-page .btn-link,
.momarea-page .custom-select,
.momarea-page .form-control,
.momarea-page .table th,
.momarea-page .table td,
.momarea-page .table caption,
.momarea-page strong {
	color: #495057 !important;
}
</style>
